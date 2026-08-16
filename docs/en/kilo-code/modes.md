# 三、Kilo Code 模式与 Agent

## Agent 模式

Kilo 使用专门的 Agent 来处理不同类型的任务，你可以随时切换，也可以构建自定义 Agent：

| Agent 模式 | 用途 | 典型场景 |
|------------|------|----------|
| **Code** | 日常编码和文件操作（默认） | 写功能、修改代码 |
| **Plan** | 任务规划和架构设计 | 写代码前先出设计方案 |
| **Ask** | 问答和代码解释 | 查询、学习、理解代码 |
| **Debug** | 调试和问题追踪 | Bug 定位、错误分析 |
| **Review** | 代码审查 | 检查变更中的性能、安全、风格、测试覆盖问题 |

## 多模式工作流（Multi Mode）

Kilo 把"规划—执行—调试"拆成独立模式，推荐流程：

1. **Plan（Architect）**：给出高层需求，让 Agent 出方案、写计划
2. **审批计划**：确认方案后切换模式
3. **Code（Coder）**：让 Agent 按计划执行，生成代码
4. **Debug（Debugger）**：出现问题切换到调试模式
5. **Review**：审查变更质量

一个典型示例：用自然语言描述一个带表单校验的 React 功能，Kilo 会直接生成完整文件，运行命令自测，并在出错时自动修复。

## 任务编排（Orchestrator）

复杂的任务会自动拆解执行：

- 将复杂任务拆解为子任务，路由给专职子代理（subagent）
- 协调多个子任务并行或串行执行
- 管理任务依赖关系
- 处理错误恢复
- **并行 Agent**：支持基于 git worktree 的隔离并行任务

## Context Mentions（上下文提及）

通过 @符号引用上下文，与 Cline 类似：

- `@file`：引用特定文件
- `@folder`：引用目录
- `@function`：引用函数或符号

## 内置子代理

| 子代理 | 说明 |
|--------|------|
| **general** | 通用子代理，处理复杂问题和多步骤任务，完整工具权限 |
| **explore** | 只读探索子代理，快速扫描代码库，不能修改文件 |

## 自定义 Agent / 子代理

Kilo 支持用三种方式构建自己的 Agent（每个 Agent 可独立配置提示词、模型、工具权限）：

**方式一：`kilo.jsonc` 配置**

在配置文件中添加 `agent` 字段：

```json
{
  "$schema": "https://app.kilo.ai/config.json",
  "agent": {
    "code-reviewer": {
      "description": "审查代码质量与潜在问题",
      "mode": "subagent",
      "model": "anthropic/claude-sonnet-4-6",
      "prompt": "你是资深代码审查员，重点检查安全、性能与可维护性。"
    }
  }
}
```

**方式二：Markdown 文件（推荐长提示词）**

在 `.kilo/agents/` 目录（全局为 `~/.config/kilo/agents/`）放置带 YAML frontmatter 的 `.md` 文件，文件名即 Agent 名：

```markdown
---
description: 审查代码质量
mode: subagent
model: anthropic/claude-sonnet-4-6
temperature: 0.1
permission:
  edit: deny
  bash: deny
---
你是资深代码审查员，请从代码质量、潜在 Bug、性能、安全四个维度分析。
```

**方式三：交互式命令**

```bash
kilo agent create --description "审查安全漏洞" --mode subagent
```

### 关键属性

| 属性 | 说明 |
|------|------|
| `mode` | `primary`（Tab 切换直接对话）/ `subagent`（只能被委派或 @提及）/ `all` |
| `model` | 固定模型（provider/model 格式） |
| `prompt` | 系统提示词（Markdown 正文） |
| `permission` | 工具级权限覆盖（如 `edit: deny`、`bash: deny`） |
| `color` | 选择器 UI 中的颜色 |
| `steps` | 最大代理迭代次数 |

## Model Selection

每个 Agent 模式可配置不同的 AI 模型：

- Code 使用高级模型（准确）
- Ask 使用快速模型（效率）
- Plan 使用推理模型（深度）
- Debug 使用可靠模型（稳定）

Kilo 还支持**自动模型路由**：根据子任务类型自动挑选最合适的模型。
