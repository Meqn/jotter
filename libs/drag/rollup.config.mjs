import pkg from './package.json' assert { type: 'json'}
import { generateConfig } from '../../build/rollup.config.simple.mjs'

export default generateConfig({
  name: 'Draggable',
  pkg
})
