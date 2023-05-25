# dateFormat

轻巧易用的日期/时间格式化函数。根据传入的占位符返回格式化后的日期/时间。

Lightweight and easy date/time formatting function that returns the formatted date/time based on the passed in placeholders.

## Install

**npm**

```
npm install @jotter/dateformat
```
**browser**

```
https://cdn.jsdelivr.net/npm/@jotter/dateformat/dist/index.global.js
```


## Usage

```js
import dateFormat from '@jotter/dateformat'

dateFormat(new Date(), 'ddd YYYY/MM/DD HH:mm:ss SSS ZZ')
// Thu 2023/05/25 14:04:25 405 +0800

dateFormat(new Date())
// 2023-05-25 14:05:46

dateFormat(new Date(), 'date')
// '2023-05-25'

dateFormat(new Date(), 'time')
// '13:58:30'

dateFormat('2023/05/25 14:04:25', 'YYYY/MM/DD AAh:mm EEE')
// 2023/05/25 下午2:04 星期四

dateFormat('2023/05/25 14:04:25', 'dddd YYYY/MM/DD hh:mm a.')
// Thursday 2023/05/25 02:04 pm.

dateFormat('2023-5-21', '[Today is] dddd')
// Today is Sunday

dateFormat('2023-5-25', (date) => {
  return `今天是${date.M}月${date.D}日 星期${date.E}`
})
// 今天是5月25日 星期四
```

## API
```js
dateFormat(date, formatter)
```

### date
需要格式化的日期/时间
- `type` : `Date | string | number`
### formatter
格式化方式。
- `type` : `string | Function | 'datetime' | 'date' | 'time'`
- `default`: `datetime`



## 对照表
1. 对照表与 `moment.js` 一致
2. 将字符放在方括号中，即可原样返回而不被格式化替换 (例如， `[MM]`)

| 占位符 | 输出             | 详情                    |
| ------ | ---------------- | ----------------------- |
| `YY`   | 23               | 两位数的年份            |
| `YYYY` | 2023             | 四位数的年份            |
| `M`    | 1-12             | 月份，从 1 开始         |
| `MM`   | 01-12            | 月份，两位数            |
| `D`    | 1-31             | 月份里的一天            |
| `DD`   | 01-31            | 月份里的一天，两位数    |
| `Q`    | 1-4              | 季度（数字）            |
| `QQ`   | 一 至 四         | 季度 (中文)             |
| `d`    | 0-6              | 周, 星期天是0 (数字)    |
| `dd`   | Su-Sa            | 最简写的星期几          |
| `ddd`  | Sun-Sat          | 简写的星期几            |
| `dddd` | Sunday-Saturday  | 星期几                  |
| `E`    | 日 至 六         | 周 (中文)               |
| `EE`   | 周日 至 周六     | 周几                    |
| `EEE`  | 星期日 至 星期六 | 星期几                  |
| `H`    | 0-23             | 小时                    |
| `HH`   | 00-23            | 小时，两位数            |
| `h`    | 1-12             | 小时, 12 小时制         |
| `hh`   | 01-12            | 小时, 12 小时制, 两位数 |
| `m`    | 0-59             | 分钟                    |
| `mm`   | 00-59            | 分钟，两位数            |
| `s`    | 0-59             | 秒                      |
| `ss`   | 00-59            | 秒, 两位数              |
| `S`    | 0-9              | 毫秒 (后1位)            |
| `SS`   | 00-99            | 毫秒 (后2位)            |
| `SSS`  | 000-999          | 毫秒 (3位)              |
| `Z`    | +05:00           | UTC 的偏移量，±HH:mm    |
| `ZZ`   | +0500            | UTC 的偏移量，±HHmm     |
| `a`    | am/pm            |                         |
| `A`    | AM/PM            |                         |
| `AA`   | 上午/下午        |                         |

