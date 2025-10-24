#!/bin/bash

# 智投简历博客 - Google Analytics 快速设置脚本

echo "🎯 Google Analytics 4 快速设置"
echo "================================"
echo ""

# 检查当前配置
echo "📊 当前配置状态："
if grep -q "G-XXXXXXXXXX" src/config.yaml; then
    echo "⚠️  当前使用占位符ID: G-XXXXXXXXXX"
    echo "💡 需要设置您的实际Google Analytics测量ID"
elif grep -q "G-DEMO123456" src/config.yaml; then
    echo "⚠️  当前使用演示ID: G-DEMO123456"
    echo "💡 需要设置您的实际Google Analytics测量ID"
else
    echo "✅ Google Analytics 已配置"
fi

echo ""
echo "📋 获取Google Analytics测量ID的步骤："
echo "1. 访问 https://analytics.google.com/"
echo "2. 创建账户和媒体资源"
echo "3. 选择'网站'作为平台"
echo "4. 输入网站URL: https://blog.zhitoujianli.com"
echo "5. 复制测量ID（格式: G-XXXXXXXXXX）"
echo ""

# 获取用户输入
read -p "请输入您的Google Analytics测量ID (G-XXXXXXXXXX): " GA_ID

# 验证输入格式
if [[ ! $GA_ID =~ ^G-[A-Z0-9]+$ ]]; then
    echo "❌ 无效的测量ID格式！请确保以G-开头且格式正确"
    exit 1
fi

# 更新配置文件
echo "🔄 更新配置文件..."
sed -i "s/id: 'G-XXXXXXXXXX'/id: '$GA_ID'/" src/config.yaml
sed -i "s/id: 'G-DEMO123456'/id: '$GA_ID'/" src/config.yaml

echo "✅ 配置已更新！"
echo "📈 测量ID: $GA_ID"
echo ""

# 重新构建
echo "🔨 重新构建博客..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    echo ""
    echo "🚀 下一步操作："
    echo "1. 部署更新: npm run deploy:blog"
    echo "2. 访问博客网站验证"
    echo "3. 在Google Analytics中查看实时数据"
    echo ""
    echo "🎉 Google Analytics 设置完成！"
else
    echo "❌ 构建失败，请检查配置"
    exit 1
fi


