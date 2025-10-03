#!/bin/bash

# 简化部署脚本 - 智投简历项目
# 直接使用nginx部署静态文件

set -e

echo "🚀 开始简化部署..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查nginx是否安装
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}⚠️  Nginx未安装，正在安装...${NC}"
    sudo apt update
    sudo apt install -y nginx
fi

# 创建部署目录
echo -e "${BLUE}📁 创建部署目录...${NC}"
sudo mkdir -p /var/www/zhitoujianli
sudo mkdir -p /var/www/zhitoujianli/blog

# 复制前端构建文件
echo -e "${BLUE}📦 复制前端文件...${NC}"
sudo cp -r frontend/build/* /var/www/zhitoujianli/

# 尝试构建博客（如果网络允许）
echo -e "${BLUE}📝 构建博客...${NC}"
cd blog/zhitoujianli-blog
if npm run build 2>/dev/null; then
    sudo cp -r dist/* /var/www/zhitoujianli/blog/
    echo -e "${GREEN}✅ 博客构建成功${NC}"
else
    echo -e "${YELLOW}⚠️  博客构建失败，使用默认页面${NC}"
    echo "<h1>博客系统</h1><p>正在建设中...</p>" | sudo tee /var/www/zhitoujianli/blog/index.html
fi
cd ../..

# 复制nginx配置
echo -e "${BLUE}⚙️  配置nginx...${NC}"
sudo cp nginx/nginx-simple.conf /etc/nginx/nginx.conf

# 测试nginx配置
if sudo nginx -t; then
    echo -e "${GREEN}✅ Nginx配置测试通过${NC}"
else
    echo -e "${RED}❌ Nginx配置测试失败${NC}"
    exit 1
fi

# 重启nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# 检查nginx状态
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx启动成功${NC}"
else
    echo -e "${RED}❌ Nginx启动失败${NC}"
    exit 1
fi

# 设置文件权限
sudo chown -R www-data:www-data /var/www/zhitoujianli
sudo chmod -R 755 /var/www/zhitoujianli

echo -e "${GREEN}🎉 部署完成！${NC}"
echo -e "${BLUE}📍 网站地址: http://$(curl -s ifconfig.me)${NC}"
echo -e "${BLUE}📍 本地访问: http://localhost${NC}"
echo -e "${YELLOW}💡 请确保防火墙开放80端口${NC}"
echo -e "${YELLOW}💡 请配置域名解析指向此服务器${NC}"
