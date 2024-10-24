# Drag

[![version](https://img.shields.io/npm/v/@jotter/drag?style=flat-square)](https://www.npmjs.com/package/@jotter/drag)
[![downloads](https://img.shields.io/npm/dm/@jotter/drag?style=flat-square)](https://www.npmjs.com/package/@jotter/drag)
[![size](https://img.shields.io/bundlephobia/minzip/@jotter/drag?style=flat-square)](https://bundlephobia.com/package/@jotter/drag)
![ES5](https://img.shields.io/badge/Supports-ES5-brightgreen?style=flat-square)
[![license](https://img.shields.io/npm/l/@jotter/drag?style=flat-square)](https://github.com/Meqn/jotter/blob/main/libs/drag)

[ [English](README.md) | [中文](./README.zh_CN.md) ]

A lightweight, flexible `drag-and-drop` library for making DOM elements draggable with mouse and touch support.

## Features

- 🎯 Directional constraints (horizontal/vertical/free)
- 📱 Mouse and touch support
- 🔒 Customizable drag boundaries
- 🎨 Position or transform-based movement
- 🎮 Custom drag handles
- 📦 Zero dependencies

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

| Option           | Type                                                        | Default        | Description                                  |
| ---------------- | ----------------------------------------------------------- | -------------- | -------------------------------------------- |
| `direction`      | `'both' \| 'x' \| 'y'`                                      | `'both'`       | Constrains the drag direction                |
| `boundary`       | `Window \| HTMLElement \| string \| BoundaryObject`         | `window`       | Sets the dragging boundary                   |
| `handle`         | `HTMLElement \| string`                                     | element itself | Specifies a child element as the drag handle |
| `moveType`       | `'position' \| 'transform'`                                 | `'position'`   | Determines how the element moves             |
| `clickThreshold` | `number`                                                    | `5`            | Maximum pixels moved to trigger click event  |
| `onClick`        | `(event: MouseEvent \| TouchEvent) => void`                 |                | Triggered when element is clicked            |
| `onStart`        | `(event: MouseEvent \| TouchEvent) => void`                 |                | Triggered when dragging starts               |
| `onMove`         | `(event: MouseEvent \| TouchEvent, offset: Offset) => void` |                | Triggered during dragging                    |
| `onEnd`          | `(event: MouseEvent \| TouchEvent, offset: Offset) => void` |                | Triggered when dragging ends                 |

### Methods

| Method     | Description                            |
| ---------- | -------------------------------------- |
| `bind()`   | Binds drag events to the element       |
| `unbind()` | Removes drag event listeners           |
| `reset()`  | Resets element to its initial position |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE 11 (with transform fallback)

## License

MIT
