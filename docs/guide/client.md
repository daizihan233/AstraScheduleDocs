# 安装客户端

## 概述

客户端是运行在教室电脑（或电子白板）上的桌面程序，用于显示课表、星期、日期、倒计时等信息。

客户端通过网络从后端拉取课表配置，因此需要先完成后端和管理端的部署。

## 你需要准备

- 一台需要安装软件的 Windows 电脑（Windows 7 或以上）
- 后端 API 地址，格式为 `api.your-domain.com`（不要带协议前缀）

## 步骤

### 1. 下载客户端

1. 打开 [GitHub Releases 页面](https://github.com/AstraSchedule/desktop/releases/latest)
2. 找到最新的发布版本，下载 `AstraScheduleInstaller.exe` 安装包
3. 下载完成后，双击安装包进行安装

安装过程与普通 Windows 软件相同，一路下一步即可完成安装。安装完成后，桌面和开始菜单都会有快捷方式。

> [!TIP]
>
> 如果您的网络无法访问 GitHub，也可以尝试点击这个镜像地址进行下载：[hubproxy.khbit.cn](https://hubproxy.khbit.cn/https://github.com/AstraSchedule/desktop/releases/latest/download/AstraScheduleInstaller.exe)
>
> 客户端也使用此镜像源用于软件更新，它是安全的，由开发者自行维护。

![GitHub Release 页截图](https://image-hk-1.oss-accelerate.aliyuncs.com/image-20260613001351709.png)

### 2. 配置云端服务地址

客户端默认会显示来自 `class.getastra.cn` 的演示环境地址。

![image-20260704033405462](https://image-hk-1.oss-accelerate.aliyuncs.com/image-20260704033405462.png)

客户端安装完成后，需要配置后端服务器地址才能拉取课表数据。

1. 启动客户端，在系统右下角托盘区找到课程表图标
2. 右键点击托盘图标，打开托盘菜单
3. 在菜单中找到 **云端服务** 选项，点击它
4. 在弹出的输入框中输入后端 API 地址
5. 输入完成后点击确定，并重启程序。如果地址正确且后端正常运行，客户端会自动拉取课表配置并显示在屏幕上

**输入格式说明：**

```
api.your-domain.com
```

✅ 只需要输入域名本身，不要添加 `http://`、`https://` 或末尾的斜杠，客户端会自动处理协议和路径。

❌ 以下都是错误格式：

```
https://api.your-domain.com
http://api.your-domain.com
api.your-domain.com/
```

### 3. 配置所在班级

客户端默认会显示来自演示环境 `39/2023/1` 的数据。

![image-20260704033746908](https://image-hk-1.oss-accelerate.aliyuncs.com/image-20260704033746908.png)

同样的，您需要配置机器所在的班级，格式为

```
学校名称/年级名称/班级名称
```

使用英文斜杠分开。应与管理后台的设置一样。

### 4. 修改当前地区

客户端默认使用您的 IP 属地作为天气查询地区，但这有时并不准确，需要修改为当地城市才能获取准确的天气信息。

1. 右键点击系统托盘的课程表图标
2. 在菜单中找到 **当前地区** 选项，点击它
3. 在弹出的输入框中输入教室所在地区

**支持的格式：**

```
Jiangsu/Nanjing
Nanjing
Nanjing/Gulou
江苏/南京
南京
南京/鼓楼
```

支持中英文混合输入，格式为 `省份/城市` 或 `城市/区县`，也可以只输入城市名称。

4. 输入完成后点击确定。客户端会自动获取当地天气信息并显示在课表界面上。

> 💡 天气功能需要后端配置有效的天气 API Key 才能正常使用。如果天气不显示，请参考 [获取和风天气 API 凭证](./lowcost/weather-api.md) 配置 API。 **SaaS 无需自行配置 API Key** 。

## 不同部署方案的服务端地址

| 部署方案 | 服务端地址示例 | 说明 |
|----------|---------------|------|
| 极低成本外网部署 | `api.your-domain.com` | 使用 Cloudflare CDN 代理的域名 |
| 外网高并发部署 | `api.your-domain.com` | 直接暴露的服务器域名 |
| 学校内网部署 | `192.168.1.100:9000` | 内网 IP 地址和端口 |
| SaaS 模式 | `school.getastra.cn` | 分配的子域名 |
