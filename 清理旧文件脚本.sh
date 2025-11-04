#!/bin/bash

################################################################################
# 智投简历 - 清理旧版本静态资源脚本
# 功能：删除static目录中除了index.html引用的最新版本外的所有旧文件
# 使用场景：当static目录堆积过多旧版本文件时运行
# 更新时间：2025-11-04
################################################################################

set -e

echo "🧹 开始清理旧版本静态资源..."
echo ""

DEPLOY_PATH="/var/www/zhitoujianli/build"
STATIC_JS="$DEPLOY_PATH/static/js"
STATIC_CSS="$DEPLOY_PATH/static/css"

# 检查部署路径是否存在
if [ ! -d "$DEPLOY_PATH" ]; then
    echo "❌ 错误：部署目录不存在：$DEPLOY_PATH"
    exit 1
fi

# 从index.html中提取当前使用的JS和CSS文件名
echo "📋 检测当前使用的资源文件..."
CURRENT_JS=$(grep -oP 'src="/static/js/main\.[^"]+\.js"' "$DEPLOY_PATH/index.html" | sed 's/src="\/static\/js\///' | sed 's/"//')
CURRENT_CSS=$(grep -oP 'href="/static/css/main\.[^"]+\.css"' "$DEPLOY_PATH/index.html" | sed 's/href="\/static\/css\///' | sed 's/"//')

echo "   当前使用的JS: $CURRENT_JS"
echo "   当前使用的CSS: $CURRENT_CSS"
echo ""

# 统计旧文件
echo "📊 统计旧版本文件..."
OLD_JS_COUNT=$(find "$STATIC_JS" -name "main.*.js" ! -name "$CURRENT_JS" | wc -l)
OLD_CSS_COUNT=$(find "$STATIC_CSS" -name "main.*.css" ! -name "$CURRENT_CSS" | wc -l)

echo "   发现 $OLD_JS_COUNT 个旧版本JS文件"
echo "   发现 $OLD_CSS_COUNT 个旧版本CSS文件"
echo ""

if [ "$OLD_JS_COUNT" -eq 0 ] && [ "$OLD_CSS_COUNT" -eq 0 ]; then
    echo "✅ 没有发现旧文件，无需清理"
    exit 0
fi

# 确认是否继续
echo "⚠️  警告：即将删除 $(($OLD_JS_COUNT + $OLD_CSS_COUNT)) 个旧版本文件"
echo ""
echo "按Ctrl+C取消，或等待5秒后继续..."
sleep 5

# 备份列表（记录删除的文件）
BACKUP_LIST="/tmp/zhitoujianli-cleanup-$(date +%Y%m%d_%H%M%S).txt"
echo "已删除的文件列表：" > "$BACKUP_LIST"
echo "时间：$(date)" >> "$BACKUP_LIST"
echo "" >> "$BACKUP_LIST"

# 删除旧JS文件
if [ "$OLD_JS_COUNT" -gt 0 ]; then
    echo "🗑️  删除旧版本JS文件..."
    find "$STATIC_JS" -name "main.*.js" ! -name "$CURRENT_JS" -print >> "$BACKUP_LIST"
    find "$STATIC_JS" -name "main.*.js" ! -name "$CURRENT_JS" -delete
    find "$STATIC_JS" -name "main.*.js.LICENSE.txt" ! -name "${CURRENT_JS}.LICENSE.txt" -delete
    echo "   已删除 $OLD_JS_COUNT 个JS文件"
fi

# 删除旧CSS文件
if [ "$OLD_CSS_COUNT" -gt 0 ]; then
    echo "🗑️  删除旧版本CSS文件..."
    find "$STATIC_CSS" -name "main.*.css" ! -name "$CURRENT_CSS" -print >> "$BACKUP_LIST"
    find "$STATIC_CSS" -name "main.*.css" ! -name "$CURRENT_CSS" -delete
    echo "   已删除 $OLD_CSS_COUNT 个CSS文件"
fi

# 显示清理后的磁盘空间
CURRENT_SIZE=$(du -sh "$DEPLOY_PATH/static" | awk '{print $1}')
echo ""
echo "✅ 清理完成！"
echo "   当前static目录大小：$CURRENT_SIZE"
echo "   已删除文件列表保存到：$BACKUP_LIST"
echo ""
echo "📝 建议下一步："
echo "   1. 重载Nginx：systemctl reload nginx"
echo "   2. 清除浏览器缓存（Ctrl + Shift + R）"
echo ""

