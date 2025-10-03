#!/bin/bash

# 最终访问测试脚本
# 智投简历项目 - 验证所有访问方式

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎯 最终访问测试${NC}"
echo "=================================="

# 测试1: 直接IP访问 (HTTP)
echo -e "${BLUE}1. 测试直接IP访问 (HTTP)${NC}"
HTTP_IP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://115.190.182.95)
if [ "$HTTP_IP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ http://115.190.182.95 - 状态码: $HTTP_IP_STATUS${NC}"
else
    echo -e "${RED}❌ http://115.190.182.95 - 状态码: $HTTP_IP_STATUS${NC}"
fi

# 测试2: 直接IP博客访问 (HTTP)
echo -e "${BLUE}2. 测试直接IP博客访问 (HTTP)${NC}"
HTTP_BLOG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://115.190.182.95/blog/)
if [ "$HTTP_BLOG_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ http://115.190.182.95/blog/ - 状态码: $HTTP_BLOG_STATUS${NC}"
else
    echo -e "${RED}❌ http://115.190.182.95/blog/ - 状态码: $HTTP_BLOG_STATUS${NC}"
fi

# 测试3: 域名HTTP访问 (应该重定向到HTTPS)
echo -e "${BLUE}3. 测试域名HTTP访问 (重定向测试)${NC}"
HTTP_DOMAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://zhitoujianli.com)
if [ "$HTTP_DOMAIN_STATUS" = "301" ]; then
    echo -e "${GREEN}✅ http://zhitoujianli.com - 状态码: $HTTP_DOMAIN_STATUS (正确重定向)${NC}"
else
    echo -e "${RED}❌ http://zhitoujianli.com - 状态码: $HTTP_DOMAIN_STATUS${NC}"
fi

# 测试4: 域名HTTPS访问
echo -e "${BLUE}4. 测试域名HTTPS访问${NC}"
HTTPS_DOMAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://zhitoujianli.com)
if [ "$HTTPS_DOMAIN_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ https://zhitoujianli.com - 状态码: $HTTPS_DOMAIN_STATUS${NC}"
else
    echo -e "${RED}❌ https://zhitoujianli.com - 状态码: $HTTPS_DOMAIN_STATUS${NC}"
fi

# 测试5: 域名博客HTTPS访问
echo -e "${BLUE}5. 测试域名博客HTTPS访问${NC}"
HTTPS_BLOG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://zhitoujianli.com/blog/)
if [ "$HTTPS_BLOG_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ https://zhitoujianli.com/blog/ - 状态码: $HTTPS_BLOG_STATUS${NC}"
else
    echo -e "${RED}❌ https://zhitoujianli.com/blog/ - 状态码: $HTTPS_BLOG_STATUS${NC}"
fi

# 测试6: www域名HTTPS访问
echo -e "${BLUE}6. 测试www域名HTTPS访问${NC}"
HTTPS_WWW_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.zhitoujianli.com)
if [ "$HTTPS_WWW_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ https://www.zhitoujianli.com - 状态码: $HTTPS_WWW_STATUS${NC}"
else
    echo -e "${RED}❌ https://www.zhitoujianli.com - 状态码: $HTTPS_WWW_STATUS${NC}"
fi

# 测试7: 后端API访问
echo -e "${BLUE}7. 测试后端API访问${NC}"
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://115.190.182.95:8080/api/status)
if [ "$API_STATUS" = "404" ] || [ "$API_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ http://115.190.182.95:8080/api/status - 状态码: $API_STATUS (后端服务正常)${NC}"
else
    echo -e "${RED}❌ http://115.190.182.95:8080/api/status - 状态码: $API_STATUS${NC}"
fi

echo "=================================="

# 统计结果
TOTAL_TESTS=7
PASSED_TESTS=0

if [ "$HTTP_IP_STATUS" = "200" ]; then ((PASSED_TESTS++)); fi
if [ "$HTTP_BLOG_STATUS" = "200" ]; then ((PASSED_TESTS++)); fi
if [ "$HTTP_DOMAIN_STATUS" = "301" ]; then ((PASSED_TESTS++)); fi
if [ "$HTTPS_DOMAIN_STATUS" = "200" ]; then ((PASSED_TESTS++)); fi
if [ "$HTTPS_BLOG_STATUS" = "200" ]; then ((PASSED_TESTS++)); fi
if [ "$HTTPS_WWW_STATUS" = "200" ]; then ((PASSED_TESTS++)); fi
if [ "$API_STATUS" = "404" ] || [ "$API_STATUS" = "200" ]; then ((PASSED_TESTS++)); fi

echo -e "${BLUE}📊 测试结果: $PASSED_TESTS/$TOTAL_TESTS 通过${NC}"

if [ "$PASSED_TESTS" -eq "$TOTAL_TESTS" ]; then
    echo -e "${GREEN}🎉 所有测试通过！网站部署完全成功！${NC}"
else
    echo -e "${YELLOW}⚠️  部分测试未通过，请检查配置${NC}"
fi

echo ""
echo -e "${BLUE}🌐 可用的访问方式:${NC}"
echo -e "${GREEN}   • 直接IP (HTTP): http://115.190.182.95${NC}"
echo -e "${GREEN}   • 直接IP博客: http://115.190.182.95/blog/${NC}"
echo -e "${GREEN}   • 域名 (HTTPS): https://zhitoujianli.com${NC}"
echo -e "${GREEN}   • 域名博客: https://zhitoujianli.com/blog/${NC}"
echo -e "${GREEN}   • www域名: https://www.zhitoujianli.com${NC}"
echo -e "${GREEN}   • 后端API: http://115.190.182.95:8080${NC}"

echo ""
echo -e "${YELLOW}💡 如果客户端仍然无法访问，请尝试:${NC}"
echo "1. 清除浏览器缓存和DNS缓存"
echo "2. 使用公共DNS (8.8.8.8, 1.1.1.1)"
echo "3. 尝试不同浏览器或设备"
echo "4. 检查本地防火墙和代理设置"
echo "5. 尝试移动网络访问"
