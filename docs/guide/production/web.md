> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# 部署管理端（生产级）

## 概述

生产级方案的管理端部署有两个选择：

1. **Cloudflare Pages**：与极低成本方案相同，免费、简单，推荐首选
2. **ESA / CDN 静态托管**：通过阿里云 OSS + ESA 加速，享受更低的中国大陆访问延迟

## 选项一：Cloudflare Pages（推荐）

Cloudflare Pages 的部署步骤与极低成本方案完全一致。

参见 [极低成本方案 - 部署管理端到 Cloudflare Pages](../lowcost/web-cloudflare.md)。

**唯一区别**：部署后在登录页「后端地址」栏填写生产级后端地址，如 `https://api.your-domain.com`。

## 选项二：阿里云 OSS + ESA 静态托管

如果你的用户主要在中国大陆，使用阿里云 OSS 托管前端，配合 ESA 加速，可以获得更低的访问延迟。

### 步骤

#### 1. 构建前端

在 `usr-dashboard` 项目中执行构建：

```shell
cd usr-dashboard
bun run build
```

构建产物在 `dist/` 目录下。

> 管理端无需修改源码指定后端地址：部署后在登录页「后端地址」栏填写即可（保存在浏览器本地）。

#### 2. 创建 OSS Bucket

1. 登录 [阿里云 OSS 控制台](https://oss.console.aliyun.com/)
2. 点击「创建 Bucket」
3. 填写：

| 配置项 | 值 |
|--------|-----|
| Bucket 名称 | `astra-admin` |
| 地域 | 建议与函数计算同一地域 |
| 存储类型 | 标准存储 |
| 读写权限 | 公共读 |
| 版本控制 | 关闭（或按需开启） |

#### 3. 上传文件

1. 进入创建好的 Bucket
2. 点击「上传文件」
3. 将 `dist/` 目录下的所有文件上传到 Bucket 根目录

也可以使用 OSS 命令行工具批量上传：

```shell
# 安装 ossutil（如未安装）
# 配置凭证后执行
ossutil cp -r dist/ oss://astra-admin/ --update
```

#### 4. 配置静态网站托管

1. 进入 Bucket 的「数据管理」→「静态页面」
2. 开启静态网站托管
3. 设置：

| 配置项 | 值 |
|--------|-----|
| 默认首页 | `index.html` |
| 默认 404 页 | `index.html`（SPA 模式下，所有路由由前端处理） |

#### 5. 绑定自定义域名

1. 进入 Bucket 的「传输管理」→「域名管理」
2. 绑定自定义域名，如 `admin.your-domain.com`
3. 开启 HTTPS（OSS 可自动申请免费证书）

> ⚠️ 阿里云 OSS 绑定自定义域名（中国大陆地域）要求域名已完成 **ICP 备案**，未备案域名无法绑定。

#### 6. 配置 CDN 加速（推荐）

1. 进入「CDN 加速」→「添加域名」
2. 源站选择对应的 OSS Bucket
3. 缓存配置：
   - 静态资源（JS、CSS、图片）：缓存 7 天
   - HTML 文件：缓存 5 分钟
4. 将 CDN 提供的 CNAME 记录添加到 ESA 的 DNS 中

> 💡 如果已配置 ESA，可以直接在 ESA 中添加该域名的 DNS 记录，ESA 会自动为该域名提供加速和安全防护。

## 验证

1. 浏览器打开管理端域名（如 `https://admin.your-domain.com`）
2. 确认页面能正常加载
3. 确认 API 请求能正常发送到后端
4. 尝试登录并创建一个科目配置，确认保存成功

## 成本参考

| 选项 | 费用 |
|------|------|
| Cloudflare Pages | 免费 |
| OSS + CDN | 按存储量和流量计费，小规模约 1-5 元/月 |
