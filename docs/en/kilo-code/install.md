# 二、Kilo Code 安装教程

## VS Code 安装（推荐）

**步骤：**

1. 打开 VS Code
2. 进入扩展视图（`Ctrl+Shift+X` / `Cmd+Shift+X`）
3. 搜索 **Kilo Code**（或直接点击 [VS Code Marketplace 页面](https://marketplace.visualstudio.com/items?itemName=kilocode.Kilo-Code)）
4. 点击 **安装**，创建账号后即可使用 500+ 模型

> 使用公共电脑或不方便装扩展时，也可以用 [Cloud Agent](https://app.kilo.ai/cloud) 直接在浏览器里运行 Kilo，无需本地机器。

### 通过 VSIX 手动安装

如果需要直接下载安装 VSIX 文件：

1. 从 [GitHub Releases](https://github.com/Kilo-Org/kilocode/releases) 下载 `kilo-vscode-*.vsix` 文件
2. 打开 VS Code 扩展视图
3. 点击"..."菜单 → 选择"从 VSIX 安装..."
4. 浏览选择下载的 `.vsix` 文件

**回退到旧版本：**

1. 从对应的 GitHub Release 下载旧版 `.vsix`
2. 使用"从 VSIX 安装..."安装
3. 可能需要暂时禁用扩展自动更新

## JetBrains 安装

支持 IntelliJ、PyCharm、WebStorm 等：

1. 访问 [JetBrains Marketplace 插件页](https://plugins.jetbrains.com/plugin/28350-kilo-code)
2. 或直接在 IDE 内 **Settings → Plugins** 搜索 **Kilo Code** 安装

## CLI 安装

在终端中使用 Kilo，适合脚本、自动化与 CI/CD：

```bash
# npm
npm install -g @kilocode/cli

# curl
curl -fsSL https://kilo.ai/cli/install | bash

# Homebrew (macOS / Linux)
brew install Kilo-Org/tap/kilo
```

安装后在项目目录运行 `kilo` 即可开始会话。

> Kilo CLI 与 VS Code 扩展共享同一引擎和磁盘配置，两者工作流完全一致。

## Open VSX Registry 安装

用于不能访问 VS Code Marketplace 的编辑器（VSCodium、Gitpod、Eclipse Theia、Windsurf 等）：

1. 打开编辑器扩展视图
2. 搜索 **Kilo Code**
3. 安装并重新加载编辑器

## 安装后配置

### Windows 用户注意事项

确保 PowerShell 在 PATH 中：

1. 打开"编辑系统环境变量" → "环境变量"
2. 在系统变量中编辑 Path → 新增
3. 添加：`C:\Windows\System32\WindowsPowerShell\v1.0\`
4. 重启 VS Code

## 常见问题

| 问题 | 解决方法 |
|------|----------|
| 扩展不显示 | 重启编辑器；检查扩展是否启用 |
| 安装问题 | 检查网络；确保 VS Code 1.84.0+ |
| 功能异常 | 查看 Output 面板日志（View → Output → Kilo Code） |

## 下一步

安装完成后：
1. [设置认证](/en/kilo-code/models) 配置 AI 提供商
2. [运行第一个任务](/en/kilo-code/modes) 学习与 Kilo 对话完成任务
