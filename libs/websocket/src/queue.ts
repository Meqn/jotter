import { MessageQueueOptions } from './types'

/**
 * 消息队列管理器
 * 1. `onopen` 中消费消息队列;
 * 2. `send()` 未连接状态时保存待发送的消息;
 */
export class QueueManager {
	private queue: any[]
	constructor(private readonly options: MessageQueueOptions) {
		this.queue = []
	}

	add(data: any) {
		if (this.options.enabled && this.queue.length < (this.options.max || Infinity)) {
			if (this.queue.indexOf(data) < 0) {
				// 防止重复添加消息
				this.queue.push(data)
			}
		}
	}

	process(send: (data: any) => any) {
		if (!this.options.enabled) return
		// 消息队列处理
		while (this.queue.length > 0) {
			send(this.queue.shift())
		}
	}

	clear() {
		// 清空消息
		this.queue = []
	}
}
