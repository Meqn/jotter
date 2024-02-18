import {
  getPositionY,
  getPositionX,
  setPositionX,
  setPositionY,
  setPositionAuto
} from './utils.js'

/**
 * 
 * @param {HTMLElement} target 定位元素
 * @param {HTMLElement} ref 参考元素
 * @param {Object} options 定位选项
 * @param {string} [options.placement='auto'] - 相对参照元素的定位位置 ['auto', 'left', 'right', 'top', 'bottom']
 * @param {object} [options.position={}] - 目标元素的固定位置 {'auto', 'left', 'right', 'top', 'bottom'}
 * @param {number} [options.offsetX=0] - 相对参考元素水平偏移量 (水平方向为`auto`时，正数：向右偏移，负数：向左偏移；否则取绝对值)
 * @param {number} [options.offsetY=0] - 相对参考元素垂直偏移量 (垂直方向为`auto`时，正数：向下偏移，负数：向上偏移；否则取绝对值)
 * @param {number} [options.marginTop=0] - 定位元素与视窗顶部间距
 * @param {number} [options.marginBottom=0] - 定位元素与视窗底部间距
 * @param {number} [options.marginLeft=0] - 定位元素与视窗左侧间距
 * @param {number} [options.marginRight=0] - 定位元素与视窗右侧间距
 */
export function position(target, ref, options = {}) {
  if (typeof target === 'string') {
    target = document.querySelector(target)
  }
  if (typeof ref === 'string') {
    ref = document.querySelector(ref)
  }
  if (!(target instanceof HTMLElement)) {
    throw new Error('Element not found')
  }
  if (Object.prototype.toString.call(ref) === '[object Object]') {
    options = ref
  }

  const { position = {}, placement = 'auto' } = options
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
    if (placement === 'auto' || placement === '') {
      setPositionAuto(target, ref, options)
    } else if (placement === 'left' || placement === 'right') {
      setPositionX(target, ref, options)
    } else if (placement === 'top' || placement === 'bottom') {
      setPositionY(target, ref, options)
    }
  }
}

/**
 * 元素垂直定位
 * @param {HTMLElement} target 定位元素
 * @param {HTMLElement} ref 参考元素
 * @param {Object} options 定位选项
 * @param {number} [options.offsetY=0] - 相对参考元素顶部偏移量 (正数：向下偏移，负数：向上偏移)
 * @param {number} [options.marginTop=0] - 定位元素与视窗顶部间距
 * @param {number} [options.marginBottom=0] - 定位元素与视窗底部间距
 */
export function positionY(target, ref, options = {}) {
  if (typeof target === 'string') {
    target = document.querySelector(target)
  }
  if (typeof ref === 'string') {
    ref = document.querySelector(ref)
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
 * @param {HTMLElement} target 定位元素
 * @param {HTMLElement} ref 参考元素
 * @param {Object} options 定位选项
 * @param {number} [options.offsetX=0] - 相对参考元素左侧偏移量 (正数：向右偏移，负数：向左偏移)
 * @param {number} [options.marginLeft=0] - 定位元素与视窗左边距离
 * @param {number} [options.marginRight=0] - 定位元素与视窗右边距离
 */
export function positionX(target, ref, options = {}) {
  if (typeof target === 'string') {
    target = document.querySelector(target)
  }
  if (typeof ref === 'string') {
    ref = document.querySelector(ref)
  }
  if (!(target instanceof HTMLElement) || !(ref instanceof HTMLElement)) {
    throw new Error('Element not found')
  }

  target.style.position = 'fixed'

  const targetWidth = target.getBoundingClientRect().width
  const {left: refLeft, width: refWidth} = ref.getBoundingClientRect()

  target.style.left = getPositionX({...options, targetWidth, refWidth, refLeft}) + 'px'
}
