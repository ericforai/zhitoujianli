#!/bin/bash

# ============================================================
# API安全配置检查脚本
# 用于验证所有API路径是否在安全配置中声明
#
# 基于2025-11-17管理后台302重定向Bug的经验教训
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 路径定义
CONTROLLER_DIR="backend/get_jobs/src/main/java/controller"
SECURITY_CONFIG="backend/get_jobs/src/main/java/config/SimpleSecurityConfig.java"

echo "🔍 开始检查API安全配置..."
echo ""

# 检查文件是否存在
if [ ! -f "$SECURITY_CONFIG" ]; then
    echo -e "${RED}❌ 错误：找不到安全配置文件 $SECURITY_CONFIG${NC}"
    exit 1
fi

if [ ! -d "$CONTROLLER_DIR" ]; then
    echo -e "${RED}❌ 错误：找不到控制器目录 $CONTROLLER_DIR${NC}"
    exit 1
fi

# 提取所有API路径
echo "📋 提取所有API路径..."
API_PATHS=$(grep -rh "@RequestMapping\|@GetMapping\|@PostMapping\|@PutMapping\|@DeleteMapping" "$CONTROLLER_DIR" \
    | grep -oE '(value\s*=\s*"|"/)[^"]*' \
    | sed 's/value\s*=\s*"//;s/^"//;s/"$//' \
    | grep "^/api/" \
    | sort -u)

if [ -z "$API_PATHS" ]; then
    echo -e "${YELLOW}⚠️  警告：未找到任何API路径${NC}"
    exit 0
fi

# 检查每个API路径是否在安全配置中声明
echo "🔒 检查API路径是否在安全配置中声明..."
echo ""

MISSING_PATHS=()
WARNING_COUNT=0

while IFS= read -r path; do
    # 移除路径中的变量部分（如 {id}）
    CLEAN_PATH=$(echo "$path" | sed 's/{[^}]*}/**/g' | sed 's/\*\*\/\*\*/**/g')

    # 检查是否在安全配置中
    if ! grep -q "$CLEAN_PATH" "$SECURITY_CONFIG" && ! grep -q "${CLEAN_PATH%/*}/**" "$SECURITY_CONFIG"; then
        # 检查是否是公开API（/api/auth/** 或 /api/admin/auth/**）
        if [[ "$CLEAN_PATH" =~ ^/api/(auth|admin/auth|boss)/ ]]; then
            echo -e "${GREEN}✅ $path${NC} (公开API，应在permitAll中)"
        else
            echo -e "${RED}❌ $path${NC} (未在安全配置中声明！)"
            MISSING_PATHS+=("$path")
            ((WARNING_COUNT++))
        fi
    else
        echo -e "${GREEN}✅ $path${NC}"
    fi
done <<< "$API_PATHS"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $WARNING_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ 所有API路径都已正确配置！${NC}"
    exit 0
else
    echo -e "${RED}❌ 发现 $WARNING_COUNT 个未配置的API路径：${NC}"
    echo ""
    for path in "${MISSING_PATHS[@]}"; do
        echo -e "  ${RED}• $path${NC}"
    done
    echo ""
    echo -e "${YELLOW}⚠️  请立即在 $SECURITY_CONFIG 中添加这些路径！${NC}"
    echo ""
    echo "修复步骤："
    echo "1. 打开 $SECURITY_CONFIG"
    echo "2. 在 .requestMatchers() 中添加缺失的路径"
    echo "3. 如果是公开API，添加到 .permitAll()"
    echo "4. 如果需要认证，添加到 .authenticated()"
    echo ""
    exit 1
fi

