import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'rollup'
import typescript from 'rollup-plugin-typescript2'
import declareTs from 'rollup-plugin-dts'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'

const env = process.env.NODE_ENV
const __dirname = path.dirname(fileURLToPath(import.meta.url))

function omit(obj, fields) {
  const shallowCopy = Object.assign({}, obj)
  for (let i = 0; i < fields.length; i += 1) {
    const key = fields[i]
    delete shallowCopy[key]
  }
  return shallowCopy
}

function generateBanner(pkg) {
  return '/*!\n' +
  ` * ${pkg.name} v${pkg.version}\n` +
  ` * (c) ${new Date().getFullYear()} Mervin<mengqing723@gmail.com>\n` +
  ' * Released under the MIT License.\n' +
  ' */'
}

/**
 * 生成不同format的output 
 */
function generateOutput(format, { pkg, name, banner, dest }) {
  const defaults = {
    iife: {
      name: name ?? pkg.name,
      file: pkg.unpkg ?? `${dest}/index.global.js`,
      format,
      // exports: 'named',
      banner,
      plugins: env === 'production' ? [terser()] : [],
      sourcemap: true
    },
    cjs: {
      file: pkg.main ?? `${dest}/index.js`,
      format,
      banner
    },
    es: {
      file: pkg.module ?? `${dest}/index.esm.js`,
      format,
      banner
    }
  }
  
  if (typeof format === 'string') {
    if (format === 'umd') return defaults['iife']
    return defaults[format]
  } else if (typeof format === 'object') {
    let _format = format.format
    if (_format === 'umd') _format = 'iife'
    return Object.assign({}, defaults[_format], omit(format, ['input']))
  }
}

/**
 * 生成 rollup 配置
 *
 * @param {Object} config - 配置属性
 * @param {Array} config.format - 输出格式, ['es', 'cjs', 'iife']
 * @param {String} config.input - 入口文件
 * @param {String} config.dest - 输出目录
 * @param {String} config.name - 输出文件名
 * @param {Object} config.pkg - 包信息
 * @param {Boolean} config.dts - 是否生成 dts
 * @return {Array} An array of configurations
 */
export function generateConfig({
  input = 'src/index.ts',
  dest = 'dist',
  name,
  format = ['es', 'cjs', 'iife'],
  pkg,
  dts
}) {
  const banner = generateBanner(pkg)
  const result = []
  const output = []
  const baseConfig = defineConfig({
    input,
    plugins: [
      nodeResolve(),
      commonjs(),
      json(),
      typescript()
    ]
  })

  format.reduce((list, item) => {
    if (typeof item === 'object' && item.input) {
      // 1. 生成不同入口的文件
      result.push({
        ...baseConfig,
        output: generateOutput(item, { pkg, dest, name, banner }),
        input: item.input
      })
    } else {
      // 2. 输出通入口文件
      list.push(generateOutput(item, { pkg, dest, name, banner }))
    }

    return list
  }, output)

  if (output.length > 0) {
    baseConfig.output = output
    result.unshift(baseConfig)
  }

  // 3. 生成 .d.ts
  if (dts) {
    result.push({
      input,
      plugins: [declareTs()],
      output: {
        file: `${dest}/index.d.ts`,
        format: 'es'
      }
    })
  }
  return result
}
