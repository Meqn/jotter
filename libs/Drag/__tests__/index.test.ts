/**
 * @jest-environment jsdom
 */
//@ts-nocheck
import Draggable from '../src/index'

// Mock getBoundingClientRect
const mockElementBoundingClientRect = () => ({
	x: 0,
	y: 0,
	width: 100,
	height: 100,
	top: 0,
	right: 100,
	bottom: 100,
	left: 0,
})

/**
 * 模拟 touch 事件
 * Jest 的 jsdom 环境中 Touch 构造函数默认是不可用的，所以需要手动创建一个 TouchEvent
 *
 * @example
 * const touchStartEvent = mockTouchEvent('touchstart', 50, 50) //模拟 touchstart 事件
 * const touchHandler = jest.fn()
 * document.body.addEventListener('touchstart', touchHandler) // 监听触摸事件
 * document.body.dispatchEvent(touchStartEvent) // 触发 touchstart 事件
 * expect(touchHandler).toHaveBeenCalled() // 检查事件处理程序是否被调用
 */
const mockTouchEvent = (type: string, x: number, y: number): TouchEvent => {
	// 模拟 Touch 对象
	const touch = {
		identifier: 0, // 唯一标识符
		target: document.body, // 事件的目标元素
		clientX: x, // 触摸点的 X 坐标
		clientY: y, // 触摸点的 Y 坐标
		pageX: x,
		pageY: y,
		screenX: x,
		screenY: y,
	}

	// 模拟 touchstart 事件
	return new TouchEvent(type, {
		touches: [touch], // 触摸点列表
		targetTouches: [touch], // 目标元素的触摸点
		changedTouches: [touch], // 改变的触摸点
		bubbles: true,
		cancelable: true,
	})
}

