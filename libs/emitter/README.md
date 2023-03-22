# EventEmitter

[![version](https://img.shields.io/npm/v/@jotter/emitter?style=flat-square)](https://www.npmjs.com/package/@jotter/emitter)
[![download](https://img.shields.io/npm/dm/@jotter/emitter?style=flat-square)](https://www.npmjs.com/package/@jotter/emitter)
[![license](https://img.shields.io/npm/l/@jotter/emitter?style=flat-square)](https://github.com/Meqn/jotter/tree/main/libs/emitter)

Simple and modern event emitter library.



## Install

**npm**
```
npm install @jotter/emitter
```
**browser**
```
https://cdn.jsdelivr.net/npm/@jotter/emitter/dist/index.umd.js
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

emitter.once('message', function(data) {
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
Subscribe to an event only once
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
Unsubscribe from an event type. If no listener are provided, it cancels all listeners on that event type.
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
Get all listeners of the subscribed event type
- `type` - the name of the event to unsubscribe from

### size
```typescript
size(type?: string | symbol | '*'): number;
```
Get the number of listeners for the specified event type.
- `type` - The event type to get the number of listeners for.

### has
```typescript
has(type: string | symbol): boolean;
```
Check the subscribed event type has listener.
- `type` - the name of the event to unsubscribe from


## Thanks
[mitt](https://github.com/developit/mitt) ,  [tiny-emitter](https://github.com/scottcorgan/tiny-emitter) ,  [pico-emitter](https://github.com/hkk12369/pico-emitter) ,  [emittery](https://github.com/sindresorhus/emittery)
