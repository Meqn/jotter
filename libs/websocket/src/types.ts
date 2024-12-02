export interface ReconnectOptions {
	/**
	 * Enable automatic reconnection
	 *
	 * 启用自动重连
	 * @default true
	 */
	enabled: boolean
	/**
	 * Maximum number of reconnection attempts
	 *
	 * 最大重连次数
	 * @default 10
	 */
	maxAttempts?: number
	/**
	 * Reconnection delay time. (Unit: ms)
	 *
	 * 重连延迟时间. 单位: ms
	 * 指数退避算法: `次数 => Math.min(初始值 * Math.pow(rate, 次数), 最大值)`
	 * @default `(attempt) => Math.min(2000 * Math.pow(1.2, attempt), 30000)`
	 */
	delay?: number | ((attempt: number) => number)
	/**
	 * User-defined reconnection rules
	 *
	 * 自定义重连规则
	 * 示例: `event => ![1000, 1001, 1005].includes(event.code)`
	 */
	shouldReconnect?: (event: CloseEvent, ctx: any) => boolean
}

export interface PingOptions {
	/**
	 * Enable keep-alive
	 *
	 * 启用心跳检测
	 * @default true
	 */
	enabled: boolean
	/**
	 * Keep-alive interval time. (Unit: ms)
	 *
	 * 心跳间隔时间
	 * @default 3000
	 */
	interval?: number
	/**
	 * Keep-alive message
	 *
	 * 心跳消息
	 * @default 'ping'
	 */
	message?: any
}

export interface MessageQueueOptions {
	/**
	 * Enable message-queue (Storing Unsent Messages)
	 *
	 * 启用消息队列
	 */
	enabled: boolean
	/**
	 * Maximum message-queue length
	 *
	 * 最大队列长度
	 * @default Infinity
	 */
	max?: number
}

export interface IOptions {
	/**
	 * Either a single protocol string or an array of protocol strings.
	 *
	 * websocket 子协议
	 */
	protocols?: string | string[]
	/**
	 * Whether to enable automatic reconnection
	 *
	 * 是否自动重连
	 * @default true
	 */
	reconnect?: boolean | ReconnectOptions
	/**
	 * Whether to enable keep-alive
	 *
	 * 是否启用心跳
	 * @default true
	 */
	ping?: boolean | PingOptions
	/**
	 * Whether to enable message-queue
	 *
	 * 是否启用消息队列
	 * @default true
	 */
	messageQueue?: boolean | number | MessageQueueOptions
}

export type WebSocketOptions = {
	/**
	 * The URL of the target WebSocket server to connect to.
	 *
	 * websocket 连接地址
	 */
	url: string
	protocols: string | string[]
	reconnect: ReconnectOptions
	ping: PingOptions
	messageQueue: MessageQueueOptions
}

// 事件选项接口
interface EventOptions extends AddEventListenerOptions {
	bubbles?: boolean
	cancelable?: boolean
	composed?: boolean
}

// 自定义事件选项接口
export interface CustomEventOptions<T = any> extends EventOptions {
	detail?: T
}

// websocket 事件接口
export interface WebSocketConnectEventMap extends WebSocketEventMap {
	reconnect: Event
	reconnectend: Event
}

export interface WsMessageEvent<T = any> extends CustomEvent<T> {
	data?: T
	lastEventId?: string
	origin?: string
	ports?: MessagePort[]
	source?: MessageEventSource | null
}
export interface WsCloseEvent extends CustomEvent {
	code: number
	reason: string
	wasClean: boolean
}

// websocket 消息类型
export type WsMessageType = string | ArrayBufferLike | Blob | ArrayBufferView
