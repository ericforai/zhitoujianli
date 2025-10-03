#!/bin/bash

# SSL证书配置脚本
# 使用Let's Encrypt免费SSL证书

set -e

echo "🔒 开始配置SSL证书..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查域名参数
if [ -z "$1" ]; then
    echo -e "${RED}❌ 请提供域名参数${NC}"
    echo "用法: $0 <域名>"
    echo "示例: $0 zhitoujianli.com"
    exit 1
fi

DOMAIN=$1
EMAIL="admin@${DOMAIN}"

echo -e "${BLUE}🌐 域名: ${DOMAIN}${NC}"
echo -e "${BLUE}📧 邮箱: ${EMAIL}${NC}"

# 安装certbot
echo -e "${BLUE}📦 安装certbot...${NC}"
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# 停止nginx
echo -e "${BLUE}⏸️  停止nginx...${NC}"
sudo systemctl stop nginx

# 获取SSL证书
echo -e "${BLUE}🔐 获取SSL证书...${NC}"
sudo certbot certonly --standalone -d ${DOMAIN} -d www.${DOMAIN} --email ${EMAIL} --agree-tos --non-interactive

# 创建nginx SSL配置
echo -e "${BLUE}⚙️  创建SSL配置...${NC}"
sudo tee /etc/nginx/sites-available/zhitoujianli-ssl > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};
    
    root /var/www/zhitoujianli;
    index index.html;

    # SSL配置
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # 现代SSL配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # 安全头部
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA路由支持
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 博客路径
    location /blog {
        alias /var/www/zhitoujianli/blog;
        try_files \$uri \$uri/ /blog/index.html;
    }

    # API代理（如果有后端服务）
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# 启用SSL站点
sudo ln -sf /etc/nginx/sites-available/zhitoujianli-ssl /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试nginx配置
if sudo nginx -t; then
    echo -e "${GREEN}✅ Nginx配置测试通过${NC}"
else
    echo -e "${RED}❌ Nginx配置测试失败${NC}"
    exit 1
fi

# 启动nginx
sudo systemctl start nginx

# 设置自动续期
echo -e "${BLUE}🔄 设置自动续期...${NC}"
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo -e "${GREEN}🎉 SSL证书配置完成！${NC}"
echo -e "${BLUE}📍 HTTPS地址: https://${DOMAIN}${NC}"
echo -e "${BLUE}📍 HTTPS地址: https://www.${DOMAIN}${NC}"
echo -e "${YELLOW}💡 请确保域名解析指向此服务器IP: $(curl -s ifconfig.me)${NC}"
echo -e "${YELLOW}💡 证书将自动续期${NC}"
