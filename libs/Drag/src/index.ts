import type { IDragOptions, IBoundary, IDragRange, InitialPosition, EventMap } from './types'
import { matrixParser } from './utils'

// 默认配置
const defaults: IDragOptions = {
	direction: 'both',
	boundary: window,
	clickThreshold: 5,
	moveType: 'position',
	onClick: () => {},
	onStart: () => {},
	onMove: () => {},
	onEnd: () => {},
}

class Drag {
	private readonly options: IDragOptions
	private readonly element: HTMLElement //拖动元素
	private readonly handle: HTMLElement //触发元素
	private readonly boundary: IDragOptions['boundary'] //边界
	private readonly eventMap: EventMap

	private startX: number = 0 //记录开始拖动时鼠标点位
	private startY: number = 0
	private positionLeft: number = 0 //记录开始拖动时元素位置
	private positionTop: number = 0
	private translateX: number = 0 //记录开始拖动时元素位置
	private translateY: number = 0
	private initialPosition: InitialPosition // 初始位置
	private dragging: boolean = false //是否正在拖动
	private draggable: boolean = false //是否可拖拽
	private dragRange?: IDragRange // 拖动范围数据

	constructor(element: string | HTMLElement, options: IDragOptions = {}) {
		this.options = { ...defaults, ...options }
		this.element =
			element instanceof HTMLElement ? element : (document.querySelector(element) as HTMLElement)

		if (!this.element) {
			throw new Error('Element not found')
		}

		this.handle = this.element
		if (options.handle) {
			const handleElement =
				options.handle instanceof HTMLElement
					? options.handle
					: (document.querySelector(options.handle) as HTMLElement)
			if (handleElement) {
				this.handle = handleElement
			}
		}

		this.boundary = this.options.boundary
		this.eventMap =
			'ontouchstart' in document
				? { start: 'touchstart', move: 'touchmove', end: 'touchend' }
				: { start: 'mousedown', move: 'mousemove', end: 'mouseup' }

		const computedStyle = getComputedStyle(this.element)
		this.initialPosition = {
			left: computedStyle.left,
			top: computedStyle.top,
			transform: computedStyle.transform,
		}

		//! Bind methods 指定事件监听器内部this指向
		this.dragStart = this.dragStart.bind(this)
		this.dragMove = this.dragMove.bind(this)
		this.dragEnd = this.dragEnd.bind(this)
		this.bind()
	}

	/**
	 * 重置元素位置为初始位置
	 */
	public reset(): void {
		if (this.options.moveType === 'transform') {
			this.element.style.transform = this.initialPosition.transform
			this.translateX = 0
			this.translateY = 0
		} else {
			this.element.style.left = this.initialPosition.left
			this.element.style.top = this.initialPosition.top
		}
	}

	/**
	 * 更新元素位置
	 */
	private updatePosition(offsetX: number, offsetY: number): void {
		if (this.options.moveType === 'transform') {
			const newTranslateX = this.translateX + offsetX
			const newTranslateY = this.translateY + offsetY
			this.element.style.transform = `translate(${newTranslateX}px, ${newTranslateY}px)`
		} else {
			this.element.style.left = `${this.positionLeft + offsetX}px`
			this.element.style.top = `${this.positionTop + offsetY}px`
		}
	}

	/**
	 * 绑定拖动事件
	 */
	public bind(): void {
		if (this.draggable) return
		this.draggable = true
		this.handle.addEventListener(this.eventMap.start, this.dragStart)
		this.handle.style.cursor = 'move'
	}

	/**
	 * 移除拖动事件
	 */
	public unbind(): void {
		if (!this.draggable) return
		this.draggable = false
		this.handle.removeEventListener(this.eventMap.start, this.dragStart)
	}

