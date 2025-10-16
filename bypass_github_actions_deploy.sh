#!/bin/bash

# 完全绕过GitHub Actions的部署方案
# 直接在服务器上执行部署

echo "🚀 开始完全绕过GitHub Actions的部署..."

# 1. 构建前端
echo "1. 构建前端..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败"
    exit 1
fi
echo "✅ 前端构建成功"

# 2. 创建部署脚本
echo "2. 创建服务器部署脚本..."
cd ..
cat > server_deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 开始服务器端部署..."

# 定义变量
REMOTE_DIR="/var/www/zhitoujianli"
NGINX_CONF="/etc/nginx/conf.d/zhitoujianli.conf"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "部署时间: $(date)"
echo "部署目录: $REMOTE_DIR"
echo "Nginx配置: $NGINX_CONF"

# 创建必要目录
echo "创建必要目录..."
sudo mkdir -p "$REMOTE_DIR/releases"
sudo mkdir -p "$(dirname "$NGINX_CONF")"

# 备份当前版本
if [ -L "$REMOTE_DIR/dist" ]; then
    echo "备份当前版本..."
    sudo rm -f "$REMOTE_DIR/dist_backup"
    sudo cp -P "$REMOTE_DIR/dist" "$REMOTE_DIR/dist_backup"
fi

# 部署前端文件
echo "部署前端文件..."
sudo rm -rf "$REMOTE_DIR/releases/dist_$TIMESTAMP"
sudo mv build "$REMOTE_DIR/releases/dist_$TIMESTAMP"

# 更新软链接
echo "更新软链接..."
sudo rm -rf "$REMOTE_DIR/dist"
sudo ln -s "$REMOTE_DIR/releases/dist_$TIMESTAMP" "$REMOTE_DIR/dist"

# 更新Nginx配置
echo "更新Nginx配置..."
sudo cp zhitoujianli.conf "$NGINX_CONF"
sudo chown root:root "$NGINX_CONF"
sudo chmod 644 "$NGINX_CONF"

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
sleep 5
curl -fsSIL https://www.zhitoujianli.com/register
if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
else
    echo "❌ 健康检查失败"
    exit 1
fi

# 清理旧版本（保留最近3个）
echo "清理旧版本..."
cd "$REMOTE_DIR/releases"
ls -1dt dist_* | tail -n +4 | xargs -r sudo rm -rf

echo "🎉 服务器端部署完成！"
EOF

# 3. 创建部署包
echo "3. 创建部署包..."
mkdir -p deploy_package
cp -r frontend/build deploy_package/
cp deploy/nginx/zhitoujianli.conf deploy_package/
cp server_deploy.sh deploy_package/
tar -czf final_deploy_package.tar.gz -C deploy_package .

# 4. 显示部署信息
echo "4. 部署包已创建: final_deploy_package.tar.gz"
echo "文件大小: $(du -h final_deploy_package.tar.gz | cut -f1)"
echo ""
echo "📋 服务器部署步骤："
echo "1. 将 final_deploy_package.tar.gz 上传到服务器"
echo "2. 在服务器上执行："
echo ""
echo "   # 解压部署包"
echo "   tar -xzf final_deploy_package.tar.gz"
echo ""
echo "   # 给部署脚本添加执行权限"
echo "   chmod +x server_deploy.sh"
echo ""
echo "   # 执行部署"
echo "   ./server_deploy.sh"
echo ""
echo "✅ 部署包准备完成！"
echo "这个方案完全绕过GitHub Actions，直接在服务器上执行部署。"
