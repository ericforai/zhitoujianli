#!/bin/bash
################################################################################
# 智投简历 - 旧版本清理脚本
# 功能：自动清理旧版本JAR，保留最近N个版本
# 版本：1.0.0
# 作者：ZhiTouJianLi Team
################################################################################

set -e

# ==================== 配置项 ====================
DEPLOY_DIR="/opt/zhitoujianli/backend"
BACKUP_DIR="$DEPLOY_DIR/backups"
KEEP_COUNT=${1:-3}  # 保留版本数（默认3个，可通过参数指定）
LOG_DIR="/opt/zhitoujianli/logs"
LOG_FILE="$LOG_DIR/cleanup-backend.log"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# ==================== 清理主JAR ====================
cleanup_main_jars() {
    log_info "=========================================="
    log_info "🧹 开始清理旧版本JAR"
    log_info "保留最近 $KEEP_COUNT 个版本"
    log_info "=========================================="

    # 获取所有JAR文件（排除符号链接）
    mapfile -t JARS < <(ls -t "$DEPLOY_DIR"/get_jobs-v*.jar 2>/dev/null | grep -v "get_jobs-latest.jar" || true)

    if [ ${#JARS[@]} -eq 0 ]; then
        log_warn "未找到任何JAR文件"
        return 0
    fi

    log_info "发现 ${#JARS[@]} 个版本"

    # 显示所有版本
    echo ""
    log_info "现有版本列表:"
    for i in "${!JARS[@]}"; do
        JAR_NAME=$(basename "${JARS[$i]}")
        JAR_SIZE=$(du -h "${JARS[$i]}" | cut -f1)
        JAR_DATE=$(stat -c %y "${JARS[$i]}" | cut -d'.' -f1)

        if [ $i -lt $KEEP_COUNT ]; then
            echo -e "${GREEN}  [保留] $JAR_NAME ($JAR_SIZE, $JAR_DATE)${NC}"
        else
            echo -e "${YELLOW}  [删除] $JAR_NAME ($JAR_SIZE, $JAR_DATE)${NC}"
        fi
    done
    echo ""

    # 检查是否需要清理
    if [ ${#JARS[@]} -le $KEEP_COUNT ]; then
        log_success "当前版本数 <= $KEEP_COUNT，无需清理"
        return 0
    fi

    # 删除旧版本
    DELETED_COUNT=0
    FREED_SPACE=0

    for (( i=$KEEP_COUNT; i<${#JARS[@]}; i++ )); do
        OLD_JAR="${JARS[$i]}"
        JAR_NAME=$(basename "$OLD_JAR")
        JAR_SIZE=$(stat -c%s "$OLD_JAR")

        log_info "删除旧版本: $JAR_NAME"
        rm -f "$OLD_JAR"

        DELETED_COUNT=$((DELETED_COUNT + 1))
        FREED_SPACE=$((FREED_SPACE + JAR_SIZE))
    done

    # 转换释放空间为人类可读格式
    FREED_SPACE_MB=$((FREED_SPACE / 1024 / 1024))

    log_success "已删除 $DELETED_COUNT 个旧版本，释放空间 ${FREED_SPACE_MB}MB"
}

# ==================== 清理旧备份 ====================
cleanup_old_backups() {
    log_info "=========================================="
    log_info "🧹 清理旧备份文件"
    log_info "保留最近 $KEEP_COUNT 个备份"
    log_info "=========================================="

    if [ ! -d "$BACKUP_DIR" ]; then
        log_info "备份目录不存在，跳过"
        return 0
    fi

    # 获取所有备份文件（按时间排序）
    mapfile -t BACKUPS < <(ls -t "$BACKUP_DIR"/backup-*.jar 2>/dev/null || true)

    if [ ${#BACKUPS[@]} -eq 0 ]; then
        log_info "未找到备份文件"
        return 0
    fi

    log_info "发现 ${#BACKUPS[@]} 个备份"

    if [ ${#BACKUPS[@]} -le $KEEP_COUNT ]; then
        log_success "当前备份数 <= $KEEP_COUNT，无需清理"
        return 0
    fi

    # 删除旧备份
    DELETED_BACKUP_COUNT=0

    for (( i=$KEEP_COUNT; i<${#BACKUPS[@]}; i++ )); do
        OLD_BACKUP="${BACKUPS[$i]}"
        BACKUP_NAME=$(basename "$OLD_BACKUP")

        log_info "删除旧备份: $BACKUP_NAME"
        rm -f "$OLD_BACKUP"

        DELETED_BACKUP_COUNT=$((DELETED_BACKUP_COUNT + 1))
    done

    log_success "已删除 $DELETED_BACKUP_COUNT 个旧备份"
}

# ==================== 显示摘要 ====================
show_summary() {
    echo ""
    log_success "=========================================="
    log_success "🎉 清理完成！"
    log_success "=========================================="

    # 显示剩余版本
    REMAINING_JARS=$(ls "$DEPLOY_DIR"/get_jobs-v*.jar 2>/dev/null | grep -v "get_jobs-latest.jar" | wc -l)
    log_info "剩余版本数: $REMAINING_JARS"

    # 显示磁盘使用情况
    TOTAL_SIZE=$(du -sh "$DEPLOY_DIR" | cut -f1)
    log_info "部署目录总大小: $TOTAL_SIZE"

    log_success "=========================================="
    echo ""
}

# ==================== 主流程 ====================
main() {
    # 创建日志目录
    mkdir -p "$LOG_DIR"

    # 参数验证
    if ! [[ "$KEEP_COUNT" =~ ^[0-9]+$ ]] || [ "$KEEP_COUNT" -lt 1 ]; then
        log_error "无效的保留数量: $KEEP_COUNT"
        echo "用法: $0 [保留数量]"
        echo "示例: $0 3  # 保留最近3个版本"
        exit 1
    fi

    # 执行清理
    cleanup_main_jars
    cleanup_old_backups
    show_summary
}

# 执行主流程
main "$@"



