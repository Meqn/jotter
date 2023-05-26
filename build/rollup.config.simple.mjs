import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'rollup'
import typescript from 'rollup-plugin-typescript2'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'

const env = process.env.NODE_ENV
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function generateBanner(pkg) {
  return '/*!\n' +
  ` * ${pkg.name} v${pkg.version}\n` +
  ` * (c) ${new Date().getFullYear()} Mervin<mengqing723@gmail.com>\n` +
  ' * Released under the MIT License.\n' +
  ' */'
}

export function generateConfig({
  input = 'src/index.ts',
  name,
  pkg
}) {
  const banner = generateBanner(pkg)

  return defineConfig({
    input,
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript()
    ],
    output: [
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
  })
}
