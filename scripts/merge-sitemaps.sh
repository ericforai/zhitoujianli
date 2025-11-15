#!/bin/bash

# 合并主站和博客的sitemap为一个统一文件
# 执行时机：博客构建后

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MAIN_SITEMAP="$ROOT/frontend/public/sitemap.xml"
BLOG_SITEMAP="$ROOT/frontend/public/blog-sitemap.xml"
OUTPUT_SITEMAP="$ROOT/frontend/public/sitemap.xml"

echo "========================================"
echo "  合并Sitemap - 创建统一sitemap.xml"
echo "========================================"
echo ""

# 检查主站文件是否存在
if [ ! -f "$MAIN_SITEMAP" ]; then
    echo "错误：找不到主站sitemap: $MAIN_SITEMAP"
    exit 1
fi

# 创建临时文件
TEMP_FILE=$(mktemp)

# 写入XML头部
cat > "$TEMP_FILE" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- ================================================ -->
  <!-- 主站页面 -->
  <!-- ================================================ -->

EOF

# 提取主站sitemap中的URL（跳过XML头部和尾部）
sed -n '/<url>/,/<\/url>/p' "$MAIN_SITEMAP" >> "$TEMP_FILE"

# 添加分隔注释
cat >> "$TEMP_FILE" << 'EOF'

  <!-- ================================================ -->
  <!-- 博客页面 -->
  <!-- ================================================ -->

EOF

# 提取博客sitemap中的URL（如果存在）
if [ -f "$BLOG_SITEMAP" ]; then
    sed -n '/<url>/,/<\/url>/p' "$BLOG_SITEMAP" >> "$TEMP_FILE"
else
    echo "⚠ 未找到博客sitemap: $BLOG_SITEMAP，本次仅合并主站。"
fi

# 写入XML尾部
echo "" >> "$TEMP_FILE"
echo "</urlset>" >> "$TEMP_FILE"

# 替换输出文件
mv "$TEMP_FILE" "$OUTPUT_SITEMAP"

echo "✓ Sitemap合并完成"
echo ""
echo "统计信息："
MAIN_COUNT=$(grep -c "<loc>" "$MAIN_SITEMAP" || echo 0)
BLOG_COUNT=$(grep -c "<loc>" "$BLOG_SITEMAP" || echo 0)
TOTAL_COUNT=$(grep -c "<loc>" "$OUTPUT_SITEMAP" || echo 0)

echo "  主站URL:  $MAIN_COUNT 个"
echo "  博客URL:  $BLOG_COUNT 个"
echo "  总计:     $TOTAL_COUNT 个"
echo ""
echo "输出文件: $OUTPUT_SITEMAP"
echo ""

