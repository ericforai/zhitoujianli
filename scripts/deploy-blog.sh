#!/bin/bash

# 博客部署脚本 - 确保从正确的源目录部署Astro博客
# 使用方法: ./scripts/deploy-blog.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 路径配置
BLOG_SOURCE="/root/zhitoujianli/blog/zhitoujianli-blog/dist"
BLOG_DEST="/var/www/zhitoujianli/blog"
PROJECT_ROOT="/root/zhitoujianli"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  智投简历 - 博客部署脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查是否在项目根目录
cd "$PROJECT_ROOT" || {
    echo -e "${RED}❌ 错误: 无法进入项目根目录${NC}"
    exit 1
}

# 1. 检查博客构建目录是否存在
echo -e "${BLUE}[1/4] 检查博客构建输出...${NC}"
if [ ! -d "$BLOG_SOURCE" ]; then
    echo -e "${YELLOW}⚠️  博客构建目录不存在，开始构建...${NC}"
    cd blog/zhitoujianli-blog || exit 1

    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ 错误: 博客项目目录不存在${NC}"
        exit 1
    fi

    echo -e "${BLUE}正在安装依赖...${NC}"
    npm install --silent

    echo -e "${BLUE}正在构建博客...${NC}"
    npm run build

    cd "$PROJECT_ROOT" || exit 1

    if [ ! -d "$BLOG_SOURCE" ]; then
        echo -e "${RED}❌ 错误: 博客构建失败，构建目录不存在${NC}"
        exit 1
    fi
fi

# 验证构建输出
if [ ! -f "$BLOG_SOURCE/index.html" ]; then
    echo -e "${RED}❌ 错误: 博客构建输出不完整，缺少 index.html${NC}"
    exit 1
fi

BLOG_SIZE=$(du -sh "$BLOG_SOURCE" | cut -f1)
echo -e "${GREEN}✓ 博客构建输出存在 (大小: $BLOG_SIZE)${NC}"
echo ""

# 2. 备份现有部署（可选）
echo -e "${BLUE}[2/4] 备份现有部署...${NC}"
if [ -d "$BLOG_DEST" ] && [ "$(ls -A $BLOG_DEST)" ]; then
    BACKUP_DIR="${BLOG_DEST}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${BLUE}创建备份: $BACKUP_DIR${NC}"
    sudo cp -r "$BLOG_DEST" "$BACKUP_DIR"
    echo -e "${GREEN}✓ 备份完成${NC}"
else
    echo -e "${YELLOW}⚠️  部署目录为空，跳过备份${NC}"
fi
echo ""

# 3. 部署博客文件
echo -e "${BLUE}[3/4] 部署博客文件...${NC}"
sudo mkdir -p "$BLOG_DEST"
sudo rm -rf "$BLOG_DEST"/*
sudo cp -r "$BLOG_SOURCE"/* "$BLOG_DEST"/

# 验证部署
if [ ! -f "$BLOG_DEST/index.html" ]; then
    echo -e "${RED}❌ 错误: 部署失败，目标目录缺少 index.html${NC}"
    exit 1
fi

DEPLOYED_SIZE=$(du -sh "$BLOG_DEST" | cut -f1)
echo -e "${GREEN}✓ 博客文件已部署 (大小: $DEPLOYED_SIZE)${NC}"
echo ""

# 4. 设置权限
echo -e "${BLUE}[4/4] 设置文件权限...${NC}"
sudo chown -R www-data:www-data "$BLOG_DEST"
sudo chmod -R 755 "$BLOG_DEST"
echo -e "${GREEN}✓ 权限设置完成${NC}"
echo ""

# 5. 验证部署
echo -e "${BLUE}验证部署...${NC}"
DEPLOYED_INDEX_SIZE=$(stat -c%s "$BLOG_DEST/index.html")
if [ "$DEPLOYED_INDEX_SIZE" -lt 50000 ]; then
    echo -e "${YELLOW}⚠️  警告: 部署的 index.html 文件较小 ($DEPLOYED_INDEX_SIZE 字节)${NC}"
    echo -e "${YELLOW}   可能是错误的静态HTML文件，而不是Astro构建的文件${NC}"
else
    echo -e "${GREEN}✓ 部署验证通过 (index.html: $DEPLOYED_INDEX_SIZE 字节)${NC}"
fi
echo ""

# 完成
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  博客部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📍 访问地址:${NC}"
echo -e "   https://zhitoujianli.com/blog/"
echo ""
echo -e "${BLUE}📋 部署信息:${NC}"
echo -e "   源目录: $BLOG_SOURCE"
echo -e "   目标目录: $BLOG_DEST"
echo -e "   部署大小: $DEPLOYED_SIZE"
echo ""

