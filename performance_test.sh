#!/bin/bash
################################################################################
# 性能基准测试脚本
# 用途: 测试关键API接口的性能指标
# 作者: ZhiTouJianLi Team
# 创建时间: 2025-01-11
################################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 后端服务地址
BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"

# 测试参数
CONCURRENT_REQUESTS=10
TOTAL_REQUESTS=100

echo "=================================="
echo "    性能基准测试"
echo "=================================="
echo "测试目标: $BACKEND_URL"
echo "并发请求数: $CONCURRENT_REQUESTS"
echo "总请求数: $TOTAL_REQUESTS"
echo ""

# 检查依赖
check_dependencies() {
    local missing_deps=()

    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi

    if ! command -v bc &> /dev/null; then
        missing_deps+=("bc")
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo -e "${RED}❌ 缺少依赖: ${missing_deps[*]}${NC}"
        echo "请安装: sudo apt-get install ${missing_deps[*]}"
        exit 1
    fi
}

# 创建测试日志目录
mkdir -p logs/performance

# 测试函数
performance_test() {
    local test_name="$1"
    local endpoint="$2"
    local method="${3:-GET}"
    local data="${4:-}"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}测试: $test_name${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    local total_time=0
    local min_time=999999
    local max_time=0
    local success_count=0
    local error_count=0

    # 单次请求测试
    echo "执行 $TOTAL_REQUESTS 个请求..."

    for i in $(seq 1 $TOTAL_REQUESTS); do
        # 发送请求并记录时间
        local start_time=$(date +%s%N)

        if [ -z "$data" ]; then
            local response=$(curl -s -w "\n%{http_code}\n%{time_total}" -X $method "$BACKEND_URL$endpoint" 2>/dev/null)
        else
            local response=$(curl -s -w "\n%{http_code}\n%{time_total}" -X $method \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$BACKEND_URL$endpoint" 2>/dev/null)
        fi

        local http_code=$(echo "$response" | tail -2 | head -1)
        local time_total=$(echo "$response" | tail -1)

        # 转换为毫秒
        local time_ms=$(echo "$time_total * 1000" | bc)

        # 更新统计
        if [ "$http_code" = "200" ] || [ "$http_code" = "302" ]; then
            success_count=$((success_count + 1))

            total_time=$(echo "$total_time + $time_ms" | bc)

            # 更新最小值
            if (( $(echo "$time_ms < $min_time" | bc -l) )); then
                min_time=$time_ms
            fi

            # 更新最大值
            if (( $(echo "$time_ms > $max_time" | bc -l) )); then
                max_time=$time_ms
            fi
        else
            error_count=$((error_count + 1))
        fi

        # 显示进度
        if [ $((i % 10)) -eq 0 ]; then
            echo -n "."
        fi
    done

    echo ""
    echo ""

    # 计算平均响应时间
    if [ $success_count -gt 0 ]; then
        local avg_time=$(echo "scale=2; $total_time / $success_count" | bc)
    else
        local avg_time=0
    fi

    # 显示结果
    echo "测试结果:"
    echo "────────────────────────────────"
    echo -e "成功请求: ${GREEN}$success_count${NC} / $TOTAL_REQUESTS"
    echo -e "失败请求: ${RED}$error_count${NC}"

    if [ $success_count -gt 0 ]; then
        echo ""
        echo "响应时间统计 (ms):"
        echo "  平均: ${avg_time}ms"
        echo "  最小: ${min_time}ms"
        echo "  最大: ${max_time}ms"

        # 性能评估
        if (( $(echo "$avg_time < 100" | bc -l) )); then
            echo -e "  评估: ${GREEN}优秀${NC} (< 100ms)"
        elif (( $(echo "$avg_time < 500" | bc -l) )); then
            echo -e "  评估: ${YELLOW}良好${NC} (< 500ms)"
        elif (( $(echo "$avg_time < 1000" | bc -l) )); then
            echo -e "  评估: ${YELLOW}一般${NC} (< 1000ms)"
        else
            echo -e "  评估: ${RED}需要优化${NC} (>= 1000ms)"
        fi
    fi

    echo ""

    # 记录到日志文件
    local log_file="logs/performance/$(date +%Y%m%d)_performance.log"
    echo "[$test_name] avg=${avg_time}ms, min=${min_time}ms, max=${max_time}ms, success=$success_count/$TOTAL_REQUESTS" >> "$log_file"
}

# 创建测试日志文件
create_test_log() {
    local size_mb=$1
    local log_file="logs/performance/test_${size_mb}mb.log"

    echo "创建测试日志文件 (${size_mb}MB)..."

    dd if=/dev/zero of="$log_file" bs=1M count=$size_mb 2>/dev/null

    # 添加实际日志行
    for i in $(seq 1 1000); do
        echo "[$i] $(date +%Y-%m-%d\ %H:%M:%S) - Test log line for performance testing" >> "$log_file"
    done

    echo "✅ 测试日志文件已创建: $log_file"
}

# 主测试流程
main() {
    echo "0. 检查依赖..."
    check_dependencies
    echo "✅ 依赖检查通过"
    echo ""

    echo "1. 检查服务状态..."
    if ! curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/status" 2>/dev/null | grep -q "200\|401"; then
        echo -e "${RED}❌ 后端服务未运行${NC}"
        echo ""
        echo "请先启动后端服务："
        echo "  python3 backend_manager.py start"
        exit 1
    fi
    echo -e "${GREEN}✅ 后端服务正在运行${NC}"
    echo ""

    # 测试1: 状态接口
    performance_test \
        "API状态接口" \
        "/api/status" \
        "GET"

    # 测试2: 登录页面（公开）
    performance_test \
        "登录页面加载" \
        "/login" \
        "GET"

    # 创建测试日志文件
    echo "2. 准备测试数据..."
    create_test_log 1
    create_test_log 10
    echo ""

    # 测试3: 日志接口（需要认证，预期401）
    echo "3. 测试日志接口（未认证）..."
    performance_test \
        "日志接口（未认证）" \
        "/logs?lines=50" \
        "GET"

    # 测试4: 配置保存接口（需要认证）
    echo "4. 测试配置保存接口（未认证）..."
    performance_test \
        "配置保存接口（未认证）" \
        "/save-config" \
        "POST" \
        '{"boss":{"keywords":["test"]}}'

    echo "=================================="
    echo "        测试完成"
    echo "=================================="
    echo ""
    echo "📊 测试报告已保存到:"
    echo "  logs/performance/$(date +%Y%m%d)_performance.log"
    echo ""
    echo "📈 性能基准线（参考）:"
    echo "  优秀: < 100ms"
    echo "  良好: < 500ms"
    echo "  一般: < 1000ms"
    echo "  需优化: >= 1000ms"
    echo ""
    echo "💡 提示:"
    echo "  - 认证接口返回401是正常的（修复P1-1后的预期行为）"
    echo "  - 日志接口使用流式读取后，性能应明显优于100ms"
    echo "  - 如需测试认证后的接口，请先获取token并添加到请求头"
}

# 运行主程序
main

