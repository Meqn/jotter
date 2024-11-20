import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import minimist from 'minimist'
import { modulesMap } from './utils.js'

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
function runTests(testPath) {
	try {
		console.log(`Running tests for ${testPath}...`)
		const testArgs = argsToString(args)
		// `--experimental-vm-modules` is required for esm
		execSync(`npx jest "${testPath}" ${testArgs}`, {
			stdio: 'inherit',
		})
	} catch (error) {
		console.error(`Tests failed for ${testPath}`)
		process.exit(1)
	}
}

// Run tests for specific libs
const libs = args._
let testPath = '.*\\.(test|spec)\\.[tj]s$'
if (libs.length) {
	const libsPath = libs.map((lib) => modulesMap[lib]).join('|')
	testPath = `(${libsPath})/.*\\.(test|spec)\\.[tj]s$`
}
runTests(testPath)
