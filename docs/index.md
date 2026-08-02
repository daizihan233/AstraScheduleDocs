---
pageType: home

hero:
  name: 星程课表
  text: AstraSchedule
  tagline: 灵活部署 · 智能调休 · 集中管控 · 兼容 Windows 7
  image:
    src: https://image-hk-1.oss-accelerate.aliyuncs.com/icon.png
  actions:
    - theme: brand
      text: 开始部署
      link: /guide/
    - theme: alt
      text: 使用手册
      link: /manual/
    - theme: alt
      text: 下载链接
      link: https://hubproxy.khbit.cn/https://github.com/AstraSchedule/desktop/releases/latest/download/AstraScheduleInstaller.exe

features:
  - title: 灵活部署
    details: SQLite 开箱即用，也支持 MySQL。能跑在云函数等 Serverless 平台上轮询，也能跑在服务器上 WebSocket 实时推送。客户端、管理端、后端可以分开放在不同地方。支持 SaaS 多租户模式，通过子域名自动识别租户，为多所学校提供独立服务。
    icon: 📦
    link: /guide/choose-deployment
  - title: 智能调休与自动任务
    details: 内置中国节假日调休推算，自动应用调课安排；临时调课设好日期，到期自动复原。一条规则搞定整个年级的临时调整，不用逐班修改。
    icon: 🔄
    link: /manual/features/autorun
  - title: 集中管控
    details: 网页端统一配置所有班级的课表、作息、科目，客户端开机自动同步。新建班级时一键复制已有配置，全班共用一套规则。
    icon: 🔗
    link: /manual/admin/dashboard
  - title: 悬浮课表
    details: 课表以透明悬浮窗显示在屏幕顶部，不遮挡任何内容。鼠标移到课表上会自动变透明，方便老师临时查看被遮挡的课件。
    icon: 👁️
    link: /manual/client/window-mode
  - title: 兼容 Windows 7
    details: 专门适配 32 位 Windows 7 系统。学校机房的老旧设备也能流畅运行，不需要升级操作系统。
    icon: 🖥️
    link: /guide/client
  - title: 倒数日
    details: 独立小窗口显示中考、期末考、放假倒计时。天数越近颜色越红，中文竖排显示，多个日程按优先级排列。
    icon: 📆
    link: /manual/features/countdown
  - title: 实时天气
    details: 课表旁边显示当前气温和天气，温度不同颜色不同，极端天气自动弹出预警。
    icon: 🌤️
    link: /manual/features/weather
  - title: 通知横幅
    details: 顶部滚动通知栏，考试期间放"诚信考试"，放假前放安全提示。天气预警来了自动替换普通通知。
    icon: 📢
    link: /manual/features/banner
  - title: 一键备份与迁移
    details: 数据库一键导出为 JSON，换个服务器直接导入。支持 MySQL 和 SQLite 互相迁移，不怕换环境。
    icon: 💾
    link: /manual/features/backup
---
