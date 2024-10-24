import simpleGit from 'simple-git'
import log from 'diy-log'
import minimist from 'minimist'

import {
	BUILD_LIB_DIR,
	GIT_REPO_URL,
	LOG_SEMVER_SYMBOL,
	LOG_MESSAGE_TYPE,
	LOG_DEFAULT_MESSAGE,
} from './const.js'
import {
	readPackage,
	readLibFile,
	writeLibFile,
	getCommitsSince,
	getCommitsSinceTag,
} from './utils.js'

const rawArgs = process.argv.slice(2)
const args = minimist(rawArgs)
const git = simpleGit()

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
	logStr = sortLogsByType(logs).join('\n')

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

// 执行命令
;(async () => {
	const moduleRegex = /^[a-z]{1,10}\(\w+\).*/i
	try {
		// const commits = await getCommitsSince('d9acb96')
		const commitId = args.commit || args.C
		const getCommitLogs = () =>
			commitId ? getCommitsSince(commitId) : getCommitsSinceTag(args.tag)
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

		console.log(
			'Commit messages:',
			formatCommits(commits).map((commit) => commit.message)
		)

		Object.entries(formattedCommits).forEach(([key, value]) => {
			log.tag.warn('\n' + value.join('\n'), key)
		})

		if (args._.length) {
			for (const name of args._) {
				await generateLogs(name, formattedCommits)
			}

			if (args.push) {
				await git.add([`${BUILD_LIB_DIR}/*/package.json`, `${BUILD_LIB_DIR}/*/CHANGELOG.md`])
				await git.commit('Version Packages')
				await git.push('origin', 'main')
			}
		}
	} catch (err) {
		console.error(err)
	}
})()
