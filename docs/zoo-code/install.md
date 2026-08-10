# 二、Zoo Code 安装教程

## 方式一：VS Code Marketplace 安装（推荐）

直接通过 VS Code 扩展市场搜索安装：

1. 打开 VS Code，按下 `Ctrl + Shift + X` 打开扩展视图
2. 搜索 **Zoo Code**
3. 选择 `ZooCodeOrganization.zoo-code` 并点击安装
4. 安装完成后，侧边栏会出现 Zoo Code 图标，点击即可打开扩展面板

或者直接访问 [VS Code Marketplace 页面](https://marketplace.visualstudio.com/items?itemName=ZooCodeOrganization.zoo-code)。

## 方式二：从源码构建安装

### 前置要求

- Node.js v22 LTS（22.23.1）
- pnpm 包管理器

### 步骤

**1. 克隆仓库：**

```bash
git clone https://github.com/Zoo-Code-Org/Zoo-Code.git
cd Zoo-Code
```

**2. 安装依赖：**

```bash
pnpm install
```

**3. 运行扩展（三种方式）：**

**① 开发模式（F5）**

在 VS Code 中按 `F5`（或 Run → Start Debugging），会打开一个带有 Zoo Code 扩展运行的独立窗口。Webview 变更即时生效，核心扩展变更自动热重载。

**② 自动化 VSIX 安装**

```bash
pnpm install:vsix [-y] [--editor=<command>]
```

- `-y`：跳过所有确认提示
- `--editor=<command>`：指定编辑器（如 `--editor=cursor`）

该命令自动卸载旧版本、构建 VSIX、安装并提示重启。

**③ 手动 VSIX 安装**

```bash
# 构建 VSIX 包
pnpm vsix
# 生成文件在 bin/ 目录：bin/zoo-code-<version>.vsix

# 手动安装
code --install-extension bin/zoo-code-<version>.vsix
```

## 从 Roo Code 迁移

如果你之前使用 Roo Code，迁移非常简单，[官方迁移指南](https://docs.zoocode.dev/roo-to-zoo-migration)推荐以下步骤：

1. 在 Roo Code 中导出设置：**Settings → About Roo Code → Export Settings**
2. 安装 Zoo Code 扩展
3. 在 Zoo Code 设置中导入：**Settings → About Zoo Code → Manage Settings**，选择刚才导出的文件
4. 卸载 Roo Code

两个扩展使用相同的配置格式，设置、自定义模式、MCP 服务器都能完整迁移。社区通过 Discord 和 Reddit 提供迁移支持。

## 配置模型提供商

安装完成后，打开 Zoo Code 设置面板（点击面板右上角齿轮图标，或通过命令面板 `Ctrl+Shift+P` → "ZooCode: Open Settings"）：

1. 选择 **API Provider**（如 Zoo Gateway、Anthropic、OpenAI、Ollama 等）
2. 填写 **Base URL**（部分提供商需要）
3. 填入 **API Key**（BYOK，自带密钥）
4. 选择 **模型 ID**（部分网关需要在前面加提供商前缀，如 `anthropic/claude-sonnet-4.6`）
5. 保存后即可开始使用

> **提示**：可创建多个**提供商档案（Provider Profile）**，分别用于工作、个人等不同场景，一键切换。

### 推荐模型

| 场景 | 推荐模型 |
|------|----------|
| 复杂编程任务 | Claude Opus / Sonnet |
| 高性价比 | qwen3-coder、DeepSeek V3 |
| 本地运行 | Ollama + qwen3-coder:480b |
| 多模型统一接入 | Zoo Gateway / OpenRouter |

## 安装后建议

1. 配置 AI 模型服务商和 API Key
2. 选择合适的工作模式（Code / Architect 等）
3. 根据项目需求设置自定义规则和 MCP 服务器
4. 如需团队标准化，可在项目根目录创建 `.roomodes` 文件定义自定义 Agent
