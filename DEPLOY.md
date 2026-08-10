# 服务器部署指南

本项目包含两部分：VitePress 静态文档站 + Express 后台管理 API。部署方式有两种，按需选择。

---

## 前置条件

服务器需要 Node.js 18+ 和 npm。推荐 Ubuntu 22.04 / CentOS 8+。

```bash
# 安装 Node.js（使用 NodeSource 源）
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install -y nodejs

# 验证
node -v   # v22.x
npm -v    # 10.x
```

---

## 方式一：纯 Node.js 部署（最简单）

整个站点和后台管理都由 Express 一个进程服务，适合小流量或个人使用。

### 1. 上传项目到服务器

```bash
# 把整个 study-ai-docs 目录传到服务器
scp -r study-ai-docs user@your-server.com:/opt/

# 或者用 git
cd /opt
git clone <你的仓库地址> study-ai-docs
```

### 2. 安装依赖并构建

```bash
cd /opt/study-ai-docs
npm install
npm run build
```

### 3. 启动服务

```bash
# 直接前台运行（测试用）
node server/index.js

# 看到输出：
#   📚 AI 学习文档 - 生产模式
#   文档站:  http://localhost:3001/
#   后台管理: http://localhost:3001/admin/

# 测试访问
curl http://localhost:3001/
curl http://localhost:3001/admin/
```

现在可以通过 `http://你的服务器IP:3001` 访问了。如果服务器有防火墙，需要开放 3001 端口。

### 4. 使用 PM2 守护进程（保持后台运行）

```bash
# 安装 PM2
npm install -g pm2

# 使用项目自带的 ecosystem 配置启动
cd /opt/study-ai-docs
pm2 start ecosystem.config.json

# 设置开机自启
pm2 save
pm2 startup

# 常用命令
pm2 status              # 查看状态
pm2 logs study-ai-docs  # 查看日志
pm2 restart study-ai-docs  # 重启
pm2 stop study-ai-docs     # 停止
```

---

## 方式二：Nginx + Node.js 部署（生产推荐）

Nginx 直接服务静态文件（更快），API 请求反向代理到 Node.js。适合高并发、有域名的场景。

### 1. 安装 Nginx

```bash
sudo apt install -y nginx
```

### 2. 部署项目（同上）

```bash
cd /opt/study-ai-docs
npm install
npm run build
```

### 3. 配置 Nginx

```bash
# 复制项目中的 nginx.conf
sudo cp nginx.conf /etc/nginx/sites-available/study-ai-docs

# 修改 server_name 为你的域名或 IP
sudo nano /etc/nginx/sites-available/study-ai-docs
# 把 your-domain.com 改成你的域名

# 启用站点
sudo ln -s /etc/nginx/sites-available/study-ai-docs /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载
sudo nginx -s reload
```

### 4. 启动 Node.js 后台

```bash
# 用 PM2 启动后台管理服务（只需要 Node.js 跑 API，静态文件由 Nginx 处理）
pm2 start ecosystem.config.json
pm2 save
```

### 5. 配置 HTTPS（Let's Encrypt 免费证书）

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# 证书会自动续期，不需要手动操作
```

---

## 日常维护

### 更新内容

通过后台管理界面编辑即可，保存后生效（无需重启）。

地址：`http://你的域名/admin/`

### 重新构建（修改了配置或主题后）

```bash
cd /opt/study-ai-docs
npm run build        # 重新生成静态文件
pm2 restart study-ai-docs  # 重启后台服务
```

### 备份

```bash
# 只备份 Markdown 内容（最小备份）
tar -czf docs-backup-$(date +%Y%m%d).tar.gz docs/*.md docs/**/*.md

# 完整备份整个项目
tar -czf full-backup-$(date +%Y%m%d).tar.gz /opt/study-ai-docs
```

### 监控

```bash
# PM2 自带监控
pm2 monit

# 查看内存/CPU 占用
pm2 status
```

---

## 故障排查

| 问题 | 检查命令 |
|------|----------|
| 端口占用 | `sudo lsof -i :3001` |
| Node.js 是否运行 | `pm2 status` |
| Nginx 状态 | `sudo nginx -t && sudo systemctl status nginx` |
| 日志 | `pm2 logs study-ai-docs` |
| 文件权限 | `ls -la /opt/study-ai-docs/docs/` |
| 防火墙 | `sudo ufw status` |

### 如果构建时内存不足

```bash
# 增加 Node.js 内存限制后构建
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

## 端口与目录一览

| 项目 | 路径 |
|------|------|
| 项目根目录 | `/opt/study-ai-docs` |
| Markdown 源文件 | `/opt/study-ai-docs/docs/` |
| 构建产物 | `/opt/study-ai-docs/docs/.vitepress/dist/` |
| 后台管理页面 | `/opt/study-ai-docs/docs/admin/` |
| Express 服务 | `/opt/study-ai-docs/server/index.js` |
| 默认端口 | `3001` |
