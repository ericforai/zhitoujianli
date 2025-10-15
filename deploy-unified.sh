#!/bin/bash

# 智投简历统一部署脚本
# 使用统一的路径配置，确保部署一致性

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 加载配置
CONFIG_FILE="/root/zhitoujianli/deployment-config.yaml"
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}错误: 配置文件不存在 $CONFIG_FILE${NC}"
    exit 1
fi

# 解析配置（简化版本）
PROJECT_ROOT="/root/zhitoujianli"
FRONTEND_BUILD_DIR="$PROJECT_ROOT/frontend/build"
FRONTEND_PRODUCTION_DIR="/usr/share/nginx/html"
BACKEND_DIR="$PROJECT_ROOT/backend/get_jobs"
BLOG_BUILD_DIR="$PROJECT_ROOT/blog/zhitoujianli-blog/dist"
BLOG_PRODUCTION_DIR="/usr/share/nginx/html"
NGINX_CONFIG="/etc/nginx/sites-available/zhitoujianli-ssl"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   智投简历统一部署脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 函数：记录部署日志
log_deploy() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a /var/log/zhitoujianli-deploy.log
}

# 函数：检查服务状态
check_service() {
    local service=$1
    local port=$2
    
    if netstat -tlnp | grep -q ":$port "; then
        echo -e "${GREEN}✓ $service 服务运行正常 (端口 $port)${NC}"
        return 0
    else
        echo -e "${RED}✗ $service 服务未运行 (端口 $port)${NC}"
        return 1
    fi
}

# 函数：备份当前版本
backup_current_version() {
    local backup_dir="/var/www/html.backup.$(date +%Y%m%d_%H%M%S)"
    
    log_deploy "开始备份当前版本到 $backup_dir"
    
    if [ -d "$FRONTEND_PRODUCTION_DIR" ]; then
        cp -r "$FRONTEND_PRODUCTION_DIR" "$backup_dir"
        echo -e "${GREEN}✓ 前端文件已备份到 $backup_dir${NC}"
    fi
    
    # 清理旧备份（保留最近5个）
    find /var/www -name "html.backup.*" -type d | sort | head -n -5 | xargs rm -rf 2>/dev/null || true
}

# 函数：部署前端
deploy_frontend() {
    echo -e "${YELLOW}[1/4] 部署前端...${NC}"
    
    if [ ! -d "$FRONTEND_BUILD_DIR" ]; then
        echo -e "${RED}错误: 前端构建目录不存在 $FRONTEND_BUILD_DIR${NC}"
        echo -e "${YELLOW}正在构建前端...${NC}"
        cd "$PROJECT_ROOT/frontend"
        npm run build
    fi
    
    # 备份当前版本
    backup_current_version
    
    # 复制新文件
    cp -r "$FRONTEND_BUILD_DIR"/* "$FRONTEND_PRODUCTION_DIR/"
    chown -R www-data:www-data "$FRONTEND_PRODUCTION_DIR"
    chmod -R 755 "$FRONTEND_PRODUCTION_DIR"
    
    log_deploy "前端部署完成"
    echo -e "${GREEN}✓ 前端部署完成${NC}"
}

# 函数：部署后端
deploy_backend() {
    echo -e "${YELLOW}[2/4] 部署后端...${NC}"
    
    cd "$BACKEND_DIR"
    
    # 停止现有后端服务
    if [ -f "/root/zhitoujianli/backend.pid" ]; then
        local pid=$(cat /root/zhitoujianli/backend.pid)
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}停止现有后端服务...${NC}"
            kill $pid
            sleep 3
        fi
    fi
    
    # 构建后端
    mvn clean package -DskipTests -Dcheckstyle.skip=true
    
    # 启动后端服务
    nohup mvn spring-boot:run -DskipTests -Dcheckstyle.skip=true > /tmp/backend.log 2>&1 &
    echo $! > /root/zhitoujianli/backend.pid
    
    # 等待服务启动
    sleep 10
    
    if check_service "后端" 8080; then
        log_deploy "后端部署完成"
        echo -e "${GREEN}✓ 后端部署完成${NC}"
    else
        echo -e "${RED}✗ 后端启动失败${NC}"
        return 1
    fi
}

# 函数：部署博客
deploy_blog() {
    echo -e "${YELLOW}[3/4] 部署博客...${NC}"
    
    cd "$PROJECT_ROOT/blog/zhitoujianli-blog"
    
    # 构建博客
    npm run build
    
    # 复制静态文件
    if [ -d "$BLOG_BUILD_DIR" ]; then
        cp -r "$BLOG_BUILD_DIR"/* "$BLOG_PRODUCTION_DIR/"
        chown -R www-data:www-data "$BLOG_PRODUCTION_DIR"
        chmod -R 755 "$BLOG_PRODUCTION_DIR"
        
        log_deploy "博客部署完成"
        echo -e "${GREEN}✓ 博客部署完成${NC}"
    else
        echo -e "${RED}错误: 博客构建目录不存在${NC}"
        return 1
    fi
}

# 函数：重启Nginx
restart_nginx() {
    echo -e "${YELLOW}[4/4] 重启Nginx...${NC}"
    
    # 测试nginx配置
    if nginx -t; then
        systemctl restart nginx
        sleep 3
        
        if check_service "Nginx" 80; then
            log_deploy "Nginx重启完成"
            echo -e "${GREEN}✓ Nginx重启完成${NC}"
        else
            echo -e "${RED}✗ Nginx启动失败${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ Nginx配置测试失败${NC}"
        return 1
    fi
}

# 函数：验证部署
verify_deployment() {
    echo -e "${BLUE}验证部署结果...${NC}"
    
    local success=true
    
    # 检查服务状态
    check_service "后端" 8080 || success=false
    check_service "Nginx" 80 || success=false
    
    # 检查前端文件
    if [ -f "$FRONTEND_PRODUCTION_DIR/index.html" ]; then
        echo -e "${GREEN}✓ 前端文件存在${NC}"
    else
        echo -e "${RED}✗ 前端文件缺失${NC}"
        success=false
    fi
    
    # 测试API
    if curl -s http://localhost:8080/api/auth/send-verification-code -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com"}' | grep -q "success"; then
        echo -e "${GREEN}✓ 后端API正常${NC}"
    else
        echo -e "${RED}✗ 后端API异常${NC}"
        success=false
    fi
    
    if [ "$success" = true ]; then
        echo -e "${GREEN}🎉 部署验证成功！${NC}"
        log_deploy "部署验证成功"
    else
        echo -e "${RED}❌ 部署验证失败${NC}"
        log_deploy "部署验证失败"
        return 1
    fi
}

# 主部署流程
main() {
    local start_time=$(date +%s)
    
    log_deploy "开始统一部署流程"
    
    deploy_frontend
    deploy_backend
    deploy_blog
    restart_nginx
    verify_deployment
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}🎉 统一部署完成！耗时: ${duration}秒${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    log_deploy "统一部署完成，耗时: ${duration}秒"
}

# 执行主函数
main "$@"
