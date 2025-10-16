#!/bin/bash

# ======================================================
# 智投简历 - 部署验证脚本
# 功能：验证 Nginx 配置和 CORS 是否正常工作
# 作者：智投简历团队
# 更新时间：2025-10-16
# ======================================================

# 颜色输出配置
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 日志函数
log_test() {
    echo -e "${BLUE}[TEST $((TOTAL_TESTS + 1))]${NC} $1"
}

log_pass() {
    echo -e "${GREEN}  ✅ PASS:${NC} $1"
    PASSED_TESTS=$((PASSED_TESTS + 1))
}

log_fail() {
    echo -e "${RED}  ❌ FAIL:${NC} $1"
    FAILED_TESTS=$((FAILED_TESTS + 1))
}

log_info() {
    echo -e "${BLUE}  ℹ️  INFO:${NC} $1"
}

# ======================================================
# 测试1：Nginx 服务状态
# ======================================================
test_nginx_status() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_test "检查 Nginx 服务状态..."

    if systemctl is-active --quiet nginx; then
        log_pass "Nginx 服务正在运行"
    else
        log_fail "Nginx 服务未运行"
        return 1
    fi
}

# ======================================================
# 测试2：配置文件存在性
# ======================================================
test_config_exists() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_test "检查配置文件是否存在..."

    if [ -f "/etc/nginx/conf.d/zhitoujianli.conf" ]; then
        log_pass "配置文件存在"
    else
        log_fail "配置文件不存在"
        return 1
    fi
}

# ======================================================
# 测试3：Nginx 配置语法
# ======================================================
test_nginx_syntax() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_test "验证 Nginx 配置语法..."

    if nginx -t 2>&1 | grep -q "syntax is ok"; then
        log_pass "Nginx 配置语法正确"
    else
        log_fail "Nginx 配置语法错误"
        return 1
    fi
}

# ======================================================
# 测试4：SSL 证书
# ======================================================
test_ssl_certificate() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_test "检查 SSL 证书..."

    CERT_PATH="/etc/letsencrypt/live/zhitoujianli.com/fullchain.pem"

    if [ -f "$CERT_PATH" ]; then
        log_pass "SSL 证书存在"

        # 检查证书过期时间
        EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_PATH" 2>/dev/null | cut -d= -f2)
        if [ -n "$EXPIRY" ]; then
            log_info "证书过期时间: $EXPIRY"
        fi
    else
        log_fail "SSL 证书不存在"
        return 1
    fi
}

# ======================================================
# 测试5：HTTP 到 HTTPS 重定向
# ======================================================
test_https_redirect() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_test "测试 HTTP 到 HTTPS 重定向..."

    RESPONSE=$(curl -s -I -L "http://zhitoujianli.com" 2>&1 | head -1)

    if echo "$RESPONSE" | grep -q "301\|302"; then
        log_pass "HTTP 重定向配置正确"
    else
        log_fail "HTTP 重定向未生效"
        log_info "响应: $RESPONSE"
        return 1
    fi
}

# ======================================================
# 测试6：HTTPS 访问
# ======================================================
test_https_access() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_test "测试 HTTPS 访问..."

    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://zhitoujianli.com" 2>/dev/null || echo "000")

    if [ "$STATUS" = "200" ] || [ "$STATUS" = "301" ] || [ "$STATUS" = "302" ]; then
        log_pass "HTTPS 访问正常 (状态码: $STATUS)"
    else
        log_fail "HTTPS 访问失败 (状态码: $STATUS)"
        return 1
    fi
}

# ======================================================
# 测试7：CORS 预检请求（OPTIONS）
# ======================================================
test_cors_preflight() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_test "测试 CORS 预检请求..."

    RESPONSE=$(curl -s -I -X OPTIONS \
        -H "Origin: https://www.zhitoujianli.com" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type,Authorization" \
        "https://zhitoujianli.com/api/auth/send-verification-code" 2>&1)

    if echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
        log_pass "CORS 预检请求配置正确"

        # 显示 CORS 响应头
        CORS_ORIGIN=$(echo "$RESPONSE" | grep -i "Access-Control-Allow-Origin" | cut -d: -f2- | tr -d '\r' | xargs)
        CORS_METHODS=$(echo "$RESPONSE" | grep -i "Access-Control-Allow-Methods" | cut -d: -f2- | tr -d '\r' | xargs)

        log_info "Allow-Origin: $CORS_ORIGIN"
        log_info "Allow-Methods: $CORS_METHODS"
    else
        log_fail "CORS 预检请求未返回正确的响应头"
        return 1
    fi
}

