> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# RBAC（基于角色的访问控制）

## 通俗解释

RBAC 就是按角色分配权限。管理员有管理员的权限，老师有老师的权限，学生有学生的权限。不用给每个人单独设置，按角色统一管理。

AstraSchedule 管理端使用 RBAC，角色包括 admin、school_w、grade_w、class_w、readonly。

## 专业解释

RBAC（Role-Based Access Control）是一种访问控制模型，通过角色间接分配权限。

核心概念：
- **用户**：系统使用者
- **角色**：权限集合（如 admin、teacher）
- **权限**：可执行的操作（如读、写、删除）
- **分配**：用户 → 角色 → 权限

在 AstraSchedule 中：
| 角色 | 权限 |
|------|------|
| admin | 全局管理 |
| school_w | 校级写入 |
| grade_w | 年级级写入 |
| class_w | 班级级写入 |
| readonly | 只读 |

角色通过 `scope` 字段限定作用范围（如 `学校/年级/班级`）。其中 `admin` 为全局管理员（通常由部署方或系统端创建），`school_w` / `grade_w` / `class_w` 为各级写入角色，`readonly` 为只读角色。
