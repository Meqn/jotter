import { defineConfig } from 'rollup'
import pkg from './package.json' assert { type: 'json'}
import { generateConfig } from '../../build/rollup.config.simple.mjs'

const name = 'EventEmitter'

export default generateConfig({
  input: 'src/index.ts',
  name,
  pkg
})
