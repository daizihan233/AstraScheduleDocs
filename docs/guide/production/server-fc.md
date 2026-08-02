> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# 部署后端到阿里云函数计算（生产级）

## 概述

将 Go 后端部署到阿里云函数计算（FC），搭配 MySQL Serverless 实现高可用、弹性伸缩的生产级架构。

> 💡 本方案以阿里云函数计算为例，你也可以部署在腾讯云函数、AWS Lambda 等任何你熟悉的 Serverless 平台。

## 与极低成本方案的区别

| 对比项 | 极低成本 | 生产级 |
|--------|----------|--------|
| 数据库 | SQLite（单实例） | MySQL Serverless（高可用、自动备份） |
| 持久化 | 实例回收可能丢失数据 | 数据持久化，自动备份 |
| 冷启动 | 可能较慢 | 配置预留实例，消除冷启动 |
| 并发 | 受限于单实例 SQLite | MySQL 支持高并发读写 |

## 你需要准备

- 阿里云账号（已实名认证）
- 已创建 MySQL Serverless 实例（参见 [配置 MySQL Serverless 数据库](./mysql.md)）
- 已开通函数计算服务
- 从 [GitHub Release](https://github.com/AstraSchedule/usr-backend/releases/latest) 下载 usr-backend 对应 Linux 二进制（资源名：`AstraScheduleServerGo-linux-amd64`）

## 步骤

### 1. 开通函数计算服务

1. 登录 [阿里云函数计算控制台](https://fcnext.console.aliyun.com/)
2. 首次使用点击「立即开通」
3. 选择「按量付费」

### 2. 创建函数

1. 点击「创建函数」
2. 选择「使用自定义运行时」
3. 填写基本信息：

| 配置项 | 值 |
|--------|-----|
| 函数名称 | `astra-schedule-prod` |
| 运行时 | `custom.debian10` |
| 请求处理程序类型 | 处理 HTTP 请求 |

### 3. 上传代码

1. 在「代码」区域，选择「上传 ZIP 包」
2. 将下载的 `AstraScheduleServerGo-linux-amd64` 重命名为 `astrago`
3. 创建 `config.toml` 配置文件（内容见下方）
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
type = "mysql"
host = "rm-xxxxxx.mysql.rds.aliyuncs.com"
port = 3306
user = "astra_user"
pass = "YOUR_DB_PASSWORD"
name = "astra_schedule"

[log]
debug = false

[run]
serverless = true
```

> ⚠️ 数据库连接信息请从 MySQL 控制台获取，参见 [配置 MySQL Serverless 数据库](./mysql.md)。密码务必使用强密码。

### 5. 配置启动命令

在函数配置中设置：

| 配置项 | 值 |
|--------|-----|
| 启动命令 | `./astrago` |
| 监听端口 | 9000 |
| 环境变量 | 首次部署**不要设置** `GIN_MODE=release`（见下方警告） |

> [!WARNING]
>
> **首次部署必须先建表**：当数据库为 MySQL 且环境变量 `GIN_MODE=release` 时，后端会**跳过自动建表**（AutoMigrate），数据库里没有任何表，登录/查询会全部报错。首次部署请先**不设置** `GIN_MODE=release` 启动一次完成建表，之后再补上 `GIN_MODE=release` 重新部署。（SQLite 模式不受影响，总是自动建表。）

### 6. 配置 HTTP 触发器

1. 在函数详情页，点击「触发器管理」
2. 创建「HTTP 触发器」
3. 认证方式选择「无需认证」
4. 请求方法选择「ANY」

创建后记录生成的**公网访问地址**（类似 `https://xxx.cn-hangzhou.fc.aliyuncs.com`）。

### 7. 绑定自定义域名

1. 在函数计算控制台选择「域名管理」
2. 添加自定义域名，如 `api.your-domain.com`
3. 记录给出的 CNAME 值
4. 到 ESA（或你的 DNS 服务商）添加 DNS 记录：

| 类型 | 名称 | 内容 | 代理状态 |
|------|------|------|----------|
| CNAME | `api` | 函数计算的 CNAME 地址 | 🟢 已代理 |

### 8. 配置 VPC 网络（重要）

MySQL Serverless 实例默认在 VPC 内网中。为了让函数计算能访问数据库，需要配置 VPC 网络：

1. 进入函数详情页，点击「配置」→「网络」
2. 选择 MySQL 实例所在的 VPC 和交换机
3. 保存配置

> ⚠️ 若函数计算尚未开通对应 VPC 的访问权限，需要先在函数计算控制台授权（「服务配置 → 角色」中为服务绑定具备 VPC 访问权限的角色），否则函数无法连接 MySQL。

> 💡 如果选择 MySQL 的「公网访问」，则无需配置 VPC，但安全性较低，不推荐生产环境使用。

### 9. 配置预留实例（冷启动优化）

Serverless 函数在无请求时会回收实例，下次请求时产生冷启动延迟。为生产环境配置预留实例：

1. 进入函数详情页，点击「弹性管理」
2. 创建「预留实例」配置
3. 建议至少保留 1 个实例（按量付费，成本可控）

> 💡 预留实例可以消除冷启动带来的 1-3 秒延迟，保证 API 响应始终在毫秒级。

### 10. 验证

部署完成后，测试后端是否正常响应：

```shell
curl https://api.your-domain.com/
```

应返回 `{"message": "Hello World"}`。

## 关于数据库

生产级方案使用阿里云 MySQL Serverless，具备以下优势：

- **弹性伸缩**：根据负载自动调整计算资源，闲时几乎不消耗资源
- **自动备份**：每日自动备份，可恢复到任意时间点
- **高可用**：主备架构，故障自动切换
- **数据持久化**：数据不会因函数实例回收而丢失

## 成本参考

| 项目 | 费用 |
|------|------|
| 函数计算（含预留实例） | 数十元/月 |
| MySQL Serverless | 按实际使用量计费，低负载时数十元/月 |
| **合计** | **约 50-100 元/月起** |
