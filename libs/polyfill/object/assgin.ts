export default Object.assign || function<T extends { [key: string]: any }>(target: T): T {
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

/* 
export function assign<T extends { [key: keyof any]: any }, U extends { [key: keyof any]: any }>(target: T, source: U): T & U {
  if (!isPlanObject(target)) return {} as T & U
  if (!isPlanObject(source)) return target as T & U

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      (target as T & U)[key] = source[key] as any
    }
  }
  return target as T & U
}
*/
