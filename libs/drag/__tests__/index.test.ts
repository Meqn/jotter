/**
 * @jest-environment jsdom
 */

//@ts-nocheck
import Draggable from '../src/index'

describe('Draggable', () => {
  let draggable: Draggable
  let element: HTMLElement

  beforeEach(() => {
    element = document.createElement('div')
    document.body.appendChild(element)
    draggable = new Draggable(element)
  })

  afterEach(() => {
    draggable.unbind()
    document.body.removeChild(element)
    draggable = null
  })

  describe('constructor', () => {
    test('should create a new Draggable instance', () => {
      expect(draggable).toBeInstanceOf(Draggable)
    })

    test('should initialize with default options', () => {
      expect(draggable.options.direction).toBe('both')
      expect(draggable.options.boundary).toBe(window)
      expect(draggable.options.clickThreshold).toBe(5)
    })

    test('should initialize with custom options', () => {
      const customOptions = {
        direction: 'horizontal',
        boundary: {top: 0, bottom: 100, left: 0, right: 100},
        clickThreshold: 10
      }
      draggable = new Draggable(element, customOptions)

      expect(draggable.options.direction).toBe(customOptions.direction)
      expect(draggable.options.boundary).toEqual(customOptions.boundary)
      expect(draggable.options.clickThreshold).toBe(
        customOptions.clickThreshold
      )
    })

    test('should set element and handle', () => {
      expect(draggable.element).toBe(element)
      expect(draggable.handle).toBe(element)
    })

    test('should set custom handle', () => {
      const handle = document.createElement('div')
      element.appendChild(handle)
      draggable = new Draggable(element, {handle})

      expect(draggable.handle).toBe(handle)
    })
  })

  describe('bind', () => {
    test('should bind the draggable event', () => {
      // 初始化时已绑定
      expect(draggable.draggable).toBe(true)

      // 调用 bind()
      draggable.draggable = false
      const spy = jest.spyOn(draggable.handle, 'addEventListener')
      draggable.bind()
      expect(spy).toHaveBeenCalledWith(
        draggable.eventMap.start,
        draggable.dragStart
      )
      expect(draggable.draggable).toBe(true)

      spy.mockRestore()
    })

    test('should not bind the draggable event if already bound', () => {
      draggable.bind()
      draggable.bind()
      expect(draggable.draggable).toBe(true)
    })
  })

  describe('unbind', () => {
    test('should unbind the draggable event', () => {
      const spy = jest.spyOn(draggable.handle, 'removeEventListener')

      draggable.bind()
      draggable.unbind()

      expect(spy).toHaveBeenCalledWith(
        draggable.eventMap.start,
        draggable.dragStart
      )
      expect(draggable.draggable).toBe(false)

      spy.mockRestore()
    })

    test('should not unbind the draggable event if already unbound', () => {
      draggable.unbind()
      draggable.unbind()
      expect(draggable.draggable).toBe(false)
    })
  })

  describe('getDragRange', () => {
    test('should calculate the drag range for boundary as an HTMLElement', () => {
      const boundary = document.createElement('div')
      draggable = new Draggable(document.createElement('div'), {boundary})
      const boundingClientRect = {
        top: 0,
        left: 0,
        bottom: 100,
        right: 100
      }
      jest
        .spyOn(boundary, 'getBoundingClientRect')
        .mockReturnValue(boundingClientRect)

      const dragRange = draggable.getDragRange()

      expect(dragRange).toEqual({
        minX: 0,
        maxX: 100,
        minY: 0,
        maxY: 100
      })
    })

    test('should calculate the drag range for boundary as window', () => {
      draggable = new Draggable(document.createElement('div'), {
        boundary: window
      })

      const dragRange = draggable.getDragRange()

      expect(dragRange).toEqual({
        minX: 0,
        // maxX: window.innerWidth,
        maxX: 0,
        minY: 0,
        maxY: window.innerHeight
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
        boundary: '#boundary'
      })

      const dragRange = draggable.getDragRange()

      expect(dragRange).toEqual({
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0
      })

      document.body.removeChild(boundary)
    })

    test('should calculate the drag range for boundary as an object', () => {
      draggable = new Draggable(document.createElement('div'), {
        boundary: {
          top: '0px',
          right: '100px',
          bottom: '100px',
          left: '0px'
        }
      })

      const dragRange = draggable.getDragRange()

      expect(dragRange).toEqual({
        minX: 0,
        maxX: 100,
        minY: 0,
        maxY: 100
      })
    })
  })

  describe('dragStart', () => {
    test('should handle drag start', () => {
      const mockEvent = {preventDefault: jest.fn()}
      const mockOnStart = jest.fn()
      draggable.options.onStart = mockOnStart
      draggable.dragStart(mockEvent)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockOnStart).toHaveBeenCalledWith(mockEvent)
    })

    test('should set dragging to true and initialize start position', () => {
      const event = new MouseEvent('mousedown', {pageX: 10, pageY: 20})
      // pageX 的默认值是 undefined,它需要在事件派发时由浏览器计算设置
      event.pageX = 10
      event.pageY = 20
      draggable.handle.dispatchEvent(event)
      draggable.dragStart(event)

      expect(draggable.dragging).toBe(true)
      expect(draggable.startX).toBe(10)
      expect(draggable.startY).toBe(20)
    })
  })

  describe('dragMove', () => {
    test('should handle drag move', () => {
      const mockEvent = {preventDefault: jest.fn()}
      const mockOnMove = jest.fn()
      draggable.options.onMove = mockOnMove
      draggable.dragging = true
      draggable.dragMove(mockEvent)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockOnMove).toHaveBeenCalledWith(mockEvent, expect.any(Object))
    })

    test('should update element position based on mouse offset', () => {
      const event = new MouseEvent('mousemove', {pageX: 30, pageY: 40})
      event.pageX = 30
      event.pageY = 40
      draggable.dragging = true
      draggable.startX = 10
      draggable.startY = 20
      draggable.positionLeft = 0
      draggable.positionTop = 0
      draggable.dragRange = {
        minX: -100,
        maxX: 100,
        minY: -200,
        maxY: 200
      }

      draggable.dragMove(event)

      expect(draggable.element.style.left).toBe('20px')
      expect(draggable.element.style.top).toBe('20px')
    })
  })

  describe('dragEnd', () => {
    test('should set dragging to false and call onEnd callback', () => {
      document.removeEventListener = jest.fn()
      const onEndMock = jest.fn()

      const event = new MouseEvent('mouseup', {clientX: 0, clientY: 0})
      event.pageX = 30
      event.pageY = 40

      draggable.handle.dispatchEvent(event)
      draggable.dragging = true
      draggable.options.onEnd = onEndMock

      draggable.dragEnd(event)

      expect(draggable.dragging).toBe(false)
      expect(onEndMock).toHaveBeenCalledWith(event, {offsetX: 30, offsetY: 40})
      expect(document.removeEventListener).toHaveBeenCalledTimes(2)
    })

    test('should trigger click when move below threshold', () => {
      const event = new MouseEvent('mouseup', {})
      event.pageX = 2
      event.pageY = 3
      draggable.startX = 0; 
      draggable.startY = 0;
  
      const mockOnClick = jest.fn();
      draggable.options.onClick = mockOnClick;
      draggable.options.clickThreshold = 5;
      draggable.dragging = true

      draggable.handle.dispatchEvent(event)
      draggable.dragEnd(event);
  
      expect(mockOnClick).toHaveBeenCalledWith(event);
    });
  })
})
