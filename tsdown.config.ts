import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'tsdown'

const PLUGIN_ID = 'dsh-side-chat'
const CSS_PREFIX = '\0dsh-side-chat-css:'
const EXTERNALS = ['react', 'react/jsx-runtime']

export default defineConfig({
  name: `${PLUGIN_ID}/client`,
  entry: { client: 'src/client/index.ts' },
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  target: 'es2023',
  dts: false,
  sourcemap: true,
  clean: false,
  deps: {
    neverBundle: EXTERNALS,
    alwaysBundle: ['zod'],
    onlyBundle: ['zod'],
  },
  plugins: [{
    name: 'dsh-side-chat-css-text',
    resolveId(source, importer) {
      if (!source.endsWith('.css') || importer === undefined) return null
      return CSS_PREFIX + Buffer.from(resolve(dirname(importer), source)).toString('base64url')
    },
    async load(id) {
      if (!id.startsWith(CSS_PREFIX)) return null
      const path = Buffer.from(id.slice(CSS_PREFIX.length), 'base64url').toString()
      this.addWatchFile(path)
      return `export default ${JSON.stringify(await readFile(path, 'utf8'))}`
    },
  }],
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PLUGIN_ID)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
})
