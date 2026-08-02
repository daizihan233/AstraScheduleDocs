> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# 获取和风天气 API 凭证

本页面说明如何注册和风天气账号并获取 API 凭证，用于为客户端提供天气信息功能。

## 概述

星程课表使用和风天气 API 获取天气数据。你需要注册和风天气账号并获取以下凭证之一：

- **JWT Token**（推荐，更安全）
- **APIKey**（简单，适合快速测试）

## 官方网站

| 用途 | 地址 |
|------|------|
| 开发服务文档 | [https://dev.qweather.com](https://dev.qweather.com) |
| 控制台（管理项目/凭据） | [https://console.qweather.com](https://console.qweather.com) |
| 帐号注册/登录 | [https://id.qweather.com](https://id.qweather.com) |

## 你需要准备

- 一个有效的邮箱地址
- 手机号（用于接收验证码）

## 步骤

### 1. 注册和风天气账号

1. 访问注册页面：[https://id.qweather.com/#/register](https://id.qweather.com/#/register?redirect=https%3A%2F%2Fconsole.qweather.com)
2. 填写邮箱、密码等基本信息完成注册
3. 注册成功后，登录控制台 [console.qweather.com](https://console.qweather.com) 即可管理项目和凭据

### 2. 创建项目

1. 登录后进入控制台
2. 在左侧菜单中选择 **项目管理**
3. 点击 **创建项目** 按钮
4. 填写项目名称（例如：`星程课表`）
5. 选择项目类型为 **天气查询**
6. 点击 **确定** 完成创建

### 3. 获取 APIHost

每个开发者的 API Host 是独立的，在 [控制台 - 设置](https://console.qweather.com/setting) 中查看，格式如：
```
abc1234xyz.def.qweatherapi.com
```

将 APIHost 填入后端配置文件 `config.toml` 的 `[apikey]` 部分：

```toml
[apikey]
apihost = "abc1234xyz.def.qweatherapi.com"  # 替换为你的 APIHost
```

### 4. 获取 APIKey（简单方式，不建议）

1. 在项目详情页面，点击「添加凭据」
2. 身份认证方式选择 **API KEY**
3. 输入凭据名称（如"测试应用"）
4. 点击「保存」
5. 生成的 APIKey 会显示在凭据列表中，格式类似：`ABCD1234EFGH`
6. 将 APIKey 填入后端配置文件 `config.toml` 的 `[apikey]` 部分：

```toml
[apikey]
apihost = "abc1234xyz.def.qweatherapi.com"
weather = "ABCD1234EFGH"  # 替换为你的 APIKey
```

> 💡 APIKey 方式简单，但安全性较低，2027 年起将受限，适合快速测试。

### 5. 获取 JWT Token（建议方式）

JWT Token 方式更安全，适合生产环境使用。

#### 5.1 生成 Ed25519 密钥对

在本地终端执行以下命令（需要 OpenSSL v3+）：

```bash
# 生成私钥
openssl genpkey -algorithm ED25519 -out ed25519-private.pem

# 导出公钥
openssl pkey -pubout -in ed25519-private.pem > ed25519-public.pem
```

生成两个文件：
- `ed25519-private.pem`：私钥，**妥善保管，不要泄露**
- `ed25519-public.pem`：公钥，需要上传到和风天气控制台

#### 5.2 上传公钥到控制台

1. 登录 [控制台 - 项目管理](https://console.qweather.com/project)
2. 点击目标项目 → 点击「添加凭据」
3. 身份认证方式选择 **JSON Web Token**
4. 输入凭据名称（例如：`星程课表密钥`）
5. 用文本编辑器打开 `ed25519-public.pem`，复制全部内容（包括 `-----BEGIN PUBLIC KEY-----` 和 `-----END PUBLIC KEY-----`）
6. 粘贴到公钥文本框，点击「保存」

#### 5.3 获取项目 ID 和密钥 ID

1. 在 API 密钥列表中，找到刚创建的密钥
2. 复制 **项目 ID**（Project ID）
3. 复制 **密钥 ID**（Key ID，也称为 `kid`）

#### 5.4 配置 JWT Token

将以下信息填入后端配置文件 `config.toml` 的 `[apikey.jwt]` 部分：

```toml
[apikey.jwt]
kid = "YOUR_KEY_ID_HERE"               # 替换为你的密钥 ID
project_id = "YOUR_PROJECT_ID_HERE"    # 替换为你的项目 ID
private_key_pem = "YOUR_PRIVATE_KEY"   # 替换为你的私钥内容
expires = 900                          # JWT 有效期（秒），默认 900
```

**私钥内容格式：**

- **完整 PEM 格式**（推荐）：
```
-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEI...
-----END PRIVATE KEY-----
```

- **单行 Base64 格式**：
```
MC4CAQAwBQYDK2VwBCIEI...
```

> ⚠️ 如果使用单行格式，请确保私钥内容完整，不要有换行。

### 6. 验证配置

配置完成后，重启后端服务。可以通过以下方式验证：

1. 启动客户端，设置当前地区
2. 检查是否能正常显示天气信息
3. 查看后端日志，确认没有天气相关的错误

## 配置示例

### 使用 APIKey 的完整配置

```toml
[apikey]
apihost = "xxxxxxxx.re.qweatherapi.com"
weather = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[secret]
token = "your_admin_token"  # JWT 签名密钥，不是登录密码，务必改成随机字符串

[server]
host = "0.0.0.0"
port = 9000
domain = ["https://manager.example.com"]

[db]
type = "sqlite"
path = "./data/astra_schedule.db"

[log]
debug = false

[run]
serverless = true
```

### 使用 JWT Token 的完整配置

```toml
[apikey]
apihost = "xxxxxxxx.re.qweatherapi.com"
weather = ""  # JWT 模式下可以留空

[apikey.jwt]
kid = "your_key_id"
project_id = "your_project_id"
private_key_pem = "-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwBCIEI...\n-----END PRIVATE KEY-----"
expires = 900

[secret]
token = "your_admin_token"  # JWT 签名密钥，不是登录密码，务必改成随机字符串

[server]
host = "0.0.0.0"
port = 9000
domain = ["https://manager.example.com"]

[db]
type = "sqlite"
path = "./data/astra_schedule.db"

[log]
debug = false

[run]
serverless = true
```

## 常见问题

### 天气信息显示 403 错误

**原因：** APIKey 或 JWT Token 未正确配置。

**解决方法：**
1. 检查 `config.toml` 中的 `[apikey]` 部分是否正确填写
2. 确认 APIKey 或 JWT Token 是否有效
3. 检查 APIHost 是否正确（不要包含 `https://` 前缀）

### 天气信息显示 404 错误

**原因：** 城市名称不正确或无法识别。

**解决方法：**
1. 确认输入的城市名称格式正确（支持中英文）
2. 尝试使用更具体的城市名称（如 `南京/鼓楼` 而不是 `鼓楼`）
3. 查看后端日志，确认城市查询是否成功

### JWT Token 生成失败

**原因：** 私钥文件格式不正确。

**解决方法：**
1. 确认私钥文件是 Ed25519 类型
2. 检查私钥内容是否完整（包含 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`）
3. 如果使用单行格式，确保没有换行符
4. 使用官方在线工具 [https://jwt.qweather.com](https://jwt.qweather.com) 调试 JWT

### 天气预警信息不显示

**原因：** 当前地区没有天气预警，或 API 权限不足。

**解决方法：**
1. 确认项目类型包含天气预警功能
2. 检查 API 配额是否充足
3. 查看后端日志，确认预警查询是否成功

## API 配额说明

和风天气 API 有配额限制，请注意：

- **免费版**：每天 1000 次调用
- **付费版**：根据套餐不同，配额更高

建议：
- 使用缓存减少 API 调用次数
- 监控 API 使用量，避免超出配额
- 考虑升级到付费版以获得更高配额

## 参考链接

| 内容 | 链接 |
|------|------|
| 身份认证详解 | [dev.qweather.com/docs/configuration/authentication](https://dev.qweather.com/docs/configuration/authentication/) |
| 项目和凭据管理 | [dev.qweather.com/docs/configuration/project-and-key](https://dev.qweather.com/docs/configuration/project-and-key/) |
| API 配置 | [dev.qweather.com/docs/configuration/api-config](https://dev.qweather.com/docs/configuration/api-config/) |
| API Host 说明 | [dev.qweather.com/docs/configuration/api-host](https://dev.qweather.com/docs/configuration/api-host/) |
| 开始使用 | [dev.qweather.com/docs/start](https://dev.qweather.com/docs/start/) |
| JWT 调试工具 | [jwt.qweather.com](https://jwt.qweather.com) |
