#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   智投简历 - 火山云测试环境部署脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

echo -e "${YELLOW}[1/5] 拉取最新代码...${NC}"
git pull origin main || { echo -e "${RED}错误: Git拉取失败${NC}"; exit 1; }
echo -e "${GREEN}✓ 代码更新完成${NC}"
echo ""

echo -e "${YELLOW}[2/5] 安装依赖...${NC}"
cd frontend && npm install || { echo -e "${RED}错误: 前端依赖安装失败${NC}"; exit 1; }
echo -e "${GREEN}✓ 前端依赖安装完成${NC}"
echo ""

echo -e "${YELLOW}[3/5] 构建前端...${NC}"
npm run build || { echo -e "${RED}错误: 前端构建失败${NC}"; exit 1; }
echo -e "${GREEN}✓ 前端构建完成${NC}"
echo ""

echo -e "${YELLOW}[4/5] 停止现有服务...${NC}"
pkill -f "react-scripts start" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
sleep 2
echo -e "${GREEN}✓ 现有服务已停止${NC}"
echo ""

echo -e "${YELLOW}[5/5] 启动开发服务器...${NC}"
cd .. && cd frontend
nohup npm start > /tmp/frontend-dev.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > /tmp/frontend.pid
echo -e "${GREEN}✓ 前端开发服务器已启动 (PID: $FRONTEND_PID)${NC}"
echo ""

echo -e "${GREEN}🎉 火山云测试环境部署完成！${NC}"
echo ""
echo -e "${BLUE}服务状态：${NC}"
echo -e "- 前端开发服务器: ${YELLOW}http://115.190.182.95:3000${NC}"
echo -e "- 日志文件: ${YELLOW}/tmp/frontend-dev.log${NC}"
echo -e "- 进程ID: ${YELLOW}$FRONTEND_PID${NC}"
echo ""
echo -e "${BLUE}验证命令：${NC}"
echo -e "curl -I http://115.190.182.95:3000/register"
echo ""
echo -e "${BLUE}停止服务：${NC}"
echo -e "kill $FRONTEND_PID"
echo ""
