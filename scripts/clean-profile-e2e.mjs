import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const temporaryRoot = await mkdtemp(join(tmpdir(), 'dsh-side-chat-clean-profile-'))
const artifacts = join(temporaryRoot, 'artifacts')
const profile = join(temporaryRoot, 'profile')
const npmCommand = process.platform === 'win32'
  ? { file: process.env.ComSpec ?? 'cmd.exe', prefix: ['/d', '/s', '/c', 'npm'] }
  : { file: 'npm', prefix: [] }

function runNpm(arguments_, options) {
  return execFileSync(npmCommand.file, [...npmCommand.prefix, ...arguments_], options)
}

try {
  await mkdir(artifacts)
  await mkdir(profile)
  const packed = runNpm([
    'pack',
    root,
    '--json',
    '--ignore-scripts',
    '--pack-destination',
    artifacts,
  ], { cwd: root, encoding: 'utf8' })
  const manifest = JSON.parse(packed)[0]
  if (manifest?.filename === undefined) throw new Error('npm pack did not report an artifact')
  if (typeof manifest.name !== 'string' || manifest.name.length === 0) throw new Error('npm pack did not report a package name')
  const tarball = join(artifacts, manifest.filename)
  const packageName = manifest.name
  const sourceManifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
  const supportedDshVersion = sourceManifest.peerDependencies?.['@deepseek-ai/dsh-agent']
  if (typeof supportedDshVersion !== 'string' || supportedDshVersion.length === 0) {
    throw new Error('package manifest does not declare a supported DSH version')
  }
  const lockfile = await readFile(join(root, 'pnpm-lock.yaml'), 'utf8')
  const dshPackageOverrides = Object.fromEntries(
    [...lockfile.matchAll(/^  '(@deepseek-ai\/dsh-[^@']+)@([^']+)':$/gm)]
      .filter(([, , version]) => version === supportedDshVersion)
      .map(([, name]) => [name, supportedDshVersion]),
  )
  if (Object.keys(dshPackageOverrides).length === 0) {
    throw new Error(`workspace lockfile does not contain DSH ${supportedDshVersion}`)
  }

  await writeFile(join(profile, 'package.json'), JSON.stringify({
    name: 'dsh-side-chat-clean-profile',
    private: true,
    type: 'module',
    // Keep npm from mixing a newer DSH prerelease into the supported release train.
    overrides: dshPackageOverrides,
  }, null, 2))
  runNpm([
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    tarball,
    'react@18.3.1',
  ], { cwd: profile, stdio: 'inherit' })

  const probe = [
    `await import(${JSON.stringify(packageName)})`,
    `await import(${JSON.stringify(`${packageName}/remote`)})`,
    `await import(${JSON.stringify(`${packageName}/typert`)})`,
    'globalThis.window = globalThis',
    'let handoff',
    'globalThis.__ModuleLoader__ = { load(value) { handoff = value } }',
    `await import(${JSON.stringify(`${packageName}/client`)})`,
    `if (handoff?.id !== ${JSON.stringify(packageName)} || typeof handoff.factory !== 'function') throw new Error('client bundle did not register the npm package name')`,
    "const modules = new Map([['@deepseek-ai/dsh-client-ui-primitives', { MarkdownText() {} }], ['react', await import('react')], ['react/jsx-runtime', await import('react/jsx-runtime')]])",
    "const client = handoff.factory(specifier => { if (!modules.has(specifier)) throw new Error('unexpected external ' + specifier); return modules.get(specifier) })",
    "if (typeof client?.apply !== 'function' || !Array.isArray(client.inject)) throw new Error('invalid client plugin surface')",
  ].join('; ')
  execFileSync(process.execPath, ['--input-type=module', '--eval', probe], {
    cwd: profile,
    stdio: 'inherit',
  })
  process.stdout.write(`Clean-profile package imports passed: ${manifest.filename}\n`)
} finally {
  await rm(temporaryRoot, { recursive: true, force: true })
}
