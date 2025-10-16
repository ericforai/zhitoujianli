#!/bin/bash

# ======================================================
# 智投简历 - 部署环境设置脚本
# 功能：设置脚本权限 + 环境检查
# 作者：智投简历团队
# 更新时间：2025-10-16
# ======================================================

set -e

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}  智投简历 - 部署环境设置${NC}"
echo -e "${BLUE}======================================================${NC}"
echo ""

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}[1/3]${NC} 设置脚本可执行权限..."
chmod +x "$SCRIPT_DIR/deploy_nginx.sh"
chmod +x "$SCRIPT_DIR/verify_deployment.sh"
echo -e "${GREEN}✅ 权限设置完成${NC}"
echo ""

echo -e "${BLUE}[2/3]${NC} 检查必要的系统工具..."
MISSING_TOOLS=()

# 检查 curl
if ! command -v curl &> /dev/null; then
    MISSING_TOOLS+=("curl")
fi

# 检查 nginx
if ! command -v nginx &> /dev/null; then
    MISSING_TOOLS+=("nginx")
fi

# 检查 openssl
if ! command -v openssl &> /dev/null; then
    MISSING_TOOLS+=("openssl")
fi

if [ ${#MISSING_TOOLS[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ 所有必要工具已安装${NC}"
else
    echo -e "${YELLOW}⚠️  缺少以下工具: ${MISSING_TOOLS[*]}${NC}"
    echo -e "${YELLOW}   请使用以下命令安装:${NC}"
    echo -e "${YELLOW}   sudo apt-get update && sudo apt-get install -y ${MISSING_TOOLS[*]}${NC}"
fi
echo ""

echo -e "${BLUE}[3/3]${NC} 检查目录结构..."
if [ -f "$SCRIPT_DIR/../nginx/zhitoujianli.conf" ]; then
    echo -e "${GREEN}✅ Nginx 配置文件存在${NC}"
else
    echo -e "${RED}❌ 找不到 Nginx 配置文件${NC}"
    exit 1
fi
echo ""

echo -e "${GREEN}======================================================${NC}"
echo -e "${GREEN}✅ 环境设置完成！${NC}"
echo -e "${GREEN}======================================================${NC}"
echo ""
echo -e "${BLUE}📋 下一步操作：${NC}"
echo "  1. 部署 Nginx 配置："
echo "     sudo bash $SCRIPT_DIR/deploy_nginx.sh"
echo ""
echo "  2. 验证部署结果："
echo "     bash $SCRIPT_DIR/verify_deployment.sh"
echo ""

