# 极低成本外网部署架构图

## 架构概览

```mermaid
graph TB
    subgraph "教室环境"
        Client["🖥️ Electron 客户端<br/>desktop"]
    end
    
    subgraph "用户环境"
        Browser["🌐 浏览器<br/>老师/管理员"]
    end
    
    subgraph "Cloudflare CDN"
        WAF["🛡️ WAF + HTTPS<br/>+ DDoS 防护"]
        DNS["🌐 DNS 解析"]
    end
    
    subgraph "阿里云函数计算"
        Backend["⚙️ Go 后端 API<br/>usr-backend"]
        SQLite["💾 SQLite 数据库<br/>嵌入式存储"]
    end
    
    subgraph "Cloudflare Pages"
        Admin["📱 管理后台<br/>usr-dashboard"]
    end
    
    Client -->|"HTTP/HTTPS"| WAF
    Browser -->|"HTTP/HTTPS"| Admin
    WAF -->|"转发请求"| Backend
    Backend -->|"读写数据"| SQLite
    Admin -->|"API 调用"| WAF
```

## 数据流

```mermaid
sequenceDiagram
    participant C as 客户端
    participant CF as Cloudflare CDN
    participant FC as 阿里云函数计算
    participant DB as SQLite
    participant B as 浏览器
    participant NL as Cloudflare Pages
    
    Note over C,FC: 客户端获取课表
    C->>CF: GET /:school/:grade/:class
    CF->>FC: 转发请求
    FC->>DB: 查询课表数据
    DB-->>FC: 返回数据
    FC-->>CF: 响应课表
    CF-->>C: 返回课表
    
    Note over B,NL: 管理端配置课表
    B->>NL: 访问管理后台
    NL-->>B: 返回管理界面
    B->>CF: PUT /web/config/...
    CF->>FC: 转发请求
    FC->>DB: 更新课表数据
    DB-->>FC: 确认更新
    FC-->>CF: 响应成功
    CF-->>B: 返回结果
    
    Note over C,CF: 客户端实时同步
    C->>CF: WebSocket 连接
    CF->>FC: 建立 WebSocket
    FC-->>CF: 推送 SyncConfig
    CF-->>C: 通知配置更新
    C->>CF: 重新获取课表
```

## 部署流程

```mermaid
graph TB
    A["1. 注册 Cloudflare"] --> B["2. 配置 DNS 解析"]
    B --> C["3. 启用 WAF + HTTPS"]
    C --> D["4. 部署后端到函数计算"]
    D --> E["5. 配置触发器"]
    E --> F["6. Fork 管理端仓库"]
    F --> G["7. 连接 Cloudflare Pages"]
    G --> H["8. 自动构建部署"]
    H --> I["9. 安装客户端"]
    I --> J["10. 配置云端地址"]
```

## 组件说明

| 组件 | 技术栈 | 部署位置 | 费用 |
|------|--------|----------|------|
| **客户端** | Electron 22 + JS + jQuery | 教室电脑 | 免费 |
| **管理后台** | Vue3 + Vite + Naive UI | Cloudflare Pages | 免费 |
| **后端 API** | Go 1.26 + Gin + GORM | 阿里云函数计算 | ≈5元/月（假期不计费） |
| **数据库** | SQLite | 嵌入云函数实例 | 免费 |
| **安全防护** | Cloudflare CDN | 全球 CDN | 免费 |
| **域名** | 自定义域名 | Cloudflare | 不等 |

## 网络拓扑

```mermaid
graph TB
    subgraph "互联网"
        User["用户设备"]
        Internet["互联网"]
    end
    
    subgraph "Cloudflare 全球网络"
        Edge["边缘节点"]
        Origin["源站保护"]
    end
    
    subgraph "阿里云"
        FC["函数计算实例"]
        Storage["NAS 存储"]
    end
    
    subgraph "Cloudflare Pages"
        CDN["全球 CDN"]
        Build["构建服务"]
    end
    
    User -->|"1. DNS 查询"| Edge
    Edge -->|"2. 缓存命中?"| Origin
    Origin -->|"3. 回源请求"| FC
    FC -->|"4. 读写数据"| Storage
    User -->|"5. 访问管理端"| CDN
    CDN -->|"6. 静态资源"| Build
```

## 安全架构

```mermaid
graph TB
    subgraph "外部访问"
        Client["客户端"]
        Browser["浏览器"]
    end
    
    subgraph "Cloudflare 安全层"
        WAF["WAF 防火墙"]
        RateLimit["速率限制"]
        Bot["Bot 防护"]
        SSL["SSL/TLS 加密"]
    end
    
    subgraph "后端安全"
        Auth["JWT 认证"]
        CORS["CORS 配置"]
        Validate["输入验证"]
    end
    
    Client -->|"HTTPS"| WAF
    Browser -->|"HTTPS"| WAF
    WAF --> RateLimit
    RateLimit --> Bot
    Bot --> SSL
    SSL --> Auth
    Auth --> CORS
    CORS --> Validate
```

## 成本分析

| 项目 | 月费用 | 年费用 | 说明 |
|------|--------|--------|------|
| 域名 | - | ≈40元 | .cn 域名（按需求可以选别的更便宜的） |
| 函数计算 | ≈5元 | ≈45元 | 按调用次数计费（寒暑假不计费） |
| Cloudflare Pages | 0 | 0 | 免费 |
| Cloudflare | 0 | 0 | 免费 |
| **总计** | **≈5元** | **≈85元** | **极低成本** |

## 优势

1. **成本极低**：年费仅约85元，适合预算有限的学校/个人
2. **无需运维**：Serverless 架构，自动弹性伸缩
3. **安全可靠**：Cloudflare 提供外网安全防护
4. **数据安全**：SQLite 嵌入式存储，冷启动快，成本低廉

## 注意事项

1. **SQLite 限制**：单实例存储，并发写入有限，对于规模超过 3000 个班级的区域不建议使用此方案
2. **冷启动**：Serverless 函数可能有冷启动延迟，但通常可接受
