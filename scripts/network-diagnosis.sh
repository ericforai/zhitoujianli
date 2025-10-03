#!/bin/bash

# 网络诊断脚本
# 智投简历项目 - 深度网络诊断

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 开始深度网络诊断...${NC}"
echo "=================================="

# 1. 检查域名解析详细情况
echo -e "${BLUE}1. 域名解析详细检查${NC}"
echo "权威DNS服务器:"
dig +short NS zhitoujianli.com
echo "A记录:"
dig +short A zhitoujianli.com
echo "AAAA记录 (IPv6):"
dig +short AAAA zhitoujianli.com
echo "CNAME记录:"
dig +short CNAME zhitoujianli.com

# 2. 检查SSL证书详细信息
echo -e "${BLUE}2. SSL证书详细信息${NC}"
if [ -f "/etc/letsencrypt/live/zhitoujianli.com/fullchain.pem" ]; then
    echo "证书颁发者:"
    openssl x509 -issuer -noout -in /etc/letsencrypt/live/zhitoujianli.com/fullchain.pem
    echo "证书主题:"
    openssl x509 -subject -noout -in /etc/letsencrypt/live/zhitoujianli.com/fullchain.pem
    echo "证书有效期:"
    openssl x509 -dates -noout -in /etc/letsencrypt/live/zhitoujianli.com/fullchain.pem
    echo "证书SAN (Subject Alternative Names):"
    openssl x509 -text -noout -in /etc/letsencrypt/live/zhitoujianli.com/fullchain.pem | grep -A1 "Subject Alternative Name"
else
    echo -e "${RED}❌ SSL证书文件不存在${NC}"
fi

# 3. 检查网络连接测试
echo -e "${BLUE}3. 网络连接测试${NC}"
echo "从服务器到域名的连接测试:"
timeout 10 telnet zhitoujianli.com 80 2>/dev/null && echo -e "${GREEN}✅ HTTP端口(80)连接正常${NC}" || echo -e "${RED}❌ HTTP端口(80)连接失败${NC}"
timeout 10 telnet zhitoujianli.com 443 2>/dev/null && echo -e "${GREEN}✅ HTTPS端口(443)连接正常${NC}" || echo -e "${RED}❌ HTTPS端口(443)连接失败${NC}"

# 4. 检查nginx访问日志中的异常
echo -e "${BLUE}4. 最近的nginx访问日志分析${NC}"
echo "最近的访问记录 (最后10条):"
sudo tail -10 /var/log/nginx/access.log | while read line; do
    echo "  $line"
done

# 5. 检查系统资源使用情况
echo -e "${BLUE}5. 系统资源使用情况${NC}"
echo "内存使用:"
free -h
echo "磁盘使用:"
df -h /usr/share/nginx/html
echo "CPU负载:"
uptime

# 6. 检查防火墙和网络规则
echo -e "${BLUE}6. 网络规则检查${NC}"
echo "iptables规则:"
sudo iptables -L -n | head -10
echo "UFW状态:"
sudo ufw status verbose

# 7. 检查可能的网络限制
echo -e "${BLUE}7. 网络限制检查${NC}"
echo "检查是否有速率限制:"
sudo ss -i | grep -E "(zhitoujianli|443|80)" | head -5

# 8. 模拟浏览器请求
echo -e "${BLUE}8. 模拟浏览器请求测试${NC}"
echo "模拟Chrome浏览器请求:"
curl -s -I -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" https://zhitoujianli.com | head -5

echo "=================================="
echo -e "${BLUE}📋 网络诊断完成${NC}"

# 提供解决建议
echo -e "${YELLOW}💡 如果问题仍然存在，可能的原因:${NC}"
echo "1. 客户端DNS缓存问题 - 尝试清除DNS缓存"
echo "2. 客户端防火墙或代理设置"
echo "3. ISP网络限制或DNS劫持"
echo "4. CDN或负载均衡器配置问题"
echo "5. 浏览器安全策略限制"
echo ""
echo -e "${GREEN}🔧 建议的解决方案:${NC}"
echo "1. 尝试使用不同网络环境访问"
echo "2. 使用公共DNS (如8.8.8.8, 1.1.1.1)"
echo "3. 尝试不同的浏览器或设备"
echo "4. 检查本地防火墙和代理设置"
