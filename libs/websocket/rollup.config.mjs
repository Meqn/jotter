import dts from 'rollup-plugin-dts'
import pkg from './package.json' assert { type: 'json'}
import { generateConfig } from '../../build/rollup.config.simple.mjs'

const name = 'WebSocketConnect'

export default [
  generateConfig({
    input: 'src/index.ts',
    name,
    pkg
  }),
  {
    input: 'src/index.ts',
    plugins: [dts()],
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    }
  }
]
