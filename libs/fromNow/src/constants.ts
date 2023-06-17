/**
 * 格式化字符串(语言环境)
 * `%ns`: 表示不加后缀
 * `['', '']`: 值为数组, [0]表示 `past`, [1]表示 `future`
 */
export const LOCALE_MAP = {
  zh: {
    future: '%s后',
    past: '%s前',
    s: ['刚刚%ns', '很快%ns'],
    ss: '%d 秒',
    m: '1 分钟',
    mm: '%d 分钟',
    h: '1 小时',
    hh: '%d 小时',
    d: '1 天',
    dd: '%d 天',
    w: '1 周',
    ww: '%d 周',
    M: '1 个月',
    MM: '%d 个月',
    y: '1 年',
    yy: '%d 年'
  },
  en: {
    future: 'in %s',
    past: '%s ago',
    s: ['now%ns', 'a few seconds'],
    ss: '%d seconds',
    m: 'a minute',
    mm: '%d minutes',
    h: 'an hour',
    hh: '%d hours',
    d: 'a day',
    dd: '%d days',
    w: 'a week',
    ww: '%d weeks',
    M: 'a month',
    MM: '%d months',
    y: 'a year',
    yy: '%d years',
  }
}

/**
 * 时间分段阈值
 * `w` 值为 null, 则不显示几周前
 */
export const THRESHOLDS = {
  ss: 44, // a few seconds to seconds
  s: 45, // seconds to minute
  m: 45, // minutes to hour
  h: 22, // hours to day
  d: 6, // days to month/week(26/6)
  w: 4, // weeks to month
  M: 11, // months to year
}
