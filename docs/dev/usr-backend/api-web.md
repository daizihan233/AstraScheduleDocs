> [!WARNING]
>
> 本页由 AI 工具参考代码编写，部分内容未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# Web 管理端 API

以下接口前缀默认省略 host。

## 鉴权

系统使用 JWT 认证，登录后获取 Token，后续请求在 `Authorization: Bearer <token>` 头中传递。

| 接口 | 方法 | 说明 |
|------|------|------|
| `/web/auth/login` | POST | 登录，返回 `{token, must_change_pwd, user: {id, username, role, scope}}` |
| `/web/auth/me` | GET | 获取当前用户信息 |
| `/web/auth/change-password` | POST | 修改密码 |

### 写操作密码确认

大多数写操作（PUT/POST/DELETE）需通过 `X-Verify-Password` 头传递密码进行二次确认（`secureWrite` 分组）。**例外**：用户管理接口 `/web/users*`（仅需 `admin` 角色）与认证接口 `/web/auth/*` 不需要密码确认。

### 角色与权限（RBAC）

| 角色 | 权限说明 |
|------|----------|
| `admin` | 全局管理员，可管理所有学校/年级/班级 |
| `school_w` | 校级写入权限 |
| `grade_w` | 年级级写入权限 |
| `class_w` | 班级级写入权限 |
| `readonly` | 只读权限 |

角色通过 `scope` 字段限定作用范围（如 `学校/年级/班级`）。**后端不会自动创建默认管理员**，管理员账号需由部署方创建（自建部署通常配合系统端「Astra 用户管理」，SaaS 模式在注册租户时创建）。

## 配置相关接口

### Subjects

- `GET /web/config/:school/:grade/subjects/options`
- `GET /web/config/:school/:grade/subjects`
- `PUT /web/config/:school/:grade/subjects`

### Timetable

- `GET /web/config/:school/:grade/timetable/options`
- `GET /web/config/:school/:grade/timetable`
- `PUT /web/config/:school/:grade/timetable`

`PUT timetable` 关键约束：

- 必须包含 `常日`
- 自动修正 `timetable` / `divider` key 一致性

### Schedule

- `GET /web/config/:school/:grade/:class_number/schedule`
- `PUT /web/config/:school/:grade/:class_number/schedule`

### Settings

- `GET /web/config/:school/:grade/:class_number/settings`
- `PUT /web/config/:school/:grade/:class_number/settings`

## 用户管理接口

- `GET /web/users` — 获取用户列表（admin 限定）
- `POST /web/users` — 创建用户
- `PUT /web/users/:id` — 更新用户
- `DELETE /web/users/:id` — 删除用户

## 结构管理接口

- `GET /web/structure` — 获取学校/年级/班级树形结构，返回格式：
  ```json
  [{"text": "学校名", "children": [{"text": "年级", "children": [{"text": "班级"}]}]}]
  ```

## 复制配置接口

- `POST /web/config/copy`

请求体：

```json
{
  "from": { "school": "39", "grade": "2023", "class": "1" },
  "to": { "school": "39", "grade": "2023", "class": "2" }
}
```

说明：

- `from` / `to` 中 `class` 与 `class_number` 两种字段都可识别
- 来源与目标完全相同会返回 `400`
- 来源配置缺失返回 `404`
- 复制过程使用事务，失败会整体回滚

返回示例：

```json
{
  "status": 200,
  "from": { "school": "39", "grade": "2023", "class": "1" },
  "to": { "school": "39", "grade": "2023", "class": "2" }
}
```

## 系统备份 / 还原接口

- `GET /web/backup/export` — 导出完整备份（旧接口）
- `POST /web/backup/import` — 导入备份（旧接口）
- `POST /web/backup/full-export` — 导出完整备份（当前管理端使用的接口）
- `POST /web/backup/full-import` — 导入完整备份（当前管理端使用的接口）

说明：

- 四个接口都需要 JWT 认证；写操作按 `secureWrite` 规则要求密码确认。
- `export` 返回完整数据库备份 JSON 文件流，包含以下八张表的数据：
  - `schedules` — 课表
  - `client_configs` — 客户端配置
  - `timetables` — 作息时间表
  - `subjects` — 科目
  - `data_versions` — 数据版本号
  - `autorun_records` — 自动任务
  - `countdown_records` — 倒数日
  - `users` — 管理员用户
- `import` 支持两种请求方式：
  - `multipart/form-data` 上传字段 `file`（推荐）
  - 直接提交 JSON 请求体
- 导入策略为 upsert（覆盖更新），支持跨数据库类型迁移（如 MySQL → SQLite）
- SaaS 版本导入时，若备份数据不含 namespace，会自动从 JWT claims 填充

### 导出返回

- HTTP `200`
- Header 包含 `Content-Disposition: attachment; filename="astra-backup-*.json"`

### 导入返回示例

```json
{
  "status": 200,
  "message": "备份导入完成",
  "data": {
    "imported": {
      "schedules": 12,
      "client_configs": 12,
      "timetables": 4,
      "subjects": 4,
      "data_versions": 12,
      "autorun_records": 6,
      "countdown_records": 3,
      "users": 2
    },
    "total": 55
  }
}
```

### 导入失败示例

- `400`：文件类型错误、文件过大、JSON 结构无效
- `401`：鉴权失败
- `500`：数据库事务失败（自动回滚）
