#!/bin/bash

# ============================================================
# 智投简历 - 环境验证脚本
# ============================================================
# 功能：验证环境配置、依赖、服务状态
# 使用方法：bash scripts/verify-env.sh
# ============================================================

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 项目根目录
PROJECT_ROOT="/root/zhitoujianli"

# 成功和失败计数
SUCCESS_COUNT=0
FAIL_COUNT=0

# 检查函数
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((SUCCESS_COUNT++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAIL_COUNT++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# 检查环境变量文件
check_env_files() {
    print_header "检查环境变量文件"

    # 前端环境变量
    if [ -f "$PROJECT_ROOT/frontend/.env.production" ]; then
        check_pass "前端生产环境配置文件存在"
    else
        check_fail "缺少前端生产环境配置文件"
    fi

    if [ -f "$PROJECT_ROOT/frontend/.env.development" ]; then
        check_pass "前端开发环境配置文件存在"
    else
        check_fail "缺少前端开发环境配置文件"
    fi

    # 后端环境变量
    if [ -f "$PROJECT_ROOT/backend/get_jobs/.env" ]; then
        check_pass "后端环境配置文件存在"

        # 检查关键配置项
        if grep -q "JWT_SECRET=your_super_secret" "$PROJECT_ROOT/backend/get_jobs/.env"; then
            check_warn "JWT_SECRET 使用默认值，请修改"
        else
            check_pass "JWT_SECRET 已自定义"
        fi

        if grep -q "DB_PASSWORD=your_database_password" "$PROJECT_ROOT/backend/get_jobs/.env"; then
            check_warn "DB_PASSWORD 使用默认值，请修改"
        else
            check_pass "DB_PASSWORD 已自定义"
        fi
    else
        check_fail "缺少后端环境配置文件"
    fi
}

# 检查Nginx配置
check_nginx() {
    print_header "检查 Nginx 配置"

    if [ -f "$PROJECT_ROOT/zhitoujianli.conf" ]; then
        check_pass "项目 Nginx 配置文件存在"
    else
        check_fail "项目 Nginx 配置文件不存在"
    fi

    if [ -f "/etc/nginx/sites-available/zhitoujianli" ]; then
        check_pass "系统 Nginx 配置文件存在"
    else
        check_fail "系统 Nginx 配置文件不存在"
    fi

    if [ -L "/etc/nginx/sites-enabled/zhitoujianli" ]; then
        check_pass "Nginx 配置已启用"
    else
        check_fail "Nginx 配置未启用"
    fi

    # 测试 Nginx 配置
    if nginx -t 2>&1 | grep -q "successful"; then
        check_pass "Nginx 配置语法正确"
    else
        check_fail "Nginx 配置语法错误"
    fi
}

# 检查服务状态
check_services() {
    print_header "检查服务状态"

    # Nginx
    if systemctl is-active --quiet nginx; then
        check_pass "Nginx 服务运行中"
    else
        check_fail "Nginx 服务未运行"
    fi

    # 后端服务
    if pgrep -f "get_jobs-v2.0.1.jar" > /dev/null; then
        check_pass "后端服务运行中"
    else
        check_warn "后端服务未运行"
    fi

    # PostgreSQL（如果有）
    if systemctl is-active --quiet postgresql 2>/dev/null; then
        check_pass "PostgreSQL 数据库运行中"
    else
        check_warn "PostgreSQL 数据库未运行（可能未安装）"
    fi
}

# 检查端口监听
check_ports() {
    print_header "检查端口监听"

    if netstat -tlnp | grep -q ":80 "; then
        check_pass "端口 80 (HTTP) 监听中"
    else
        check_warn "端口 80 (HTTP) 未监听"
    fi

    if netstat -tlnp | grep -q ":443 "; then
        check_pass "端口 443 (HTTPS) 监听中"
    else
        check_warn "端口 443 (HTTPS) 未监听"
    fi

    if netstat -tlnp | grep -q ":8080 "; then
        check_pass "端口 8080 (后端API) 监听中"
    else
        check_warn "端口 8080 (后端API) 未监听"
    fi
}

# 检查SSL证书
check_ssl() {
    print_header "检查 SSL 证书"

    if [ -f "/etc/letsencrypt/live/zhitoujianli.com/fullchain.pem" ]; then
        check_pass "SSL 证书文件存在"

        # 检查证书有效期
        expiry_date=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/zhitoujianli.com/fullchain.pem 2>/dev/null | cut -d= -f2)
        if [ -n "$expiry_date" ]; then
            check_pass "证书有效期至: $expiry_date"
        fi
    else
        check_warn "SSL 证书文件不存在（可能使用其他证书路径）"
    fi
}

# 检查依赖
check_dependencies() {
    print_header "检查系统依赖"

    # Node.js
    if command -v node &> /dev/null; then
        check_pass "Node.js 已安装 ($(node -v))"
    else
        check_fail "Node.js 未安装"
    fi

    # npm
    if command -v npm &> /dev/null; then
        check_pass "npm 已安装 ($(npm -v))"
    else
        check_fail "npm 未安装"
    fi

    # Java
    if command -v java &> /dev/null; then
        check_pass "Java 已安装 ($(java -version 2>&1 | head -n 1))"
    else
        check_fail "Java 未安装"
    fi

    # Maven
    if command -v mvn &> /dev/null; then
        check_pass "Maven 已安装 ($(mvn -v 2>&1 | head -n 1))"
    else
        check_fail "Maven 未安装"
    fi

    # Nginx
    if command -v nginx &> /dev/null; then
        check_pass "Nginx 已安装 ($(nginx -v 2>&1))"
    else
        check_fail "Nginx 未安装"
    fi
}

# 检查构建产物
check_build_artifacts() {
    print_header "检查构建产物"

    # 前端构建
    if [ -d "$PROJECT_ROOT/frontend/build" ]; then
        check_pass "前端构建目录存在"

        if [ -f "$PROJECT_ROOT/frontend/build/index.html" ]; then
            check_pass "前端入口文件存在"
        else
            check_warn "前端入口文件不存在"
        fi
    else
        check_warn "前端构建目录不存在（需要运行 npm run build）"
    fi

    # 后端构建
    if [ -f "$PROJECT_ROOT/backend/get_jobs/target/get_jobs-v2.0.1.jar" ]; then
        check_pass "后端 JAR 文件存在"
    else
        check_warn "后端 JAR 文件不存在（需要运行 mvn clean package）"
    fi
}

# 总结
print_summary() {
    print_header "验证总结"

    echo -e "成功: ${GREEN}$SUCCESS_COUNT${NC}"
    echo -e "失败: ${RED}$FAIL_COUNT${NC}"

    if [ $FAIL_COUNT -eq 0 ]; then
        echo -e "\n${GREEN}✓ 所有检查通过！${NC}"
        return 0
    else
        echo -e "\n${RED}✗ 存在 $FAIL_COUNT 个问题需要解决${NC}"
        return 1
    fi
}

# 主函数
main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}智投简历 - 环境验证${NC}"
    echo -e "${BLUE}========================================${NC}"

    check_dependencies
    check_env_files
    check_nginx
    check_ssl
    check_services
    check_ports
    check_build_artifacts
    print_summary
}

# 执行
main


