# position

[![version](https://img.shields.io/npm/v/@jotter/position?style=flat-square)](https://www.npmjs.com/package/@jotter/position)
[![downloads](https://img.shields.io/npm/dm/@jotter/position?style=flat-square)](https://www.npmjs.com/package/@jotter/position)
[![size](https://img.shields.io/bundlephobia/minzip/@jotter/position?style=flat-square)](https://bundlephobia.com/package/@jotter/position)
[![languages](https://img.shields.io/github/languages/top/meqn/jotter?style=flat-square)](https://github.com/Meqn/jotter/blob/main/libs/position)
[![license](https://img.shields.io/npm/l/@jotter/position?style=flat-square)](https://github.com/Meqn/jotter/blob/main/libs/position)


> Positioning a DOM element relative to another DOM element.

`position` 提供了一组简单的方法，轻松的将一个DOM元素相对于另一个DOM元素进行定位操作。


## Install
**npm**
```
npm install @jotter/position
```
**browser**
```
https://cdn.jsdelivr.net/npm/@jotter/position/dist/index.min.js
```


## Usage

[Online Demo](https://codepen.io/mengqing/pen/oNVOZop)

```js
import position from '@jotter/position'

position('#nav', '#nav-popup', {
  placement: 'right',
  offsetX: 12,
  marginTop: 20,
  marginBottom: 20
})
```

## API

```js
position(element, referenceElement, options)

//设置元素水平位置
position.setX(element, referenceElement, options)

// 设置元素垂直位置
position.setY(element, referenceElement, options)
```

### element
定位目标元素,可以是 DOM 对象或者选择器字符串

- `Type`: `string | HTMLElement`


### referenceElement
相对定位的参考元素,可以是 DOM 对象或者选择器字符串

- `Type`: `string | HTMLElement`


### options
配置选项

#### placement
相对参照元素的定位位置

- `Type`: `'auto' | 'top' | 'right' | 'bottom' | 'left'`
- `Default`: `'auto'`


#### offsetX
相对参照元素垂直偏移量

- `Type`: `number`
- `Default`: `0`

水平方向为 `auto` 时，正数表示向右偏移，负数表示向左偏移；否则取绝对值


#### offsetY
定位元素与视窗顶部间距

- `Type`: `number`
- `Default`: `0`

垂直方向为 `auto` 时，正数表示向下偏移，负数表示向上偏移；否则取绝对值


#### position
目标元素的固定位置

- `Type`: `{ top?: number, right?: number, bottom?: number, left?: number }`
- `Default`: `{}`


#### marginTop
定位元素与视窗顶部间距

- `Type`: `number`
- `Default`: `0`


#### marginBottom
定位元素与视窗底部间距
- `Type`: `number`
- `Default`: `0`


#### marginLeft
定位元素与视窗左侧间距
- `Type`: `number`
- `Default`: `0`


#### marginRight
定位元素与视窗右侧间距
- `Type`: `number`
- `Default`: `0`


