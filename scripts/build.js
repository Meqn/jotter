import path from 'node:path'
import minimist from 'minimist'
import { rimraf } from 'rimraf'
import { execa } from 'execa'
import { tag, colors, symbols } from 'diy-log'
import { rollupBuild } from './rollup.js'

import {
	BUILD_BROWSERSLIST,
	BUILD_FORMATS,
	BUILD_TS_TARGET,
	BUILD_LIB_CONFIG_FILE,
	BUILD_LIB_CONFIG_KEY,
} from './const.js'
import { modulesMap, __rootDir, omit, readPackage, getLibPath } from './utils.js'

const args = minimist(process.argv.slice(2))
const watchMode = args.watch
const PROD = !args.watch

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
		return null
	}
}

function generateConfig(input, config = {}, pkg, cli = {}) {
	const { libName, libPath } = config
	const isTs = input.split('.').pop() === 'ts'
	const target = cli.target
		? cli.target.split(',')
		: isTs
			? BUILD_TS_TARGET
			: config.browserslist || pkg.browserslist || BUILD_BROWSERSLIST

	return {
		input,
		name: cli.name || libName, //全局变量名, 用于 iife / umd
		pkg, // package.json
		dir: libPath, // 模块绝对路径
		libDir: modulesMap[libName], // 模块相对路径
		target, // 目标环境
		formats: cli.formats ? args.formats.split(',') : BUILD_FORMATS,
		external: [], // 外部依赖
		globals: {}, // 外部依赖，用于在 umd / iife 中使用的变量名
		outDir: cli.outDir || 'dist', // 输出目录
		filename: cli.filename || input.split('/').pop().split('.')[0], // 输出文件名
		minify: cli.minify ?? true,
		...omit(config, 'input'),
	}
}

async function getLibConfig(libName, cli = {}) {
	const libPath = getLibPath(libName)
	const _config = await readLibConfig(libPath)
	const libPkg = await readPackage(libPath)

	const userConfig = _config || libPkg[BUILD_LIB_CONFIG_KEY] || {}
	const libInput = cli.input || userConfig.input || './src/index.ts'

	return [].concat(libInput).map((input) => {
		const conf = typeof input === 'object' ? input : { input }
		return generateConfig(
			conf.input,
			Object.assign({ libName, libPath }, userConfig, conf),
			libPkg,
			cli
		)
	})
}

async function buildLib(libName) {
	const startTime = Date.now()
	console.log(colors.blue(`[${libName}] `) + 'Building...')
	const libConfig = await getLibConfig(libName, args)
	if (libConfig.length === 0) return

	const _conf = libConfig[0]

	// 清除输出目录
	if (args.clean || _conf.clean) {
		await rimraf(path.join(_conf.dir, _conf.outDir))
	}

	// 执行自定义构建
	const _pkg = _conf.pkg
	if (_pkg?.scripts?.build && _pkg?.name) {
		await execa({ stdout: 'inherit', stderr: 'inherit' })`pnpm --filter ${_pkg.name} run build`
	} else {
		// 执行默认构建
		for (const config of libConfig) {
			await rollupBuild(config, { watch: watchMode, PROD })
		}
	}

	const endTime = Date.now()
	console.log(
		colors.blue(`[${libName}] `) + `Build success in ${endTime - startTime}ms. ${symbols.done}`
	)
}

function printHelp() {
	const output = [
		colors.blue('Usage: pnpm build <lib-name> [options]'),
		'',
		'If `package.json` includes `scripts.build`, run `build` command; Otherwise, run `rollup` build.',
		'',
		'Options:',
		'  --watch           Watch mode',
		'  --input           Input file',
		'  --name            Library name',
		'  --formats         Output formats',
		'  --target          Target browsers',
		'  --filename        Output filename',
		'  --outDir          Output directory',
		'  --minify          Minify output',
		'  --clean           Clean output directory',
		'  --help            Show help',
		'',
		'Examples : ',
		'$ pnpm build drag popper --watch',
		'$ pnpm build drag --name=Draggable --formats=es,cjs,umd --target=es2015',
		'',
	].join('\n')
	console.log(output)
}

async function buildAll() {
	if (args.help) {
		return printHelp()
	}

	let libs = args._
	if (!libs.length) libs = Object.keys(modulesMap)

	for (const lib of libs) {
		await buildLib(lib)
	}
}

buildAll().catch((error) => {
	tag.error('Build failed: ')
	console.error(error)
	process.exit(1)
})
