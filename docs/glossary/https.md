> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# HTTPS

## 通俗解释

HTTPS 就是加密的 HTTP。数据在传输过程中被加密，别人偷看也看不懂。浏览器地址栏的锁图标就表示正在使用 HTTPS。

AstraSchedule 外网部署使用 Cloudflare（或阿里云 ESA）自动管理 HTTPS 证书。

## 专业解释

HTTPS（HTTP Secure）是 HTTP 的安全版本，通过 TLS/SSL 协议加密数据传输。

工作流程：
1. 客户端发起 HTTPS 请求
2. 服务器返回证书
3. 客户端验证证书有效性
4. 双方协商加密算法
5. 建立加密通道，开始传输数据

优势：
- **数据加密**：防止窃听
- **身份验证**：确认服务器身份
- **数据完整性**：防止篡改

证书获取方式：
- **Let's Encrypt**：免费自动证书
- **云服务商**：如 Cloudflare、阿里云
- **自签名**：仅用于内网测试

在 AstraSchedule 中，Cloudflare（或阿里云 ESA）自动管理 HTTPS 证书，无需手动操作。
