import {
  IArguments,
  IOptions,
  WsEventListener,
  WsCloseEvent,
  WsMessageEvent
} from './types'

// Options所有属性可选, 除了`url`必选
type IArgumentsAndUrl = Partial<IArguments> & Pick<IArguments, 'url'>
type MessageType = string | ArrayBuffer | Blob | ArrayBufferView | DataView

// 无效的 message数据类型
const invalidMessageType = ['number', 'boolean', 'array', 'object']

/**
 * 获取参数类型
 * @param arg 参数
 * @returns 
 */
function getType(arg: any) {
  const typeRegExp = /(?:^\[object\s(.*?)\]$)/
  return Object.prototype.toString
    .call(arg)
    .replace(typeRegExp, '$1')
    .toLowerCase()
}

/**
 * 创建自定义事件
 * @param type 事件类型
 * @returns 
 */
function createEvent<T>(type: string, data?: any): CustomEvent<T> {
  return new CustomEvent<T>(type, {
    detail: data,
    bubbles: false, //不冒泡
    cancelable: false //不能取消
  })
}

/**
 * 获取配置项
 * @param options 选项
 * @returns 
 */
function getOptions(
  options: Partial<IArguments> = {}
): IOptions {
  const defaults = {
    // timeout: 4000,
    automaticOpen: true,
    shouldReconnect: true,
    maxReconnectAttempts: Infinity,
    reconnectInterval: 1000,
    reconnectDecay: 1,
    maxReconnectInterval: 30000,
    autoSend: false,
    maxMessageQueue: Infinity,
    ping: false,
    pingInterval: 5000,
    binaryType: 'blob'
  }
  
  // 控制 reconnectDecay 在 [0 - 1] 之间
  const reconnectDecay = options.reconnectDecay
  if (reconnectDecay) {
    options.reconnectDecay = (typeof reconnectDecay === 'number' && reconnectDecay >= 0 && reconnectDecay <= 1) ? reconnectDecay : 1
  }
  
  // 设置心跳检测的默认发送内容
  if (options.ping) {
    (options as IOptions).pingMessage = typeof options.ping !== 'boolean' ? options.ping : 'ping'
  }

  return Object.assign({
    url: '',
    protocols: '',
    pingMessage: ''
  }, defaults, options)
}

export default class WebSocketConnect{
  public ws: WebSocket | null = null  // websocket 实例
  private _messageQueue: Set<MessageType> = new Set()   // 保存待发送消息(未连接状态)
  private _pingTimer: any = null  // 心跳检测计时器
  private _reconnectTimer: any = null   // 重连计时器
  private _reconnectAttempts: number = 0   // 重连次数
  private readonly options: IOptions
  private readonly _eventTarget: HTMLDivElement
  public addEventListener
  public removeEventListener
  public dispatchEvent

  constructor(url: string, protocols?: string | string[], options?: Partial<IArguments>)
  constructor(url: string, protocols?: Partial<IArguments>)
  constructor(url: IArgumentsAndUrl)
  constructor(
    url: string | IArgumentsAndUrl,
    protocols?: string | string[] | Partial<IArguments>,
    options?: Partial<IArguments>
  ) {
    if (window && !('WebSocket' in window)) {
      throw Error('The environment not support websocket')
    }

    if (!url) {
      throw Error('Invalid url')
    }

    if (getType(url) === 'object') {
      if (!(url as IArgumentsAndUrl).url) {
        throw Error('Invalid url')
      }
      this.options = getOptions(url as IArgumentsAndUrl)
    } else if (getType(protocols) === 'object') {
      (protocols as Partial<IArguments>).url = url as string
      this.options = getOptions(protocols as Partial<IArguments>)
    } else {
      this.options = getOptions(Object.assign({}, options, {
        url: url as string,
        protocols: protocols as (string | string[])
      }))
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
      // (self as any)['on' + stdEvent] = function(event: Event) {}

      // 将“on*”属性连接事件处理程序
      // e.g. eventTarget.addEventListener('open', function(event) { self.onopen(event) })
      eventTarget.addEventListener(stdEvent, function(event: Event) {
        const handler: WsEventListener = (self as any)['on' + stdEvent]
        if (handler) {
          handler.call(self, event) //已声明事件调用函数
        }
      })
    })

    this._eventTarget = eventTarget

