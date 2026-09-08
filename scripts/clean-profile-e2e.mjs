import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const temporaryRoot = await mkdtemp(join(tmpdir(), 'dsh-side-chat-clean-profile-'))
const artifacts = join(temporaryRoot, 'artifacts')
const dshPackagePrefix = '@deepseek-ai/dsh-'
// Packages that existed only in the retained monolithic-client trains and are
// therefore absent from a lockfile generated against split-client DSH.
const legacyDshPackageNames = [
  '@deepseek-ai/dsh-client-locale',
  '@deepseek-ai/dsh-client-runtime',
  '@deepseek-ai/dsh-client-ui-commands',
  '@deepseek-ai/dsh-client-ui-settings',
  '@deepseek-ai/dsh-cordis-host-runner',
  '@deepseek-ai/dsh-goal',
  '@deepseek-ai/dsh-host-apiproxy',
  '@deepseek-ai/dsh-host-directory-picker',
  '@deepseek-ai/dsh-host-plugin-inventory',
  '@deepseek-ai/dsh-host-webserver',
  '@deepseek-ai/dsh-llm-retry',
  '@deepseek-ai/dsh-message-feedback',
  '@deepseek-ai/dsh-permission-presets',
  '@deepseek-ai/dsh-plan-mode',
  '@deepseek-ai/dsh-session-reference',
  '@deepseek-ai/dsh-session-stats',
  '@deepseek-ai/dsh-shell',
  '@deepseek-ai/dsh-subprocess',
  '@deepseek-ai/dsh-token-meter',
]
const npmCommand = process.platform === 'win32'
  ? { file: process.env.ComSpec ?? 'cmd.exe', prefix: ['/d', '/s', '/c', 'npm'] }
  : { file: 'npm', prefix: [] }

function runNpm(arguments_, options) {
  return execFileSync(npmCommand.file, [...npmCommand.prefix, ...arguments_], options)
}

try {
  await mkdir(artifacts)
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
  const declaredVersions = sourceManifest.dshCompatibility?.testedVersions
  if (!Array.isArray(declaredVersions)
    || declaredVersions.length === 0
    || declaredVersions.some(version => typeof version !== 'string' || version.length === 0)
    || new Set(declaredVersions).size !== declaredVersions.length) {
    throw new Error('package manifest must declare unique dshCompatibility.testedVersions')
  }

  const supportedRange = declaredVersions.join(' || ')
  const storeCompatibility = sourceManifest.dsh?.compatibility
  if (storeCompatibility?.dsh !== supportedRange) {
    throw new Error(`dsh.compatibility.dsh must match tested versions: ${supportedRange}`)
  }
  const releaseEntries = Object.entries(storeCompatibility.dshReleases ?? {})
  if (releaseEntries.length !== declaredVersions.length
    || releaseEntries.some(([version, status]) =>
      !declaredVersions.includes(version) || status !== 'compatible')) {
    throw new Error('dsh.compatibility.dshReleases must mark every tested version compatible')
  }

  const dshPeers = Object.entries(sourceManifest.peerDependencies ?? {})
    .filter(([name]) => name.startsWith(dshPackagePrefix))
  if (dshPeers.length === 0) throw new Error('package manifest does not declare DSH peer dependencies')
  for (const [name, range] of dshPeers) {
    if (range !== supportedRange) {
      throw new Error(`${name} peer range must match tested DSH versions: ${supportedRange}`)
    }
  }

  const newestVersion = declaredVersions.at(-1)
  const dshDevDependencies = Object.entries(sourceManifest.devDependencies ?? {})
    .filter(([name]) => name.startsWith(dshPackagePrefix))
  if (dshDevDependencies.length === 0) throw new Error('package manifest does not declare DSH development dependencies')
  for (const [name, version] of dshDevDependencies) {
    if (version !== newestVersion) {
      throw new Error(`${name} development dependency must use newest tested DSH version: ${newestVersion}`)
    }
  }

  const requestedVersion = process.env.DSH_TEST_VERSION
  if (requestedVersion !== undefined && !declaredVersions.includes(requestedVersion)) {
    throw new Error(`DSH_TEST_VERSION is not declared as tested: ${requestedVersion}`)
  }
  const versionsToTest = requestedVersion === undefined ? declaredVersions : [requestedVersion]

  const lockfile = await readFile(join(root, 'pnpm-lock.yaml'), 'utf8')
  const dshPackageNames = [...new Set([
    ...legacyDshPackageNames,
    ...[...lockfile.matchAll(/^  '(@deepseek-ai\/dsh-[^@']+)@[^']+':$/gm)]
      .map(([, name]) => name),
  ])]
  if (dshPackageNames.length === 0) throw new Error('workspace lockfile does not contain DSH packages')

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

  for (const dshVersion of versionsToTest) {
    const profile = join(temporaryRoot, `profile-${dshVersion.replaceAll(/[^a-zA-Z0-9.-]/g, '-')}`)
    await mkdir(profile)
    await writeFile(join(profile, 'package.json'), JSON.stringify({
      name: 'dsh-side-chat-clean-profile',
      private: true,
      type: 'module',
      // Keep npm from mixing DSH prereleases from different validated release trains.
      overrides: Object.fromEntries(dshPackageNames.map(name => [name, dshVersion])),
    }, null, 2))
    runNpm([
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      tarball,
      'react@18.3.1',
    ], { cwd: profile, stdio: 'inherit' })
    execFileSync(process.execPath, ['--input-type=module', '--eval', probe], {
      cwd: profile,
      stdio: 'inherit',
    })
    process.stdout.write(`Clean-profile package imports passed for DSH ${dshVersion}: ${manifest.filename}\n`)
  }
} finally {
  await rm(temporaryRoot, { recursive: true, force: true })
}
