# fromNow

Very flexible relative time formatting function. You can quickly get formatted times like *2 minutes ago, 3 weeks ago, 5 years from now*.

You can also generate a display that fits your needs by customizing the `locale` and `thresholds` used in the formatting.



简单灵活的相对时间格式化函数。可以快速获取像 *2分钟前，3周前，5年后* 的格式化时间。

您还可以通过自定义格式化中使用的语言和阈值，生成合适的显示方式。

## Install

**npm**

```
npm install @jotter/from-now
```
**browser**

```
https://cdn.jsdelivr.net/npm/@jotter/from-now/dist/index.global.js
```


## Usage

```js
import fromNow from '@jotter/date-now'

fromNow('2023-06-16 12:50:20')  // now
fromNow('2023-06-16')  // 13 hours ago
fromNow('2023-06-15')  // 2 days ago
fromNow('2023-06')  // 2 weeks ago
fromNow('2023')  // 6 months ago
fromNow('2022')  // a year ago
fromNow('2028')  // in 5 years

// 更改当前环境语言
fromNow.locale('zh')

fromNow('2023-06-16 12:50:20')  // 刚刚
fromNow('2023-06-16')  // 13 小时前
fromNow('2023-06-15')  // 2 天前
fromNow('2023-06')  // 2 周前
fromNow('2023')  // 6个月前
fromNow('2022')  // 1 年前
fromNow('2028')  // 5 年后
```

或者**创建新的实例**:

```js
import { create } from '@jotter/date-now'

const fromNow = create({
  locale: {},
  thresholds: {}
})

fromNow('2023-06-16')  // 13小时前
fromNow('2023-06-15')  // 2天前
fromNow('2023-06')  // 2周前
fromNow('2023')  // 6个月前
fromNow('2022')  // 1年前
```


## API

### 1. fromNow()
相对时间格式化函数

```js
fromNow(date)
```

**methods**

#### locale(name, config)
更改相对时间格式化字符串对象或语言环境。
- `name`: 语言环境, `'en' | 'zh'`
- `config`: 格式化字符串对象

#### thresholds(config)
更改时间段阈值。
- `config`: 时间段阈值对象

### 2. create()
创建一个新的相对时间格式化函数。

```js
const fromNow = create(locale, thresholds)

fromNow(date)
```

- `locale` : 相对时间格式化字符串对象或语言环境
  - type : `'en' | 'zh' | object`
- `thresholds` : 时间段阈值对象
  - type : `object`



## 时间段 (thresholds)
> 与 `moment.js` 一致.

| 范围                    | Key  | 示例输出               |
| :---------------------- | :--- | :--------------------- |
| 0 到 44 秒              | s    | 几秒钟前               |
| *取消设置*              | SS   | 44 秒前                |
| 45 至 89 秒             | m    | 一分钟前               |
| 90 秒到 44 分钟         | mm   | 2 分钟前... 44 分钟前  |
| 45 至 89 分钟           | h    | 一小时前               |
| 90 分钟到 21 小时       | hh   | 2 小时前 ... 21 小时前 |
| 22 至 35 小时           | d    | 一天前                 |
| 36 小时至 25 天         | dd   | 2 天前 ... 25 天前     |
| 26 至 45 天             | M    | 一个月前               |
| 45 至 319 天            | MM   | 2 个月前 ... 10 个月前 |
| 320 至 547 天（1.5 年） | y    | 一年前                 |
| 548 天+                 | yy   | 2 年前 ... 20 年前     |



## 格式化字符串对象 (locale)

```js
{
  future: 'in %s',
  past: '%s ago',
  s: 'a few seconds',
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
```

> **说明**：
> 1. 如果字符串包含`%ns`，则表示不显示后缀。 比如 `{ s: '刚刚%ns' }`;
> 2. 如果格式对象属性值为数组，比如 `{ s: ['刚刚%ns', '很快%ns'] }`
>   - `[0]`表示 `past` 的格式化结果
>   - `[1]`表示 `future` 的格式化结果
