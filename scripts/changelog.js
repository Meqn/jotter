import simpleGit from 'simple-git'
import { promisify } from 'node:util'
import logger from 'diy-log'
import minimist from 'minimist'

import {
	GIT_REPO_URL,
	GIT_REPO_REMOTE,
	GIT_REPO_BRANCH,
	LOG_SEMVER_SYMBOL,
	LOG_MESSAGE_TYPE,
	LOG_DEFAULT_MESSAGE,
	LOG_COMMIT_MESSAGE,
} from './const.js'
import { modulesMap, readPackage, readLibFile, writeLibFile } from './utils.js'

const rawArgs = process.argv.slice(2)
const args = minimist(rawArgs)
const git = simpleGit()

/**
 * 获取匹配的最新一条commit Id
 * @param {string} pattern 匹配规则
 * @returns
 */
export async function getLastReleaseCommitId(pattern = '^release:') {
	const gitLog = promisify(git.log.bind(git))
	// 使用 `git log` 命令查找所有匹配的 commit
	// const log = await git.log([`--grep=^${pattern}`, '--pretty=format:%H %s'])
	const log = await gitLog({ n: 1, '--grep': pattern })

	if (log.total > 0) {
		return log.latest.hash
	} else {
		throw new Error(`No matching release commit found: "${pattern}"`)
	}
}

/**
 * 从指定 commit Id 获取所有最新记录
 * 默认为最新发布版本的 commit Id
 * @param {string} tagId 提交记录Id
 * @returns
 */
export async function getCommitsSince(commitId) {
	const log = promisify(git.log.bind(git))
	const logOptions = {
		from: commitId,
	}

	if (!commitId) {
		const cid = await getLastReleaseCommitId(`^${LOG_COMMIT_MESSAGE}`)
		// const cid = await getLastReleaseCommitId(`^feat: `)
		logOptions.from = cid
	}

	const commitLogs = await log(logOptions)
	return commitLogs.all
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
		logger.tag.warn('No tags found.')
		return []
	}

	const commitLogs = await log({
		from: tagId,
	})

	return commitLogs.all
}

/**
 * 日志排序
 *
 * @param {Array.<string>} logs 日志列表
 * @returns {Array.<string>}
 */
function sortLogsByType(logs) {
	const msgRegex = new RegExp(`- (${LOG_MESSAGE_TYPE.join('|')}):[\\s\\S]+`)
	return logs
		.reduce(
			(acc, cur) => {
				const type = cur.match(msgRegex)?.[1]
				const index = LOG_MESSAGE_TYPE.indexOf(type)
				if (index > -1) {
					acc[index].push(cur)
				}
				return acc
			},
			LOG_MESSAGE_TYPE.map(() => []).concat([[]])
		)
		.reduce((acc, cur) => acc.concat(cur), [])
}

/**
 * 更新日志内容
 *
 * @param {string} content 日志内容
 * @param {string} version 版本号
 * @param {Array.<string>} logs 日志列表
 * @returns {Promise}
 */
function updateChangelog(content, version, logs) {
	const [v1, v2, v3] = version.split('.')
	const regex = new RegExp(`## ${v1}\\.${v2}\\.${v3}[\\s]*### (Patch|Minor|Major) Changes\\n`)
	const logStr = sortLogsByType(logs).join('\n')

	return content
		.replace(regex, (match, p1) => {
			return match.replace('Changes', 'Changes ' + LOG_SEMVER_SYMBOL[p1])
		})
		.replace(`- ${LOG_DEFAULT_MESSAGE}`, logStr)
}

// 格式化 commit 记录
function formatCommits(commits, filter = (commit) => commit) {
	const regex = /\(([^)]+)\)/
	return commits.filter(filter).map((commit) => {
		const { message } = commit
		const match = message.match(regex)

		return {
			hash: commit.hash,
			author: commit.author_name,
			date: commit.date,
			message: message,
			package: match ? match[1].toLowerCase() : '',
			text: match ? message.replace(match[0], '').trim() : '',
		}
	})
}

// 生成日志记录
async function generateLogs(name, logs) {
	const pkg = await readPackage(name)
	const content = await readLibFile(name)
	const result = updateChangelog(content, pkg.version, logs[name.toLowerCase()])
	await writeLibFile(name, result)

	return result
}

// 提交changeset版本变更文件
async function pushVersionChanges() {
	const changeFiles = Object.values(modulesMap).reduce((acc, cur) => {
		acc.push(`${cur}/package.json`)
		acc.push(`${cur}/CHANGELOG.md`)
		return acc
	}, [])
	await git.add(changeFiles)
	await git.commit(LOG_COMMIT_MESSAGE)
	await git.push(GIT_REPO_REMOTE, GIT_REPO_BRANCH)
}

function printHelp() {
	const output = [
		logger.colors.blue('Usage: pnpm changelog [lib-name] [options]'),
		'',
		'Options:',
		'  --tag            Get commits starting from specified tag',
		'  --commit         Get commits starting from specified commitId',
		'  --push           Auto push changes',
		'  --help           Show help',
		'',
		'Examples : ',
		'$ pnpm changelog popper --push',
		'$ pnpm changelog drag popper --commit=436a62e',
		'',
	].join('\n')
	console.log(output)
}

// 执行命令
;(async () => {
	if (args.help) {
		return printHelp()
	}

	// 无模块时, 仅执行 `git push` 操作
	if (args._.length === 0 && args.push) {
		await pushVersionChanges()
		return
	}

	try {
		const moduleRegex = /^[a-z]{1,10}\(\w+\).*/i
		// const commits = await getCommitsSince('d9acb96')
		const getCommitLogs = () =>
			args.tag ? getCommitsSinceTag(args.tag) : getCommitsSince(args.commit || args.C)
		// commitId ? getCommitsSince(commitId) : getCommitsSinceTag(args.tag)
		const commits = await getCommitLogs()
		const formattedCommits = formatCommits(commits, (commit) => {
			return moduleRegex.test(commit.message)
		}).reduce((acc, commit) => {
			if (!commit.package) throw new Error('No package found in commit message: ' + commit.message)
			if (!acc[commit.package]) {
				acc[commit.package] = []
			}
			acc[commit.package.toLowerCase()].push(
				`- ${commit.text} ([${commit.hash.slice(0, 7)}](${GIT_REPO_URL}/commit/${commit.hash}))`
			)
			return acc
		}, {})

		// 打印所有commit记录
		console.log(
			'Commit messages:',
			formatCommits(commits).map((commit) => commit.message)
		)

		// 打印模块分组commit记录
		Object.entries(formattedCommits).forEach(([key, value]) => {
			logger.tag.warn('\n' + value.join('\n'), key)
		})

		// 有模块时, 自动生成变更日志
		if (args._.length) {
			for (const name of args._) {
				await generateLogs(name, formattedCommits)
			}

			// 自动提交变更记录
			if (args.push) {
				await pushVersionChanges()
			}
		}
	} catch (err) {
		logger.tag.error(err.message)
		console.error(err)
	}
})()
