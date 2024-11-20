import type { IOptions, IPositionXOptions, IPositionYOptions } from './types'

type IGetPositionYOptions = IPositionYOptions & {
	refTop: number
	targetHeight: number
}
type IGetPositionXOptions = IPositionXOptions & {
	refLeft: number
	refWidth: number
	targetWidth: number
}

/**
 * 设置元素定位
 * @param target 目标元素
 * @param ref 参考元素
 * @param options 定位选项
 */
type SetPositionFunc = (target: HTMLElement, ref: HTMLElement, options?: IOptions) => void

/**
 * 获取元素垂直定位 top值
 * @param options 定位选项
 * @returns
 */
export function getPositionY(options: IGetPositionYOptions) {
	const { refTop, targetHeight, offsetY = 0, marginTop = 0, marginBottom = 0 } = options || {}
	const winHeight = window.innerHeight || document.documentElement.clientHeight

	// 计算定位元素的预期位置
	let top = refTop + offsetY
	// 计算定位元素到视窗底部的最小距离
	const maxTop = winHeight - marginBottom - targetHeight

	if (top <= 0 || top < marginTop) {
		// 检查定位元素顶部是否超出视窗,超出则重新定位
		top = marginTop
	} else if (top > maxTop) {
		// 检查定位元素底部是否超出视窗,超出则重新定位
		top = maxTop
	}

	return top
}

/**
 * 获取元素水平定位 left值
 * @param options 定位选项
 * @returns
 */
export function getPositionX(options: IGetPositionXOptions) {
	const {
		refLeft,
		refWidth,
		targetWidth,
		offsetX = 0,
		marginLeft = 0,
		marginRight = 0,
	} = options || {}
	const winWidth = window.innerWidth

	// 计算定位元素的预期位置 (相对中间位置)
	let left = refLeft + offsetX - (targetWidth - refWidth) / 2
	// 计算定位元素到视窗右侧的最小距离
	const maxLeft = winWidth - marginRight - targetWidth

	if (left < 0 || left < marginLeft) {
		// 检查定位元素左侧是否超出视窗,超出则重新定位
		left = marginLeft
	} else if (left > maxLeft) {
		// 检查定位元素右侧是否超出视窗,超出则重新定位
		left = maxLeft
	}

	return left
}

/**
 * 根据参照元素和选项 设置目标元素的水平位置
 */
export const setPositionX: SetPositionFunc = (target, ref, options = {}) => {
	const { position = {}, placement, offsetX = 0 } = options

	const { width: targetWidth, height: targetHeight } = target.getBoundingClientRect()
	const { top: refTop, left: refLeft, right: refRight } = ref.getBoundingClientRect()

	if (!position.left && !position.right) {
		const _left =
			placement === 'left'
				? refLeft - targetWidth - Math.abs(offsetX)
				: refRight + Math.abs(offsetX)
		target.style.left = _left + 'px'
	}

	if (!position.top && !position.bottom) {
		target.style.top = getPositionY({ ...options, refTop, targetHeight }) + 'px'
	}
}

/**
 * 根据参照元素和选项 设置目标元素的垂直位置
 */
export const setPositionY: SetPositionFunc = (target, ref, options = {}) => {
	const { position = {}, placement, offsetY = 0 } = options

	const { width: targetWidth, height: targetHeight } = target.getBoundingClientRect()
	const {
		width: refWidth,
		top: refTop,
		bottom: refBottom,
		left: refLeft,
	} = ref.getBoundingClientRect()

	if (!position.top && !position.bottom) {
		const _top =
			placement === 'top'
				? refTop - targetHeight - Math.abs(offsetY)
				: refBottom + Math.abs(offsetY)
		target.style.top = _top + 'px'
	}

	if (!position.left && !position.right) {
		target.style.left = getPositionX({ ...options, refLeft, refWidth, targetWidth }) + 'px'
	}
}

/**
 * 设置目标元素相对于参照元素的位置
 */
export const setPositionAuto: SetPositionFunc = (target, ref, options = {}) => {
	const { position = {}, offsetX = 0, marginLeft = 0, marginRight = 0 } = options

	const winWidth = window.innerWidth || document.documentElement.clientHeight
	const { width: targetWidth, height: targetHeight } = target.getBoundingClientRect()
	const { top: refTop, left: refLeft, right: refRight } = ref.getBoundingClientRect()

	if (!position.left && !position.right) {
		// 左侧区域大于右侧区域
		if (refLeft - marginLeft > winWidth - refRight - marginRight) {
			// 左侧
			target.style.left = refLeft - targetWidth - Math.abs(offsetX) + 'px'
		} else {
			// 右侧
			target.style.left = refRight + Math.abs(offsetX) + 'px'
		}
	}

	if (!position.top && !position.bottom) {
		target.style.top = getPositionY({ ...options, refTop, targetHeight }) + 'px'
	}
}
