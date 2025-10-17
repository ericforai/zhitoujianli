#!/bin/bash

# ============================================================
# 规则验证脚本
# 用途：验证项目规则配置是否正确生效
# ============================================================

echo "🔍 开始验证项目规则配置..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 计数器
PASSED=0
FAILED=0

# 检查函数
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $1"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $1"
        ((FAILED++))
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 1. 检查规则文件是否存在"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test -f /root/zhitoujianli/.cursorrules
check ".cursorrules 文件存在"

test -f /root/zhitoujianli/RULES_ENHANCEMENT_SUMMARY.md
check "规则完善总结文件存在"

test -f /root/zhitoujianli/VOLCANO_CLOUD_QUICK_REFERENCE.md
check "火山云快速参考文件存在"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔥 2. 检查火山云环境配置"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "火山云" /root/zhitoujianli/.cursorrules
check "规则文件包含火山云配置"

grep -q "/root/zhitoujianli" /root/zhitoujianli/.cursorrules
check "规则文件包含正确的绝对路径"

grep -q "115.190.182.95" /root/zhitoujianli/.cursorrules
check "规则文件包含服务器IP配置"

grep -q "非本地开发" /root/zhitoujianli/.cursorrules
check "规则文件标注非本地环境"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 3. 检查关键路径"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test -d /root/zhitoujianli
check "项目根目录存在"

test -d /root/zhitoujianli/frontend
check "前端目录存在"

test -d /root/zhitoujianli/backend/get_jobs
check "后端目录存在"

test -d /var/www/zhitoujianli
check "前端部署目录存在" || echo -e "${YELLOW}⚠️  警告: 前端部署目录不存在，可能需要首次部署${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 4. 检查环境信息"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "当前工作目录: $(pwd)"
echo "用户: $(whoami)"
echo "操作系统: $(uname -s)"
echo "内核版本: $(uname -r)"
echo "Shell: $SHELL"

# 检查是否在正确的目录
if [ "$(pwd)" = "/root/zhitoujianli" ]; then
    echo -e "${GREEN}✅ PASS${NC}: 当前在正确的工作目录"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  警告: 当前不在项目根目录${NC}"
    echo "建议运行: cd /root/zhitoujianli"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 5. 检查服务状态"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查Nginx
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ PASS${NC}: Nginx服务正在运行"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: Nginx服务未运行"
    ((FAILED++))
fi

# 检查Java进程
if pgrep -f "java.*get_jobs" > /dev/null; then
    echo -e "${GREEN}✅ PASS${NC}: 后端服务正在运行"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  警告: 后端服务未运行${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 6. 检查规则内容"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "React 18" /root/zhitoujianli/.cursorrules
check "包含前端技术栈信息"

grep -q "Spring Boot 3" /root/zhitoujianli/.cursorrules
check "包含后端技术栈信息"

grep -q "TypeScript" /root/zhitoujianli/.cursorrules
check "包含TypeScript规范"

grep -q "安全" /root/zhitoujianli/.cursorrules
check "包含安全性要求"

grep -q "性能" /root/zhitoujianli/.cursorrules
check "包含性能优化要求"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 验证结果统计"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo ""

# 总体评估
TOTAL=$((PASSED + FAILED))
SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASSED/$TOTAL)*100}")

echo "成功率: $SUCCESS_RATE%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 恭喜！所有规则配置验证通过！${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "✅ 项目规则已正确配置"
    echo "✅ 火山云环境信息已添加"
    echo "✅ 可以开始正常开发"
    echo ""
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}⚠️  发现 $FAILED 个问题，请检查并修复${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    exit 1
fi

