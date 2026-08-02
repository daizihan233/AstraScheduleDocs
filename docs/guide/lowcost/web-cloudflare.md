> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# 部署管理端到 Cloudflare Pages

## 概述

Cloudflare Pages 是一个免费的前端托管平台，可以自动从 GitHub 仓库构建和部署网站。

## 你需要准备

- GitHub 账号
- 管理端后端地址（如 `https://api.your-domain.com`）

## 步骤

### 1. Fork 管理端仓库

1. 打开 [AstraSchedule/usr-dashboard](https://github.com/AstraSchedule/usr-dashboard)
2. 点击右上角 **Fork** 按钮
3. 仓库会复制到你的 GitHub 账号下

<!-- TODO: 截图 - Fork 按钮 -->

### 2. 确认无需修改源码

管理端**不需要**修改任何源码来指定后端地址。后端地址在部署后的登录页输入框填写，会保存在浏览器本地。

如果你希望默认值直接指向你的后端（免去每次输入），可以修改 `src/global.js` 中保存默认地址的逻辑后重新构建——但对绝大多数场景没必要。

### 3. 部署到 Cloudflare Pages

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/)，登录账号
2. 进入 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 授权 Cloudflare 访问你的 GitHub 仓库
4. 选择你 Fork 的 `usr-dashboard` 仓库
5. 构建配置：

| 配置项 | 值 |
|--------|-----|
| Production branch | `main` |
| Build command | `bun run build` |
| Build output directory | `dist` |

6. 点击 **Save and Deploy**

<!-- TODO: 截图 - Cloudflare Pages 部署配置 -->

### 4. 绑定自定义域名

1. 部署完成后，进入 Pages 项目的 **Custom domains** 标签
2. 点击 **Set up a custom domain**
3. 输入你的管理端域名，如 `admin.your-domain.com`
4. Cloudflare 会自动配置 DNS 和 HTTPS 证书

<!-- TODO: 截图 - Cloudflare Pages 域名配置 -->

### 5. 登录并初始化服务器

1. 浏览器打开 `https://admin.your-domain.com`
2. 登录页「后端地址」栏填入你的后端地址（如 `https://api.your-domain.com`）
3. 输入管理员账号密码登录
4. 若提示「服务端尚未配置学校/年级/班级」，点击「初始化服务器」，按提示填写学校/年级/班级和管理员密码即可（首次配置会写入后端）

> 管理员账号由部署方预先创建，后端不会自动生成默认账号。

### 6. 验证

1. 确认管理端页面能正常加载
2. 尝试在管理端创建一个科目配置，确认保存成功
3. 在客户端输入后端地址，确认能拉取到配置
