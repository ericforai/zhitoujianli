#!/bin/bash

# 自动监听文件变化并同步到生产环境
# 使用fswatch监听文件变化，自动同步

set -e

echo "🔍 启动文件监听同步..."

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 配置路径
DEV_DIR="/root/zhitoujianli/frontend"
PROD_DIR="/usr/share/nginx/html"

# 检查fswatch是否安装
if ! command -v fswatch &> /dev/null; then
    echo -e "${YELLOW}⚠️  fswatch未安装，正在安装...${NC}"
    sudo apt update
    sudo apt install -y fswatch
fi

echo -e "${BLUE}📋 监听配置:${NC}"
echo -e "   监听目录: $DEV_DIR/src"
echo -e "   同步目标: $PROD_DIR"
echo -e "   按 Ctrl+C 停止监听"

# 定义同步函数
sync_files() {
    echo -e "${BLUE}🔄 检测到文件变化，开始同步...${NC}"
    cd $DEV_DIR

    # 构建项目
    npm run build

    # 同步到生产环境
    sudo cp -r build/* $PROD_DIR/
    sudo chown -R www-data:www-data $PROD_DIR
    sudo systemctl reload nginx

    echo -e "${GREEN}✅ 同步完成: $(date)${NC}"
}

# 设置信号处理
trap 'echo -e "\n${YELLOW}🛑 停止监听...${NC}"; exit 0' INT

# 开始监听
echo -e "${GREEN}🎯 开始监听文件变化...${NC}"
fswatch -o $DEV_DIR/src | while read f; do
    sync_files
done
