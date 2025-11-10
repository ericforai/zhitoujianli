#!/bin/bash

################################################################################
# 用户日志合并脚本
# 修复用户ID格式不一致导致的重复用户问题
#
# 问题：luwenrong123@sina.com 和 luwenrong123_sina_com 是同一个用户
# 解决：合并两个日志文件，统一使用 sanitize 后的格式
################################################################################

echo "=== 用户日志合并脚本 ==="
echo ""

# 旧格式（原始邮箱）
OLD_LOG="/tmp/boss_delivery_luwenrong123@sina.com.log"
# 新格式（sanitize后）
NEW_LOG="/tmp/boss_delivery_luwenrong123_sina_com.log"

if [ ! -f "$OLD_LOG" ]; then
    echo "✅ 旧格式日志文件不存在，无需合并"
    exit 0
fi

if [ ! -f "$NEW_LOG" ]; then
    echo "⚠️  新格式日志文件不存在，重命名旧文件..."
    mv "$OLD_LOG" "$NEW_LOG"
    echo "✅ 已重命名: $OLD_LOG -> $NEW_LOG"
    exit 0
fi

echo "发现两个日志文件："
echo "  旧格式: $OLD_LOG ($(wc -l < "$OLD_LOG") 行)"
echo "  新格式: $NEW_LOG ($(wc -l < "$NEW_LOG") 行)"
echo ""

# 备份旧文件
BACKUP_DIR="/opt/zhitoujianli/backups/user-logs"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/boss_delivery_luwenrong123@sina.com_$(date +%Y%m%d_%H%M%S).log.bak"
cp "$OLD_LOG" "$BACKUP_FILE"
echo "✅ 已备份旧文件到: $BACKUP_FILE"

# 合并日志（追加旧日志到新日志）
echo "正在合并日志..."
cat "$OLD_LOG" >> "$NEW_LOG"
echo "✅ 日志已合并到: $NEW_LOG"

# 删除旧文件
rm "$OLD_LOG"
echo "✅ 已删除旧格式日志文件: $OLD_LOG"

echo ""
echo "=== 合并完成 ==="
echo "合并后的日志文件: $NEW_LOG ($(wc -l < "$NEW_LOG") 行)"

