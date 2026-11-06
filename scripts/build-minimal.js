import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import config from '../src/config.js'
import { renderMinimalHtml } from './minimal-page.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'dist', 'minimal')

await mkdir(outDir, { recursive: true })
await writeFile(join(outDir, 'index.html'), renderMinimalHtml(config), 'utf8')
console.log('minimal page -> dist/minimal/index.html')
