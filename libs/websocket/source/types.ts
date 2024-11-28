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
export interface WsCloseEvent<T = any> extends CustomEvent<T> {
	code: number
	reason: string
	wasClean: boolean
}
