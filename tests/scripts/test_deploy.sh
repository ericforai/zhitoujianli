#!/bin/bash

# 简化的部署测试脚本

echo "🔧 开始简化部署测试..."

# 1. 检查前端构建
echo "1. 检查前端构建..."
cd frontend
if npm run build; then
    echo "✅ 前端构建成功"
    ls -lah build/
else
    echo "❌ 前端构建失败"
    exit 1
fi

# 2. 检查构建输出
echo "2. 检查构建输出..."
if [ -d "build" ]; then
    echo "✅ build目录存在"
    echo "文件列表："
    ls -lah build/
else
    echo "❌ build目录不存在"
    exit 1
fi

# 3. 检查package.json脚本
echo "3. 检查package.json脚本..."
if grep -q '"build"' package.json; then
    echo "✅ build脚本存在"
else
    echo "❌ build脚本不存在"
    exit 1
fi

echo "✅ 简化部署测试完成"
