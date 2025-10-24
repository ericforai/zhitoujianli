#!/usr/bin/env python3
"""
批量修复博客文章中的重复标题问题
移除Markdown文件中与frontmatter title重复的H1标题
"""

import os
import re
import yaml
from pathlib import Path

def extract_frontmatter_title(file_path):
    """提取frontmatter中的title"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 提取frontmatter
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            frontmatter = parts[1]
            try:
                data = yaml.safe_load(frontmatter)
                return data.get('title', '')
            except yaml.YAMLError:
                pass
    return ''

def remove_duplicate_h1_title(file_path):
    """移除与frontmatter title重复的H1标题"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 提取frontmatter中的title
    frontmatter_title = extract_frontmatter_title(file_path)
    if not frontmatter_title:
        return False

    # 查找H1标题
    lines = content.split('\n')
    new_lines = []
    removed = False

    i = 0
    while i < len(lines):
        line = lines[i]

        # 检查是否是H1标题
        if line.startswith('# ') and not line.startswith('## '):
            h1_title = line[2:].strip()
            # 如果H1标题与frontmatter title相同，则跳过这一行
            if h1_title == frontmatter_title:
                print(f"移除重复标题: {h1_title}")
                removed = True
                i += 1
                continue

        new_lines.append(line)
        i += 1

    if removed:
        # 写回文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        return True

    return False

def main():
    """主函数"""
    blog_dir = Path('/root/zhitoujianli/blog/zhitoujianli-blog/src/data/post')

    if not blog_dir.exists():
        print(f"目录不存在: {blog_dir}")
        return

    md_files = list(blog_dir.glob('*.md'))
    print(f"找到 {len(md_files)} 个Markdown文件")

    fixed_count = 0
    for file_path in md_files:
        print(f"\n处理文件: {file_path.name}")
        if remove_duplicate_h1_title(file_path):
            fixed_count += 1
            print(f"✅ 已修复: {file_path.name}")
        else:
            print(f"⏭️  无需修复: {file_path.name}")

    print(f"\n🎉 修复完成！共修复了 {fixed_count} 个文件")

if __name__ == '__main__':
    main()
