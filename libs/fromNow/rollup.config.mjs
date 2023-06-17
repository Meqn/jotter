import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'rollup'
import typescript from 'rollup-plugin-typescript2'
import dts from 'rollup-plugin-dts'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import pkg from './package.json' assert { type: 'json' }

const name = 'fromNow'
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
    file: pkg.unpkg ?? 'dist/index.global.js',
    format: 'iife',
    // exports: 'named',
    banner,
    plugins: env === 'production' ? [terser()] : [],
    sourcemap: true
  },
  {
    file: pkg.main ?? 'dist/index.js',
    format: 'cjs',
    banner
  },
  {
    file: pkg.module ?? 'dist/index.esm.js',
    format: 'es',
    banner
  }
]

export default [
  ...outputs.map(item => {
    const entryFile = ['es', 'esm', 'module'].includes(item.format) ? 'src/index.ts' : 'src/index.comm.ts'
    return defineConfig({
      input: path.resolve(__dirname, entryFile),
      plugins: [
        nodeResolve(),
        commonjs(),
        typescript()
      ],
      output: item
    })
  }),
  {
    input: 'src/index.ts',
    plugins: [dts()],
    output: {
      file: pkg.types,
      format: 'es'
    }
  }
]
