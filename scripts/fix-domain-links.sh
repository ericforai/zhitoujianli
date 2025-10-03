#!/bin/bash

# 修复前端代码中的域名链接脚本
# 将硬编码的域名改为相对路径或IP地址

set -e

echo "🔧 开始修复前端代码中的域名链接..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 进入前端目录
cd /root/zhitoujianli/frontend

echo -e "${BLUE}📁 当前目录: $(pwd)${NC}"

# 备份原始文件
echo -e "${BLUE}💾 备份原始文件...${NC}"
mkdir -p backup/$(date +%Y%m%d_%H%M%S)
cp -r src/ backup/$(date +%Y%m%d_%H%M%S)/

# 1. 修复Navigation.tsx - 博客链接改为相对路径
echo -e "${BLUE}🔧 修复Navigation.tsx...${NC}"
sed -i 's|https://zhitoujianli.com/blog/|/blog/|g' src/components/Navigation.tsx
sed -i 's|target="_blank" rel="noopener noreferrer"||g' src/components/Navigation.tsx

# 2. 修复Footer.tsx - 博客链接改为相对路径
echo -e "${BLUE}🔧 修复Footer.tsx...${NC}"
sed -i 's|https://zhitoujianli.com/blog/|/blog/|g' src/components/Footer.tsx

# 3. 修复BlogSection.tsx - 博客链接改为相对路径
echo -e "${BLUE}🔧 修复BlogSection.tsx...${NC}"
sed -i 's|https://zhitoujianli.com/blog/|/blog/|g' src/components/BlogSection.tsx

# 4. 修复HeroSection.tsx - 链接改为相对路径
echo -e "${BLUE}🔧 修复HeroSection.tsx...${NC}"
sed -i 's|https://zhitoujianli.com|/|g' src/components/HeroSection.tsx

# 5. 修复Contact.tsx - 邮箱地址保持不变，但可以改为相对路径
echo -e "${BLUE}🔧 修复Contact.tsx...${NC}"
# 邮箱地址保持不变

# 6. 修复Login.tsx - 跳转链接改为相对路径
echo -e "${BLUE}🔧 修复Login.tsx...${NC}"
sed -i 's|https://zhitoujianli.com/|/|g' src/components/Login.tsx

# 7. 修复App.tsx - 跳转链接改为相对路径
echo -e "${BLUE}🔧 修复App.tsx...${NC}"
sed -i 's|https://zhitoujianli.com|/|g' src/App.tsx

# 8. 修复authService.ts - API URL和跳转链接
echo -e "${BLUE}🔧 修复authService.ts...${NC}"
# 将API URL改为相对路径
sed -i "s|const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://zhitoujianli.com/api';|const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';|g" src/services/authService.ts

# 将跳转链接改为相对路径
sed -i 's|https://zhitoujianli.com/login|/login|g' src/services/authService.ts

# 修复域名检测逻辑
sed -i 's|window.location.hostname === '\''localhost'\'' ? '\''localhost'\'' : '\''\.zhitoujianli\.com'\'';|window.location.hostname === '\''localhost'\'' ? '\''localhost'\'' : '\''\.zhitoujianli\.com'\'';|g' src/services/authService.ts

echo -e "${GREEN}✅ 域名链接修复完成！${NC}"

# 显示修改摘要
echo -e "${BLUE}📋 修改摘要:${NC}"
echo "  - Navigation.tsx: 博客链接改为相对路径 /blog/"
echo "  - Footer.tsx: 博客链接改为相对路径 /blog/"
echo "  - BlogSection.tsx: 所有博客链接改为相对路径 /blog/"
echo "  - HeroSection.tsx: 链接改为相对路径 /"
echo "  - Login.tsx: 跳转链接改为相对路径 /"
echo "  - App.tsx: 跳转链接改为相对路径 /"
echo "  - authService.ts: API URL改为相对路径 /api"

echo -e "${YELLOW}🔄 现在需要重新构建前端应用...${NC}"
echo "运行: npm run build"

echo -e "${GREEN}🎉 修复完成！${NC}"
