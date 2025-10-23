#!/bin/bash

###############################################################################
# sitemap.xml 更新脚本
# 用途：自动生成/更新网站地图，确保 SEO 优化
# 作者：智投简历项目组
# 日期：2025-10-23
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_PUBLIC="${PROJECT_ROOT}/frontend/public"
FRONTEND_BUILD="${PROJECT_ROOT}/frontend/build"

# 当前日期（用于 lastmod）
CURRENT_DATE=$(date +%Y-%m-%d)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  智投简历 - Sitemap 更新工具${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 生成 sitemap.xml 内容
generate_sitemap() {
    local output_file="$1"

    cat > "$output_file" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- 首页 - 最高优先级 -->
  <url>
    <loc>https://zhitoujianli.com/</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- 功能介绍页面 - 重要营销页面 -->
  <url>
    <loc>https://zhitoujianli.com/features</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- 价格方案页面 - 重要营销页面 -->
  <url>
    <loc>https://zhitoujianli.com/pricing</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- 博客页面 - SEO内容页面 -->
  <url>
    <loc>https://zhitoujianli.com/blog</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- 联系我们页面 -->
  <url>
    <loc>https://zhitoujianli.com/contact</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- 用户注册页面 -->
  <url>
    <loc>https://zhitoujianli.com/register</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- 用户登录页面 -->
  <url>
    <loc>https://zhitoujianli.com/login</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- 控制台 - 需登录访问，较低优先级 -->
  <url>
    <loc>https://zhitoujianli.com/dashboard</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- 简历投递功能页 -->
  <url>
    <loc>https://zhitoujianli.com/resume-delivery</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- 自动投递功能页 -->
  <url>
    <loc>https://zhitoujianli.com/auto-delivery</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- BOSS直聘投递页 -->
  <url>
    <loc>https://zhitoujianli.com/boss-delivery</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- 智能打招呼功能页 -->
  <url>
    <loc>https://zhitoujianli.com/smart-greeting</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- 职位匹配功能页 -->
  <url>
    <loc>https://zhitoujianli.com/jd-matching</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- 配置页面 -->
  <url>
    <loc>https://zhitoujianli.com/config</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>

</urlset>
EOF
}

# 步骤1：生成 public 目录的 sitemap.xml
echo -e "${YELLOW}[1/3]${NC} 正在更新 ${FRONTEND_PUBLIC}/sitemap.xml..."
if [ -d "$FRONTEND_PUBLIC" ]; then
    generate_sitemap "${FRONTEND_PUBLIC}/sitemap.xml"
    echo -e "${GREEN}✓${NC} 已更新 public/sitemap.xml"
else
    echo -e "${RED}✗${NC} 目录不存在：${FRONTEND_PUBLIC}"
    exit 1
fi

# 步骤2：生成 build 目录的 sitemap.xml（如果存在）
echo -e "${YELLOW}[2/3]${NC} 正在更新 ${FRONTEND_BUILD}/sitemap.xml..."
if [ -d "$FRONTEND_BUILD" ]; then
    generate_sitemap "${FRONTEND_BUILD}/sitemap.xml"
    echo -e "${GREEN}✓${NC} 已更新 build/sitemap.xml"
else
    echo -e "${YELLOW}⚠${NC} 目录不存在（跳过）：${FRONTEND_BUILD}"
fi

# 步骤3：验证 XML 格式
echo -e "${YELLOW}[3/3]${NC} 验证 sitemap.xml 格式..."
if command -v xmllint &> /dev/null; then
    if xmllint --noout "${FRONTEND_PUBLIC}/sitemap.xml" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} sitemap.xml 格式验证通过"
    else
        echo -e "${RED}✗${NC} sitemap.xml 格式验证失败"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠${NC} 未安装 xmllint，跳过格式验证"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Sitemap 更新成功！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📍 生成的文件："
echo -e "   - ${FRONTEND_PUBLIC}/sitemap.xml"
[ -d "$FRONTEND_BUILD" ] && echo -e "   - ${FRONTEND_BUILD}/sitemap.xml"
echo ""
echo -e "🔗 访问地址："
echo -e "   https://zhitoujianli.com/sitemap.xml"
echo ""
echo -e "📝 提示："
echo -e "   1. 记得在部署后访问上述 URL 验证"
echo -e "   2. 可以在 Google Search Console 提交 sitemap"
echo -e "   3. 确保 robots.txt 包含 sitemap 引用"
echo ""

