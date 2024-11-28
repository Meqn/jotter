import { WebSocketConnectEvent } from './event'
import { createEvent } from './utils'
export * from './utils'

export class WebSocketConnect extends WebSocketConnectEvent {
	url: string
	protected _ws: WebSocket | null = null
	constructor(url: string) {
		super()
		this.url = url
	}

	connect() {
		this._ws = new WebSocket(this.url)
		this._ws.onopen = (event) => {
			if (!event.isTrusted) return
			console.log('websocket connected ..........')
			// this.dispatchEvent(event)
			this.dispatchEvent(createEvent('open', event))
		}
		this._ws.onmessage = (event) => {
			if (!event.isTrusted) return
			console.log('websocket message ..........', event)
			// this.dispatchEvent(event)
			this.dispatchEvent(createEvent('message', event))
		}
		this._ws.onclose = (event) => {
			console.log('websocket close ..........', event)
			// this.dispatchEvent(event)
			this.dispatchEvent(createEvent('close', event))
		}
		this._ws.onerror = (event) => {
			if (!event.isTrusted) return
			console.log('websocket error ..........', event)
			// this.dispatchEvent(event)
			this.dispatchEvent(createEvent('error', event))
		}
	}
}
