## Scripts

### build

```bash
pnpm build --help

pnpm build [name] --clean
```

### test

```bash
pnpm test [name]
pnpm test [name] -- --coverage
```

### changelog

```bash
pnpm changelog --help

pnpm changelog [name] --push
```

## Module config

```js
// config.js
{
  name: 'Draggable',
  input: 'src/index.ts',
  formats: ['cjs','esm', 'umd'],
  external: ['react','react-dom'],
  globals: {
    react: 'React',
   'react-dom': 'ReactDOM'
  },
  target: 'es2015',
  outDir: 'dist',
  filename: 'index'
}
```

```js
//package.json
{
  "browserslist": "> 0.25%, not dead", // > 0.25%, not dead, IE >= 11
  // 配置入口, 同 config.js
  "buildOptions": {
    "input": "index.ts",
    "name": "LibName"
  }
}
```
