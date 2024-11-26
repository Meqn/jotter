# EventEmitter

[![version](https://img.shields.io/npm/v/@jotter/emitter?style=flat-square)](https://www.npmjs.com/package/@jotter/emitter)
[![codecov](https://codecov.io/gh/Marinerer/jotter/graph/badge.svg?token=G7QXEHCEXW)](https://codecov.io/gh/Marinerer/jotter)
[![download](https://img.shields.io/npm/dm/@jotter/emitter?style=flat-square)](https://www.npmjs.com/package/@jotter/emitter)
[![license](https://img.shields.io/npm/l/@jotter/emitter?style=flat-square)](https://github.com/Marinerer/jotter/tree/main/libs/emitter)

Simple and modern event emitter library.

一个功能丰富的事件订阅/发布库，方便您在应用程序中实现事件的订阅、发布和取消订阅。

## Install

**npm**

```
npm install @jotter/emitter
```

**browser**

```
https://cdn.jsdelivr.net/npm/@jotter/emitter/dist/index.min.js
```

## Usage

```js
import EventEmitter from '@jotter/emitter'

const emitter = new EventEmitter()

function handleMessage(arg1, arg2) {
	// ...
	console.log('message 1: ', arg1, arg2)
}

emitter.on('message', handleMessage)

emitter.once('message', function (data) {
	console.log('message 2:', data)
})

emitter.emit('message', 'hello', 'world')
// message 1:  hello world
// message 2:  hello

emitter.off('message', handleMessage)
```

## API

**Instance Methods**

### on

```typescript
on(type: string | symbol, listener: Function, context?: any): this;
```

Subscribe to an event

- `type` - the name of the event to subscribe to
- `listener` - the function to call when event is emitted
- `context` - (OPTIONAL) - the context to bind the event callback to

### once

```typescript
once(type: string | symbol, listener: Function, context?: any): this;
```

Subscribe to an event only once.

- `type` - the name of the event to subscribe to
- `listener` - the function to call when event is emitted
- `context` - (OPTIONAL) - the context to bind the event callback to

### emit

```typescript
emit(type: string | symbol, ...args: any[]): this;
```

Trigger a named event

- `type` - the event name to emit
- `args` - any number of arguments to pass to the event subscribers

### off

```typescript
off(type: string | symbol, listener?: Function): this;
```

Unsubscribe from an event type.  
If no listener are provided, it cancels all listeners on that event type.

- `type` - the name of the event to unsubscribe from
- `listener` - the function used when binding to the event

### clear

```typescript
clear(type?: string | symbol): this;
```

Unsubscribe from an event or all events.

- `type` - the name of the event to unsubscribe from

### get

```typescript
get(type?: string | symbol | '*'): Set<EventHandler> | Map<string | symbol, Set<EventHandler>>;
```

Get all listeners of the subscribed event type.

- `type` - the name of the event to unsubscribe from.
  - If the type is `*`, return the handler for all subscribed event types.
  - If the type is empty, return the subscribed event Map.

### size

```typescript
size(type?: string | symbol | '*'): number;
```

Get the number of listeners for the specified event type.

- `type` - The event type to get the number of listeners for.
  - If the type is `*`, return the number of handlers for all subscribed event types.
  - If the type is empty, return the number of subscribed event types.

### has

```typescript
has(type: string | symbol): boolean;
```

Check the subscribed event type has listener.

- `type` - the name of the event to unsubscribe from

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a [Pull Request](https://github.com/Marinerer/jotter/pulls).
