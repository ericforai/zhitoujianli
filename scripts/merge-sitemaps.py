#!/usr/bin/env python3
"""
合并主站和博客的sitemap为一个统一的sitemap.xml
使用Python处理XML，确保格式正确且可读
"""

import xml.etree.ElementTree as ET
from datetime import datetime

# 文件路径（使用仓库根相对路径，提升可移植性）
from pathlib import Path
ROOT_DIR = Path(__file__).resolve().parents[1]
# 现状：主站不再维护 sitemap-main.xml，直接以主站的 sitemap.xml 为输入
# 要求：主站的 sitemap.xml 中不应包含 /blog 的条目；博客侧从 Astro 构建产物合并
MAIN_SITEMAP = str((ROOT_DIR / "frontend/public/sitemap.xml").resolve())
# 博客sitemap入口：优先使用 dist/sitemap-index.xml（索引）；若不存在则尝试 dist/sitemap-0.xml（直出urlset）
BLOG_SITEMAP_INDEX = (ROOT_DIR / "blog/zhitoujianli-blog/dist/sitemap-index.xml").resolve()
BLOG_SITEMAP_DIRECT = (ROOT_DIR / "blog/zhitoujianli-blog/dist/sitemap-0.xml").resolve()
OUTPUT_SITEMAP = str((ROOT_DIR / "frontend/public/sitemap.xml").resolve())

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

# 3. 添加博客URL（可选存在）
print("正在合并博客sitemap...")
blog_urls = []

def extract_urls_from_urlset(root: ET.Element) -> list[ET.Element]:
    return root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}url')

def parse_blog_sitemap() -> list[ET.Element]:
    # 优先尝试 sitemap-index.xml
    if BLOG_SITEMAP_INDEX.exists():
        try:
            index_tree = ET.parse(str(BLOG_SITEMAP_INDEX))
            index_root = index_tree.getroot()
            tag = index_root.tag
            # sitemapindex: 逐个解析 loc 指向的 sitemap 文件
            if tag.endswith('sitemapindex'):
                loc_elems = index_root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
                collected: list[ET.Element] = []
                for loc in loc_elems:
                    try:
                        loc_text = (loc.text or '').strip()
                        # 仅合并 /blog 下的URL；且只处理本地 dist 文件（避免网络依赖）
                        # 将 URL 映射为本地文件路径（sitemap-*.xml）
                        # 简化策略：当 loc 指向 dist 内部文件时通常为同名文件
                        candidate = BLOG_SITEMAP_INDEX.parent / Path(loc_text).name
                        if candidate.exists():
                            subtree = ET.parse(str(candidate))
                            subroot = subtree.getroot()
                            collected.extend(extract_urls_from_urlset(subroot))
                    except Exception:
                        continue
                return collected
            # 若 index 根本就是 urlset（少见），直接抽取
            return extract_urls_from_urlset(index_root)
        except Exception as e:
            print(f"⚠ 解析博客 sitemap-index.xml 失败：{e}，尝试直接文件...")
    # 退化：尝试直接的 urlset 文件
    if BLOG_SITEMAP_DIRECT.exists():
        try:
            direct_tree = ET.parse(str(BLOG_SITEMAP_DIRECT))
            direct_root = direct_tree.getroot()
            return extract_urls_from_urlset(direct_root)
        except Exception as e:
            print(f"⚠ 解析博客 sitemap-0.xml 失败：{e}")
    print(f"⚠ 未找到可用的博客sitemap（尝试了 {BLOG_SITEMAP_INDEX} 与 {BLOG_SITEMAP_DIRECT}）")
    return []

try:
    blog_urls = parse_blog_sitemap()
    if blog_urls:
        comment_blog = ET.Comment(' 博客页面 ')
        urlset.append(comment_blog)
        for url in blog_urls:
            urlset.append(url)
        print(f"✓ 添加了 {len(blog_urls)} 个博客URL")
    else:
        print("⚠ 未合并任何博客URL（可能博客侧未构建或索引为空）")
except Exception as e:
    print(f"✗ 读取博客sitemap失败: {e}")
    # 不强退，保留主站URL

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

