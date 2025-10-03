#!/bin/bash

# 网站诊断脚本
# 智投简历项目 - 诊断网站访问问题

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 开始网站诊断...${NC}"
echo "=================================="

# 1. 检查域名解析
echo -e "${BLUE}1. 检查域名解析${NC}"
DOMAIN_IP=$(nslookup zhitoujianli.com | grep "Address:" | tail -1 | awk '{print $2}')
if [ "$DOMAIN_IP" = "115.190.182.95" ]; then
    echo -e "${GREEN}✅ 域名解析正常: zhitoujianli.com -> $DOMAIN_IP${NC}"
else
    echo -e "${RED}❌ 域名解析异常: zhitoujianli.com -> $DOMAIN_IP (期望: 115.190.182.95)${NC}"
fi

# 2. 检查网络连通性
echo -e "${BLUE}2. 检查网络连通性${NC}"
if ping -c 3 zhitoujianli.com > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 网络连通性正常${NC}"
else
    echo -e "${RED}❌ 网络连通性异常${NC}"
fi

# 3. 检查服务器端口
echo -e "${BLUE}3. 检查服务器端口${NC}"
if ss -tlnp | grep -q ":80 "; then
    echo -e "${GREEN}✅ HTTP端口(80)正常监听${NC}"
else
    echo -e "${RED}❌ HTTP端口(80)未监听${NC}"
fi

if ss -tlnp | grep -q ":443 "; then
    echo -e "${GREEN}✅ HTTPS端口(443)正常监听${NC}"
else
    echo -e "${RED}❌ HTTPS端口(443)未监听${NC}"
fi

# 4. 检查nginx服务状态
echo -e "${BLUE}4. 检查nginx服务状态${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx服务正常运行${NC}"
else
    echo -e "${RED}❌ Nginx服务异常${NC}"
fi

# 5. 检查nginx配置
echo -e "${BLUE}5. 检查nginx配置${NC}"
if nginx -t > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Nginx配置语法正确${NC}"
else
    echo -e "${RED}❌ Nginx配置语法错误${NC}"
    nginx -t
fi

# 6. 检查网站文件
echo -e "${BLUE}6. 检查网站文件${NC}"
if [ -f "/usr/share/nginx/html/index.html" ]; then
    echo -e "${GREEN}✅ 网站首页文件存在${NC}"
else
    echo -e "${RED}❌ 网站首页文件不存在${NC}"
fi

# 7. 测试HTTP访问
echo -e "${BLUE}7. 测试HTTP访问${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://zhitoujianli.com)
if [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ HTTP访问正常 (状态码: $HTTP_STATUS)${NC}"
else
    echo -e "${RED}❌ HTTP访问异常 (状态码: $HTTP_STATUS)${NC}"
fi

# 8. 测试HTTPS访问
echo -e "${BLUE}8. 测试HTTPS访问${NC}"
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://zhitoujianli.com)
if [ "$HTTPS_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ HTTPS访问正常 (状态码: $HTTPS_STATUS)${NC}"
else
    echo -e "${RED}❌ HTTPS访问异常 (状态码: $HTTPS_STATUS)${NC}"
fi

# 9. 检查SSL证书
echo -e "${BLUE}9. 检查SSL证书${NC}"
if [ -f "/etc/letsencrypt/live/zhitoujianli.com/fullchain.pem" ]; then
    echo -e "${GREEN}✅ SSL证书文件存在${NC}"
    CERT_EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/zhitoujianli.com/fullchain.pem | cut -d= -f2)
    echo -e "${BLUE}   证书过期时间: $CERT_EXPIRY${NC}"
else
    echo -e "${RED}❌ SSL证书文件不存在${NC}"
fi

# 10. 检查防火墙
echo -e "${BLUE}10. 检查防火墙${NC}"
if ufw status | grep -q "Status: inactive"; then
    echo -e "${GREEN}✅ 防火墙已关闭${NC}"
else
    echo -e "${YELLOW}⚠️  防火墙状态:${NC}"
    ufw status
fi

echo "=================================="
echo -e "${BLUE}📋 诊断完成${NC}"

# 提供访问链接
echo -e "${BLUE}🌐 网站访问链接:${NC}"
echo -e "${GREEN}   HTTP:  http://zhitoujianli.com${NC}"
echo -e "${GREEN}   HTTPS: https://zhitoujianli.com${NC}"
echo -e "${GREEN}   博客:  https://zhitoujianli.com/blog/${NC}"

# 提供故障排除建议
echo -e "${YELLOW}💡 如果仍然无法访问，请尝试:${NC}"
echo "   1. 清除浏览器缓存和DNS缓存"
echo "   2. 尝试使用不同的浏览器或设备"
echo "   3. 检查本地网络是否有限制"
echo "   4. 等待DNS传播完成（最多24小时）"
