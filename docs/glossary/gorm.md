> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# GORM（Go 的 ORM 库）

## 通俗解释

GORM 是 Go 语言的"对象关系映射"库，让你用写代码的方式操作数据库，不用手写 SQL。比如定义一个结构体，GORM 就自动帮你建表、增删改查。

## 专业解释

GORM 是 Go 生态中最流行的 ORM（Object-Relational Mapping）库，提供模型定义、自动建表（AutoMigrate）、链式查询、事务、预加载等功能，同时支持 MySQL、SQLite、PostgreSQL 等数据库。

## 在 AstraSchedule 中

- 数据模型定义在 `model/dbTable/`，由 GORM 的 `AutoMigrate` 自动建表（`startup/db.go`）
- 写入操作使用 GORM 的 `clause.OnConflict` 实现 upsert，兼容 SQLite 与 MySQL
- 后端启动时执行迁移；MySQL 模式下若设置 `GIN_MODE=release` 会跳过自动建表，需注意首次部署流程
