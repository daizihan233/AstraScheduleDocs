> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# 代码贡献

面向 AstraSchedule 各子项目的开发者。所有子项目均为独立 Git 仓库，遵循统一的提交与分支规范。

## 分支管理

- **main 分支**：基础版本，不含 namespace 多租户功能
- **saas/main 分支**：SaaS 版本（仅 `usr-backend`、`usr-dashboard` 存在），包含多租户功能
- **合并方向**：main → saas/main（单向），**严禁** saas/main → main
- 如需将 saas/main 的修改引入 main：逐个 cherry-pick 或手动提取单个 commit，不得整分支合并
- `sys-backend`、`sys-dashboard` **没有** saas/main 分支，其 main 即 SaaS 版本

> 开始每个新任务前，先确认在哪个分支上工作。

## Commit 规范

格式：`<emoji><type>(<scope>): <description>`，description 使用**中文**。

| emoji | type | 用途 |
|-------|------|------|
| ✨ | feat | 新功能 |
| 🐛 | fix | 修复 |
| 🔒 | security | 安全 |
| 📝 | docs | 文档 |
| 🎉 | init | 初始化 |
| 🔧 | refactor | 重构 |
| ♻️ | style | 风格 |
| ⚡ | perf | 性能 |
| ✅ | test | 测试 |
| 🔨 | build | 构建 |
| ⏪ | revert | 回滚 |

示例：

```
✨ feat(autorun): 支持作息表交集计算
🐛 fix(client): 修复倒数日窗口不刷新问题
```

- 由 AI 编写的代码，在 Commit Message 后添加 `(By AI)` 标识
- **Commit 流程**：生成 commit message 后先展示给用户确认，用户同意后才能执行 `git commit`

## 编码约定

- **换行符**：CRLF（所有子项目）
- **缩进**：desktop JS/CSS 用 4 空格，package.json/HTML 用 2 空格；usr-dashboard 统一 2 空格
- **包管理器**：所有 Node.js 子项目统一使用 Bun
- **Go 后端**：禁止原生 SQL（用 GORM）、禁止 `as any` 等松散类型；提交前运行 `go fmt ./...` 与 `go test ./...`
- **新增数据库表**：必须同步检查 `db/backup.go` 的 `BackupPayload`、导出/导入逻辑与 namespace 覆盖
- **API 改动**：必须同步更新 OpenAPI 文档（`usr-backend/AstraServerGo.openapi.json`、`sys-backend/SysBackend.openapi.json`）

## 提交流程

1. 确认工作分支（见上）
2. 修改代码，遵循各子项目的编码约定
3. 运行验证（构建 / 测试 / 格式化）
4. 生成 commit message 并**展示给用户确认**
5. 用户同意后执行提交

## 文档同步

- 涉及新增功能或破坏性修改时，询问用户是否更新 `docs-site` 文档
- 文档写作规范见 [docs-contrib](./docs-contrib)
