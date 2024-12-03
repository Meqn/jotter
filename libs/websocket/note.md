## websocket

### close

关闭当前websocket连接

#### WebSocket.onclose(event)

- `event.code` 错误码
- `event.reason` 错误原因
- `event.wasClean` 表示连接是否完全关闭，是布尔值。

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

在WebSocket连接成功时(onopen)，设置一个定时器，每隔一段时间发送一个ping消息。

1. `onopen` 中启动心跳检测
2. `onmessage` 中重置心跳检测
3. `onclose` 中清除心跳检测定时器

> 1. bufferedAmount === 0 表明所有消息已发送完毕
> 2. 接收任何消息说明当前连接正常

## 自动重连

在WebSocket非正常关闭时(1.非主动关闭; 2.错误码判断)，启动自动重连，且有重连次数限制。

1. `onclose` 中判断非主动关闭则自动重连。
2. `onopen` 中重置重连次数和计时器。

## 待发消息队列

在WebSocket未连接成功时，将待发消息存储在队列中，在WebSocket连接成功后，处理队列中的消息。

1. `onopen` 中处理队列中的消息，处理完后重置队列。
2. `send()` 中判断连接状态，未连接时则保存待发送的消息。

> 1. `ws.readyState !== WebSocket.OPEN` 表示未连接

---

## Refs

- https://github.com/pladaria/reconnecting-websocket/
- https://github.com/joewalnes/reconnecting-websocket
- https://github.com/zimv/websocket-heartbeat-js
- https://github.com/jaywcjlove/websocket/
- https://github.com/appuri/robust-websocket/
- https://github.com/theturtle32/WebSocket-Node/
