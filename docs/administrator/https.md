> [!WARNING]
>
> 本页由 AI 工具参考代码编写，部分内容未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# HTTPS 配置

HTTPS 加密传输是保护数据传输安全的基础措施。AstraSchedule 的配置数据（课表、作息、科目等）和认证凭据在传输过程中必须加密，防止被中间人窃取或篡改。

## 为什么需要 HTTPS

即便是在内网环境中，也建议启用 HTTPS。原因如下：

1. **认证凭据保护**：AstraSchedule 管理端使用 JWT + 密码确认机制。JWT Token 和密码凭据在 HTTP 明文传输中可被截获。HTTPS 的 TLS 加密可以保护凭据安全。
2. **配置数据完整性**：课表和作息数据在传输过程中如果被篡改，会导致客户端显示错误信息。HTTPS 的 TLS 层提供完整性校验。
3. **浏览器信任**：现代浏览器对 HTTP 页面标记为「不安全」，使用 HTTPS 可以避免浏览器警告。
4. **API 兼容性**：部分 Serverless 平台（如阿里云函数计算）和 CDN 服务需要 HTTPS 才能正常工作。

## 🔰 极低成本方案（Cloudflare 自动 HTTPS）

极低成本方案使用 Cloudflare CDN，**HTTPS 证书完全自动管理，无需手动操作**。

### 工作原理

1. 域名接入 Cloudflare 并开启代理（橙色云朵）
2. Cloudflare 自动为你的域名签发 SSL 证书（泛域名证书）
3. 证书到期前自动续期，无需人工干预
4. 浏览器访问 `https://api.你的域名.com` 即完成加密连接

### 配置检查清单

进入 Cloudflare 控制台 → 选择你的域名 → **SSL/TLS**：

| 检查项 | 推荐设置 |
|--------|----------|
| 加密模式 | **Full (strict)** |
| Always Use HTTPS | **开启** |
| Automatic HTTPS Rewrites | **开启** |

**加密模式说明：**

| 模式 | Cloudflare ↔ 浏览器 | Cloudflare ↔ 源站 | 推荐 |
|------|---------------------|-------------------|------|
| Off | 不加密 | 不加密 | ❌ |
| Flexible | 加密 | 不加密 | ❌ |
| Full | 加密 | 加密（不验证证书） | 可用 |
| Full (strict) | 加密 | 加密（验证证书） | ✅ |

> ⚠️ **请勿使用 Flexible 模式**。该模式下 Cloudflare 到源站的连接不加密，你的 API 数据在 Cloudflare 和函数计算之间是明文传输的。

### 验证 HTTPS 是否正常

```shell
# 测试 API 端点
curl -I https://api.你的域名.com/web/menu

# 查看证书信息
curl -vI https://api.你的域名.com/web/menu 2>&1 | grep -E "SSL|subject|issuer"
```

正常情况下应返回 HTTP 200，且证书信息显示由 Cloudflare 签发。

## 🚀 高并发方案（ESA 自动 HTTPS）

阿里云 ESA 与 Cloudflare 类似，提供**全自动 HTTPS 证书管理**。

### 配置步骤

1. 登录 ESA 控制台 → 选择你的站点
2. 进入 **站点管理 → HTTPS 配置**
3. 开启以下选项：
   - **HTTPS 安全加速**：开启
   - **强制 HTTPS 跳转**：开启
   - **HTTP/2**：开启（提升性能）
4. ESA 自动为你的域名签发和管理 SSL 证书

### 证书更新

ESA 管理的证书会在到期前自动续期。你可以在 ESA 控制台 → **证书管理** 中查看证书状态和到期时间。

## 🏫 内网方案（自签名证书或内网 CA）

内网方案的服务器不暴露到公网，无法使用 Cloudflare 或 ESA 的自动证书服务。建议使用以下两种方式之一配置 HTTPS：

### 方案一：自签名证书（简单）

适合小规模部署，浏览器会显示证书警告，但不影响使用。

**使用 OpenSSL 生成自签名证书：**

```shell
# 创建证书存放目录
sudo mkdir -p /etc/nginx/ssl

# 生成私钥
sudo openssl genrsa -out /etc/nginx/ssl/astra.key 2048

# 生成自签名证书（有效期 3650 天，约 10 年）
sudo openssl req -new -x509 -key /etc/nginx/ssl/astra.key \
  -out /etc/nginx/ssl/astra.crt \
  -days 3650 \
  -subj "/CN=内网服务器IP或域名"

# 设置权限
sudo chmod 600 /etc/nginx/ssl/astra.key
```

**配置 Nginx：**

```nginx
server {
    listen 443 ssl http2;
    server_name _;

    ssl_certificate     /etc/nginx/ssl/astra.crt;
    ssl_certificate_key /etc/nginx/ssl/astra.key;

    # 推荐的安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        root /opt/astra-web/dist;
        try_files $uri $uri/ /index.html;
    }
}

# HTTP 自动跳转 HTTPS
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}
```

### 方案二：内网 CA（推荐）

如果学校有统一的内网 CA（证书颁发机构），建议使用内网 CA 签发证书。这样可以避免浏览器的证书警告，客户端也能正常验证。

**申请步骤：**

1. 联系学校网络管理员，为服务器申请内网 CA 签发的证书
2. 获取证书文件（`.crt`）和私钥文件（`.key`）
3. 按上述 Nginx 配置方式部署

### 客户端使用 HTTPS

客户端的协议由托盘菜单「安全连接」开关控制（勾选 = 使用 HTTPS/WSS，取消 = 使用 HTTP/WS）。「云端服务」地址栏只需填写域名（如 `192.168.1.100`），**不要带协议前缀**。

> ⚠️ 客户端固定开启证书校验（`rejectUnauthorized: true`），**不信任自签名证书，也没有关闭证书校验的入口**。使用自签名证书会导致客户端连接失败。

如果内网需要 HTTPS，请使用受信任 CA 签发的证书，例如：

1. 使用内网 CA 为服务器签发证书；
2. 将该内网 CA 的根证书安装到每台教室电脑的「受信任的根证书颁发机构」存储中；
3. 这样浏览器和客户端都会信任该证书，无需额外配置。

### 仅管理端使用 HTTPS

如果希望简化配置，也可以仅在 Nginx 层启用 HTTPS（加密管理端访问），而后端 API 继续使用 HTTP。但**不建议**这样做，因为客户端从后端拉取课表时数据是明文传输的，可能被窃听或篡改。

## 常见问题

### Q: 浏览器提示「您的连接不是私密连接」怎么办？

如果是内网自签名证书，这是正常现象。点击「高级」→「继续访问」即可。

### Q: 客户端连接 HTTPS 后端报错？

检查托盘「安全连接」开关是否开启（HTTPS 需要勾选），以及「云端服务」地址是否只填了域名。如果后端使用自签名证书，客户端会因不信任证书而连接失败，需要改用受信任 CA 签发的证书。

### Q: Cloudflare Full (strict) 模式下访问失败？

说明源站（函数计算）的证书无效。检查函数计算的自定义域名是否正确配置。阿里云函数计算配置自定义域名后会提供有效的 HTTPS 端点。
