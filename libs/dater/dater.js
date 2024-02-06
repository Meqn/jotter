import * as Utils from './utils'
import en from './locale/en'

// 全局 locale
let CURRENT_LOCALE = 'en'
const LOCALES = {}
LOCALES[CURRENT_LOCALE] = en

const isDater = d => d instanceof Dater || (d && d['$is'])

function dater(...args) {
  const date = args[0]
  if (isDater(date)) return date.clone()

  let last = args[args.length - 1]
  if (typeof last === 'boolean' || Utils.isObject(last)) {
    args.pop()
  }
  return new Dater(args, last)
}

class Dater {
  constructor(date, options) {
    options = typeof options === 'boolean' ? {utc: options} : options || {}
    this.parse(date, options.utc)
    this.$is = true // 标记为 dater
    this.$utc = !!options.utc
    this.$locale = LOCALES[options.locale] || LOCALES[CURRENT_LOCALE] //当前locale数据
  }

  parse(date, utc) {
    this.$date = Utils.parseDate(date, utc)
    this.init()
  }
  init() {
    const d = this.$date
    this.$timestamp = d.getTime()
    this.$year = d.getFullYear()
    this.$month = d.getMonth()
    this.$day = d.getDate()
    this.$hour = d.getHours()
    this.$minute = d.getMinutes()
    this.$second = d.getSeconds()
    this.$millisecond = d.getMilliseconds()
    this.$week = d.getDay()
  }
  locale(preset, data) {
    if (!preset) return this.$locale['name']

    if (typeof preset === 'string') {
      const name = preset.toLowerCase()
      let localeData = LOCALES[name]

      if (Utils.isObject(data)) {
        localeData = data
      } else if (typeof data === 'function') {
        localeData = data.call(dater, localeData)
      }

      if (localeData) {
        localeData.name = name
        this.$locale = localeData
      }
    } else if (Utils.isObject(preset)) {
      this.$locale = preset
    }

    return this
  }
  isValid() {
    // return this.$date.toString() !== 'Invalid Date'
    return !isNaN(this.$timestamp)
  }
  unix() {
    return Math.floor(this.$timestamp / 1000)
  }
  clone() {
    return dater(this.$date, {
      utc: this.$utc,
      locale: this.$locale['name']
    })
  }
}

// 复制 Date.prototype 的方法
Object.getOwnPropertyNames(Date.prototype).forEach(prop => {
  const dateFn = Date.prototype[prop]
  if (prop !== 'constructor' && typeof dateFn === 'function') {
    Dater.prototype[prop] = function (...args) {
      // 操作clone数据
      if (prop.indexOf('set') === 0) {
        const clone = this.clone()
        dateFn.apply(clone.$date, args)
        clone.init()
        return clone
      }
      return dateFn.apply(this.$date, args)
    }
  }
})

dater.prototype = Dater.prototype

/**
 * 注册插件
 * @param {function} plugin - 需要注册的插件
 * @param {any} option - 插件的可选参数
 * @return {dater}
 */
dater.use = function (plugin, option) {
  if (!plugin.installed) {
    plugin.call(dater, option, Dater, dater)
    plugin.installed = true
  }
  return dater
}

/**
 * 设置locale数据
 * @param {string|Object} preset - locale名称或预设数据对象
 * @param {Object|function} data - 预设数据对象
 */
dater.locale = function (preset, data) {
  if (!preset) return CURRENT_LOCALE

  if (typeof preset === 'string') {
    const name = preset.toLowerCase()
    let localeData = LOCALES[name]
    // 处理 data 数据(覆盖或更新)
    if (Utils.isObject(data)) {
      localeData = data
    } else if (typeof data === 'function') {
      localeData = data.call(dater, localeData)
    }

    if (localeData) {
      CURRENT_LOCALE = name //变更默认语言
      localeData.name = name
      LOCALES[name] = localeData // 保存语言包
    }
  } else if (Utils.isObject(preset)) {
    const {name} = preset
    LOCALES[name] = preset
    CURRENT_LOCALE = name
  }
  return dater
}
dater.parse = (...args) => dater(args).$timestamp
dater.utc = (...args) => dater(args, true)
dater.unix = t => dater(t * 1e3)
dater.now = Date.now
dater.isDater = isDater
dater.utils = Utils
