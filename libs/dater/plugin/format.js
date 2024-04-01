const FORMAT_REG =
  /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g
const defaultFormatter = 'YYYY-MM-DDTHH:mm:ssZZ'

export default function format(_, C, f) {
  const {padStart, padZoneStr} = f.utils
  C.prototype.format = function (formatter) {
    if (!this.isValid()) return 'Invalid Date'

    const {
      $year,
      $month,
      $day,
      $week,
      $hour,
      $minute,
      $second,
      $millisecond,
      $locale: locale
    } = this
    const zoneStr = padZoneStr(this.$date)
    const getShort = (list, index, full, length) => list[index] || full[index].slice(0, length)
    const getHour = num => padStart($hour % 12 || 12, num, '0')
    const meridiemFunc =
      locale.meridiem ||
      ((hour, _minute, lowerCase) => {
        const m = hour < 12 ? 'AM' : 'PM'
        return lowerCase ? m.toLowerCase() : m
      })

    const matches = {
      YY: String($year).slice(-2),
      YYYY: padStart($year, 4, '0'),
      Q: Math.floor($month / 3 + 1),
      M: $month + 1,
      MM: padStart($month + 1, 2, '0'),
      MMM: getShort(locale.monthsShort, $month, locale.months, 3),
      MMMM: locale.months[$month],
      D: $day,
      DD: padStart($day, 2, '0'),
      d: $week,
      dd: getShort(locale.weekdaysMin, $week, locale.weekdays, 2),
      ddd: getShort(locale.weekdaysShort, $week, locale.weekdays, 3),
      dddd: locale.weekdays[$week],
      H: $hour,
      HH: padStart($hour, 2, '0'),
      h: getHour(1),
      hh: getHour(2),
      a: meridiemFunc($hour, $minute, true),
      A: meridiemFunc($hour, $minute, false),
      m: $minute,
      mm: padStart($minute, 2, '0'),
      s: $second,
      ss: padStart($second, 2, '0'),
      SSS: padStart($millisecond, 3, '0'),
      Z: zoneStr,
      ZZ: zoneStr.replace(':', '')
    }

    if (typeof formatter === 'function') return formatter.call(this, matches, this)
    if (typeof formatter === 'string') {
      const longDateFormat = locale.longDateFormat
      if (longDateFormat && longDateFormat[formatter]) {
        formatter = longDateFormat[formatter]
      }
    } else {
      formatter = defaultFormatter
    }
    return formatter.replace(FORMAT_REG, (match, $1) => {
      return $1 || matches[match]
    })
  }
}
