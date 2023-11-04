import { ICalcTimeFunc, ITiming } from './types'

/**
 * 动画时序函数
 */
export const timingMap: ITiming = {
  linear: t => t,
  easeIn: t => t * t,
  easeOut: t => 1 - Math.pow(1 - t, 2),
  easeInOut: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

/**
 * 通过进度计算动画当前时间
 * @param {number} progress 进度, 0-1
 * @param {object} params 参数
 * @param {number} params.duration 动画时长
 * @param {function} params.timing 时序函数
 * @returns 
 */
export const calcTimeByProgress: ICalcTimeFunc = (progress, { duration, timing }) => {
  let start = 0;
  let end = duration;
  let time = null;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const midProgress = timing(mid / duration) as number;

    if (midProgress === progress) {
      time = mid;
      break;
    } else if (midProgress < progress) {
      start = mid + 1;
    } else {
      end = mid - 1;
    }
  }

  if (time === null) {
    time = start;
  }

  return time;
}
