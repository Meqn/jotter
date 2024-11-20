import path from 'node:path'
import { rollup, watch } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import babel from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'
import dts from 'rollup-plugin-dts'
import { tag, colors } from 'diy-log'

import { __rootDir, generateBanner } from './utils.js'

/**
 * 获取输出文件路径
 *
 * @param {string} format 格式
 * @param {object} config 构建配置
 * @returns {string}
 */
function getOutputFile(format, config) {
	const { outDir, filename, pkg } = config
	const formatMap = {
		es: {
			filename: filename + (pkg.type === 'module' ? '.js' : '.mjs'),
		},
		cjs: {
			filename: filename + (pkg.type === 'module' ? '.cjs' : '.js'),
		},
		umd: {
			filename: filename + '.min.js',
		},
		types: {
			filename: filename + '.d.ts',
		},
	}
	return `${outDir}/${formatMap[format].filename}`
}

/**
 * 生成输出配置
 *
 * @param {object} config 构建配置
 * @param {object} options 构建选项
 * @param {boolean} options.PROD 是否生产环境
 * @returns {object[]}
 */
function generateOutputs(config, options) {
	const { dir, formats, minify } = config
	const { PROD } = options
	const banner = generateBanner(config.pkg)

	return formats.reduce((acc, format) => {
		if (['umd', 'iife'].includes(format)) {
			acc.push({
				file: path.join(dir, getOutputFile('umd', config)),
				format,
				name: config.name,
				banner,
				globals: config.globals,
				sourcemap: PROD,
				plugins: PROD && minify ? [terser()] : [],
			})
		} else {
			format = ['es', 'esm'].includes(format) ? 'es' : format
			acc.unshift({
				file: path.join(dir, getOutputFile(format, config)),
				format,
				banner,
				plugins: PROD && minify === 'all' ? [terser()] : [],
			})
		}
		return acc
	}, [])
}

/**
 * babel 插件
 *
 * @param {object} config 构建配置
 * @param {boolean} umd 是否 umd 环境
 * @returns {object}
 */
function babelPlugin(config, umd) {
	let target = config.target || config.browserslist
	if (typeof target === 'string') target = target.split(',')
	if (!umd) {
		target = target.filter((item) => !item.includes('ie'))
	}
	return babel({
		babelHelpers: 'bundled',
		exclude: 'node_modules/**',
		presets: [['@babel/preset-env', { targets: target.join(',') }]],
		extensions: ['.js', '.ts'],
	})
}

/**
 * typescript 插件
 *
 * @param {object} config 构建配置
 * @param {boolean} umd 是否 umd 环境
 * @returns {object}
 */
function typescriptPlugin(config, umd) {
	const compilerOptions = {}
	if (config.target) {
		const target = [].concat(config.target)
		compilerOptions.target = umd ? target[target.length - 1] : target[0]
	}
	return typescript({
		tsconfig: path.join(__rootDir, './tsconfig.json'),
		compilerOptions,
		include: [path.posix.join(config.libDir, path.dirname(config.input), '**')],
		exclude: ['node_modules/**', 'dist/**'],
	})
}

/**
 * 构建
 *
 * @param {object} config 构建配置
 * @param {object} options 构建选项
 * @param {boolean} options.watchMode 是否监听模式
 * @param {boolean} options.PROD 是否生产环境
 * @returns {Promise}
 */
async function build(config, options = {}) {
	const { dir } = config

	const isTs = config.input.split('.').pop() === 'ts'
	const hasUmd = config.formats.includes('umd') || config.formats.includes('iife')

	// 1. plugins
	const basePlugins = [nodeResolve(), commonjs(), json()]

	const inputOptions = {
		input: path.join(dir, config.input),
		external: config.external,
		plugins: basePlugins.concat(isTs ? typescriptPlugin(config) : babelPlugin(config)),
	}
	const umdInputOptions = {
		...inputOptions,
		plugins: basePlugins.concat(isTs ? typescriptPlugin(config, true) : babelPlugin(config, true)),
	}

	// 2. output
	const outputs = generateOutputs(config, options)
	const outputOptions = hasUmd ? outputs.slice(0, -1) : outputs
	const umdOutputOptions = hasUmd ? outputs[outputs.length - 1] : null

	// 3. dts
	const dtsOptions = {
		input: path.join(dir, config.input),
		output: {
			file: path.join(dir, getOutputFile('types', config)),
			format: 'es',
		},
		plugins: [dts()],
	}

	if (options.watchMode) {
		const watcher = watch({
			...inputOptions,
			output: outputOptions.concat(hasUmd ? umdOutputOptions : []),
		})

		watcher.on('event', (event) => {
			if (event.code === 'START') {
				tag.info(colors.blue(`[${config.name}] `) + 'Building...')
			} else if (event.code === 'END') {
				tag.success(colors.blue(`[${config.name}] `) + 'Build complete. Watching for changes...')
			} else if (event.code === 'ERROR') {
				tag.error(colors.blue(`[${config.name}] `) + 'Build failed: ')
				console.error(event.error)
			}
		})
	} else {
		if (outputOptions.length) {
			const bundle = await rollup(inputOptions)
			await Promise.all(outputOptions.map((options) => bundle.write(options)))
		}

		// 单独构建 UMD 版本
		if (hasUmd) {
			const umdBundle = await rollup(umdInputOptions)
			await umdBundle.write(umdOutputOptions)
		}

		// 生成类型文件
		if (isTs) {
			const dtsBundle = await rollup(dtsOptions)
			await dtsBundle.write(dtsOptions.output)
		}

		tag.success(colors.blue(`[${config.name}] `) + 'Build complete.')
	}
}

export { build as rollupBuild }
