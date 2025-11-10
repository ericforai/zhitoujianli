#!/bin/bash

################################################################################
# 多租户安全验证脚本
# 功能：系统性检查多租户数据隔离，确保用户数据不会互相看到
# 使用方法：./scripts/verify-multi-tenant-security.sh
################################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 统计变量
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# 打印检查项
print_check() {
    echo -e "${BLUE}[检查]${NC} $1"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
}

# 打印通过
print_pass() {
    echo -e "${GREEN}[通过]${NC} $1"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
}

# 打印失败
print_fail() {
    echo -e "${RED}[失败]${NC} $1"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
}

# 打印警告
print_warn() {
    echo -e "${YELLOW}[警告]${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     多租户安全验证脚本                               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. 检查SECURITY_ENABLED配置
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1. 安全认证配置检查${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

print_check "检查SECURITY_ENABLED配置"
if [ -f "/etc/zhitoujianli/backend.env" ]; then
    SECURITY_ENABLED=$(grep "^SECURITY_ENABLED=" /etc/zhitoujianli/backend.env | cut -d'=' -f2)
    if [ "$SECURITY_ENABLED" = "true" ]; then
        print_pass "SECURITY_ENABLED=true (生产环境正确配置)"
    else
        print_fail "SECURITY_ENABLED=$SECURITY_ENABLED (生产环境必须为true)"
    fi
else
    print_warn "环境变量文件不存在: /etc/zhitoujianli/backend.env"
fi

# 2. 检查代码中的用户ID获取
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2. 用户身份验证检查${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

print_check "检查Controller是否使用getCurrentUserId()"
CONTROLLER_COUNT=$(find backend/get_jobs/src/main/java/controller -name "*.java" 2>/dev/null | wc -l)
if [ "$CONTROLLER_COUNT" -gt 0 ]; then
    CONTROLLERS_WITH_USERID=$(grep -r "getCurrentUserId" backend/get_jobs/src/main/java/controller/ 2>/dev/null | wc -l)
    if [ "$CONTROLLERS_WITH_USERID" -gt 0 ]; then
        print_pass "发现 $CONTROLLERS_WITH_USERID 处使用getCurrentUserId()"
    else
        print_warn "未发现getCurrentUserId()使用，请检查Controller代码"
    fi
else
    print_warn "未找到Controller目录"
fi

print_check "检查是否有硬编码用户ID"
HARDCODED_USERS=$(grep -r "default_user\|user_123\|test_user" backend/get_jobs/src/main/java/ 2>/dev/null | grep -v "//\|test\|Test" | wc -l)
if [ "$HARDCODED_USERS" -eq 0 ]; then
    print_pass "未发现硬编码用户ID"
else
    print_fail "发现 $HARDCODED_USERS 处硬编码用户ID"
    grep -r "default_user\|user_123\|test_user" backend/get_jobs/src/main/java/ 2>/dev/null | grep -v "//\|test\|Test" | head -5
fi

# 3. 检查文件路径隔离
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3. 文件路径隔离检查${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

print_check "检查文件操作是否使用用户隔离路径"
SHARED_PATHS=$(grep -r "user_data/default\|user_data/shared" backend/get_jobs/src/main/java/ 2>/dev/null | grep -v "//\|test\|Test\|backup" | wc -l)
if [ "$SHARED_PATHS" -eq 0 ]; then
    print_pass "未发现共享文件路径"
else
    print_fail "发现 $SHARED_PATHS 处共享文件路径"
    grep -r "user_data/default\|user_data/shared" backend/get_jobs/src/main/java/ 2>/dev/null | grep -v "//\|test\|Test\|backup" | head -5
fi

print_check "检查Boss Cookie文件路径隔离"
COOKIE_PATHS=$(grep -r "boss_cookie\|cookie.json" backend/get_jobs/src/main/java/ 2>/dev/null | grep -v "userId\|getCurrentUserId\|sanitize" | wc -l)
if [ "$COOKIE_PATHS" -eq 0 ]; then
    print_pass "Boss Cookie文件路径已隔离"
else
    print_warn "发现 $COOKIE_PATHS 处Cookie路径，请确认已使用用户ID隔离"
fi

# 4. 检查数据库查询隔离
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}4. 数据库查询隔离检查${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

print_check "检查Repository查询是否包含用户ID过滤"
if [ -d "backend/get_jobs/src/main/java/repository" ]; then
    REPO_QUERIES=$(find backend/get_jobs/src/main/java/repository -name "*.java" 2>/dev/null | wc -l)
    if [ "$REPO_QUERIES" -gt 0 ]; then
        # 检查是否有不包含userId的查询（排除管理员查询）
        GLOBAL_QUERIES=$(grep -r "@Query" backend/get_jobs/src/main/java/repository/ 2>/dev/null | grep -v "userId\|admin\|count\|COUNT" | wc -l)
        if [ "$GLOBAL_QUERIES" -eq 0 ]; then
            print_pass "Repository查询已包含用户ID过滤"
        else
            print_warn "发现 $GLOBAL_QUERIES 处可能缺少用户ID过滤的查询"
        fi
    fi
else
    print_warn "未找到Repository目录"
fi

# 5. 检查用户数据目录隔离
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}5. 用户数据目录隔离检查${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

print_check "检查用户数据目录结构"
USER_DATA_DIR="/opt/zhitoujianli/backend/user_data"
if [ -d "$USER_DATA_DIR" ]; then
    USER_DIRS=$(find "$USER_DATA_DIR" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)
    if [ "$USER_DIRS" -gt 0 ]; then
        print_pass "发现 $USER_DIRS 个用户数据目录"

        # 检查是否有default_user目录
        if [ -d "$USER_DATA_DIR/default_user" ]; then
            print_warn "发现default_user目录，建议迁移到具体用户目录"
        else
            print_pass "未发现default_user目录"
        fi

        # 检查目录权限
        WRITABLE_DIRS=$(find "$USER_DATA_DIR" -type d ! -perm 700 2>/dev/null | wc -l)
        if [ "$WRITABLE_DIRS" -eq 0 ]; then
            print_pass "用户数据目录权限正确"
        else
            print_warn "发现 $WRITABLE_DIRS 个目录权限可能不安全"
        fi
    else
        print_warn "用户数据目录为空"
    fi
else
    print_warn "用户数据目录不存在: $USER_DATA_DIR"
fi

# 6. 检查路径安全
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}6. 路径安全检查${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

print_check "检查路径清理函数"
SANITIZE_FUNCTIONS=$(grep -r "sanitize\|clean.*userId\|replace.*\\.\\." backend/get_jobs/src/main/java/util/ 2>/dev/null | wc -l)
if [ "$SANITIZE_FUNCTIONS" -gt 0 ]; then
    print_pass "发现路径清理函数"
else
    print_warn "未发现路径清理函数，请确认路径安全"
fi

print_check "检查路径遍历防护"
PATH_TRAVERSAL=$(grep -r "\.\\.\|\.\\./" backend/get_jobs/src/main/java/ 2>/dev/null | grep -v "//\|test\|Test\|\.\.\." | wc -l)
if [ "$PATH_TRAVERSAL" -eq 0 ]; then
    print_pass "未发现明显的路径遍历漏洞"
else
    print_warn "发现 $PATH_TRAVERSAL 处可能涉及路径遍历的代码，请检查"
fi

# 7. 检查敏感信息保护
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}7. 敏感信息保护检查${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

print_check "检查硬编码密钥"
HARDCODED_KEYS=$(grep -r "sk-\|password.*=.*\"\|api.*key.*=.*\"" backend/get_jobs/src/main/java/ 2>/dev/null | grep -v "//\|example\|test\|Test\|env\|getenv" | wc -l)
if [ "$HARDCODED_KEYS" -eq 0 ]; then
    print_pass "未发现硬编码密钥"
else
    print_fail "发现 $HARDCODED_KEYS 处可能硬编码的密钥"
    grep -r "sk-\|password.*=.*\"\|api.*key.*=.*\"" backend/get_jobs/src/main/java/ 2>/dev/null | grep -v "//\|example\|test\|Test\|env\|getenv" | head -3
fi

print_check "检查日志中的敏感信息"
SENSITIVE_LOGS=$(grep -r "log.*password\|log.*token\|log.*secret" backend/get_jobs/src/main/java/ 2>/dev/null | grep -v "//\|test\|Test" | wc -l)
if [ "$SENSITIVE_LOGS" -eq 0 ]; then
    print_pass "日志中未发现敏感信息泄露"
else
    print_warn "发现 $SENSITIVE_LOGS 处日志可能包含敏感信息"
fi

# 8. 总结报告
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}验证总结${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "总检查项: ${BLUE}$TOTAL_CHECKS${NC}"
echo -e "通过: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "失败: ${RED}$FAILED_CHECKS${NC}"
echo -e "警告: ${YELLOW}$WARNINGS${NC}"

echo ""

if [ "$FAILED_CHECKS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "${GREEN}✅ 所有检查通过！多租户隔离安全。${NC}"
    exit 0
elif [ "$FAILED_CHECKS" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  检查通过，但有 $WARNINGS 个警告，建议修复。${NC}"
    exit 0
else
    echo -e "${RED}❌ 发现 $FAILED_CHECKS 个严重问题，必须修复后才能上线！${NC}"
    exit 1
fi