    // 在实例化时是否打开连接
    if (this.options.automaticOpen) {
      this.open(false)
    }
  }

  static readonly CONNECTING = WebSocket.CONNECTING
  static readonly OPEN = WebSocket.OPEN
  static readonly CLOSING = WebSocket.CLOSING
  static readonly CLOSED = WebSocket.CLOSED
  get CONNECTING () {
    return WebSocketConnect.CONNECTING
  }
  get OPEN () {
    return WebSocketConnect.OPEN
  }
  get CLOSING () {
    return WebSocketConnect.CLOSING
  }
  get CLOSED () {
    return WebSocketConnect.CLOSED
  }

  get binaryType() {
    return this.ws?.binaryType ?? this.options.binaryType
  }
  set binaryType(value: BinaryType) {
    this.options.binaryType = value
    if (this.ws) {
      this.ws.binaryType = value
    }
  }
  get bufferedAmount() {
    return this.ws?.bufferedAmount ?? 0
  }
  get extensions() {
    return this.ws?.extensions ?? ''
  }
  get url() {
    return this.ws?.url ?? ''
  }
  //websocket 协议
  get protocol() {
    return this.ws?.protocol ?? ''
  }
  // websocket 状态
  get readyState() {
    return this.ws?.readyState ?? WebSocket.CONNECTING
  }

  public onopen(event: Event) {}
  public onmessage(event: MessageEvent) {}
  public onerror(event: ErrorEvent) {}
  public onclose(event: CloseEvent) {}
  public onreconnect(event: Event) {}
  public onreconnectend(event: Event) {}

  /**
   * 打开 websocket连接
   * @param reconnectAttempt 是否为重连
   */
  public open(reconnectAttempt?: boolean) {
    try {
      const ws = new WebSocket(this.options.url, this.options.protocols)
      ws.binaryType = this.options.binaryType

      const self = this
      const eventTarget = this._eventTarget
      
      if(reconnectAttempt) {
        if (self._reconnectAttempts > self.options.maxReconnectAttempts) {
          // 超过重连次数
          return console.error(new Error('Connection failed and maximum limit exceeded!'))
        }
      } else {
        // 正常连接，则重置重连次数
        self._reconnectAttempts = 0
      }
      
      /**
       * ws 连接关闭
       */
      ws.onclose = function(event: CloseEvent) {
        // 开启重连
        const _shouldReconnect = self.options.shouldReconnect
        const isReconnect = typeof _shouldReconnect === 'function'
          ? _shouldReconnect.call(self, event, self)
          : _shouldReconnect
            ? !([1000, 1001, 1005].includes(event.code))
            : false
        if (isReconnect) {
          self.reconnect(event)
        }

        const e = createEvent('close') as WsCloseEvent
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
      ws.onmessage = function(event: MessageEvent) {
        /**
         * 接收消息后, 重新检测心跳 (接收任何消息说明当前连接正常)
         * bufferedAmount === 0 表明所有消息已发送完毕
         */
        if (ws.bufferedAmount === 0 && self.options.ping) {
          self.ping()
        }

        const e = createEvent('message') as WsMessageEvent
        e.data = event.data
        e.origin = event.origin
        e.lastEventId = event.lastEventId
        e.source = event.source
        e.ports = event.ports
        eventTarget.dispatchEvent(e)
      }

      /**
       * ws 连接成功
       */
      ws.onopen = function(event: Event) {
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
      
      this.ws = ws
    } catch (error) {
      throw error
    }
  }

  /**
   * 发送消息
   * @param data 消息内容
   */
  public send(data: any) {
    if (!data) return

    const ws = this.ws
    if (invalidMessageType.includes(getType(data))) {
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
   * 重新连接 websocket
   * @param {Event} event 连接失败事件
   */
  private reconnect(event: Event) {
    const eventTarget = this._eventTarget
    const {
      maxReconnectAttempts,
      reconnectInterval,
      reconnectDecay,
      maxReconnectInterval
    } = this.options

    if (this._reconnectAttempts++ < maxReconnectAttempts) {
      // 间隔时长
      const delay = reconnectInterval * (1 + this._reconnectAttempts * reconnectDecay)

      this._reconnectTimer = setTimeout(() => {
        // 尝试重连
        this.open(true)
        // 触发 reconnect事件
        eventTarget.dispatchEvent(createEvent('reconnect', { count: this._reconnectAttempts }))
      }, delay > maxReconnectInterval ? maxReconnectInterval : delay)
    } else {
      // 超过最大连接次数限制, 则自动关闭和触发 reconnectend事件
      this.close('Exceeded maximum number of connections')
      eventTarget.dispatchEvent(createEvent('reconnectend'))
    }
  }
  // 重置重连数据
  private _resetReconnect() {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer)
      this._reconnectTimer = null
    }
    this._reconnectAttempts = 0
  }
  
  /**
   * 心跳监测 keepAlive
   * @param message 是否开启心跳监测或心跳监测消息体💓
   * @returns
   */
  public ping(message?: boolean | string | object) {
    if (message === false) {
      this.options.ping = false
      return
    }
    if (message) {
      this.options.ping = true
      if (typeof message !== 'boolean') {
        this.options.pingMessage = message
      }
    }

    if (this._pingTimer) {
      clearTimeout(this._pingTimer)
    }
    
    this._pingTimer = setTimeout(() => {
      this.send(this.options.pingMessage)
    }, this.options.pingInterval)
  }

  /**
   * 关闭 websocket 连接
   * @param code close状态码
   * @param reason close原因
   */
  public close(code?: number | string, reason?: string) {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer)
      this._reconnectTimer = null
    }

    if (this._pingTimer) {
      clearInterval(this._pingTimer)
      this._pingTimer = null
    }
    
    if (this.ws) {
      if (typeof code !== 'number') {
        reason = reason ?? (code as string)
        code = 1000
      }

      this.ws.close(code, reason)
      this.ws = null
    }
  }
}
