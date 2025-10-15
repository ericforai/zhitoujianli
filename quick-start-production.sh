#!/bin/bash

# ============================================
# 智投简历 - 快速启动生产服务
# ============================================
# 用于快速启动/重启生产环境服务
# ============================================

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   智投简历 - 快速启动生产服务${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查是否在项目根目录
if [ ! -f "docker-compose.production.yml" ]; then
    echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 停止现有服务
echo -e "${YELLOW}[1/5] 停止现有服务...${NC}"
docker compose -f docker-compose.production.yml down 2>/dev/null || true
echo -e "${GREEN}✓ 服务已停止${NC}"
echo ""

# 清理旧容器和镜像
echo -e "${YELLOW}[2/5] 清理旧容器...${NC}"
docker container prune -f > /dev/null 2>&1 || true
echo -e "${GREEN}✓ 清理完成${NC}"
echo ""

# 检查必要文件
echo -e "${YELLOW}[3/5] 检查配置文件...${NC}"

# 检查SSL证书
if [ ! -f "ssl/zhitoujianli.com.crt" ] || [ ! -f "ssl/zhitoujianli.com.key" ]; then
    echo -e "${YELLOW}警告: SSL证书不存在，生成自签名证书...${NC}"
    mkdir -p ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/zhitoujianli.com.key \
        -out ssl/zhitoujianli.com.crt \
        -subj "/C=CN/ST=Beijing/L=Beijing/O=ZhiTouJianLi/CN=www.zhitoujianli.com" \
        > /dev/null 2>&1
    echo -e "${GREEN}✓ 自签名证书已生成${NC}"
else
    echo -e "${GREEN}✓ SSL证书已存在${NC}"
fi

# 检查环境变量
if [ ! -f "backend/get_jobs/.env.production" ]; then
    echo -e "${YELLOW}警告: 环境变量文件不存在，创建默认配置...${NC}"
    mkdir -p backend/get_jobs
    cat > backend/get_jobs/.env.production << 'EOF'
SPRING_PROFILES_ACTIVE=production
SERVER_PORT=8080
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=zhitoujianli
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key_please_change_this
JWT_EXPIRATION=86400000
CORS_ALLOWED_ORIGINS=https://www.zhitoujianli.com,https://blog.zhitoujianli.com
LOGGING_LEVEL_ROOT=INFO
EOF
    echo -e "${RED}⚠ 请修改 backend/get_jobs/.env.production 中的配置！${NC}"
fi

# 创建必要目录
mkdir -p logs/nginx ssl certbot/conf certbot/www backend/get_jobs/data
echo -e "${GREEN}✓ 配置检查完成${NC}"
echo ""

# 启动服务
echo -e "${YELLOW}[4/5] 启动Docker服务...${NC}"
echo -e "${BLUE}这可能需要几分钟时间，请耐心等待...${NC}"
docker compose -f docker-compose.production.yml up -d --build

echo -e "${GREEN}✓ 服务已启动${NC}"
echo ""

# 等待服务启动
echo -e "${YELLOW}[5/5] 等待服务启动...${NC}"
sleep 15

# 健康检查
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   服务健康检查${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查后端
echo -n "后端服务 (8080): "
if curl -sf http://localhost:8080/api/auth/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 正常${NC}"
else
    echo -e "${RED}✗ 异常${NC}"
fi

# 检查前端
echo -n "前端服务 (3000): "
if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 正常${NC}"
else
    echo -e "${RED}✗ 异常${NC}"
fi

# 检查Blog
echo -n "Blog服务 (4321): "
if curl -sf http://localhost:4321 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 正常${NC}"
else
    echo -e "${RED}✗ 异常${NC}"
fi

# 检查Nginx
echo -n "Nginx服务 ( 80 ): "
if curl -sf http://localhost > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 正常${NC}"
else
    echo -e "${RED}✗ 异常${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Docker容器状态${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
docker compose -f docker-compose.production.yml ps

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   访问地址${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}主站:${NC} https://www.zhitoujianli.com"
echo -e "${GREEN}Blog:${NC} https://blog.zhitoujianli.com"
echo -e "${GREEN}Blog路径:${NC} https://www.zhitoujianli.com/blog/"
echo ""
echo -e "${YELLOW}内部服务 (仅本地访问):${NC}"
echo -e "  后端API: http://localhost:8080/api"
echo -e "  前端: http://localhost:3000"
echo -e "  Blog: http://localhost:4321"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   常用管理命令${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "查看日志: ${YELLOW}docker compose -f docker-compose.production.yml logs -f${NC}"
echo -e "停止服务: ${YELLOW}docker compose -f docker-compose.production.yml down${NC}"
echo -e "重启服务: ${YELLOW}docker compose -f docker-compose.production.yml restart${NC}"
echo -e "查看状态: ${YELLOW}docker compose -f docker-compose.production.yml ps${NC}"
echo ""
echo -e "${GREEN}✓ 启动完成！${NC}"
echo ""

