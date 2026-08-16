# Codex 完整教程

> 来源：[OpenAI Codex 官方文档](https://developers.openai.com/codex) · [ChatGPT Learn](https://learn.chatgpt.com/docs) — 基于官方资料与社区最佳实践整理

## 教程简介

**Codex** 是 OpenAI 推出的终端原生 AI 编程代理（Agent）。2025 年，OpenAI 将最初的 Codex 模型演进为完整的编程 Agent 体系：云版本 Codex（运行在云端沙箱）+ 开源的 Codex CLI（`@openai/codex`，Rust 实现）。Codex 支持 AGENTS.md 项目指令、config.toml 配置、Hooks 生命周期钩子、MCP 外部工具、Skills 技能、Plugins 插件、Subagents 子代理、记忆系统等完整能力，与 Claude Code、Cursor、Windsurf 等共同遵循 AGENTS.md 跨工具标准。

本教程共 15 篇，涵盖从安装配置到高级定制的完整内容，所有配置均可直接复制使用。

## 教程目录

### 基础配置

1. [基础配置教程](./codex-basic-config) — 安装、config.toml、模型与授权
2. [高级配置教程](./codex-advanced-config) — 特性开关、Profiles、沙箱与安全
3. [提示词使用教程](./codex-prompts) — 提示词工程与上下文管理

### 核心功能

4. [Hooks 使用教程](./codex-hooks) — 生命周期钩子自动化
5. [MCP 全流程使用教程](./codex-mcp) — Model Context Protocol 接入
6. [Skills 使用教程](./codex-skills) — 可复用工作流技能
7. [Plugins 使用教程](./codex-plugins) — 插件安装与打包分发

### 进阶能力

8. [Rules 使用教程](./codex-rules) — 规则体系与指令约束
9. [Subagent 实用教程](./codex-subagent) — 多代理并行协作
10. [记忆功能使用教程](./codex-memory) — 跨会话记忆与上下文延续
11. [AGENTS 加载指令详解](./codex-agents-md) — AGENTS.md 深度解析

### 实战与优化

12. [官方工作流指南](./codex-workflows) — 官方推荐工作流
13. [项目定制化教程](./codex-customization) — 按项目定制 Codex
14. [示例配置教程](./codex-examples) — 完整示例配置合集
15. [最佳实践](./codex-best-practices) — 高效使用经验总结

## 适合人群

- 想用 OpenAI 模型进行 AI 编程的开发者
- Claude Code 用户希望对比/迁移到 Codex
- 关注 AGENTS.md 跨工具标准与多 Agent 协作的工程师
- 希望打造个人 AI 编程工作流的开发者

::: tip 学习建议
建议按目录顺序阅读。先在基础配置篇完成安装与授权，再逐步叠加 Hooks、MCP、Skills 等能力。AGENTS.md 是 Codex 的灵魂，强烈建议优先阅读第十一篇。
:::
