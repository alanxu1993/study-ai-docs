# 二、Cline 安装教程

## VS Code / Cursor 安装

安装只需不到 2 分钟。

**步骤：**

1. 打开 VS Code，按下 `Ctrl/Cmd + Shift + X`
2. 搜索 **Cline**
3. 点击 **安装**
4. 重启 VS Code 后，点击活动栏中的 Cline 图标打开

**如果图标不显示**：使用命令面板 `Ctrl/Cmd + Shift + P` → 输入 `Cline: Open In New Tab`。

## JetBrains IDE 安装

支持 IntelliJ、PyCharm、WebStorm、GoLand 等。

**方式一：IDE 内安装（推荐）**

1. 打开设置（`Ctrl+Alt+S` / `Cmd+,`）
2. 导航到 **插件 → 市场** 标签页
3. 搜索 **Cline** → 安装
4. 重启 IDE

**方式二：浏览器安装**

1. 访问 [JetBrains 市场](https://plugins.jetbrains.com/plugin/28247-cline)
2. 点击"安装到 IDE"
3. 在弹出的 IDE 对话框中确认

**方式三：手动安装**

1. 从市场页面下载插件 `.zip` 文件
2. 打开设置 → 插件 → 齿轮图标 → 从磁盘安装插件
3. 选择下载的文件 → 重启

安装完成后在 **查看 → 工具窗口 → Cline** 中打开。

## Cline CLI 安装

在终端中使用 Cline，适合脚本、定时任务和 CI 流水线：

```bash
npm i -g cline
```

运行 `cline "你的任务"` 即可开始会话。完全无人值守模式可接入 CI/CD，管道输入、JSON 输出。

## SDK 安装

用 Cline 的引擎构建自己的 Agent：

```bash
npm install @cline/sdk
```

## VSCodium / Windsurf 安装

这些编辑器使用 Open VSX Registry：

1. 打开扩展视图（`Ctrl/Cmd + Shift + X`）
2. 搜索 **Cline**
3. 选择 saoudrizwan 发布的版本 → 安装

## 安装后第一步：登录

1. 打开 Cline 界面
2. 点击 **注册** 按钮
3. 在 [app.cline.bot](https://app.cline.bot) 完成认证
4. 自动返回编辑器，即可开始使用

> 不登录也可以使用：通过设置页选择自己的 API Key（BYOK），直接用 Claude / GPT / Gemini / Ollama 等提供商。

---

## 常见安装问题

| 问题 | 解决方法 |
|------|----------|
| 搜不到扩展 | 确认在"市场"标签页搜索，不是"已安装" |
| 安装失败 | 重启编辑器重试；检查网络；尝试 VSIX 安装 |
| 图标不显示 | 完全重启编辑器；检查扩展是否已启用 |
| 扩展未生效 | 安装后重启；检查控制台错误；禁用再启用 |
