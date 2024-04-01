const DATE_REG = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/

export const isObject = o => Object.prototype.toString.call(o) === '[object Object]'
export const isArray = a => Object.prototype.toString.call(a) === '[object Array]'

export function parseDate(date, utc) {
  if (date === undefined) return new Date()
  if (date === null) {
    console.warn('Invalid Date !')
    return new Date(NaN)
  }

  if (typeof date === 'string' && !/Z$/i.test(date)) {
    const match = date.match(DATE_REG)
    if (match) {
      const m = match[2] - 1 || 0
      const ms = (match[7] || '0').substring(0, 3)
      if (utc) {
        return new Date(Date.UTC(match[1], m, match[3] || 1, match[4] || 0, match[5] || 0, match[6] || 0, ms))
      }
      return new Date(match[1], m, match[3] || 1, match[4] || 0, match[5] || 0, match[6] || 0, ms)
    }
  }

  if (isArray(date)) {
    if (utc) {
      if (!date.length) {
        return new Date()
      }
      return new Date(Date.UTC.apply(null, date))
    }
    if (date.length === 1) {
      return parseDate(String(date[0]), utc)
    }
    return new (Function.prototype.bind.apply(Date, [null].concat(date)))()
  }
  
  return new Date(date)
}

/**
 * 补位指定长度的字符串
 * @param {string | number} value 日期
 * @param {number} length 长度
 * @param {string} pad 补位
 * @returns {string}
 */
export const padStart = (value, length, pad) => {
  const s = String(value)
  if (!s || s.length >= length) return s
  return `${Array((length + 1) - s.length).join(pad)}${value}`
}

/**
 * 时区字符串
 * @param {Date} date 日期
 * @returns
 */
export const padZoneStr = (date) => {
  const negMinutes = -(-Math.round(date.getTimezoneOffset() / 15) * 15)
  const minutes = Math.abs(negMinutes)
  const hourOffset = Math.floor(minutes / 60)
  const minuteOffset = minutes % 60
  return `${negMinutes <= 0 ? '+' : '-'}${padStart(hourOffset, 2, '0')}:${padStart(minuteOffset, 2, '0')}`
}

/**
 * 对象浅拷贝
 * @returns 
 */
export const merge = (...args) => {
  const obj = {}
  args.forEach(arg => {
    if (isObject(arg)) {
      Object.keys(arg).forEach(key => {
        obj[key] = arg[key]
      })
    }
  })
  return obj
}
