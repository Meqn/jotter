import { PingOptions } from './types'
/**
 * 心跳管理器
 * WebSocket连接成功后，定时发送心跳消息，防止连接超时。
 * 1. `onopen` 中无消息队列时启动心跳 (ws.bufferedAmount = 0);
 * 2. `onmessage` 中重置定时器;
 * 3. `onclose` 中清除定时器;
 */
export class PingManager {
	private _timer: number | null = null

	constructor(
		private readonly options: PingOptions,
		private send: (data: any) => void
	) {}

	start() {
		if (!this.options.enabled) return

		this._timer = window.setInterval(() => {
			this.send(this.options.message)
		}, this.options.interval)
	}

	stop() {
		if (this._timer) {
			clearInterval(this._timer)
			this._timer = null!
		}
	}

	reset() {
		this.stop()
		this.start()
	}
}
