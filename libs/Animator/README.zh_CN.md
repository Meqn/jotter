# Animator

[![version](https://img.shields.io/npm/v/@jotter/animator?style=flat-square)](https://www.npmjs.com/package/@jotter/animator)
[![downloads](https://img.shields.io/npm/dm/@jotter/animator?style=flat-square)](https://www.npmjs.com/package/@jotter/animator)
[![size](https://img.shields.io/bundlephobia/minzip/@jotter/animator?style=flat-square)](https://bundlephobia.com/package/@jotter/animator)
[![languages](https://img.shields.io/github/languages/top/meqn/jotter?style=flat-square)](https://github.com/Meqn/jotter/blob/main/libs/Animator)
[![license](https://img.shields.io/npm/l/@jotter/animator?style=flat-square)](https://github.com/Meqn/jotter/blob/main/libs/Animator)

[ [English](README.md) | [中文](README.zh_CN.md) ]

一个轻量级的动画控制库，用于管理基于时间的动画进度。


## Features

- ⏯ 播放控制 - 开始、暂停、停止
- 🔄 循环播放 - 支持循环播放
- 🚥 进度控制 - 可设置动画进度
- 🚌 速率控制 - 可调节播放速率
- ⏱ 时间控制 - 支持前进/后退时间
- 🎯 自定义动画 - 精确每一帧动画

## Installation

**npm**
```bash
npm install @jotter/animator
```
**browser**
```
https://cdn.jsdelivr.net/npm/@jotter/animator/dist/index.min.js
```

## Usage

```typescript
import Animator from '@jotter/animator';

// 创建动画实例
const animator = new Animator({
  // 动画持续时间（毫秒）
  duration: 1000,
  // 渲染回调函数，progress 范围 0-1
  render: (progress) => {
    const element = document.querySelector('.animated-element');
    element.style.transform = `translateX(${progress * 100}px)`;
  }
});

// 播放动画
animator.play()
// 暂停
animator.pause()
// 跳转到 50%
animator.setProgress(0.5)
// 2倍速率播放
animator.setRate(2)
// 前进 1秒
animator.forward(1000)
// 后退 1秒
animator.backward(1000)
```

## API

```js
new Animator(options: AnimatorOptions)
```

### Options

配置选项：

```typescript
interface AnimatorOptions {
  /** 动画持续时间(ms)，默认 1000 */
  duration?: number;
  
  /** 时序函数，用于控制动画进度曲线，默认为线性 */
  timing?: (t: number) => number;
  
  /** 渲染函数，接收当前进度（0-1）作为参数 */
  render?: (progress: number) => void;
  
  /** 播放速率，默认 1 */
  rate?: number;
  
  /** 是否循环播放，默认 false */
  loop?: boolean;
}
```

### Methods

#### 控制方法

- `start(): void`
  - 从头开始播放动画
  - 会重置当前进度为 0

- `play(): void`
  - 播放动画
  - 如果动画已暂停，则从当前进度继续播放
  - 如果动画未初始化，则从头开始播放

- `pause(): void`
  - 暂停动画
  - 保持当前进度

- `stop(): void`
  - 停止动画
  - 重置进度为 0

- `forward(time: number): void`
  - 向前调整指定时间（毫秒）
  - 暂停状态下也会触发渲染

- `backward(time: number): void`
  - 向后调整指定时间（毫秒）
  - 暂停状态下也会触发渲染

#### 属性

- `duration: number`（只读）
  - 获取动画持续时间

- `rate: number`（读写）
  - 获取/设置播放速率
  - `setRate(rate: number): void`

- `loop: boolean`（读写）
  - 获取/设置是否循环播放
  - `setLoop(enable: boolean): void`

- `progress: number`（读写）
  - 获取/设置当前动画进度（0-1）
  - `setProgress(progress: number): void`

## 注意事项

1. 时序函数的输入和输出都应该在 `0-1` 范围内
2. 在组件卸载时记得调用 `stop()` 方法清理动画
3. 播放速率不要设置过大或过小，建议范围 `0.1-10`
4. 暂停状态下调用 `forward/backward` 会触发一次渲染

## License

MIT