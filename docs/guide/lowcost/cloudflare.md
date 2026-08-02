> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# Cloudflare CDN 与安全防护配置

## 概述

Cloudflare 是全球最大的 CDN 和安全防护服务商之一，其免费套餐已经包含 CDN 加速、DDoS 防护、WAF（Web 应用防火墙）和免费 SSL 证书，完全满足学校场景的需求。

将你的域名接入 Cloudflare 后，所有流量都会先经过 Cloudflare 的边缘节点，自动获得以下能力：

- **CDN 加速**：静态资源缓存在全球节点，访问更快
- **HTTPS 自动配置**：免费 SSL 证书，自动续期
- **DDoS 防护**：自动拦截恶意流量攻击
- **WAF 安全规则**：防御常见 Web 攻击（SQL 注入、XSS 等）
- **速率限制**：防止接口被恶意高频调用

整个过程除了购买域名外不产生任何费用。

## 你需要准备

- 一个已注册的域名（任何域名注册商均可，如阿里云、腾讯云、Namecheap 等）
- 一个邮箱地址（用于注册 Cloudflare 账号）

## 步骤

### 1. 注册 Cloudflare 账号

1. 打开 [Cloudflare 官网](https://www.cloudflare.com/)
2. 点击右上角 **Sign Up**，输入邮箱和密码
3. 注册完成后，登录到 Cloudflare 控制台

### 2. 添加站点

1. 登录后，在控制台首页点击 **Add a site**（添加站点）
2. 输入你的根域名（例如 `your-domain.com`），不要带 `www` 或任何协议前缀
3. Cloudflare 会扫描现有的 DNS 记录，等待扫描完成
4. 选择 **Free** 计划（免费套餐），点击 **Continue**

### 3. 修改域名 DNS 服务器

Cloudflare 会给你分配两个 DNS 服务器地址，类似：

```
dino.ns.cloudflare.com
lady.ns.cloudflare.com
```

你需要到域名注册商那边，将域名的 DNS 服务器修改为 Cloudflare 分配的地址：

1. 登录你的域名注册商管理后台（如阿里云域名控制台）
2. 找到你的域名，进入「DNS 管理」或「修改 DNS」页面
3. 将原来的 DNS 服务器替换为 Cloudflare 提供的两个地址
4. 保存修改

DNS 服务器变更需要一定时间全球生效，通常在几分钟到几小时内完成。Cloudflare 控制台会显示验证状态，通过后会发邮件通知你。

### 4. 添加 DNS 记录

进入 Cloudflare 控制台的 **DNS → Records** 页面，为 AstraSchedule 的两个子域名添加 CNAME 记录。

#### 后端 API 子域名

| 配置项 | 值 |
|--------|-----|
| 类型 | CNAME |
| 名称 | `api`（建议，别的也行） |
| 目标 | 阿里云函数计算的 CNAME 地址 |
| 代理状态 | 🟢 已代理（橙色云朵） |

#### 管理端子域名

| 配置项 | 值 |
|--------|-----|
| 类型 | CNAME |
| 名称 | `admin`（建议，别的也行） |
| 目标 | Cloudflare Pages 自动配置 |
| 代理状态 | 🟢 已代理（橙色云朵） |

关于代理状态的说明：

- 🟢 **已代理**（橙色云朵）：流量经过 Cloudflare，启用 CDN 和安全防护功能。这是推荐的设置。
- ⬜ **仅 DNS**（灰色云朵）：流量直连源站，不经过 Cloudflare。仅在特殊情况（如配置了其他 CDN 和安全措施）时使用。

添加完成后，两个子域名的记录应该如下图所示：

```
CNAME  api     →  xxx.fc.aliyuncs.com       🟢
CNAME  admin   →  xxx.pages.dev           🟢
```

### 5. 配置 SSL/TLS

1. 进入 **SSL/TLS → Overview** 页面
2. 将加密模式设置为 **Full (strict)**

SSL/TLS 加密模式说明：

| 模式 | 说明 | 推荐 |
|------|------|------|
| Off | 不加密 | 不推荐 |
| Flexible | 浏览器到 Cloudflare 加密，Cloudflare 到源站不加密 | 不推荐 |
| Full | 全程加密，但不验证源站证书 | 可用 |
| Full (strict) | 全程加密，且验证源站证书有效性 | **推荐** |

Full (strict) 模式要求你的源站（函数计算和 Cloudflare Pages）也配置了有效的 SSL 证书。阿里云函数计算和 Cloudflare Pages 都默认提供 HTTPS，所以可以直接使用此模式。

3. 在 **Edge Certificates** 子页面中，确保以下选项已开启：
   - **Always Use HTTPS**：自动将 HTTP 请求重定向到 HTTPS
   - **Automatic HTTPS Rewrites**：自动修复页面中的混合内容问题

### 6. 启用 WAF（Web 应用防火墙）

WAF 可以自动拦截常见的安全威胁，保护你的后端接口和管理端。

1. 进入 **Security → WAF** 页面
2. 在 **Security → WAF** 页面，开启 **Cloudflare Managed Ruleset**（免费套餐也可以启用，需手动打开），这是一组由 Cloudflare 维护的安全规则，可以防御：
   - SQL 注入攻击
   - 跨站脚本攻击（XSS）
   - 命令注入
   - 常见的漏洞扫描行为

3. 如果你使用的是 Pro 及以上套餐，还可以额外启用 OWASP 核心规则集。

#### 自定义 WAF 规则（可选）

如果你的访问量较大或需要更精细的控制，可以在 **Security → WAF → Custom rules** 中创建自定义规则。例如，限制对后端 API 的访问频率：

规则名称：`API Rate Limit`

| 配置项 | 值 |
|--------|-----|
| 字段 | `Hostname` |
| 运算符 | `equals` |
| 值 | `api.your-domain.com` |
| 操作 | Managed Challenge |
| 触发条件 | 同一 IP 每分钟请求超过 60 次 |

### 7. 速率限制建议

通过速率限制可以保护后端 API 不被刷接口或被恶意高频调用，维持服务稳定。

进入 **Security → WAF → Rate limiting rules**，点击 **Create rule**，建议创建以下规则：

> ⚠️ Cloudflare 免费套餐的速率限制规则数量与流量额度有限（免费版约 1 条规则、每月 1 万次请求额度，以 Cloudflare 当前套餐政策为准）。规则太多会无法保存，请按需取舍。

#### API 全局限速

| 配置项 | 值 |
|--------|-----|
| 规则名称 | API Global Rate Limit |
| 匹配条件 | `Hostname` = `api.your-domain.com` |
| 请求路径 | 全部路径 |
| 速率 | 同一 IP 每分钟 100 个请求 |
| 操作 | 阻止（Block） |
| 阻止时长 | 1 分钟 |

#### 管理端登录接口限速

| 配置项 | 值 |
|--------|-----|
| 规则名称 | Admin Login Rate Limit |
| 匹配条件 | `Hostname` = `admin.your-domain.com` AND `URI Path` contains `/login` |
| 速率 | 同一 IP 每分钟 10 个请求 |
| 操作 | 阻止（Block） |
| 阻止时长 | 5 分钟 |

### 8. 验证

1. 等待 DNS 生效后，在浏览器中访问 `https://api.your-domain.com/`，应该能正常返回后端响应
2. 访问 `https://admin.your-domain.com/`，应该能打开管理端页面
3. 检查地址栏左侧是否有锁图标，确认 HTTPS 正常工作
4. 在 Cloudflare 控制台的 **Analytics** 页面，可以查看流量和安全事件统计

## 注意事项

- DNS 变更后需要耐心等待，全球生效通常需要几分钟到 48 小时不等
- Cloudflare 免费套餐已经足够 AstraSchedule 的日常使用，无需升级
- 如果你之前已经在域名注册商处配置了 DNS 记录，Cloudflare 在添加站点时会自动扫描并导入，但请仔细检查导入结果，确保没有遗漏
- 如果遇到访问问题，可以先在 Cloudflare 控制台点击域名右侧的三个点 → **Pause Cloudflare on Site**，暂时绕过 Cloudflare 排查是否是代理导致的问题
- Cloudflare 的 WAF 规则偶尔会产生误拦截，如果客户端或管理端出现不正常的访问失败，可以在 **Security → Events** 中查看拦截日志，确认后可以针对性地添加跳过规则
