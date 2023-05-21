import dateFormat from '../src/index'
 describe('dateFormat', () => {
  let date: Date
  beforeEach(() => {
    date = new Date('2023-05-19 15:25:36')
  })

  it('如果日期无效，应该抛出错误', () => {
    expect(() => {dateFormat('invalid date')}).toThrow('date is invalid!')
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
      return `今年是${dateInfo.yyyy}年`
    })).toEqual('今年是2023年')
  })

  it('自定义格式化日期', () => {
    expect(dateFormat(date, 'yyyy/MM/dd')).toEqual('2023/05/19')
    expect(dateFormat(date, 'yyyy年MM月dd日')).toEqual('2023年05月19日')
  })
  
  it('如果isPad为真, 则用0填充日期位数', () => {
    date = new Date('2023-01-01 1:2:3')
    expect(dateFormat(date, 'yyyy/MM/dd HH:mm:ss', true)).toEqual('2023/01/01 01:02:03')
  })

  it('如果isPad为假, 则不填充日期位数', () => {
    date = new Date('2023-01-01 1:2:3')
    expect(dateFormat(date, 'yyyy/MM/dd HH:mm:ss', false)).toEqual('2023/1/1 1:2:3')
  })
 })