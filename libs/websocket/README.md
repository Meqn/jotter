# WebSocketConnect

[![version][npm-image]][npm-url]
[![CI status][github-action-image]][github-action-url]
[![codecov][codecov-image]][codecov-url]
[![downloads][downloads-image]][npm-url]
[![size][bundlephobia-image]][bundlephobia-url]
[![browsers](https://img.shields.io/badge/Browser-IE10-brightgreen?style=flat-square)][github-url]

[github-url]: https://github.com/Marinerer/jotter/blob/main/libs/websocket
[npm-url]: https://www.npmjs.com/package/@jotter/websocket
[npm-image]: https://img.shields.io/npm/v/@jotter/websocket?style=flat-square
[github-action-image]: https://img.shields.io/github/actions/workflow/status/Marinerer/jotter/release.yml?style=flat-square
[github-action-url]: https://github.com/Marinerer/jotter/actions/workflows/release.yml
[codecov-image]: https://codecov.io/gh/Marinerer/jotter/graph/badge.svg?token=G7QXEHCEXW
[codecov-url]: https://codecov.io/gh/Marinerer/jotter
[downloads-image]: https://img.shields.io/npm/dm/@jotter/websocket?style=flat-square
[bundlephobia-image]: https://img.shields.io/bundlephobia/minzip/@jotter/websocket?style=flat-square
[bundlephobia-url]: https://bundlephobia.com/package/@jotter/websocket

Modern and useful WebSocket API wrapper class with additional features such as auto-reconnect, message queuing and Keep-alive detection.

标准且实用的 WebSocket 包装器，具有标准 `WebSocket API`。支持心跳检测，异常消息处理和自动重连机制。

## Features

- ⏰ With Standard WebSocket API
- 🧬 Automatic Reconnection
- 💓 Keep-alive (Ping) Support
- 📮 Message Queuing
- 🌐 Flexible Configuration

## Installation

**npm**

```
npm install @jotter/websocket
```

**browser**

```
https://cdn.jsdelivr.net/npm/@jotter/websocket/dist/index.min.js
```

## Usage

Fully compatible with the `WebSocket` API, for specific usage, please refer to: [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

**Basic:**

```typescript
import WebSocketConnect from '@jotter/websocket'

// Basic WebSocket connection
const ws = new WebSocketConnect('wss://example.com/')

// Event listeners
ws.addEventListener('open', (event) => {
	console.log('Connection established')
	ws.send('Hello, server!')
})

ws.onmessage = (event) => {
	console.log('Received message:', event.data)
}

// Send text
ws.send('Hello, world!')

// Send JSON
ws.send({ type: 'message', content: 'Hello' })

// Send binary data
ws.send(new ArrayBuffer(8))
```

**Advanced:**

```typescript
const ws = new WebSocketConnect('wss://example.com/', {
	// Reconnection options
	reconnect: {
		enabled: true,
		maxAttempts: 5,
		delay: (attempt) => Math.min(2000 * Math.pow(1.2, attempt), 30000),
	},

	// Ping (Keep-alive) options
	ping: {
		enabled: true,
		interval: 3000,
		message: 'ping',
	},

	// Message queue options
	messageQueue: 100,

	// Optional WebSocket protocols
	protocols: ['chat', 'json'],
})
```

## API

### Constructor

```typescript
new WebSocketConnect(
  url: string,
  protocols?: string | string[],
  options?: IOptions
)
```

### url

WebSocket connection Url.

- Type: `string`

### protocols

WebSocket connection protocol.

- Type: `string | string[]`

### Options

WebSocket connection options.

```typescript
interface WebSocketConnectOptions {
	// Reconnection configuration
	reconnect?:
		| boolean
		| {
				enabled?: boolean
				maxAttempts?: number
				delay?: number | ((attempt: number) => number)
				shouldReconnect?: (event: CloseEvent, context: any) => boolean
		  }

	// Keep-alive (Ping) configuration
	ping?:
		| boolean
		| {
				enabled?: boolean
				interval?: number
				message?: any
		  }

	// Message queue configuration (Storing Unsent Messages)
	messageQueue?:
		| boolean
		| number
		| {
				enabled?: boolean
				max?: number
		  }

	// WebSocket protocols
	protocols?: string | string[]
}
```

#### reconnect

Reconnection configuration.

| prop            | type                        | default | description                             |
| --------------- | --------------------------- | ------- | --------------------------------------- |
| enabled         | boolean                     | true    | Whether to automatically reconnect      |
| maxAttempts     | number \| (attempt)=>number | 10      | Maximum number of reconnection attempts |
| delay           | number                      | 1000    | Reconnection delay (ms)                 |
| shouldReconnect | (event, ctx) => boolean     |         | User-defined reconnection rules         |

#### ping

Keep-alive (Ping) configuration.

| prop     | type    | default | description                       |
| -------- | ------- | ------- | --------------------------------- |
| enabled  | boolean | true    | Whether to send keep-alive (Ping) |
| interval | number  | 30000   | Keep-alive (Ping) interval (ms)   |
| message  | any     | 'ping'  | Keep-alive (Ping) message         |

#### messageQueue

Message queue configuration. (Accumulated unsent-messages are sent when the connection is successful)

| prop    | type    | default | description                             |
| ------- | ------- | ------- | --------------------------------------- |
| enabled | boolean | true    | Whether to enable message queue         |
| max     | number  | 100     | Maximum number of messages in the queue |

### Methods

- `send(data: any)`: Send a message
- `close(code?: number, reason?: string)`: Close the connection

### Events

- `open`: Connection established
- `close`: Connection closed
- `message`: Message received
- `error`: Connection error
- `reconnect`: Reconnection attempt
- `reconnectend`: Reconnection attempts ended

### Properties

- `url`: WebSocket URL
- `readyState`: Current connection state
- `protocol`: Negotiated protocol
- `bufferedAmount`: Number of bytes queued
- `binaryType`: Binary data type
- `extensions`: Negotiated extensions

## Browser Compatibility

Supports all modern browsers with WebSocket API support.

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a [Pull Request](https://github.com/Marinerer/jotter/pulls).
