#!/bin/bash

# 智投简历博客 - 搜索引擎提交脚本
# 功能：提交sitemap到百度站长平台和Google Search Console

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
SITE_URL="https://zhitoujianli.com"
SITEMAP_URL="${SITE_URL}/sitemap.xml"  # 统一的sitemap入口
BAIDU_TOKEN=""  # 需要从百度站长平台获取
GOOGLE_ACCESS_TOKEN=""  # 需要从Google Search Console获取（可选）

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}    智投简历博客 - 搜索引擎提交工具${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# 检查sitemap是否可访问
echo -e "${BLUE}📋 检查sitemap可访问性...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "${SITEMAP_URL}" | grep -q "200"; then
    echo -e "${GREEN}✅ Sitemap可访问: ${SITEMAP_URL}${NC}"
else
    echo -e "${RED}❌ Sitemap不可访问: ${SITEMAP_URL}${NC}"
    echo -e "${YELLOW}⚠️  请确保博客已部署到生产环境${NC}"
    exit 1
fi

# 提交到百度站长平台
if [ -n "$BAIDU_TOKEN" ]; then
    echo ""
    echo -e "${BLUE}📤 正在提交到百度站长平台...${NC}"

    BAIDU_API_URL="http://data.zz.baidu.com/urls?site=zhitoujianli.com&token=${BAIDU_TOKEN}"

    # 提交sitemap
    RESPONSE=$(curl -s -X POST "${BAIDU_API_URL}" \
        -H "Content-Type: text/plain" \
        -d "${SITEMAP_URL}")

    echo -e "${BLUE}📊 百度API响应：${NC}"
    echo "${RESPONSE}" | python3 -m json.tool 2>/dev/null || echo "${RESPONSE}"

    # 检查响应
    if echo "${RESPONSE}" | grep -q '"success"'; then
        SUCCESS=$(echo "${RESPONSE}" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', 0))" 2>/dev/null || echo "0")
        if [ "$SUCCESS" = "1" ]; then
            echo -e "${GREEN}✅ 百度提交成功！${NC}"
        else
            echo -e "${YELLOW}⚠️  百度提交可能失败，请检查响应${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  无法解析百度响应${NC}"
    fi
else
    echo ""
    echo -e "${YELLOW}⚠️  百度Token未配置，跳过百度提交${NC}"
    echo -e "${BLUE}💡 提示：${NC}"
    echo "   1. 访问 https://ziyuan.baidu.com/"
    echo "   2. 进入「数据引入」→「链接提交」→「主动推送」"
    echo "   3. 复制Token并设置环境变量："
    echo "      export BAIDU_TOKEN='your_token_here'"
    echo "   4. 或编辑此脚本，设置 BAIDU_TOKEN 变量"
fi

# 提交到Google Search Console
echo ""
echo -e "${BLUE}📤 正在提交到Google Search Console...${NC}"
echo -e "${YELLOW}⚠️  Google Search Console需要手动提交${NC}"
echo -e "${BLUE}💡 手动提交步骤：${NC}"
echo "   1. 访问 https://search.google.com/search-console"
echo "   2. 选择网站：zhitoujianli.com"
echo "   3. 进入「Sitemaps」"
echo "   4. 输入sitemap地址：${SITEMAP_URL}"
echo "   5. 点击「提交」"

# 生成提交URL列表
echo ""
echo -e "${BLUE}📋 博客文章URL示例：${NC}"
echo -e "${GREEN}${SITE_URL}/blog/2025-job-hunting-guide-ai-revolution/${NC}"
echo -e "${GREEN}${SITE_URL}/blog/resume-delivery-efficiency-10x-improvement/${NC}"
echo -e "${GREEN}${SITE_URL}/blog/fresh-graduate-job-hunting-mistakes/${NC}"
echo -e "${GREEN}${SITE_URL}/blog/boss-zhipin-auto-delivery-guide/${NC}"

echo ""
echo -e "${GREEN}🎉 提交完成！${NC}"
echo ""
echo -e "${BLUE}📝 后续操作建议：${NC}"
echo "   1. 【3天后检查】访问百度站长平台查看收录状态"
echo "   2. 【1周后验证】搜索: site:zhitoujianli.com 求职指南"
echo "   3. 【监控索引】定期查看「数据监控」→「索引量」"
echo "   4. 【Google验证】在Google Search Console提交sitemap"
echo "   5. 【域名迁移】使用百度站长平台的「网站改版」工具通知百度"

