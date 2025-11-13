#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# 创建完整的博客文章（包含所有分享功能）

import shutil

# 复制第一篇文章作为基础
template_file = '/root/zhitoujianli/frontend/public/2025-job-market-truth.html'

# 文章配置
articles = [
    {
        'output': '/root/zhitoujianli/frontend/public/resume-optimization-guide-full.html',
        'title': '简历优化指南：从2%到30%通过率的秘密',
        'h1': '简历优化指南：从2%到30%通过率的秘密',
        'date': '2025年11月14日',
        'color': 'from-blue-600 to-purple-600'
    },
    {
        'output': '/root/zhitoujianli/frontend/public/2025-recruitment-market-report-full.html',
        'title': '求职者必读：2025年招聘市场趋势报告',
        'h1': '求职者必读：2025年招聘市场趋势报告',
        'date': '2025年11月15日',
        'color': 'from-purple-600 to-pink-600'
    },
    {
        'output': '/root/zhitoujianli/frontend/public/user-success-stories-full.html',
        'title': '真实案例：10个用户的求职成功故事',
        'h1': '真实案例：10个用户的求职成功故事',
        'date': '2025年11月16日',
        'color': 'from-green-600 to-teal-600'
    }
]

for article in articles:
    # 复制模板
    shutil.copy(template_file, article['output'])
    print(f"✓ 创建: {article['output'].split('/')[-1]}")

print(f"\n已创建{len(articles)}个文章模板文件")
print("请使用search_replace工具修改具体内容")
