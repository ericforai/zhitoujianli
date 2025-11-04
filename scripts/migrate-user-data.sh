#!/bin/bash
# 用户数据迁移脚本
# 将旧格式的用户目录（包含 @ 和 .）迁移到新格式（只有 _ 和 -）
#
# 使用方法：
#   ./scripts/migrate-user-data.sh           # 预览模式（不执行）
#   ./scripts/migrate-user-data.sh --execute # 执行迁移
#
# 作者：ZhiTouJianLi Team
# 日期：2025-11-04

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
USER_DATA_DIR="/root/zhitoujianli/backend/get_jobs/user_data"
BACKUP_DIR="/root/zhitoujianli/backend/get_jobs/user_data_backup_$(date +%Y%m%d_%H%M%S)"
LOG_FILE="/tmp/user_data_migration_$(date +%Y%m%d_%H%M%S).log"

# 执行模式
EXECUTE_MODE=false

# 解析参数
if [ "$1" == "--execute" ] || [ "$1" == "-e" ]; then
    EXECUTE_MODE=true
fi

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# 清理用户ID中的特殊字符
sanitize_user_id() {
    local user_id="$1"
    # 将 @ 和 . 替换为 _，其他特殊字符也替换为 _
    echo "$user_id" | sed 's/[^a-zA-Z0-9_-]/_/g'
}

# 检查目录是否为空
is_empty_dir() {
    local dir="$1"
    [ -d "$dir" ] && [ -z "$(ls -A "$dir")" ]
}

# 创建备份
create_backup() {
    log_info "创建备份到: $BACKUP_DIR"
    if [ "$EXECUTE_MODE" = true ]; then
        cp -r "$USER_DATA_DIR" "$BACKUP_DIR"
        log_success "备份完成"
    else
        log_info "[预览模式] 将创建备份到: $BACKUP_DIR"
    fi
}

# 迁移单个用户目录
migrate_user_dir() {
    local old_dir="$1"
    local old_name=$(basename "$old_dir")
    local new_name=$(sanitize_user_id "$old_name")

    # 如果格式相同，跳过
    if [ "$old_name" = "$new_name" ]; then
        return 0
    fi

    local new_dir="$USER_DATA_DIR/$new_name"

    log_info "处理用户目录: $old_name -> $new_name"

    # 检查旧目录是否为空
    if is_empty_dir "$old_dir"; then
        log_warning "  旧目录为空，跳过: $old_name"
        if [ "$EXECUTE_MODE" = true ]; then
            rm -rf "$old_dir"
            log_info "  已删除空目录: $old_name"
        fi
        return 0
    fi

    # 统计文件数量
    local file_count=$(find "$old_dir" -maxdepth 1 -type f | wc -l)
    log_info "  文件数量: $file_count"

    # 检查新目录是否存在
    if [ -d "$new_dir" ]; then
        log_warning "  新目录已存在，需要合并"

        if [ "$EXECUTE_MODE" = true ]; then
            # 合并文件
            local merged_count=0
            local skipped_count=0

            for file in "$old_dir"/*; do
                if [ -f "$file" ]; then
                    local filename=$(basename "$file")
                    local target_file="$new_dir/$filename"

                    if [ ! -f "$target_file" ]; then
                        cp "$file" "$target_file"
                        ((merged_count++))
                        log_info "    ✅ 复制文件: $filename"
                    else
                        # 文件已存在，比较时间戳
                        if [ "$file" -nt "$target_file" ]; then
                            # 旧文件更新，备份并覆盖
                            cp "$target_file" "$target_file.old"
                            cp "$file" "$target_file"
                            ((merged_count++))
                            log_warning "    ⚠️  覆盖文件（旧文件更新）: $filename"
                        else
                            ((skipped_count++))
                            log_info "    ⏭️  跳过文件（已存在）: $filename"
                        fi
                    fi
                fi
            done

            log_success "  合并完成: 复制 $merged_count 个文件，跳过 $skipped_count 个文件"

            # 删除旧目录
            rm -rf "$old_dir"
            log_info "  已删除旧目录: $old_name"
        else
            log_info "  [预览模式] 将合并目录"
        fi
    else
        log_info "  新目录不存在，将重命名"

        if [ "$EXECUTE_MODE" = true ]; then
            mv "$old_dir" "$new_dir"
            log_success "  重命名完成: $old_name -> $new_name"
        else
            log_info "  [预览模式] 将重命名: $old_name -> $new_name"
        fi
    fi
}

# 主函数
main() {
    echo ""
    echo "====================================="
    echo "  用户数据迁移工具"
    echo "====================================="
    echo ""

    if [ "$EXECUTE_MODE" = true ]; then
        log_warning "⚠️  执行模式：将实际执行迁移操作"
    else
        log_info "📋 预览模式：仅显示将要执行的操作"
        log_info "    使用 --execute 参数执行实际迁移"
    fi

    echo ""

    # 检查目录是否存在
    if [ ! -d "$USER_DATA_DIR" ]; then
        log_error "用户数据目录不存在: $USER_DATA_DIR"
        exit 1
    fi

    log_info "用户数据目录: $USER_DATA_DIR"
    log_info "日志文件: $LOG_FILE"
    echo ""

    # 创建备份
    if [ "$EXECUTE_MODE" = true ]; then
        create_backup
        echo ""
    fi

    # 统计
    local total_dirs=0
    local migrate_dirs=0
    local skip_dirs=0

    # 遍历所有用户目录
    for user_dir in "$USER_DATA_DIR"/*; do
        if [ -d "$user_dir" ]; then
            ((total_dirs++))

            local user_name=$(basename "$user_dir")
            local safe_name=$(sanitize_user_id "$user_name")

            if [ "$user_name" != "$safe_name" ]; then
                ((migrate_dirs++))
                migrate_user_dir "$user_dir"
                echo ""
            else
                ((skip_dirs++))
            fi
        fi
    done

    # 输出统计
    echo ""
    echo "====================================="
    echo "  迁移统计"
    echo "====================================="
    log_info "总目录数: $total_dirs"
    log_success "需要迁移: $migrate_dirs"
    log_info "无需迁移: $skip_dirs"

    if [ "$EXECUTE_MODE" = true ]; then
        echo ""
        log_success "✅ 迁移完成！"
        log_info "备份目录: $BACKUP_DIR"
        log_info "日志文件: $LOG_FILE"
    else
        echo ""
        log_info "📋 预览完成，使用以下命令执行实际迁移："
        echo ""
        echo "  ./scripts/migrate-user-data.sh --execute"
        echo ""
    fi
}

# 执行主函数
main

exit 0


