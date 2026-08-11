#!/bin/bash
echo "=== Alan的AI世界 - 重启脚本 ==="

# 进入项目目录
cd "$(dirname "$0")" || exit 1

# 构建 VitePress 静态站点
echo "→ 构建静态站点..."
npm run build

# 杀掉 3001 端口旧进程
fuser -k 3001/tcp 2>/dev/null
sleep 1

# 启动服务（后台运行，绑定 0.0.0.0）
nohup node server/index.js > /dev/null 2>&1 &

echo "✓ 服务已启动: http://0.0.0.0:3001"