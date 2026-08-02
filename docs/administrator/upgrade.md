> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# 升级指南

AstraSchedule 各组件独立升级，建议按「先备份 → 后端 → 管理端 → 客户端」的顺序进行。

## 升级前准备

1. **备份数据库**：通过管理端「实用工具」→「导出备份」下载 JSON 备份，或在服务器上直接备份数据库文件（见[备份策略](./backup)）
2. **查看版本号**：版本号格式为 `YYYYMM.D.N`（年月.日.运行序号），新版本号大于旧版本号才需要升级
3. **阅读变更**：查看对应仓库的 Release 说明，确认是否有破坏性变更（如配置文件格式变化、数据库迁移要求）

## 升级后端

### 传统部署（Linux + systemd）

```bash
# 停止服务
sudo systemctl stop astraschedule

# 备份旧二进制（便于回滚）
sudo cp /opt/astraschedule/astrago /opt/astraschedule/astrago.bak

# 下载新版本（替换仓库名为 usr-backend）
sudo wget https://github.com/AstraSchedule/usr-backend/releases/latest/download/AstraScheduleServerGo-linux-amd64 -O /opt/astraschedule/astrago

# 恢复执行权限并启动
sudo chmod +x /opt/astraschedule/astrago
sudo systemctl start astraschedule

# 验证
curl http://localhost:9000/web/menu
```

> 若数据库为 MySQL 且此前设置了 `GIN_MODE=release`，升级后如遇表结构变化可临时去掉该环境变量启动一次以执行自动建表，再恢复。

### 函数计算（Serverless）

1. 重新下载最新二进制并打包上传（记得 `chmod +x astrago`）
2. 如数据库为 MySQL 且首次升级后查询报错，先不设置 `GIN_MODE=release` 部署一次完成建表
3. 更新后访问 `curl https://api.你的域名.com/web/menu` 验证

## 升级管理端

管理端为静态构建产物，重新构建后替换即可（或 Cloudflare Pages 等平台自动重新部署）：

```bash
cd usr-dashboard
git pull
bun install
bun run build   # 产物在 dist/
```

然后将 `dist/` 内容替换到 Nginx 站点目录（或触发 Pages 重新构建）。

## 升级客户端

客户端通过 electron-updater 自动更新（见[自动更新](../manual/client/auto-update)）：

- 默认从 `hubproxy.khbit.cn` 镜像源拉取更新
- 打包版本（安装版）启动后自动检查更新，也可在托盘「检查更新」手动触发
- 若教室网络无法访问镜像源，可自建镜像或在[下载页](https://github.com/AstraSchedule/desktop/releases)手动下载安装包覆盖安装

## 升级后检查

- [ ] 后端 `/web/menu` 返回正常
- [ ] 管理端可正常登录、读取各班级配置
- [ ] 客户端拉取课表正常（抽查一间教室）
- [ ] 备份文件已保存（升级前导出的那份保留一段时间）
