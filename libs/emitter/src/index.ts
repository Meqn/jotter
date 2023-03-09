export type EventType = string | symbol
export interface EventHandler {
  (...args: any[]): void
  _?: EventHandler
}
export interface EventHandlerItem {
  context?: any,
  fn: EventHandler
}
export type EventHandlerList = Set<EventHandlerItem>
export type EventHandlerMap<Events> = Map<keyof Events, EventHandlerList>

export default class EventEmitter<Events extends Record<EventType, unknown>> {
  private _events: EventHandlerMap<Events>
  
  constructor(events?: EventHandlerMap<Events>) {
    this._events = events || new Map<keyof Events, EventHandlerList>()
  }
  /**
   * 订阅事件
   * @param type 事件类型
   * @param listener 处理函数
   * @param context 事件执行绑定的上下文
   * @returns 返回值
   */
  on<Key extends keyof Events>(type: Key, listener: EventHandler, context?: any) {
    if (typeof listener !== 'function') {
      throw new TypeError('The listener must be a function')
    }

    const _events = this._events

    if (!_events.has(type)) {
      _events.set(type, new Set())
    }

    const listeners = _events.get(type)
    listeners.add({
      fn: listener,
      context
    })

    return this
  }

  /**
   * 取消订阅事件
   * 如果没有提供处理函数，它会取消订阅当前所有事件
   * @param type 事件类型
   * @param listener 处理函数
   * @returns 
   */
  off<Key extends keyof Events>(type: Key, listener?: EventHandler) {
    const _events = this._events
    const listeners = _events.get(type)
    const liveEvents: EventHandlerList = new Set()

    if (listeners && listener) {
      for (const typeListener of listeners) {
        if (typeListener.fn !== listener && typeListener.fn._ !== listener) {
          liveEvents.add(typeListener)
        }
      }
    }

    liveEvents.size
      ? _events.set(type, liveEvents)
      : _events.delete(type)
    
    return this
  }

  /**
   * 仅订阅一次事件
   * @param type 事件类型
   * @param listener 处理函数
   * @param context 事件执行绑定的上下文
   * @returns 
   */
  once<Key extends keyof Events>(type: Key, listener: EventHandler, context?: any) {
    const self = this
    function handler(...args: any[]) {
      self.off(type, handler)
      listener.apply(context, args)
    }
    // 用于取消订阅 off(type, fn)
    handler._ = listener

    // 不能使用 `handler.bind(this)`绑定函数, 否则 self.off 无法匹配
    return this.on(type, handler, context)
  }
  /**
   * 触发事件
   * @param type 事件类型
   * @param args 传递给订阅事件的参数
   * @returns 
   */
  emit<Key extends keyof Events>(type: Key, ...args: any[]) {
    const listeners = this._events.get(type)
    if (listeners) {
      for (const listener of listeners) {
        listener.fn.apply(listener.context, args)
      }
    }

    return this
  }
  /**
   * 清除事件
   * @param type 事件类型
   * @returns 
   */
  clear<Key extends keyof Events>(type?: Key) {
    return type ? this._events.delete(type) : this._events.clear()
  }
  /**
   * 获取订阅事件
   * @param type 事件类型
   * @returns 
   */
  get<Key extends keyof Events>(type?: Key) {
    return type ? this._events.get(type) : this._events
  }

  /* size(type?: EventType) {
    if (type) {
      return this._events.get(type)?.size || 0
    }
    return Array.from(this._events.values()).reduce((a, c) => a + c.size, 0)
  } */

  has<Key extends keyof Events>(type?: Key) {
    return this._events.has(type)
  }
}
