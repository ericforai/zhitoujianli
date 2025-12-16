#!/bin/bash

# ============================================================
# 智投简历 - 生产环境标准发布脚本
# ============================================================
# 此脚本执行标准的生产环境发布流程：
# 1. 拉取最新代码
# 2. 部署前端
# 3. 部署后端
# ============================================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="/root/zhitoujianli"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}智投简历 - 生产环境标准发布${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否在正确的目录
if [ ! -f "$PROJECT_ROOT/.git/config" ]; then
    echo -e "${RED}❌ 错误: 未找到Git仓库${NC}"
    echo -e "${YELLOW}   请确保在项目根目录执行此脚本${NC}"
    exit 1
fi

cd "$PROJECT_ROOT"

# 步骤1: 拉取最新代码
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}步骤 1/3: 拉取最新代码${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}📥 从GitHub主分支拉取最新代码...${NC}"
if git pull origin main; then
    echo -e "${GREEN}✅ 代码拉取成功${NC}"
    echo -e "${YELLOW}   最新提交: $(git log -1 --oneline)${NC}"
else
    echo -e "${RED}❌ 代码拉取失败${NC}"
    echo -e "${YELLOW}   请检查网络连接和GitHub访问权限${NC}"
    exit 1
fi

echo ""

# 步骤2: 部署前端
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}步骤 2/3: 部署前端${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ -f "$PROJECT_ROOT/deploy-frontend.sh" ]; then
    echo -e "${YELLOW}🚀 执行前端部署脚本...${NC}"
    if "$PROJECT_ROOT/deploy-frontend.sh"; then
        echo -e "${GREEN}✅ 前端部署成功${NC}"
    else
        echo -e "${RED}❌ 前端部署失败${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ 错误: 未找到前端部署脚本${NC}"
    echo -e "${YELLOW}   预期位置: $PROJECT_ROOT/deploy-frontend.sh${NC}"
    exit 1
fi

echo ""

# 步骤3: 部署后端
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}步骤 3/3: 部署后端${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ -f "$PROJECT_ROOT/scripts/deploy-backend.sh" ]; then
    echo -e "${YELLOW}🚀 执行后端部署脚本...${NC}"
    if "$PROJECT_ROOT/scripts/deploy-backend.sh"; then
        echo -e "${GREEN}✅ 后端部署成功${NC}"
    else
        echo -e "${RED}❌ 后端部署失败${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ 错误: 未找到后端部署脚本${NC}"
    echo -e "${YELLOW}   预期位置: $PROJECT_ROOT/scripts/deploy-backend.sh${NC}"
    exit 1
fi

echo ""

# 最终验证
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}最终验证${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}🔍 检查服务状态...${NC}"

# 检查后端服务
if systemctl is-active --quiet zhitoujianli-backend.service; then
    echo -e "${GREEN}✅ 后端服务运行正常${NC}"
else
    echo -e "${RED}❌ 后端服务未运行${NC}"
    echo -e "${YELLOW}   执行: systemctl status zhitoujianli-backend.service${NC}"
fi

# 检查前端
if curl -s -o /dev/null -w "%{http_code}" https://www.zhitoujianli.com/ | grep -q "200"; then
    echo -e "${GREEN}✅ 前端页面可访问${NC}"
else
    echo -e "${YELLOW}⚠️  前端页面检查失败，请手动验证${NC}"
fi

# 检查API
if curl -s https://www.zhitoujianli.com/api/auth/health | grep -q "success"; then
    echo -e "${GREEN}✅ 后端API正常响应${NC}"
else
    echo -e "${YELLOW}⚠️  后端API检查失败，请手动验证${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ 生产环境发布完成${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}📝 建议:${NC}"
echo -e "   1. 访问 https://www.zhitoujianli.com 验证功能"
echo -e "   2. 检查日志: journalctl -u zhitoujianli-backend.service -n 50"
echo -e "   3. 如有问题，参考回滚流程: docs/PRODUCTION_RELEASE_PROCESS.md"
echo ""



