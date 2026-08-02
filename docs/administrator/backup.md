> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# 备份策略

课表、作息、科目、班级配置一旦丢失，需要大量时间重新录入。本章介绍四种部署方案下的备份策略。

## 备份什么

AstraSchedule 需要备份的数据包括：

- **数据库**：所有班级的课表、作息、科目、配置、自动任务
- **服务端配置文件**：`config.toml`（API Key、Token、数据库连接信息）

数据库是最关键的部分，必须定期备份。配置文件变动较少，但建议在首次部署后备份一份。管理端为纯前端构建产物，后端地址在登录页填写，无需备份源码。

## 🔰 极低成本方案（SQLite 备份）

极低成本方案使用 SQLite，数据库文件存储在函数计算实例的 `/tmp/data/astra.db`。函数计算实例在无请求时会被回收，`/tmp` 目录中的数据可能丢失。

### 方法一：管理端导出（推荐，最简单）

1. 浏览器打开管理端（`https://admin.你的域名.com`）
2. 进入「实用工具」→「导出备份」
3. 点击导出，浏览器会自动下载一个 JSON 备份文件
4. 将 JSON 文件保存到安全位置

> 💡 导出的 JSON 文件是完整的数据快照，可以直接通过「导入还原」恢复到任何 AstraSchedule 后端，支持跨数据库类型迁移（SQLite → MySQL 或 MySQL → SQLite）。

### 方法二：手动复制数据库文件

如果你有函数计算的 SSH 或终端访问权限（如使用了预留实例）：

```shell
# 进入函数计算实例后
cp /tmp/data/astra.db /tmp/data/astra-backup-$(date +%Y%m%d).db

# 将备份文件下载到本地
# 具体下载方式取决于你的 Serverless 平台
```

### 备份频率建议

| 场景 | 建议频率 |
|------|----------|
| 正常运行期间 | 每月一次管理端导出 |
| 学期初录入大量数据后 | 立即导出备份 |
| 进行大规模配置修改前 | 导出备份后再操作 |
| 配置自动任务（调休等）后 | 导出备份保留当前状态 |

## 🏫 内网方案

### SQLite 文件备份

如果使用 SQLite，直接复制数据库文件即可完成备份。

#### 手动备份

```shell
# 查看数据库文件路径（以 config.toml 的 db.path 为准，本指南示例为 /opt/astraschedule/data/astra.db）

# 备份命令
cp /opt/astraschedule/data/astra.db /backup/astra-$(date +%Y%m%d-%H%M%S).db
```

#### crontab 定时备份

```shell
# 编辑 crontab
crontab -e

# 添加定时任务：每天凌晨 2:00 自动备份
0 2 * * * cp /opt/astraschedule/data/astra.db /backup/astra-$(date +\%Y\%m\%d).db
```

#### systemd timer 定时备份（推荐）

systemd timer 比 crontab 更可靠，且日志集成到 journald。

**创建备份脚本** `/opt/astra/scripts/backup.sh`：

```shell
#!/bin/bash
BACKUP_DIR="/backup/astra"
DB_PATH="/opt/astraschedule/data/astra.db"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

# 备份数据库
cp "$DB_PATH" "$BACKUP_DIR/astra-$(date +%Y%m%d-%H%M%S).db"

# 清理超过保留天数的旧备份
find "$BACKUP_DIR" -name "astra-*.db" -mtime +$RETENTION_DAYS -delete

echo "[$(date)] Backup completed."
```

**创建 systemd service** `/etc/systemd/system/astra-backup.service`：

```ini
[Unit]
Description=AstraSchedule Database Backup
After=network.target

[Service]
Type=oneshot
ExecStart=/bin/bash /opt/astra/scripts/backup.sh
```

**创建 systemd timer** `/etc/systemd/system/astra-backup.timer`：

```ini
[Unit]
Description=Daily AstraSchedule Backup
Requires=astra-backup.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

**启用定时器：**

```shell
sudo chmod +x /opt/astra/scripts/backup.sh
sudo systemctl daemon-reload
sudo systemctl enable --now astra-backup.timer

