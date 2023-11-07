import type {
  IOptions,
  DragEventMap,
  IBoundary,
  DragRange
} from './types'

// 默认配置项
const defaults: Omit<IOptions, 'handle'> = {
  direction: 'both',    // 拖动方向. 水平: ['horizontal' | 'x'], 垂直: ['vertical' | 'y']
  boundary: window,     // 可拖动的区域大小（一个对象，包含left、top、width、height四个属性）
  clickThreshold: 5,    // 触发click事件的临界阈值（当移动距离小于该值时，视为点击事件）
  onClick: () => {},    // Click事件回调函数
  onStart: () => {},    // 拖动开始时的回调函数
  onMove: () => {},     // 拖动过程中的回调函数
  onEnd: () => {},      // 拖动结束时的回调函数
}

export default class Draggable {
  // 拖动元素
  private element: HTMLElement
  // 拖动时监听的目标元素，默认为拖动元素
  private handle: HTMLElement
  // 配置项
  private options: IOptions
  // 拖动事件类型
  private eventMap: DragEventMap
  // 可拖动的区域边界
  private boundary: IOptions['boundary']
  // 记录开始拖动时鼠标点位
  private startX: number = 0
  private startY: number = 0
  // 记录开始拖动时的元素定位位置
  private positionLeft: number = 0
  private positionTop: number = 0
  // 元素可拖动的边界数据
  private dragRange: DragRange
  // 当前拖动状态
  private dragging: boolean = false
  // 是否可拖动
  private draggable: boolean = false

