# dom-event-emit

[![version](https://img.shields.io/npm/v/dom-event-emit?style=flat-square)](https://www.npmjs.com/package/dom-event-emit)
[![codecov](https://codecov.io/gh/Marinerer/jotter/graph/badge.svg?token=G7QXEHCEXW)](https://codecov.io/gh/Marinerer/jotter)
[![downloads](https://img.shields.io/npm/dm/dom-event-emit?style=flat-square)](https://www.npmjs.com/package/dom-event-emit)
[![size](https://img.shields.io/bundlephobia/minzip/dom-event-emit?style=flat-square)](https://bundlephobia.com/package/dom-event-emit)
![browser](https://img.shields.io/badge/Browser-IE9-brightgreen?style=flat-square)
[![license](https://img.shields.io/npm/l/dom-event-emit?style=flat-square)](https://github.com/Marinerer/jotter/blob/main/libs/domEmit)

A type-safe, flexible DOM event emitter for browser environments. It has the same event API as DOM elements.

适用于浏览器环境的 DOM 事件触发器，拥有和DOM元素相同的事件API。

## Installation

```bash
npm install dom-event-emit
```

## Quick Start

```typescript
import DomEmitter from 'dom-event-emit'

// Define your event types
interface MyEvents {
	'user:login': { userId: string; timestamp: number }
	'user:logout': void
}

// Create an instance
const events = new DomEmitter<MyEvents>()

// Add event listener
events.on('user:login', (event) => {
	console.log(`User logged in: ${event.detail.userId}`)
})

// Emit event
events.emit('user:login', { userId: '123', timestamp: Date.now() })
```

## API

### Constructor

```typescript
constructor(target?: HTMLElement)
```

Creates a new DomEmitter instance.

- `target` (optional): HTMLElement to attach events to. If not provided, creates a virtual element.

### Methods

#### `addEventListener` / `on`

```typescript
addEventListener<K extends keyof T>(
  type: K,
  listener: EventListener,
  options?: boolean | AddEventListenerOptions
): this
```

Adds an event listener.

- `type`: Event type
- `listener`: Event handler function
- `options`: DOM event options (optional)

#### `removeEventListener` / `off`

```typescript
removeEventListener<K extends keyof T>(
	type: K,
	listener: CustomEventListener,
	options?: boolean | EventListenerOptions
): this
```

Removes an event listener.

#### `once`

```typescript
once<K extends keyof T>(
	type: K,
	listener: CustomEventListener,
	options?: boolean | EventListenerOptions
): this
```

Adds a one-time event listener.

#### `dispatchEvent`

```typescript
dispatchEvent<K extends keyof T>(event: Event, data?: Partial<T[K]>): boolean
```

Dispatches a raw DOM event.

#### `emit`

```typescript
emit<K extends keyof T>(
	type: K,
	detail?: any,
	data?: Partial<T[K]>
): boolean
```

- `type`: Event type
- `detail`: Event detail data
- `data`: Additional event data (optional)

Emits an event with optional data.

> 🚨 It also trigger events bind by assigning `on + type` to the instance.

#### `has`

```typescript
has(type: string, includeOn = false): boolean
```

Checks if an event type has any listeners.

#### `size`

```typescript
size(type: string, includeOn = false): number
```

Gets the number of listeners for an event type.

#### `clear`

```typescript
clear(type?: string): void
```

Clears all listeners for a specific event type or all events.

#### `destroy`

```typescript
destroy(): void
```

Destroys the instance and removes all listeners.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a [Pull Request](https://github.com/Marinerer/jotter/pulls).
