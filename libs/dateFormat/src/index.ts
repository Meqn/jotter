interface IDateInfo {
  [key: string]: string | number | Date
}
type FormatterFuc = (date: IDateInfo, rawDate?: IDateInfo) => string
type IFormatter = 'date' | 'time' | 'datetime' | string | FormatterFuc

const WEEKS = {
  dd: ['日', '一', '二', '三', '四', '五', '六'],
  ddd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  dddd: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
}

const REGEX_FORMAT = /\[([^\]]+)]|Y{1,4}|M{1,2}|Qo|Q{1,2}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A{1,2}|m{1,2}|s{1,2}|S{1,3}|Z{1,2}/g

/**
 * 补位指定长度的字符串
 * @param value 日期
 * @param length 长度
 * @param pad 补位
 * @returns 
 */
function padStart(value: string | number, length: number, pad: any): string {
  const s = String(value)
  if (!s || s.length >= length) return s
  return `${Array((length + 1) - s.length).join(pad)}${value}`
}

/**
 * 时区字符串
 * @param date 日期
 * @returns
 */
const padZoneStr = (date: Date) => {
  const negMinutes = -(-Math.round(date.getTimezoneOffset() / 15) * 15)
  const minutes = Math.abs(negMinutes)
  const hourOffset = Math.floor(minutes / 60)
  const minuteOffset = minutes % 60
  return `${negMinutes <= 0 ? '+' : '-'}${padStart(hourOffset, 2, '0')}:${padStart(minuteOffset, 2, '0')}`
}

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
    formatter = 'YYYY-MM-DD HH:mm:ss'
  } else if (formatter === 'date') {
    formatter = 'YYYY-MM-DD'
  } else if (formatter === 'time') {
    formatter = 'HH:mm:ss'
  }
  return function (matches: IDateInfo) {
    return (formatter as string).replace(REGEX_FORMAT, (match, $1): string => {
      return $1 || matches[match]
    })
  }
}

/**
 * 日期/时间 格式化函数
 * @param {string | Date} date 日期/时间
 * @param {string | function | 'date' | 'time' | 'datetime'} formatter 格式化方式
 * @returns 
 */
export default function dateFormat(
  date: Date | string | number,
  formatter: IFormatter = 'datetime'
) {
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
    
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    const millisecond = date.getMilliseconds()
    const week = date.getDay()
    const isAm = hour > 12 ? false : true
    const quarter = Math.ceil((month)/3)

    const matches: IDateInfo = {
      date,
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond,
      week,
      YY: String(year).slice(-2),
      YYYY: year,
      M: month,
      MM: padStart(month, 2, '0'),
      D: day,
      DD: padStart(day, 2, '0'),
      d: week,
      dd: WEEKS.dd[week],
      ddd: WEEKS.ddd[week],
      dddd: WEEKS.dddd[week],
      H: hour,
      HH: padStart(hour, 2, '0'),
      h: hour%12,
      hh: padStart(hour%12, 2, '0'),
      a: isAm ? 'am' : 'pm',
      A: isAm ? 'AM' : 'PM',
      AA: isAm ? '上午' : '下午',
      m: minute,
      mm: padStart(minute, 2, '0'),
      s: second,
      ss: padStart(second, 2, '0'),
      S: String(millisecond).slice(-1),
      SS: String(millisecond).slice(-2),
      SSS: String(millisecond).slice(-3),
      Q: quarter,
      Qo: 'Q' + quarter,
      QQ: ['一', '二', '三', '四'][quarter - 1],
      Z: padZoneStr(date),
      ZZ: padZoneStr(date).replace(':', '')
    }
    
    return _formatNormalize(formatter)(matches)
  } catch (e) {
    console.error((<Error>e).message)
    return ''
  }
}
