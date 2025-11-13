#!/usr/bin/env python3
"""
合并主站和博客的sitemap为一个统一的sitemap.xml
使用Python处理XML，确保格式正确且可读
"""

import xml.etree.ElementTree as ET
from datetime import datetime

# 文件路径
MAIN_SITEMAP = "/root/zhitoujianli/frontend/public/sitemap-main.xml"
BLOG_SITEMAP = "/root/zhitoujianli/blog/zhitoujianli-blog/dist/sitemap-0.xml"
OUTPUT_SITEMAP = "/root/zhitoujianli/frontend/public/sitemap.xml"

# XML命名空间
NS = {'sitemap': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

def indent_xml(elem, level=0):
    """美化XML输出"""
    i = "\n" + level * "  "
    if len(elem):
        if not elem.text or not elem.text.strip():
            elem.text = i + "  "
        if not elem.tail or not elem.tail.strip():
            elem.tail = i
        for child in elem:
            indent_xml(child, level + 1)
        if not child.tail or not child.tail.strip():
            child.tail = i
    else:
        if level and (not elem.tail or not elem.tail.strip()):
            elem.tail = i

print("=" * 60)
print("  合并Sitemap - 创建统一sitemap.xml")
print("=" * 60)
print()

# 1. 创建根元素
urlset = ET.Element('urlset')
urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
urlset.set('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
urlset.set('xsi:schemaLocation', 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd')

# 2. 添加主站URL
print("正在合并主站sitemap...")
try:
    main_tree = ET.parse(MAIN_SITEMAP)
    main_root = main_tree.getroot()
    main_urls = main_root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}url')

    # 添加注释
    comment_main = ET.Comment(' 主站页面 ')
    urlset.append(comment_main)

    for url in main_urls:
        urlset.append(url)

    print(f"✓ 添加了 {len(main_urls)} 个主站URL")
except Exception as e:
    print(f"✗ 读取主站sitemap失败: {e}")
    exit(1)

# 3. 添加博客URL
print("正在合并博客sitemap...")
try:
    blog_tree = ET.parse(BLOG_SITEMAP)
    blog_root = blog_tree.getroot()

    # 处理不同命名空间
    blog_urls = blog_root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}url')

    # 添加注释
    comment_blog = ET.Comment(' 博客页面 ')
    urlset.append(comment_blog)

    for url in blog_urls:
        urlset.append(url)

    print(f"✓ 添加了 {len(blog_urls)} 个博客URL")
except Exception as e:
    print(f"✗ 读取博客sitemap失败: {e}")
    exit(1)

# 4. 美化XML格式
indent_xml(urlset)

# 5. 创建XML树并写入文件
tree = ET.ElementTree(urlset)
ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')
ET.register_namespace('xsi', 'http://www.w3.org/2001/XMLSchema-instance')

with open(OUTPUT_SITEMAP, 'wb') as f:
    f.write(b'<?xml version="1.0" encoding="UTF-8"?>\n')
    tree.write(f, encoding='utf-8', xml_declaration=False)

print()
print("=" * 60)
print("✅ Sitemap合并完成")
print("=" * 60)
print()
print(f"统计信息：")
print(f"  主站URL:  {len(main_urls)} 个")
print(f"  博客URL:  {len(blog_urls)} 个")
print(f"  总计:     {len(main_urls) + len(blog_urls)} 个")
print()
print(f"输出文件: {OUTPUT_SITEMAP}")
print()
print("现在所有URL都在一个sitemap.xml文件中！")

