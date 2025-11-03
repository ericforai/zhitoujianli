#!/bin/bash
################################################################################
# 智投简历 - 版本查询脚本
# 功能：快速查询当前运行的后端版本信息
# 版本：1.0.0
# 作者：ZhiTouJianLi Team
################################################################################

# ==================== 配置项 ====================
DEPLOY_DIR="/opt/zhitoujianli/backend"
SERVICE_NAME="zhitoujianli-backend"
API_URL="http://localhost:8080/api/version"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ==================== 显示横幅 ====================
show_banner() {
    echo -e "${CYAN}"
    echo "=========================================="
    echo "   智投简历 - 版本信息查询"
    echo "=========================================="
    echo -e "${NC}"
}

# ==================== 查询文件系统版本 ====================
get_filesystem_version() {
    echo -e "${BLUE}📁 文件系统信息${NC}"
    echo "----------------------------------------"

    # 当前符号链接指向的版本
    if [ -L "$DEPLOY_DIR/get_jobs-latest.jar" ]; then
        CURRENT_JAR=$(readlink -f "$DEPLOY_DIR/get_jobs-latest.jar")
        CURRENT_JAR_NAME=$(basename "$CURRENT_JAR")
        CURRENT_JAR_SIZE=$(du -h "$CURRENT_JAR" | cut -f1)
        CURRENT_JAR_DATE=$(stat -c %y "$CURRENT_JAR" | cut -d'.' -f1)

        echo -e "当前JAR: ${GREEN}$CURRENT_JAR_NAME${NC}"
        echo "文件大小: $CURRENT_JAR_SIZE"
        echo "修改时间: $CURRENT_JAR_DATE"
    else
        echo -e "${RED}❌ 未找到符号链接${NC}"
    fi

    echo ""
}

# ==================== 查询服务状态 ====================
get_service_status() {
    echo -e "${BLUE}🔧 服务状态${NC}"
    echo "----------------------------------------"

    if systemctl is-active --quiet "$SERVICE_NAME"; then
        echo -e "服务状态: ${GREEN}运行中 ✓${NC}"

        # 获取进程信息
        PID=$(systemctl show -p MainPID --value "$SERVICE_NAME")
        if [ "$PID" != "0" ]; then
            UPTIME=$(ps -p "$PID" -o etime= 2>/dev/null | xargs || echo "unknown")
            MEMORY=$(ps -p "$PID" -o rss= 2>/dev/null | awk '{printf "%.1f MB", $1/1024}' || echo "unknown")

            echo "进程ID: $PID"
            echo "运行时长: $UPTIME"
            echo "内存使用: $MEMORY"
        fi
    else
        echo -e "服务状态: ${RED}已停止 ✗${NC}"
    fi

    echo ""
}

# ==================== 查询API版本信息 ====================
get_api_version() {
    echo -e "${BLUE}🌐 API版本信息${NC}"
    echo "----------------------------------------"

    # 检查服务是否运行
    if ! systemctl is-active --quiet "$SERVICE_NAME"; then
        echo -e "${YELLOW}⚠️  服务未运行，无法获取API信息${NC}"
        echo ""
        return
    fi

    # 调用版本API
    if command -v jq &> /dev/null; then
        VERSION_JSON=$(curl -s -f "$API_URL" 2>/dev/null)

        if [ $? -eq 0 ]; then
            VERSION=$(echo "$VERSION_JSON" | jq -r '.version // "unknown"')
            GIT_SHA=$(echo "$VERSION_JSON" | jq -r '.gitSha // "unknown"')
            GIT_BRANCH=$(echo "$VERSION_JSON" | jq -r '.gitBranch // "unknown"')
            BUILD_TIME=$(echo "$VERSION_JSON" | jq -r '.buildTime // "unknown"')
            UPTIME=$(echo "$VERSION_JSON" | jq -r '.uptime // "unknown"')
            JAVA_VERSION=$(echo "$VERSION_JSON" | jq -r '.javaVersion // "unknown"')

            echo -e "版本号: ${GREEN}$VERSION${NC}"
            echo "Git SHA: $GIT_SHA"
            echo "Git分支: $GIT_BRANCH"
            echo "构建时间: $BUILD_TIME"
            echo "运行时长: $UPTIME"
            echo "Java版本: $JAVA_VERSION"
        else
            echo -e "${RED}❌ API调用失败${NC}"
        fi
    else
        # 如果没有jq，使用简单方式
        VERSION_RESPONSE=$(curl -s -f "$API_URL" 2>/dev/null)
        if [ $? -eq 0 ]; then
            echo "$VERSION_RESPONSE"
        else
            echo -e "${RED}❌ API调用失败${NC}"
        fi
    fi

    echo ""
}

# ==================== 列出所有可用版本 ====================
list_all_versions() {
    echo -e "${BLUE}📦 所有可用版本${NC}"
    echo "----------------------------------------"

    # 获取所有JAR文件
    mapfile -t JARS < <(ls -t "$DEPLOY_DIR"/get_jobs-v*.jar 2>/dev/null | grep -v "get_jobs-latest.jar" || true)

    if [ ${#JARS[@]} -eq 0 ]; then
        echo "未找到任何版本"
        return
    fi

    # 获取当前运行版本
    if [ -L "$DEPLOY_DIR/get_jobs-latest.jar" ]; then
        CURRENT_JAR=$(readlink -f "$DEPLOY_DIR/get_jobs-latest.jar")
    else
        CURRENT_JAR=""
    fi

    # 显示所有版本
    for JAR in "${JARS[@]}"; do
        JAR_NAME=$(basename "$JAR")
        JAR_SIZE=$(du -h "$JAR" | cut -f1)
        JAR_DATE=$(stat -c %y "$JAR" | cut -d'.' -f1)

        if [ "$JAR" == "$CURRENT_JAR" ]; then
            echo -e "${GREEN}➤ $JAR_NAME${NC} ($JAR_SIZE) - $JAR_DATE ${GREEN}[当前]${NC}"
        else
            echo -e "  $JAR_NAME ($JAR_SIZE) - $JAR_DATE"
        fi
    done

    echo ""
    echo "总计: ${#JARS[@]} 个版本"
    echo ""
}

# ==================== 快速检查（简化输出） ====================
quick_check() {
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        if command -v jq &> /dev/null; then
            VERSION_INFO=$(curl -s -f "$API_URL" 2>/dev/null | jq -r '"\(.version)-\(.gitSha)"' || echo "unknown")
            echo -e "${GREEN}✓${NC} 服务运行中 - 版本: ${GREEN}$VERSION_INFO${NC}"
        else
            echo -e "${GREEN}✓${NC} 服务运行中"
        fi
    else
        echo -e "${RED}✗${NC} 服务已停止"
    fi
}

# ==================== 主流程 ====================
main() {
    case "${1:-full}" in
        quick|q)
            quick_check
            ;;
        list|l)
            show_banner
            list_all_versions
            ;;
        api|a)
            show_banner
            get_api_version
            ;;
        full|f|*)
            show_banner
            get_filesystem_version
            get_service_status
            get_api_version
            list_all_versions
            ;;
    esac
}

# 执行主流程
main "$@"