	/**
	 * 获取拖动范围
	 */
	private getDragRange(): IDragRange {
		let boundingEdge: { top: number; right: number; bottom: number; left: number }

		if (this.boundary instanceof HTMLElement) {
			boundingEdge = this.boundary.getBoundingClientRect()
		} else if (this.boundary === window) {
			boundingEdge = {
				top: 0,
				bottom: window.innerHeight,
				left: 0,
				right: Math.min(window.innerWidth, document.documentElement.clientWidth),
			}
		} else if (typeof this.boundary === 'string') {
			const $el = document.querySelector(this.boundary)
			if ($el) {
				boundingEdge = $el.getBoundingClientRect()
			} else {
				boundingEdge = { top: 0, right: 0, bottom: 0, left: 0 }
			}
		} else if (this.boundary && typeof this.boundary === 'object') {
			const { top, bottom, left, right } = this.boundary as IBoundary
			boundingEdge = {
				top: parseFloat(top as string),
				bottom: parseFloat(bottom as string),
				left: parseFloat(left as string),
				right: parseFloat(right as string),
			}
		} else {
			boundingEdge = { top: 0, right: 0, bottom: 0, left: 0 }
		}

		const boundingTarget = this.element.getBoundingClientRect()
		const diffLeft = boundingEdge.left - boundingTarget.left
		const diffRight = boundingEdge.right - boundingTarget.right
		const diffTop = boundingEdge.top - boundingTarget.top
		const diffBottom = boundingEdge.bottom - boundingTarget.bottom

		return {
			minX: Math.min(diffLeft, diffRight),
			maxX: Math.max(diffLeft, diffRight),
			minY: Math.min(diffTop, diffBottom),
			maxY: Math.max(diffTop, diffBottom),
		}
	}

	private dragStart(event: MouseEvent | TouchEvent): void {
		event.preventDefault() // 阻止默认行为，如页面滚动
		this.dragging = true

		const e = 'touches' in event ? event.touches[0] : event
		this.startX = e.pageX
		this.startY = e.pageY

		if (this.options.moveType === 'transform') {
			const transform = getComputedStyle(this.element).transform
			const matrix = matrixParser(transform)
			this.translateX = matrix.m41
			this.translateY = matrix.m42
		} else {
			this.positionLeft = parseFloat(getComputedStyle(this.element).left)
			this.positionTop = parseFloat(getComputedStyle(this.element).top)
		}

		if (this.boundary) {
			this.dragRange = this.getDragRange()
		}

		this.options.onStart?.(event)

		/**
		 * 绑定移动和释放事件监听器
		 * // 使用 `{passive: false, capture: true }` 声明事件监听器
		 * // 如果在事件监听器中使用了`event.preventDefault()`方法来取消事件的默认行为，
		 * // 同时浏览器又将该事件标记为被动的，那么`event.preventDefault()`方法将会失效，
		 * // 因此，如果我们需要取消事件的默认行为，请务必使用`{passive: false}` 选项来声明事件监听器。
		 */
		document.addEventListener(this.eventMap.move, this.dragMove, { passive: false, capture: true })
		document.addEventListener(this.eventMap.end, this.dragEnd)
	}

	private dragMove(event: MouseEvent | TouchEvent): void {
		if (!this.dragging) return
		event.preventDefault()

		const e = 'touches' in event ? event.touches[0] : event
		let offsetX = e.pageX - this.startX
		let offsetY = e.pageY - this.startY

		// 限制拖动方向
		const direction = this.options.direction
		if (direction === 'horizontal' || direction === 'x') {
			offsetY = 0
		} else if (direction === 'vertical' || direction === 'y') {
			offsetX = 0
		}

		// 限制拖动范围
		if (this.boundary && this.dragRange) {
			const { minX, maxX, minY, maxY } = this.dragRange
			offsetX = Math.max(minX, Math.min(maxX, offsetX))
			offsetY = Math.max(minY, Math.min(maxY, offsetY))
		}

		this.updatePosition(offsetX, offsetY)
		this.options.onMove?.(event, { offsetX, offsetY })
	}

	private dragEnd(event: MouseEvent | TouchEvent): void {
		if (!this.dragging) return
		this.dragging = false

		// 移除事件监听器
		document.removeEventListener(this.eventMap.move, this.dragMove)
		document.removeEventListener(this.eventMap.end, this.dragEnd)

		const e = 'touches' in event ? event.touches[0] : event
		const offsetX = e.pageX - this.startX
		const offsetY = e.pageY - this.startY

		// 计算移动距离 (勾股定律 `c² = a² + b²`)
		// 根据移动距离判断是否 click 事件
		const moveDistance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
		if (moveDistance < (this.options.clickThreshold ?? defaults.clickThreshold!)) {
			this.options.onClick?.(event)
		}

		this.options.onEnd?.(event, { offsetX, offsetY })
	}
}

export default Drag
