> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# bcrypt

## 通俗解释

bcrypt 是一种专门用来加密密码的算法。密码存入数据库前，bcrypt 会给它加盐（随机数）再哈希，存的是加密后的乱码。即使数据库泄露，攻击者也很难反推出原始密码。

AstraSchedule 后端使用 bcrypt 加密用户密码，工作因子设为 12。

## 专业解释

bcrypt 是基于 Blowfish 密码的自适应哈希函数，专为密码存储设计。

核心特点：
- **加盐（Salt）**：每个密码自动生成随机盐值，防止彩虹表攻击
- **工作因子（Cost）**：可调整计算时间，cost=12 约需 250ms
- **自适应**：硬件变快时可提高 cost，保持安全性
- **固定输出**：60 字符，格式 `$2a$12$salt+hash`

工作流程：
1. 生成 16 字节随机盐值
2. 使用盐值和密码进行 2^cost 轮 Blowfish 加密
3. 输出 `$2a$<cost>$<22字符盐值><31字符哈希>`

在 AstraSchedule 中：
- cost = 12（约 250ms 计算时间）
- 存储字段：`users` 表的 `password_hash`
- 验证方式：`bcrypt.CompareHashAndPassword` 自动提取盐值比较
