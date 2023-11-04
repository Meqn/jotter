/* type ZeroToOne<T extends number> = T extends number ? (
  T extends infer U & number ? U extends 0 ? 0 : U extends 1 ? 1 : U : never
) : never

const n: ZeroToOne<0.5> = 0.5
 */

export type ITimingFunc = (t: number) => number
export interface ITiming {
  linear: ITimingFunc,
  easeIn: ITimingFunc,
  easeOut: ITimingFunc,
  easeInOut: ITimingFunc
}

export type IOptions = {
  /**
   * 动画时长
   * @default 1000
   */
  duration?: number

  /**
   * 时序函数, 默认匀速播放
   * @param t 进度
   * @returns number
   */
  timing?: (t: number) => number

  /**
   * 每帧绘图函数
   * @param n 进度
   * @returns 
   */
  render?: (n: number) => any

  /**
   * 播放速率
   * @default 1
   */
  rate?: number

  /**
   * 是否循环播放
   * @default false
   */
  loop?: boolean
}

export type ICalcTimeFunc = (
  progress: number,
  { duration, timing }: Pick<IOptions, 'duration' | 'timing'>
) => number
