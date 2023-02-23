function getType(arg) {
  const typeRegExp = /(?:^\[object\s(.*?)\]$)/
  return Object.prototype.toString
    .call(arg)
    .replace(typeRegExp, '$1')
    .toLowerCase()
}

var messageType = ['number', 'boolean', 'array', 'object']

function getOptions(options = {}) {
  const defaults = {
    // 在连接被认为超时之前等待的毫秒数。默认为4秒
    timeout: 4000,
    
    // 是否自动打开连接, 也可以调用 `open()` 来打开websocket。
    automaticOpen: true,

    // 重新连接规则，[boolean, function], 默认不会在 [1000, 1001, 1005] 上重连
    // 返回等待重新连接的结果 shouldReconnect(event, ctx): boolean
    shouldReconnect: true,
    // 尝试重新连接最大次数, 默认无限次
    maxReconnectAttempts: Infinity,
    // 延迟重新连接尝试的最大毫秒数。默认值：30000
    reconnectInterval: 1000,
    //自动重连延迟重连速度, [0 - 1 之间], 默认值 1
    reconnectDecay: 1,
    // 延迟重新连接尝试的最大毫秒数。接受整数。默认值：30000。
    maxReconnectInterval: 30000,

    // 开启自动发送待发消息
    autoSend: false,
    // 保存待发送消息最大个数
    maxMessageQueue: Infinity,

    // 启用心跳监测标记 [boolean | string], 若为string则为发送消息
    ping: false,
    // 发送心跳频率
    pingInterval: 5000,

    // 传输二进制数据的类型 ['blob', 'arraybuffer'], 默认值为'blob'
    binaryType: 'blob'
  }
  
  // 控制 reconnectDecay 在 [0 - 1] 之间
  const reconnectDecay = options.reconnectDecay
  if (reconnectDecay) {
    options.reconnectDecay = (typeof reconnectDecay === 'number' && reconnectDecay > 0 && reconnectDecay < 1) ? reconnectDecay : 1
  }
  
  // 设置心跳检测的默认发送内容
  if (options.ping) {
    options.pingMessage = typeof options.ping === 'string' ? options.ping : 'ping'
  }

  return Object.assign(defaults, options)
}

function createEvent(type) {
  return new CustomEvent(type, {
    bubbles: false, //不冒泡
    cancelable: false //不能取消
  })
}

class WebSocketConnect {
  _ws = null  // websocket 实例
  _messageQueue = new Set()   // 保存待发送消息(未连接状态)
  _pingTimer = null  // 心跳检测计时器
  _reconnectTimer = null   // 重连计时器
  reconnectAttempts = 0   // 重连次数

  // constructor(url: string, protocol: string | string[], options: object)
  // constructor(url: string, options: object)
  // constructor(url: object)
  constructor(url, protocols, options = {}) {
    if (!'WebSocket' in window) {
      throw Error('The environment not support websocket')
    }

    if (!url) {
      throw Error('Invalid url')
    }

    if (getType(url) === 'object') {
      this.options = getOptions(url)
    } else if (getType(protocols) === 'object') {
      protocols.url = url
      this.options = getOptions(protocols)
    } else {
      options.url = url
      options.protocols = protocols || []
      this.options = getOptions(options)
    }
    
    const self = this

    // 创建事件处理目标
    const eventTarget = document.createElement('div')
    // 公开 EventTarget需要的API，支持 addEventListener('open') 和 onopen 两种方式
    this.addEventListener = eventTarget.addEventListener.bind(eventTarget)
    this.removeEventListener = eventTarget.removeEventListener.bind(eventTarget)
    this.dispatchEvent = eventTarget.dispatchEvent.bind(eventTarget)
    // 绑定对应的处理事件
    ;['open', 'message', 'error', 'close', 'reconnect', 'reconnectend'].forEach(function(stdEvent) {
      // 创建 websocket事件调用监听器  e.g. `this.onopen = function(event) {}`
      self['on' + stdEvent] = function(event) {}

      // 将“on*”属性连接事件处理程序
      // e.g. eventTarget.addEventListener('open', function(event) { self.onopen(event) })
      eventTarget.addEventListener(stdEvent, function(event) {
        const handler = self['on' + stdEvent]
        handler.apply(self, arguments) //已声明事件调用函数
      })
    })

    this._eventTarget = eventTarget

    // 在实例化时是否打开连接
    if (this.options.automaticOpen) {
      this.open()
    }
  }

  static CONNECTING = WebSocket.CONNECTING
  static OPEN = WebSocket.OPEN
  static CLOSING = WebSocket.CLOSING
  static CLOSED = WebSocket.CLOSED

  get url() {
    return this.options.url
  }
  //websocket 协议
  get protocol() {
    return this._ws?.protocol
  }
  // websocket 状态
  get readyState() {
    return this._ws?.readyState ?? WebSocket.CONNECTING
  }

