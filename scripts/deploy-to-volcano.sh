#!/bin/bash

# 火山云部署脚本
# 智投简历项目 - 火山云部署

set -e

echo "🌋 开始部署到火山云..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker未安装，请先安装Docker${NC}"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose未安装，请先安装Docker Compose${NC}"
    exit 1
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  环境变量文件不存在，创建示例文件...${NC}"
    cat > .env << EOF
# 火山云部署环境变量
AUTHING_APP_SECRET=your_authing_app_secret
DEEPSEEK_API_KEY=your_deepseek_api_key
MYSQL_HOST=your_mysql_host
MYSQL_PORT=3306
MYSQL_DATABASE=zhitoujianli
MYSQL_USERNAME=your_mysql_username
MYSQL_PASSWORD=your_mysql_password
EOF
    echo -e "${YELLOW}⚠️  请编辑 .env 文件，填入正确的环境变量${NC}"
    exit 1
fi

# 检查SSL证书
if [ ! -f "nginx/ssl/zhitoujianli.com.crt" ] || [ ! -f "nginx/ssl/zhitoujianli.com.key" ]; then
    echo -e "${YELLOW}⚠️  SSL证书不存在，创建自签名证书...${NC}"
    mkdir -p nginx/ssl
    
    # 生成自签名证书
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/zhitoujianli.com.key \
        -out nginx/ssl/zhitoujianli.com.crt \
        -subj "/C=CN/ST=Beijing/L=Beijing/O=ZhiTouJianLi/OU=IT/CN=zhitoujianli.com"
    
    echo -e "${GREEN}✅ 自签名证书已生成${NC}"
fi

# 停止现有容器
echo -e "${BLUE}🔄 停止现有容器...${NC}"
docker-compose -f volcano-deployment.yml down || true

# 清理旧的镜像
echo -e "${BLUE}🧹 清理旧的镜像...${NC}"
docker system prune -f

# 构建并启动服务
echo -e "${BLUE}🏗️  构建并启动服务...${NC}"
docker-compose -f volcano-deployment.yml up --build -d

# 等待服务启动
echo -e "${BLUE}⏳ 等待服务启动...${NC}"
sleep 30

# 检查服务状态
echo -e "${BLUE}🔍 检查服务状态...${NC}"
docker-compose -f volcano-deployment.yml ps

# 检查服务健康状态
echo -e "${BLUE}🏥 检查服务健康状态...${NC}"

# 检查前端服务
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 前端服务运行正常${NC}"
else
    echo -e "${RED}❌ 前端服务启动失败${NC}"
fi

# 检查后端服务
if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 后端服务运行正常${NC}"
else
    echo -e "${RED}❌ 后端服务启动失败${NC}"
fi

# 检查博客服务
if curl -f http://localhost:4321 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 博客服务运行正常${NC}"
else
    echo -e "${RED}❌ 博客服务启动失败${NC}"
fi

# 显示部署信息
echo -e "${GREEN}🎉 部署完成！${NC}"
echo ""
echo -e "${BLUE}📋 服务访问地址：${NC}"
echo -e "   - 前端: http://localhost:80"
echo -e "   - 后端API: http://localhost:8080/api"
echo -e "   - 博客: http://localhost:4321/blog"
echo -e "   - HTTPS: https://zhitoujianli.com (需要配置域名解析)"
echo ""
echo -e "${BLUE}🔧 管理命令：${NC}"
echo -e "   - 查看日志: docker-compose -f volcano-deployment.yml logs -f"
echo -e "   - 停止服务: docker-compose -f volcano-deployment.yml down"
echo -e "   - 重启服务: docker-compose -f volcano-deployment.yml restart"
echo ""
echo -e "${BLUE}📝 下一步：${NC}"
echo -e "   1. 配置域名解析到服务器IP"
echo -e "   2. 申请SSL证书替换自签名证书"
echo -e "   3. 配置防火墙开放80和443端口"
echo -e "   4. 测试外网访问"

# 显示容器资源使用情况
echo -e "${BLUE}📊 容器资源使用情况：${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

