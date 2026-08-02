> [!WARNING]
>
> 本页由 AI 工具参考代码编写，部分内容未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# User Backend 用户端后端

Go 后端 API，负责课表数据存储、规则计算、WebSocket 推送等核心功能。

## 技术栈

- Go 1.26+ + Gin + GORM
- 支持 MySQL 和 SQLite（通过配置切换）

## 项目结构

```
usr-backend/
├── main.go                    # 入口，路由定义
├── config/                    # 配置加载（Viper）
├── model/dbTable/             # GORM 表模型
├── db/                        # 数据访问层
├── service/                   # 业务逻辑（规则引擎）
├── middleware/                 # 中间件（认证、CORS）
├── router/
│   ├── client/                # 客户端 API
│   └── web/                   # 管理端 API
└── startup/                   # 启动初始化
```

## 代码组织

| 目录 | 职责 |
|------|------|
| `router/web` | 管理端接口（`/web/*`） |
| `router/client` | 客户端接口（`/:school/:grade/:class`） |
| `db` | CRUD 操作 |
| `service` | 规则计算与业务编排 |
| `middleware` | 认证、CORS、命名空间解析 |
| `model/dbTable` | GORM 数据库表模型 |
| `config` | 配置加载（Viper 多格式） |

## 接口约定

- 管理端前缀：`/web/*`
- 客户端：无前缀
- 认证：JWT（`Authorization: Bearer <token>`），写操作需密码二次确认
- 响应格式：`status`/`message`/`data` 或 `error`/`detail`
- 参数校验错误 → `400`，资源缺失 → `404`，内部异常 → `500`

## 认证与鉴权

- **JWT**：HS256，签名密钥为 `secret.token`，过期 24 小时；登录接口 `/web/auth/login`
- **写操作密码确认**：`X-Verify-Password` 头（或请求体 `password`），校验的是**用户密码**，不是 `secret.token`
- **内部服务认证**：`X-Internal-Secret` 头（sys-backend 等调用）

## 数据写入策略

- 配置类写入使用 upsert（`ON CONFLICT ... UPDATE ALL`）
- 多表操作必须使用事务
- SaaS 版本所有表含 `namespace` 字段

## 课表规则引擎

4 类规则按优先级叠加：COMPENSATION → TIMETABLE → SCHEDULE → ALL。支持多级作用域：ALL → school → school/grade → school/grade/class。

## 本地开发环境搭建

1. 安装 [Go 1.26+](https://go.dev/dl/) 与 Git
2. 克隆仓库并进入目录：

```bash
git clone https://github.com/AstraSchedule/usr-backend.git
cd usr-backend
```

3. 生成配置文件：

```bash
cp config.template.toml config.toml
```

4. 按需修改 `config.toml`：
   - 开发建议使用 SQLite：`db.type = "sqlite"`、`db.path = "./data/dev.db"`（无需安装数据库）
   - `apikey.apihost` 为必填项，即使不开发天气功能也要保留（可填占位域名）
   - 开发 WebSocket 功能时将 `run.serverless` 设为 `false`
5. 启动：

```bash
go run .
```

启动成功后监听 `:9000`（可用 `curl http://localhost:9000/web/health` 验证）。

> 注意：后端**不会**自动创建管理员账号。本地开发需要先通过[用户管理接口](./api-web)（或配合系统端）创建一个 `admin` 用户才能登录管理端。

## 常用命令

```bash
go build ./...      # 构建
go fmt ./...        # 格式化
go mod tidy         # 依赖整理
go test ./...       # 运行测试
```

## OpenAPI 文档

接口规范见仓库根目录 `AstraServerGo.openapi.json`。**修改或新增 API 时必须同步更新该文件**。
