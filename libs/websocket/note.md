
## 知识点

### readyState属性
返回当前websocket的链接状态
- `WebSocket.CONNECTING` = `0` : 正在链接中
- `WebSocket.OPEN` = `1` : 已经链接并且可以通讯
- `WebSocket.CLOSING` = `2` : 连接正在关闭
- `WebSocket.CLOSED` = `3` : 连接已关闭或者没有链接成功


### close
websocket断开事件和方法

#### WebSocket.onclose(event)
- `event.code` 错误码
- `event.reason` 错误原因
- `event.wasClean` 表示是否正常断开，是布尔值。异常断开时为false

#### WebSocket.close(code, reason)
- `1000`: CLOSE_NORMAL, 正常关闭
- `1005`: CLOSE_NO_STATUS, 未收到预期的状态码
- `1006`: CLOSE_ABNORMAL, 非正常关闭
- `1007`: Unsupported, 接收的数据合格不符而断开
- `1008`: Policy Violation, 由于收到不符合约定的数据而断开连接。(等效 HTTTP 400)
- `1009`: CLOSE_TOO_LARGE, 收到过大的数据帧而断开连接
- `1011`: Internal Error, 服务端断开连接 (等效 HTTTP 500)
- `1012`: Service Restart, 由于服务器重启而断开连接



## 心跳检测

1. 创建 `ping()` 方法
   - 在ping函数内，首先要清除之前的计时器
2. 每次接收到消息(`onmessage`)时触发 `ping()` 方法
   - 接收到任何消息说明当前连接正常
   - `bufferedAmount = 0` 表明所有消息已发送完毕
3. 连接成功后(`onopen`)执行一次`ping()`方法(触发onmessage)

> 1. bufferedAmount === 0 表明所有消息已发送完毕
> 2. 接收任何消息说明当前连接正常



## 自动重连
1. 在 onclose 中，非正常关闭，则触发自动重连
2. 在 onopen 后，要重置 重连次数和计时器。
3. 在 open() 的参数中做标记，如果是重连打开，则处理是否超过重连最大次数；如果正常打开，则清空重连次数。
4. reconnect()重连函数
   1. 重连计时器延时时间 随次数增加
   2. 超过最大连接次数限制，则自动关闭



## 待发消息队列
1. _messageQueue = new Set() (可去重)
2. onopen 连接成功后处理 _messageQueue ，谨记：执行完后重置
3. 在 send() 内，连接失败(ws.readyState !== 1) 插入队列



## 思考
1. 以类的方式封装
2. 异常情况下的断开重连、用户手动断开则不重连
3. 消息发送失败的处理，下次连接成功时发送之前失败的内容
4. 订阅消息、取消订阅（需要结合发布订阅者模式）
5. 根据不同的类型，处理不同的消息
6. 销毁
