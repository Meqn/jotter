import { WebSocketConnectEvent } from './event'
import { ReconnectManager } from './reconnect'
import { PingManager } from './ping'
import { QueueManager } from './queue'
import { isObject, assign, validWsData, createEvent } from './utils'
import {
	IOptions,
	WebSocketOptions,
	ReconnectOptions,
	PingOptions,
	MessageQueueOptions,
} from './types'

function createOptions(url: string, options: IOptions): WebSocketOptions {
	const defaults: Omit<WebSocketOptions, 'url'> = {
		protocols: [],
		reconnect: {
			enabled: true,
			delay: (attempt) => Math.min(2000 * Math.pow(1.2, attempt), 30000), //指数退避算法
			maxAttempts: 10,
		},
		ping: {
			enabled: true,
			interval: 3000,
			message: 'ping',
		},
		messageQueue: {
			enabled: true,
			max: Infinity,
		},
	}

	const { reconnect, messageQueue, ping } = options

	options.reconnect = reconnect
		? assign({}, defaults.reconnect, isObject(reconnect) ? reconnect : {})
		: { enabled: false }

	options.messageQueue = messageQueue
		? assign({}, defaults.messageQueue, isObject(messageQueue) ? messageQueue : {})
		: { enabled: false }

	options.ping = ping ? assign({}, defaults.ping, isObject(ping) ? ping : {}) : { enabled: false }

	return assign({}, defaults, options, { url })
}

class WebSocketConnect extends WebSocketConnectEvent {
	ws: WebSocket | null = null

	private _opt: WebSocketOptions
	private _manualClose: boolean = false // 手动关闭
	private _r: ReconnectManager //reconnect 实例
	private _q: QueueManager //messageQueue 实例
	private _p: PingManager //ping 实例

	constructor(url: string, protocols?: string | string[], options?: IOptions)
	constructor(url: string, options?: IOptions)
	constructor(url: string, protocols?: string | string[] | IOptions, options?: IOptions) {
		if (window && !('WebSocket' in window)) {
			throw Error('The environment not support websocket')
		}
		if (!url) {
			throw TypeError('WebSocket url is required')
		}

		super()

		// 初始化配置
		if (protocols) {
			options = isObject(protocols) ? (protocols as IOptions) : assign(options || {}, { protocols })
		}
		this._opt = createOptions(url, options || {})

		// 初始化管理器
		this._r = new ReconnectManager(this._opt.reconnect as ReconnectOptions)
		this._q = new QueueManager(this._opt.messageQueue as MessageQueueOptions)
		this._p = new PingManager(this._opt.ping as PingOptions, (d) => this.send(d))

		// 初始化 WebSocket 连接
		this._connect()
	}

	private _connect() {
		const { reconnect, ping, messageQueue } = this._opt
		const ws = new WebSocket(this._opt.url, this._opt.protocols)
		this.dispatchEvent(createEvent('connecting', { target: this.ws } as Event))

		ws.onclose = (event) => {
			// ping: 断开连接时停止心跳检测
			if (ping.enabled && this._p) this._p.stop()

			// reconnect: 自动重连处理 (非主动关闭自动重连)
			const _shouldReconnect =
				reconnect.enabled && !this._manualClose
					? typeof reconnect.shouldReconnect === 'function'
						? reconnect.shouldReconnect(event, this)
						: true
					: false
			if (_shouldReconnect && this._r) {
				this._r.start(
					(attempt) => {
						this._connect()
						this.dispatchEvent(createEvent('reconnect', event, { attempt }))
					},
					() => this.dispatchEvent(createEvent('reconnectend', event))
				)
			}

			this.dispatchEvent(createEvent('close', event))
		}

		ws.onerror = (event) => {
			this.dispatchEvent(createEvent('error', event))
		}

		ws.onmessage = (event) => {
			// ping: 重置心跳检测
			if (ping.enabled) this._p.reset()

			this.dispatchEvent(createEvent('message', event))
		}

		ws.onopen = (event) => {
			// reconnect: 重置自动重连数据
			if (reconnect.enabled) {
				this._r.reset()
			}

			// messageQueue: 处理排队消息
			if (messageQueue.enabled) {
				this._q.process((d) => this.send(d))
			}

			// ping: 启动心跳监测 (无消息队列时)
			// if (ping.enabled && ws.bufferedAmount === 0) {
			if (ping.enabled) this._p.start()

			this.dispatchEvent(createEvent('open', event))
		}

		this.ws = ws
	}

	/**
	 * 发送消息
	 * @param data 待发送数据
	 * @returns
	 */
	send(data: any) {
		if (data === undefined) return

		const ws = this.ws
		if (!validWsData(data)) {
			data = JSON.stringify(data)
		}
		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send(data)
		} else {
			// messageQueue: 保存待发送消息
			if (this._opt.messageQueue.enabled) {
				this._q.add(data)
			}
		}
	}

	/**
	 * 关闭 websocket 连接
	 * @param code close状态码
	 * @param reason close原因
	 */
	close(code?: number | string, reason?: string) {
		//主动关闭
		this._manualClose = true
		this._opt = null!

		if (this._e) {
			this._e.remove()
			this._e = null!
		}
		if (this._p) {
			this._p.stop()
			this._p = null!
		}
		if (this._r) {
			this._r.stop()
			this._r = null!
		}
		if (this._q) {
			this._q.clear()
			this._q = null!
		}
		if (this.ws) {
			if (typeof code === 'string') {
				reason = reason || code
				code = 1000
			}
			this.ws.close(code, reason)
			this.ws = null
		}
	}

	// 绑定 WebSocket 静态属性 和 GET属性
	static readonly CONNECTING = WebSocket.CONNECTING
	static readonly OPEN = WebSocket.OPEN
	static readonly CLOSING = WebSocket.CLOSING
	static readonly CLOSED = WebSocket.CLOSED
	get CONNECTING() {
		return WebSocketConnect.CONNECTING
	}
	get OPEN() {
		return WebSocketConnect.OPEN
	}
	get CLOSING() {
		return WebSocketConnect.CLOSING
	}
	get CLOSED() {
		return WebSocketConnect.CLOSED
	}

	get url() {
		return this.ws!.url
	}
	get bufferedAmount() {
		// bufferedAmount === 0 表明所有消息已发送完毕
		return this.ws!.bufferedAmount
	}
	get binaryType() {
		return this.ws!.binaryType
	}
	set binaryType(value: BinaryType) {
		this.ws!.binaryType = value
	}
	get extensions() {
		return this.ws!.extensions
	}
	get protocol() {
		return this.ws!.protocol
	}
	get readyState() {
		return this.ws!.readyState
	}
}

export default WebSocketConnect

export * from './types'
