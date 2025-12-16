#!/bin/bash

# ============================================================
# 智投简历 - 本地开发环境停止脚本
# ============================================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_ROOT="/root/zhitoujianli"
LOG_DIR="$PROJECT_ROOT/logs"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}停止开发环境服务${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 停止后端服务
if [ -f "$LOG_DIR/backend-dev.pid" ]; then
    BACKEND_PID=$(cat "$LOG_DIR/backend-dev.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}停止后端服务（PID: $BACKEND_PID）...${NC}"
        kill $BACKEND_PID
        echo -e "${GREEN}✅ 后端服务已停止${NC}"
    else
        echo -e "${YELLOW}后端服务进程不存在${NC}"
    fi
    rm -f "$LOG_DIR/backend-dev.pid"
else
    echo -e "${YELLOW}未找到后端服务PID文件${NC}"
fi

# 停止前端服务
if [ -f "$LOG_DIR/frontend-dev.pid" ]; then
    FRONTEND_PID=$(cat "$LOG_DIR/frontend-dev.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}停止前端服务（PID: $FRONTEND_PID）...${NC}"
        kill $FRONTEND_PID
        echo -e "${GREEN}✅ 前端服务已停止${NC}"
    else
        echo -e "${YELLOW}前端服务进程不存在${NC}"
    fi
    rm -f "$LOG_DIR/frontend-dev.pid"
else
    echo -e "${YELLOW}未找到前端服务PID文件${NC}"
fi

# 清理可能残留的进程
echo -e "${YELLOW}清理残留进程...${NC}"
pkill -f "spring-boot:run" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ 所有开发服务已停止${NC}"



