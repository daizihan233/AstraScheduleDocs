> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# WebSocket

## 通俗解释

HTTP 请求像发短信，一来一回就结束了。WebSocket 像打电话，建立连接后双方可以随时说话。服务器可以主动推消息给客户端，不用等客户端来问。

AstraSchedule 用 WebSocket 实时通知客户端更新课表。配置改了，服务器马上告诉所有客户端，不用等它们自己来查。

## 专业解释

WebSocket 是一种网络通信协议，提供全双工通信通道，允许服务器主动向客户端推送数据。

与 HTTP 对比：
- **HTTP**：客户端请求 → 服务器响应（单向发起）
- **WebSocket**：建立连接后，双方可随时发送数据（双向）

在 AstraSchedule 中：
- 地址格式：`ws://{host}/ws/{school}/{grade}/{class_number}`
- 消息类型：`SyncConfig`（配置同步广播）
- 心跳：25 秒间隔 ping
- 重连：指数退避算法，初始 1 秒，最大 30 秒

Serverless 模式下不支持 WebSocket（返回 501），客户端通过轮询获取配置。
