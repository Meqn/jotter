export function isPlanObject(arg: any) {
  return Object.prototype.toString.call(arg) === '[object Object]'
}

export const isArray = Array.isArray || function(arg: any) {
  return arg instanceof Array
}

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
