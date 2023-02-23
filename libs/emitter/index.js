export default class EventEmitter {
  constructor() {
    this._events = new Map()
  }
  
  /**
   * 订阅事件
   * @param {string} type 事件类型
   * @param {function} listener 处理函数
   * @param {any} context 事件执行绑定的上下文
   * @returns 
   */
  on(type, listener, context) {
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
   * 如果没有提供回调，它会取消订阅当前所有事件
   * @param {string} type 事件类型
   * @param {function} listener 监听函数
   * @returns 
   */
  off(type, listener) {
    const _events = this._events
    const listeners = _events.get(type)
    const liveEvents = new Set()

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
   * @param {string} type 事件类型
   * @param {function} listener 监听函数
   * @param {any} context 事件执行绑定的上下文
   * @returns 
   */
  once(type, listener, context) {
    const self = this
    function handler() {
      self.off(type, handler)
      listener.apply(context, arguments)
    }
    handler._ = listener

    // 不能使用 `handler.bind(this)`绑定函数, 否则 self.off 无法匹配
    return this.on(type, handler, context)
  }

  /**
   * 触发事件
   * @param {string} type 事件名
   * @param  {array<any>} args 传递给事件订阅的参数
   * @returns 
   */
  emit(type, ...args) {
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
   * @param {string | symbol | undefined} type 事件名
   * @returns 
   */
  clear(type) {
    return type ? this._events.delete(type) : this._events.clear()
  }

  has(type) {
    return this._events.has(type)
  }
  
  /**
   * 获取订阅事件
   * @param {string | symbol | undefined} type 事件名
   * @returns 
   */
  get(type) {
    return type ? this._events.get(type) : this._events
  }
}

export {
  EventEmitter
}
