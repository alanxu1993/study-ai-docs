# Hermes Agent 完整教程

> 来源：[Hermes Agent 官方文档](https://hermes-agent.nousresearch.com/docs/zh-Hans/) · [GitHub: NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 基于官方文档（含官方中文翻译）整理

## 教程简介

**Hermes Agent** 是 Nous Research 于 2026 年 2 月发布的开源（MIT 协议）自进化 AI 代理框架。它提供终端 TUI 与消息网关两种入口，支持 20+ 消息平台（Telegram、Discord、Slack、微信、钉钉、飞书等）、6 种终端后端（本地、Docker、SSH、Modal、Daytona、Singularity）、70+ 内置工具，并具备持久记忆、自进化技能、cron 定时任务、子代理委派、电脑操控（Computer Use）等完整能力。

Hermes Agent 核心特色是**自进化闭环**：它会在完成任务后自动沉淀经验为技能（Skills）与记忆，越用越懂你。支持任何 LLM 提供商（Nous Portal、OpenRouter、Anthropic、OpenAI、DeepSeek 等），模型需支持 64K+ 上下文。

本教程共 16 篇，从安装入门到高级定制全面覆盖。

## 教程目录

### 入门与安装

1. [快速入门教程](./hermes-quick-start) — 第一次对话与核心体验
2. [安装教程](./hermes-install) — Linux / macOS / Windows 安装
3. [配置教程](./hermes-config) — 模型、提供商与配置项

### 核心功能

4. [工具使用教程](./hermes-tools) — 70+ 内置工具与工具集
5. [会话使用教程](./hermes-sessions) — 交互式会话与续传
6. [SubAgent 子代理](./hermes-subagent) — 任务委派与并行执行
7. [插件使用教程](./hermes-plugins) — 插件系统与扩展

### 进阶能力

8. [Hooks 钩子教程](./hermes-hooks) — 生命周期钩子
9. [Profiles 多实例配置教程](./hermes-profiles) — 一台机器跑多个 Agent
10. [cron 定时任务使用教程](./hermes-cron) — 定时自动化任务
11. [代码工具使用教程](./hermes-code-tools) — 代码执行与工程操作
12. [电脑操控使用教程](./hermes-computer-use) — 桌面自动化与浏览器控制

### 生态与实战

13. [接入 Claude Code 教程](./hermes-claude-code) — 与 Claude Code 协同
14. [记忆使用教程](./hermes-memory) — 持久记忆系统
15. [代理上下文使用教程](./hermes-context) — SOUL.md 与上下文文件
16. [代理技能使用教程](./hermes-skills) — 自进化技能体系

## 适合人群

- 想要免费开源 AI Agent 替代 Claude Code 的开发者
- 需要 Telegram/Discord/微信等消息平台接入的用户
- 想体验"自进化 Agent"（Agent 自己写技能、沉淀记忆）的爱好者
- 多 Agent 协作、定时任务、电脑操控自动化场景的开发者

::: tip 学习建议
建议先完成快速入门篇，获得一次干净的对话体验后，再按需叠加 Profiles、cron、电脑操控等高级功能。官方提供完整中文文档，可配合查阅。
:::
