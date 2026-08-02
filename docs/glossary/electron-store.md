> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# electron-store（客户端配置存储）

## 通俗解释

electron-store 是 Electron 程序里用来"记住设置"的小工具。用户改的设置（比如服务器地址、窗口是否置顶）会被保存成文件，下次启动软件时自动读回来。

## 专业解释

electron-store 是 Electron 的配置持久化库，将键值对数据以 JSON 文件形式保存在用户数据目录（Windows 下为 `%APPDATA%/electron_class_schedule/config.json`），提供同步读写 API。

## 在 AstraSchedule 中

- 客户端所有托盘菜单设置（服务器地址、班级标识、安全连接、窗口置顶、开机启动等）通过 electron-store 持久化
- 存储键如 `server`、`class`、`isSecureConnection`、`isFromCloud`、`isAutoUpdate`
- 卸载安装包时配置数据会被一并清除（`deleteAppDataOnUninstall`），重装后需重新设置

参见：[配置持久化](../manual/client/store-keys)
