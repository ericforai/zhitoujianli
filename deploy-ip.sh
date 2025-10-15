#!/bin/bash

# ============================================
# 智投简历 - IP临时部署脚本
# ============================================
# 使用场景: 域名审核期间，使用IP地址HTTP访问
# IP地址: 115.190.182.95
# ⚠️ 域名审核通过后改用 deploy-production.sh
# ============================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "          智投简历 - IP临时部署脚本"
echo "          IP地址: 115.190.182.95"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 第一步：配置检查
log_info "第1步: 检查配置文件..."

if [ ! -f "backend/get_jobs/.env" ]; then
    log_warn "未找到后端配置文件，使用IP配置模板"
    cp backend/get_jobs/.env.ip backend/get_jobs/.env
fi

if [ ! -f "frontend/.env" ]; then
    log_warn "未找到前端配置文件，使用IP配置模板"
    cp frontend/.env.ip frontend/.env
fi

# 检查Authing配置
AUTHING_CHECK=$(grep "AUTHING_APP_ID=" backend/get_jobs/.env | grep -v "填写")
if [ -z "$AUTHING_CHECK" ]; then
    log_error "⚠️ Authing配置未完成"
    log_warn "请先配置Authing，参考: AUTHING_CONFIGURATION_GUIDE.md"
    log_warn "或暂时使用 SECURITY_ENABLED=false 跳过认证"
    read -p "是否继续部署（使用测试模式）？[y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

log_success "配置文件检查完成"
echo ""

# 第二步：停止旧服务
log_info "第2步: 停止旧版本服务..."

# 停止后端
if [ -f "/tmp/backend.pid" ]; then
    kill $(cat /tmp/backend.pid) 2>/dev/null || true
    log_success "旧后端服务已停止"
fi

# 停止前端  
if [ -f "/tmp/frontend.pid" ]; then
    kill $(cat /tmp/frontend.pid) 2>/dev/null || true
    log_success "旧前端服务已停止"
fi

sleep 2
echo ""

# 第三步：编译后端
log_info "第3步: 编译后端..."

cd backend/get_jobs
mvn clean package -DskipTests -q

if [ ! -f "target/get_jobs-v2.0.1.jar" ]; then
    log_error "后端编译失败"
    exit 1
fi

log_success "后端编译完成"
cd ../..
echo ""

# 第四步：构建前端
log_info "第4步: 构建前端..."

cd frontend
# 使用IP配置构建
cp .env.ip .env
npm install --silent
npm run build --silent

if [ ! -d "build" ]; then
    log_error "前端构建失败"
    exit 1
fi

log_success "前端构建完成"
cd ..
echo ""

# 第五步：部署Nginx（如果使用）
if command -v nginx &> /dev/null; then
    log_info "第5步: 配置Nginx..."
    
    # 备份旧配置
    if [ -f "/etc/nginx/sites-enabled/zhitoujianli.conf" ]; then
        sudo cp /etc/nginx/sites-enabled/zhitoujianli.conf /etc/nginx/sites-enabled/zhitoujianli.conf.bak
    fi
    
    # 复制新配置
    sudo cp nginx-ip.conf /etc/nginx/sites-available/zhitoujianli-ip.conf
    sudo ln -sf /etc/nginx/sites-available/zhitoujianli-ip.conf /etc/nginx/sites-enabled/
    
    # 测试配置
    sudo nginx -t
    
    # 重启Nginx
    sudo systemctl reload nginx
    
    log_success "Nginx配置完成"
else
    log_warn "Nginx未安装，跳过"
fi
echo ""

# 第六步：启动后端
log_info "第6步: 启动后端服务..."

cd backend/get_jobs
nohup mvn spring-boot:run > /tmp/backend_ip.log 2>&1 &
echo $! > /tmp/backend.pid
log_success "后端服务已启动，PID: $(cat /tmp/backend.pid)"
cd ../..

# 等待后端启动
sleep 10
echo ""

# 第七步：健康检查
log_info "第7步: 健康检查..."

for i in {1..20}; do
    if curl -s http://localhost:8080/api/auth/health > /dev/null; then
        log_success "后端服务健康检查通过"
        break
    fi
    if [ $i -eq 20 ]; then
        log_error "后端服务健康检查失败"
        log_warn "查看日志: tail -f /tmp/backend_ip.log"
        exit 1
    fi
    sleep 2
done

echo ""

# 第八步：显示部署信息
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "              🎉 IP临时部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
log_success "部署完成时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "📍 服务访问地址:"
echo "   前端: http://115.190.182.95"
echo "   后端API: http://115.190.182.95:8080"
echo ""
echo "🧪 测试地址:"
echo "   登录页: http://115.190.182.95/login"
echo "   注册页: http://115.190.182.95/register"
echo "   API健康: http://115.190.182.95:8080/api/auth/health"
echo ""
echo "📋 查看日志:"
echo "   后端: tail -f /tmp/backend_ip.log"
echo ""
echo "⚠️ 重要提醒:"
echo "   1. 这是临时IP部署，域名审核通过后立即升级"
echo "   2. 目前使用HTTP，域名部署后必须启用HTTPS"
echo "   3. 如Authing未配置，注册/登录功能不可用"
echo ""
echo "🔑 配置Authing:"
echo "   参考文档: cat AUTHING_CONFIGURATION_GUIDE.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
