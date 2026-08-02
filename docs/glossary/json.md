> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# JSON（JavaScript 对象表示法）

## 通俗解释

JSON 是一种数据格式，用大括号、中括号、引号组织数据。人能看懂，程序也能解析。网页、服务器、数据库之间传数据常用 JSON。

AstraSchedule 的 API 响应、备份文件使用 JSON 格式；服务端配置文件使用 [TOML](./toml) 格式（不是 JSON）。

## 专业解释

JSON（JavaScript Object Notation）是一种轻量级的数据交换格式，基于 JavaScript 语法子集。

基本语法：
- **对象**：`{"key": "value"}`
- **数组**：`[1, 2, 3]`
- **字符串**：`"hello"`
- **数字**：`42`
- **布尔**：`true` / `false`
- **空值**：`null`

特点：
- **轻量**：比 XML 更简洁
- **易读**：人类可读
- **易解析**：所有语言都有解析库
- **通用**：前后端、配置文件都适用

在 AstraSchedule 中，JSON 用于：
- API 请求和响应
- 备份导出格式

> 注意：服务端配置文件是 `config.toml`（TOML 格式），不是 `config.json`。
