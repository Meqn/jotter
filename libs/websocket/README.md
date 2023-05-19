# WebSocket

[ [English](./README.md) | [中文](https://github.com/Meqn/jotter/blob/main/libs/websocket/README.zh_CN.md) ]

[![version](https://img.shields.io/npm/v/@jotter/websocket?style=flat-square)](https://www.npmjs.com/package/@jotter/websocket)
[![download](https://img.shields.io/npm/dm/@jotter/websocket?style=flat-square)](https://www.npmjs.com/package/@jotter/websocket)
[![license](https://img.shields.io/npm/l/@jotter/websocket?style=flat-square)](https://github.com/Meqn/jotter/tree/main/libs/websocket)
![suppert](https://img.shields.io/badge/Support-ES2015-brightgreen?style=flat-square)

Modern and useful WebSocket wrapper, with standard WebSocket API. Supports keep alive, exception message handling and reconnection.  



## Feature
* 🕰 Has the same API and call method as `WebSocket`;
* ⚙️ Fully configurable;
* 🧬 Automatic reconnection in case of abnormal disconnection, with customizable reconnection rules;
* 📮 Message buffer (accumulated messages are sent when the connection is successful);
* 💗 Built-in heartbeat detection method, always in a keep-alive state.



## Install

**npm**
```
npm install @jotter/websocket
```
**browser**
```
https://cdn.jsdelivr.net/npm/@jotter/websocket/dist/index.umd.js
```



## Usage
Fully compatible with the `WebSocket` browser API, for specific usage, please refer to: [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

```js
import WebSocketConnect from '@jotter/websocket'

const socket = new WebSocketConnect('ws://127.0.0.1/ws', {
  // Connect immediately after instantiation
  automaticOpen: true,
  // Automatically reconnect after abnormal disconnection
  shouldReconnect(event) {
    return ![1000, 1001, 1005].includes(event.code)
  },
  // Maximum number of automatic reconnections, no longer reconnected after exceeding
  maxReconnectAttempts: 20,
  // Heartbeat detection is turned off by default
  ping: false
})

// socket.onclose
socket.onerror = function(err) {
  console.error(err.message)
}
socket.onopen = function(event) {
  // Manually start heartbeat detection
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
WebSocket connection Url.
- Type: `string`

### protocols
WebSocket connection protocol.
- Type: `string | string[]`

## Options
WebSocket connection options.

### automaticOpen
Whether to attempt to connect immediately upon instantiation.  
You can manually open or close by calling `ws.open()` and `ws.close()`.
- Type: `boolean`
- Default: `true`


### shouldReconnect
Whether to automatically reconnect. By default, it will not reconnect for codes `[1000, 1001, 1005]`.  
You can set the reconnection rules in `shouldReconnect(event, ctx)`.
- Type: `boolean | ((event: Event, context: any) => boolean)`
- Default: `true`

### maxReconnectAttempts
Maximum number of reconnections
- Type: `number`
- Default: `Infinity`

### reconnectInterval
The number of milliseconds to delay before attempting to reconnect. Unit: `ms`.
- Type: `number`
- Default: `1000`

### reconnectDecay
The rate at which the automatic reconnection delay increases, ranging from `[0, 1]`.
- Type: `number`
- Default: `1`

### maxReconnectInterval
The maximum number of milliseconds to delay before attempting to reconnect. Unit: `ms`.
- Type: `number`
- Default: `30000`

### autoSend
Whether to automatically send queued messages after a successful connection.
- Type: `boolean`
- Default: `false`

### maxMessageQueue
Maximum number of queued messages (No duplicate messages are saved).
- Type: `number`
- Default: `Infinity`

### ping
Whether to enable heartbeat monitoring, if `string` then to send the message.  
You can manually open or close by calling `ws.ping()`.
- Type: `string | boolean`
- Default: `false`

### pingInterval
Frequency of sending heartbeat detection. Unit: `ms`.
- Type: `number`
- Default: `5000`

### binaryType
The type of binary data transmitted by the WebSocket connection.
- Type: `'blob' | 'arraybuffer'`
- Default: `'blob'`



## Events

### open
WebSocket connection successful event.
- `onopen(event: Event): void`

### message
WebSocket message received event.
- `onmessage(event: MessageEvent): void`

### error
WebSocket connection error event.
- `onerror(event: ErrorEvent): void`

### close
WebSocket connection closed event.
- `onclose(event: CloseEvent): void`

### reconnect
WebSocket reconnection event.
- `onreconnect(event: Event): void`
> `event.detail.count` 可获取当前重连次数

### reconnectend
WebSocket reconnection end event.
- `onreconnectend(event: Event): void`



## Instance Methods

### open(reconnectAttempt?: boolean): void
Open the WebSocket connection.
- `reconnectAttempt` - Whether it is a reconnection.

### send(data: any): void;
Send a message.
- `data` - Message content.

### close(code?: number | string, reason?: string): void;
Close the WebSocket connection.
- `code` - Close status code.
- `reason` - Close reason.

### ping(message?: boolean | string | object): void;
Heartbeat detection. 💓  
Automatically enabled in the Options configuration or manually enabled or disabled by calling the `ping()` method.
- `message` - Whether to enable heartbeat detection or heartbeat detection message body.

```js
// Disable
socket.ping(false)
// Enable
socket.ping({ data: 'ping', token: 'xxxxxx' })
```



## Examples

> Use it with the event listener EventEmitter for a smoother experience.

Adjustment according to the actual situation:
```js
import WebSocketConnect from '@jotter/websocket'
import EventEmitter from '@jotter/emitter'

const socket = new WebSocketConnect('ws://127.0.0.1', null, {})
const emitter = new EventEmitter()

socket.onmessage = function(event) {
  const data = JSON.parse(event.data)
  // Normal processing...
  emitter.emit(data.type, data.result)
}

/**
 * Socket request and listener
 * @param {string | any} type Listening message type or sending data
 * @param {any} data Sending data
 * @param {function} listener Message processing function
 * @param {object} options Configuration item, supports listening event processing once `{ once: true }`
 * @returns 
 */
// function request(data)
function request(type, data, listener, options = {}) {
  if (typeof listener === 'function') {
    addListener(type, listener, options)
  }
  // arguments.length=1, then request only supports send
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

Specific usage:

```js
// Send device real-time location message and listen for return data
const deviceCoord = request('device_coord', { deviceId: 9527 }, function(result) {
  // data = { type: 'device_coord', result: { id: 9527, lng: '32.48547', lat: '12.34849' } }
  const coord = [result.lng, result.lat]
})

// Only send messages
request({ device: 9527 })

// Remove device location listener
removeListener('device_coord', deviceCoord.listener)
```



## refs
- [pladaria/reconnecting-websocket](https://github.com/pladaria/reconnecting-websocket/)
- [joewalnes/reconnecting-websocket](https://github.com/joewalnes/reconnecting-websocket)
- [lukeed/sockette](https://github.com/lukeed/sockette/)
