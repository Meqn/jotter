# Animator

Animator 是一个动画播放控制器。它提供了播放控制、进度控制、速率控制等功能，可以方便地创建和控制JavaScript动画。


## Features

- 播放控制 - 开始、暂停、停止
- 进度控制 - 获取和设置动画进度
- 速率控制 - 获取和设置播放速率
- 循环播放 - 支持设置循环播放
- 时间控制 - 前进、回退指定时间
- 自定义动画 - 通过 render 函数定制每一帧动画


## Install

**npm**
```
npm install @jotter/animator
```
**browser**
```
https://cdn.jsdelivr.net/npm/@jotter/animator/dist/index.global.js
```

## Usage

[Live]()

```js
const animator = new Animator({
  duration: 1000,
  timing: t => Math.pow(t, 2),
  render: (progress) => {}
})

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

### Options
- `duration` - 动画的总时长, 默认 `1000ms`
- `timing` - 时序函数, 默认匀速播放
- `render` - 每一帧执行的渲染函数
  - 参数: `progress` 当前播放进度 (0-1)
- `rate` - 播放速率,默认 `1`
- `loop` - 是否循环播放, 默认 `false`

### Properties
- `progress` - 获取当前播放进度 (0-1)
- `rate` - 获取当前播放速率
- `loop` - 获取是否循环播放

### Methods
- `start()` - 开始播放
- `play()` - 继续播放
- `pause()` - 暂停播放
- `stop()` - 停止播放
- `setProgress(progress)` - 设置播放进度
  - 参数: `progress`  - 动画的目标进度（0-1）
- `forward(time)` - 快进指定时间
  - 参数: `time`  - 前进的时间（单位：`ms`）
- `backward(time)` - 快退指定时间
  - 参数: `time` - 后退的时间（单位：`ms`）
- `setRate(rate)` - 设置播放速率
- `setLoop(loop)` - 设置是否循环播放