# ======================================================
# 测试8：CORS 实际请求
# ======================================================
test_cors_actual_request() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_test "测试 CORS 实际请求..."

    RESPONSE=$(curl -s -I \
        -H "Origin: https://www.zhitoujianli.com" \
        "https://zhitoujianli.com/api/health" 2>&1 || echo "")

    if echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
        log_pass "CORS 实际请求配置正确"
    else
        log_fail "CORS 实际请求未返回正确的响应头"
        return 1
    fi
}

# ======================================================
# 测试9：安全头部
# ======================================================
test_security_headers() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_test "检查安全头部..."

    RESPONSE=$(curl -s -I "https://zhitoujianli.com" 2>&1)

    HEADERS_FOUND=0

    if echo "$RESPONSE" | grep -q "Strict-Transport-Security"; then
        HEADERS_FOUND=$((HEADERS_FOUND + 1))
    fi

    if echo "$RESPONSE" | grep -q "X-Content-Type-Options"; then
        HEADERS_FOUND=$((HEADERS_FOUND + 1))
    fi

    if echo "$RESPONSE" | grep -q "X-Frame-Options"; then
        HEADERS_FOUND=$((HEADERS_FOUND + 1))
    fi

    if [ $HEADERS_FOUND -ge 2 ]; then
        log_pass "安全头部配置正确 ($HEADERS_FOUND/3 个头部存在)"
    else
        log_fail "安全头部配置不完整 ($HEADERS_FOUND/3 个头部存在)"
        return 1
    fi
}

# ======================================================
# 测试10：日志文件
# ======================================================
test_log_files() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_test "检查日志文件..."

    ACCESS_LOG="/var/log/nginx/zhitoujianli_access.log"
    ERROR_LOG="/var/log/nginx/zhitoujianli_error.log"

    LOGS_OK=true

    if [ -f "$ACCESS_LOG" ]; then
        log_info "访问日志存在"
    else
        LOGS_OK=false
    fi

    if [ -f "$ERROR_LOG" ]; then
        log_info "错误日志存在"
    else
        LOGS_OK=false
    fi

    if [ "$LOGS_OK" = true ]; then
        log_pass "日志文件配置正确"
    else
        log_fail "部分日志文件不存在"
        return 1
    fi
}

# ======================================================
# 显示测试摘要
# ======================================================
show_summary() {
    echo ""
    echo "========================================================"
    echo "  测试摘要"
    echo "========================================================"
    echo -e "总测试数: ${BLUE}$TOTAL_TESTS${NC}"
    echo -e "通过: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "失败: ${RED}$FAILED_TESTS${NC}"

    if [ $FAILED_TESTS -eq 0 ]; then
        echo ""
        echo -e "${GREEN}🎉 所有测试通过！部署成功！${NC}"
        echo ""
        echo -e "${BLUE}📋 访问地址：${NC}"
        echo "  - https://zhitoujianli.com"
        echo "  - https://www.zhitoujianli.com"
        echo ""
        echo -e "${BLUE}📚 查看日志：${NC}"
        echo "  sudo tail -f /var/log/nginx/zhitoujianli_access.log"
        echo "  sudo tail -f /var/log/nginx/zhitoujianli_error.log"
    else
        echo ""
        echo -e "${RED}❌ 部分测试失败，请检查配置${NC}"
        echo ""
        echo -e "${BLUE}📋 故障排查：${NC}"
        echo "  1. 检查 Nginx 错误日志："
        echo "     sudo tail -50 /var/log/nginx/error.log"
        echo ""
        echo "  2. 检查配置语法："
        echo "     sudo nginx -t"
        echo ""
        echo "  3. 重新加载配置："
        echo "     sudo systemctl reload nginx"
    fi

    echo "========================================================"
}

# ======================================================
# 主函数
# ======================================================
main() {
    echo ""
    echo "========================================================"
    echo "  智投简历 - 部署验证测试"
    echo "========================================================"
    echo ""

    # 执行所有测试
    test_nginx_status
    test_config_exists
    test_nginx_syntax
    test_ssl_certificate
    test_https_redirect
    test_https_access
    test_cors_preflight
    test_cors_actual_request
    test_security_headers
    test_log_files

    # 显示摘要
    show_summary

    # 返回适当的退出码
    if [ $FAILED_TESTS -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# 执行主函数
main

