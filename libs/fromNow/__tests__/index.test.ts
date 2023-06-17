import fromNow, { create } from '../src/index'

describe('fromNow', () => {
  let date: number
  beforeEach(() => {
    date = new Date().getTime()
  })

  it('should be a function', () => {
    expect(typeof fromNow).toBe('function')
  })

  it('should return a string', () => {
    expect(typeof fromNow(date)).toBe('string')
  })

  it('should return the correct relative time for a date in the past', () => {
    expect(fromNow(date - 1000*30)).toBe('now')
    expect(fromNow(date - 1000*45)).toBe('a minute ago')
    expect(fromNow(date - 1000*60*45)).toBe('an hour ago')
    expect(fromNow(date - 1000*60*60*22)).toBe('a day ago')
    expect(fromNow(date - 1000*60*60*24*6)).toBe('a week ago')
    expect(fromNow(date - 1000*60*60*24*26)).toBe('a month ago')
    expect(fromNow(date - 1000*60*60*24*30*11)).toBe('a year ago')
  })

  it('should return the correct relative time for a date in the future', () => {
    expect(fromNow(date + 1000*30)).toBe('in a few seconds')
    expect(fromNow(date + 1000*45)).toBe('in a minute')
    expect(fromNow(date + 1000*60*45)).toBe('in an hour')
    expect(fromNow(date + 1000*60*60*22)).toBe('in a day')
    expect(fromNow(date + 1000*60*60*24*6)).toBe('in a week')
    expect(fromNow(date + 1000*60*60*24*26)).toBe('in a month')
    expect(fromNow(date + 1000*60*60*24*30*11)).toBe('in a year')
  })

  it('should update locale', () => {
    fromNow.locale('zh')
    expect(fromNow(date - 1000*30)).toBe('刚刚')
    expect(fromNow(date - 1000*60*45)).toBe('1 小时前')
    expect(fromNow(date + 1000*60*45)).toBe('1 小时后')
  })
  
  it('should handle custom locale options', () => {
    fromNow.locale('en', { s: 'a few seconds' })
    expect(fromNow(date - 1000*30)).toBe('a few seconds ago')
    expect(fromNow(date + 1000*30)).toBe('in a few seconds')

    fromNow.locale('zh', { s: '几秒' })
    expect(fromNow(date - 1000*30)).toBe('几秒前')
    expect(fromNow(date + 1000*30)).toBe('几秒后')
  })

  it('should handle custom locale options', () => {
    fromNow.thresholds({ w: null })
    expect(fromNow(date - 1000*60*60*24*6)).not.toBe('1 周前')
    expect(fromNow(date - 1000*60*60*24*6)).toBe('1 个月前')
    
    fromNow.locale('en')
    expect(fromNow(date - 1000*60*60*24*6)).not.toBe('a week age')
    expect(fromNow(date - 1000*60*60*24*6)).toBe('a month ago')
  })
  
})

describe('create()', () => {
  let fromNow: any
  let date: number

  beforeEach(() => {
    date = new Date().getTime()
    fromNow = create({
      locale: {
        future: '%s后',
        past: '%s前',
        s: '几秒',
        ss: '%d 秒',
        m: '1 分钟',
        mm: '%d 分钟',
        h: '1 小时',
        hh: '%d 小时',
      },
      thresholds: {
        ss: 30,
        s: 59,
        m: 59,
      }
    })
  })

  it('should be a function and return a string', () => {
    expect(typeof fromNow).toBe('function')
    expect(typeof fromNow(date)).toBe('string')
  })

  it('should return the correct relative time for a date in the past', () => {
    expect(fromNow(date - 1000*30)).toEqual('几秒前')
    expect(fromNow(date - 1000*50)).toEqual('50 秒前')
    expect(fromNow(date - 1000*60*45)).toBe('45 分钟前')
  })

  it('should return the correct relative time for a date in the future', () => {
    expect(fromNow(date + 1000*30)).toEqual('几秒后')
    expect(fromNow(date + 1000*50)).toEqual('50 秒后')
    expect(fromNow(date + 1000*60*45)).toBe('45 分钟后')
  })
})
