> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# Namespace（命名空间）

## 通俗解释

命名空间就像给数据加个标签，区分不同来源。比如学校 A 的数据和学校 B 的数据，通过命名空间隔开，互不干扰。

AstraSchedule SaaS 模式用命名空间实现多租户数据隔离，每个学校有自己的 namespace。

## 专业解释

Namespace（命名空间）是一种将标识符分组的机制，避免命名冲突。在数据库中，namespace 用于实现多租户数据隔离。

在 AstraSchedule SaaS 模式中：
- namespace 从请求的 Host 头解析
- 规则：反转域名段用 `/` 连接
- 示例：`aaa-do.getastra.cn` → `cn/getastra/aaa-do`
- 所有数据表包含 `namespace` 字段
- 查询时自动过滤当前租户数据
- 非 SaaS 部署（main 分支）或未匹配到租户时，回退到默认 namespace（`default`）

优势：
- **数据隔离**：不同租户数据互不可见
- **统一部署**：一套代码服务多个租户
- **灵活扩展**：新增租户只需添加 namespace
