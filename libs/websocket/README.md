# WebSocket

简单通用的WebSocket包装器。具有心跳检测和自动重连的机制。

> 配合事件监听器一起使用更合适。

## Feature
1. 和`WebSocket`拥有相同的API和调用方式
2. 支持异常情况下断开自动重连，可自定义
3. 支持消息发送失败后可重新发送
4. 内置心跳检测方法，始终处于保活状态

## Install

```
npm install @jotter/websocket
```

## Usage

```js
import WebSocketConnect from '@jotter/websocket'
// import { WebSocketConnect } from '@jotter/websocket'
```

## API
```typescript
new WebSocketConnect(
  url: string,
  protocols?: string | string[],
  options?: Options
)
```

### Options

#### url

#### protocols

#### automaticOpen

#### shouldReconnect
开启重新连接规则

#### maxReconnectAttempts
尝试重新连接最大次数, 默认无限次

#### reconnectInterval
延迟重新连接尝试的最大毫秒数。默认值：30000

#### reconnectDecay
自动重连延迟重连速度, [0 - 1 之间], 默认值 1

#### maxReconnectInterval
延迟重新连接尝试的最大毫秒数。接受整数。默认值：30000。


#### autoSend
开启自动发送待发消息


#### maxMessageQueue
保存待发送消息最大个数


#### ping
启用心跳监测标记 [boolean | string], 若为string则为发送消息


#### pingInterval
发送心跳频率


#### binaryType
传输二进制数据的类型 ['blob', 'arraybuffer'], 默认值为'blob'


## Methods

### open

### close

### reconnect



## Events

### close

### error

### message

### open

### reconnect

### reconnectend
