# AstraSchedule 文档站

使用 [Rspress](https://rspress.rs/zh/) 构建的 [AstraSchedule（星程课表）](https://getastra.cn) 文档站。

## 本地开发

```bash
bun install
bun run dev       # 开发服务器（热重载）
bun run build     # 生产构建
bun run preview   # 预览构建结果
```

## 目录结构

```
docs-site/
├── rspress.config.ts   # 站点配置
├── docs/
│   ├── _nav.json       # 顶部导航
│   ├── guide/          # 快速开始（部署指南）
│   ├── manual/         # 用户手册（客户端 / 管理后台）
│   ├── administrator/  # 运维手册
│   ├── dev/            # 开发指南
│   ├── faq/            # 常见问题
│   └── glossary/       # 术语表
└── ...
```

## 写作约定

新增或修改文档前，请先阅读 [文档贡献指南](docs/dev/docs-contrib.md)，其中规定了：

- 新增页面后更新所在目录的 `_meta.json`（需要时同步改 `_nav.json`）
- 限制性用词遵循 RFC 2119（必须 / 禁止 / 建议 / 可以）
- AI 编写的内容需按程度添加 DANGER / WARNING 标识
