#!/bin/bash

# 快速同步脚本 - 将开发环境同步到生产环境
# 适用于快速更新，不包含备份

set -e

echo "🚀 快速同步开发环境到生产环境..."

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置路径
DEV_DIR="/root/zhitoujianli/frontend"
PROD_DIR="/usr/share/nginx/html"

echo -e "${BLUE}🔨 构建前端项目...${NC}"
cd $DEV_DIR
npm run build

echo -e "${BLUE}🔄 同步到生产环境...${NC}"
sudo cp -r build/* $PROD_DIR/

echo -e "${BLUE}🔧 设置权限...${NC}"
sudo chown -R www-data:www-data $PROD_DIR

echo -e "${BLUE}🔄 重启nginx...${NC}"
sudo systemctl reload nginx

echo -e "${GREEN}✅ 快速同步完成！${NC}"
echo -e "   生产环境: http://115.190.182.95"
