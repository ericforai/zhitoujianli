#!/bin/bash

# ======================================================
# 智投简历 - Nginx 自动部署脚本
# 功能：自动部署 Nginx 配置并验证
# 作者：智投简历团队
# 更新时间：2025-10-16
# ======================================================

set -e  # 遇到错误立即退出

# 颜色输出配置
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ======================================================
# 1. 环境检查
# ======================================================
check_environment() {
    log_info "开始环境检查..."

    # 检查是否为 root 用户
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用 root 权限运行此脚本（使用 sudo）"
        exit 1
    fi

    # 检查 Nginx 是否安装
    if ! command -v nginx &> /dev/null; then
        log_error "Nginx 未安装，请先安装 Nginx"
        exit 1
    fi

    log_success "环境检查通过"
}

# ======================================================
# 2. 备份现有配置
# ======================================================
backup_config() {
    log_info "备份现有 Nginx 配置..."

    BACKUP_DIR="/etc/nginx/backups"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)

    # 创建备份目录
    mkdir -p "$BACKUP_DIR"

    # 备份配置文件（如果存在）
    if [ -f "/etc/nginx/conf.d/zhitoujianli.conf" ]; then
        cp /etc/nginx/conf.d/zhitoujianli.conf "$BACKUP_DIR/zhitoujianli.conf.$TIMESTAMP"
        log_success "配置文件已备份到: $BACKUP_DIR/zhitoujianli.conf.$TIMESTAMP"
    else
        log_warning "未找到现有配置文件，跳过备份"
    fi
}

# ======================================================
# 3. 部署新配置
# ======================================================
deploy_config() {
    log_info "部署新的 Nginx 配置..."

    # 获取脚本所在目录
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    CONFIG_SRC="$SCRIPT_DIR/../nginx/zhitoujianli.conf"
    CONFIG_DEST="/etc/nginx/conf.d/zhitoujianli.conf"

    # 检查源配置文件是否存在
    if [ ! -f "$CONFIG_SRC" ]; then
        log_error "配置文件不存在: $CONFIG_SRC"
        exit 1
    fi

    # 复制配置文件
    cp "$CONFIG_SRC" "$CONFIG_DEST"
    log_success "配置文件已复制到: $CONFIG_DEST"

    # 设置正确的权限
    chmod 644 "$CONFIG_DEST"
    chown root:root "$CONFIG_DEST"
}

# ======================================================
# 4. 验证配置语法
# ======================================================
validate_config() {
    log_info "验证 Nginx 配置语法..."

    if nginx -t; then
        log_success "Nginx 配置语法验证通过"
    else
        log_error "Nginx 配置语法验证失败，请检查配置文件"
        log_warning "正在恢复备份..."

        # 恢复备份（如果存在）
        LATEST_BACKUP=$(ls -t /etc/nginx/backups/zhitoujianli.conf.* 2>/dev/null | head -1)
        if [ -n "$LATEST_BACKUP" ]; then
            cp "$LATEST_BACKUP" /etc/nginx/conf.d/zhitoujianli.conf
            log_success "已恢复备份配置"
        fi

        exit 1
    fi
}

# ======================================================
# 5. 检查 SSL 证书
# ======================================================
check_ssl_cert() {
    log_info "检查 SSL 证书..."

    CERT_PATH="/etc/letsencrypt/live/zhitoujianli.com/fullchain.pem"
    KEY_PATH="/etc/letsencrypt/live/zhitoujianli.com/privkey.pem"

    if [ ! -f "$CERT_PATH" ] || [ ! -f "$KEY_PATH" ]; then
        log_warning "SSL 证书不存在！"
        log_warning "请运行以下命令获取 Let's Encrypt 证书："
        log_warning "sudo certbot certonly --nginx -d zhitoujianli.com -d www.zhitoujianli.com"

        read -p "是否继续部署？(y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        log_success "SSL 证书检查通过"

        # 显示证书过期时间
        EXPIRY_DATE=$(openssl x509 -enddate -noout -in "$CERT_PATH" | cut -d= -f2)
        log_info "证书过期时间: $EXPIRY_DATE"
    fi
}

# ======================================================
# 6. 重载 Nginx 服务
# ======================================================
reload_nginx() {
    log_info "重载 Nginx 服务..."

    if systemctl reload nginx; then
        log_success "Nginx 服务重载成功"
    else
        log_error "Nginx 服务重载失败"
        exit 1
    fi

    # 检查 Nginx 状态
    if systemctl is-active --quiet nginx; then
        log_success "Nginx 服务运行正常"
    else
        log_error "Nginx 服务未运行"
        exit 1
    fi
}

# ======================================================
# 7. 测试 CORS 配置
# ======================================================
test_cors() {
    log_info "测试 CORS 配置..."

    # 测试 API 端点（OPTIONS 预检请求）
    log_info "发送 OPTIONS 预检请求..."

    CORS_TEST_URL="https://zhitoujianli.com/api/auth/send-verification-code"
    ORIGIN="https://www.zhitoujianli.com"

    RESPONSE=$(curl -s -I -X OPTIONS \
        -H "Origin: $ORIGIN" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type,Authorization" \
        "$CORS_TEST_URL" 2>&1 || true)

    if echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
        log_success "CORS 配置测试通过"
        log_info "CORS 响应头："
        echo "$RESPONSE" | grep -i "access-control"
    else
        log_warning "未检测到 CORS 响应头，可能需要检查配置"
    fi
}

# ======================================================
# 8. 显示部署信息
# ======================================================
show_deployment_info() {
    echo ""
    echo "========================================================"
    log_success "✅ Nginx 配置部署完成！"
    echo "========================================================"
    echo ""
    log_info "📋 部署信息："
    echo "  - 配置文件: /etc/nginx/conf.d/zhitoujianli.conf"
    echo "  - 备份目录: /etc/nginx/backups/"
    echo "  - 访问地址: https://zhitoujianli.com"
    echo "  - 访问地址: https://www.zhitoujianli.com"
    echo ""
    log_info "🧪 验证命令："
    echo "  1. 检查 Nginx 状态:"
    echo "     sudo systemctl status nginx"
    echo ""
    echo "  2. 测试 CORS（从浏览器控制台运行）:"
    echo "     fetch('https://zhitoujianli.com/api/auth/send-verification-code', {"
    echo "       method: 'POST',"
    echo "       headers: { 'Content-Type': 'application/json' },"
    echo "       body: JSON.stringify({ email: 'test@example.com' })"
    echo "     }).then(r => console.log('Success:', r))"
    echo ""
    echo "  3. 查看 Nginx 日志:"
    echo "     sudo tail -f /var/log/nginx/zhitoujianli_access.log"
    echo "     sudo tail -f /var/log/nginx/zhitoujianli_error.log"
    echo ""
    echo "  4. 测试 HTTPS 重定向:"
    echo "     curl -I http://zhitoujianli.com"
    echo ""
    log_info "📚 更多信息请查看部署文档"
    echo "========================================================"
}

# ======================================================
# 主函数
# ======================================================
main() {
    echo ""
    echo "========================================================"
    echo "  智投简历 - Nginx 自动部署脚本"
    echo "========================================================"
    echo ""

    check_environment
    backup_config
    deploy_config
    validate_config
    check_ssl_cert
    reload_nginx
    test_cors
    show_deployment_info

    log_success "🎉 部署流程全部完成！"
}

# 执行主函数
main

