interface IPosition {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export interface IOptions {
  /**
   * 目标元素的固定位置
   */
  position?: IPosition

  /**
   * 相对参照元素的定位位置
   * @default: 'auto'
   */
  placement?: 'auto' | 'left' | 'right' | 'top' | 'bottom'

  /**
   * 相对参照元素水平偏移量
   * @description: 水平方向为`auto`时，正数：向右偏移，负数：向左偏移；否则取绝对值
   * @default: 0
   */
  offsetX?: number

  /**
   * 相对参照元素垂直偏移量
   * @description: 垂直方向为`auto`时，正数：向下偏移，负数：向上偏移；否则取绝对值
   * @default: 0
   */
  offsetY?: number

  /**
   * 定位元素与视窗顶部间距
   * @default: 0
   */
  marginTop?: number

  /**
   * 定位元素与视窗底部间距
   * @default: 0
   */
  marginBottom?: number

  /**
   * 定位元素与视窗左侧间距
   * @default: 0
   */
  marginLeft?: number

  /**
   * 定位元素与视窗右侧间距
   * @default: 0
   */
  marginRight?: number
}
