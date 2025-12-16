#!/bin/bash
# 智投简历 - Sitemap合并脚本
# 功能：合并主站sitemap和博客sitemap到一个sitemap.xml文件

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BLOG_DIR="$PROJECT_ROOT/blog/zhitoujianli-blog"

echo "🔄 开始合并sitemap..."

# 1. 检查博客sitemap是否存在
if [ ! -f "$BLOG_DIR/dist/sitemap-0.xml" ]; then
    echo "⚠️  警告：博客sitemap不存在，请先构建博客"
    echo "   执行: cd $BLOG_DIR && npm run build"
    exit 1
fi

# 2. 合并sitemap
export PROJECT_ROOT="$PROJECT_ROOT"
python3 << PYTHON_SCRIPT
import xml.etree.ElementTree as ET
from datetime import datetime
import os

# 从环境变量获取项目根目录
project_root = os.environ.get('PROJECT_ROOT')
if not project_root:
    # 如果环境变量未设置，使用当前工作目录
    project_root = os.getcwd()
    # 如果当前在scripts目录，向上移动一级
    if os.path.basename(project_root) == 'scripts':
        project_root = os.path.dirname(project_root)

main_sitemap_path = os.path.join(project_root, 'frontend/public/sitemap-main.xml')
blog_sitemap_path = os.path.join(project_root, 'blog/zhitoujianli-blog/dist/sitemap-0.xml')
output_path = os.path.join(project_root, 'frontend/public/sitemap.xml')

# 读取主站sitemap
main_tree = ET.parse(main_sitemap_path)
main_root = main_tree.getroot()

# 读取博客sitemap
blog_tree = ET.parse(blog_sitemap_path)
blog_root = blog_tree.getroot()

# 创建合并后的sitemap
merged_root = ET.Element('urlset')
merged_root.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
merged_root.set('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
merged_root.set('xsi:schemaLocation', 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd')

# 添加注释
comment1 = ET.Comment(' 主站页面 ')
merged_root.append(comment1)

# 复制主站URL（统一为www版本）
main_urls = main_root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}url')
for url_elem in main_urls:
    new_url = ET.SubElement(merged_root, 'url')
    for child in url_elem:
        tag = child.tag.split('}')[-1]
        new_child = ET.SubElement(new_url, tag)
        text = child.text
        # 将URL统一为www版本（规范域名）
        if tag == 'loc' and text and 'zhitoujianli.com' in text and 'www.' not in text:
            text = text.replace('https://zhitoujianli.com', 'https://www.zhitoujianli.com')
        new_child.text = text

# 添加注释
comment2 = ET.Comment(' 博客页面（由Astro自动生成） ')
merged_root.append(comment2)

# 复制博客URL（统一为www版本）
blog_urls = blog_root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}url')
for url_elem in blog_urls:
    new_url = ET.SubElement(merged_root, 'url')
    for child in url_elem:
        tag = child.tag.split('}')[-1]
        new_child = ET.SubElement(new_url, tag)
        text = child.text
        # 将URL统一为www版本（规范域名）
        if tag == 'loc' and text and 'zhitoujianli.com' in text and 'www.' not in text:
            text = text.replace('https://zhitoujianli.com', 'https://www.zhitoujianli.com')
        new_child.text = text

# 保存合并后的sitemap
ET.indent(merged_root, space='  ')
merged_tree = ET.ElementTree(merged_root)
merged_tree.write(output_path, encoding='utf-8', xml_declaration=True)

print(f"✅ 合并完成！")
print(f"   - 主站URL: {len(main_urls)} 个")
print(f"   - 博客URL: {len(blog_urls)} 个")
print(f"   - 总计: {len(main_urls) + len(blog_urls)} 个URL")
PYTHON_SCRIPT

# 3. 验证合并后的sitemap
if [ -f "$FRONTEND_DIR/public/sitemap.xml" ]; then
    total_urls=$(grep -c '<url>' "$FRONTEND_DIR/public/sitemap.xml" || echo "0")
    echo "✅ 合并后的sitemap.xml已生成（包含 $total_urls 个URL）"
else
    echo "❌ 合并失败：sitemap.xml不存在"
    exit 1
fi

echo "✅ Sitemap合并完成！"

