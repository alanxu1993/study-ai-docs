# Hermes Agent 安装教程

很多 AI Agent 装起来很劝退：要先手动装 Python、装 Node、再装一堆运行库，配 PATH 配到崩溃。Hermes Agent 反着来——**一条命令，60 秒完成，零前置依赖**。安装脚本会自动处理 uv、Python 3.11、Node.js 22、ripgrep、ffmpeg 这些运行时，你不需要先装任何东西。这章按 Linux / macOS / WSL2、Windows 原生、Android（Termux）三条路径讲清楚安装、配置、更新与排查。

## 一、Linux / macOS / WSL2 安装

在终端执行下面这条命令：

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

![一条命令完成安装](/images/hermes/install/01-install-command.png)

### 1.1 安装脚本自动做了什么

你不需要手动装任何前置依赖，脚本会检测并自动处理：

| 依赖 | 用途 |
| --- | --- |
| `uv` | Python 包管理，管理 Hermes 的运行环境 |
| Python 3.11 | Hermes 本体运行环境 |
| Node.js 22 | 部分工具（如浏览器自动化）依赖 |
| `ripgrep` | 高速文本搜索（`file` 工具集的搜索能力） |
| `ffmpeg` | 音视频处理（视讯/媒体相关工具） |

::: tip 为什么零前置依赖值得在意
手动装依赖是 Agent 工具链最常见的天坑：版本不对、PATH 不生效、各发行版包名不同。Hermes 把这一步收敛进安装脚本，保证"装完即可用"，尤其适合第一次用终端 Agent 的新手。

### 1.2 装完验证

```bash
source ~/.bashrc   # 若用 zsh 则 source ~/.zshrc
hermes doctor       # 诊断环境是否健康
```

`hermes doctor` 会逐项检查运行环境，输出绿色的 ✓ 表示就绪。看到正常的诊断结果后，直接运行 `hermes` 即可开始对话。

## 二、Windows 原生安装

Windows 用户不需要开 WSL，直接用 PowerShell 安装（PowerShell 会自动检测系统并下载合适的组件，包括便携版 Git）：

```powershell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

### 2.1 Windows 安装的三个要点

| 项目 | 说明 |
| --- | --- |
| 依赖处理 | 与 Linux 相同，自动装 uv、Python 3.11、Node.js 22、ripgrep、ffmpeg |
| PortableGit | 安装脚本会额外下载**便携版 Git**，无需自己装 Git |
| 数据位置 | 数据默认放在 `%LOCALAPPDATA%\hermes` |

安装完成后同样需要刷新环境变量再验证：

```powershell
# 重新打开一个 PowerShell 窗口（或刷新 PATH）
hermes doctor
hermes
```

::: warning 原生 Windows 与 WSL 的数据位置不同
原生 Windows 的数据目录是 `%LOCALAPPDATA%\hermes`，而 WSL/Linux 下是 `~/.hermes`。如果在两台机器间同步配置，注意路径差异。

## 三、Android（Termux）安装

手机（Termux 环境）也能跑 Hermes。安装脚本会自动检测 Termux 环境。先安装 Termux 的包管理器依赖：

```bash
pkg install python nodejs ripgrep ffmpeg uv -y
```

然后创建并激活 Python 虚拟环境，再执行官方安装脚本：

```bash
python -m venv ~/hermes-venv
source ~/hermes-venv/bin/activate
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

### 3.1 Termux 环境的特别说明

| 项目 | 说明 |
| --- | --- |
| 扩展 | 脚本自动安装 `[termux]` 扩展，适配 Termux 的环境 |
| 虚拟环境 | 用 venv 隔离 Hermes 的 Python 运行环境，避免与 Termux 自带包冲突 |
| 使用方式 | 之后通过网关（Telegram / Discord 等）使用更顺手，手机屏幕跑 TUI 体验一般 |

::: tip 手机上优先用网关入口
Termux 上跑完整 TUI 受屏幕限制体验不佳，推荐配置好消息网关后，把 Hermes 当"个人助理"挂在 Telegram 里随叫随到（见《快速入门教程》两个入口一节）。

## 四、安装后配置

### 4.1 三步走到"可用"

```bash
source ~/.bashrc      # 1. 刷新环境（zsh 用 ~/.zshrc）
hermes doctor         # 2. 诊断环境
hermes                # 3. 启动进入对话
```

### 4.2 `hermes doctor` 看什么

`hermes doctor` 会检查四类内容：

| 检查项 | 出现问题时的表现 |
| --- | --- |
| 运行时版本 | uv / Python / Node 版本不满足时报错 |
| PATH 注册 | `hermes` 命令找不到，通常是 PATH 未刷新 |
| 数据目录 | `~/.hermes`（或 `%LOCALAPPDATA%\hermes`）创建异常 |
| 模型配置 | 尚未配置模型时会提示，见《配置教程》 |

::: warning 换 shell 后记得 source
每次切换新的 shell（新窗口、新终端），如果 `hermes` 命令不存在，先 `source ~/.bashrc` 或重开终端，而不是怀疑装坏了。

## 五、更新与卸载

### 5.1 更新

```bash
hermes update
```

一条命令拉取最新版本。想确认当前版本，在 TUI 里用 `/help` 或执行 `hermes --version`（具体以官方文档为准）。

### 5.2 卸载

Hermes 没有提供官方一键卸载命令，手动删除即可：删除可执行文件（`which hermes` 定位），再删除数据目录 `~/.hermes`（Windows 为 `%LOCALAPPDATA%\hermes`）。所有数据都在数据目录内，**零遥测**，删除即彻底清除。

## 六、常见问题排查

| 问题 | 排查步骤 |
| --- | --- |
| `curl: command not found` | 系统缺少 curl，先 `apt install curl` / `brew install curl` |
| 安装脚本下载慢 / 失败 | 检查网络与代理；公司网络需在代理中放行 `hermes-agent.nousresearch.com` |
| `hermes` 命令找不到 | 重新 `source ~/.bashrc` 或重开终端；确认 PATH 已刷新 |
| 权限不足（Permission denied） | 安装脚本可能需要写入用户目录，检查当前用户对 `~` 的写权限；不要用 `sudo` 执行 |
| `hermes doctor` 报依赖缺失 | 手动补装对应依赖：uv、Python 3.11、Node.js 22、ripgrep、ffmpeg |
| Windows 下 PowerShell 提示脚本被阻止 | 以管理员身份执行 `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` 后再试 |
| 更新后行为异常 | `hermes doctor` 诊断 + 确认数据目录权限正常；必要时备份 `~/.hermes` 后重装 |

## 总结

至此你已经完成了 Hermes 的安装：Linux / macOS / WSL2 一条 curl 命令、Windows 原生用 PowerShell、Android 走 Termux，全程零前置依赖，安装脚本自动处理 uv、Python、Node、ripgrep、ffmpeg（Windows 还带便携版 Git）。装完记得 `source ~/.bashrc`、用 `hermes doctor` 做体检，再用 `hermes update` 保持最新。下一步进入《配置教程》，为你的 Hermes 接上模型提供商，让它真正开始"干活"。
