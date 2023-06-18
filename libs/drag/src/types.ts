export type EventHandler = (evt: TouchEvent | MouseEvent, data?: any) => void

export interface IOptions {
  /**
   * 拖动时监听的目标元素
   * @default element
   */
  handle: HTMLElement | string
  /**
   * 拖动方向, 支持设定水平和垂直
   * @default 'both'
   */
  direction: 'both' | 'horizontal' | 'vertical' | 'x' | 'y'
  /**
   * 可拖动的区域边界
   * @default window
   */
  boundary: HTMLElement | Window | string | IBoundary
  /**
   * 触发click事件的临界阈值
   * 当移动距离小于该值时，视为点击事件
   * @default 5
   */
  clickThreshold: number
  /**
   * Click事件回调函数
   * @param evt
   * @param data
   */
  onClick: EventHandler
  /**
   * 拖动开始时的回调函数
   * @param evt
   * @param data
   */
  onStart: EventHandler
  /**
   * 拖动过程中的回调函数
   * @param evt
   * @param data
   */
  onMove: EventHandler
  /**
   * 拖动结束时的回调函数
   * @param evt
   * @param data
   */
  onEnd: EventHandler
}

export type DragEventMap = {
  start: 'mousedown' | 'touchstart'
  move: 'mousemove' | 'touchmove'
  end: 'mouseup' | 'touchend'
}

export type IBoundary = {
  top:  number
  right: number
  bottom: number
  left: number
}

export type DragRange = {
  minX: number
  maxX: number
  minY: number
  maxY: number
}
