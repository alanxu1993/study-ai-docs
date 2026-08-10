# AI 学习文档

AI 编程工具中文指南：**Claude Code · Zoo Code · Cline · Kilo Code · AI Agent** 快速入门。

基于 [VitePress](https://vitepress.dev/) 构建，附带一个 Express 后台管理 API，支持静态文档站 + 在线内容编辑。

## 技术栈

- **前端文档站**: [VitePress 1.6+](https://vitepress.dev/)（静态生成）
- **后台服务**: Express 4（提供 `/api/` 与 `/admin/` 管理接口）
- **内容**: Markdown + 本地全文搜索

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发（默认 http://localhost:5173）
npm run dev

# 构建静态站点
npm run build

# 预览构建产物（默认 http://localhost:4173）
npm run preview

# 启动后台管理服务（默认 http://localhost:3001）
npm run admin
```

## 目录结构

```text
docs/                  # 文档源文件（Markdown）
  .vitepress/          # VitePress 配置与主题
  public/              # 静态资源（logo、配图等）
server/                # Express 后台服务
assets/                # 正文配图
DEPLOY.md              # 服务器部署指南
nginx.conf             # Nginx 反向代理配置
study-ai-docs.service  # systemd 服务文件
```

## 部署

完整部署说明见 [DEPLOY.md](DEPLOY.md)，支持两种方式：

1. **纯 Node.js**：一个 Express 进程同时服务文档站和管理后台（适合小流量）
2. **Nginx + Node.js**：Nginx 直接服务静态文件，API 反向代理（生产推荐）

## License

[MIT](LICENSE)
