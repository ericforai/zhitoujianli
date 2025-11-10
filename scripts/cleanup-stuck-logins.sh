#!/bin/bash

################################################################################
# 清理超时的登录状态文件和二维码文件
# 用途：清理超过5分钟的卡住登录任务
# 作者：ZhiTouJianLi Team
# 日期：2025-11-07
################################################################################

echo "=== 清理超时的登录状态文件 ==="
echo ""

# 清理超过5分钟的状态文件
DELETED_STATUS=$(find /tmp -name "boss_login_status_*.txt" -mmin +5 -delete -print 2>/dev/null | wc -l)
echo "✅ 已清理 $DELETED_STATUS 个超时状态文件"

# 清理超过5分钟的二维码文件
DELETED_QRCODE=$(find /tmp -name "boss_qrcode_*.png" -mmin +5 -delete -print 2>/dev/null | wc -l)
echo "✅ 已清理 $DELETED_QRCODE 个超时二维码文件"

# 同时清理旧的全局文件（如果存在）
if [ -f "/tmp/boss_login_status.txt" ]; then
    rm -f /tmp/boss_login_status.txt
    echo "✅ 已清理旧的全局状态文件"
fi

if [ -f "/tmp/boss_qrcode.png" ]; then
    rm -f /tmp/boss_qrcode.png
    echo "✅ 已清理旧的全局二维码文件"
fi

echo ""
echo "清理完成！"

