# scripts

```bash
# 构建库
pnpm run build <lib-name>

# 测试库
pnpm run test <lib-name>

# 更新日志
pnpm run changelog <lib-name>
```

## build

```js
config = {
	name, // 库名称
	input, // 入口文件
	target, // 目标平台
	formats, // 格式
	external, // 外部依赖
	globals, // 全局变量
	outDir, // 输出目录
	outFilename, // 输出文件名
}
```
