#!/usr/bin/env bash

# ============================================================
# 智投简历 - 部署后健康检查脚本
# 功能: 验证部署是否成功，检查各项服务状态
# 使用: ./post-deploy-check.sh [环境]
# 示例: ./post-deploy-check.sh production
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
ENVIRONMENT="${1:-production}"
DOMAIN="www.zhitoujianli.com"
API_DOMAIN="zhitoujianli.com"
TIMEOUT=10

# 统计变量
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# ============================================================
# 工具函数
# ============================================================

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED_CHECKS++))
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED_CHECKS++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNING_CHECKS++))
}

print_header() {
    echo ""
    echo "============================================================"
    echo -e "${BLUE}$1${NC}"
    echo "============================================================"
}

# HTTP 检查函数
check_http() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}

    ((TOTAL_CHECKS++))
    print_info "检查: $description"
    print_info "URL: $url"

    # 获取 HTTP 状态码
    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" -m "$TIMEOUT" "$url" 2>/dev/null || echo "000")

    if [ "$status_code" -eq "$expected_status" ]; then
        print_success "$description - 状态码: $status_code"
        return 0
    elif [ "$status_code" -eq 301 ] || [ "$status_code" -eq 302 ]; then
        print_warning "$description - 重定向: $status_code"
        return 0
    else
        print_error "$description - 状态码: $status_code (期望: $expected_status)"
        return 1
    fi
}

