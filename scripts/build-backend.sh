#!/bin/bash
################################################################################
# 智投简历 - 后端自动化构建脚本
# 功能：自动构建后端JAR，集成版本管理和Git信息
# 版本：1.0.0
# 作者：ZhiTouJianLi Team
################################################################################

set -e  # 遇到错误立即退出

# ==================== 配置项 ====================
PROJECT_ROOT="/root/zhitoujianli"
BACKEND_DIR="$PROJECT_ROOT/backend/get_jobs"
DEPLOY_DIR="/opt/zhitoujianli/backend"
LOG_DIR="/opt/zhitoujianli/logs"
LOG_FILE="$LOG_DIR/build-backend.log"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ==================== 日志函数 ====================
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}ℹ️  $@${NC}"
    log "INFO" "$@"
}

log_success() {
    echo -e "${GREEN}✅ $@${NC}"
    log "SUCCESS" "$@"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $@${NC}"
    log "WARN" "$@"
}

log_error() {
    echo -e "${RED}❌ $@${NC}"
    log "ERROR" "$@"
}

# ==================== 前置检查 ====================
check_prerequisites() {
    log_info "检查前置条件..."

    # 检查Java
    if ! command -v java &> /dev/null; then
        log_error "未找到Java，请先安装JDK 21"
        exit 1
    fi

    # 检查Maven
    if ! command -v mvn &> /dev/null; then
        log_error "未找到Maven，请先安装Maven 3.8+"
        exit 1
    fi

    # 检查Git
    if ! command -v git &> /dev/null; then
        log_error "未找到Git，请先安装Git"
        exit 1
    fi

    # 检查目录
    if [ ! -d "$BACKEND_DIR" ]; then
        log_error "后端目录不存在: $BACKEND_DIR"
        exit 1
    fi

    log_success "前置条件检查通过"
}

# ==================== 获取版本信息 ====================
get_version_info() {
    log_info "获取版本信息..."

    cd "$BACKEND_DIR"

    # 从pom.xml读取版本号
    VERSION=$(mvn help:evaluate -Dexpression=project.version -q -DforceStdout 2>/dev/null)
    if [ -z "$VERSION" ]; then
        log_error "无法读取版本号"
        exit 1
    fi

    # 获取Git信息
    if [ -d "$PROJECT_ROOT/.git" ]; then
        GIT_SHA=$(git -C "$PROJECT_ROOT" rev-parse --short=7 HEAD 2>/dev/null || echo "unknown")
        GIT_BRANCH=$(git -C "$PROJECT_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
        GIT_MESSAGE=$(git -C "$PROJECT_ROOT" log -1 --pretty=%B 2>/dev/null | head -1 || echo "unknown")
    else
        GIT_SHA="unknown"
        GIT_BRANCH="unknown"
        GIT_MESSAGE="unknown"
    fi

    BUILD_TIME=$(date +%Y%m%d_%H%M%S)
    JAR_NAME="get_jobs-v${VERSION}-${GIT_SHA}.jar"

    log_info "=========================================="
    log_info "版本号: ${VERSION}"
    log_info "Git SHA: ${GIT_SHA}"
    log_info "Git分支: ${GIT_BRANCH}"
    log_info "构建时间: ${BUILD_TIME}"
    log_info "JAR名称: ${JAR_NAME}"
    log_info "=========================================="
}

# ==================== 清理构建目录 ====================
clean_build() {
    log_info "清理构建目录..."
    cd "$BACKEND_DIR"
    mvn clean -q
    log_success "清理完成"
}

# ==================== 执行Maven构建 ====================
build_jar() {
    log_info "开始Maven构建..."
    cd "$BACKEND_DIR"

    # 执行构建（跳过测试）
    if mvn package -DskipTests -q; then
        log_success "Maven构建成功"
    else
        log_error "Maven构建失败"
        exit 1
    fi
}

# ==================== 复制JAR到部署目录 ====================
deploy_jar() {
    log_info "复制JAR到部署目录..."

    # 确保部署目录存在
    mkdir -p "$DEPLOY_DIR"

    # 查找构建的JAR文件
    BUILT_JAR=$(find "$BACKEND_DIR/target" -name "get_jobs-v*.jar" -type f | head -1)

    if [ ! -f "$BUILT_JAR" ]; then
        log_error "未找到构建的JAR文件"
        exit 1
    fi

    # 获取JAR文件名
    JAR_FILENAME=$(basename "$BUILT_JAR")

    # 复制到部署目录
    cp "$BUILT_JAR" "$DEPLOY_DIR/$JAR_FILENAME"

    log_success "JAR已复制: $DEPLOY_DIR/$JAR_FILENAME"

    # 输出文件信息
    log_info "文件大小: $(du -h $DEPLOY_DIR/$JAR_FILENAME | cut -f1)"
    log_info "文件路径: $DEPLOY_DIR/$JAR_FILENAME"

    # 保存最新JAR文件名到临时文件（供部署脚本使用）
    echo "$JAR_FILENAME" > /tmp/latest-backend-jar.txt
}

# ==================== 显示构建摘要 ====================
show_summary() {
    echo ""
    log_success "=========================================="
    log_success "🎉 构建成功！"
    log_success "=========================================="
    log_info "版本: ${VERSION}-${GIT_SHA}"
    log_info "JAR文件: $DEPLOY_DIR/$JAR_FILENAME"
    log_info "下一步: 运行 ./deploy-backend.sh 进行部署"
    log_success "=========================================="
    echo ""
}

# ==================== 主流程 ====================
main() {
    log_info "=========================================="
    log_info "🚀 开始构建后端应用"
    log_info "=========================================="

    # 创建日志目录
    mkdir -p "$LOG_DIR"

    # 执行构建流程
    check_prerequisites
    get_version_info
    clean_build
    build_jar
    deploy_jar
    show_summary
}

# 执行主流程
main "$@"



