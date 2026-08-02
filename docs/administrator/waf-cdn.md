> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# WAF 与 CDN 配置

Web 应用防火墙（WAF）和 CDN 是 AstraSchedule 外网部署方案的安全屏障。不同部署方案使用不同的安全组件，本章分别说明。

## 🔰 极低成本方案（Cloudflare）

极低成本方案使用 Cloudflare 免费套餐，已足够日常使用。

### DNS 代理模式

在 Cloudflare DNS 设置中，确保你的域名记录开启了代理（橙色云朵图标）。代理模式下，所有流量先经过 Cloudflare 边缘节点，获得 CDN 加速和安全防护。

**如何检查：**

1. 登录 Cloudflare 控制台 → 选择你的域名
2. 进入 **DNS → Records**
3. 确认 `api` 和 `admin` 两条 CNAME 记录的代理状态均为 🟢 已代理

### WAF 基础规则

Cloudflare 免费套餐可以开启 **Cloudflare Managed Ruleset**（需在 WAF 页面手动启用），可防御：

- SQL 注入攻击
- 跨站脚本攻击（XSS）
- 命令注入
- 常见漏洞扫描行为

**开启后无需额外配置**。如果遇到客户端或管理端异常访问失败，可能是 WAF 误拦截，按照下方「查看拦截日志」排查。

### 速率限制规则

通过速率限制防止 API 被恶意高频调用。进入 **Security → WAF → Rate limiting rules**，创建以下规则：

> ⚠️ Cloudflare 免费套餐的速率限制规则数量与流量额度有限（免费版约 1 条规则、每月 1 万次请求额度，以 Cloudflare 当前套餐政策为准）。规则太多会无法保存，请按需取舍。

#### API 全局限速（建议）

| 配置项 | 值 |
|--------|-----|
| 规则名称 | API Global Rate Limit |
| 匹配条件 | `Hostname` = `api.你的域名.com` |
| 速率 | 同一 IP 每分钟 100 个请求 |
| 操作 | 阻止（Block） |
| 阻止时长 | 1 分钟 |

#### API 路径单独限速

如果你的客户端数量较多，建议对部分敏感路径单独限速：

| 配置项 | 值 |
|--------|-----|
| 规则名称 | API Path Rate Limit |
| 匹配条件 | `Hostname` = `api.你的域名.com` AND `URI Path` contains `/web/` |
| 速率 | 同一 IP 每分钟 60 个请求 |
| 操作 | 阻止（Block） |
| 阻止时长 | 1 分钟 |

> **速率选择建议**：如果全校有 30 个班级，每个客户端定期拉取配置，则请求量很低。60 次/分钟的上限留有充足余量。如果你的客户端数量更多或刷新频率更高，请适当调高阈值。

#### 管理端登录接口限速

| 配置项 | 值 |
|--------|-----|
| 规则名称 | Admin Login Rate Limit |
| 匹配条件 | `Hostname` = `admin.你的域名.com` AND `URI Path` contains `/login` |
| 速率 | 同一 IP 每分钟 10 个请求 |
| 操作 | 阻止（Block） |
| 阻止时长 | 5 分钟 |

### 自定义 WAF 规则示例

进入 **Security → WAF → Custom rules**，以下是一些常用规则：

#### 阻止特定国家/地区之外的访问

如果学校的客户端和管理员都在国内，可以限制仅允许中国 IP 访问：

| 配置项 | 值 |
|--------|-----|
| 字段 | `Country` |
| 运算符 | `is in` |
| 值 | 选择你需要允许的国家/地区 |
| 操作 | 阻止（Block） |

> ⚠️ 使用此规则前请确认所有合法访问来源的 IP 归属地。如果使用 Cloudflare 的免费套餐，国家级别过滤精度有限，可能误拦截。

#### 封禁恶意 IP

如果发现某个 IP 持续攻击，可以手动添加封禁规则：

| 配置项 | 值 |
|--------|-----|
| 字段 | `IP Source Address` |
| 运算符 | `equals` |
| 值 | 目标 IP 地址 |
| 操作 | 阻止（Block） |

### 查看拦截日志

