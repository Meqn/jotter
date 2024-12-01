import { WsMessageEvent } from './types'

export function getType(value: any): string {
	return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}

export function isObject(value: any): boolean {
	return getType(value) === 'object'
}

/**
 * 检测是否有效的 message 数据类型
 */
export function validWsData(data: any): boolean {
	if (typeof data === 'string') return true
	if (typeof data === 'object') {
		return (
			data instanceof ArrayBuffer ||
			data instanceof Blob ||
			data instanceof DataView ||
			ArrayBuffer.isView(data)
		)
	}
	return false
}

/**
 * 合并对象
 */
interface IAssign {
	<T extends {}, U>(target: T, source: U): T & U
	<T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V
	<T extends {}, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W
	(target: object, ...sources: any[]): any
}
export const assign: IAssign = (() => {
	return (
		Object.assign ||
		function (target: { [key: string]: any }, ...sources: any[]) {
			for (let i = 1, len = sources.length; i < len; i++) {
				const source = sources[i]
				for (const key in source) {
					if (Object.prototype.hasOwnProperty.call(source, key)) {
						target[key] = source[key]
					}
				}
			}
		}
	)
})()

/**
 * 创建自定义事件
 */
export function createEvent<K extends string>(
	type: K,
	source?: K extends 'message' | 'close' ? WebSocketEventMap[K] : Event,
	detail?: any
): Event {
	const event = new CustomEvent<any>(type, {
		bubbles: false, //不冒泡
		cancelable: false, //不能取消
		detail: detail || source,
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

		if (source.target) {
			Object.defineProperties(event, {
				target: {
					value: source.target,
					writable: false,
				},
				currentTarget: {
					value: source.currentTarget || source.target,
					writable: false,
				},
			})
		}
	}

	return event
}
