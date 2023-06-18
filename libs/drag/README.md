# Drag

Lightweight `drag-and-drop` library that allows you to quickly and easily make DOM elements draggable within specified boundaries.  
It supports setting drag element, limiting drag boundaries, and horizontal, vertical, and free drag.


一个轻量级的拖拽库，允许你快速而轻松地使DOM元素在指定范围内拖动。


## Features
- 轻量无依赖，易于整合
- 支持PC和移动设备
- 支持指定拖动方向(自由、水平、垂直)
- 支持设置拖动边界
- 提供拖动事件的回调函数


## Install

```
npm install @jotter/drag
```

cdn
```
<script>
```

## Usage

```html
<div class="drag-wrapper">
  Here is the drag and drop area ...
  
  <div id="drag-el">
    <header id="drag-hd">Drag handler</header>
    <div class="drag-body">
      content...
    </div>
  </div>

</div>
```

```js
new Draggable('#drag-el', {
  handle: '#drag-hd',
  boundary: '.drag-wrapper',
  onMove(event, {offsetX, offsetY}) {
    console.log('Dragging', event)
  }
})
```

## API

```js
new Draggable(element, options)
```
### element
被拖拽的元素。 可以是 DOM 元素或者元素选择器字符串。
- `type` : `HTMLElement | string`


### options

配置选项


| Property       | Type           | Default | Description |
| -------------- | -------------- | ------- | ----------- |
| `handle`         | `HTMLElement, string`  | `element` |监听拖拽事件的目标元素，默认拖动元素。|
| `direction`      | `string` | `both` | 拖拽方向。 `both`, `horizontal`, `x`, `vertical`, `y` |
| `boundary`       | `HTMLElement, window, string, Object` | `window` | 可拖拽的区域边界。默认`window`，也可以是`元素`, `CSS选择器`, 或包含`{top,right,bottom,left}` 的对象 |
| `clickThreshold` | `number` | `5` | 拖动距离阈值，判定是否为click事件。 |
| `onClick(event, data)`        | `Function` | - | click事件的回调函数。 |
| `onStart`        | `Function` |         | 拖动开始的回调函数。 |
| `onMove`         | `Function` |         | 拖动中的回调函数。 |
| `onEnd`          | `Function` | - | 拖动结束的回调函数。 |


## Methods
实例方法

### bind()
绑定可拖动事件。

### unbind()
禁止拖动 (解除拖动事件)。

