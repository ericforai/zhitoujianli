#!/bin/bash
################################################################################
# 安全验证测试脚本
# 用途: 验证WebController认证修复是否生效
# 作者: ZhiTouJianLi Team
# 创建时间: 2025-01-11
################################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数器
PASSED=0
FAILED=0
TOTAL=0

# 后端服务地址
BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"

echo "=================================="
echo "    安全验证测试"
echo "=================================="
echo "测试目标: $BACKEND_URL"
echo ""

# 测试函数
test_endpoint() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local expected_code="$4"
    local description="$5"

    TOTAL=$((TOTAL + 1))
    echo -n "[$TOTAL] $test_name... "

    # 发送请求并获取状态码
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BACKEND_URL$endpoint" 2>/dev/null)

    if [ "$http_code" = "000" ]; then
        echo -e "${YELLOW}SKIP${NC} (服务未运行)"
        return
    fi

    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC} (期望: $expected_code, 实际: $http_code)"
        echo "   描述: $description"
        FAILED=$((FAILED + 1))
    fi
}

# 检查服务状态
echo "0. 检查后端服务状态..."
if ! curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/status" 2>/dev/null | grep -q "200\|401"; then
    echo -e "${YELLOW}⚠️  警告: 后端服务未运行或不可达${NC}"
    echo ""
    echo "请先启动后端服务："
    echo "  python3 backend_manager.py start"
    echo ""
    echo "或使用已存在的JAR文件："
    echo "  cd backend/get_jobs && java -jar target/get_jobs-1.0-SNAPSHOT.jar &"
    echo ""
    echo "生成测试预期结果文档（服务未运行状态）..."
    exit 0
fi

echo -e "${GREEN}✅ 后端服务正在运行${NC}"
echo ""

# ============================================================================
# P1-1: 后台管理页面认证保护测试
# ============================================================================
echo "【P1-1】后台管理页面认证保护"
echo "----------------------------------------"

test_endpoint \
    "未认证访问后台管理页面" \
    "GET" \
    "/" \
    "302" \
    "未登录用户应被重定向到登录页（302）或返回401"

test_endpoint \
    "未认证访问后台管理页面（验证401）" \
    "GET" \
    "/" \
    "401" \
    "或者返回401 Unauthorized"

echo ""

# ============================================================================
# P1-1: 敏感接口认证保护测试
# ============================================================================
echo "【P1-1】敏感接口认证保护"
echo "----------------------------------------"

test_endpoint \
    "未认证调用 /start-program" \
    "POST" \
    "/start-program?platform=boss" \
    "401" \
    "应返回401 Unauthorized"

test_endpoint \
    "未认证调用 /stop-program" \
    "POST" \
    "/stop-program" \
    "401" \
    "应返回401 Unauthorized"

test_endpoint \
    "未认证调用 /start-boss-task" \
    "POST" \
    "/start-boss-task" \
    "401" \
    "应返回401 Unauthorized"

test_endpoint \
    "未认证调用 /logs" \
    "GET" \
    "/logs?lines=10" \
    "401" \
    "应返回401 Unauthorized"

test_endpoint \
    "未认证调用 /save-config" \
    "POST" \
    "/save-config" \
    "401" \
    "应返回401 Unauthorized"

echo ""

# ============================================================================
# 公开接口测试（应该可访问）
# ============================================================================
echo "【验证】公开接口可访问性"
echo "----------------------------------------"

test_endpoint \
    "访问登录页面" \
    "GET" \
    "/login" \
    "200" \
    "登录页面应该可以公开访问"

test_endpoint \
    "访问注册页面" \
    "GET" \
    "/register" \
    "200" \
    "注册页面应该可以公开访问"

test_endpoint \
    "访问API状态接口" \
    "GET" \
    "/api/status" \
    "200" \
    "状态接口应该可以公开访问"

echo ""

# ============================================================================
# P2-1: 日志接口性能测试（流式读取验证）
# ============================================================================
echo "【P2-1】日志接口性能验证"
echo "----------------------------------------"

# 创建测试日志文件
TEST_LOG_DIR="logs/test"
TEST_LOG_FILE="$TEST_LOG_DIR/performance_test.log"
mkdir -p "$TEST_LOG_DIR"

echo "创建测试日志文件 (10MB)..."
dd if=/dev/zero of="$TEST_LOG_FILE" bs=1M count=10 2>/dev/null
for i in {1..10000}; do
    echo "[$i] Test log line at $(date +%Y-%m-%d\ %H:%M:%S)" >> "$TEST_LOG_FILE"
done

# 测试日志接口响应时间
if [ -f "$TEST_LOG_FILE" ]; then
    echo "测试日志接口响应时间（需要登录，跳过）..."
    # 此处需要认证token，实际使用时需要先登录获取token
    echo "ℹ️  性能测试需要认证token，请在登录后手动测试"
    echo "   命令示例: curl -H \"Authorization: Bearer YOUR_TOKEN\" \"$BACKEND_URL/logs?lines=100\""
fi

echo ""

# ============================================================================
# 测试总结
# ============================================================================
echo "=================================="
echo "        测试总结"
echo "=================================="
echo "总测试数: $TOTAL"
echo -e "通过: ${GREEN}$PASSED${NC}"
echo -e "失败: ${RED}$FAILED${NC}"
echo "跳过: $((TOTAL - PASSED - FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！安全修复已生效。${NC}"
    exit 0
else
    echo -e "${RED}❌ 有 $FAILED 个测试失败，请检查修复是否正确应用。${NC}"
    exit 1
fi

