#!/bin/bash

# ============================================
# 智投简历 - 生产环境部署脚本 (www.zhitoujianli.com)
# ============================================
# 功能：
# - 部署前端、后端和Blog服务到生产环境
# - 配置Nginx反向代理
# - 支持HTTPS和SSL证书
# ============================================

set -e  # 遇到错误立即退出

# 颜色输出
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

# 检查是否为root用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用root用户或sudo运行此脚本"
        exit 1
    fi
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi

    log_success "Docker环境检查通过"
}

# 停止现有服务
stop_services() {
    log_info "停止现有服务..."

    # 停止Docker容器
    if docker ps -a | grep -E "(zhitoujianli|blog)" > /dev/null 2>&1; then
        docker-compose -f docker-compose.production.yml down || true
        log_success "Docker服务已停止"
    fi

    # 停止可能运行的独立进程
    if [ -f "backend.pid" ]; then
        kill $(cat backend.pid) 2>/dev/null || true
        rm backend.pid
    fi

    if [ -f "frontend.pid" ]; then
        kill $(cat frontend.pid) 2>/dev/null || true
        rm frontend.pid
    fi

    if [ -f "blog/zhitoujianli-blog/frontend.pid" ]; then
        kill $(cat blog/zhitoujianli-blog/frontend.pid) 2>/dev/null || true
        rm blog/zhitoujianli-blog/frontend.pid
    fi

    log_success "所有服务已停止"
}

# 构建前端
build_frontend() {
    log_info "构建前端应用..."

    cd frontend

    # 安装依赖
    if [ ! -d "node_modules" ]; then
        log_info "安装前端依赖..."
        npm ci
    fi

    # 构建生产版本
    log_info "构建前端生产版本..."
    REACT_APP_API_URL=https://www.zhitoujianli.com npm run build

    cd ..
    log_success "前端构建完成"
}

# 构建后端
build_backend() {
    log_info "构建后端应用..."

    cd backend/get_jobs

    # Maven构建
    log_info "运行Maven构建..."
    mvn clean package -DskipTests

    cd ../..
    log_success "后端构建完成"
}

# 构建Blog
build_blog() {
    log_info "构建Blog应用..."

    cd blog/zhitoujianli-blog

    # 安装依赖
    if [ ! -d "node_modules" ]; then
        log_info "安装Blog依赖..."
        npm ci
    fi

    # 构建生产版本
    log_info "构建Blog生产版本..."
    npm run build

    cd ../..
    log_success "Blog构建完成"
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."

    mkdir -p logs/nginx
    mkdir -p ssl
    mkdir -p certbot/conf
    mkdir -p certbot/www
    mkdir -p backend/get_jobs/data

    log_success "目录创建完成"
}

# 配置SSL证书
setup_ssl() {
    log_info "检查SSL证书..."

    if [ ! -f "ssl/zhitoujianli.com.crt" ] || [ ! -f "ssl/zhitoujianli.com.key" ]; then
        log_warning "未找到SSL证书，将生成自签名证书用于测试"
        log_warning "生产环境请使用正式的SSL证书"

        # 生成自签名证书
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/zhitoujianli.com.key \
            -out ssl/zhitoujianli.com.crt \
            -subj "/C=CN/ST=Beijing/L=Beijing/O=ZhiTouJianLi/CN=www.zhitoujianli.com"

        log_success "自签名证书已生成"
    else
        log_success "SSL证书已存在"
    fi
}

# 配置环境变量
setup_env() {
    log_info "配置环境变量..."

    # 后端环境变量
    if [ ! -f "backend/get_jobs/.env.production" ]; then
        cat > backend/get_jobs/.env.production << 'EOF'
# 生产环境配置
SPRING_PROFILES_ACTIVE=production
SERVER_PORT=8080

# 数据库配置（请修改为实际值）
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=zhitoujianli
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_password

# JWT配置
JWT_SECRET=your_jwt_secret_key_please_change_this_in_production
JWT_EXPIRATION=86400000

# Authing配置
AUTHING_APP_ID=your_authing_app_id
AUTHING_APP_SECRET=your_authing_app_secret
AUTHING_USER_POOL_ID=your_user_pool_id

# DeepSeek API配置
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_URL=https://api.deepseek.com

# CORS配置
CORS_ALLOWED_ORIGINS=https://www.zhitoujianli.com,https://blog.zhitoujianli.com

# 日志配置
LOGGING_LEVEL_ROOT=INFO
LOGGING_FILE_PATH=/app/logs
EOF
        log_warning "已创建默认环境变量文件，请修改 backend/get_jobs/.env.production"
    fi

    log_success "环境变量配置完成"
}

# 使用Docker Compose启动服务
start_services_docker() {
    log_info "使用Docker Compose启动所有服务..."

    # 启动服务
    docker-compose -f docker-compose.production.yml up -d --build

    log_success "Docker服务已启动"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."

    # 等待服务启动
    sleep 10

    # 检查后端
    log_info "检查后端服务..."
    if curl -f http://localhost:8080/api/auth/health > /dev/null 2>&1; then
        log_success "✓ 后端服务正常"
    else
        log_error "✗ 后端服务异常"
    fi

    # 检查前端
    log_info "检查前端服务..."
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_success "✓ 前端服务正常"
    else
        log_error "✗ 前端服务异常"
    fi

    # 检查Blog
    log_info "检查Blog服务..."
    if curl -f http://localhost:4321 > /dev/null 2>&1; then
        log_success "✓ Blog服务正常"
    else
        log_error "✗ Blog服务异常"
    fi

    # 检查Nginx
    log_info "检查Nginx服务..."
    if curl -f http://localhost:80 > /dev/null 2>&1; then
        log_success "✓ Nginx服务正常"
    else
        log_error "✗ Nginx服务异常"
    fi
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "============================================"
    echo "           部署完成！"
    echo "============================================"
    echo ""
    echo "访问地址："
    echo "  主站: https://www.zhitoujianli.com"
    echo "  Blog: https://blog.zhitoujianli.com"
    echo "  Blog (路径): https://www.zhitoujianli.com/blog/"
    echo ""
    echo "后台管理："
    echo "  后端API: http://localhost:8080/api"
    echo "  前端: http://localhost:3000"
    echo "  Blog: http://localhost:4321"
    echo ""
    echo "日志文件："
    echo "  Nginx: ./logs/nginx/"
    echo "  后端: ./logs/"
    echo ""
    echo "管理命令："
    echo "  查看服务状态: docker-compose -f docker-compose.production.yml ps"
    echo "  查看日志: docker-compose -f docker-compose.production.yml logs -f"
    echo "  停止服务: docker-compose -f docker-compose.production.yml down"
    echo "  重启服务: docker-compose -f docker-compose.production.yml restart"
    echo ""
    echo "重要提醒："
    echo "  1. 请确保域名DNS已正确解析到服务器IP"
    echo "  2. 如使用自签名证书，浏览器会有安全警告"
    echo "  3. 生产环境请使用正式SSL证书 (Let's Encrypt)"
    echo "  4. 请修改环境变量文件中的敏感信息"
    echo ""
    echo "============================================"
}

# 主函数
main() {
    log_info "开始部署智投简历生产环境 (www.zhitoujianli.com)..."
    echo ""

    # 执行部署步骤
    check_root
    check_docker
    stop_services
    create_directories
    setup_ssl
    setup_env
    build_frontend
    build_backend
    build_blog
    start_services_docker
    health_check
    show_deployment_info

    log_success "部署完成！"
}

# 运行主函数
main "$@"


