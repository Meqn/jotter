import type {IOptions} from './types'
import {getPositionY, getPositionX, setPositionX, setPositionY, setPositionAuto} from './utils'

type IElement = string | HTMLElement
type IPositionXOptions = Pick<IOptions, 'offsetX' | 'marginLeft' | 'marginRight'>
type IPositionYOptions = Pick<IOptions, 'offsetY' | 'marginTop' | 'marginBottom'>
type PositionXFunc = (target: IElement, ref: IElement, options?: IPositionXOptions) => void
type PositionYFunc = (target: IElement, ref: IElement, options?: IPositionYOptions) => void

interface PositionFunc {
  (target: IElement, ref: IElement, options?: IOptions): void
  (target: IElement, options?: IOptions): void
  setX: PositionXFunc
  positionX: PositionXFunc
  setY: PositionYFunc
  positionY: PositionYFunc
}

/**
 * 元素垂直定位
 * @param {IElement} target 定位元素
 * @param {IElement} ref 参考元素
 * @param {IPositionYOptions} options 定位选项
 */
export const positionY: PositionYFunc = (target, ref, options = {}) => {
  if (typeof target === 'string') {
    target = document.querySelector<HTMLElement>(target)
  }
  if (typeof ref === 'string') {
    ref = document.querySelector<HTMLElement>(ref)
  }
  if (!(target instanceof HTMLElement) || !(ref instanceof HTMLElement)) {
    throw new Error('Element not found')
  }

  target.style.position = 'fixed'

  // const targetHeight = target.offsetHeight || target.clientHeight
  const targetHeight = target.getBoundingClientRect().height
  const refTop = ref.getBoundingClientRect().top

  target.style.top = getPositionY({...options, targetHeight, refTop}) + 'px'
}

/**
 * 元素水平定位
 * @param {IElement} target 定位元素
 * @param {IElement} ref 参考元素
 * @param {IPositionXOptions} options 定位选项
 */
export const positionX: PositionXFunc = (target, ref, options) => {
  if (typeof target === 'string') {
    target = document.querySelector<HTMLElement>(target)
  }
  if (typeof ref === 'string') {
    ref = document.querySelector<HTMLElement>(ref)
  }
  if (!(target instanceof HTMLElement) || !(ref instanceof HTMLElement)) {
    throw new Error('Element not found')
  }

  target.style.position = 'fixed'

  const targetWidth = target.getBoundingClientRect().width
  const {left: refLeft, width: refWidth} = ref.getBoundingClientRect()

  target.style.left = getPositionX({...options, targetWidth, refWidth, refLeft}) + 'px'
}

/**
 * 设置元素定位
 * @param {IElement} target 定位元素
 * @param {IElement} ref 参考元素
 * @param {IOptions} options 定位选项
 */
export const position: PositionFunc = (
  target: IElement,
  ref: IElement | IOptions,
  options: IOptions = {}
) => {
  if (typeof target === 'string') {
    target = document.querySelector<HTMLElement>(target)
  }
  if (typeof ref === 'string') {
    ref = document.querySelector<HTMLElement>(ref)
  }
  if (!(target instanceof HTMLElement)) {
    throw new Error('Element not found')
  }
  if (Object.prototype.toString.call(ref) === '[object Object]') {
    options = ref as IOptions
  }

  const {position = {}, placement = 'auto'} = options
  // 注：position设置一定要先于 target.getBoundingClientRect
  target.style.position = 'fixed'

  // 设置固定位置
  if (position.top) {
    target.style.top = position.top + 'px'
  } else if (position.bottom) {
    target.style.bottom = position.bottom + 'px'
  }
  if (position.left) {
    target.style.left = position.left + 'px'
  } else if (position.right) {
    target.style.right = position.right + 'px'
  }

  // 设置相对位置
  if (ref instanceof HTMLElement) {
    if (placement === 'auto') {
      setPositionAuto(target, ref, options)
    } else if (placement === 'left' || placement === 'right') {
      setPositionX(target, ref, options)
    } else if (placement === 'top' || placement === 'bottom') {
      setPositionY(target, ref, options)
    }
  }
}

position.setX = positionX
position.setY = positionY
position.positionX = positionX
position.positionY = positionY

export default position
