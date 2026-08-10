# 五、Kilo Code 模型配置

## 500+ 模型，零加价

Kilo Code 支持 **500+ 种 AI 模型、60+ 家提供商**，最大的卖点：

- **零加价**：只按模型提供商的原始价格计费，中间零抽成
- **无需 API Key 起步**：注册即送 $20 免费积分，还有免费的 **Kilo Auto** 模型档位
- **中途切换**：任务进行中可以随时换模型，匹配延迟、成本与推理需求
- **自动模型路由**：系统根据子任务类型自动挑选最合适的模型

## 常用提供商

| 提供商 | 适合场景 |
|--------|----------|
| Anthropic (Claude) | 复杂推理、可靠工具调用 |
| OpenAI (GPT) | 通用编程、最新技术 |
| Google (Gemini) | 超大上下文窗口 |
| 本地模型 (Ollama) | 完全隐私、零费用 |
| 其他 60+ 提供商 | 通过 Kilo Gateway 统一接入 |

## Kilo Gateway

Kilo 提供统一 API 网关，通过单一端点访问数百个 AI 模型：

- 流式响应
- BYOK（自带密钥）
- 用量追踪
- 简化的计费管理

## 模型选择建议

| 任务类型 | 推荐模型 |
|----------|----------|
| 复杂代码生成 | Claude Sonnet 4.6 / Opus 4.7 |
| 日常编码 | GPT-4o / DeepSeek |
| 大规模分析 | Gemini 3.x Pro |
| 本地开发 | Ollama + Qwen/CodeLlama |
| 性价比 | DeepSeek V3 |

## 配置方式

### 通过 Agent 配置（推荐）

在聊天气泡中输入：
```
帮我配置 Anthropic Claude Sonnet 作为默认模型
```
Agent 内置了读取和更新配置的技能，甚至可以直接说"禁用 OpenAI"、"添加我的 Ollama 端点"。

### 手动配置

编辑 `kilo.jsonc` 配置文件（项目根目录），全局配置在 `~/.config/kilo/kilo.jsonc`：

```jsonc
{
  "model": "anthropic/claude-sonnet-4-6",
  "providers": {
    "anthropic": {
      "apiKey": "your-api-key"
    }
  }
}
```

### 常用配置项

| 配置项 | 说明 |
|--------|------|
| `model` | 默认模型（`provider/model` 格式） |
| `provider` | 提供商设置（API Key、Base URL、自定义模型） |
| `mcp` | MCP 服务器配置 |
| `permission` | 工具权限：`allow` / `ask` / `deny`，支持 glob 通配 |
| `instructions` | 指令文件路径（如 `["CONTRIBUTING.md", ".cursor/rules/*.md"]`） |
| `disabled_providers` / `enabled_providers` | 控制提供商可用性 |
| `agent` | 自定义 Agent 定义（见"模式与 Agent"一章） |

环境变量可用 `{env:VARIABLE_NAME}` 语法引用。

## CLI 模型相关命令

| 命令 | 说明 |
|------|------|
| `kilo` | 启动交互会话 |
| `kilo "提示词"` | 带初始指令启动 |
| `kilo --mode architect "设计缓存层"` | 指定模式 |
| `kilo -m openai/gpt-4o "重构 utils.ts"` | 指定模型 |
| `kilo --continue` | 继续上一次会话 |
| `kilo -f src/auth.ts "审查安全"` | 附加文件 |

## 认证设置

不同的认证方式：

- **Kilo 内建提供商**：直接使用 Kilo 账户（免费额度 + Kilo Auto）
- **自有 API Key**：使用你的 Anthropic/OpenAI 等 API Key
- **本地模型**：通过 Ollama 等运行本地模型
- **Kilo Gateway**：统一接入多个模型
