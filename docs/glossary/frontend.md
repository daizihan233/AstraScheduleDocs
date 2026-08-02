> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# 前端（Frontend）

## 通俗解释

前端就是用户直接看到和操作的界面。你在浏览器里看到的网页、按钮、表单，都是前端。前端负责"长什么样"和"怎么交互"。

AstraSchedule 的前端包括：用户端管理后台（usr-dashboard）、系统端管理后台（sys-dashboard）、注册中心（reg-go）和 Electron 客户端（desktop，教室电脑上显示课表）。

## 专业解释

前端是用户与应用程序交互的界面层，运行在用户设备上（浏览器或桌面应用）。

核心技术：
- **HTML**：页面结构
- **CSS**：样式和布局
- **JavaScript**：交互逻辑
- **框架**：Vue、React、Angular 等

AstraSchedule 的前端：
| 组件 | 技术栈 | 用途 |
|------|--------|------|
| usr-dashboard | Vue3 + Naive UI + Vite | 用户端管理后台 |
| sys-dashboard | Vue3 + Naive UI + Vite | 系统端管理后台 |
| reg-go | Vue3 + Vite | SaaS 注册中心 |
| desktop | Electron + 原生 JS + jQuery | 教室客户端 |

前端与后端通过 API 通信，获取数据并展示给用户。
