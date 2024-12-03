# Drag

[![version](https://img.shields.io/npm/v/@jotter/drag?style=flat-square)](https://www.npmjs.com/package/@jotter/drag)
[![codecov](https://codecov.io/gh/Marinerer/jotter/graph/badge.svg?token=G7QXEHCEXW)](https://codecov.io/gh/Marinerer/jotter)
[![downloads](https://img.shields.io/npm/dm/@jotter/drag?style=flat-square)](https://www.npmjs.com/package/@jotter/drag)
[![size](https://img.shields.io/bundlephobia/minzip/@jotter/drag?style=flat-square)](https://bundlephobia.com/package/@jotter/drag)
![ES5](https://img.shields.io/badge/Supports-ES5-brightgreen?style=flat-square)
[![license](https://img.shields.io/npm/l/@jotter/drag?style=flat-square)](https://github.com/Marinerer/jotter/blob/main/libs/Drag)

[ [English](README.md) | [中文](./README.zh_CN.md) ]

一个轻量级的拖拽库，允许你快速而轻松地使DOM元素在指定区域内拖动。

## Features

- 🎯 支持水平、垂直或自由方向拖拽
- 📱 兼容触摸和鼠标事件
- 🔒 可设置拖拽边界
- 🎨 支持 `transform` 和 `position` 移动方式
- 🎮 自定义拖拽手柄
- 📦 轻量无依赖，易于整合

## Installation

```bash
npm install @jotter/drag
```

## Usage

```js
import Drag from '@jotter/drag'

// Basic Usage
const drag = new Drag('#element')

// With Custom Handle
const drag = new Drag('#element', {
	handle: '#handle',
	direction: 'x',
	moveType: 'transform',
	boundary: '.container',
	onMove: (event, { offsetX, offsetY }) => {},
})

// Custom boundary
const drag = new drag('#element', {
	boundary: {
		top: 0,
		right: 500,
		bottom: 500,
		left: 0,
	},
})
```

## API

### Constructor

```typescript
new Drag(element: string | HTMLElement, options?: DragOptions)
```

### Options

| Option           | Type                                                        | Default      | Description      |
| ---------------- | ----------------------------------------------------------- | ------------ | ---------------- |
| `direction`      | `'both' \| 'x' \| 'y'`                                      | `'both'`     | 拖动方向         |
| `boundary`       | `Window \| HTMLElement \| string \| BoundaryObject`         | `window`     | 拖动边界         |
| `handle`         | `HTMLElement \| string`                                     | 当前元素     | 拖动句柄         |
| `moveType`       | `'position' \| 'transform'`                                 | `'position'` | 移动方式         |
| `clickThreshold` | `number`                                                    | `5`          | 点击事件移动阈值 |
| `onClick`        | `(event: MouseEvent \| TouchEvent) => void`                 |              | 点击事件         |
| `onStart`        | `(event: MouseEvent \| TouchEvent) => void`                 |              | 开始移动         |
| `onMove`         | `(event: MouseEvent \| TouchEvent, offset: Offset) => void` |              | 移动中           |
| `onEnd`          | `(event: MouseEvent \| TouchEvent, offset: Offset) => void` |              | 移动结束         |

### Methods

| Method     | Description      |
| ---------- | ---------------- |
| `bind()`   | 监听拖动事件     |
| `unbind()` | 移除监听拖动事件 |
| `reset()`  | 重置元素位置     |

## 注意事项

1. 使用 `position` 模式时，确保目标元素设置了 `position: absolute` 或 `position: fixed`

2. 使用 `boundary` 选项时，确保边界元素已渲染且有明确的尺寸

3. 在移动端使用时，建议添加 `touch-action: none` 样式以避免页面滚动干扰

4. 使用 `transform` 模式时，注意可能会影响子元素的定位和层叠上下文

## 浏览器兼容性

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE 11 (with transform fallback)

## License

MIT
