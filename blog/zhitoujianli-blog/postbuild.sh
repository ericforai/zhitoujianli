#!/bin/bash

# 构建后脚本 - 复制首页文件
# 由于Astro无法正确构建 src/pages/index.astro 文件
# 我们使用 src/pages/home.astro 作为首页内容，并在构建后复制到根目录

echo "开始执行构建后处理..."

# 检查 dist/home/index.html 是否存在
if [ -f "dist/home/index.html" ]; then
  echo "✓ 找到 dist/home/index.html"

  # 复制到 dist/index.html
  cp dist/home/index.html dist/index.html
  echo "✓ 已复制 dist/home/index.html 到 dist/index.html"

  echo "✓ 构建后处理完成"
else
  echo "✗ 错误：找不到 dist/home/index.html"
  exit 1
fi


