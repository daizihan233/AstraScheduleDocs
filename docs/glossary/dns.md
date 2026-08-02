> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# DNS（域名系统）

## 通俗解释

DNS 就是互联网的电话簿。你输入域名（如 `getastra.cn`），DNS 帮你找到对应的 IP 地址，浏览器才能连接服务器。

配置 AstraSchedule 时，需要在域名注册商处修改 DNS 服务器到 Cloudflare。

## 专业解释

DNS（Domain Name System）是互联网的分布式命名系统，将域名转换为 IP 地址。

工作流程：
1. 用户输入域名
2. 浏览器查询本地缓存
3. 未命中则查询 DNS 服务器
4. DNS 服务器返回 IP 地址
5. 浏览器连接该 IP

常见记录类型：
- **A**：域名 → IPv4 地址
- **AAAA**：域名 → IPv6 地址
- **CNAME**：域名 → 另一个域名
- **MX**：邮件服务器
- **TXT**：文本记录（如 SPF、DKIM）

在 AstraSchedule 中，需要配置 CNAME 记录将 `api` 和 `admin` 子域名指向对应服务。
