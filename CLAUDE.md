# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
npm run dev       # 本地开发文档站（默认 http://localhost:5173）
npm run build     # 构建 VitePress 静态站点
npm run preview   # 预览构建产物（默认 http://localhost:4173）
npm run admin     # 启动 Express 后台管理服务（默认 http://localhost:3001）
npm run start     # 构建 + 启动生产服务（静态文件 + 后台 API）
```

## 项目架构

一个中文 AI 编程工具教程文档站点，包含两大部分：

### 1. 前端文档站 — VitePress

- 配置位于 [docs/.vitepress/config.ts](docs/.vitepress/config.ts)
- 自定义主题位于 [docs/.vitepress/theme/](docs/.vitepress/theme/)（哑光岩黑 + 亚光白工程师风格）
- 支持本地全文搜索（`provider: 'local'`）
- Markdown 源文件按产品分目录组织：
  - `docs/claude-code/` — Claude Code 教程（17 篇文章）
  - `docs/codex/` — Codex 教程
  - `docs/hermes/` — Hermes Agent 教程
  - `docs/zoo-code/` — Zoo Code 教程
  - `docs/cline/` — Cline 教程
  - `docs/kilo-code/` — Kilo Code 教程
  - `docs/ai-agent/` — AI Agent 入门教程（7 章）
  - `docs/agent-dev/` — Agent 开发教程

### 2. 后台管理 API — Express 4

- 服务入口 [server/index.js](server/index.js)
- 提供 RESTful API 读写 Markdown 文件：
  - `GET /api/files` — 获取所有 Markdown 文件列表（递归目录树）
  - `GET /api/files/*` — 读取单个文件
  - `POST /api/files/*` — 保存文件（带备份恢复机制）
- 安全校验：防目录遍历攻击，只允许操作 `.md` 文件
- 管理页面位于 `docs/admin/index.html`（纯前端 SPA，含 Markdown 编辑器 + 预览 + 暗色模式）

### 部署

- 生产推荐：Nginx 服务静态文件 + Node.js 处理 API 请求
- 进程管理使用 PM2（配置见 [ecosystem.config.json](ecosystem.config.json)）
- 部署详情见 [DEPLOY.md](DEPLOY.md)

### 其他文件

- `assets/` — 教程正文配图（AI Agent 相关插图 PNG）
- `nginx.conf` — 生产环境 Nginx 反向代理配置
- `study-ai-docs.service` — systemd 服务文件
- `fix_tags.py` — 标签修复脚本