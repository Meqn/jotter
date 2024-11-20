# Jotter

> Document some lightweight front-end libraries (wheel building). The main features is "simple, universal, no dependence".

记录一些轻量级的前端库 (造轮子)。👉 主打 "简洁、通用、无依赖"。

全部来自工作中开发的源码，非常适合项目中实现一些简单功能。

## Packages

| Package                                                                             | Status                                                                              |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [@jotter/animator](https://github.com/Marinerer/jotter/tree/main/libs/animator)     | Animator is an animation playback controller.                                       |
| [@jotter/drag](https://github.com/Marinerer/jotter/tree/main/libs/drag)             | Lightweight "drag-and-drop" library of draggable elements within a specified range. |
| [@jotter/emitter](https://github.com/Marinerer/jotter/tree/main/libs/emitter)       | Simple and modern event emitter library.                                            |
| [@jotter/websocket](https://github.com/Marinerer/jotter/tree/main/libs/websocket)   | Modern and useful WebSocket wrapper, with standard WebSocket API.                   |
| [@jotter/dateformat](https://github.com/Marinerer/jotter/tree/main/libs/dateFormat) | a date/time formatting function.                                                    |
| [@jotter/from-now](https://github.com/Marinerer/jotter/tree/main/libs/fromNow)      | a relative time formatting functions.                                               |
| [@jotter/position](https://github.com/Marinerer/jotter/tree/main/libs/position)     | Positioning a DOM element relative to another DOM element.                          |

### @jotter/animator

Animator 是一个动画播放控制器。它提供了播放控制、进度控制、速率控制等功能，可以方便地创建和控制JavaScript动画。

### @jotter/drag

一个轻量级的拖拽库，允许你快速创建在指定范围内可拖动的元素。

### @jotter/emitter

一个功能丰富的事件订阅/发布库，方便您在应用程序中实现事件的订阅、发布和取消订阅。

### @jotter/websocket

标准且有用的WebSocket包装器（使用标准的`WebSocket API`）。具有心跳检测，异常消息处理和自动重连机制。

**Feature :**

- 🕰 拥有和`WebSocket`相同的API和调用方式;
- ⚙️ 完全可配置;
- 🧬 异常情况下断开自动重连，可自定义重连规则;
- 📮 消息缓冲（在连接成功时发送累积消息）;
- 💗 内置心跳检测方法，始终处于保活状态。

### @jotter/dateformat

轻巧易用的日期/时间格式化函数。根据传入的占位符返回格式化后的日期/时间。

### @jotter/from-now

灵活且可自定义的相对时间格式化函数。  
您可以通过自定义格式化中使用的语言和阈值，生成合适的相对时间方式显示。

### @jotter/from-now

`position` 提供了一组简单的方法，轻松的将一个DOM元素相对于另一个DOM元素进行定位操作。
