#!/bin/bash
# 火山云服务器 - Blog重新部署脚本
# 在火山云服务器上执行此脚本

set -e

echo "========================================="
echo "  智投简历 - Blog重新部署 (火山云)"
echo "========================================="
echo ""

# 检查是否在项目目录
if [ ! -f "volcano-deployment.yml" ]; then
    echo "错误: 请在项目根目录 /root/zhitoujianli 执行此脚本"
    exit 1
fi

# 1. 重新构建blog
echo "[1/5] 正在构建blog..."
cd blog/zhitoujianli-blog
npm run build
cd ../..
echo "✓ Blog构建完成"
echo ""

# 2. 停止现有blog服务
echo "[2/5] 停止现有blog服务..."
docker compose -f volcano-deployment.yml stop blog
echo "✓ Blog服务已停止"
echo ""

# 3. 重新构建并启动blog容器
echo "[3/5] 重新构建blog容器..."
docker compose -f volcano-deployment.yml up -d --build blog
echo "✓ Blog容器已启动"
echo ""

# 4. 重启nginx（更新代理配置）
echo "[4/5] 重启Nginx服务..."
docker compose -f volcano-deployment.yml restart nginx
echo "✓ Nginx已重启"
echo ""

# 5. 等待服务启动
echo "[5/5] 等待服务启动..."
sleep 10

# 查看服务状态
echo ""
echo "========================================="
echo "  服务状态"
echo "========================================="
docker compose -f volcano-deployment.yml ps | grep -E "blog|nginx"
echo ""

# 测试blog访问
echo "========================================="
echo "  测试Blog访问"
echo "========================================="
echo "测试内部端口 4321:"
curl -I http://localhost:4321 2>&1 | head -5
echo ""

echo "测试外网访问:"
curl -I https://www.zhitoujianli.com/blog/ 2>&1 | head -5
echo ""

echo "========================================="
echo "  部署完成！"
echo "========================================="
echo ""
echo "Blog访问地址:"
echo "  - https://www.zhitoujianli.com/blog/"
echo "  - https://blog.zhitoujianli.com (如已配置DNS)"
echo ""
echo "查看日志:"
echo "  docker compose -f volcano-deployment.yml logs -f blog"
echo ""

