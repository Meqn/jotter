import { ReconnectOptions } from './types'

/**
 * 重连管理器
 * 1. `onclose` 中开始重连;
 * 2. `onopen` 中重置重连数据;
 */
export class ReconnectManager {
	private attempt: number = 0
	private _timer: number | null = null
	constructor(private readonly options: ReconnectOptions) {}

	/**
	 * 开始重连
	 * @param reconnect 重连函数
	 * @param reconnectEnd 重连结束函数
	 * @returns
	 */
	start(reconnect: (attempt: number) => void, reconnectEnd: (attempt: number) => void) {
		if (!this.options.enabled) return

		const { maxAttempts = Infinity, delay } = this.options
		if (this.attempt < maxAttempts) {
			const delayTime = typeof delay === 'function' ? delay(this.attempt) : delay
			this._timer = window.setTimeout(() => {
				//重连处理
				reconnect?.(this.attempt)
				this.attempt++
			}, delayTime)
		} else {
			console.warn('websocket reconnect max attempts')
			this.stop()

			//重连结束处理
			reconnectEnd?.(this.attempt)
		}
	}

	stop() {
		if (this._timer) {
			window.clearTimeout(this._timer)
			this._timer = null
		}
	}

	reset() {
		this.attempt = 0
		this.stop()
	}
}
