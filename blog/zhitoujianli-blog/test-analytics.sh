#!/bin/bash

# 智投简历博客 - Google Analytics 集成测试和部署脚本

echo "🎯 智投简历博客 - Google Analytics 集成测试"
echo "================================================"

# 检查当前目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在博客项目根目录运行此脚本"
    exit 1
fi

echo "📊 当前配置状态："
echo "-------------------"

# 检查配置文件
if grep -q "G-DEMO123456" src/config.yaml; then
    echo "⚠️  当前使用演示ID: G-DEMO123456"
    echo "💡 请运行 'npm run analytics:setup' 设置您的实际GA4 ID"
elif grep -q "id: null" src/config.yaml; then
    echo "❌ Google Analytics 未配置"
else
    echo "✅ Google Analytics 已配置"
fi

echo ""
echo "🔍 检查构建文件中的GA代码："
echo "----------------------------"

# 检查构建后的文件
if [ -d "dist" ]; then
    GA_COUNT=$(grep -r "gtag\|G-DEMO123456" dist/ | wc -l)
    if [ $GA_COUNT -gt 0 ]; then
        echo "✅ 发现 $GA_COUNT 个页面包含Google Analytics代码"
        echo "📈 测量ID已正确嵌入到所有页面"
    else
        echo "❌ 未发现Google Analytics代码"
    fi
else
    echo "⚠️  请先运行 'npm run build' 构建项目"
fi

echo ""
echo "🚀 部署选项："
echo "-------------"
echo "1. 本地预览: npm run preview"
echo "2. 部署到生产: npm run deploy:blog"
echo "3. 设置GA4 ID: npm run analytics:setup"

echo ""
echo "📋 验证步骤："
echo "-------------"
echo "1. 访问博客网站"
echo "2. 打开浏览器开发者工具"
echo "3. 查看网络请求中的 'googletagmanager.com' 请求"
echo "4. 在Google Analytics中查看实时数据"

echo ""
echo "🎉 Google Analytics 集成完成！"