  /**
   * 创建连接 websocket
   * @param {boolean} reconnectAttempt 是否重连方式
   * @returns 
   */
  open(reconnectAttempt) {
    try {
      const ws = new WebSocket(this.options.url, this.options.protocols)
      ws.binaryType = this.options.binaryType

      const self = this
      const eventTarget = this._eventTarget
      
      if(reconnectAttempt) {
        if (self.reconnectAttempts > self.options.maxReconnectAttempts) {
          // 超过重连次数
          return console.error(new Error('Connection failed and maximum limit exceeded!'))
        }
      } else {
        // 正常连接，则重置重连次数
        self.reconnectAttempts = 0
      }
      
      /**
       * ws 连接关闭
       */
      ws.onclose = function(event) {
        // 开启重连
        const _shouldReconnect = self.options.shouldReconnect
        const isReconnect = typeof _shouldReconnect === 'function'
          ? _shouldReconnect.call(self, event, self)
          : _shouldReconnect
            ? [1000, 1001, 1005].includes(event.code)
            : false
        if (isReconnect) {
          self.reconnect(event)
        }

        const e = createEvent('close')
        e.code = event.code
        e.reason = event.reason
        e.wasClean = event.wasClean
        eventTarget.dispatchEvent(e)
      }
      
      /**
       * ws 连接错误
       */
      ws.onerror = function(event) {
        const e = createEvent('error')
        eventTarget.dispatchEvent(e)

        /* if (event && event.code === 'ECONNREFUSED') {
          self.reconnect(event)
        } */
      }
      
      /**
       * ws 接收消息
       */
      ws.onmessage = function(event) {
        /**
         * 接收消息后, 重新检测心跳 (接收任何消息说明当前连接正常)
         * bufferedAmount === 0 表明所有消息已发送完毕
         */
        if (ws.bufferedAmount === 0 && self.options.ping) {
          self.ping()
        }

        const e = createEvent('message')
        e.data = event.data
        eventTarget.dispatchEvent(e)
      }

      /**
       * ws 连接成功
       */
      ws.onopen = function(event) {
        // 连接成功，重置连接次数
        self._resetReconnect()
        
        // 处理排队消息(在websocket连接成功之前发送的消息)
        if (self.options.autoSend) {
          for (const message of self._messageQueue) {
            self.send(message)
          }
          // 执行完后清空消息
          self._messageQueue.clear()
        }

        // 开始心跳检测
        if (ws.bufferedAmount === 0 && self.options.ping) {
          self.ping()
        }

        const e = createEvent('open')
        eventTarget.dispatchEvent(e)
      }
      
      this._ws = ws
    } catch (error) {
      throw error
    }
  }
  
  /**
   * 发送消息
   * @param {string | ArrayBuffer | Blob | ArrayBufferView} data 发送数据
   */
  send(data) {
    const ws = this._ws
    if (messageType.includes(getType(data))) {
      data = JSON.stringify(data)
    }
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(data)
    } else {
      // 保存待发送的消息
      if (this.options.autoSend && this._messageQueue.size < this.options.maxMessageQueue) {
        this._messageQueue.add(data)
      }
    }
  }

  /**
   * ws重新连接
   * @param {Event} event 事件
   */
  reconnect(event) {
    const eventTarget = this._eventTarget
    const {
      maxReconnectAttempts,
      reconnectInterval,
      reconnectDecay,
      maxReconnectInterval
    } = this.options

    if (this.reconnectAttempts++ < maxReconnectAttempts) {
      // 间隔时长
      const delay = reconnectInterval * (1 + this.reconnectAttempts * reconnectDecay)

      this._reconnectTimer = setTimeout(() => {
        // 尝试重连
        this.open(true)
        // 触发 reconnect事件
        eventTarget.dispatchEvent(createEvent('reconnect'))
      }, delay > maxReconnectInterval ? maxReconnectInterval : delay)
    } else {
      // 超过最大连接次数限制, 则自动关闭和触发 reconnectend事件
      this.close()
      eventTarget.dispatchEvent(createEvent('reconnectend'))
    }
  }
  // 重置重连数据
  _resetReconnect() {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer)
      this._reconnectTimer = null
    }
    this.reconnectAttempts = 0
  }

  /**
   * 监测心跳 keepAlive
   * @returns
   */
  ping() {
    if (this._pingTimer) {
      clearTimeout(this._pingTimer)
    }

    this._pingTimer = setTimeout(() => {
      this.send(this.options.pingMessage)
    }, this.options.pingInterval)
  }

  /**
   * 关闭连接
   * @param {number} code close状态码
   * @param {string} reason close原因
   */
  close(code, reason) {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer)
      this._reconnectTimer = null
    }

    if (this._pingTimer) {
      clearInterval(this._pingTimer)
      this._pingTimer = null
    }
    
    if (this._ws) {
      if (typeof code !== 'number') {
        code = 1000
        reason = reason ?? code
      }

      this._ws.close(code, reason)
      this._ws = null
    }
  }
}
