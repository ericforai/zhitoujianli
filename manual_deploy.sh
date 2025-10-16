#!/bin/bash

# 手动部署脚本 - 绕过GitHub Actions
# 直接在服务器上执行部署

echo "🚀 开始手动部署到生产环境..."

# 配置变量
SERVER_HOST="115.190.182.95"
SERVER_USER="root"
REMOTE_DIR="/var/www/zhitoujianli"
NGINX_CONF="/etc/nginx/conf.d/zhitoujianli.conf"

# 1. 构建前端
echo "1. 构建前端..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败"
    exit 1
fi
echo "✅ 前端构建成功"

# 2. 准备部署文件
echo "2. 准备部署文件..."
cd ..
mkdir -p deploy_temp
cp -r frontend/build deploy_temp/
cp deploy/nginx/zhitoujianli.conf deploy_temp/

# 3. 上传到服务器
echo "3. 上传文件到服务器..."
scp -r deploy_temp/* $SERVER_USER@$SERVER_HOST:/tmp/deploy/

# 4. 在服务器上执行部署
echo "4. 在服务器上执行部署..."
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
set -e

# 定义变量
REMOTE_DIR="/var/www/zhitoujianli"
NGINX_CONF="/etc/nginx/conf.d/zhitoujianli.conf"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "开始服务器端部署..."

# 创建必要目录
sudo mkdir -p $REMOTE_DIR/releases
sudo mkdir -p $(dirname $NGINX_CONF)

# 备份当前版本
if [ -L "$REMOTE_DIR/dist" ]; then
    echo "备份当前版本..."
    sudo rm -f "$REMOTE_DIR/dist_backup"
    sudo cp -P "$REMOTE_DIR/dist" "$REMOTE_DIR/dist_backup"
fi

# 部署新版本
echo "部署新版本..."
sudo rm -rf "$REMOTE_DIR/releases/dist_$TIMESTAMP"
sudo mv /tmp/deploy/build "$REMOTE_DIR/releases/dist_$TIMESTAMP"

# 更新软链接
echo "更新软链接..."
sudo rm -rf "$REMOTE_DIR/dist"
sudo ln -s "$REMOTE_DIR/releases/dist_$TIMESTAMP" "$REMOTE_DIR/dist"

# 更新Nginx配置
echo "更新Nginx配置..."
sudo cp /tmp/deploy/zhitoujianli.conf $NGINX_CONF
sudo chown root:root $NGINX_CONF
sudo chmod 644 $NGINX_CONF

# 测试Nginx配置
echo "测试Nginx配置..."
sudo nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Nginx配置测试失败"
    exit 1
fi

# 重载Nginx
echo "重载Nginx..."
sudo systemctl reload nginx

# 健康检查
echo "健康检查..."
curl -fsSIL https://www.zhitoujianli.com/register
if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
else
    echo "❌ 健康检查失败"
    exit 1
fi

# 清理旧版本（保留最近3个）
echo "清理旧版本..."
cd $REMOTE_DIR/releases
ls -1dt dist_* | tail -n +4 | xargs -r sudo rm -rf

echo "🎉 手动部署完成！"
EOF

# 5. 清理本地临时文件
echo "5. 清理临时文件..."
rm -rf deploy_temp

echo "✅ 手动部署完成！"
echo "请访问: https://www.zhitoujianli.com/register"