  constructor(element: HTMLElement | string, options: Partial<IOptions> = {}) {
    this.options = Object.assign({}, defaults, options) as IOptions
    this.element = element instanceof HTMLElement ? element : document.querySelector(element)
    this.handle = this.element
    if (options.handle) {
      this.handle = options.handle instanceof HTMLElement ? options.handle : document.querySelector(options.handle)
    }
    this.boundary = this.options.boundary
    this.eventMap = {
      start: 'mousedown',
      move: 'mousemove',
      end: 'mouseup'
    }
    if ('ontouchstart' in document) {
      this.eventMap = {
        start: 'touchstart',
        move: 'touchmove',
        end: 'touchend'
      }
    }
    
    // !绑定事件监听器时必须使用`bind`来指定内部this指向
    this.dragStart = this.dragStart.bind(this)
    this.dragMove = this.dragMove.bind(this)
    this.dragEnd = this.dragEnd.bind(this)

    this.bind()
  }
  /**
   * 绑定可拖动事件
   */
  public bind() {
    if (this.draggable) return
    this.draggable = true
    
    this.handle.addEventListener(this.eventMap.start, this.dragStart)
    this.handle.style.cursor = 'move'
  }
  /**
   * 移除可拖动事件
   */
  public unbind() {
    if (!this.draggable) return
    this.draggable = false
    // 删除可拖动事件
    this.handle.removeEventListener(this.eventMap.start, this.dragStart)
  }
  /**
   * 计算拖动边界位置数据
   */
  private getDragRange() {
    let boundingEdge: IBoundary = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
    if (this.boundary instanceof HTMLElement) {
      boundingEdge = this.boundary.getBoundingClientRect()
    } else if (this.boundary === window) {
      boundingEdge = {
        top: 0,
        bottom: window.innerHeight,
        left: 0,
        right: Math.min(window.innerWidth, document.documentElement.clientWidth)
      }
    } else if (typeof this.boundary === 'string') {
      const $el = document.querySelector(this.boundary)
      if ($el) {
        boundingEdge = $el.getBoundingClientRect() as IBoundary
      }
    } else if (Object.prototype.toString.call(this.boundary) === '[object Object]') {
      const { top, bottom, left, right } = this.boundary as IBoundary
      boundingEdge = {
        top: parseFloat(top as unknown as string),
        bottom: parseFloat(bottom as unknown as string),
        left: parseFloat(left as unknown as string),
        right: parseFloat(right as unknown as string)
      }
    }
    
    const boundingTarget = this.element.getBoundingClientRect()

    const diffLeft = boundingEdge.left - boundingTarget.left
    const diffRight = boundingEdge.right - boundingTarget.right
    const diffTop = boundingEdge.top - boundingTarget.top
    const diffBottom = boundingEdge.bottom - boundingTarget.bottom
    
    // 初始化边界数据
    return {
      minX: Math.min.apply(null, [diffLeft, diffRight]),
      maxX: Math.max.apply(null, [diffLeft, diffRight]),
      minY: Math.min.apply(null, [diffTop, diffBottom]),
      maxY: Math.max.apply(null, [diffTop, diffBottom])
    }
  }
  /**
   * 拖动开始
   */
  private dragStart(event: TouchEvent | MouseEvent) {
    // 阻止默认事件，例如页面滚动
    event.preventDefault()
    
    // 当前拖动状态
    this.dragging = true
    
    // 记录拖动元素的初始位置以及鼠标的初始位置
    const e = (<TouchEvent>event).touches ? (<TouchEvent>event).touches[0] : <MouseEvent>event
    this.startX = e.pageX
    this.startY = e.pageY
    this.positionLeft = parseFloat(getComputedStyle(this.element).left)
    this.positionTop = parseFloat(getComputedStyle(this.element).top)

    if (this.boundary) {
      this.dragRange = this.getDragRange()
    }

    // 调用拖动开始回调函数
    this.options.onStart(event)
    
    /**
     * 绑定移动和释放事件的回调函数
     * // 使用 {passive: false, capture: true }来声明事件监听器
     * // 如果在事件监听器中使用了`event.preventDefault()`方法来取消事件的默认行为，
     * // 同时浏览器又将该事件标记为被动的，那么`event.preventDefault()`方法将会失效，
     * // 因此，如果我们需要取消事件的默认行为，请务必使用{passive: false}选项来声明事件监听器。
     */
    document.addEventListener(this.eventMap.move, this.dragMove, { passive: false, capture: true })
    document.addEventListener(this.eventMap.end, this.dragEnd)
  }
  /**
   * 拖动移动中
   */
  private dragMove(event: TouchEvent | MouseEvent) {
    if (!this.dragging) return

    // 阻止默认事件，例如页面滚动
    event.preventDefault();
    
    const e = (<TouchEvent>event).touches ? (<TouchEvent>event).touches[0] : <MouseEvent>event
    // 计算鼠标当前位置相对上一次位置的偏移量
    let offsetX = e.pageX - this.startX
    let offsetY = e.pageY - this.startY
    
    // 判断是否需要水平/垂直拖动
    const direction = this.options.direction
    if (direction === 'horizontal' || direction === 'x') {
      offsetY = 0
    } else if (direction === 'vertical' || direction === 'y') {
      offsetX = 0
    }

    if (this.boundary && this.dragRange) {
      const { minX, maxX, minY, maxY } = this.dragRange

      if (offsetX < minX) {
        offsetX = minX
      } else if (offsetX > maxX) {
        offsetX = maxX
      }

      if (offsetY < minY) {
        offsetY = minY
      } else if (offsetY > maxY) {
        offsetY = maxY
      }
    }
    // 使用 translate 方法来设置元素的位置，需要记录开始的位移位置 {translateX, translateY}
    // this.element.style.transform = `translate(${translateX + offsetX}px, ${translateY + offsetY}px)`;
    this.element.style.left = `${this.positionLeft + offsetX}px`
    this.element.style.top = `${this.positionTop + offsetY}px`

    this.options.onMove(event, { offsetX, offsetY })
  }
  /**
   * 拖动结束 
   */
  private dragEnd(event: TouchEvent | MouseEvent) {
    if (!this.dragging) return
    this.dragging = false
    
    // !解绑监听器
    document.removeEventListener(this.eventMap.move, this.dragMove)
    document.removeEventListener(this.eventMap.end, this.dragEnd)

    const e = (<TouchEvent>event).touches ? (<TouchEvent>event).touches[0] : <MouseEvent>event
    const offsetX = e.pageX - this.startX
    const offsetY = e.pageY - this.startY
    // 根据勾股定律计算两点之间的距离 `c² = a² + b²`
    // 根据移动距离判断是否 click事件
    const moveDistance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
    if (moveDistance < this.options.clickThreshold) {
      this.options.onClick(event)
    }
    
    this.options.onEnd(event, { offsetX, offsetY })
  }
}
