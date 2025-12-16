#!/bin/bash

# ============================================================
# 智投简历 - 本地开发环境启动脚本
# ============================================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目根目录（自动检测，支持本地开发环境）
if [ -f "$(pwd)/.git/config" ]; then
    # 如果在项目根目录运行
    PROJECT_ROOT="$(pwd)"
elif [ -f "$(dirname "$0")/../.git/config" ]; then
    # 如果在scripts目录运行
    PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
else
    # 默认路径（服务器环境）
    PROJECT_ROOT="${PROJECT_ROOT:-/root/zhitoujianli}"
fi

BACKEND_DIR="$PROJECT_ROOT/backend/get_jobs"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}智投简历 - 本地开发环境启动${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查环境变量文件
if [ ! -f "$PROJECT_ROOT/.env.dev" ]; then
    echo -e "${YELLOW}⚠️  未找到 .env.dev 文件，创建示例文件...${NC}"
    cat > "$PROJECT_ROOT/.env.dev" << 'EOF'
# 开发环境配置
SPRING_PROFILES_ACTIVE=dev
APP_ENV=dev

# 数据库配置
DATABASE_URL=jdbc:postgresql://localhost:5432/zhitoujianli
DB_USERNAME=zhitoujianli
DB_PASSWORD=zhitoujianli123

# JWT配置
JWT_SECRET=dev_secret_key_for_local_development_only_12345678901234567890
JWT_EXPIRATION=86400000

# DeepSeek AI配置
BASE_URL=https://api.deepseek.com
API_KEY=your_deepseek_api_key_here
MODEL=deepseek-chat

# 安全配置
SECURITY_ENABLED=true
EOF
    echo -e "${GREEN}✅ 已创建 .env.dev 文件，请编辑后重新运行${NC}"
    echo -e "${YELLOW}   文件位置: $PROJECT_ROOT/.env.dev${NC}"
    exit 1
fi

# 加载环境变量
echo -e "${GREEN}📋 加载环境变量...${NC}"
export $(cat "$PROJECT_ROOT/.env.dev" | grep -v '^#' | xargs)

# 检查数据库连接
echo -e "${GREEN}🔍 检查数据库连接...${NC}"
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${RED}❌ PostgreSQL 未运行，请先启动数据库${NC}"
    echo -e "${YELLOW}   启动命令: sudo systemctl start postgresql${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 数据库连接正常${NC}"

# 检查端口占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}❌ 端口 $port 已被占用${NC}"
        echo -e "${YELLOW}   请先停止占用该端口的服务${NC}"
        return 1
    fi
    return 0
}

echo -e "${GREEN}🔍 检查端口占用...${NC}"
if ! check_port 8080; then
    exit 1
fi
if ! check_port 3000; then
    exit 1
fi
echo -e "${GREEN}✅ 端口检查通过${NC}"

# 启动后端服务
start_backend() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}启动后端服务（端口 8080）${NC}"
    echo -e "${GREEN}========================================${NC}"

    cd "$BACKEND_DIR"

    # 检查Maven依赖
    if [ ! -d "target" ] || [ ! -f "target/classes/application-dev.yml" ]; then
        echo -e "${YELLOW}📦 编译项目...${NC}"
        mvn clean compile -DskipTests
    fi

    # 启动Spring Boot
    echo -e "${GREEN}🚀 启动Spring Boot应用...${NC}"
    SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run > "$PROJECT_ROOT/logs/backend-dev.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$PROJECT_ROOT/logs/backend-dev.pid"

    echo -e "${GREEN}✅ 后端服务已启动（PID: $BACKEND_PID）${NC}"
    echo -e "${YELLOW}   日志文件: $PROJECT_ROOT/logs/backend-dev.log${NC}"
    echo -e "${YELLOW}   访问地址: http://localhost:8080${NC}"

    # 等待后端启动
    echo -e "${YELLOW}⏳ 等待后端服务启动...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:8080/api/auth/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 后端服务启动成功${NC}"
            return 0
        fi
        sleep 1
    done

    echo -e "${RED}❌ 后端服务启动超时${NC}"
    return 1
}

# 启动前端服务
start_frontend() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}启动前端服务（端口 3000）${NC}"
    echo -e "${GREEN}========================================${NC}"

    cd "$FRONTEND_DIR"

    # 检查Node.js依赖
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 安装前端依赖...${NC}"
        npm install
    fi

    # 启动开发服务器
    echo -e "${GREEN}🚀 启动React开发服务器...${NC}"
    REACT_APP_ENV=development REACT_APP_API_URL=http://localhost:8080/api npm start > "$PROJECT_ROOT/logs/frontend-dev.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$PROJECT_ROOT/logs/frontend-dev.pid"

    echo -e "${GREEN}✅ 前端服务已启动（PID: $FRONTEND_PID）${NC}"
    echo -e "${YELLOW}   日志文件: $PROJECT_ROOT/logs/frontend-dev.log${NC}"
    echo -e "${YELLOW}   访问地址: http://localhost:3000${NC}"
}

# 创建日志目录
mkdir -p "$PROJECT_ROOT/logs"

# 启动服务
start_backend
sleep 2
start_frontend

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ 开发环境启动完成${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}访问地址:${NC}"
echo -e "  前端: ${YELLOW}http://localhost:3000${NC}"
echo -e "  后端: ${YELLOW}http://localhost:8080${NC}"
echo -e "  API:  ${YELLOW}http://localhost:8080/api${NC}"
echo ""
echo -e "${GREEN}停止服务:${NC}"
echo -e "  ${YELLOW}./scripts/stop-dev.sh${NC}"
echo ""