# SSL 证书检查
check_ssl() {
    local domain=$1

    ((TOTAL_CHECKS++))
    print_info "检查 SSL 证书: $domain"

    # 获取证书过期时间
    local expiry_date
    expiry_date=$(echo | openssl s_client -servername "$domain" -connect "$domain":443 2>/dev/null | \
                  openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)

    if [ -n "$expiry_date" ]; then
        local expiry_epoch
        expiry_epoch=$(date -d "$expiry_date" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y %Z" "$expiry_date" +%s 2>/dev/null)
        local current_epoch
        current_epoch=$(date +%s)
        local days_left=$(( (expiry_epoch - current_epoch) / 86400 ))

        if [ "$days_left" -gt 30 ]; then
            print_success "SSL 证书有效 - 剩余 $days_left 天"
        elif [ "$days_left" -gt 0 ]; then
            print_warning "SSL 证书即将过期 - 剩余 $days_left 天"
        else
            print_error "SSL 证书已过期"
        fi
    else
        print_error "无法获取 SSL 证书信息"
    fi
}

# CORS 检查
check_cors() {
    local url=$1
    local origin=$2

    ((TOTAL_CHECKS++))
    print_info "检查 CORS 配置: $url"

    local cors_header
    cors_header=$(curl -s -H "Origin: $origin" -I -m "$TIMEOUT" "$url" 2>/dev/null | \
                  grep -i "access-control-allow-origin" | tr -d '\r\n')

    if [[ "$cors_header" =~ "$origin" ]]; then
        print_success "CORS 配置正确 - $cors_header"
    elif [ -n "$cors_header" ]; then
        print_warning "CORS 配置存在但不完全匹配 - $cors_header"
    else
        print_error "未找到 CORS 响应头"
    fi
}

# 响应时间检查
check_response_time() {
    local url=$1
    local description=$2
    local max_time=${3:-2}

    ((TOTAL_CHECKS++))
    print_info "检查响应时间: $description"

    local response_time
    response_time=$(curl -o /dev/null -s -w "%{time_total}" -m "$TIMEOUT" "$url" 2>/dev/null || echo "999")

    if (( $(echo "$response_time < $max_time" | bc -l) )); then
        print_success "响应时间正常 - ${response_time}s (限制: ${max_time}s)"
    elif (( $(echo "$response_time < $(echo "$max_time * 2" | bc -l)" | bc -l) )); then
        print_warning "响应时间较慢 - ${response_time}s (限制: ${max_time}s)"
    else
        print_error "响应时间过长 - ${response_time}s (限制: ${max_time}s)"
    fi
}

# 内容检查
check_content() {
    local url=$1
    local description=$2
    local expected_text=$3

    ((TOTAL_CHECKS++))
    print_info "检查页面内容: $description"

    local content
    content=$(curl -s -m "$TIMEOUT" "$url" 2>/dev/null)

    if [[ "$content" =~ $expected_text ]]; then
        print_success "页面内容包含预期文本"
    else
        print_error "页面内容不包含预期文本: $expected_text"
    fi
}

# ============================================================
# 主检查流程
# ============================================================

print_header "智投简历 - 部署健康检查"
echo "环境: $ENVIRONMENT"
echo "域名: $DOMAIN"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"

# ============================================================
# 1. 基础连接检查
# ============================================================
print_header "1. 基础连接检查"

# HTTP 强制跳转 HTTPS
check_http "http://$DOMAIN/" "HTTP 跳转 HTTPS" 301

# HTTPS 主页
check_http "https://$DOMAIN/" "HTTPS 主页访问"

# 检查常见页面
check_http "https://$DOMAIN/register" "注册页面"
check_http "https://$DOMAIN/login" "登录页面"

# ============================================================
# 2. SSL 证书检查
# ============================================================
print_header "2. SSL 证书检查"

check_ssl "$DOMAIN"
check_ssl "$API_DOMAIN"

# ============================================================
# 3. API 端点检查
# ============================================================
print_header "3. API 端点检查"

# 验证码接口（OPTIONS 预检）
((TOTAL_CHECKS++))
print_info "检查 API CORS 预检请求"
OPTIONS_STATUS=$(curl -X OPTIONS \
    -H "Origin: https://$DOMAIN" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -s -o /dev/null -w "%{http_code}" -m "$TIMEOUT" \
    "https://$API_DOMAIN/api/auth/send-verification-code" 2>/dev/null || echo "000")

if [ "$OPTIONS_STATUS" -eq 204 ] || [ "$OPTIONS_STATUS" -eq 200 ]; then
    print_success "API CORS 预检请求正常 - 状态码: $OPTIONS_STATUS"
else
    print_warning "API CORS 预检请求异常 - 状态码: $OPTIONS_STATUS"
fi

# API 健康检查端点（如果有）
# check_http "https://$API_DOMAIN/api/health" "API 健康检查"

# ============================================================
# 4. CORS 配置检查
# ============================================================
print_header "4. CORS 配置检查"

check_cors "https://$API_DOMAIN/api/auth/send-verification-code" "https://$DOMAIN"

# ============================================================
# 5. 响应时间检查
# ============================================================
print_header "5. 响应时间检查"

check_response_time "https://$DOMAIN/" "主页响应时间" 2
check_response_time "https://$DOMAIN/register" "注册页响应时间" 2

# ============================================================
# 6. 安全响应头检查
# ============================================================
print_header "6. 安全响应头检查"

((TOTAL_CHECKS++))
print_info "检查安全响应头"

HEADERS=$(curl -s -I -m "$TIMEOUT" "https://$DOMAIN/" 2>/dev/null)

# 检查各种安全头
SECURITY_HEADERS=(
    "Strict-Transport-Security"
    "X-Frame-Options"
    "X-Content-Type-Options"
    "X-XSS-Protection"
    "Referrer-Policy"
)

for header in "${SECURITY_HEADERS[@]}"; do
    if echo "$HEADERS" | grep -qi "$header"; then
        print_success "发现安全头: $header"
    else
        print_warning "缺少安全头: $header"
    fi
done

# ============================================================
# 7. 页面内容检查
# ============================================================
print_header "7. 页面内容检查"

# 检查是否是 React 应用
check_content "https://$DOMAIN/" "React 应用检查" "root"

# 检查是否有基本的 HTML 结构
((TOTAL_CHECKS++))
print_info "检查 HTML 结构"
HTML_CONTENT=$(curl -s -m "$TIMEOUT" "https://$DOMAIN/" 2>/dev/null)
if [[ "$HTML_CONTENT" =~ "<html" ]] && [[ "$HTML_CONTENT" =~ "</html>" ]]; then
    print_success "HTML 结构完整"
else
    print_error "HTML 结构不完整"
fi

# ============================================================
# 8. Nginx 配置检查（如果在服务器上运行）
# ============================================================
if [ -f "/etc/nginx/nginx.conf" ]; then
    print_header "8. Nginx 配置检查"

    ((TOTAL_CHECKS++))
    if nginx -t &>/dev/null; then
        print_success "Nginx 配置语法正确"
    else
        print_error "Nginx 配置语法错误"
    fi
fi

# ============================================================
# 生成报告
# ============================================================
print_header "健康检查报告"

echo ""
echo "总检查项: $TOTAL_CHECKS"
echo -e "${GREEN}通过: $PASSED_CHECKS${NC}"
echo -e "${YELLOW}警告: $WARNING_CHECKS${NC}"
echo -e "${RED}失败: $FAILED_CHECKS${NC}"
echo ""

# 计算成功率
SUCCESS_RATE=$(echo "scale=2; $PASSED_CHECKS * 100 / $TOTAL_CHECKS" | bc)
echo "成功率: ${SUCCESS_RATE}%"
echo ""

# 判断总体状态
if [ "$FAILED_CHECKS" -eq 0 ]; then
    if [ "$WARNING_CHECKS" -eq 0 ]; then
        print_success "所有检查通过！部署成功！"
        echo ""
        echo "🎉 网站运行正常："
        echo "   - 访问地址: https://$DOMAIN"
        echo "   - API 地址: https://$API_DOMAIN/api"
        exit 0
    else
        print_warning "检查通过，但有 $WARNING_CHECKS 个警告项需要关注"
        exit 0
    fi
else
    print_error "检查失败！有 $FAILED_CHECKS 项检查未通过"
    echo ""
    echo "请检查上述失败项并修复问题"
    exit 1
fi

