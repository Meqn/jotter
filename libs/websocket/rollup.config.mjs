import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'rollup'
import typescript from 'rollup-plugin-typescript2'
import dts from 'rollup-plugin-dts'
import terser from '@rollup/plugin-terser'

import pkg from './package.json' assert { type: "json"}

const name = 'WebSocketConnect'
const env = process.env.NODE_ENV
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const banner =
  '/*!\n' +
  ` * ${pkg.name} v${pkg.version}\n` +
  ` * (c) ${new Date().getFullYear()} Mervin<mengqing723@gmail.com>\n` +
  ' * Released under the MIT License.\n' +
  ' */'

const outputs = [
  {
    name,
    file: pkg.main,
    format: 'umd',
    banner
  },
  {
    file: pkg.module,
    format: 'es',
    banner
  }
].map(item => {
  const config = defineConfig({
    input: 'src/index.ts',
    output: item,
    plugins: [
      typescript()
    ]
  })

  if (env === 'production' && item.format === 'umd') {
    config.plugins.push(terser())
  }

  return config
})

export default [
  ...outputs,
  {
    input: 'src/index.ts',
    plugins: [dts()],
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    }
  }
]
