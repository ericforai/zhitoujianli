#!/bin/bash

###############################################################################
# Sitemap.xml 快速部署脚本
# 用途：一键部署 sitemap.xml 到生产环境
# 作者：智投简历项目组
# 日期：2025-10-23
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  智投简历 - Sitemap 部署工具${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 步骤1：更新 sitemap.xml
echo -e "${CYAN}[1/6]${NC} 正在更新 sitemap.xml..."
cd "$PROJECT_ROOT"
./scripts/update-sitemap.sh
echo ""

# 步骤2：重新构建前端
echo -e "${CYAN}[2/6]${NC} 正在重新构建前端..."
cd "$PROJECT_ROOT/frontend"
npm run build
echo -e "${GREEN}✓${NC} 前端构建完成"
echo ""

# 步骤3：备份现有 nginx 配置
echo -e "${CYAN}[3/6]${NC} 备份现有 nginx 配置..."
if [ -f /etc/nginx/nginx.conf ]; then
    BACKUP_FILE="/etc/nginx/nginx.conf.backup-$(date +%Y%m%d-%H%M%S)"
    sudo cp /etc/nginx/nginx.conf "$BACKUP_FILE"
    echo -e "${GREEN}✓${NC} 已备份到：$BACKUP_FILE"
else
    echo -e "${YELLOW}⚠${NC} /etc/nginx/nginx.conf 不存在，跳过备份"
fi
echo ""

# 步骤4：更新 nginx 配置
echo -e "${CYAN}[4/6]${NC} 更新 nginx 配置..."
if [ -f "$PROJECT_ROOT/nginx/nginx.conf" ]; then
    sudo cp "$PROJECT_ROOT/nginx/nginx.conf" /etc/nginx/nginx.conf
    echo -e "${GREEN}✓${NC} nginx 配置已更新"
else
    echo -e "${RED}✗${NC} nginx 配置文件不存在：$PROJECT_ROOT/nginx/nginx.conf"
    exit 1
fi
echo ""

# 步骤5：测试 nginx 配置
echo -e "${CYAN}[5/6]${NC} 测试 nginx 配置..."
if sudo nginx -t; then
    echo -e "${GREEN}✓${NC} nginx 配置测试通过"
else
    echo -e "${RED}✗${NC} nginx 配置测试失败！"
    echo -e "${YELLOW}提示：${NC}正在恢复备份配置..."
    if [ -n "$BACKUP_FILE" ] && [ -f "$BACKUP_FILE" ]; then
        sudo cp "$BACKUP_FILE" /etc/nginx/nginx.conf
        echo -e "${GREEN}✓${NC} 已恢复备份配置"
    fi
    exit 1
fi
echo ""

# 步骤6：重新加载 nginx
echo -e "${CYAN}[6/6]${NC} 重新加载 nginx..."
if sudo systemctl reload nginx; then
    echo -e "${GREEN}✓${NC} nginx 已重新加载"
else
    echo -e "${YELLOW}⚠${NC} nginx reload 失败，尝试 restart..."
    sudo systemctl restart nginx
    echo -e "${GREEN}✓${NC} nginx 已重启"
fi
echo ""

# 验证部署
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  开始验证部署...${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 验证1：检查文件存在
echo -e "${CYAN}[验证1]${NC} 检查本地文件..."
if [ -f "$PROJECT_ROOT/frontend/build/sitemap.xml" ]; then
    echo -e "${GREEN}✓${NC} sitemap.xml 存在"
    echo -e "   路径：$PROJECT_ROOT/frontend/build/sitemap.xml"
    echo -e "   大小：$(du -h "$PROJECT_ROOT/frontend/build/sitemap.xml" | cut -f1)"
else
    echo -e "${RED}✗${NC} sitemap.xml 不存在"
fi
echo ""

# 验证2：检查 robots.txt
echo -e "${CYAN}[验证2]${NC} 检查 robots.txt..."
if grep -q "Sitemap: https://zhitoujianli.com/sitemap.xml" "$PROJECT_ROOT/frontend/build/robots.txt"; then
    echo -e "${GREEN}✓${NC} robots.txt 包含 sitemap 引用"
else
    echo -e "${YELLOW}⚠${NC} robots.txt 可能缺少 sitemap 引用"
fi
echo ""

# 验证3：测试在线访问（如果可以访问互联网）
echo -e "${CYAN}[验证3]${NC} 测试在线访问..."
if command -v curl &> /dev/null; then
    # 等待几秒让 nginx 完全加载
    sleep 2

    # 测试 sitemap.xml
    if curl -s -I https://zhitoujianli.com/sitemap.xml 2>/dev/null | grep -q "200"; then
        echo -e "${GREEN}✓${NC} sitemap.xml 在线可访问"

        # 检查 Content-Type
        CONTENT_TYPE=$(curl -s -I https://zhitoujianli.com/sitemap.xml 2>/dev/null | grep -i "content-type" | head -1)
        if echo "$CONTENT_TYPE" | grep -q "application/xml"; then
            echo -e "${GREEN}✓${NC} Content-Type 正确：application/xml"
        else
            echo -e "${YELLOW}⚠${NC} Content-Type 可能不正确"
            echo -e "   实际值：$CONTENT_TYPE"
        fi
    else
        echo -e "${YELLOW}⚠${NC} 无法访问 https://zhitoujianli.com/sitemap.xml"
        echo -e "   （这可能是因为 DNS 未解析或服务器未运行）"
    fi
else
    echo -e "${YELLOW}⚠${NC} curl 未安装，跳过在线验证"
fi
echo ""

# 部署成功总结
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署成功！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📍 已完成的操作："
echo -e "   ✅ 更新了 sitemap.xml（最新日期：$(date +%Y-%m-%d)）"
echo -e "   ✅ 重新构建了前端"
echo -e "   ✅ 更新了 nginx 配置"
echo -e "   ✅ 重新加载了 nginx 服务"
echo ""
echo -e "🔗 验证链接："
echo -e "   https://zhitoujianli.com/sitemap.xml"
echo -e "   https://zhitoujianli.com/robots.txt"
echo ""
echo -e "📝 后续步骤："
echo -e "   1. 在浏览器中访问上述 URL 验证"
echo -e "   2. 前往 Google Search Console 提交 sitemap"
echo -e "      https://search.google.com/search-console"
echo -e "   3. 监控索引状态（24-48小时后）"
echo ""
echo -e "📖 详细文档："
echo -e "   $PROJECT_ROOT/SITEMAP_GENERATION_GUIDE.md"
echo -e "   $PROJECT_ROOT/SITEMAP_DEPLOYMENT_INSTRUCTIONS.md"
echo ""
echo -e "${BLUE}========================================${NC}"
echo ""

