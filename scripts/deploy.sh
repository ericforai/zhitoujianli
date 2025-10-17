#!/bin/bash

# ============================================================
# 智投简历 - 统一部署脚本
# ============================================================
# 功能：前端构建、后端构建、Nginx配置更新、服务重启
# 环境：火山云服务器 (115.190.182.95)
# 使用方法：sudo bash scripts/deploy.sh [frontend|backend|nginx|all]
# ============================================================

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="/root/zhitoujianli"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend/get_jobs"
NGINX_CONF="$PROJECT_ROOT/zhitoujianli.conf"

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

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用 sudo 运行此脚本"
        exit 1
    fi
}

# 部署前端
deploy_frontend() {
    log_info "开始部署前端..."

    cd "$FRONTEND_DIR" || exit 1

    # 检查环境变量文件
    if [ ! -f ".env.production" ]; then
        log_error "缺少 .env.production 文件"
        exit 1
    fi

    # 安装依赖（如果需要）
    if [ ! -d "node_modules" ]; then
        log_info "安装前端依赖..."
        npm install
    fi

    # 构建前端
    log_info "构建前端应用..."
    npm run build

    # 检查构建输出
    if [ ! -d "build" ]; then
        log_error "前端构建失败，build 目录不存在"
        exit 1
    fi

    log_success "前端部署完成"
}

# 部署后端
deploy_backend() {
    log_info "开始部署后端..."

    cd "$BACKEND_DIR" || exit 1

    # 检查环境变量文件
    if [ ! -f ".env" ]; then
        log_warning "缺少 .env 文件，请确保已配置环境变量"
    fi

    # Maven 构建
    log_info "构建后端应用（Maven）..."
    mvn clean package -DskipTests

    # 检查构建输出
    if [ ! -f "target/get_jobs-v2.0.1.jar" ]; then
        log_error "后端构建失败，JAR 文件不存在"
        exit 1
    fi

    # 重启后端服务
    log_info "重启后端服务..."

    # 查找并停止旧的 Java 进程
    if pgrep -f "get_jobs-v2.0.1.jar" > /dev/null; then
        log_info "停止旧的后端进程..."
        pkill -f "get_jobs-v2.0.1.jar" || true
        sleep 2
    fi

    # 启动新的后端服务（后台运行）
    log_info "启动后端服务..."
    nohup java -jar target/get_jobs-v2.0.1.jar > logs/backend.log 2>&1 &

    # 保存进程ID
    echo $! > backend.pid

    sleep 3

    # 验证服务启动
    if pgrep -f "get_jobs-v2.0.1.jar" > /dev/null; then
        log_success "后端服务启动成功（PID: $(cat backend.pid)）"
    else
        log_error "后端服务启动失败，请检查日志"
        exit 1
    fi
}

# 更新 Nginx 配置
deploy_nginx() {
    log_info "开始更新 Nginx 配置..."

    # 复制配置文件
    log_info "复制 Nginx 配置到系统目录..."
    cp "$NGINX_CONF" /etc/nginx/sites-available/zhitoujianli

    # 创建软链接（如果不存在）
    if [ ! -L "/etc/nginx/sites-enabled/zhitoujianli" ]; then
        log_info "创建 Nginx 配置软链接..."
        ln -sf /etc/nginx/sites-available/zhitoujianli /etc/nginx/sites-enabled/zhitoujianli
    fi

    # 测试 Nginx 配置
    log_info "测试 Nginx 配置..."
    nginx -t

    # 重载 Nginx
    log_info "重载 Nginx..."
    systemctl reload nginx

    # 检查 Nginx 状态
    if systemctl is-active --quiet nginx; then
        log_success "Nginx 配置更新成功"
    else
        log_error "Nginx 服务未运行"
        exit 1
    fi
}

# 验证部署
verify_deployment() {
    log_info "验证部署状态..."

    # 检查 Nginx
    if systemctl is-active --quiet nginx; then
        log_success "✓ Nginx 运行正常"
    else
        log_warning "✗ Nginx 未运行"
    fi

    # 检查后端服务
    if pgrep -f "get_jobs-v2.0.1.jar" > /dev/null; then
        log_success "✓ 后端服务运行正常"
    else
        log_warning "✗ 后端服务未运行"
    fi

    # 检查前端构建
    if [ -d "$FRONTEND_DIR/build" ]; then
        log_success "✓ 前端构建文件存在"
    else
        log_warning "✗ 前端构建文件不存在"
    fi

    # 检查端口监听
    log_info "检查端口监听状态..."
    netstat -tlnp | grep -E ':(80|443|8080)' || log_warning "某些端口未监听"

    log_success "部署验证完成"
}

# 主函数
main() {
    check_root

    local deploy_target="${1:-all}"

    log_info "=========================================="
    log_info "智投简历 - 部署脚本"
    log_info "目标: $deploy_target"
    log_info "=========================================="

    case "$deploy_target" in
        frontend)
            deploy_frontend
            ;;
        backend)
            deploy_backend
            ;;
        nginx)
            deploy_nginx
            ;;
        all)
            deploy_frontend
            deploy_backend
            deploy_nginx
            verify_deployment
            ;;
        verify)
            verify_deployment
            ;;
        *)
            log_error "未知的部署目标: $deploy_target"
            log_info "使用方法: $0 [frontend|backend|nginx|all|verify]"
            exit 1
            ;;
    esac

    log_success "=========================================="
    log_success "部署完成！"
    log_success "=========================================="
}

# 执行主函数
main "$@"


