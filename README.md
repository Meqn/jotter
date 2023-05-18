# Jotter

记录工作中常用的前端库 (造轮子)。简洁通用、轻量无依赖。

> 无聊、学习、分享、乐趣。



---



## Packages

| Package                                                      | Status                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [@jotter/emitter](https://github.com/Meqn/jotter/tree/main/libs/emitter) | [![version](https://img.shields.io/npm/v/@jotter/emitter?style=flat-square)](https://www.npmjs.com/package/@jotter/emitter) [![download](https://img.shields.io/npm/dm/@jotter/emitter?style=flat-square)](https://www.npmjs.com/package/@jotter/emitter) |
| [@jotter/websocket](https://github.com/Meqn/jotter/tree/main/libs/websocket) | [![version](https://img.shields.io/npm/v/@jotter/websocket?style=flat-square)](https://www.npmjs.com/package/@jotter/websocket) [![download](https://img.shields.io/npm/dm/@jotter/websocket?style=flat-square)](https://www.npmjs.com/package/@jotter/websocket) |



### @jotter/emitter
> Simple and modern event emitter library.  

一个功能丰富的事件订阅/发布库，方便您在应用程序中实现事件的订阅、发布和取消订阅。



### @jotter/websocket
> Modern and useful WebSocket wrapper, with standard WebSocket API. Supports keep alive, exception message handling and reconnection.  

标准且有用的WebSocket包装器（使用标准的`WebSocket API`）。具有心跳检测，异常消息处理和自动重连机制。

**Feature :**
* 🕰 拥有和`WebSocket`相同的API和调用方式;
* ⚙️ 完全可配置;
* 🧬 异常情况下断开自动重连，可自定义重连规则;
* 📮 消息缓冲（在连接成功时发送累积消息）;
* 💗 内置心跳检测方法，始终处于保活状态。



---



## Publish

发布 npm Scoped 包

```bash
# 设置 scope
npm init --scope=@jotter

# 发布公共范围模块
npm publish --access public
```

## README
- https://github.com/jest-community/jest-extended

## Repository
- https://github.com/antfu/vue-reuse-template
- https://github.com/vitest-dev/vitest

