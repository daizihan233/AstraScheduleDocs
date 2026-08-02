> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# 部署后端服务器（内网）

## 概述

学校内网部署方案中，后端需要一台能 24 小时开机的 Linux 服务器。后端使用 Go 编译好的二进制文件直接运行，通过 systemd 管理进程，实现开机自启和异常自动重启。

## 你需要准备

- 一台 Linux 服务器（推荐 Ubuntu 20.04+ 或 Debian 11+）
- 服务器有固定内网 IP（联系学校网管设置）
- 从 GitHub Release 下载后端二进制文件

## 步骤

### 1. 下载后端二进制文件

1. 打开 [usr-backend Releases 页面](https://github.com/AstraSchedule/usr-backend/releases/latest)
2. 找到最新的发布版本，下载对应架构的二进制文件（Release 资源名仍为历史命名）：
   - AMD64（绝大多数服务器）：`AstraScheduleServerGo-linux-amd64`
   - ARM64（树莓派等）：`AstraScheduleServerGo-linux-arm64`
3. 将文件上传到服务器，或直接在服务器上通过 `wget` 下载：

```bash
wget https://github.com/AstraSchedule/usr-backend/releases/latest/download/AstraScheduleServerGo-linux-amd64 -O astrago
```

### 2. 放置文件并设置权限

建议将后端程序和相关文件统一放在一个目录中，便于管理：

```bash
# 创建目录
sudo mkdir -p /opt/astraschedule

# 移动二进制文件
sudo mv astrago /opt/astraschedule/

# 添加执行权限
sudo chmod +x /opt/astraschedule/astrago
```

### 3. 下载并修改配置文件

在服务器上下载示例配置文件 `config.toml`：

```bash
cd /opt/astraschedule
sudo wget https://raw.githubusercontent.com/AstraSchedule/usr-backend/main/config.template.toml -O config.toml
```

编辑配置文件 `config.toml`，根据实际环境修改以下内容：

```bash
sudo nano /opt/astraschedule/config.toml
```

需要修改的配置项：

```toml
[apikey]
apihost = "YOURS.re.qweatherapi.com"
weather = "YOUR_API_KEY"

[secret]
token = "设置一个复杂的随机密码"

[server]
host = "0.0.0.0"
port = 9000
domain = ["http://192.168.1.100"]  # 管理端页面的访问地址，不是 API 地址

[db]
type = "sqlite"  # 必须显式指定，留空会按 mysql 校验并报错
path = "/opt/astraschedule/data/astra.db"

[log]
debug = false

[run]
serverless = false  # 内网部署不是 Serverless 模式，保持 WebSocket 开启
```

关键配置说明：

| 配置项 | 说明 |
|--------|------|
| `apikey.apihost` | 天气 API 的请求域名（**必填**，即使不使用天气功能也必须保留该段并填写占位域名，否则无法启动） |
| `apikey.weather` | 天气 API 密钥 |
| `secret.token` | JWT 签名密钥，务必改成复杂字符串（不是登录密码） |
| `server.host` | 监听地址，`0.0.0.0` 表示监听所有网络接口 |
| `server.port` | 监听端口，默认 `9000` |
| `server.domain` | 允许的 CORS 来源，填入管理端的访问地址。内网部署填客户端的局域网访问地址（如 `http://192.168.1.100`） |
| `db` | 数据库配置。使用 SQLite 需显式设置 `type = "sqlite"` 和 `path`，不能留空 |
| `run.serverless` | 设置为 `false`，内网部署不是 Serverless 模式 |

关于 `server.domain`：这是 CORS 跨域白名单，填入**浏览器访问的页面地址**（管理端/客户端的来源地址），不是 API 地址。内网部署需要填入管理端 Nginx 的实际内网访问地址。如果有多个地址（如通过 IP 和主机名都能访问），可以配置多个。

#### 使用 SQLite 说明

SQLite 是文件型数据库，内网部署方案推荐使用，无需额外安装数据库服务。

> [!WARNING]
>
> `[db]` 不能留空：后端在 `db.type` 为空时按 **mysql** 处理并强制校验 `host/user/name`，留空会导致启动报错「db.host 不能为空」。必须显式写成 `type = "sqlite"`。

```toml
[db]
type = "sqlite"
path = "/opt/astraschedule/data/astra.db"  # 数据库文件保存位置（相对路径会基于工作目录解析）
```

SQLite 文件的备份很简单，直接复制 `path` 指向的数据库文件即可（本页示例为 `/opt/astraschedule/data/astra.db`）。

### 4. 创建 systemd 服务

systemd 服务可以让后端在系统启动时自动运行，并在进程异常退出时自动重启。

创建服务文件：

```bash
sudo nano /etc/systemd/system/astraschedule.service
```

写入以下内容：

```ini
[Unit]
Description=AstraSchedule Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/astraschedule
ExecStart=/opt/astraschedule/astrago
Restart=always
RestartSec=5
Environment=GIN_MODE=release
# 如果使用自定义数据库路径，取消下面一行的注释
# ExecStartPre=/bin/mkdir -p /opt/astraschedule/data

[Install]
WantedBy=multi-user.target
```

服务文件关键字段说明：

| 字段 | 说明 |
|------|------|
| `After=network.target` | 确保网络可用后再启动服务 |
| `Type=simple` | 简单进程类型，程序启动即视为服务就绪 |
| `WorkingDirectory` | 工作目录，配置文件 `config.toml` 和数据库文件都在此目录 |
| `ExecStart` | 启动命令 |
| `Restart=always` | 无论何种原因退出，始终自动重启 |
| `RestartSec=5` | 退出后等待 5 秒再重启 |
| `Environment=GIN_MODE=release` | 设置 Go Gin 框架为生产模式，禁用调试日志 |

### 5. 启动服务

```bash
# 重新加载 systemd 配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start astraschedule

# 设置开机自启
sudo systemctl enable astraschedule

# 查看服务状态
sudo systemctl status astraschedule
```

如果服务状态显示 `active (running)`，说明后端已成功启动。

### 6. 验证

在服务器本地测试后端是否正常响应：

```bash
curl http://localhost:9000/
```

应返回 `{"message": "Hello World"}`。

在同一局域网内的其他电脑上，通过浏览器访问 `http://192.168.1.100:9000/`（替换为你的服务器实际 IP），也应返回相同结果。

## 日常维护

### 查看日志

```bash
sudo journalctl -u astraschedule -f
```

`-f` 参数表示持续跟踪最新日志，类似 `tail -f`。按 `Ctrl+C` 退出。

### 重启服务

```bash
sudo systemctl restart astraschedule
```

### 停止服务

```bash
sudo systemctl stop astraschedule
```

### 更新后端

当 GitHub 发布新版本时，需要手动更新：

```bash
# 停止服务
sudo systemctl stop astraschedule

# 备份旧版本
sudo cp /opt/astraschedule/astrago /opt/astraschedule/astrago.bak

# 下载新版本
sudo wget https://github.com/AstraSchedule/usr-backend/releases/latest/download/AstraScheduleServerGo-linux-amd64 -O /opt/astraschedule/astrago

# 恢复执行权限
sudo chmod +x /opt/astraschedule/astrago

# 启动服务
sudo systemctl start astraschedule
```

### 备份数据库

SQLite 数据库就是一个普通文件，备份即复制：

```bash
# 复制数据库文件到备份目录
cp /opt/astraschedule/data/astra.db /opt/astraschedule/backup/astra-$(date +%Y%m%d).db
```

建议设置 crontab 定时任务每天自动备份：

```bash
sudo crontab -e
```

添加一行：

```
0 2 * * * cp /opt/astraschedule/data/astra.db /opt/astraschedule/backup/astra-$(date +\%Y\%m\%d).db
```

> 这行配置会在每天凌晨 2 点自动备份数据库。备份目录需提前创建：`sudo mkdir -p /opt/astraschedule/backup`

## 常见问题

### 启动失败，日志显示 "permission denied"

确认二进制文件有执行权限：

```bash
sudo chmod +x /opt/astraschedule/astrago
```

### 服务反复重启

先查看日志定位原因：

```bash
sudo journalctl -u astraschedule -n 50 --no-pager
```

常见原因：
- 端口被占用：修改 `config.toml` 中的 `server.port`
- 配置文件格式错误：检查 TOML 语法
- 缺少依赖文件：确认 `config.toml` 与二进制文件在同一目录

### 管理端访问提示 CORS 错误

检查 `config.toml` 中 `server.domain` 是否包含了管理端的访问地址。

如果管理端通过 `http://192.168.1.100` 访问，domain 中必须包含 `"http://192.168.1.100"`；如果是通过 Nginx 反代访问，需要包含反代后的地址。
