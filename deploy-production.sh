#!/bin/bash

# ============================================
# 智投简历 - 生产环境一键部署脚本
# ============================================
# 功能: 自动化部署前后端到生产环境
# 使用: ./deploy-production.sh
# ============================================

set -e  # 遇到错误立即退出

# 颜色定义
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

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 打印标题
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "          智投简历 - 生产环境部署脚本"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 第一步：环境检查
log_info "第1步: 检查部署环境..."

# 检查必要的工具
command -v docker >/dev/null 2>&1 || { log_error "Docker未安装"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { log_error "Docker Compose未安装"; exit 1; }
command -v git >/dev/null 2>&1 || { log_error "Git未安装"; exit 1; }

log_success "环境检查通过"
echo ""

# 第二步：配置文件检查
log_info "第2步: 检查配置文件..."

if [ ! -f "backend/get_jobs/.env.production" ]; then
    log_error "未找到后端生产配置文件: backend/get_jobs/.env.production"
    log_warn "请先创建配置文件，参考: ENV_SETUP_GUIDE.md"
    exit 1
fi

if [ ! -f "frontend/.env.production" ]; then
    log_error "未找到前端生产配置文件: frontend/.env.production"
    log_warn "请先创建配置文件"
    exit 1
fi

# 检查JWT_SECRET是否配置
JWT_SECRET=$(grep "^JWT_SECRET=" backend/get_jobs/.env.production | cut -d'=' -f2)
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-256-bit-secret-key-here" ]; then
    log_error "JWT_SECRET未配置或使用默认值"
    log_warn "请使用 'openssl rand -base64 48' 生成新密钥"
    exit 1
fi

# 检查Authing配置
AUTHING_APP_ID=$(grep "^AUTHING_APP_ID=" backend/get_jobs/.env.production | cut -d'=' -f2)
if [ -z "$AUTHING_APP_ID" ] || [ "$AUTHING_APP_ID" = "your-app-id" ]; then
    log_error "Authing配置未完成"
    log_warn "请在.env.production中配置Authing相关信息"
    exit 1
fi

log_success "配置文件检查通过"
echo ""

# 第三步：备份当前版本
log_info "第3步: 备份当前运行的服务..."

if [ -d "backup" ]; then
    BACKUP_DIR="backup/backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # 备份配置文件
    [ -f "docker-compose.yml" ] && cp docker-compose.yml "$BACKUP_DIR/"
    [ -d "logs" ] && cp -r logs "$BACKUP_DIR/"
    
    log_success "备份完成: $BACKUP_DIR"
else
    mkdir -p backup
    log_warn "首次部署，跳过备份"
fi
echo ""

# 第四步：停止旧服务
log_info "第4步: 停止旧版本服务..."

if [ -f "docker-compose.yml" ] || [ -f "docker-compose.production.yml" ]; then
    docker-compose -f docker-compose.production.yml down 2>/dev/null || true
    log_success "旧服务已停止"
else
    log_warn "未发现运行中的服务"
fi
echo ""

# 第五步：构建前端
log_info "第5步: 构建前端生产版本..."

cd frontend
npm install --production=false
npm run build

if [ ! -d "build" ]; then
    log_error "前端构建失败"
    exit 1
fi

log_success "前端构建完成"
cd ..
echo ""

# 第六步：构建后端
log_info "第6步: 构建后端生产版本..."

cd backend/get_jobs
mvn clean package -DskipTests -Pprod

if [ ! -f "target/*.jar" ]; then
    log_error "后端构建失败"
    exit 1
fi

log_success "后端构建完成"
cd ../..
echo ""

# 第七步：构建Docker镜像
log_info "第7步: 构建Docker镜像..."

docker-compose -f docker-compose.production.yml build

log_success "Docker镜像构建完成"
echo ""

# 第八步：启动服务
log_info "第8步: 启动生产环境服务..."

docker-compose -f docker-compose.production.yml up -d

log_success "服务启动成功"
echo ""

# 第九步：健康检查
log_info "第9步: 等待服务启动并进行健康检查..."

sleep 10

# 检查后端健康
for i in {1..30}; do
    if curl -s http://localhost:8080/api/auth/health > /dev/null; then
        log_success "后端服务健康检查通过"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "后端服务健康检查失败"
        docker-compose -f docker-compose.production.yml logs backend
        exit 1
    fi
    sleep 2
done

# 检查前端可访问
if curl -s http://localhost:80 > /dev/null; then
    log_success "前端服务可访问"
else
    log_warn "前端服务可能未正常启动"
fi

echo ""

# 第十步：显示部署信息
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "              🎉 生产环境部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
log_success "部署完成时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "服务访问地址:"
echo "  - 前端: http://localhost (或 https://zhitoujianli.com)"
echo "  - 后端API: http://localhost:8080"
echo ""
echo "查看服务状态:"
echo "  docker-compose -f docker-compose.production.yml ps"
echo ""
echo "查看日志:"
echo "  docker-compose -f docker-compose.production.yml logs -f"
echo ""
echo "停止服务:"
echo "  docker-compose -f docker-compose.production.yml down"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
