import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import minimist from 'minimist'
import { BUILD_LIB_DIR } from './const.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rawArgs = process.argv.slice(2)
const args = minimist(rawArgs)
// console.log('args : ', args, rawArgs)

// convert args object to string
function argsToString(args) {
	return Object.entries(args)
		.filter(([key, value]) => key !== '_' && value !== false)
		.map(([key, value]) => {
			if (value === true) {
				return `--${key}`
			} else {
				return `--${key}=${value}`
			}
		})
		.join(' ')
}

// run tests for specific path
function runTests(libPath) {
	try {
		console.log(`Running tests for ${path.basename(libPath)}...`)
		const testArgs = argsToString(args)
		// `--experimental-vm-modules` is required for esm
		execSync(
			`cross-env NODE_OPTIONS="--experimental-vm-modules" npx jest "${libPath}" ${testArgs}`,
			{
				stdio: 'inherit',
			}
		)
	} catch (error) {
		console.error(`Tests failed for ${path.basename(libPath)}`)
		process.exit(1)
	}
}

// Run tests for specific libs
const libs = args._
let testPath = path.join(process.cwd(), BUILD_LIB_DIR)
if (libs.length) {
	testPath = `${BUILD_LIB_DIR}/(${libs.join('|')})/.*\\.(test|spec)\\.[tj]s$`
}
runTests(testPath)
