import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import { promisify } from 'node:util'
import simpleGit from 'simple-git'

import { BUILD_LIB_DIR } from './const.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
export const __rootDir = path.join(__dirname, '../')

const git = simpleGit()

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
	return path.join(__rootDir, BUILD_LIB_DIR, libName)
}

/**
 * 读取模块 package.json
 *
 * @param {string} libName 模块名
 * @returns {Promise}
 */
export async function readPackage(pkgPath) {
	return await readJSON(path.join(pkgPath, 'package.json'))
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
		` * Copyright (c) ${new Date().getFullYear()} Mervin<mengqing723@gmail.com>\n` +
		` * Released under the ${pkg.license} License.\n` +
		' */'
	)
}

/**
 * 从指定 commit Id 获取所有最新记录
 * @param {string} tagId 提交记录Id
 * @returns
 */
export async function getCommitsSince(commitId) {
	const log = promisify(git.log.bind(git))
	const logOptions = {
		from: commitId,
	}

	try {
		const commitLogs = await log(logOptions)
		return commitLogs.all
	} catch (error) {
		console.error('Error fetching commit logs:', error.message)
		throw error
	}
}

/**
 * 从指定 标签Id 获取所有最新记录
 * @param {string} tagId 标签 ID
 * @returns
 */
export async function getCommitsSinceTag(tagId) {
	const tags = promisify(git.tags.bind(git))
	const log = promisify(git.log.bind(git))

	if (!tagId) {
		tagId = (await tags()).latest
	}

	if (!tagId) {
		console.error('No tags found.')
		return []
	}

	const logOptions = {
		from: tagId,
	}

	try {
		const commitLogs = await log(logOptions)
		return commitLogs.all
	} catch (error) {
		console.error('Error fetching commit logs:', error.message)
		throw error
	}
}
