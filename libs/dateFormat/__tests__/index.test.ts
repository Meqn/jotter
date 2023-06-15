import dateFormat from '../src/index'

describe('dateFormat', () => {
  let date: Date
  beforeEach(() => {
    date = new Date('2023-05-19 15:25:36')
  })

  it('如果日期无效，则返回空字符串', () => {
    expect(dateFormat('invalid date')).toEqual('')
  })

  it('验证日期为string类型', () => {
    expect(dateFormat('2023-05-19 15:25:36', 'date')).toEqual('2023-05-19')
  })

  it('验证日期为Date类型', () => {
    expect(dateFormat(date, 'time')).toEqual('15:25:36')
  })

  it('默认datetime 格式化日期', () => {
    expect(dateFormat(date)).toEqual('2023-05-19 15:25:36')
  })

  it('date 格式化日期', () => {
    expect(dateFormat(date, 'date')).toEqual('2023-05-19')
  })

  it('time 格式化日期', () => {
    expect(dateFormat(date, 'time')).toEqual('15:25:36')
  })

  it('自定义函数格式化日期', () => {
    expect(dateFormat(date, (dateInfo) => {
      return `今年是${dateInfo.YYYY}年`
    })).toEqual('今年是2023年')
  })

  it('自定义格式化日期', () => {
    expect(dateFormat(date, 'YYYY/MM/DD')).toEqual('2023/05/19')
    expect(dateFormat(date, 'YYYY年MM月DD日')).toEqual('2023年05月19日')
    expect(dateFormat(date, 'YY-M-D ddd')).toEqual('23-5-19 Fri')
  })

  it('自定义locale参数', () => {
    expect(dateFormat(date, 'dddd', 'en')).toEqual('Friday')
    expect(dateFormat(date, 'dddd', 'zh')).toEqual('星期五')
    expect(dateFormat(date, 'ddd YYYY/MM/DD', 'en')).toEqual('Fri 2023/05/19')
    expect(dateFormat(date, 'ddd YYYY/MM/DD', 'zh')).toEqual('周五 2023/05/19')
  })
 })
 