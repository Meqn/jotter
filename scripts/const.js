/**
 * git 仓库地址
 */
export const GIT_REPO_URL = 'https://github.com/Marinerer/jotter'
export const GIT_REPO_REMOTE = 'origin'
export const GIT_REPO_BRANCH = 'main'

/**
 * 构建配置
 */
export const BUILD_MODULES = ['libs/*/package.json'] // 所有的构建模块
export const BUILD_BROWSERSLIST = '> 0.25%, not dead'
export const BUILD_TS_TARGET = ['es2018', 'es2015']
export const BUILD_FORMATS = ['esm', 'cjs', 'umd']
export const BUILD_LIB_CONFIG_FILE = 'config' // 构建配置文件
export const BUILD_LIB_CONFIG_KEY = 'buildOptions' // package.json 中的构建配置

/**
 * 变更日志
 */
// 版本 emoji 标识
export const LOG_SEMVER_SYMBOL = {
	Major: '🎉',
	Minor: '🚀',
	Patch: '🌟',
}
// 显示日志类型
// (revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip)
export const LOG_MESSAGE_TYPE = ['feat', 'fix', 'perf', 'refactor', 'docs']
// changeset 默认变更日志 (待替换)
export const LOG_DEFAULT_MESSAGE = `update.`
// 提交的 commit 信息
export const LOG_COMMIT_MESSAGE = `release: Version Packages`
