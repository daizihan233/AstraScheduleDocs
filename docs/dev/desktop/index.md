> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# Desktop 客户端

Electron 客户端，部署在教室电脑上，负责课表展示、倒计时、天气和 WebSocket 实时同步。

## 技术栈

- Electron 22 + 原生 JS + jQuery
- electron-store（配置持久化）
- electron-updater（自动更新）

## 项目结构

```
desktop/
├── main.js                    # 主进程入口
├── index.html                 # 主窗口（课表界面）
├── countdown.html             # 倒数日窗口
├── main/                      # 主进程模块
│   └── countdown/             # 倒数日子系统
├── js/                        # 渲染进程脚本
│   ├── scheduleConfig.js      # 默认课表配置
│   ├── index.js               # 课表核心逻辑
│   └── renderer.js            # UI 渲染
├── css/                       # 样式
└── image/                     # 图标资源
```

## 开发

```bash
# 需要 Node.js v20+、VS2019+、Python 3.8+
pip install setuptools
npm install
bun run debug
```

## 构建

```bash
# Windows ia32
bun run build

# CI 构建并发布
bun run ci
```

## 配置三层存储

| 层 | 位置 | 用途 |
|----|------|------|
| electron-store | `%APPDATA%/electron_class_schedule/config.json` | 用户偏好 |
| localStorage | 浏览器 | 运行时状态（周数、计时偏移） |
| JSONC 文件 | `scheduleConfig.user.jsonc` | 用户课表配置（支持注释） |

## 窗口穿透交互

客户端使用鼠标穿透 + 轮询（100ms）实现悬停交互。`win.setIgnoreMouseEvents(true, { forward: true })` 开启穿透，轮询检测鼠标是否在可交互区域，悬停时降低 opacity 至 0.1。
