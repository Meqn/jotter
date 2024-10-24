export interface Offset {
	offsetX: number
	offsetY: number
}

export interface IBoundary {
	top: number | string
	bottom: number | string
	left: number | string
	right: number | string
}

export interface IDragRange {
	minX: number
	maxX: number
	minY: number
	maxY: number
}

export interface IDragOptions {
	/**
	 * The direction of the drag
	 * @default both
	 */
	direction?: 'both' | 'horizontal' | 'vertical' | 'x' | 'y'
	/**
	 * The boundary of the drag
	 * @default window
	 */
	boundary?: Window | HTMLElement | string | IBoundary
	/**
	 * The element that will trigger the drag event
	 * @default element
	 */
	handle?: HTMLElement | string
	/**
	 * The type of the move
	 * @default position
	 */
	moveType?: 'position' | 'transform'
	/**
	 * The threshold of the click event
	 *
	 * 触发click事件的临界阈值 (当移动距离小于该值时，视为点击事件)
	 * @default 5
	 */
	clickThreshold?: number
	/**
	 * The callback function when the drag starts
	 */
	onClick?: (event: MouseEvent | TouchEvent) => void
	/**
	 * The callback function when the drag starts
	 */
	onStart?: (event: MouseEvent | TouchEvent) => void
	/**
	 * The callback function when the drag moves
	 */
	onMove?: (event: MouseEvent | TouchEvent, offset: Offset) => void
	/**
	 * The callback function when the drag ends
	 */
	onEnd?: (event: MouseEvent | TouchEvent, offset: Offset) => void
}

export interface InitialPosition {
	left: string
	top: string
	transform: string
}

export interface EventMap {
	start: 'touchstart' | 'mousedown'
	move: 'touchmove' | 'mousemove'
	end: 'touchend' | 'mouseup'
}
