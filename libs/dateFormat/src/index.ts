type WeeklyDay = '日' | '一' | '二' | '三' | '四' | '五' | '六'
interface IDateInfo {
  yyyy: number | string
  MM: number | string
  dd: number | string
  HH: number | string
  mm: number | string
  ss: number | string
  ms: number | string
  e: number | string
  E: WeeklyDay | string
  date?: Date
}
type DateInfoValueTypes = string | number | Date | undefined
type FormatterFuc = (date: IDateInfo, rawDate?: IDateInfo) => string
type IFormatter = 'date' | 'time' | 'datetime' | string | FormatterFuc

/**
 * 将时间格式化类型归一
 * @param {function | string} formatter 时间格式化
 * @returns funtion
 */
function _formatNormalize(formatter: IFormatter): FormatterFuc {
  if (typeof formatter === 'function') return formatter

  if (typeof formatter !== 'string') {
    throw new Error('formatter must be a string or a function')
  }

  if (formatter === 'datetime') {
    formatter = 'yyyy-MM-dd HH:mm:ss'
  } else if (formatter === 'date') {
    formatter = 'yyyy-MM-dd'
  } else if (formatter === 'time') {
    formatter = 'HH:mm:ss'
  }
  return function (date: IDateInfo) {
    return (formatter as string).replace(/(yyyy|MM|dd|HH|mm|ss|ms|E)+/g, (value): string => {
      return date[value as keyof IDateInfo] as string
    })
  }
}

/**
 * 日期/时间 格式化函数
 * @type [['年', 'yyyyy'], ['月', 'MM'], ['日', 'dd'], ['时', 'HH'], ['分', 'mm'], ['秒', 'ss'], ['毫秒', 'ms'], ['周', 'E']]
 * @param {string | Date} date 日期/时间
 * @param {string | function | 'date' | 'time' | 'datetime'} formatter 格式化方式
 * @param {boolean} isPad 是否补零
 * @returns 
 */
export default function dateFormat(
  date: string | Date,
  formatter: IFormatter = 'datetime',
  isPad: boolean = true
) {
  try {
    if (!date) return ''

    date = date instanceof Date ? date : new Date(date)
    const week = date.getDay()
    const dateInfo: IDateInfo = {
      'yyyy': date.getFullYear(),
      'MM': date.getMonth() + 1,
      'dd': date.getDate(),
      'HH': date.getHours(),
      'mm': date.getMinutes(),
      'ss': date.getSeconds(),
      'ms': date.getMilliseconds(),
      'e': week,
      'E': ['日', '一', '二', '三', '四', '五', '六'][week] as WeeklyDay
    }
    let rawDateInfo: IDateInfo | undefined
    if (isPad) {
      rawDateInfo = Object.keys(dateInfo).reduce<IDateInfo>((obj, key) => {
        const value = dateInfo[key as keyof IDateInfo] as DateInfoValueTypes
        (obj[key as keyof IDateInfo] as DateInfoValueTypes) = value
        const length = key === 'ms' ? 3 : key.length
        dateInfo[key as keyof Omit<IDateInfo, 'date'>] = value.toString().padStart(length, '0')
        return obj
      }, {} as IDateInfo)
      rawDateInfo.date = date
    }
    dateInfo.date = date

    return _formatNormalize(formatter)(dateInfo, rawDateInfo || dateInfo)
  } catch (error) {
    throw new Error('date is invalid!')
  }
}
