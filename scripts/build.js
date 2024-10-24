import path from 'node:path'
import { rollup, watch } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import babel from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'
import dts from 'rollup-plugin-dts'

import minimist from 'minimist'
import { tag, colors } from 'diy-log'

import {
	BUILD_BROWSERSLIST,
	BUILD_FORMATS,
	BUILD_TS_TARGET,
	BUILD_LIB_CONFIG_FILE,
	BUILD_LIB_DIR,
} from './const.js'
import { __rootDir, readPackage, getLibPath, generateBanner } from './utils.js'

const args = minimist(process.argv.slice(2))
const watchMode = args.watch
const IS_PROD = !args.watch

async function readLibConfig(libPath) {
	try {
		const { default: result } = await import(path.join(libPath, BUILD_LIB_CONFIG_FILE))
		if (typeof result === 'function') {
			return await Promise.resolve().then(result)
		} else {
			return result
		}
	} catch (err) {
		console.log(colors.blue(`[${libPath.split('/').pop()}] `) + 'config not found.')
		return {}
	}
}

async function generateConfig(libName) {
	const libPath = getLibPath(libName)
	const libConfig = await readLibConfig(libPath)
	const libPkg = await readPackage(libPath)

	function computedTs(input) {
		let file = input
		if (Array.isArray(input)) {
			file = typeof input[0] === 'string' ? input[0] : input[0].input
		}
		return file.split('.').pop() === 'ts'
	}

	const result = {
		name: args.name || libName,
		pkg: libPkg,
		dir: libPath,
		relativeDir: path.posix.join(BUILD_LIB_DIR, libName),
		input: args.input || 'src/index.ts',
		target: args.target?.split(','), //'es2015',
		formats: args.formats ? args.formats.split(',') : BUILD_FORMATS,
		external: [],
		globals: {},
		...(libPkg.buildOptions || {}),
		...libConfig,
	}
	if (args.outDir) result.outDir = args.outDir
	if (args.outFilename) result.outFilename = args.outFilename

	if (!result.target) {
		const isTs = computedTs(result.input)
		result.target = isTs
			? BUILD_TS_TARGET
			: result.browserslist || libPkg.browserslist || BUILD_BROWSERSLIST
	}

	return result
}

function getOutputFile(format, config) {
	const { outDir, outFilename } = config
	const formatMap = {
		es: {
			export: 'module',
			suffix: '.mjs',
		},
		cjs: {
			export: 'main',
			suffix: '.js',
		},
		umd: {
			export: 'unpkg',
			suffix: '.min.js',
		},
		types: {
			export: 'types',
			suffix: '.d.ts',
		},
	}
	const outputDir = outDir || 'dist'
	const formatFile = formatMap[format]
	if (outFilename) {
		return `${outputDir}/${outFilename}${formatFile.suffix}`
	}
	return config.pkg[formatFile.export] || `${outputDir}/index${formatFile.suffix}`
}

function generateOutputs(config) {
	const { dir, formats } = config
	const banner = generateBanner(config.pkg)

	return formats.reduce((acc, format) => {
		if (['umd', 'iife'].includes(format)) {
			acc.push({
				file: path.join(dir, getOutputFile('umd', config)),
				format,
				name: config.name,
				banner,
				globals: config.globals,
				sourcemap: IS_PROD,
				plugins: IS_PROD ? [terser()] : [],
			})
		} else {
			format = ['es', 'esm'].includes(format) ? 'es' : format
			acc.unshift({
				file: path.join(dir, getOutputFile(format, config)),
				format,
				banner,
			})
		}
		return acc
	}, [])
}

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

function typescriptPlugin(config, umd) {
	const compilerOptions = {}
	if (config.target) {
		const target = [].concat(config.target)
		compilerOptions.target = umd ? target[target.length - 1] : target[0]
	}
	return typescript({
		tsconfig: path.join(__rootDir, './tsconfig.json'),
		compilerOptions,
		include: [path.posix.join(config.relativeDir, path.dirname(config.input), '**')],
		exclude: ['node_modules/**', 'dist/**'],
	})
}

async function build(config) {
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
	const outputs = generateOutputs(config)
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

	if (watchMode) {
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

async function buildLib(libName) {
	const config = await generateConfig(libName)
	if (Array.isArray(config.input)) {
		for (const input of config.input) {
			const inputConfig = typeof input === 'object' ? input : { input }
			if (!inputConfig.name) {
				inputConfig.name = inputConfig.input.split('/').pop().split('.')[0]
			}
			if (!inputConfig.outFilename) {
				inputConfig.outFilename = inputConfig.name
			}

			await build({ ...config, ...inputConfig })
		}
	} else {
		await build(config)
	}
}

async function buildAll() {
	let libs = args._
	if (!libs.length) {
		// libs = await fs.readdir(path.join(__dirname, '../libs'));
		// --watch, --js, --input, --formats, --target, --name, --outFilename, --outDir
		const output = [
			colors.blue('Usage: pnpm build <lib-name> [options]'),
			'',
			'Options:',
			'  --watch           Watch mode',
			'  --input           Input file',
			'  --name            Library name',
			'  --formats         Output formats',
			'  --target          Target browsers',
			'  --outFilename     Output filename',
			'  --outDir          Output directory',
			'',
			'Examples : ',
			'$ pnpm build drag popper --watch',
			'$ pnpm build drag --name=Draggable --formats=es,cjs,umd --target=es2015',
			'',
		].join('\n')
		console.log(output)
		return
	}

	for (const lib of libs) {
		await buildLib(lib)
	}
}

buildAll().catch((error) => {
	tag.error('Build failed: ')
	console.error(error)
	process.exit(1)
})
