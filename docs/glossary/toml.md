> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# TOML（Tom's Obvious, Minimal Language）

## 通俗解释

TOML 是一种配置文件格式，比 JSON 更易读。用等号赋值，用 `#` 写注释。AstraSchedule 的后端配置文件 `config.toml` 就是用 TOML 写的。

## 专业解释

TOML 是一种配置文件格式，旨在易于阅读，能明确映射到哈希表。

基本语法：
```toml
# 注释
key = "value"

[section]
key = "value"

[nested.section]
key = "value"
```

特点：
- **易读**：语法简洁直观
- **类型明确**：支持字符串、数字、布尔、日期等
- **支持注释**：用 `#` 开头
- **支持嵌套**：用 `[section]` 表示

与 JSON 对比：
| 特性 | TOML | JSON |
|------|------|------|
| 注释 | 支持 | 不支持 |
| 可读性 | 高 | 中 |
| 适用场景 | 配置文件 | 数据交换 |

在 AstraSchedule 中，`config.toml` 包含数据库配置、API 密钥、日志设置等。
