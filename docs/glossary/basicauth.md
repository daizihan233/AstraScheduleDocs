> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# BasicAuth

## 通俗解释

BasicAuth 是最简单的认证方式。每次请求时带上用户名和密码，服务器验证后才处理。密码用 Base64 编码（不是加密），所以必须配合 HTTPS 使用。

AstraSchedule 管理端当前使用 JWT 认证。BasicAuth 曾是旧版本的认证方式，现已不再使用。登录走 `/web/auth/login` 获取 Token，写操作通过 `X-Verify-Password` 二次确认**用户密码**（不是 `secret.token`）。

## 专业解释

BasicAuth（HTTP 基本认证）是 HTTP 协议规定的认证机制，定义在 RFC 7617。

工作流程：
1. 客户端在请求头中添加 `Authorization: Basic <base64(username:password)>`
2. 服务器解码并验证用户名密码
3. 验证通过处理请求，失败返回 401

特点：
- **简单**：无需额外库支持
- **无状态**：每次请求都带凭证
- **不安全**：Base64 可逆，必须 HTTPS

在 AstraSchedule 中，管理端 BasicAuth 已被 JWT 取代：
- 当前认证方式：JWT（`Authorization: Bearer <token>`），签名密钥为 `secret.token`
- 写操作确认：`X-Verify-Password` 头传递**当前登录用户的密码**
