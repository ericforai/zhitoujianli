#!/bin/bash

# 紧急修复部署脚本
# 用于立即修复注册功能的混合内容错误

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚨 紧急修复部署脚本${NC}"
echo "=================================="

# 检查当前目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

echo -e "\n${BLUE}📋 检查当前状态:${NC}"
echo "当前目录: $(pwd)"
echo "Git状态: $(git status -sb | head -1)"

# 1. 拉取最新代码
echo -e "\n${BLUE}🔄 拉取最新代码:${NC}"
git pull origin main

# 2. 检查前端构建
echo -e "\n${BLUE}📱 检查前端构建:${NC}"
if [ -d "frontend/build" ]; then
    echo "✅ 前端构建目录存在"
    echo "构建时间: $(stat -c %y frontend/build 2>/dev/null || echo '未知')"
else
    echo "❌ 前端构建目录不存在，开始构建..."
    cd frontend
    npm ci
    npm run build
    cd ..
fi

# 3. 检查后端构建
echo -e "\n${BLUE}🔧 检查后端构建:${NC}"
if [ -f "backend/get_jobs/target/get_jobs-v2.0.1.jar" ]; then
    echo "✅ 后端JAR文件存在"
    echo "构建时间: $(stat -c %y backend/get_jobs/target/get_jobs-v2.0.1.jar 2>/dev/null || echo '未知')"
else
    echo "❌ 后端JAR文件不存在，开始构建..."
    cd backend/get_jobs
    mvn clean package -DskipTests
    cd ../..
fi

# 4. 检查关键文件
echo -e "\n${BLUE}🔍 检查关键文件:${NC}"

# 检查Register组件
if grep -q "/api/auth/send-verification-code" frontend/src/components/Register.tsx; then
    echo "✅ Register组件使用相对路径"
else
    echo "❌ Register组件可能仍有硬编码地址"
fi

# 检查环境配置
if grep -q "REACT_APP_API_URL=/api" volcano-deployment.yml; then
    echo "✅ 火山云配置使用相对路径"
else
    echo "❌ 火山云配置可能有问题"
fi

# 5. 重启服务
echo -e "\n${BLUE}🔄 重启服务:${NC}"
echo "重启Nginx..."
sudo systemctl restart nginx

echo "重启后端服务..."
sudo systemctl restart zhitoujianli

# 6. 等待服务启动
echo -e "\n${BLUE}⏳ 等待服务启动:${NC}"
sleep 10

# 7. 验证服务状态
echo -e "\n${BLUE}✅ 验证服务状态:${NC}"

# 检查Nginx状态
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx服务运行正常"
else
    echo "❌ Nginx服务异常"
fi

# 检查后端服务状态
if systemctl is-active --quiet zhitoujianli; then
    echo "✅ 后端服务运行正常"
else
    echo "❌ 后端服务异常"
fi

# 8. 测试API
echo -e "\n${BLUE}🧪 测试API:${NC}"

# 测试API状态
if curl -s -f "http://localhost:8080/api/status" > /dev/null; then
    echo "✅ 后端API可访问"
else
    echo "❌ 后端API不可访问"
fi

# 测试前端
if curl -s -f "http://localhost" > /dev/null; then
    echo "✅ 前端服务可访问"
else
    echo "❌ 前端服务不可访问"
fi

# 9. 测试注册API
echo -e "\n${BLUE}📧 测试注册API:${NC}"
if curl -s -X POST "http://localhost:8080/api/auth/send-verification-code" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}' > /dev/null; then
    echo "✅ 注册API测试成功"
else
    echo "❌ 注册API测试失败"
fi

echo -e "\n${GREEN}🎉 紧急修复部署完成！${NC}"
echo -e "\n${YELLOW}📋 下一步:${NC}"
echo "1. 访问 https://zhitoujianli.com/simple-api-test.html 测试API"
echo "2. 访问 https://zhitoujianli.com/register 测试注册功能"
echo "3. 如果仍有问题，请检查浏览器缓存"

echo -e "\n${BLUE}🔧 管理命令:${NC}"
echo "查看Nginx日志: sudo tail -f /var/log/nginx/error.log"
echo "查看后端日志: sudo journalctl -u zhitoujianli -f"
echo "重启Nginx: sudo systemctl restart nginx"
echo "重启后端: sudo systemctl restart zhitoujianli"

