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
# 主站sitemap：仅包含主站URL，不包含/blog/路径
MAIN_SITEMAP = str((ROOT_DIR / "frontend/public/sitemap-main.xml").resolve())
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

# 0. 清理旧的sitemap.xml（防止重复累积）
if Path(OUTPUT_SITEMAP).exists():
    try:
        Path(OUTPUT_SITEMAP).unlink()
        print(f"✓ 已删除旧的sitemap.xml（防止重复累积）")
    except Exception as e:
        print(f"⚠ 删除旧sitemap.xml失败: {e}")
print()

# 1. 创建根元素（确保没有重复属性）
urlset = ET.Element('urlset', {
    'xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    'xsi:schemaLocation': 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd'
})

# 用于去重的URL集合
seen_urls = set()

def extract_url_loc(url_elem: ET.Element) -> str:
    """提取URL元素的loc文本内容"""
    loc_elem = url_elem.find('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
    return (loc_elem.text or '').strip() if loc_elem is not None else ''

def add_url_if_unique(url_elem: ET.Element, urlset: ET.Element, seen_urls: set) -> bool:
    """添加URL元素，如果URL尚未存在则返回True"""
    url_loc = extract_url_loc(url_elem)
    if url_loc and url_loc not in seen_urls:
        seen_urls.add(url_loc)
        urlset.append(url_elem)
        return True
    return False

# 2. 添加主站URL
print("正在合并主站sitemap...")
main_url_count = 0
try:
    if not Path(MAIN_SITEMAP).exists():
        print(f"⚠ 主站sitemap不存在: {MAIN_SITEMAP}")
    else:
        main_tree = ET.parse(MAIN_SITEMAP)
        main_root = main_tree.getroot()
        main_urls = main_root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}url')

        # 添加注释
        comment_main = ET.Comment(' 主站页面 ')
        urlset.append(comment_main)

        for url in main_urls:
            # 深拷贝URL元素，避免后续修改影响原树
            url_copy = ET.fromstring(ET.tostring(url, encoding='unicode'))
            if add_url_if_unique(url_copy, urlset, seen_urls):
                main_url_count += 1

        print(f"✓ 添加了 {main_url_count} 个主站URL")
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
    blog_url_count = 0
    if blog_urls:
        comment_blog = ET.Comment(' 博客页面 ')
        urlset.append(comment_blog)
        for url in blog_urls:
            # 深拷贝URL元素，避免后续修改影响原树
            url_copy = ET.fromstring(ET.tostring(url, encoding='unicode'))
            if add_url_if_unique(url_copy, urlset, seen_urls):
                blog_url_count += 1
        if blog_url_count > 0:
            print(f"✓ 添加了 {blog_url_count} 个博客URL（去重后）")
        else:
            print("⚠ 博客URL已全部存在于sitemap中（跳过重复）")
    else:
        print("⚠ 未合并任何博客URL（可能博客侧未构建或索引为空）")
except Exception as e:
    print(f"✗ 读取博客sitemap失败: {e}")
    # 不强退，保留主站URL

# 4. 美化XML格式
indent_xml(urlset)

# 5. 手动构建XML字符串，确保格式正确且无重复属性
xml_lines = ['<?xml version="1.0" encoding="UTF-8"?>']
xml_lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">')

def format_url_element(url_elem, indent=2):
    """格式化URL元素为XML字符串"""
    lines = []
    indent_str = ' ' * indent
    lines.append(f'{indent_str}<url>')

    for child in url_elem:
        tag = child.tag.replace('{http://www.sitemaps.org/schemas/sitemap/0.9}', '')
        text = child.text.strip() if child.text else ''
        lines.append(f'{indent_str}  <{tag}>{text}</{tag}>')

    lines.append(f'{indent_str}</url>')
    return '\n'.join(lines)

# 添加所有URL元素
for child in urlset:
    if child.tag is ET.Comment:
        xml_lines.append(f'  {ET.tostring(child, encoding="unicode")}')
    elif 'url' in child.tag.lower():
        xml_lines.append(format_url_element(child))

xml_lines.append('</urlset>')

# 写入文件
with open(OUTPUT_SITEMAP, 'w', encoding='utf-8') as f:
    f.write('\n'.join(xml_lines) + '\n')

print()
print("=" * 60)
print("✅ Sitemap合并完成")
print("=" * 60)
print()
print(f"统计信息：")
print(f"  主站URL:  {main_url_count} 个")
print(f"  博客URL:  {blog_url_count} 个")
print(f"  总计:     {len(seen_urls)} 个（已去重）")
print()
print(f"输出文件: {OUTPUT_SITEMAP}")
print()
print("现在所有URL都在一个sitemap.xml文件中！")

