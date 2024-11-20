# Animator

[![version](https://img.shields.io/npm/v/@jotter/animator?style=flat-square)](https://www.npmjs.com/package/@jotter/animator)
[![codecov](https://codecov.io/gh/Marinerer/jotter/graph/badge.svg?token=G7QXEHCEXW)](https://codecov.io/gh/Marinerer/jotter)
[![downloads](https://img.shields.io/npm/dm/@jotter/animator?style=flat-square)](https://www.npmjs.com/package/@jotter/animator)
[![size](https://img.shields.io/bundlephobia/minzip/@jotter/animator?style=flat-square)](https://bundlephobia.com/package/@jotter/animator)
[![license](https://img.shields.io/npm/l/@jotter/animator?style=flat-square)](https://github.com/Marinerer/jotter/blob/main/libs/Animator)

[ [English](README.md) | [中文](README.zh_CN.md) ]

A lightweight animation controller library for managing time-based animation progress.

## Features

- ⏯ Pause/Resume support
- 🔄 Loop animation support
- 🚥 Progress Control
- 🚌 Rate Control
- ⏱ Forward/Backward control
- 🎯 Custom Animation

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

// Create an animation instance
const animator = new Animator({
  // Animation duration in milliseconds
  duration: 1000,
  // Render callback function, progress ranges from 0 to 1
  render: (progress) => {
    const element = document.querySelector('.animated-element');
    element.style.transform = `translateX(${progress * 100}px)`;
  }
});

// Start the animation
animator.start();
```

## API

### Options

Configuration options available when creating an Animator instance:

```typescript
interface AnimatorOptions {
  /** Animation duration in milliseconds, default: 1000 */
  duration?: number;
  
  /** Timing function for controlling animation progress curve, default: linear */
  timing?: (t: number) => number;
  
  /** Render function, receives current progress (0-1) as parameter */
  render?: (progress: number) => void;
  
  /** Playback rate, default: 1 */
  rate?: number;
  
  /** Enable loop playback, default: false */
  loop?: boolean;
}
```

### Methods

#### Control Methods

- `start(): void`
  - Starts the animation from the beginning
  - Resets current progress to 0

- `play(): void`
  - Plays the animation
  - Continues from current progress if paused
  - Starts from beginning if not initialized

- `pause(): void`
  - Pauses the animation
  - Maintains current progress

- `stop(): void`
  - Stops the animation
  - Resets progress to 0

- `forward(time: number): void`
  - Advances animation by specified time (milliseconds)
  - Triggers render even when paused

- `backward(time: number): void`
  - Rewinds animation by specified time (milliseconds)
  - Triggers render even when paused

#### Properties

- `duration: number` (readonly)
  - Gets animation duration

- `rate: number` (read/write)
  - Gets/Sets playback rate
  - `setRate(rate: number): void`

- `loop: boolean` (read/write)
  - Gets/Sets loop playback state
  - `setLoop(enable: boolean): void`

- `progress: number` (read/write)
  - Gets/Sets current animation progress (0-1)
  - `setProgress(progress: number): void`

## License

MIT