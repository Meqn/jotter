import { WebSocketConnectEventMap } from './types'
const eventTypes = [
	'close',
	'error',
	'message',
	'open',
	'connecting',
	'reconnect',
	'reconnectend',
] as const

export class WebSocketConnectEvent {
	ws: WebSocket | null = null
	protected _e: HTMLElement

	onclose: ((ev: WebSocketConnectEventMap['close']) => any) | null = null
	onerror: ((ev: WebSocketConnectEventMap['error']) => any) | null = null
	onmessage: ((ev: WebSocketConnectEventMap['message']) => any) | null = null
	onopen: ((ev: WebSocketConnectEventMap['open']) => any) | null = null
	onconnecting: ((ev: WebSocketConnectEventMap['connecting']) => any) | null = null
	onreconnect: ((ev: WebSocketConnectEventMap['reconnect']) => any) | null = null
	onreconnectend: ((ev: WebSocketConnectEventMap['reconnectend']) => any) | null = null

	constructor() {
		this._e = document.createElement('div')

		eventTypes.forEach((type) => {
			// 通过赋值绑定的事件
			this._e.addEventListener(type, (ev) => {
				// @ts-ignore
				this[`on${type}`]?.call(this.ws || this._e, ev)
			})
		})
	}

	addEventListener<K extends keyof WebSocketConnectEventMap>(
		type: K,
		listener: (ev: WebSocketConnectEventMap[K]) => any,
		options?: boolean | AddEventListenerOptions
	): void {
		this._e.addEventListener(type, listener as EventListener, options)
	}

	removeEventListener<K extends keyof WebSocketConnectEventMap>(
		type: K,
		listener: (ev: WebSocketConnectEventMap[K]) => any,
		options?: boolean | EventListenerOptions
	): void {
		this._e.removeEventListener(type, listener as EventListener, options)
	}

	dispatchEvent<K extends keyof WebSocketConnectEventMap>(
		event: WebSocketConnectEventMap[K]
	): boolean {
		return this._e.dispatchEvent(event)
	}
}
