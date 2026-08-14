import { execFileSync } from 'node:child_process'
import { access, readFile } from 'node:fs/promises'

const packageManifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const packageName = packageManifest.name
if (typeof packageName !== 'string' || packageName.length === 0) {
  throw new Error('package.json must declare a package name')
}

for (const path of [
  '../lib/index.js',
  '../lib/client.js',
  '../lib/client/index.d.ts',
  '../lib/remote.js',
  '../lib/typert.js',
]) {
  await access(new URL(path, import.meta.url))
}

await import(new URL('../lib/index.js', import.meta.url))
await import(new URL('../lib/remote.js', import.meta.url))
await import(new URL('../lib/typert.js', import.meta.url))

let handoff
globalThis.window = globalThis
globalThis.__ModuleLoader__ = { load(value) { handoff = value } }
try {
  await import(new URL(`../lib/client.js?verify=${Date.now()}`, import.meta.url))
  if (handoff?.id !== packageName || typeof handoff.factory !== 'function') {
    throw new Error(`client bundle did not register ${packageName} through __ModuleLoader__.load`)
  }
  const modules = new Map([
    ['react', await import('react')],
    ['react/jsx-runtime', await import('react/jsx-runtime')],
  ])
  const exports = handoff.factory((specifier) => {
    if (!modules.has(specifier)) throw new Error(`client bundle requested unexpected external ${specifier}`)
    return modules.get(specifier)
  })
  if (typeof exports?.apply !== 'function' || !Array.isArray(exports.inject)) {
    throw new Error('client bundle factory did not return the Cordis plugin surface')
  }
} finally {
  delete globalThis.__ModuleLoader__
  delete globalThis.window
}

const npmCommand = process.platform === 'win32'
  ? { file: process.env.ComSpec ?? 'cmd.exe', prefix: ['/d', '/s', '/c', 'npm'] }
  : { file: 'npm', prefix: [] }
const output = execFileSync(npmCommand.file, [
  ...npmCommand.prefix,
  'pack',
  '--dry-run',
  '--ignore-scripts',
  '--json',
], {
  cwd: new URL('..', import.meta.url),
  encoding: 'utf8',
})
const manifest = JSON.parse(output)[0]
if (manifest.name !== packageName) throw new Error(`packed package name ${String(manifest.name)} does not match ${packageName}`)
const files = new Set(manifest.files.map(entry => entry.path))
for (const required of [
  'package.json',
  'cordis.patch.yml',
  'lib/index.js',
  'lib/client.js',
  'lib/client/index.d.ts',
  'lib/remote.js',
  'lib/typert.js',
  'README.md',
  'README.zh-CN.md',
  'LICENSE',
]) {
  if (!files.has(required)) throw new Error(`packed package is missing ${required}`)
}
for (const entry of files) {
  if (entry.startsWith('src/') || entry.startsWith('test/') || entry.startsWith('docs/plans/')) {
    throw new Error(`packed package contains source-only file ${entry}`)
  }
}
