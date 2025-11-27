#!/bin/bash
# 自动化构建和验证脚本
# 1. 构建Astro博客
# 2. 生成主站sitemap
# 3. 合并sitemap
# 4. 验证链接和sitemap

set -e  # 遇到错误立即退出

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "============================================================"
echo "  自动化构建和验证流程"
echo "============================================================"
echo ""

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 步骤1: 构建Astro博客
echo -e "${GREEN}[1/4]${NC} 构建Astro博客..."
cd blog/zhitoujianli-blog
if npm run build; then
    echo -e "${GREEN}✓${NC} Astro博客构建成功"
else
    echo -e "${RED}✗${NC} Astro博客构建失败"
    exit 1
fi
cd "$ROOT_DIR"
echo ""

# 步骤2: 生成主站sitemap
echo -e "${GREEN}[2/4]${NC} 生成主站sitemap..."
if python3 scripts/generate-sitemap-main.py; then
    echo -e "${GREEN}✓${NC} 主站sitemap生成成功"
else
    echo -e "${RED}✗${NC} 主站sitemap生成失败"
    exit 1
fi
echo ""

# 步骤3: 合并sitemap
echo -e "${GREEN}[3/4]${NC} 合并sitemap..."
if python3 scripts/merge-sitemaps.py; then
    echo -e "${GREEN}✓${NC} Sitemap合并成功"
else
    echo -e "${RED}✗${NC} Sitemap合并失败"
    exit 1
fi
echo ""

# 步骤4: 验证sitemap格式
echo -e "${GREEN}[4/4]${NC} 验证sitemap格式..."
if python3 -c "
import xml.etree.ElementTree as ET
import sys

try:
    # 验证主站sitemap
    tree = ET.parse('frontend/public/sitemap-main.xml')
    print('✓ sitemap-main.xml 格式正确')

    # 验证合并后的sitemap
    tree = ET.parse('frontend/public/sitemap.xml')
    urls = tree.getroot().findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}url')
    print(f'✓ sitemap.xml 格式正确，包含 {len(urls)} 个URL')

    # 检查重复URL
    url_set = set()
    for url in urls:
        loc = url.find('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
        if loc is not None and loc.text:
            if loc.text in url_set:
                print(f'✗ 发现重复URL: {loc.text}')
                sys.exit(1)
            url_set.add(loc.text)

    print('✓ 无重复URL')
except Exception as e:
    print(f'✗ Sitemap验证失败: {e}')
    sys.exit(1)
"; then
    echo -e "${GREEN}✓${NC} Sitemap验证通过"
else
    echo -e "${RED}✗${NC} Sitemap验证失败"
    exit 1
fi
echo ""

echo "============================================================"
echo -e "${GREEN}✅ 构建和验证完成${NC}"
echo "============================================================"



