## 发布包

1.包版本信息
```
pnpm changeset
```

2.变更包版本
```
pnpm changeset:version
```

3.发布npm包
```
pnpm release <module>
```


## package.json
```js
{
  //
}
```

## rollup

```js
defineConfig({
  input: '',
  output: {
    //
  },
  /**
   * 排除在 bundle 外部的模块
   * // 1. 外部依赖的名称
   * // 2. 解析过的模块 ID（如文件的绝对路径）
   * @comment 当创建 iife 或 umd 格式的 bundle 时，你需要通过 output.globals 选项提供全局变量名，以替换掉外部引入。
   */
  external: [
    "lodash",
    "jquery",
    "vue"
  ],
  plugins: [],
})
```

### output
```js
output: {
  /**
   * 输出的文件
   */
  file: 'bundles.js'
  /**
   * 输出格式: amd, cjs, es, iife, umd, system
   */
  format: 'cjs' // 输出格式: cjs, umd, iife, es6, amd
  /**
   * format为iife或者umd的时候必须配置, 会作为全局变量
   */
  name: 'myBundle',
  /**
   * 该选项用于在 umd / iife bundle 中，使用 id: variableName 键值对指定外部依赖。
   * @example jquery 是外部依赖，jquery 模块的 ID 为全局变量 $
   */
  globals: {
    jquery: '$',
    vue: 'Vue'
  }
  /**
   * 指定输出的插件
   * @comment output.plugins 仅限于在 bundle.generate() 或 bundle.write() 阶段
   */
  plugins: [
    terser() // 压缩文件
  ]
  /**
   * 生成源码映射文件
   */
  sourcemap: true,
  /**
   * 指定导出模式，默认是 auto。用于多模块导出
   * @caution 慎用
   */
  exports: 'auto'
}
```

### plugins
```js
// rollup typescript配置处理
// `@rollup/plugin-typescript`
import typescript from 'rollup-plugin-typescript2'
// 生成 .d.ts 文件
import dts from 'rollup-plugin-dts'
/*
* 解析第三方依赖 
* rollup.js编译源码中的模块引用默认只支持ES6+的模块方式import/export。
* 然而大量的npm模块是基于CommonJS模块方式，这就导致了大量 npm 模块不能直接编译使用。
* 所以辅助rollup.js编译支持npm模块和CommonJS模块方式的插件就应运而生
*/
import nodeResolve from '@rollup/plugin-node-resolve'
// 识别 commonjs 模式第三方依赖 
import commonjs from '@rollup/plugin-commonjs'
// 支持import 'xx.json'文件
import json from '@rollup/plugin-json'
// 在打包的时候把目标字符串替换
import replace from '@rollup/plugin-replace'
// 对打包的js进行压缩
import { terser } from 'rollup-plugin-terser'
// 删除原来的bundle
import delete from 'rollup-plugin-delete'
// 显示打包后文件的大小
import filesize from 'rollup-plugin-filesize'
// rollup 的 babel 插件，ES6转ES5
import { babel } from '@rollup/plugin-babel'

import copy from 'rollup-plugin-copy'
import image from '@rollup/plugin-image'
import alias from '@rollup/plugin-alias'
```

## tsconig.json

```json
{
  "compilerOptions": {
    "allowUnreachableCode": true, // 不报告执行不到的代码错误。
    "allowUnusedLabels": false, // 不报告未使用的标签错误
    "alwaysStrict": false, // 以严格模式解析并为每个源文件生成 "use strict"语句
    "baseUrl": ".", // 工作根目录
    "experimentalDecorators": true, // 启用实验性的ES装饰器
    "jsx": "react", // 在 .tsx文件里支持JSX
    "sourceMap": true, // 是否生成map文件
    "module": "ES2015", // 指定生成哪个模块系统代码
    "noImplicitAny": false, // 是否默认禁用 any
    "removeComments": true, // 是否移除注释
    "target": "ESNext", // 编译的目标是什么版本的
    "outDir": "./dist", // 输出目录
    "declaration": true, // 是否自动创建类型声明文件
    "declarationDir": "./dist/types", // 类型声明文件的输出目录
    "allowJs": true, // 允许编译javascript文件。
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "lib": [ // 编译过程中需要引入的库文件的列表
      "es5",
      "es2015",
      "es2016",
      "es2017",
      "es2018",
      "dom"
    ]
  },
  // 指定一个匹配列表（属于自动指定该路径下的所有ts相关文件）
  "include": [
    "src/**/*"
  ],
  // 指定一个排除列表（include的反向操作）
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

