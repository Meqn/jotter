/**
  mousedown, mouseup, click 事件执行顺序:
   1. 鼠标左键: 依次触发 mousedown、mouseup、click，前一个事件执行完毕才会执行下一个事件
   2. 鼠标右键: 依次触发 mousedown、mouseup，同上，但不会触发 click事件

  实现逻辑：
   1. 首先计算拖拽边界，返回`X`和`Y`的移动位置最大最小值 `{minX,maxX,minY,maxY}`
   2. start时，记录鼠标按下时的位置(startX)和元素的位置(positionLeft)；并绑定move和end事件
   3. move时，用当前位置减去开始时的位置，计算出偏移量(offsetX); 如果限制水平或垂直移动方向，则设置偏移量为0；如果超出拖拽边界，则设置偏移量为最大最小值。
   4. end时，解绑move和end事件；计算偏移量是否为click事件。
  
  配置项：
  options = {
    handle: [string, HTMLElement],
    boundary: [string, HTMLElement, window, object],
    direction: [string, 'horizontal' | 'vertical' | 'both'],
    clickThreshold: number,
    onClick,
    onStart,
    onMove,
    onEnd
  }

  exmaples:
  new Draggable('#drag', {
    handle: '#drag-handle',
    boundary: '#drag-container'
    direction: 'both',
    clickThreshold: 5
    onClick: (e) => {},
    onStart: (e) => {},
    onMove: (e) => {},
    onEnd: (e) => {}
  })
 */

export default class Draggable {
  constructor(element, options = {}) {
    this.options = Object.assign({
      direction: 'both',    // 拖拽方向. 水平: ['horizontal' | 'x'], 垂直: ['vertical' | 'y']
      boundary: window,     // 可拖拽的区域大小（一个对象，包含left、top、width、height四个属性）
      clickThreshold: 5,    // 触发click事件的临界阈值（当移动距离小于该值时，视为点击事件）
      onClick: () => {},    // Click事件回调函数
      onStart: () => {},    // 拖拽开始时的回调函数
      onMove: () => {},     // 拖拽过程中的回调函数
      onEnd: () => {},      // 拖拽结束时的回调函数
    }, options)

    // 拖拽元素
    this.element = element instanceof HTMLElement ? element : document.querySelector(element)
    // 拖拽时监听的目标元素，默认为所传入的元素
    this.handle = this.element
    if (options.handle) {
      this.handle = options.handle instanceof HTMLElement ? options.handle : document.querySelector(options.handle)
    }
    // 可拖拽的区域边界
    this.boundary = this.options.boundary
    // 记录开始拖拽时鼠标点位
    this.startX = 0
    this.startY = 0
    // 记录开始拖拽时的元素定位位置
    this.positionLeft = 0
    this.positionTop = 0

    // 事件类型处理
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

    this.init()
  }
  // 初始化拖拽绑定事件
  init() {
    this.handle.addEventListener(this.eventMap.start, this.dragStart)
    this.handle.style.cursor = 'move'

    if (this.boundary) {
      this.dragRange = this.getDragRange()
    }
  }

  destroy() {
    this.handle.removeEventListener(this.eventMap.start, this.dragStart)
  }
  /**
   * 计算拖拽边界位置数据
   */
  getDragRange() {
    let boundingEdge = {}
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
        boundingEdge = $el.getBoundingClientRect()
      }
    } else if (Object.prototype.toString.call(this.boundary) === '[object Object]') {
      const { top, bottom, left, right } = this.boundary
      boundingEdge = {
        top: parseFloat(top),
        bottom: parseFloat(bottom),
        left: parseFloat(left),
        right: parseFloat(right)
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
   * 拖拽开始
   */
  dragStart(event) {
    // 阻止默认事件，例如页面滚动
    event.preventDefault()
    
    // 当前拖拽状态
    this.dragging = true
    
    // 记录拖拽元素的初始位置以及鼠标的初始位置
    const e = event.touches ? event.touches[0] : event
    this.startX = e.pageX
    this.startY = e.pageY
    this.positionLeft = parseFloat(getComputedStyle(this.element).left)
    this.positionTop = parseFloat(getComputedStyle(this.element).top)

    if (this.boundary) {
      this.dragRange = this.getDragRange()
    }

    // 调用拖拽开始回调函数
    this.options.onStart()
    
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
   * 拖拽移动中
   */
  dragMove(event) {
    if (!this.dragging) return

    // 阻止默认事件，例如页面滚动
    event.preventDefault();
    
    const e = event.touches ? event.touches[0] : event
    // 计算鼠标当前位置相对上一次位置的偏移量
    let offsetX = e.pageX - this.startX
    let offsetY = e.pageY - this.startY
    
    // 判断是否需要水平/垂直拖拽
    const direction = this.options.direction
    if (direction === 'horizontal' || direction === 'x') {
      offsetY = 0
    } else if (direction === 'vertical' || direction === 'y') {
      offsetX = 0
    }

    if (this.boundary) {
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
   * 拖拽结束 
   */
  dragEnd(event) {
    if (!this.dragging) return
    this.dragging = false
    
    // 解绑监听器
    document.removeEventListener(this.eventMap.move, this.dragMove)
    document.removeEventListener(this.eventMap.end, this.dragEnd)

    const e = event.touches ? event.touches?.[0] : event
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
