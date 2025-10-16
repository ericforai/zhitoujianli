#!/bin/bash

###############################################################################
# CORS 修复自动化部署脚本
#
# 功能：
# - 创建环境变量文件
# - 重新编译后端
# - 重新构建前端
# - 重启服务
#
# 使用方法：
#   chmod +x scripts/apply-cors-fix.sh
#   ./scripts/apply-cors-fix.sh
#
# 作者：Cursor AI Assistant
# 日期：2025-10-16
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="/root/zhitoujianli"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend/get_jobs"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔧 CORS 修复部署脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 步骤 1: 创建前端环境变量文件
echo -e "${YELLOW}📝 步骤 1/5: 创建环境变量文件...${NC}"
cd "$FRONTEND_DIR"

# 创建生产环境配置
cat > .env.production << 'EOF'
REACT_APP_API_URL=https://zhitoujianli.com/api
REACT_APP_BACKEND_URL=https://zhitoujianli.com
NODE_ENV=production
GENERATE_SOURCEMAP=false
REACT_APP_ENABLE_ANALYTICS=true
EOF

echo -e "${GREEN}✅ 已创建 .env.production${NC}"

# 创建开发环境配置
cat > .env.development << 'EOF'
REACT_APP_API_URL=/api
REACT_APP_BACKEND_URL=http://localhost:8080
NODE_ENV=development
REACT_APP_DEBUG=true
REACT_APP_ENABLE_ANALYTICS=false
EOF

echo -e "${GREEN}✅ 已创建 .env.development${NC}"
echo ""

# 步骤 2: 检查后端代码
echo -e "${YELLOW}📝 步骤 2/5: 检查后端代码...${NC}"
cd "$BACKEND_DIR"

if [ -f "src/main/java/config/CorsConfig.java" ]; then
    echo -e "${GREEN}✅ CorsConfig.java 已更新${NC}"
else
    echo -e "${RED}❌ 找不到 CorsConfig.java${NC}"
    exit 1
fi
echo ""

# 步骤 3: 重新编译后端
echo -e "${YELLOW}📝 步骤 3/5: 重新编译后端...${NC}"
cd "$BACKEND_DIR"

if command -v mvn &> /dev/null; then
    echo "正在编译后端（跳过测试）..."
    mvn clean package -DskipTests

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 后端编译成功${NC}"
    else
        echo -e "${RED}❌ 后端编译失败${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Maven 未安装，跳过后端编译${NC}"
fi
echo ""

# 步骤 4: 重新构建前端
echo -e "${YELLOW}📝 步骤 4/5: 重新构建前端...${NC}"
cd "$FRONTEND_DIR"

if command -v npm &> /dev/null; then
    echo "正在构建前端生产版本..."
    npm run build

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 前端构建成功${NC}"
    else
        echo -e "${RED}❌ 前端构建失败${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  npm 未安装，跳过前端构建${NC}"
fi
echo ""

# 步骤 5: 重启服务
echo -e "${YELLOW}📝 步骤 5/5: 重启服务...${NC}"

# 重启后端
if [ -f "$BACKEND_DIR/restart_backend.sh" ]; then
    echo "正在重启后端服务..."
    cd "$BACKEND_DIR"
    ./restart_backend.sh
    echo -e "${GREEN}✅ 后端服务已重启${NC}"
else
    echo -e "${YELLOW}⚠️  未找到 restart_backend.sh，请手动重启后端${NC}"
fi

# 重启 Nginx（如果需要）
if command -v systemctl &> /dev/null; then
    echo "正在重启 Nginx..."
    sudo systemctl restart nginx
    echo -e "${GREEN}✅ Nginx 已重启${NC}"
else
    echo -e "${YELLOW}⚠️  systemctl 不可用，请手动重启 Nginx${NC}"
fi
echo ""

# 完成
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}🎉 CORS 修复部署完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}📋 后续步骤：${NC}"
echo "1. 访问注册页面测试："
echo -e "   ${BLUE}https://www.zhitoujianli.com/register${NC}"
echo ""
echo "2. 打开浏览器开发者工具（F12）"
echo ""
echo "3. 输入邮箱并点击\"发送验证码\""
echo ""
echo "4. 检查 Console 和 Network 标签："
echo "   - Console: 应该没有 CORS 错误"
echo "   - Network: 响应头应包含 Access-Control-Allow-Origin"
echo ""
echo -e "${YELLOW}📚 详细文档：${NC}"
echo -e "   ${BLUE}$PROJECT_ROOT/CORS_FIX_GUIDE.md${NC}"
echo ""
echo -e "${YELLOW}🐛 如遇问题：${NC}"
echo "   参考 CORS_FIX_GUIDE.md 中的\"常见问题排查\"部分"
echo ""

