import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
for (const name of ['lib', 'coverage']) {
  const target = resolve(root, name)
  if (!target.startsWith(`${root}\\`) && !target.startsWith(`${root}/`)) {
    throw new Error(`refusing to clean outside package root: ${target}`)
  }
  await rm(target, { recursive: true, force: true })
}
