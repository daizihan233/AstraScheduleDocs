> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# CNAME（别名记录）

## 通俗解释

CNAME 就是给域名起个别名。比如 `api.example.com` 其实指向 `your-app.fc.aliyuncs.com`，用户不知道背后是谁，只知道你的域名。

AstraSchedule 配置 CNAME 将 `api` 和 `admin` 子域名指向对应服务。

## 专业解释

CNAME（Canonical Name）是 DNS 记录类型，将一个域名指向另一个域名（别名）。

特点：
- **间接指向**：域名 A → 域名 B → IP 地址
- **自动跟随**：别名变化时自动更新
- **不能与其他记录共存**：同一域名不能同时有 CNAME 和其他记录

使用场景：
- **CDN**：将域名指向 CDN 提供商
- **云服务**：将域名指向云服务入口
- **负载均衡**：将域名指向负载均衡器

在 AstraSchedule 中：
- `api.你的域名.com` → 函数计算 CNAME 地址
- `admin.你的域名.com` → Cloudflare Pages 提供的域名地址
