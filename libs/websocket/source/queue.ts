import { MessageQueueOptions } from './types'

/**
 * 消息队列管理器
 * 1. `onopen` 中处理消息队列;
 * 2. `send()` 未连接状态时保存待发送的消息;
 */
export class QueueManager {
	private queue: any[]
	constructor(private readonly options: MessageQueueOptions) {
		this.queue = []
	}

	add(data: any) {
		if (this.options.enabled && this.queue.length < (this.options.max || Infinity)) {
			return this.queue.push(data)
		}
		return false
	}

	process(send: (data: any) => any) {
		if (this.options.enabled && this.queue.length > 0) {
			this.queue.forEach((message) => {
				send(message)
			})
			// 执行完后清空消息
			this.clear()
		}
	}

	clear() {
		this.queue = []
	}
}
