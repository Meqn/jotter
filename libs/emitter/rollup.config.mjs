import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'rollup'
import typescript from 'rollup-plugin-typescript2'
import terser from '@rollup/plugin-terser'

import pkg from './package.json' assert { type: 'json'}

const name = 'EventEmitter'
const env = process.env.NODE_ENV
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const banner =
  '/*!\n' +
  ` * ${pkg.name} v${pkg.version}\n` +
  ` * (c) ${new Date().getFullYear()} Mervin<mengqing723@gmail.com>\n` +
  ' * Released under the MIT License.\n' +
  ' */'

export default defineConfig({
  input: 'src/index.ts',
  plugins: [
    typescript()
  ],
  output: [
    {
      name,
      file: pkg.main,
      format: 'umd',
      // exports: 'named',
      banner,
      plugins: env === 'production' ? [terser()] : []
    },
    {
      file: pkg.module,
      format: 'es',
      banner
    }
  ]
})
