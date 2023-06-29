export function isPlanObject(arg: any) {
  return Object.prototype.toString.call(arg) === '[object Object]'
}

export const isArray = Array.isArray || function(arg: any) {
  return arg instanceof Array
}

export const assign = Object.assign || function<T extends { [key: string]: any }>(target: T): T {
  if (target === undefined || target === null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  const len = arguments.length
  for (let i = 1; i < len; i++) {
    const source: T = arguments[i]
    if (source !== undefined && source !== null) {
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          target[key] = source[key]
        }
      }
    }
  }
  return target
}
