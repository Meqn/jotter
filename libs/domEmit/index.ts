const _NAME = 'DomEmitter'

// 事件监听器类型
type CustomEventListener<T = any> = (event: CustomEvent<T>) => void

// 事件存储接口
type EventsMap<T> = Record<keyof T, CustomEventListener[]>

// 事件选项接口
interface EventOptions extends AddEventListenerOptions {
	bubbles?: boolean
	cancelable?: boolean
	composed?: boolean
}

// 自定义事件选项接口
interface CustomEventOptions<T = any> extends EventOptions {
	detail?: T
}

// 合并对象
function assign<T extends object, U extends object>(target: T, source: U): T & U {
	for (const key in source) {
		if (Object.prototype.hasOwnProperty.call(source, key)) {
			;(target as any)[key] = (source as any)[key]
		}
	}
	return target as T & U
}

/**
 * DOM事件发射器类
 * 用于管理DOM事件的订阅、发布和移除
 */
class DomEmitter<T extends Record<string, any>> {
	private _events: EventsMap<T> = Object.create(null) // 事件存储对象
	private _eventTarget: HTMLElement; // 事件目标对象
	[key: string]: any // 用于支持 onxxx 属性

	constructor(target?: HTMLElement) {
		if (typeof document === 'undefined') {
			throw new Error(`${_NAME} can only be used in browser environment`)
		}

		this._eventTarget = target instanceof HTMLElement ? target : document.createElement('div')
	}

	/**
	 * 创建自定义事件
	 */
	private createEvent<K extends keyof T>(
		type: K,
		eventInitDict: CustomEventOptions = {}
	): CustomEvent {
		if (typeof type !== 'string') {
			throw new TypeError(`[${_NAME}] eventType must be a string`)
		}

		const defaults: CustomEventOptions = {
			bubbles: true,
			cancelable: true,
			composed: false,
			detail: null,
		}

		const eventOptions = assign(defaults, eventInitDict)

		// 使用现代浏览器API
		if (typeof CustomEvent === 'function') {
			return new CustomEvent(type, eventOptions)
		}

		// Fallback for older browsers
		const event = document.createEvent('CustomEvent')
		event.initCustomEvent(
			type,
			eventOptions.bubbles!,
			eventOptions.cancelable!,
			eventOptions.detail
		)
		return event
	}

	/**
	 * 添加事件监听器
	 * @param type 事件类型
	 * @param listener 事件监听器
	 * @param options 事件选项, 支持 options 对象或 useCapture 布尔值
	 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener
	 */
	addEventListener<K extends keyof T>(
		type: K,
		listener: CustomEventListener,
		options?: boolean | AddEventListenerOptions
	): this {
		if (typeof type !== 'string' || type === '') {
			throw new TypeError(`[${_NAME}] eventType must be a string`)
		}
		if (typeof listener !== 'function') {
			throw new TypeError(`[${_NAME}] listener must be a function`)
		}

		this._eventTarget.addEventListener(type, listener as EventListener, options)
		this._events[type] = this._events[type] || []
		this._events[type].push(listener)

		return this
	}

	/**
	 * 移除事件监听器
	 */
	removeEventListener<K extends keyof T>(
		type: K,
		listener: CustomEventListener,
		options?: boolean | EventListenerOptions
	): this {
		if (typeof type !== 'string' || type === '') {
			throw new TypeError(`[${_NAME}] eventType must be a string`)
		}

		this._eventTarget.removeEventListener(type, listener as EventListener, options)

		// 从事件存储对象中移除监听器
		const listeners = this._events[type]
		if (listeners) {
			this._events[type] = listeners.filter((l) => l !== listener)
		}

		return this
	}

	/**
	 * 派发事件
	 * @params {Event} event 事件对象
	 * @params {Object} data 传递额外的数据
	 */
	dispatchEvent<K extends keyof T>(event: Event, data?: Partial<T[K]>): boolean {
		if (!(event instanceof Event)) {
			throw new TypeError(`[${_NAME}] event must be an instance of Event`)
		}

		if (data) {
			assign(event, data)
		}

		// 触发通过赋值绑定的事件
		const onHandler = this[`on${String(event.type)}`] //不处理元素上的事件 this._eventTarget[onType as keyof HTMLElement]
		if (typeof onHandler === 'function') {
			onHandler.call(this._eventTarget, event)
		}

		return this._eventTarget.dispatchEvent(event)
	}

	/**
	 * 快捷绑定事件
	 */
	on<K extends keyof T>(
		type: K,
		listener: CustomEventListener,
		options?: boolean | AddEventListenerOptions
	): this {
		return this.addEventListener(type, listener, options)
	}

	/**
	 * 快捷移除事件
	 */
	off<K extends keyof T>(
		type: K,
		listener: CustomEventListener,
		options?: boolean | EventListenerOptions
	): this {
		return this.removeEventListener(type, listener, options)
	}

	/**
	 * 绑定一次性事件
	 */
	once<K extends keyof T>(
		type: K,
		listener: CustomEventListener,
		options?: boolean | EventListenerOptions
	): this {
		const onceListener = (event: CustomEvent) => {
			this.removeEventListener(type, onceListener, options)
			listener.call(this._eventTarget, event)
		}

		return this.addEventListener(type, onceListener, options)
	}

	/**
	 * 快捷派发事件
	 * @param {string} type 事件类型
	 * @param {any} detail 数据
	 * @param {object} data 传递额外的数据
	 * @returns
	 */
	emit<K extends keyof T>(type: K, detail?: any, data?: Partial<T[K]>): boolean {
		const event = this.createEvent(type, { detail })
		return this.dispatchEvent<K>(event, data)
	}

	/**
	 * 检查是否存在事件监听器
	 */
	has(type: string, includeOn?: boolean): boolean {
		return this.size(type, includeOn) > 0
	}

	/**
	 * 获取事件监听器数量
	 */
	size(type: string, includeOn?: boolean): number {
		const handlerCount = includeOn && typeof this[`on${type}`] === 'function' ? 1 : 0
		return (this._events?.[type]?.length || 0) + handlerCount
	}

	/**
	 * 清除事件监听器
	 */
	clear(type?: string): void {
		const types = type ? [type] : Object.keys(this._events)
		if (!types.length) return

		types.forEach((name) => {
			const listeners = this._events[name]
			if (listeners?.length) {
				listeners.forEach((listener) => {
					this.removeEventListener(name, listener)
				})
			}
			// 清除 onxxx 属性绑定的处理函数
			const onHandler = `on${name}`
			if (this[onHandler]) {
				delete this[onHandler]
			}
		})

		if (!type) {
			this._events = Object.create(null)
		}
	}

	/**
	 * 销毁实例
	 */
	destroy(): void {
		if (this._eventTarget) {
			this.clear()
			this._eventTarget = null!
			this._events = null!
		}
	}
}

export default DomEmitter
