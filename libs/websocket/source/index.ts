import { WebSocketConnectEvent } from './event'
import { ReconnectManager } from './reconnect'
import { PingManager } from './ping'
import { QueueManager } from './queue'
import { getType, isObject, assign, invalidMessageType, createEvent } from './utils'
import {
	IOptions,
	WebSocketConfig,
	ReconnectOptions,
	PingOptions,
	MessageQueueOptions,
} from './types'

const defaults: Omit<WebSocketConfig, 'url'> = {
	protocols: [],
	reconnect: {
		enabled: true,
		delay: (attempt) => Math.min(2000 * Math.pow(1.2, attempt), 30000), //指数退避算法
		maxAttempts: 10,
	},
	ping: {
		enabled: true,
		interval: 3000,
	},
	messageQueue: {
		enabled: true,
		max: Infinity,
	},
}

class WebSocketConnect extends WebSocketConnectEvent {
	ws: WebSocket | null = null

	private _opt: WebSocketConfig
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
		if (options) {
			const { reconnect, messageQueue, ping } = options

			options.reconnect = reconnect
				? assign({}, defaults.reconnect, isObject(reconnect) ? reconnect : {})
				: { enabled: false }

			options.messageQueue = messageQueue
				? assign({}, defaults.messageQueue, isObject(messageQueue) ? messageQueue : {})
				: { enabled: false }

			options.ping = ping
				? assign({}, defaults.ping, isObject(ping) ? ping : {})
				: { enabled: false }
		}
		this._opt = assign({}, defaults, options || {}, { url })

		// 初始化管理器
		this._r = new ReconnectManager(this._opt.reconnect as ReconnectOptions)
		this._q = new QueueManager(this._opt.messageQueue as MessageQueueOptions)
		this._p = new PingManager(this._opt.ping as PingOptions, this.send.bind(this))

		// 初始化 WebSocket 连接
		this._connect()
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
	get protocol() {
		return this.ws?.protocol
	}

	private _connect() {
		const { reconnect, ping, messageQueue } = this._opt
		const ws = new WebSocket(this._opt.url, this._opt.protocols)

		ws.onclose = (event) => {
			// 自动重连处理
			const _shouldReconnect =
				reconnect.enabled && !this._manualClose
					? typeof reconnect.shouldReconnect === 'function'
						? reconnect.shouldReconnect(event)
						: true
					: false
			if (_shouldReconnect) {
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
			//重置心跳检测
			if (ping.enabled) {
				this._p.reset()
			}

			this.dispatchEvent(createEvent('message', event))
		}

		ws.onopen = (event) => {
			// 连接成功，重置连接次数
			if (reconnect.enabled) {
				this._r.reset()
			}

			// 处理排队消息
			if (messageQueue.enabled) {
				this._q.process((data) => this.send(data))
			}

			// 启动心跳监测 (无消息队列时)
			// if (ping.enabled && ws.bufferedAmount === 0) {
			if (ping.enabled) this._p.start()

			this.dispatchEvent(createEvent('open', event))
		}

		this.ws = ws
	}

	send(data: any) {
		if (data === undefined) return

		const ws = this.ws
		if (invalidMessageType.indexOf(getType(data)) !== -1) {
			data = JSON.stringify(data)
		}
		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send(data)
		} else {
			// 保存待发送消息
			if (this._opt.messageQueue.enabled) {
				this._q.add(data)
			}
		}
	}

	close() {
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
			this.ws.close()
			this.ws = null
		}
	}

	/**
	 * 心跳监测 keepAlive
	 * 用于启动/变更心跳监测配置
	 * @param message 是否开启心跳监测或心跳监测消息体💓
	 * @returns
	 */
	ping() {}
}

export default WebSocketConnect
