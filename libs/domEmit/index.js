const _NAME = 'DomEmitter'

class DomEmitter {
	constructor(target) {
		if (typeof document === 'undefined') {
			throw new Error(`${_NAME} can only be used in browser environment`)
		}

		this._events = {}
		this._eventTarget = target instanceof HTMLElement ? target : document.createElement('div')
	}

	// 绑定事件监听器
	addEventListener(type, listener, options = {}) {
		if (typeof type !== 'string' || type === '') {
			throw new TypeError(`[${_NAME}] eventType must be a string`)
		}
		if (typeof listener !== 'function') {
			throw new TypeError(`[${_NAME}] listener must be a function`)
		}
		// 支持 options 对象或 useCapture 布尔值
		this._eventTarget.addEventListener(type, listener, options)
		this._events[type] = this._events[type] || []
		this._events[type].push(listener)
		return this
	}

	// 移除事件监听器
	removeEventListener(type, listener, options = {}) {
		if (typeof type !== 'string' || type === '') {
			throw new TypeError(`[${_NAME}] eventType must be a string`)
		}
		this._eventTarget.removeEventListener(type, listener, options)
		if (this._events[type]) {
			this._events[type] = this._events[type].filter((l) => l !== listener)
		}
		return this
	}

	/**
	 * 派发事件
	 * @params {Event} event 事件对象
	 * @params {Object} options 传递额外的数据
	 */
	dispatchEvent(event, options) {
		if (!(event instanceof Event)) {
			throw new TypeError(`[${_NAME}] event must be an instance of Event`)
		}

		if (typeof options === 'object') {
			for (const key in options) {
				if (Object.hasOwnProperty.call(options, key)) {
					event[key] = options[key]
				}
			}
		}

		return this._eventTarget.dispatchEvent(event)
	}

	// 创建自定义事件
	createEvent(type = 'custom', options = {}) {
		if (typeof type !== 'string') {
			throw new TypeError(`[${_NAME}] eventType must be a string`)
		}
		const defaults = {
			bubbles: true,
			cancelable: true,
			composed: false,
			detail: null,
		}
		const evtOption = { ...defaults, ...options }
		if ('CustomEvent' in window) {
			return new CustomEvent(type, evtOption)
		} else {
			const event = document.createEvent('CustomEvent')
			event.initCustomEvent(type, evtOption.bubbles, evtOption.cancelable, evtOption.detail)
			return event
		}
	}

	// 快捷绑定事件
	on(type, listener, options) {
		return this.addEventListener(type, listener, options)
	}

	// 快捷移除事件
	off(type, listener, options) {
		return this.removeEventListener(type, listener, options)
	}

	// 快捷绑定一次性事件
	once(type, listener, options) {
		const onceListener = (event) => {
			this.removeEventListener(type, onceListener, options)
			listener.call(this, event, options)
		}
		return this.addEventListener(type, onceListener, options)
	}

	/**
	 * 快捷派发事件
	 * @param {string} type 事件类型
	 * @param {any} detail 数据
	 * @param {object} options 传递额外的数据
	 * @returns
	 */
	emit(type, detail, options) {
		const event = this.createEvent(type, { detail })

		// 触发通过赋值绑定的事件
		const onHandler = this[`on${type}`]
		if (typeof onHandler === 'function') {
			onHandler.call(this, event)
		}

		return this.dispatchEvent(event, options)
	}

	// 判断事件是否绑定
	has(type, includeOn) {
		return this.size(type, includeOn) > 0
	}

	// 获取事件绑定数量
	size(type, includeOn) {
		let _count = 0
		if (includeOn) {
			_count = typeof this[`on${type}`] === 'function' ? 1 : 0
		}
		return this._events[type]?.length || 0 + _count
	}

	// 清除事件绑定
	clear(type) {
		const types = type ? [type] : Object.keys(this._events)
		if (!types.length) return

		types.forEach((name) => {
			const listeners = this._events[name]
			if (listeners?.length) {
				listeners.forEach((listener) => {
					this.removeEventListener(name, listener)
				})
			}
		})

		if (!type) {
			this._events = {}
		}
	}

	// 销毁事件绑定
	destroy() {
		if (this._eventTarget) {
			this.clear()
			this._eventTarget = null
			this._events = null
		}
	}
}
