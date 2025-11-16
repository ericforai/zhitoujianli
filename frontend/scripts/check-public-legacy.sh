#!/bin/bash

# 检查 public 目录中是否存在可能被直出且会干扰入口的遗留页面

set -e

PUBLIC_DIR="/root/zhitoujianli/frontend/public"
ERR=0

check_pattern() {
  local pattern="$1"
  local matches
  matches=$(ls -1 ${PUBLIC_DIR}/${pattern} 2>/dev/null || true)
  if [ -n "$matches" ]; then
    echo "⚠️  检测到遗留静态页面匹配: ${pattern}"
    echo "$matches"
    ERR=1
  fi
}

check_pattern "standalone-*.html"
check_pattern "*test*.html"
check_pattern "admin-*.html"

if [ $ERR -ne 0 ]; then
  echo ""
  echo "❌ public 目录包含可能被直出的遗留页面。"
  echo "👉 建议将其迁移至 public/_legacy/ 并调整 Nginx 禁用直出（见 /frontend.plan.md Step 4）。"
  exit 3
fi

echo "✅ public 目录检查通过"


