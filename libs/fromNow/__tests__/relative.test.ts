// @ts-nocheck
import {RelativeTime} from '../src/index'

describe('RelativeTime', () => {
  describe('constructor', () => {
    it('should create a new instance of RelativeTime with default options', () => {
      const rt = new RelativeTime()
      expect(rt).toBeInstanceOf(RelativeTime)
      expect(rt['locale']).toEqual(expect.objectContaining({}))
      expect(rt['thresholds']).toEqual(expect.objectContaining({}))
    })
    it('should create a new instance of RelativeTime with custom options', () => {
      const rt = new RelativeTime({
        locale: {
          ss: '%d sec',
          m: '1 min',
          mm: '%d mins'
        },
        thresholds: {
          s: 10,
          m: 1
        }
      })
      expect(rt).toBeInstanceOf(RelativeTime)
      expect(rt['locale']).toEqual(
        expect.objectContaining({ss: '%d sec', m: '1 min', mm: '%d mins'})
      )
      expect(rt['thresholds']).toEqual(expect.objectContaining({s: 10, m: 1}))
    })
  })

  describe('locale', () => {
    it('should update the locale options', () => {
      const rt = new RelativeTime()
      rt.updateLocale({ss: '%d sec'})
      expect(rt['locale']).toEqual(expect.objectContaining({ss: '%d sec'}))
    })
  })

  describe('thresholds', () => {
    it('should update the thresholds options', () => {
      const rt = new RelativeTime()
      rt.updateThresholds({s: 10})
      expect(rt['thresholds']).toEqual(expect.objectContaining({s: 10}))
    })
  })

  describe('relative', () => {
    it('should return the correct relative time for a given time difference', () => {
      const rt = new RelativeTime()
      // @ts-ignore
      expect(rt.relative(0)).toBe('now%ns')
      expect(rt.relative(1000)).toBe('a few seconds')
      expect(rt.relative(-1000)).toBe('now%ns')
      expect(rt.relative(60 * 1000)).toBe('a minute')
      expect(rt.relative(-60 * 1000)).toBe('a minute')
      expect(rt.relative(60 * 60 * 1000)).toBe('an hour')
      expect(rt.relative(-60 * 60 * 1000)).toBe('an hour')
      expect(rt.relative(24 * 60 * 60 * 1000)).toBe('a day')
      expect(rt.relative(-24 * 60 * 60 * 1000)).toBe('a day')
      expect(rt.relative(7 * 24 * 60 * 60 * 1000)).toBe('a week')
      expect(rt.relative(-7 * 24 * 60 * 60 * 1000)).toBe('a week')
      expect(rt.relative(30 * 24 * 60 * 60 * 1000)).toBe('a month')
      expect(rt.relative(-30 * 24 * 60 * 60 * 1000)).toBe('a month')
      expect(rt.relative(365 * 24 * 60 * 60 * 1000)).toBe('a year')
      expect(rt.relative(-365 * 24 * 60 * 60 * 1000)).toBe('a year')
    })
    it('should return an empty string for invalid input', () => {
      const rt = new RelativeTime()
      expect(rt.relative(NaN)).toBe('')
      expect(rt.relative('invalid date' as any)).toBe('')
      expect(rt.relative(null as any)).toBe('')
      expect(rt.relative(undefined as any)).toBe('')
    })
  })

  describe('format', () => {
    it('should return the correct formatted string for a given date', () => {
      const rt = new RelativeTime()
      expect(rt.format(new Date())).toBe('now')
      expect(rt.format(new Date(Date.now() + 1000))).toBe('in a few seconds')
      expect(rt.format(new Date(Date.now() - 1000))).toBe('now')
      expect(rt.format(new Date(Date.now() + 60 * 1000))).toBe('in a minute')
      expect(rt.format(new Date(Date.now() - 60 * 1000))).toBe('a minute ago')
      expect(rt.format(new Date(Date.now() + 60 * 60 * 1000))).toBe('in an hour')
      expect(rt.format(new Date(Date.now() - 60 * 60 * 1000))).toBe('an hour ago')
      expect(rt.format(new Date(Date.now() + 24 * 60 * 60 * 1000))).toBe('in a day')
      expect(rt.format(new Date(Date.now() - 24 * 60 * 60 * 1000))).toBe('a day ago')
      expect(rt.format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))).toBe('in a week')
      expect(rt.format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))).toBe('a week ago')
      expect(rt.format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))).toBe('in a month')
      expect(rt.format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))).toBe('a month ago')
      expect(rt.format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))).toBe('in a year')
      expect(rt.format(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))).toBe('a year ago')
    })
    it('should return an empty string for invalid input', () => {
      const rt = new RelativeTime()
      expect(rt.format(null as any)).toBe('')
      expect(rt.format(undefined as any)).toBe('')
      expect(rt.format('invalid date')).toBe('')
      expect(rt.format(NaN)).toBe('')
    })
    it('should return the correct string for future and past dates', () => {
      const rt = new RelativeTime()
      expect(rt.format(new Date(Date.now() + 1000))).toBe('in a few seconds')
      expect(rt.format(new Date(Date.now() - 1000))).toBe('now')
      rt.updateLocale({future: '%s from now', past: '%s ago'})
      expect(rt.format(new Date(Date.now() + 1000))).toBe(
        'a few seconds from now'
      )
      expect(rt.format(new Date(Date.now() - 1000))).toBe('now')
    })
    it('should handle string and number input', () => {
      const rt = new RelativeTime()
      expect(rt.format(new Date())).toBe('now')
      expect(rt.format(Date.now())).toBe('now')
      expect(rt.format('2022-01-01')).toBe('a year ago')
      expect(rt.format(1640995200000)).toBe('a year ago')
    })
    it('should handle custom locale options', () => {
      const rt = new RelativeTime({
        locale: {ss: '%d sec', m: '1 min', mm: '%d mins'}
      })
      expect(rt.format(new Date(Date.now() + 1000))).toBe('in a few seconds')
      expect(rt.format(new Date(Date.now() - 1000))).toBe('now')
      expect(rt.format(new Date(Date.now() + 60 * 1000))).toBe('in 1 min')
      expect(rt.format(new Date(Date.now() - 60 * 1000))).toBe('1 min ago')
      expect(rt.format(new Date(Date.now() + 2 * 60 * 1000))).toBe('in 2 mins')
      expect(rt.format(new Date(Date.now() - 2 * 60 * 1000))).toBe('2 mins ago')
    })
    it('should handle custom thresholds options', () => {
      const rt = new RelativeTime({thresholds: {ss: 30, s: 60, d: 26, w: null}})
      expect(rt.format(new Date(Date.now() + 30 * 1000))).toBe('in a few seconds')
      expect(rt.format(new Date(Date.now() - 30 * 1000))).toBe('now')
      expect(rt.format(new Date(Date.now() + 59 * 1000))).toBe('in 59 seconds')
      expect(rt.format(new Date(Date.now() - 59 * 1000))).toBe('59 seconds ago')
      expect(rt.format(new Date(Date.now() + 12 * 24 * 60 * 60 * 1000))).toBe(
        'in 12 days'
      )
      expect(rt.format(new Date(Date.now() - 12 * 24 * 60 * 60 * 1000))).toBe(
        '12 days ago'
      )
    })
  })
})
