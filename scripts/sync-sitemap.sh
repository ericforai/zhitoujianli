#!/bin/bash
# 智投简历 - Sitemap同步脚本
# 功能：同步主站sitemap和博客sitemap，更新主sitemap index

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BLOG_DIR="$PROJECT_ROOT/blog/zhitoujianli-blog"

echo "🔄 开始同步sitemap..."

# 1. 检查博客sitemap是否存在
if [ ! -f "$BLOG_DIR/dist/sitemap-index.xml" ]; then
    echo "⚠️  警告：博客sitemap不存在，请先构建博客"
    echo "   执行: cd $BLOG_DIR && npm run build"
    exit 1
fi

# 2. 更新主sitemap index的lastmod时间
python3 << 'PYTHON_SCRIPT'
import xml.etree.ElementTree as ET
from datetime import datetime
import os

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sitemap_index_path = os.path.join(project_root, 'frontend/public/sitemap-index.xml')

if os.path.exists(sitemap_index_path):
    tree = ET.parse(sitemap_index_path)
    root = tree.getroot()

    # 更新所有sitemap的lastmod时间
    for sitemap in root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}sitemap'):
        lastmod = sitemap.find('{http://www.sitemaps.org/schemas/sitemap/0.9}lastmod')
        if lastmod is not None:
            lastmod.text = datetime.now().strftime('%Y-%m-%d')

    ET.indent(root, space='  ')
    tree.write(sitemap_index_path, encoding='utf-8', xml_declaration=True)
    print("✅ 已更新sitemap index的lastmod时间")
else:
    print("⚠️  sitemap-index.xml不存在")
PYTHON_SCRIPT

# 3. 验证sitemap文件
echo "📋 验证sitemap文件..."

if [ -f "$FRONTEND_DIR/public/sitemap-index.xml" ]; then
    echo "✅ 主sitemap index存在"
    grep -c '<sitemap>' "$FRONTEND_DIR/public/sitemap-index.xml" || echo "  包含 $(grep -c '<sitemap>' "$FRONTEND_DIR/public/sitemap-index.xml") 个sitemap引用"
else
    echo "❌ 主sitemap index不存在"
    exit 1
fi

if [ -f "$FRONTEND_DIR/public/sitemap-main.xml" ]; then
    main_urls=$(grep -c '<url>' "$FRONTEND_DIR/public/sitemap-main.xml" || echo "0")
    echo "✅ 主站sitemap存在（包含 $main_urls 个URL）"
else
    echo "❌ 主站sitemap不存在"
    exit 1
fi

if [ -f "$BLOG_DIR/dist/sitemap-index.xml" ]; then
    echo "✅ 博客sitemap index存在"
else
    echo "⚠️  博客sitemap index不存在"
fi

echo "✅ Sitemap同步完成！"
echo ""
echo "📊 Sitemap结构："
echo "   - sitemap-index.xml (主索引)"
echo "     ├── sitemap-main.xml (主站页面)"
echo "     └── blog/sitemap-index.xml (博客索引)"
echo "         └── blog/sitemap-0.xml (博客文章)"



