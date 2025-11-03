#!/bin/bash
################################################################################
# 智投简历 - 后端智能部署脚本
# 功能：自动部署最新构建的JAR，包含健康检查和自动回滚
# 版本：1.0.0
# 作者：ZhiTouJianLi Team
################################################################################

set -e  # 遇到错误立即退出

# ==================== 配置项 ====================
DEPLOY_DIR="/opt/zhitoujianli/backend"
BACKUP_DIR="$DEPLOY_DIR/backups"
SERVICE_NAME="zhitoujianli-backend"
HEALTH_CHECK_URL="http://localhost:8080/api/version/health"
HEALTH_CHECK_TIMEOUT=60  # 健康检查超时时间（秒）
LOG_DIR="/opt/zhitoujianli/logs"
LOG_FILE="$LOG_DIR/deploy-backend.log"

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

# ==================== 查找最新JAR ====================
find_latest_jar() {
    log_info "查找最新构建的JAR..."

    # 优先从构建脚本的输出文件读取
    if [ -f /tmp/latest-backend-jar.txt ]; then
        LATEST_JAR_NAME=$(cat /tmp/latest-backend-jar.txt)
        LATEST_JAR="$DEPLOY_DIR/$LATEST_JAR_NAME"

        if [ -f "$LATEST_JAR" ]; then
            log_success "找到最新JAR: $LATEST_JAR_NAME"
            return 0
        fi
    fi

    # 否则查找最新的JAR文件（按修改时间）
    LATEST_JAR=$(ls -t "$DEPLOY_DIR"/get_jobs-v*.jar 2>/dev/null | grep -v "get_jobs-latest.jar" | head -1)

    if [ -z "$LATEST_JAR" ]; then
        log_error "未找到JAR文件，请先运行 ./build-backend.sh"
        exit 1
    fi

    LATEST_JAR_NAME=$(basename "$LATEST_JAR")
    log_success "找到最新JAR: $LATEST_JAR_NAME"
}

# ==================== 备份当前版本 ====================
backup_current_version() {
    log_info "备份当前运行版本..."

    # 创建备份目录
    mkdir -p "$BACKUP_DIR"

    # 检查当前符号链接
    if [ -L "$DEPLOY_DIR/get_jobs-latest.jar" ]; then
        CURRENT_JAR=$(readlink -f "$DEPLOY_DIR/get_jobs-latest.jar")
        CURRENT_JAR_NAME=$(basename "$CURRENT_JAR")

        # 复制到备份目录（带时间戳）
        BACKUP_NAME="backup-$(date +%Y%m%d_%H%M%S)-$CURRENT_JAR_NAME"
        cp "$CURRENT_JAR" "$BACKUP_DIR/$BACKUP_NAME"

        log_success "已备份当前版本: $BACKUP_NAME"

        # 保存备份路径（用于回滚）
        echo "$BACKUP_DIR/$BACKUP_NAME" > /tmp/last-backend-backup.txt
    else
        log_warn "未找到当前运行版本，跳过备份"
    fi
}

# ==================== 更新符号链接 ====================
update_symlink() {
    log_info "更新符号链接..."

    # 删除旧的符号链接
    rm -f "$DEPLOY_DIR/get_jobs-latest.jar"

    # 创建新的符号链接
    ln -sf "$LATEST_JAR" "$DEPLOY_DIR/get_jobs-latest.jar"

    log_success "符号链接已更新: get_jobs-latest.jar -> $LATEST_JAR_NAME"
}

# ==================== 重启服务 ====================
restart_service() {
    log_info "重启后端服务..."

    # 重启systemd服务
    if systemctl restart "$SERVICE_NAME"; then
        log_success "服务重启命令已执行"
    else
        log_error "服务重启失败"
        return 1
    fi

    # 等待服务启动
    log_info "等待服务启动..."
    sleep 5
}

# ==================== 健康检查 ====================
health_check() {
    log_info "执行健康检查..."

    local elapsed=0
    local check_interval=5

    while [ $elapsed -lt $HEALTH_CHECK_TIMEOUT ]; do
        # 检查服务状态
        if systemctl is-active --quiet "$SERVICE_NAME"; then
            # 检查HTTP端点
            if curl -s -f "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
                log_success "健康检查通过！"

                # 获取并显示版本信息
                VERSION_INFO=$(curl -s "$HEALTH_CHECK_URL" | jq -r '.version + "-" + .gitSha' 2>/dev/null || echo "unknown")
                log_info "当前运行版本: $VERSION_INFO"

                return 0
            fi
        fi

        log_info "等待服务就绪... ($elapsed/$HEALTH_CHECK_TIMEOUT 秒)"
        sleep $check_interval
        elapsed=$((elapsed + check_interval))
    done

    log_error "健康检查失败，服务未能正常启动"
    return 1
}

# ==================== 自动回滚 ====================
rollback() {
    log_warn "=========================================="
    log_warn "⚠️  开始自动回滚..."
    log_warn "=========================================="

    # 检查是否有备份
    if [ ! -f /tmp/last-backend-backup.txt ]; then
        log_error "未找到备份文件，无法回滚"
        exit 1
    fi

    BACKUP_FILE=$(cat /tmp/last-backend-backup.txt)

    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "备份文件不存在: $BACKUP_FILE"
        exit 1
    fi

    log_info "恢复备份: $(basename $BACKUP_FILE)"

    # 恢复符号链接到备份版本
    rm -f "$DEPLOY_DIR/get_jobs-latest.jar"
    ln -sf "$BACKUP_FILE" "$DEPLOY_DIR/get_jobs-latest.jar"

    # 重启服务
    systemctl restart "$SERVICE_NAME"
    sleep 5

    # 验证回滚是否成功
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log_success "回滚成功，服务已恢复"
    else
        log_error "回滚后服务仍未正常运行，请手动检查"
        exit 1
    fi
}

# ==================== 查看日志 ====================
show_logs() {
    log_info "查看最近的服务日志..."
    journalctl -u "$SERVICE_NAME" -n 20 --no-pager
}

# ==================== 显示部署摘要 ====================
show_summary() {
    echo ""
    log_success "=========================================="
    log_success "🎉 部署成功！"
    log_success "=========================================="
    log_info "部署版本: $LATEST_JAR_NAME"
    log_info "服务状态: $(systemctl is-active $SERVICE_NAME)"
    log_info "健康检查: $HEALTH_CHECK_URL"
    log_success "=========================================="
    echo ""

    # 显示版本信息
    log_info "获取版本信息..."
    curl -s "$HEALTH_CHECK_URL" | jq '.' 2>/dev/null || echo "无法获取版本信息"
}

# ==================== 主流程 ====================
main() {
    log_info "=========================================="
    log_info "🚀 开始部署后端应用"
    log_info "=========================================="

    # 创建日志目录
    mkdir -p "$LOG_DIR"

    # 执行部署流程
    find_latest_jar
    backup_current_version
    update_symlink
    restart_service

    # 健康检查
    if health_check; then
        show_summary
    else
        log_error "部署失败，执行自动回滚..."
        rollback
        show_logs
        exit 1
    fi
}

# 执行主流程
main "$@"



