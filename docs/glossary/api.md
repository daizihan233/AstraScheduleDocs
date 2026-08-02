> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# API（应用程序编程接口）

## 通俗解释

API 就是程序之间的约定。比如后端说："你给我这个数据，我返回那个结果"。前端按约定调用，后端按约定返回。

AstraSchedule 后端、前端和客户端通过 API 进行交互。

## 专业解释

API（Application Programming Interface）是软件组件间的接口定义，规定了如何请求服务和返回结果。

RESTful API 特点：
- **无状态**：每次请求包含所有必要信息
- **统一接口**：使用标准 HTTP 方法（GET/POST/PUT/DELETE）
- **资源导向**：URL 表示资源（如 `/web/config/schedule`）
- **状态码**：用 HTTP 状态码表示结果

在 AstraSchedule 中：
- 管理端接口：`/web/*`
- 客户端接口：`/:school/:grade/:class`
- 认证方式：JWT + 密码确认
- 响应格式：JSON