describe('Draggable', () => {
	let element: HTMLElement
	let draggable: Draggable

	beforeEach(() => {
		element = document.createElement('div')
		document.body.appendChild(element)
		draggable = new Draggable(element)

		jest.spyOn(element, 'getBoundingClientRect').mockReturnValue(mockElementBoundingClientRect())
	})

	afterEach(() => {
		draggable.unbind()
		document.body.removeChild(element)
		jest.clearAllMocks()
	})

	describe('Constructor', () => {
		test('should create a new Draggable instance', () => {
			expect(draggable).toBeInstanceOf(Draggable)
		})

		test('should create instance with element selector', () => {
			element.innerHTML = '<div id="draggable"></div>'
			draggable = new Draggable('#draggable')
			expect(draggable).toBeInstanceOf(Draggable)
		})

		test('should create instance with HTMLElement', () => {
			draggable = new Draggable(element)
			expect(draggable).toBeInstanceOf(Draggable)
		})

		test('should throw error with invalid selector', () => {
			expect(() => new Draggable('#non-existent')).toThrow('Element not found')
		})

		test('should initialize with default options', () => {
			expect(draggable.options.direction).toBe('both')
			expect(draggable.options.boundary).toBe(window)
			expect(draggable.options.clickThreshold).toBe(5)
		})

		test('should initialize with custom options', () => {
			const customOptions = {
				direction: 'horizontal',
				boundary: { top: 0, bottom: 100, left: 0, right: 100 },
				clickThreshold: 10,
			}
			draggable = new Draggable(element, customOptions)

			expect(draggable.options.direction).toBe(customOptions.direction)
			expect(draggable.options.boundary).toEqual(customOptions.boundary)
			expect(draggable.options.clickThreshold).toBe(customOptions.clickThreshold)
		})

		test('should set element and handle', () => {
			expect(draggable.element).toBe(element)
			expect(draggable.handle).toBe(element)
		})

		test('should set custom handle', () => {
			const handle = document.createElement('div')
			element.appendChild(handle)
			draggable = new Draggable(element, { handle })

			expect(draggable.handle).toBe(handle)
		})
	})

	describe('Options', () => {
		test('should respect direction option - vertical', () => {
			const onMove = jest.fn()
			draggable = new Draggable(element, {
				direction: 'vertical',
				onMove,
			})

			// Simulate drag
			const mousedownEvent = new MouseEvent('mousedown', {})
			const mousemoveEvent = new MouseEvent('mousemove', {})
			mousedownEvent.pageX = 0
			mousedownEvent.pageY = 0
			mousemoveEvent.pageX = 150
			mousemoveEvent.pageY = 150
			element.dispatchEvent(mousedownEvent)
			draggable.dragRange = false //不做范围限制
			document.dispatchEvent(mousemoveEvent)

			expect(onMove).toHaveBeenCalledWith(
				expect.any(MouseEvent),
				expect.objectContaining({
					offsetX: 0, // Should be 0 for vertical movement
					offsetY: 150,
				})
			)
		})

		test('should respect direction option - horizontal', () => {
			const onMove = jest.fn()
			draggable = new Draggable(element, {
				direction: 'x',
				onMove,
			})

			// Simulate drag
			element.dispatchEvent(new MouseEvent('mousedown', { pageX: 0, pageY: 0 }))

			const mousemoveEvent = new MouseEvent('mousemove', {})
			draggable.startX = 0
			draggable.startY = 0
			draggable.dragRange = false //不做范围限制
			mousemoveEvent.pageX = 120
			mousemoveEvent.pageY = 120
			document.dispatchEvent(mousemoveEvent)

			expect(onMove).toHaveBeenCalledWith(
				expect.any(MouseEvent),
				expect.objectContaining({
					offsetX: 120,
					offsetY: 0, // Should be 0 for horizontal movement
				})
			)
		})

		test('should respect moveType option - transform', () => {
			// element.style.transform = 'translate(0px, 0px)'
			draggable = new Draggable(element, {
				moveType: 'transform',
			})

			// Simulate drag
			const mousedownEvent = new MouseEvent('mousedown', {})
			const mousemoveEvent = new MouseEvent('mousemove', {})
			mousedownEvent.pageX = 0
			mousedownEvent.pageY = 0
			mousemoveEvent.pageX = 100
			mousemoveEvent.pageY = 100
			element.dispatchEvent(mousedownEvent)
			draggable.dragRange = false //不做范围限制
			document.dispatchEvent(mousemoveEvent)

			expect(element.style.transform).toContain('translate(100px, 100px)')
		})
	})

	describe('Events', () => {
		test('should handle mouse events', () => {
			const onStart = jest.fn()
			const onMove = jest.fn()
			const onEnd = jest.fn()

			draggable = new Draggable(element, {
				onStart,
				onMove,
				onEnd,
			})

			// Simulate drag sequence
			element.dispatchEvent(new MouseEvent('mousedown', {}))
			document.dispatchEvent(new MouseEvent('mousemove', {}))
			document.dispatchEvent(new MouseEvent('mouseup', {}))

			expect(onStart).toHaveBeenCalledTimes(1)
			expect(onMove).toHaveBeenCalledTimes(1)
			expect(onEnd).toHaveBeenCalledTimes(1)
		})

		test('should handle touch events', () => {
			// 设置 `'ontouchstart' in document` 为 true
			Object.defineProperty(document, 'ontouchstart', {
				value: true,
				writable: true,
			})
			const onStart = jest.fn()
			const onMove = jest.fn()
			const onEnd = jest.fn()

			draggable = new Draggable(element, { onStart, onMove, onEnd })
			draggable.bind() // 重新绑定事件

			// Simulate touch sequence
			element.dispatchEvent(mockTouchEvent('touchstart', 0, 0))
			document.dispatchEvent(mockTouchEvent('touchmove', 100, 100))
			document.dispatchEvent(mockTouchEvent('touchend', 100, 100))

			expect(onStart).toHaveBeenCalledTimes(1)
			expect(onMove).toHaveBeenCalledTimes(1)
			expect(onEnd).toHaveBeenCalledTimes(1)
		})

		test('should handle drag start', () => {
			const mockEvent = { preventDefault: jest.fn(), pageX: 10, pageY: 20 }
			const mockOnStart = jest.fn()
			draggable.options.onStart = mockOnStart

			draggable.dragStart(mockEvent)

			expect(mockEvent.preventDefault).toHaveBeenCalled()
			expect(mockOnStart).toHaveBeenCalledWith(mockEvent)
			expect(draggable.dragging).toBe(true)
			expect(draggable.startX).toBe(10)
			expect(draggable.startY).toBe(20)
		})

		test('should handle drag move', () => {
			const mockEvent = { preventDefault: jest.fn(), pageX: 30, pageY: 40 }
			const mockOnMove = jest.fn()
			draggable.options.onMove = mockOnMove
			draggable.dragging = true
			draggable.startX = 10
			draggable.startY = 20
			draggable.positionLeft = 0
			draggable.positionTop = 0
			draggable.dragRange = {
				minX: -100,
				maxX: 100,
				minY: -200,
				maxY: 200,
			}

			draggable.dragMove(mockEvent)

			expect(mockEvent.preventDefault).toHaveBeenCalled()
			expect(mockOnMove).toHaveBeenCalledWith(mockEvent, expect.any(Object))
			expect(draggable.element.style.left).toBe('20px')
			expect(draggable.element.style.top).toBe('20px')
		})

		test('should handle drag end', () => {
			document.removeEventListener = jest.fn()
			const onEndMock = jest.fn()

			const event = new MouseEvent('mouseup', { clientX: 0, clientY: 0 })
			event.pageX = 30
			event.pageY = 40

			draggable.handle.dispatchEvent(event)
			draggable.dragging = true
			draggable.options.onEnd = onEndMock

			draggable.dragEnd(event)

			expect(draggable.dragging).toBe(false)
			expect(onEndMock).toHaveBeenCalledWith(event, { offsetX: 30, offsetY: 40 })
			expect(document.removeEventListener).toHaveBeenCalledTimes(2)
		})

		test('should trigger click when move below threshold', () => {
			const event = new MouseEvent('mouseup', {})
			// pageX 的默认值是 undefined,它需要在事件派发时由浏览器计算设置
			event.pageX = 2
			event.pageY = 3
			draggable.startX = 0
			draggable.startY = 0

			const mockOnClick = jest.fn()
			draggable.options.onClick = mockOnClick
			draggable.options.clickThreshold = 5
			draggable.dragging = true

			draggable.handle.dispatchEvent(event)
			draggable.dragEnd(event)

			expect(mockOnClick).toHaveBeenCalledWith(event)
			expect(mockOnClick).toHaveBeenCalledTimes(1)
		})
	})

	describe('DragRange', () => {
		test('should calculate the drag range for boundary as an HTMLElement', () => {
			const boundary = document.createElement('div')
			draggable = new Draggable(element, { boundary })
			const boundingClientRect = {
				top: 0,
				left: 0,
				bottom: 240,
				right: 240,
			}
			jest.spyOn(boundary, 'getBoundingClientRect').mockReturnValue(boundingClientRect)

			const dragRange = draggable.getDragRange()

			expect(dragRange).toEqual({
				minX: 0,
				maxX: 140,
				minY: 0,
				maxY: 140,
			})

			jest.spyOn(boundary, 'getBoundingClientRect').mockRestore()
		})

		test('should calculate the drag range for boundary as window', () => {
			draggable = new Draggable(document.createElement('div'), {
				boundary: window,
			})

			const dragRange = draggable.getDragRange()

			expect(dragRange).toEqual({
				minX: 0,
				// maxX: window.innerWidth,
				maxX: 0,
				minY: 0,
				maxY: window.innerHeight,
			})
		})

		test('should calculate the drag range for boundary as a CSS selector', () => {
			const boundary = document.createElement('div')
			boundary.style.top = '0px'
			boundary.style.right = '100px'
			boundary.style.bottom = '100px'
			boundary.style.left = '0px'
			document.body.appendChild(boundary)

			draggable = new Draggable(document.createElement('div'), {
				boundary: '#boundary',
			})

			const dragRange = draggable.getDragRange()

			expect(dragRange).toEqual({
				minX: 0,
				maxX: 0,
				minY: 0,
				maxY: 0,
			})

			document.body.removeChild(boundary)
		})

		test('should calculate the drag range for boundary as an object', () => {
			draggable = new Draggable(document.createElement('div'), {
				boundary: {
					top: '0px',
					right: '100px',
					bottom: '100px',
					left: '0px',
				},
			})

			const dragRange = draggable.getDragRange()

			expect(dragRange).toEqual({
				minX: 0,
				maxX: 100,
				minY: 0,
				maxY: 100,
			})
		})
	})

	describe('Methods', () => {
		test('should bind and unbind events', () => {
			draggable = new Draggable(element)

			const addEventListenerSpy = jest.spyOn(element, 'addEventListener')
			const removeEventListenerSpy = jest.spyOn(element, 'removeEventListener')

			draggable.unbind()
			expect(removeEventListenerSpy).toHaveBeenCalled()

			draggable.bind()
			expect(addEventListenerSpy).toHaveBeenCalled()
		})

		test('should reset to initial position', () => {
			element.setAttribute('style', 'position: fixed; top:10px; left:12px;')
			draggable = new Draggable(element)

			// Simulate drag
			element.dispatchEvent(new MouseEvent('mousedown', { pageX: 0, pageY: 0 }))
			document.dispatchEvent(new MouseEvent('mousemove', { pageX: 100, pageY: 100 }))
			document.dispatchEvent(new MouseEvent('mouseup', { pageX: 100, pageY: 100 }))

			draggable.reset()

			expect(element.style.left).toBe('12px')
			expect(element.style.top).toBe('10px')
		})
	})
})
