#!/bin/bash

###############################################################################
# CORS 修复测试脚本
#
# 功能：自动化测试 CORS 配置是否正确
#
# 使用方法：
#   chmod +x scripts/test-cors-fix.sh
#   ./scripts/test-cors-fix.sh
#
# 作者：Cursor AI Assistant
# 日期：2025-10-16
###############################################################################

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🧪 CORS 配置测试${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 测试 1: 测试生产环境 API（从 www 域名）
echo -e "${YELLOW}测试 1: 从 www.zhitoujianli.com 访问 API${NC}"
echo "发送 OPTIONS 预检请求..."
echo ""

response=$(curl -s -I -X OPTIONS \
  https://zhitoujianli.com/api/auth/send-verification-code \
  -H "Origin: https://www.zhitoujianli.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  2>&1)

# 检查 Access-Control-Allow-Origin
if echo "$response" | grep -q "Access-Control-Allow-Origin"; then
    allow_origin=$(echo "$response" | grep "Access-Control-Allow-Origin" | cut -d':' -f2- | tr -d '\r\n ')
    echo -e "${GREEN}✅ Access-Control-Allow-Origin: $allow_origin${NC}"
else
    echo -e "${RED}❌ 缺少 Access-Control-Allow-Origin 头部${NC}"
fi

# 检查 Access-Control-Allow-Methods
if echo "$response" | grep -q "Access-Control-Allow-Methods"; then
    allow_methods=$(echo "$response" | grep "Access-Control-Allow-Methods" | cut -d':' -f2- | tr -d '\r\n ')
    echo -e "${GREEN}✅ Access-Control-Allow-Methods: $allow_methods${NC}"
else
    echo -e "${RED}❌ 缺少 Access-Control-Allow-Methods 头部${NC}"
fi

# 检查 Access-Control-Allow-Credentials
if echo "$response" | grep -q "Access-Control-Allow-Credentials"; then
    allow_creds=$(echo "$response" | grep "Access-Control-Allow-Credentials" | cut -d':' -f2- | tr -d '\r\n ')
    echo -e "${GREEN}✅ Access-Control-Allow-Credentials: $allow_creds${NC}"
else
    echo -e "${RED}❌ 缺少 Access-Control-Allow-Credentials 头部${NC}"
fi

echo ""

# 测试 2: 测试生产环境 API（从非 www 域名）
echo -e "${YELLOW}测试 2: 从 zhitoujianli.com 访问 API${NC}"
echo "发送 OPTIONS 预检请求..."
echo ""

response=$(curl -s -I -X OPTIONS \
  https://zhitoujianli.com/api/auth/send-verification-code \
  -H "Origin: https://zhitoujianli.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  2>&1)

if echo "$response" | grep -q "Access-Control-Allow-Origin"; then
    allow_origin=$(echo "$response" | grep "Access-Control-Allow-Origin" | cut -d':' -f2- | tr -d '\r\n ')
    echo -e "${GREEN}✅ Access-Control-Allow-Origin: $allow_origin${NC}"
else
    echo -e "${RED}❌ 缺少 Access-Control-Allow-Origin 头部${NC}"
fi

echo ""

# 测试 3: 测试后端服务状态
echo -e "${YELLOW}测试 3: 后端服务健康检查${NC}"

if curl -s -f http://localhost:8080/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 后端服务运行正常（localhost:8080）${NC}"
else
    echo -e "${YELLOW}⚠️  无法访问后端健康检查接口${NC}"
    echo "   这可能是正常的（如果后端未配置健康检查端点）"
fi

echo ""

# 测试 4: 测试 Nginx 配置
echo -e "${YELLOW}测试 4: Nginx 配置检查${NC}"

if command -v nginx &> /dev/null; then
    if sudo nginx -t > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Nginx 配置语法正确${NC}"
    else
        echo -e "${RED}❌ Nginx 配置存在错误${NC}"
        sudo nginx -t
    fi
else
    echo -e "${YELLOW}⚠️  Nginx 未安装或不可用${NC}"
fi

echo ""

# 测试 5: 检查环境变量文件
echo -e "${YELLOW}测试 5: 环境变量文件检查${NC}"

if [ -f "/root/zhitoujianli/frontend/.env.production" ]; then
    echo -e "${GREEN}✅ .env.production 已创建${NC}"
else
    echo -e "${RED}❌ .env.production 不存在${NC}"
    echo "   运行: cp /root/zhitoujianli/frontend/env.production.example .env.production"
fi

if [ -f "/root/zhitoujianli/frontend/.env.development" ]; then
    echo -e "${GREEN}✅ .env.development 已创建${NC}"
else
    echo -e "${RED}❌ .env.development 不存在${NC}"
    echo "   运行: cp /root/zhitoujianli/frontend/env.development.example .env.development"
fi

echo ""

# 总结
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}📊 测试总结${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}✅ 如果所有测试都通过，说明 CORS 配置正确${NC}"
echo -e "${YELLOW}❌ 如果有测试失败，请参考 CORS_FIX_GUIDE.md 排查${NC}"
echo ""
echo -e "${YELLOW}📋 手动测试步骤：${NC}"
echo "1. 访问: https://www.zhitoujianli.com/register"
echo "2. 打开浏览器开发者工具（F12）"
echo "3. 输入邮箱并点击\"发送验证码\""
echo "4. 检查 Console: 应该没有 CORS 错误"
echo "5. 检查 Network: 响应头应包含正确的 CORS 头部"
echo ""

