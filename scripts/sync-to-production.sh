#!/bin/bash

# 智投简历项目 - 开发环境同步到生产环境脚本
# 将3000端口的开发环境同步到80端口的生产环境

set -e

echo "🚀 开始同步开发环境到生产环境..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置路径
DEV_DIR="/root/zhitoujianli/frontend"
PROD_DIR="/usr/share/nginx/html"
BACKUP_DIR="/root/zhitoujianli/backups"

# 创建备份目录
mkdir -p $BACKUP_DIR

echo -e "${BLUE}📋 同步配置信息:${NC}"
echo -e "   开发环境: ${DEV_DIR}"
echo -e "   生产环境: ${PROD_DIR}"
echo -e "   备份目录: ${BACKUP_DIR}"

# 1. 构建前端项目
echo -e "${BLUE}🔨 构建前端项目...${NC}"
cd $DEV_DIR

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  检测到未提交的更改，请先提交更改${NC}"
    echo -e "   使用以下命令提交更改:"
    echo -e "   git add ."
    echo -e "   git commit -m '更新前端代码'"
    echo -e "   git push origin main"
    read -p "是否继续同步？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ 同步已取消${NC}"
        exit 1
    fi
fi

# 构建项目
npm run build

if [ ! -d "build" ]; then
    echo -e "${RED}❌ 构建失败，build目录不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 前端项目构建成功${NC}"

# 2. 备份当前生产环境
echo -e "${BLUE}💾 备份当前生产环境...${NC}"
BACKUP_NAME="production_backup_$(date +%Y%m%d_%H%M%S)"
cp -r $PROD_DIR $BACKUP_DIR/$BACKUP_NAME
echo -e "${GREEN}✅ 备份完成: $BACKUP_DIR/$BACKUP_NAME${NC}"

# 3. 同步到生产环境
echo -e "${BLUE}🔄 同步到生产环境...${NC}"

# 清空生产环境目录（保留nginx配置）
cd $PROD_DIR
find . -type f -not -name "*.conf" -not -name "*.config" -not -name "nginx.conf" -delete
find . -type d -empty -delete

# 复制新构建的文件
cp -r $DEV_DIR/build/* $PROD_DIR/

# 设置正确的权限
chown -R www-data:www-data $PROD_DIR
chmod -R 755 $PROD_DIR

echo -e "${GREEN}✅ 文件同步完成${NC}"

# 4. 重启nginx服务
echo -e "${BLUE}🔄 重启nginx服务...${NC}"
sudo systemctl reload nginx

# 检查nginx状态
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ nginx服务重启成功${NC}"
else
    echo -e "${RED}❌ nginx服务重启失败${NC}"
    echo -e "${YELLOW}🔄 恢复备份...${NC}"
    rm -rf $PROD_DIR/*
    cp -r $BACKUP_DIR/$BACKUP_NAME/* $PROD_DIR/
    chown -R www-data:www-data $PROD_DIR
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ 已恢复到备份版本${NC}"
    exit 1
fi

# 5. 验证同步结果
echo -e "${BLUE}🧪 验证同步结果...${NC}"

# 检查文件是否存在
if [ -f "$PROD_DIR/index.html" ] && [ -d "$PROD_DIR/static" ]; then
    echo -e "${GREEN}✅ 生产环境文件验证成功${NC}"
else
    echo -e "${RED}❌ 生产环境文件验证失败${NC}"
    exit 1
fi

# 测试HTTP响应
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://115.190.182.95/)
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ 生产环境HTTP响应正常 (状态码: $HTTP_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  生产环境HTTP响应异常 (状态码: $HTTP_STATUS)${NC}"
fi

# 6. 清理旧备份（保留最近5个）
echo -e "${BLUE}🧹 清理旧备份...${NC}"
cd $BACKUP_DIR
ls -t | tail -n +6 | xargs -r rm -rf
echo -e "${GREEN}✅ 旧备份清理完成${NC}"

echo ""
echo -e "${GREEN}🎉 同步完成！${NC}"
echo -e "${BLUE}📋 同步摘要:${NC}"
echo -e "   开发环境: http://115.190.182.95:3000"
echo -e "   生产环境: http://115.190.182.95"
echo -e "   备份位置: $BACKUP_DIR/$BACKUP_NAME"
echo -e "   同步时间: $(date)"
echo ""
echo -e "${YELLOW}💡 提示:${NC}"
echo -e "   如需回滚，执行: sudo cp -r $BACKUP_DIR/$BACKUP_NAME/* $PROD_DIR/"
echo -e "   然后重启nginx: sudo systemctl reload nginx"
