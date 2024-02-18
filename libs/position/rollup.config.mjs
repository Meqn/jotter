import pkg from './package.json' assert { type: 'json'}
import { generateConfig } from '../../build/rollup.build.mjs'

export default generateConfig({
  name: 'position',
  pkg,
  dts: true,
  format: [
    'cjs',
    'umd',
    {
      format: 'es',
      input: 'src/position.ts'
    }
  ]
})
