# WebSocket

[ [English](./README.md) | [中文](./README.zh_CN.md) ]

[![version](https://img.shields.io/npm/v/@jotter/websocket?style=flat-square)](https://www.npmjs.com/package/@jotter/websocket)
[![download](https://img.shields.io/npm/dm/@jotter/websocket?style=flat-square)](https://www.npmjs.com/package/@jotter/websocket)
[![license](https://img.shields.io/npm/l/@jotter/websocket?style=flat-square)](https://github.com/Meqn/jotter/tree/main/libs/websocket)
![suppert](https://img.shields.io/badge/Support-ES2015-brightgreen?style=flat-square)

标准且有用的WebSocket包装器（使用标准的`WebSocket API`）。具有心跳检测，异常消息处理和自动重连机制。



## Feature
* 🕰 拥有和`WebSocket`相同的API和调用方式;
* ⚙️ 完全可配置;
* 🧬 异常情况下断开自动重连，可自定义重连规则;
* 📮 消息缓冲（在连接成功时发送累积消息）;
* 💗 内置心跳检测方法，始终处于保活状态。

## Install

**npm**
```
npm install @jotter/websocket
```
**browser**
```
https://cdn.jsdelivr.net/npm/@jotter/websocket/dist/index.global.js
```



## Usage

完全兼容 `WebSocket` 浏览器API，具体用法可参考: [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

```js
import WebSocketConnect from '@jotter/websocket'

const socket = new WebSocketConnect('ws://127.0.0.1/ws', {
  // 实例化后立即连接
  autoOpen: true,
  // 异常断开后自动重连
  shouldReconnect(event) {
    return ![1000, 1001, 1005].includes(event.code)
  },
  // 自动重连最大次数，超出后便不再重连
  maxReconnectAttempts: 20,
  // 默认关闭心跳检测
  ping: false
})

// socket.onclose
socket.onerror = function(err) {
  console.error(err.message)
}
socket.onopen = function(event) {
  // 手动开启心跳检测
  socket.send({ data: 'ping', token: 'xxxxxx' })
}
socket.onmessage = function(event) {
  // ...
}
// or
socket.addEventListener('message', function(event) {
  //
})

socket.close()
```

## API
```typescript
const socket = new WebSocketConnect(
  url: string,
  protocols?: string | string[],
  options?: Options
)
```

### url
连接websocket服务端的 URL.
- Type: `string`

### protocols
websocket连接协议.
- Type: `string | string[]`

## Options
WebSocket 连接选项

### autoOpen
是否在实例化时立即尝试连接.  
可调用`ws.open()`和`ws.close()`手动打开或关闭
- Type: `boolean`
- Default: `true`


### shouldReconnect
是否自动重连, 默认 code=[1000, 1001, 1005] 不会重连。  
你可以在`shouldReconnect(event, ctx)`中设定重新连接规则
- Type: `boolean | ((event: Event, context: any) => boolean)`
- Default: `true`

### maxReconnectAttempts
最大重连次数
- Type: `number`
- Default: `Infinity`

### reconnectInterval
尝试重新连接前延迟的毫秒数, 单位:ms
- Type: `number`
- Default: `1000`

### reconnectDecay
自动重连延迟连接速率，范围为 [0, 1]
- Type: `number`
- Default: `1`

### maxReconnectInterval
延迟重新连接的最大毫秒数, 单位:ms
- Type: `number`
- Default: `30000`

### autoSend
是否在连接成功后自动发送队列消息
- Type: `boolean`
- Default: `false`

### maxMessageQueue
队列消息的最大数量(不会保存重复消息)
- Type: `number`
- Default: `Infinity`

### ping
是否开启心跳监测, 若为`string`则为发送消息内容。  
可调用`ws.ping()`手动打开或关闭
- Type: `string | boolean`
- Default: `false`

### pingInterval
发送心跳检测的频率, 单位:ms
- Type: `number`
- Default: `5000`

### binaryType
websocket 连接所传输二进制数据的类型
- Type: `'blob' | 'arraybuffer'`
- Default: `'blob'`



## Events

### open
WebSocket 连接成功事件。
- `onopen(event: Event): void`

### message
WebSocket 接收消息事件。
- `onmessage(event: MessageEvent): void`

### error
WebSocket 连接错误事件。
- `onerror(event: ErrorEvent): void`

### close
WebSocket 连接关闭事件。
- `onclose(event: CloseEvent): void`

### reconnect
WebSocket 重连事件。
- `onreconnect(event: Event): void`
> `event.detail.count` 可获取当前重连次数

### reconnectend
WebSocket 重连结束事件.
- `onreconnectend(event: Event): void`



## Instance Methods

### open(reconnectAttempt?: boolean): void
打开 websocket连接
- `reconnectAttempt` - 是否为重连

### send(data: any): void;
发送消息
- `data` - 消息内容

### close(code?: number | string, reason?: string): void;
关闭 websocket 连接
- `code` - close状态码
- `reason` - close原因

### ping(message?: boolean | string | object): void;
心跳检测 keepAlive 💓  
在`Options`配置中自动开启或调用`ping()`方法手动开启或关闭.
- `message` - 是否开启心跳检测 或 心跳检测消息体

```js
// 关闭
socket.ping(false)
// 开启
socket.ping({ data: 'ping', token: 'xxxxxx' })
```



## Examples

> 配合事件监听器 EventEmitter 一起使用，体验更爽更丝滑。

根据实际情况简单封装一下：
```js
import WebSocketConnect from '@jotter/websocket'
import EventEmitter from '@jotter/emitter'

const socket = new WebSocketConnect('ws://127.0.0.1', null, {})
const emitter = new EventEmitter()

socket.onmessage = function(event) {
  const data = JSON.parse(event.data)
  // 正常处理...
  emitter.emit(data.type, data.result)
}

/**
 * socket请求和监听
 * @param {string | any} type 监听消息类型 或 发送数据
 * @param {any} data 发送数据
 * @param {function} listener 消息处理函数
 * @param {object} options 配置项, 支持监听事件处理一次 `{ once: true }`
 * @returns 
 */
// function request(data)
function request(type, data, listener, options = {}) {
  if (typeof listener === 'function') {
    addListener(type, listener, options)
  }
  // arguments.length=1, 则request仅支持send
  socket.send(arguments.length === 1 ? type : data)
  return { type, listener }
}

function addListener(type, listener, options = {}) {
  emitter[options.once ? 'once' : 'on'](type, listener)
  return { type, listener }
}
function removeListener(type, listener) {
  emitter.off(type, listener)
}

export {
  socket,
  emitter,
  request,
  addListener,
  removeListener
}
```

具体使用：

```js
// 发送设备实时位置消息，并监听返回数据
const deviceCoord = request('device_coord', { deviceId: 9527 }, function(result) {
  // data = { type: 'device_coord', result: { id: 9527, lng: '32.48547', lat: '12.34849' } }
  const coord = [result.lng, result.lat]
})

// 仅发送消息
request({ device: 9527 })

// 移除设备定位监听
removeListener('device_coord', deviceCoord.listener)
```


## refs
- [pladaria/reconnecting-websocket](https://github.com/pladaria/reconnecting-websocket/)
- [joewalnes/reconnecting-websocket](https://github.com/joewalnes/reconnecting-websocket)
- [lukeed/sockette](https://github.com/lukeed/sockette/)
