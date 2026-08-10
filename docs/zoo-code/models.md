# 五、Zoo Code 模型与提供商

## 支持的模型家族

Zoo Code 持续跟进最新模型，目前支持：

| 模型家族 | 代表模型 |
|----------|----------|
| **Claude** | Opus、Sonnet、Haiku 系列 |
| **GPT** | GPT-4o、GPT-5 系列 |
| **Gemini** | Gemini 2.0 / 3.x 系列 |
| **Kimi** | Kimi K2 等 |
| **GLM** | GLM-4 系列 |
| **Grok** | Grok 系列 |
| **MiniMax** | MiniMax 系列 |
| **DeepSeek** | DeepSeek V3 等 |
| **本地模型** | Ollama / LM Studio 运行的开源模型 |

## 支持的提供商

| 提供商 | 特点 |
|--------|------|
| **Zoo Gateway** | Zoo Code 官方网关，单一端点接入全部提供商，统一余额、按请求查看用量 |
| **Anthropic** | Claude 官方 API，最可靠的工具调用 |
| **OpenAI** | GPT 系列官方 API，可切换 Codex 响应速度 |
| **Moonshot** | Kimi 官方服务 |
| **Kimi Code** | 专为编程场景优化的 Kimi |
| **OpenAI 兼容** | 任意 `https://…/v1` 端点，可接入国产模型聚合服务 |
| **Kenari** | 第三方提供商 |
| **Friendli** | 高性能推理服务 |
| **OpenCode Go** | OpenCode 服务 |
| **Bedrock** | AWS 企业级 AI 服务 |
| **Vertex AI** | Google Cloud AI 平台 |
| **OpenRouter** | 统一的模型路由服务 |
| **Vercel AI Gateway** | Vercel 的 AI 网关服务 |
| **Ollama** | 本地运行开源模型 |

## 配置方式

在 Zoo Code 设置面板中：

1. 选择 API Provider
2. 填写 Base URL（OpenAI 兼容端点通常为 `https://域名/v1`）
3. 填入 API Key
4. 填写模型 ID（部分网关需要加 `provider/` 前缀，如 `anthropic/claude-sonnet-4.6`）

不同模式可配置不同的默认模型：Architect 用推理模型做规划，Code 用执行模型写代码。

## 常用配置示例

### Zoo Gateway（推荐）

Zoo Gateway 是官方的一站式网关，v3.74.0 起内置：

1. 在 [zoocode.dev/dashboard/credits](https://zoocode.dev) 充值余额
2. 在扩展中登录账号
3. 创建档案时选择 Zoo Gateway 作为提供商
4. 一个余额、一个端点，接入全部模型，按请求查看用量

### OpenAI 兼容端点（国产模型）

1. Provider 选择 **OpenAI Compatible**
2. Base URL 填入聚合服务地址（如 `https://aiwave.live/v1`）
3. 填入你的 API Key
4. 设置默认模型（如 `deepseek-v4-flash`）和代码模型（如 `qwen3-coder-480b-a35b-instruct`）

### Ollama 本地模型

1. Provider 选择 **Ollama**（默认 Base URL `http://localhost:11434`）
2. 选择模型（如 `qwen3-coder:480b`）
3. 把上下文窗口设置为**至少 32K tokens**，编码任务才够用
4. 如需使用 ollama.com 云端，启用自定义 Base URL 为 `https://ollama.com` 并填入 API Key

### GLM / 智谱

1. Provider 选择 **Z AI**
2. 选择中国编程计划端点（`https://open.bigmodel.cn/api/coding/paas/v4`）
3. 填入智谱 API Key，选择需要的 GLM 模型

## 模型选择建议

| 场景 | 推荐模型 |
|------|----------|
| 复杂编程任务 | Claude Opus / Sonnet |
| 性价比优先 | Kimi / GLM / DeepSeek |
| 本地运行 | Ollama + qwen3-coder:480b |
| 多模型对比 | OpenRouter / Zoo Gateway 统一接入 |

> **提示**：推理模型经 OpenAI 兼容网关调用时，部分场景可能出现 reasoning-content 回放导致的 400 报错，请先确认推理开关可以关闭再使用。
