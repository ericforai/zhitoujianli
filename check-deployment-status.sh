#!/bin/bash

# 检查部署状态脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 检查智投简历部署状态${NC}"
echo "=================================="

# 检查Git状态
echo -e "\n${BLUE}📋 Git状态检查:${NC}"
echo "当前分支: $(git branch --show-current)"
echo "最新提交: $(git log -1 --oneline)"
echo "远程状态: $(git status -sb | grep -o '\[.*\]')"

# 检查GitHub Actions状态
echo -e "\n${BLUE}🚀 GitHub Actions状态:${NC}"
echo "检查最近的部署状态..."

# 检查前端构建状态
echo -e "\n${BLUE}📱 前端构建检查:${NC}"
if [ -d "frontend/build" ]; then
    echo "✅ 前端构建目录存在"
    echo "构建时间: $(stat -c %y frontend/build 2>/dev/null || echo '未知')"
else
    echo "❌ 前端构建目录不存在"
fi

# 检查后端构建状态
echo -e "\n${BLUE}🔧 后端构建检查:${NC}"
if [ -f "backend/get_jobs/target/get_jobs-v2.0.1.jar" ]; then
    echo "✅ 后端JAR文件存在"
    echo "构建时间: $(stat -c %y backend/get_jobs/target/get_jobs-v2.0.1.jar 2>/dev/null || echo '未知')"
else
    echo "❌ 后端JAR文件不存在"
fi

# 检查环境变量配置
echo -e "\n${BLUE}⚙️ 环境变量检查:${NC}"
echo "检查volcano-deployment.yml配置..."
if grep -q "REACT_APP_API_URL=/api" volcano-deployment.yml; then
    echo "✅ API URL配置正确 (使用相对路径)"
else
    echo "❌ API URL配置可能有问题"
fi

if grep -q "SITE_URL=https://zhitoujianli.com" volcano-deployment.yml; then
    echo "✅ SITE URL配置正确 (使用HTTPS)"
else
    echo "❌ SITE URL配置可能有问题"
fi

# 检查生产环境状态
echo -e "\n${BLUE}🌐 生产环境检查:${NC}"
echo "测试生产环境API..."

# 测试API端点
if curl -s -f "https://zhitoujianli.com/api/status" > /dev/null 2>&1; then
    echo "✅ 生产环境API可访问"
else
    echo "❌ 生产环境API不可访问"
fi

# 测试注册API
if curl -s -X POST "https://zhitoujianli.com/api/auth/send-verification-code" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}' > /dev/null 2>&1; then
    echo "✅ 注册API可访问"
else
    echo "❌ 注册API不可访问或返回错误"
fi

# 检查浏览器缓存问题
echo -e "\n${BLUE}💾 缓存问题检查:${NC}"
echo "如果注册功能仍有问题，可能是以下原因:"
echo "1. 浏览器缓存了旧版本的代码"
echo "2. 生产环境尚未重新部署"
echo "3. CDN缓存未更新"

echo -e "\n${YELLOW}🔧 建议的解决方案:${NC}"
echo "1. 强制刷新页面 (Ctrl+F5 或 Cmd+Shift+R)"
echo "2. 清除浏览器缓存"
echo "3. 使用无痕模式访问"
echo "4. 等待GitHub Actions部署完成 (通常需要2-5分钟)"

echo -e "\n${GREEN}✅ 部署状态检查完成${NC}"
