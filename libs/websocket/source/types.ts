export interface ReconnectOptions {
	/**
	 * 启用自动重连
	 * @default true
	 */
	enabled: boolean
	/**
	 * 最大重连次数
	 * @default 10
	 */
	maxAttempts?: number
	/**
	 * 重连延迟时间
	 * 指数退避算法: `次数 => Math.min(初始值 * Math.pow(rate, 次数), 最大值)`
	 * @default `(attempt) => Math.min(2000 * Math.pow(1.2, attempt), 30000)`
	 */
	delay?: number | ((attempt: number) => number)
	/**
	 * 自定义重连规则
	 * 示例: `event => ![1000, 1001, 1005].includes(event.code)`
	 */
	shouldReconnect?: (event: CloseEvent) => boolean
}

export interface PingOptions {
	/**
	 * 启用心跳
	 * @default true
	 */
	enabled: boolean
	/**
	 * 心跳间隔时间
	 * @default 3000
	 */
	interval?: number
	/**
	 * 心跳消息
	 * @default 'ping'
	 */
	message?: any
}

export interface MessageQueueOptions {
	/**
	 * 启用消息队列
	 */
	enabled: boolean
	/**
	 * 最大队列长度
	 * @default Infinity
	 */
	max?: number
}

export interface IOptions {
	/**
	 * websocket 子协议
	 */
	protocols?: string | string[]
	/**
	 * 是否自动重连
	 * @default true
	 */
	reconnect?: boolean | ReconnectOptions
	/**
	 * 是否启用心跳
	 * @default true
	 */
	ping?: boolean | PingOptions
	/**
	 * 是否启用消息队列
	 * @default true
	 */
	messageQueue?: boolean | number | MessageQueueOptions
}

export type WebSocketConfig = {
	/**
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
