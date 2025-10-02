#!/bin/bash

# EdgeOne 部署脚本
# 确保部署到主域名 zhitoujianli.com

set -e

echo "🚀 开始部署到 EdgeOne..."

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "📋 当前分支: $CURRENT_BRANCH"

# 确保在 main 分支
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  警告: 当前不在 main 分支，建议在 main 分支进行部署"
    read -p "是否继续部署? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 部署已取消"
        exit 1
    fi
fi

# 检查工作目录是否干净
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  工作目录有未提交的更改"
    git status --short
    read -p "是否继续部署? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 部署已取消"
        exit 1
    fi
fi

# 构建前端项目
echo "📦 构建前端项目..."
cd frontend
npm ci
npm run build
cd ..

# 检查构建结果
if [ ! -d "frontend/build" ]; then
    echo "❌ 前端构建失败"
    exit 1
fi

# 提交更改到 Git
echo "📝 提交更改到 Git..."
git add .
git commit -m "deploy: 部署到 EdgeOne - $(date '+%Y-%m-%d %H:%M:%S')" || echo "没有新的更改需要提交"

# 推送到 GitHub
echo "📤 推送到 GitHub..."
git push origin main

echo "✅ 代码已推送到 GitHub"
echo "🔄 EdgeOne 将自动检测更改并部署到 zhitoujianli.com"
echo ""
echo "📋 部署信息:"
echo "   - 主域名: https://zhitoujianli.com"
echo "   - 备用域名: https://zhitoujianli.edgeone.app (自动重定向)"
echo "   - 部署时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "🔍 部署状态检查:"
echo "   1. 访问 https://zhitoujianli.com 检查主站点"
echo "   2. 访问 https://zhitoujianli.edgeone.app 检查重定向"
echo "   3. 在 EdgeOne 控制台查看部署日志"
echo ""
echo "🎉 部署完成！"