# 查看定时器状态
sudo systemctl status astra-backup.timer

# 查看下一次触发时间
sudo systemctl list-timers astra-backup.timer
```

### MySQL 备份

如果使用 MySQL，使用 `mysqldump` 导出：

```shell
# mysqldump 备份
mysqldump -u用户名 -p密码 数据库名 > /backup/astra-mysql-$(date +%Y%m%d).sql

# 可加入 crontab 或 systemd timer 实现定时备份
```

### 管理端导出（双重保险）

无论使用哪种数据库，**强烈建议额外通过管理端定期导出 JSON 备份**。管理端导出的 JSON 文件格式统一，可随时恢复到任何数据库类型的后端。

## 🚀 高并发方案（MySQL 自动备份 + 管理端双重保险）

### RDS 自动备份

阿里云 MySQL Serverless（RDS）提供自动备份功能。

1. 登录阿里云 RDS 控制台
2. 选择你的实例 → **备份恢复**
3. 确认以下设置：

| 配置项 | 建议值 |
|--------|--------|
| 数据备份周期 | 每天 |
| 备份时间 | 业务低峰期（如凌晨 2:00-3:00） |
| 日志备份 | 开启（binlog 备份，支持秒级恢复） |
| 备份保留天数 | 至少 7 天，建议 30 天 |

### 管理端导出（双重保险）

RDS 自动备份已经比较可靠，但建议额外通过管理端导出 JSON 备份作为第二重保障：

1. 每月手动导出一次 JSON 备份
2. 学期初录入数据后立即导出
3. 进行大规模配置修改前导出
4. 将导出的 JSON 文件保存到本地或云存储（如阿里云 OSS、OneDrive）

> 💡 JSON 格式备份文件不受数据库类型限制。即使阿里云 RDS 不可用，你也能将备份导入到新的 SQLite 后端快速恢复服务。

## 备份文件保存策略

### 保留策略

| 备份类型 | 保留天数 | 说明 |
|----------|----------|------|
| 每日自动备份 | 30 天 | 保留最近 30 天的每日备份 |
| 学期快照 | 永久 | 每学期初的完整备份永久保留 |
| 重大变更前快照 | 永久 | 标注变更内容，永久保留 |
| 管理端 JSON 导出 | 永久 | 作为跨平台恢复的通用格式 |

### 保存位置建议

1. **本地保存**：服务器本地磁盘
2. **异地保存**：复制到另一台机器或外接硬盘
3. **云端保存**：上传到云存储（OneDrive、阿里云 OSS 等）

**推荐使用 3-2-1 备份原则**：
- **3** 份备份副本
- **2** 种不同存储介质
- **1** 份异地存储

对于大多数学校场景，**本地保存一份 + 云端保存一份**即可满足需求。

## 恢复流程

### 从 JSON 备份恢复（通用方式）

1. 确保后端正常运行
2. 浏览器打开管理端
3. 进入「实用工具」→「导入还原」
4. 选择之前导出的 JSON 备份文件
5. 确认导入
6. 导入完成后检查各班级配置是否正确

> ⚠️ 导入会**覆盖已存在的同名记录**（按唯一键更新），备份中不存在的记录不会被删除。恢复前建议先导出当前数据作为兜底。

### 从 SQLite 文件恢复（内网方案）

```shell
# 停止后端
sudo systemctl stop astrago

# 恢复备份
cp /backup/astra-20260101.db /opt/astraschedule/data/astra.db

# 重启后端
sudo systemctl start astrago
```

### 从 MySQL 备份恢复

```shell
# 恢复 MySQL 备份
mysql -u用户名 -p密码 数据库名 < /backup/astra-mysql-20260101.sql
```

### 从 RDS 备份恢复

1. 登录阿里云 RDS 控制台
2. 选择实例 → **备份恢复**
3. 选择目标备份 → **恢复**
4. 恢复到当前实例或新实例
5. 验证数据完整性
