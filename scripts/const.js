/**
 * git 仓库地址
 */
export const GIT_REPO_URL = 'https://github.com/Meqn/jotter'

/**
 * 构建配置
 */
export const BUILD_BROWSERSLIST = '> 0.25%, not dead'
export const BUILD_TS_TARGET = ['es2018', 'es2015']
export const BUILD_FORMATS = ['esm', 'cjs', 'umd']
export const BUILD_LIB_DIR = 'libs'
export const BUILD_LIB_CONFIG_FILE = 'config.js'

/**
 * 版本 emoji 标识
 */
export const LOG_SEMVER_SYMBOL = {
	Major: '🎉',
	Minor: '🚀',
	Patch: '🌟',
}
/**
 * 显示的日志类型
 * // (revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip)
 */
export const LOG_MESSAGE_TYPE = ['feat', 'fix', 'perf', 'refactor', 'docs']

/**
 * changeset 默认变更日志 (待替换)
 */
export const LOG_DEFAULT_MESSAGE = `update.`
