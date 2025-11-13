#!/bin/bash

# 构建后处理脚本
# 简化版：只处理必要的后期任务

echo "开始执行构建后处理..."

# 1. 验证index.html已生成
if [ -f "dist/index.html" ]; then
    echo "✓ dist/index.html 已生成"
else
    echo "✗ 错误：dist/index.html 未找到"
    exit 1
fi

# 2. 确保百度验证文件存在
if [ ! -f "dist/baidu_verify_codeva-oGKt37ajUA.html" ]; then
    echo "baidu_verify_codeva-oGKt37ajUA" > dist/baidu_verify_codeva-oGKt37ajUA.html
    echo "✓ 已创建百度验证文件"
else
    echo "✓ 百度验证文件已存在"
fi

echo "✓ 构建后处理完成"
