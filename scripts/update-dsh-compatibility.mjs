import { execFileSync } from 'node:child_process'
import { readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packagePath = resolve(root, 'package.json')
const dshPackagePrefix = '@deepseek-ai/dsh-'
const targetVersion = process.argv[2]
const npmCommand = process.platform === 'win32'
  ? { file: process.env.ComSpec ?? 'cmd.exe', prefix: ['/d', '/s', '/c', 'npm'] }
  : { file: 'npm', prefix: [] }
const pnpmCommand = process.platform === 'win32'
  ? { file: process.env.ComSpec ?? 'cmd.exe', prefix: ['/d', '/s', '/c', 'pnpm'] }
  : { file: 'pnpm', prefix: [] }

if (targetVersion === undefined || targetVersion.length === 0) {
  throw new Error('usage: pnpm dsh:update <exact-version>')
}

const manifest = JSON.parse(await readFile(packagePath, 'utf8'))
const testedVersions = manifest.dshCompatibility?.testedVersions
if (!Array.isArray(testedVersions) || testedVersions.length === 0) {
  throw new Error('package manifest must declare dshCompatibility.testedVersions')
}

const dshPeerNames = Object.keys(manifest.peerDependencies ?? {})
  .filter(name => name.startsWith(dshPackagePrefix))
const dshDevNames = Object.keys(manifest.devDependencies ?? {})
  .filter(name => name.startsWith(dshPackagePrefix))
const packageNames = [...new Set([...dshPeerNames, ...dshDevNames])]
if (dshPeerNames.length === 0 || dshDevNames.length === 0) {
  throw new Error('package manifest must declare DSH peer and development dependencies')
}

for (const name of packageNames) {
  let publishedVersion
  try {
    const output = execFileSync(npmCommand.file, [
      ...npmCommand.prefix,
      'view',
      `${name}@${targetVersion}`,
      'version',
      '--json',
    ], { cwd: root, encoding: 'utf8' })
    publishedVersion = JSON.parse(output)
  } catch {
    throw new Error(`${name}@${targetVersion} is not available from npm`)
  }
  if (publishedVersion !== targetVersion) {
    throw new Error(`${name}@${targetVersion} did not resolve to the requested version`)
  }
}

const nextTestedVersions = testedVersions.includes(targetVersion)
  ? [...testedVersions]
  : [...testedVersions, targetVersion]
const supportedRange = nextTestedVersions.join(' || ')
manifest.dshCompatibility.testedVersions = nextTestedVersions
manifest.dsh ??= {}
manifest.dsh.compatibility = {
  ...manifest.dsh.compatibility,
  dsh: supportedRange,
  dshReleases: Object.fromEntries(nextTestedVersions.map(version => [version, 'compatible'])),
}
for (const name of dshPeerNames) manifest.peerDependencies[name] = supportedRange
for (const name of dshDevNames) manifest.devDependencies[name] = targetVersion

await writeFile(packagePath, `${JSON.stringify(manifest, null, 2)}\n`)
// A clean resolution is intentional: retained prerelease peers can otherwise mix
// the previous and requested DSH release trains in the regenerated lockfile.
await rm(resolve(root, 'node_modules'), { recursive: true, force: true })
await rm(resolve(root, 'pnpm-lock.yaml'), { force: true })
execFileSync(pnpmCommand.file, [...pnpmCommand.prefix, 'install', '--no-frozen-lockfile'], {
  cwd: root,
  stdio: 'inherit',
})
execFileSync(pnpmCommand.file, [...pnpmCommand.prefix, 'peers', 'check'], {
  cwd: root,
  stdio: 'inherit',
})
process.stdout.write(`Updated and installed DSH compatibility train ${supportedRange}.\nRun pnpm check and pnpm clean-profile:verify.\n`)
