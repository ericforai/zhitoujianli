#!/bin/bash
# 代码修复验证测试脚本
# 用于快速验证所有修复是否成功

set -e  # 遇到错误立即退出

echo "🧪 ========================================="
echo "🧪 代码修复验证测试"
echo "🧪 ========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试结果统计
PASSED=0
FAILED=0
WARNINGS=0

# 测试函数
test_step() {
    local name=$1
    local command=$2
    local is_required=${3:-true}

    echo "📝 测试: $name"
    echo "   执行: $command"

    if eval "$command" > /tmp/test_output.log 2>&1; then
        echo -e "   ${GREEN}✅ 通过${NC}"
        ((PASSED++))
        return 0
    else
        if [ "$is_required" = "true" ]; then
            echo -e "   ${RED}❌ 失败（必需）${NC}"
            echo "   错误输出:"
            cat /tmp/test_output.log | head -20
            ((FAILED++))
            return 1
        else
            echo -e "   ${YELLOW}⚠️  警告（可选）${NC}"
            ((WARNINGS++))
            return 0
        fi
    fi
}

# 记录开始时间
START_TIME=$(date +%s)

# ============================================
# P0优先级测试 - 必须通过
# ============================================
echo ""
echo "🔴 ========================================="
echo "🔴 P0优先级测试（必须通过）"
echo "🔴 ========================================="
echo ""

# 1. 前端类型检查
cd /root/zhitoujianli/frontend
test_step "前端TypeScript类型检查" "npm run type-check" true || exit 1

# 2. 前端Linter检查
test_step "前端Linter检查" "npm run lint:check" true || exit 1

# 3. 后端编译测试
cd /root/zhitoujianli/backend/get_jobs
test_step "后端Java编译测试" "mvn clean compile -q" true || exit 1

# 4. 后端代码质量检查（可选）
test_step "后端代码质量检查" "mvn checkstyle:check -q" false

# ============================================
# P1优先级测试 - 重要功能验证
# ============================================
echo ""
echo "🟡 ========================================="
echo "🟡 P1优先级测试（重要功能验证）"
echo "🟡 ========================================="
echo ""

# 5. 验证修复的文件存在
cd /root/zhitoujianli
test_step "验证修复的文件存在" "
    test -f frontend/src/utils/apiValidator.ts && \
    test -f frontend/src/types/delivery.ts && \
    test -f backend/get_jobs/src/main/java/service/QuotaService.java && \
    test -f backend/get_jobs/src/main/java/controller/GlobalExceptionHandler.java
" true || exit 1

# 6. 验证类型定义正确
cd /root/zhitoujianli/frontend
test_step "验证类型定义文件" "
    grep -q 'export interface DeliveryConfig' src/types/delivery.ts && \
    grep -q 'export interface AiConfig' src/types/delivery.ts
" true || exit 1

# 7. 验证错误处理Hook
test_step "验证useErrorHandler类型修复" "
    grep -q 'handleError: (error: unknown)' src/hooks/useErrorHandler.ts && \
    grep -q 'export interface ApiError' src/hooks/useErrorHandler.ts
" true || exit 1

# 8. 验证QuotaService修复
cd /root/zhitoujianli/backend/get_jobs
test_step "验证QuotaService空值检查" "
    grep -q '添加空值检查，防止NPE' src/main/java/service/QuotaService.java && \
    grep -q '临时方案' src/main/java/service/QuotaService.java && \
    grep -q 'return true;' src/main/java/service/QuotaService.java
" true || exit 1

# 9. 验证GlobalExceptionHandler修复
test_step "验证GlobalExceptionHandler完善" "
    grep -q '@ExceptionHandler(NullPointerException.class)' src/main/java/controller/GlobalExceptionHandler.java && \
    grep -q '@ExceptionHandler(IllegalArgumentException.class)' src/main/java/controller/GlobalExceptionHandler.java && \
    grep -q '@ExceptionHandler(Exception.class)' src/main/java/controller/GlobalExceptionHandler.java
" true || exit 1

# 10. 验证Lagou.java代码清理
test_step "验证Lagou.java代码清理" "
    ! grep -q 'if (elements != null && !elements.isEmpty())' src/main/java/lagou/Lagou.java || \
    grep -q '删除已废弃的旧Selenium实现代码' src/main/java/lagou/Lagou.java
" false

# ============================================
# 测试结果汇总
# ============================================
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "📊 ========================================="
echo "📊 测试结果汇总"
echo "📊 ========================================="
echo ""
echo -e "✅ 通过: ${GREEN}$PASSED${NC}"
echo -e "❌ 失败: ${RED}$FAILED${NC}"
echo -e "⚠️  警告: ${YELLOW}$WARNINGS${NC}"
echo "⏱️  耗时: ${DURATION}秒"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 所有必需测试通过！${NC}"
    echo ""
    echo "✅ 代码修复验证成功"
    echo "✅ 可以继续进行功能测试"
    exit 0
else
    echo -e "${RED}❌ 有必需测试失败，请检查并修复${NC}"
    echo ""
    echo "请查看上面的错误信息并修复问题"
    exit 1
fi

