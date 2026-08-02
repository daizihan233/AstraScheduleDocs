> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# CORS（跨域资源共享）

## 通俗解释

浏览器有安全限制，不能随便访问其他域名的资源。CORS 就是告诉浏览器："这个域名可以访问我的资源"。没有 CORS 配置，前端就调不通后端 API。

AstraSchedule 后端配置 CORS，允许管理端跨域调用 API。

## 专业解释

CORS（Cross-Origin Resource Sharing）是一种浏览器安全机制，控制网页能否访问不同源的资源。

"源"由协议 + 域名 + 端口组成，如 `https://admin.example.com:443`。

工作流程：
1. 浏览器发送跨域请求
2. 服务器返回 `Access-Control-Allow-Origin` 头
3. 浏览器检查是否允许，允许则继续，否则拦截

常见配置：
- `Access-Control-Allow-Origin`：允许的源
- `Access-Control-Allow-Methods`：允许的方法
- `Access-Control-Allow-Headers`：允许的头

在 AstraSchedule 中，后端需要配置 CORS 允许管理端域名访问。
