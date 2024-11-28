import { WsMessageEvent } from './types'

// 合并对象
export function assign<T extends object, U extends object>(target: T, source: U): T & U {
	for (const key in source) {
		if (Object.prototype.hasOwnProperty.call(source, key)) {
			;(target as any)[key] = (source as any)[key]
		}
	}
	return target as T & U
}

// 创建自定义事件
export function createEvent<K extends string>(
	type: K,
	source?: K extends 'message' | 'close' ? WebSocketEventMap[K] : Event
): Event {
	const event = new CustomEvent(type, {
		bubbles: false, //不冒泡
		cancelable: false, //不能取消
		detail: source,
	})
	if (source) {
		if (type === 'message') {
			const props = ['data', 'lastEventId', 'origin', 'ports', 'source'] as const
			props.forEach((key) => {
				;(event as WsMessageEvent)[key] = (source as WebSocketEventMap['message'])[key]
			})
		} else if (type === 'close') {
			const props = ['code', 'reason', 'wasClean'] as const
			props.forEach((key) => {
				;(event as any)[key] = (source as WebSocketEventMap['close'])[key]
			})
		}

		if (source?.target) {
			Object.defineProperties(event, {
				target: {
					value: source?.target,
					writable: false,
				},
				currentTarget: {
					value: source?.currentTarget || source?.target,
					writable: false,
				},
			})
		}
	}

	return event
}
