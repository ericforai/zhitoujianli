#!/bin/bash

# 启动后端服务脚本

set -e

echo "🚀 启动Spring Boot后端服务..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 停止可能正在运行的服务
echo -e "${BLUE}⏹️  停止现有服务...${NC}"
pkill -f "get_jobs-v2.0.1.jar" || true

# 设置环境变量
export AUTHING_APP_SECRET="dummy_secret_for_testing"
export AUTHING_USER_POOL_ID="68db6e4c4f248dd866413bc2"
export AUTHING_APP_ID="68db6e4e85de9cb8daf2b3d2"
export DEEPSEEK_API_KEY="dummy_key_for_testing"
export BASE_URL="https://api.deepseek.com"
export MODEL="deepseek-chat"
export JWT_SECRET="dummy_jwt_secret_for_testing_12345"
export SECURITY_ENABLED="false"  # 暂时禁用安全认证
export SERVER_PORT="8080"

# 启动后端服务
echo -e "${BLUE}🔄 启动后端服务...${NC}"
cd /root/zhitoujianli/backend/get_jobs

# 后台启动服务
nohup java -jar target/get_jobs-v2.0.1.jar \
    --server.port=8080 \
    --spring.profiles.active=development \
    > backend.log 2>&1 &

# 获取进程ID
BACKEND_PID=$!
echo $BACKEND_PID > backend.pid

echo -e "${BLUE}⏳ 等待服务启动...${NC}"
sleep 10

# 检查服务状态
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✅ 后端服务启动成功！${NC}"
    echo -e "${BLUE}📍 进程ID: $BACKEND_PID${NC}"
    echo -e "${BLUE}📍 服务地址: http://localhost:8080${NC}"
    echo -e "${BLUE}📍 日志文件: backend.log${NC}"
else
    echo -e "${RED}❌ 后端服务启动失败${NC}"
    echo -e "${YELLOW}📋 查看日志:${NC}"
    tail -20 backend.log
    exit 1
fi

# 测试API接口
echo -e "${BLUE}🧪 测试API接口...${NC}"
if curl -s http://localhost:8080/api/status > /dev/null; then
    echo -e "${GREEN}✅ API接口正常${NC}"
else
    echo -e "${YELLOW}⚠️  API接口测试失败，请检查日志${NC}"
fi

echo -e "${GREEN}🎉 后端服务部署完成！${NC}"
