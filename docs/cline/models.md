# 三、Cline 模型选择与配置

## 什么是 AI 模型

AI 模型是为 Cline 提供动力的"大脑"。你选择哪个模型直接影响 Cline 的能力、响应质量、速度和成本。Cline 不锁定任何单一厂商，你可以自由混用多家模型。

## 配置步骤

### 第 1 步：打开设置

两种方式：
- 点击 Cline 聊天界面右上角的齿轮图标（⚙️）
- 命令面板（`Cmd/Ctrl + Shift + P`）→ 输入 "Cline: Open Settings"

### 第 2 步：选择 API 提供商

| 提供商 | 特点 | 适用场景 |
|--------|------|----------|
| **Cline** | 无需 API Key，多模型访问（订阅制） | 新手入门 |
| **Anthropic** | Claude 官方，最可靠的工具调用 | 复杂编程任务 |
| **OpenRouter** | 200+ 模型统一接入，性价比高 | 多模型对比 |
| **OpenAI** | GPT 系列 | 最新技术 |
| **Google Gemini** | 大上下文窗口 | 大型项目 |
| **AWS Bedrock** | 企业级 | 团队使用 |
| **Azure / GCP Vertex** | 云厂商托管模型 | 企业合规 |
| **Ollama / LM Studio** | 本地运行 | 隐私优先 |
| **任意 OpenAI 兼容端点** | 自建或第三方服务 | 灵活接入 |

### 第 3 步：添加 API Key

如果选择 Cline 作为提供商：直接登录即可，无需 API Key。

其他提供商需要从对应平台获取 API Key：
- Anthropic：[console.anthropic.com](https://console.anthropic.com/)
- OpenRouter：[openrouter.ai/keys](https://openrouter.ai/keys)
- OpenAI：[platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Google：[aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 第 4 步：选择模型

添加 API Key 后，模型下拉菜单变为可用。

## 模型选择快速指南

| 需求 | 推荐模型 |
|------|----------|
| 最大可靠性 | Claude Sonnet 4.6 / Opus 4.7 |
| 最佳性价比 | DeepSeek V3 或 Qwen3 Coder |
| 最快速度 | Cerebras / Groq 上的推理模型 |
| 本地运行 | 任意 Ollama / LM Studio 模型 |
| 最新功能 | GPT-5 系列 |
| 超大上下文 | Gemini 3.x Pro |

## 高级配置

### 不同模式使用不同模型

Cline 支持为 **Plan 模式和 Act 模式分别配置模型**：

- Plan 模式（规划讨论）用预算模型——省钱
- Act 模式（代码实现）用高级模型——更准

### 自动审批（Auto-approve）

可按命令类型配置自动审批策略：

- 自动放行：读取文件、只读的 MCP 调用
- 手动审批：写入 / 编辑文件、执行终端命令

这样既保证效率，又把风险操作留在人工掌控中。

### 价格参考（BYOK 场景，Claude Sonnet）

| 使用强度 | 月成本估算 |
|----------|------------|
| 轻度 | ~$20/月 |
| 中度 | ~$50/月 |
| 高频重度 | ~$100/月 |

> 也可订阅 ClinePass（$9.99/月）或团队版（$20/用户/月）享受集中额度。

## 选择因素的权衡

| 因素 | 考虑事项 |
|------|----------|
| 任务复杂度 | 简单修复用预算模型；复杂重构用高级模型 |
| 预算 | $10-30/月：预算级；$30-100/月：中端；$100+/月：高级 |
| 上下文窗口 | 小型：32K-128K；中型：128K-200K；大型：400K+ |
| 响应速度 | 交互式用快速模型；后台任务可用推理模型 |
| 工具可靠性 | Claude 擅长工具调用；其他模型需自行测试 |

## 专业提示

为不同模式配置不同模型：计划讨论用预算模型（省成本），代码实现用高级模型（更准确）。
