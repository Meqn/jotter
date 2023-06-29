import {
  isArray,
  isPlanObject,
  assign
} from './utils'
import { LOCALE_MAP, THRESHOLDS } from './constants'

import type {
  IRelativeTimeOptions,
  IThresholdsOptions,
  IOptions,
  DateType,
  IFromFunc,
  CreateFunc
} from './types'

export class RelativeTime {
  private locale: IRelativeTimeOptions
  private thresholds: IThresholdsOptions

  /**
   * 格式化相对当前时间
   * @param locale 自定义语言环境字符串
   * @param thresholds 自定义阈值
   */
  constructor({ locale, thresholds }: IOptions = {}) {
    this.locale = assign({}, LOCALE_MAP.en, locale || {})
    this.thresholds = assign({}, THRESHOLDS, thresholds || {})
  }

  public updateLocale(locale: Partial<IRelativeTimeOptions>) {
    if (isPlanObject(locale)) {
      this.locale = assign(this.locale, locale)
    }
  }
  public updateThresholds(thresholds: Partial<IThresholdsOptions>) {
    if (isPlanObject(thresholds)) {
      this.thresholds = assign(this.thresholds, thresholds)
    }
  }

  /**
   * !格式化相对当前时间的时间差
   * @from moment.js
   * @param {number} diff - 时间差 (ms)
   * @return {string} 格式化结果
   */
  private relative(diff: number): string {
    if (typeof diff !== 'number' || isNaN(diff)) return ''
    const round = Math.round
    const thresholds = this.thresholds
    const diffAbs = Math.abs(diff)

    const seconds = round(diffAbs / 1000)
    const minutes = round(seconds / 60)
    const hours = round(minutes / 60)
    const days = round(hours / 24)
    const weeks = round(days / 7)
    const months = round(days / 30)
    const years = round(days / 365)

    let output =
      (seconds <= thresholds.ss && ['s', seconds]) ||
      (seconds < thresholds.s && ['ss', seconds]) ||
      (minutes <= 1 && ['m']) ||
      (minutes < thresholds.m && ['mm', minutes]) ||
      (hours <= 1 && ['h']) ||
      (hours < thresholds.h && ['hh', hours]) ||
      (days <= 1 && ['d']) ||
      (days < thresholds.d && ['dd', days])
    
    if (thresholds.w) {
      output = output || (weeks <= 1 && ['w']) || (weeks < thresholds.w && ['ww', weeks])
    }

    output = output ||
      (months <= 1 && ['M']) ||
      (months < thresholds.M && ['MM', months]) ||
      (years <= 1 && ['y']) ||
      ['yy', years]
    
    const outputStr = this.locale[output[0] as keyof IRelativeTimeOptions]
    const diffStr = isArray(outputStr)
      ? diff <= 0
        ? outputStr[0]
        : (outputStr[1] || outputStr[0])
      : outputStr
    
    return (diffStr as string).replace(/%d/i, output[1] as string)
  }

  public format(date: DateType): string {
    try {
      if (!date) throw new Error('date is invalid!')
      if (typeof date === 'string') {
        date = new Date(date.replace(/-/g, '/'))
      } else if (typeof date === 'number') {
        date = new Date(date)
      }

      if (Object.prototype.toString.call(date) === '[object Date]' && isNaN(date.getTime())) {
        throw new Error('date is invalid!')
      }

      const diff = date.getTime() - new Date().getTime()
      const output = this.relative(diff)
      const result = this.locale[diff > 0 ? 'future' : 'past']
      if (output.indexOf('%ns') !== -1) {
        return output.replace(/%ns/i, '')
      }
      return result.replace(/%s/i, output)
    } catch (e) {
      console.error((<Error>e).message)
      return ''
    }
  }
}

/**
 * 创建新实例
 * @param options 配置项
 * @returns 
 */
export const create: CreateFunc = (options = {}) => {
  let locale = options.locale
  if (typeof locale === 'string') {
    locale = LOCALE_MAP[locale.indexOf('en') === 0 ? 'en' : 'zh']
  }
  const time = new RelativeTime({
    locale,
    thresholds: options.thresholds
  })
  const fromNow: IFromFunc = (date) => {
    return time.format(date)
  }
  fromNow.locale = (name, config) => {
    if (!name) return
    if (typeof name === 'string') {
      const _locale = LOCALE_MAP[name.indexOf('en') === 0 ? 'en' : 'zh']
      config = assign({}, _locale, config || {})
    } else if (isPlanObject(name)) {
      config = name as Partial<IRelativeTimeOptions>
    }
    time.updateLocale.call(time, config)
  }
  fromNow.thresholds = time.updateThresholds.bind(time)

  return fromNow
}

export default (function() {
  const fromNow = create({ locale: LOCALE_MAP.en })
  fromNow.create = create

  return fromNow
})();
