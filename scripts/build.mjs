import { promisify } from 'node:util'
import childProcess from 'node:child_process'
import { tag, log } from 'diy-log'

const exec = promisify(childProcess.exec)
const args = process.argv.slice(2)

/**
 * publish
 * @param {string} module 模块名
 * @param {string} dir 目录名
 */
async function release(module, dir) {
  try {
    dir = dir || module //模块名和目录名不一致

    const { stderr, stdout } = await exec(`pnpm --filter @jotter/${module} run build`)
    if (stderr) {
      log(`stderr: \n${stderr}`)
    }
    if (stdout) {
      log(`stdout: \n${stdout}`)
    }
    tag.done('Building !\n')

    const { stderr: publishOut } = await exec(`cd libs/${dir} && npm publish --access=public --registry=https://registry.npmjs.org`)
    log(publishOut)
    tag.done('npm publish !')

  } catch (error) {
    tag.error(error.message)
  }
}

/**
 * build || test
 * @param {string} module 模块名
 * @param {string} command 执行命令
 */
async function build(module, command) {
  try {
    const { error, stderr, stdout } = await exec(`pnpm --filter @jotter/${module} run ${command}`)
    if (stderr) {
      tag.info('', 'stderr')
      log(stderr)
    }
    if (stdout) {
      tag.info('', 'stdout')
      log(stdout)
    }
  } catch (error) {
    tag.error(error.message)
  }
}

/**
 * 执行命令 ['test', 'build', 'release']
 * @example `pnpm [command] [module_name] [module_dir]`
 */
if (args[0] === 'release') {
  release(args[1], args[2])
} else {
  build(args[1], args[0])
}
