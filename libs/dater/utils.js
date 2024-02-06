const DATE_REG = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/

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

  if (Array.isArray(date)) {
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

export const isObject = o => Object.prototype.toString.call(o) === '[object Object]'

export const isDater = d => d instanceof Dater || (d && d['$is'])
