#!/bin/bash

# 博客迁移和清理 - 快速部署脚本
# 执行日期：2025-11-12

set -e

echo "========================================="
echo "  博客迁移 - 快速部署"
echo "========================================="
echo ""

# 1. 部署前端（更新sitemap）
echo "【1/2】部署前端（更新统一sitemap）..."
cd /root/zhitoujianli
echo "YES" | ./deploy-frontend.sh
echo "✓ 前端部署完成"
echo ""

# 2. 部署博客（更新内容）
echo "【2/2】部署博客（清理后的代码）..."
./redeploy-blog.sh
echo "✓ 博客部署完成"
echo ""

echo "========================================="
echo "  部署完成！"
echo "========================================="
echo ""
echo "请执行验证："
echo "  curl -I https://zhitoujianli.com/blog/"
echo "  curl -I https://zhitoujianli.com/sitemap.xml"
echo "  curl -I https://blog.zhitoujianli.com/"
echo ""
echo "详细验证指南："
echo "  查看 DEPLOYMENT_AND_VERIFICATION_GUIDE.md"
echo ""
