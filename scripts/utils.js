import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import fg from 'fast-glob'

import { BUILD_MODULES } from './const.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
export const __rootDir = path.join(__dirname, '../')

/**
 * 所有模块及对应路径
 */
export const modulesMap = fg.sync(BUILD_MODULES, { absolute: false }).reduce((acc, cur) => {
	const arr = cur.split('/')
	if (arr.length === 3) {
		acc[arr[1]] = arr.slice(0, 2).join('/')
	}
	return acc
}, {})

/**
 * 过滤对象属性
 *
 * @param {object} obj 对象
 * @param {string[]} keys 过滤的属性
 * @returns {object}
 */
export function omit(obj, keys) {
	const result = {}
	keys = [].concat(keys)
	for (const key in obj) {
		if (!keys.includes(key)) {
			result[key] = obj[key]
		}
	}
	return result
}

/**
 * 读取 JSON 文件
 *
 * @param {string} path 文件路径
 * @returns {Promise}
 */
export async function readJSON(path) {
	const result = await fs.readFile(path, 'utf-8')
	return JSON.parse(result)
}

/**
 * 获取模块路径
 *
 * @param {string} libName 模块名
 * @returns {string}
 */
export function getLibPath(libName) {
	if (!libName || !modulesMap[libName]) {
		throw new Error(`Modules "${libName}" not found.`)
	}
	return path.join(__rootDir, modulesMap[libName])
}

/**
 * 读取模块 package.json
 *
 * @param {string} libName 模块名
 * @returns {Promise}
 */
export async function readPackage(libName) {
	const libPath = libName.includes(path.sep) ? libName : getLibPath(libName)
	return await readJSON(path.join(libPath, 'package.json'))
}

/**
 * 读取模块文件内容
 *
 * @param {string} libName 模块名
 * @param {string} filename 文件名
 * @returns {Promise}
 */
export function readLibFile(libName, filename = 'CHANGELOG.md') {
	const libPath = getLibPath(libName)
	const filePath = path.join(libPath, filename)
	return fs.readFile(filePath, { encoding: 'utf8' })
}

/**
 * 写入模块文件内容
 *
 * @param {string} libName 模块名
 * @param {string} filename 文件名
 * @returns {Promise}
 */
export function writeLibFile(libName, data, filename = 'CHANGELOG.md') {
	const libPath = getLibPath(libName)
	const filePath = path.join(libPath, filename)
	return fs.writeFile(filePath, data)
}

/**
 * 生成 banner
 *
 * @param {object} pkg 模块 package.json
 * @returns {string}
 */
export function generateBanner(pkg) {
	return (
		'/*!\n' +
		` * ${pkg.name} v${pkg.version}\n` +
		` * Copyright (c) ${new Date().getFullYear()} Mariner<mengqing723@gmail.com>\n` +
		` * Released under the ${pkg.license} License.\n` +
		' */'
	)
}
