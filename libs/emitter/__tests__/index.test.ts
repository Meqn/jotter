import EventEmitter from '../src/index'
import type { EventHandlerMap, EventHandlerList } from '../src/index'

describe('EventEmitter', () => {
  let emitter: EventEmitter<{[key: string]: any}>
  
  beforeEach(() => {
    emitter = new EventEmitter()
  })

  describe('on', () => {
    it('should add new event handler to the specified event type', () => {
      const handler = jest.fn()
      emitter.on('foo', handler)
      
      expect(emitter.size()).toBe(1) // 事件数量
      expect(emitter.size('foo')).toBe(1) // foo的监听器数量
      const handlers = Array.from((emitter.get('foo') as EventHandlerList) ?? []).map(item => item?.fn)
      expect(handlers.includes(handler)).toBe(true)
    })

    it('should throw a type error if the listener is not a function', () => {
      expect(() => emitter.on('foo', undefined as any)).toThrow(TypeError)
    })

    it('should return the instance of the EventEmitter', () => {
      expect(emitter.on('foo', jest.fn())).toBe(emitter)
    })
  })

  describe('off', () => {
    it('should remove the specified event handler from the specified event type', () => {
      const handler1 = jest.fn()
      const handler2 = jest.fn()
      emitter.on('foo', handler1)
      emitter.on('foo', handler2)
      expect(emitter.size('foo')).toBe(2)

      emitter.off('foo', handler1)
      expect(emitter.size('foo')).toBe(1)
      expect(emitter.has('foo')).toBe(true)

      const handlers = Array.from((emitter.get('foo') as EventHandlerList) ?? []).map(item => item?.fn)
      expect(handlers.includes(handler1)).toBe(false)
      expect(handlers.includes(handler2)).toBe(true)

      emitter.off('foo', handler2)
      expect(emitter.size('foo')).toBe(0)
      expect(emitter.has('foo')).toBe(false)
    })

    it('should remove all event handlers from the specified event type if no handler is provided', () => {
      const handler1 = jest.fn()
      const handler2 = jest.fn()
      const handler3 = jest.fn()
      emitter.on('foo', handler1)
      emitter.on('foo', handler2)
      emitter.on('bar', handler3)

      emitter.off('foo')
      expect(emitter.size('foo')).toBe(0)
      expect(emitter.has('foo')).toBe(false)

      expect(emitter.size('bar')).toBe(1)
      expect(emitter.has('bar')).toBe(true)
    })

    it('should return the instance of the EventEmitter', () => {
      expect(emitter.off('foo')).toBe(emitter)
    })
  })

  describe('once', () => {
    it('should add a one-time event handler to the specified event type', () => {
      const handler = jest.fn()
      emitter.once('foo', handler)
      emitter.emit('foo')

      expect(handler).toBeCalledTimes(1)
    })

    it('should remove the one-time event handler after it has been called', () => {
      const handler = jest.fn()
      emitter.once('foo', handler)
      expect(emitter.get('foo')?.size).toBe(1)

      emitter.emit('foo')
      expect(handler).toBeCalledTimes(1)

      expect(emitter.get('foo')?.size ?? 0).toBe(0)
    })

    it('should return the instance of the EventEmitter', () => {
      expect(emitter.once('foo', jest.fn())).toBe(emitter)
    })
  })

  describe('emit', () => {
    it('should call all event handlers for the specified event type', () => {
      const handler1 = jest.fn()
      const handler2 = jest.fn()
      emitter.on('foo', handler1)
      emitter.on('foo', handler2)

      emitter.emit('foo', 'bar')

      expect(handler1).toBeCalledWith('bar')
      expect(handler2).toBeCalledWith('bar')
    })

    it('should not throw an error if the specified type does not have an event handler', () => {
      expect(() => emitter.emit('foo')).not.toThrow()
    })

    it('should return the instance of the EventEmitter', () => {
      expect(emitter.emit('foo')).toBe(emitter)
    })
  })

  describe('clear', () => {
    it('should remove all event handlers from the specified event type', () => {
      const handler1 = jest.fn()
      const handler2 = jest.fn()
      emitter.on('foo', handler1)
      emitter.on('foo', handler2)
      expect(emitter.size('foo')).toBe(2)

      emitter.clear('foo')
      expect(emitter.size('foo')).toBe(0)
      expect(emitter.has('foo')).toBe(false)
    })

    it('should remove all event handlers from all event types if no type is specified', () => {
      const handler1 = jest.fn()
      const handler2 = jest.fn()
      emitter.on('foo', handler1)
      emitter.on('bar', handler2)
      expect(emitter.size()).toBe(2)

      emitter.clear()
      expect(emitter.size()).toBe(0)
      expect(emitter.has('foo')).toBe(false)
      expect(emitter.has('bar')).toBe(false)
    })

    it('should return the instance of the EventEmitter', () => {
      expect(emitter.clear('foo')).toBe(emitter)
    })
  })

  describe('get', () => {
    it('should return the Set of event handlers for the specified event type', () => {
      const handler = jest.fn()
      emitter.on('foo', handler)
      expect(emitter.get('foo')).toEqual(expect.any(Set))
      expect(emitter.get('foo')).toContainEqual({fn: handler, context: undefined})
    })

    it('should return the Map of all event types if no type is specified', () => {
      expect(emitter.get()).toEqual(expect.any(Map))
      expect((emitter.get() as EventHandlerMap<{[key: string]: any}>)?.has('foo')).toBe(false)

      const handler = jest.fn()
      emitter.on('foo', handler)
      expect((emitter.get() as EventHandlerMap<{[key: string]: any}>)?.has('foo')).toBe(true)
    })

    it('should return the Set of all event handlers if type is "*"', () => {
      const handler1 = jest.fn()
      const handler2 = jest.fn()
      emitter.on('foo', handler1)
      emitter.on('bar', handler2)
      expect(emitter.get('*')).toEqual(expect.any(Set))
      expect(emitter.get('*')).toContainEqual(({fn: handler1, context: undefined}))
      expect(emitter.get('*')).toContainEqual(({fn: handler2, context: undefined}))
    })
  })

  describe('size', () => {
    it('should return the size of the Set of event handlers for the specified event type', () => {
      const handler = jest.fn()
      emitter.on('foo', handler)
      expect(emitter.size('foo')).toBe(1)

      emitter.off('foo', handler)
      expect(emitter.size('foo')).toBe(0)
    })

    it('should return the number of event types if no type is specified', () => {
      const handler1 = jest.fn()
      const handler2 = jest.fn()
      emitter.on('foo', handler1)
      emitter.on('bar', handler2)
      expect(emitter.size()).toBe(2)
    })

    it('should return the sum of the sizes of all event types if type is "*"', () => {
      const handler1 = jest.fn()
      const handler2 = jest.fn()
      emitter.on('foo', handler1)
      emitter.on('bar', handler2)
      expect(emitter.size('*')).toBe(2)
    })
  })

  describe('has', () => {
    it('should return true if there are event handlers for the specified event type', () => {
      expect(emitter.has('foo')).toBe(false)

      const handler = jest.fn()
      emitter.on('foo', handler)
      expect(emitter.has('foo')).toBe(true)
    })

    it('should return false if there are no event handlers for the specified event type', () => {
      expect(emitter.has('foo')).toBe(false)
    })
  })
})
