> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# 部署管理端（内网）

## 概述

管理端是一个 Vue3 + Vite 构建的单页应用（SPA），部署后学校可以通过浏览器在局域网内访问管理后台，对课表、科目、教师等信息进行配置和管理。

管理端为纯前端项目，不包含后端逻辑，通过 API 与后端通信。部署时将构建产物放在 Nginx 下即可。

## 你需要准备

- 一台 Linux 服务器（可以与后端共用同一台）
- 已安装 Bun（https://bun.sh），或在本机装好 Node.js 构建后上传 `dist/`
- 后端 API 地址（内网 IP + 端口）

如果管理端和后端在同一台服务器上，后端 API 地址为 `http://<服务器IP>:9000`。

## 步骤

### 1. 克隆管理端仓库

```bash
# 安装 Git（如果尚未安装）
sudo apt install git -y    # Debian/Ubuntu
sudo yum install git -y    # CentOS/RHEL

# 克隆仓库
cd /opt
sudo git clone https://github.com/AstraSchedule/usr-dashboard.git
cd usr-dashboard
```

### 2. 确认后端地址（无需修改源码）

管理端**不需要**修改任何源码来指定后端地址。登录页上有「后端地址」输入框，登录时填入即可，地址会保存在浏览器本地，下次自动带出。

内网部署时在登录页后端地址栏填写：

```
http://192.168.1.100:9000
```

> 注意：地址要带上协议 `http://` 和端口号 `:9000`。内网部署通常使用 HTTP 协议。

### 3. 安装依赖并构建

```bash
# 安装项目依赖（需要先安装 Bun：https://bun.sh）
sudo bun install

# 构建生产版本
sudo bun run build
```

构建完成后，产物在 `dist/` 目录中。这是可以直接被 Nginx 托管的静态文件。

如果服务器上安装 npm 有困难，你也可以在本地开发电脑上完成构建，然后将 `dist/` 目录整体上传到服务器。

### 4. 安装并配置 Nginx

#### 安装 Nginx

```bash
# Debian/Ubuntu
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y
```

#### 创建 Nginx 配置文件

```bash
sudo nano /etc/nginx/sites-available/astraschedule-admin
```

写入以下配置：

```nginx
server {
    listen 80;
    server_name _;   # 匹配所有访问，也可改为服务器的内网 IP

    # 管理端静态文件
    root /opt/usr-dashboard/dist;
    index index.html;

    # 日志文件
    access_log /var/log/nginx/astraschedule-admin-access.log;
    error_log  /var/log/nginx/astraschedule-admin-error.log;

    # 管理端页面
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 反向代理（可选：如需要 Web 端直接访问后端接口）
    # 如果管理端在登录页直连后端，此段不需要
    # location /api/ {
    #     proxy_pass http://127.0.0.1:9000/;
    #     proxy_set_header Host $host;
    #     proxy_set_header X-Real-IP $remote_addr;
    #     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    #     proxy_set_header X-Forwarded-Proto $scheme;
    # }

    # Gzip 压缩
    gzip on;
    gzip_min_length 1k;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    gzip_vary on;
    gzip_disable "MSIE [1-6]\.";
}
```

Nginx 配置说明：

| 配置项 | 说明 |
|--------|------|
| `listen 80` | 监听 HTTP 端口 80 |
| `server_name _` | 匹配所有来源的访问 |
| `root` | 指向 Vue 构建产物目录 |
| `try_files $uri $uri/ /index.html` | SPA 路由 fallback，解决 Vue Router History 模式刷新 404 问题 |
| API 反向代理 | 注释掉的部分，用于通过 Nginx 代理后端接口（可选替代直连方式） |
| Gzip 配置 | 开启压缩，减少传输流量 |

#### 启用站点配置

```bash
# Debian/Ubuntu：创建软链接启用站点
sudo ln -s /etc/nginx/sites-available/astraschedule-admin /etc/nginx/sites-enabled/

# 移除默认站点配置（如果有）
sudo rm -f /etc/nginx/sites-enabled/default

# 检查 Nginx 配置语法
sudo nginx -t

# 重新加载 Nginx
sudo systemctl reload nginx

# 设置 Nginx 开机自启
sudo systemctl enable nginx
```

#### CentOS/RHEL 系统注意事项

CentOS/RHEL 的 Nginx 默认不使用 `sites-available/sites-enabled` 模式，建议直接将配置写在主配置文件中：

```bash
sudo nano /etc/nginx/conf.d/astraschedule-admin.conf
```

内容与上述 Nginx 配置一致，写入后执行：

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx
```

### 5. 验证

在内网任意一台电脑的浏览器中访问：

```
http://192.168.1.100
```

（将 IP 替换为你的服务器实际 IP）

应该能看到 AstraSchedule 管理端的登录页面。

首次使用时：
1. 登录需要管理员账号。自建部署时账号由部署方创建：通常配合系统端（sys-dashboard）的「Astra 用户管理」创建管理员，或在数据库中手动初始化 `users` 表（后端不会自动创建默认账号）
2. 登录后进入管理后台，可以开始配置学校、年级、班级、课表等信息

### 6. 防火墙配置（如有需要）

如果服务器开启了防火墙，需要放行 80 端口：

```bash
# ufw 防火墙（Ubuntu/Debian）
sudo ufw allow 80/tcp

# firewalld 防火墙（CentOS/RHEL）
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

## 可选方案：通过 Nginx 反向代理后端 API

上面的配置中，管理端在登录页直接填写后端地址直连。这种方式简单直接，但在某些场景下可能不方便（例如客户端和管理端不在同一网段）。

此时可以让 Nginx 作为统一入口，反向代理后端 API：

1. 在 Nginx 配置中加入下面的 `/web/` 反代段（管理端所有 API 都以 `/web/` 开头）
2. 登录页后端地址栏填写 Nginx 的地址（如 `http://192.168.1.100`），不要带 `/web`

```nginx
# 后端 API 反向代理
location /web/ {
    proxy_pass http://127.0.0.1:9000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

3. 重新加载 Nginx：`sudo systemctl reload nginx`

通过 Nginx 反代的优势：
- 前端和后端通过同一地址访问，避免 CORS 跨域问题
- 后期如需添加 HTTPS，只需在 Nginx 配置一次证书
- 可在 Nginx 层统一添加访问控制

> 注意：Nginx 反代后，后端 `config.toml` 的 `server.domain` 需要包含管理端的访问来源地址（如 `http://192.168.1.100`）。

## 常见问题

### 刷新页面出现 404

这是 SPA 路由的典型问题。确认 Nginx 配置中的 `try_files` 配置正确：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 管理端无法连接后端

1. 确认后端服务正在运行：`sudo systemctl status astraschedule`
2. 在服务器上用 `curl http://localhost:9000/` 测试后端响应
3. 检查登录页「后端地址」栏填写的是否正确（无需改源码）
4. 确认服务器防火墙已放行后端端口 9000
5. 检查 `config.toml` 中 `server.domain` 是否包含管理端的访问来源地址

### 构建报错 "out of memory"

构建时内存不足，可以使用以下方式：

```bash
# 增加 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=2048" bun run build
```

或者在本地开发电脑上好构建后，只上传 `dist/` 目录到服务器。
