export interface IArguments {
  /**
   * The URL to which to connect
   * 连接websocket服务端的 URL
   */
  url: string
  /**
   * Either a single protocol string or an array of protocol strings. 
   * websocket连接协议
   */
  protocols: string | string[]
  /**
   * 在连接被认为超时之前等待的毫秒数, 单位:ms
   * @default 4000
   */
  // readonly timeout: number,
  /**
   * 是否在实例化后立即尝试连接.  
   * 可调用`ws.open()`和`ws.close()`手动打开或关闭
   * @default true
   */
  readonly autoOpen: boolean

  /**
   * 是否开启自动重连机制, 默认 code=[1000, 1001, 1005] 不会重连
   * 在`shouldReconnect(event, ctx)`中设定重新连接规则
   * @default true
   */
  readonly shouldReconnect: boolean | ((event: Event, context: any) => boolean)
  /**
   * 尝试重新连接最大次数
   * @default Infinity
   */
  readonly maxReconnectAttempts: number
  /**
   * 尝试重新连接前延迟的毫秒数, 单位:ms
   * @default 1000
   */
  readonly reconnectInterval: number
  /**
   * 自动重连延迟重连速率,在[0-1]之间
   * @default 1
   */
  reconnectDecay: number
  /**
   * 延迟重新连接尝试的最大毫秒数, 单位:ms
   * @default 30000
   */
  readonly maxReconnectInterval: number

  /**
   * 开启连接成功后, 自动处理待发消息队列
   * @default false
   */
  readonly autoSend: boolean
  /**
   * 保存待发送消息队列最大个数 (不会保存重复消息)
   * @default Infinity
   */
  readonly maxMessageQueue: number

  /**
   * 启用心跳监测, 若为`string`则为发送消息内容
   * @default false
   */
  ping: boolean | string | object
  /**
   * 发送心跳检测频率, 单位:ms
   * @default 5000
   */
  readonly pingInterval: number

  /**
   * websocket 连接所传输二进制数据的类型
   * @default 'blob'
   */
  binaryType: 'blob' | 'arraybuffer'
}

// 生成的配置项 (参数配置 + 动态生成)
export interface IOptions extends IArguments {
  /**
   * 发送心跳检测消息内容.
   */
  pingMessage: string | object
}

export type WsEventListener = (event: Event) => void

export interface WsCloseEvent extends CustomEvent {
  code: number
  reason: string
  wasClean: boolean
}

export interface WsErrorEvent extends CustomEvent {
  colno?: number
  error?: any
  filename?: string
  lineno?: number
  message?: string
}

export interface WsMessageEvent extends CustomEvent {
  data: any
  lastEventId: string
  origin: string
  ports: ReadonlyArray<MessagePort>
  source: MessageEventSource | null;
}

