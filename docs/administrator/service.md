> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# 服务管理（systemd）

内网部署方案使用 systemd 管理后端进程，实现开机自启、异常自动重启。本页汇总日常服务操作；服务文件的创建见[部署后端服务器（内网）](../guide/intranet/server)。

## 服务状态

```bash
# 查看服务状态（active (running) 为正常）
sudo systemctl status astraschedule

# 查看是否开机自启
sudo systemctl is-enabled astraschedule
```

## 启停与重启

```bash
sudo systemctl start astraschedule    # 启动
sudo systemctl stop astraschedule     # 停止
sudo systemctl restart astraschedule  # 重启（修改配置后常用）
```

## 查看日志

```bash
# 实时跟踪日志
sudo journalctl -u astraschedule -f

# 最近 100 行
sudo journalctl -u astraschedule -n 100

# 查看某时间段的日志
sudo journalctl -u astraschedule --since "2025-01-01 08:00"
```

## 常见问题

### 服务启动失败

```bash
# 查看失败原因
sudo journalctl -u astraschedule -n 50 --no-pager
```

常见原因：

- 端口被占用（Hyper-V 可能预留 9000-9099）：修改 `config.toml` 的 `server.port`
- 配置文件格式错误：检查 TOML 语法
- 缺少 `config.toml`：确认配置文件与二进制在同一目录（`WorkingDirectory`）

### 修改配置后不生效

修改 `config.toml` 后必须重启服务：

```bash
sudo systemctl restart astraschedule
```

### 开机不自启

```bash
sudo systemctl enable astraschedule
```
