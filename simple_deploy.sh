#!/bin/bash

# 简化版手动部署脚本 - 使用rsync
# 绕过SSH密钥验证问题

echo "🚀 开始简化版手动部署..."

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

# 3. 创建部署包
echo "3. 创建部署包..."
tar -czf deploy_package.tar.gz -C deploy_temp .

# 4. 显示部署信息
echo "4. 部署包已创建: deploy_package.tar.gz"
echo "文件大小: $(du -h deploy_package.tar.gz | cut -f1)"
echo ""
echo "📋 手动部署步骤："
echo "1. 将 deploy_package.tar.gz 上传到服务器"
echo "2. 在服务器上执行以下命令："
echo ""
echo "   # 解压部署包"
echo "   tar -xzf deploy_package.tar.gz"
echo ""
echo "   # 创建部署目录"
echo "   sudo mkdir -p /var/www/zhitoujianli/releases"
echo "   sudo mkdir -p /etc/nginx/conf.d"
echo ""
echo "   # 部署前端文件"
echo "   TIMESTAMP=\$(date +%Y%m%d_%H%M%S)"
echo "   sudo rm -rf /var/www/zhitoujianli/releases/dist_\$TIMESTAMP"
echo "   sudo mv build /var/www/zhitoujianli/releases/dist_\$TIMESTAMP"
echo ""
echo "   # 更新软链接"
echo "   sudo rm -rf /var/www/zhitoujianli/dist"
echo "   sudo ln -s /var/www/zhitoujianli/releases/dist_\$TIMESTAMP /var/www/zhitoujianli/dist"
echo ""
echo "   # 更新Nginx配置"
echo "   sudo cp zhitoujianli.conf /etc/nginx/conf.d/"
echo "   sudo chown root:root /etc/nginx/conf.d/zhitoujianli.conf"
echo "   sudo chmod 644 /etc/nginx/conf.d/zhitoujianli.conf"
echo ""
echo "   # 测试并重载Nginx"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
echo "   # 健康检查"
echo "   curl -fsSIL https://www.zhitoujianli.com/register"
echo ""
echo "✅ 部署包准备完成！"
echo "请按照上述步骤手动部署到服务器。"
