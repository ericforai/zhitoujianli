#!/usr/bin/env python3
"""
自动生成主站sitemap-main.xml
从配置文件读取主站页面列表，自动生成标准sitemap格式
"""

import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime
import json

ROOT_DIR = Path(__file__).resolve().parents[1]
CONFIG_FILE = ROOT_DIR / "config" / "site-pages.json"
OUTPUT_FILE = ROOT_DIR / "frontend" / "public" / "sitemap-main.xml"

def load_site_pages_config():
    """从配置文件加载主站页面列表"""
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    else:
        # 默认配置（如果配置文件不存在）
        return {
            "site_url": "https://zhitoujianli.com",
            "pages": [
                {"path": "/", "priority": 1.0, "changefreq": "weekly", "lastmod": "2025-11-12"},
                {"path": "/2025-job-market-truth.html", "priority": 0.6, "changefreq": "monthly", "lastmod": "2025-11-15"},
                {"path": "/2025-recruitment-market-report.html", "priority": 0.6, "changefreq": "monthly", "lastmod": "2025-11-15"},
                {"path": "/blog-index.html", "priority": 0.6, "changefreq": "weekly", "lastmod": "2025-11-26"},
                {"path": "/contact", "priority": 0.7, "changefreq": "monthly", "lastmod": "2025-11-12"},
                {"path": "/guide", "priority": 0.7, "changefreq": "monthly", "lastmod": "2025-11-12"},
                {"path": "/help", "priority": 0.7, "changefreq": "monthly", "lastmod": "2025-11-12"},
                {"path": "/login", "priority": 0.6, "changefreq": "monthly", "lastmod": "2025-11-12"},
                {"path": "/pricing", "priority": 0.9, "changefreq": "weekly", "lastmod": "2025-11-12"},
                {"path": "/privacy", "priority": 0.5, "changefreq": "yearly", "lastmod": "2025-11-12"},
                {"path": "/register", "priority": 0.8, "changefreq": "monthly", "lastmod": "2025-11-12"},
                {"path": "/resume-optimization-guide.html", "priority": 0.6, "changefreq": "monthly", "lastmod": "2025-11-15"},
                {"path": "/terms", "priority": 0.5, "changefreq": "yearly", "lastmod": "2025-11-12"},
                {"path": "/user-success-stories.html", "priority": 0.6, "changefreq": "monthly", "lastmod": "2025-11-15"},
            ]
        }

def generate_sitemap(config):
    """生成sitemap XML"""
    urlset = ET.Element('urlset')
    urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    urlset.set('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
    urlset.set('xsi:schemaLocation', 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd')

    # 添加注释
    comment = ET.Comment(' 主站页面 ')
    urlset.append(comment)

    site_url = config.get('site_url', 'https://zhitoujianli.com')

    for page in config.get('pages', []):
        url_elem = ET.SubElement(urlset, 'url')

        # loc: 完整URL
        loc_elem = ET.SubElement(url_elem, 'loc')
        path = page['path']
        if not path.startswith('http'):
            loc_elem.text = f"{site_url}{path}" if path.startswith('/') else f"{site_url}/{path}"
        else:
            loc_elem.text = path

        # lastmod: 最后修改时间
        lastmod_elem = ET.SubElement(url_elem, 'lastmod')
        lastmod_elem.text = page.get('lastmod', datetime.now().strftime('%Y-%m-%d'))

        # changefreq: 更新频率
        changefreq_elem = ET.SubElement(url_elem, 'changefreq')
        changefreq_elem.text = page.get('changefreq', 'monthly')

        # priority: 优先级
        priority_elem = ET.SubElement(url_elem, 'priority')
        priority_elem.text = str(page.get('priority', 0.5))

    return urlset

def main():
    """主函数"""
    print("=" * 60)
    print("  生成主站Sitemap (sitemap-main.xml)")
    print("=" * 60)
    print()

    # 加载配置
    config = load_site_pages_config()
    print(f"✓ 加载配置: {CONFIG_FILE}")
    print(f"  站点URL: {config.get('site_url')}")
    print(f"  页面数量: {len(config.get('pages', []))}")
    print()

    # 生成sitemap
    urlset = generate_sitemap(config)

    # 格式化XML
    def indent_xml(elem, level=0):
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

    indent_xml(urlset)

    # 写入文件
    tree = ET.ElementTree(urlset)
    ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    ET.register_namespace('xsi', 'http://www.w3.org/2001/XMLSchema-instance')

    with open(OUTPUT_FILE, 'wb') as f:
        f.write(b'<?xml version="1.0" encoding="UTF-8"?>\n')
        tree.write(f, encoding='utf-8', xml_declaration=False)

    print(f"✓ Sitemap已生成: {OUTPUT_FILE}")
    print(f"  页面数量: {len(config.get('pages', []))}")
    print()
    print("=" * 60)
    print("✅ 完成")
    print("=" * 60)

if __name__ == '__main__':
    main()



