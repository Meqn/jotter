# Jotter
Document some lightweight front-end libraries (wheel building). The main features is "simple, universal, no dependence".

记录一些轻量级的前端库 (造轮子)。👉 主打的就是一个 "简洁、通用、无依赖"。

全部来自工作中开发的源码，非常适合简单的项目。



## Why?
为什么会存在这个库呢？
> 😄 高情商：分享、学习、乐趣。  
> 😨 低情商：无聊。为了挤压游戏时间，因为”不仅菜，还爱玩“。



## Packages

| Package                                                      | Status                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [@jotter/emitter](https://github.com/Meqn/jotter/tree/main/libs/emitter) | Simple and modern event emitter library. |
| [@jotter/websocket](https://github.com/Meqn/jotter/tree/main/libs/websocket) | Modern and useful WebSocket wrapper, with standard WebSocket API. |
| [@jotter/drag](https://github.com/Meqn/jotter/tree/main/libs/drag) | Lightweight "drag-and-drop" library of draggable elements within a specified range. |
| [@jotter/dateformat](https://github.com/Meqn/jotter/tree/main/libs/dateFormat) | a date/time formatting function. |
| [@jotter/from-now](https://github.com/Meqn/jotter/tree/main/libs/fromNow) | a relative time formatting functions. |



### @jotter/emitter
一个功能丰富的事件订阅/发布库，方便您在应用程序中实现事件的订阅、发布和取消订阅。


### @jotter/websocket
标准且有用的WebSocket包装器（使用标准的`WebSocket API`）。具有心跳检测，异常消息处理和自动重连机制。

**Feature :**
* 🕰 拥有和`WebSocket`相同的API和调用方式;
* ⚙️ 完全可配置;
* 🧬 异常情况下断开自动重连，可自定义重连规则;
* 📮 消息缓冲（在连接成功时发送累积消息）;
* 💗 内置心跳检测方法，始终处于保活状态。


### @jotter/drag
一个轻量级的拖拽库，允许你快速创建在指定范围内可拖动的元素。


### @jotter/dateformat
轻巧易用的日期/时间格式化函数。根据传入的占位符返回格式化后的日期/时间。


### @jotter/from-now
灵活且可自定义的相对时间格式化函数。  
您可以通过自定义格式化中使用的语言和阈值，生成合适的相对时间方式显示。




---



## Publish

发布 npm Scoped 包

```bash
# 设置 scope
npm init --scope=@jotter

# 发布公共范围模块
npm publish --access public
```
