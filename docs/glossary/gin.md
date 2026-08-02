> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# Gin（Go 的 Web 框架）

## 通俗解释

Gin 是 Go 语言写网站接口（API）的框架。它负责接收浏览器或客户端的请求，路由到对应的处理函数，再返回 JSON 结果。用它能很快地搭出一个后端服务。

## 专业解释

Gin 是 Go 语言的高性能 HTTP Web 框架，以轻量、路由分组、中间件机制著称，常用于构建 RESTful API 服务。

## 在 AstraSchedule 中

- `usr-backend` 与 `sys-backend` 均使用 Gin 提供 API 服务
- 路由按功能分组：`/web/*`（管理端）、无前缀（客户端）、中间件负责 JWT 认证与 namespace 解析
- 响应格式为 `status`/`message`/`data` 或 `error`/`detail`

参见：[Web 管理端 API](../dev/usr-backend/api-web)
