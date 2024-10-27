/* type ZeroToOne<T extends number> = T extends number ? (
  T extends infer U & number ? U extends 0 ? 0 : U extends 1 ? 1 : U : never
) : never

const n: ZeroToOne<0.5> = 0.5
*/

interface AnimatorTimingParams {
	duration: number
	timing: (t: number) => number
}

type ITimingFunc = (t: number) => number
interface ITiming {
	linear: ITimingFunc
	easeIn: ITimingFunc
	easeOut: ITimingFunc
	easeInOut: ITimingFunc
}

/**
 * 通过进度计算动画当前时间
 * @param progress 进度, 0-1
 * @param params 动画参数
 * @returns 计算出的当前时间
 */
export const calcTimeByProgress = (
	progress: number,
	{ duration, timing }: AnimatorTimingParams
): number => {
	let start = 0
	let end = duration

	// 使用二分查找优化时间计算
	while (start <= end) {
		const mid = Math.floor((start + end) / 2)
		const midProgress = timing(mid / duration)

		if (Math.abs(midProgress - progress) < 0.0001) {
			// 添加误差容忍
			return mid
		} else if (midProgress < progress) {
			start = mid + 1
		} else {
			end = mid - 1
		}
	}

	return start
}

/**
 * 动画时序函数
 */
export const timingMap: ITiming = {
	linear: (t) => t,
	easeIn: (t) => t * t,
	easeOut: (t) => 1 - Math.pow(1 - t, 2),
	easeInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
}
