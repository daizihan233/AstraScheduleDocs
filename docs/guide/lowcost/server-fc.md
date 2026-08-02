> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# 部署后端到阿里云函数计算

## 概述

将 Go 后端部署到阿里云函数计算（FC），按量计费，免费额度内几乎不花钱。

> 💡 本方案以阿里云函数计算为例，你也可以部署在腾讯云函数、AWS Lambda 等任何你熟悉的 Serverless 平台。

## 你需要准备

- 阿里云账号（已实名认证）
- 从 [GitHub Release](https://github.com/AstraSchedule/usr-backend/releases/latest) 下载 usr-backend 对应 Linux 二进制（资源名：`AstraScheduleServerGo-linux-amd64`）

## 步骤

### 1. 开通函数计算服务

1. 登录 [阿里云函数计算控制台](https://fcnext.console.aliyun.com/)
2. 首次使用点击「立即开通」
3. 选择「按量付费」（免费额度内不收费）

<!-- TODO: 截图 - 开通页面 -->

### 2. 创建函数

1. 点击「创建函数」
2. 选择「使用自定义运行时」
3. 填写基本信息：

| 配置项 | 值 |
|--------|-----|
| 函数名称 | `astra-schedule` |
| 运行时 | `custom.debian10` |
| 请求处理程序类型 | 处理 HTTP 请求 |

<!-- TODO: 截图 - 函数创建 -->

### 3. 上传代码

1. 在「代码」区域，选择「上传 ZIP 包」
2. 将下载的 `AstraScheduleServerGo-linux-amd64` 重命名为 `astrago`
3. 创建 `config.toml` 配置文件（内容见下方；可从 `config.template.toml` 复制后修改，注意模板默认 `db.type = "mysql"`、`run.serverless = true`，必须按下文示例改成 SQLite）
4. 将两个文件打包为 ZIP 并上传

> ⚠️ 打包前请确保 `astrago` 具有执行权限（Linux 下执行 `chmod +x astrago`）。部分压缩工具打包 ZIP 时不保留执行权限，会导致启动命令 `./astrago` 失败。

### 4. 配置文件

```toml
[apikey]
apihost = "YOURS.re.qweatherapi.com"
weather = "YOUR_API_KEY"

[secret]
token = "设置一个复杂的密码"

[server]
host = "0.0.0.0"
port = 9000
domain = ["https://admin.your-domain.com"]

[db]
type = "sqlite"
path = "/tmp/data/astra.db"  # 函数计算的临时目录，可写但实例回收后会被清空

[log]
debug = false

[run]
serverless = true
```

> 💡 使用 SQLite 无需额外配置数据库。`path` 指向函数计算实例的 `/tmp` 目录（唯一可写目录）。注意：SQLite 数据在实例回收后可能丢失，建议定期备份（见下文「关于数据库」）。

> 📝 **天气 API 配置**：`[apikey]` 部分用于配置和风天气 API。如果需要启用天气功能，请参考 [获取和风天气 API 凭证](./weather-api.md) 获取 APIKey 或 JWT Token。

### 5. 配置启动命令

在函数配置中设置：

| 配置项 | 值 |
|--------|-----|
| 启动命令 | `./astrago` |
| 监听端口 | 9000 |
| 环境变量 | `GIN_MODE=release` |

<!-- TODO: 截图 - 启动命令配置 -->

### 6. 配置 HTTP 触发器

1. 在函数详情页，点击「触发器管理」
2. 创建「HTTP 触发器」
3. 认证方式选择「无需认证」
4. 请求方法选择「ANY」

创建后记录生成的**公网访问地址**（类似 `https://xxx.cn-hangzhou.fc.aliyuncs.com`）。

<!-- TODO: 截图 - 触发器配置 -->

### 7. 绑定自定义域名

1. 在函数计算控制台选择「域名管理」
2. 添加自定义域名，如 `api.your-domain.com`
3. 记录给出的 CNAME 值
4. 到 Cloudflare（或你的 DNS 服务商）添加 DNS 记录：

| 类型 | 名称 | 内容 | 代理状态 |
|------|------|------|----------|
| CNAME | `api` | 函数计算的 CNAME 地址 | 🟢 已代理 |

### 8. 验证

部署完成后，测试后端是否正常响应：

```shell
curl https://api.your-domain.com/
```

应返回 `{"message": "Hello World"}`。

## 关于数据库

极低成本方案使用 SQLite，数据库文件位于 `/tmp/data/astra.db`。**注意**：函数计算的 `/tmp` 目录在实例回收后可能被清空。建议：

- 每月通过管理端导出一次完整备份
- 如需持久化存储，升级到「外网高并发部署」方案（使用 MySQL Serverless）

## 成本参考

- 函数计算：免费额度内几乎不花钱
- 数据库（SQLite）：免费
