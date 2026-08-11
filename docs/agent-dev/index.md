# Agent 开发教程

> 来源：综合 Anthropic / OpenAI / LangChain / Microsoft AutoGen / CrewAI 官方指南与社区最佳实践整理

## 教程简介

在 Claude Code、Codex、Hermes Agent 等**消费级 Agent 工具**之外，越来越多的团队需要自己**开发 Agent 应用**——设计 LLM 循环、编写工具函数、构建记忆系统、编排多 Agent 协作，并部署到生产环境。本教程面向想要从"使用 Agent"进阶到"开发 Agent"的工程师。

本教程共 11 章，从开发环境搭建到生产级最佳实践，覆盖 Agent 开发全链路。

## 教程目录

| # | 章节 | 说明 |
| --- | --- | --- |
| 一 | [开发环境搭建](./agent-dev-env) | 工具链、LLM API、开发框架初始化 |
| 二 | [提示词与 Agent 设计](./agent-dev-prompt) | 系统提示词、Agent 人格与目标设计 |
| 三 | [工具调用与函数设计](./agent-dev-tools) | Function Calling、工具 Schema 与错误处理 |
| 四 | [记忆与状态管理](./agent-dev-memory) | 短期记忆、长期记忆、向量数据库 |
| 五 | [Agent 框架选型与对比](./agent-dev-frameworks) | LangGraph / AutoGen / CrewAI 等对比 |
| 六 | [多 Agent 协作与编排](./agent-dev-multi-agent) | 编排模式、通信协议（A2A） |
| 七 | [MCP 协议与 Agent 工具](./agent-dev-mcp) | 标准工具接入协议 |
| 八 | [测试与评估体系](./agent-dev-eval) | 评估集、Eval、回归测试 |
| 九 | [部署与运维](./agent-dev-deploy) | 服务化、监控、日志 |
| 十 | [安全与治理](./agent-dev-security) | 越权、注入、沙箱与合规 |
| 十一 | [Agent 开发最佳实践](./agent-dev-best-practices) | 生产级经验总结 |

## 适合人群

- 已熟练使用 Claude Code / Codex / Hermes 等 Agent 工具的开发者
- 需要构建自有 Agent 产品的工程师与团队
- 想深入理解 Agent 内部机制（工具调用、记忆、多 Agent）的学习者

::: tip 学习建议
建议先阅读 [AI Agent 入门教程](/ai-agent/) 建立基础认知，再按顺序完成本教程。每章都配有可直接运行的代码示例。
:::