当客户端或管理端出现异常的访问失败时，可以通过以下步骤排查是否被 WAF 拦截：

1. 登录 Cloudflare 控制台 → 选择你的域名
2. 进入 **Security → Events**
3. 查看最近的「已阻止」事件，包含：
   - 被拦截的请求路径和来源 IP
   - 触发拦截的规则名称
   - 时间戳
4. 如果确认是误拦截，可以针对该规则创建「跳过」规则或调整规则条件

## 🏫 内网方案

内网方案的服务器不暴露到公网，**无需配置 WAF 和 CDN**。但应确保基本的网络安全措施。

### 防火墙规则建议

运行 AstraSchedule 服务器的内网机器应配置以下防火墙规则：

| 规则 | 说明 |
|------|------|
| 放行 TCP 80 | Nginx HTTP 端口，管理端访问入口 |
| 放行 TCP 443 | Nginx HTTPS 端口（如配置了 HTTPS） |
| 放行 TCP 9000 | 后端 API 端口 |
| 拒绝其他入站端口 | 最小化攻击面 |

**Linux 服务器（ufw）示例：**

```shell
# 启用防火墙
sudo ufw enable

# 放行必要端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 9000/tcp

# 查看规则
sudo ufw status
```

**Windows 服务器示例：**

```powershell
# 以管理员身份运行，放行必要端口
New-NetFirewallRule -DisplayName "AstraSchedule HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "AstraSchedule HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
New-NetFirewallRule -DisplayName "AstraSchedule API" -Direction Inbound -Protocol TCP -LocalPort 9000 -Action Allow
```

### 访问控制

如需进一步限制访问来源，可以在 Nginx 中配置 IP 白名单：

```nginx
server {
    listen 80;
    server_name _;

    # 仅允许内网 IP 段访问
    allow 192.168.0.0/16;
    allow 10.0.0.0/8;
    allow 172.16.0.0/12;
    deny all;

    location / {
        root /opt/astra-web/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

## 🚀 高并发方案（阿里云 ESA）

高并发方案使用阿里云 ESA（全站加速），提供企业级安全防护。

### DDoS 防护

ESA 默认提供 DDoS 基础防护，自动检测和清洗攻击流量。如果遭遇大规模 DDoS 攻击，可以在 ESA 控制台开启高级防护功能（需额外付费）。

### WAF 自定义规则

ESA 提供比 Cloudflare 免费版更精细的 WAF 控制能力。进入 ESA 控制台 → **WAF 管理**，可创建以下规则：

#### API 防护规则

| 配置项 | 建议值 |
|--------|--------|
| 规则类型 | 正则匹配 |
| 匹配字段 | `URI` |
| 匹配内容 | `^/web/(import|export|copy|delete)` |
| 防护动作 | 观察 或 拦截 |

> 💡 建议新规则先设为「观察」模式运行一周，确认无误报后再切换为「拦截」。

#### SQL 注入防护

ESA 内置 SQL 注入检测引擎。确保 **Web 基础防护** 中的 SQL 注入规则已启用，防护模式设为「拦截」。

### 速率限制

进入 ESA 控制台 → **频率控制**：

| 规则 | 速率 | 动作 |
|------|------|------|
| API 全局限速 | 100 次/分钟 | 拦截 1 分钟 |
| `/web/` 路径限速 | 60 次/分钟 | 人机识别 |
| 登录接口限速 | 10 次/分钟 | 拦截 5 分钟 |

### Bot 管理

ESA 提供 Bot 检测和管理功能。建议启用：

- **搜索引擎爬虫白名单**：允许百度、Google 等合法爬虫
- **恶意 Bot 拦截**：自动拦截已知恶意爬虫和扫描工具
- **异常行为检测**：标记高频访问、异常 User-Agent 等行为

进入 ESA 控制台 → **Bot 管理**，选择适当的防护等级：

| 防护等级 | 说明 | 推荐场景 |
|----------|------|----------|
| 宽松 | 仅拦截已知恶意 Bot | 追求低误杀率 |
| 正常 | 拦截恶意 Bot + 行为分析 | **推荐** |
| 严格 | 严格的 Bot 检测 | 遭遇攻击时临时提升 |
