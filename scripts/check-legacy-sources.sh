#!/bin/bash

# 统一检查会导致“版本回退/模板混乱”的遗留目录与文件
# 存在即退出非零码，阻止部署或构建继续

set -e

ERR=0

check_dir() {
  local dir="$1"
  local reason="$2"
  if [ -d "$dir" ]; then
    echo "⚠️  检测到目录: $dir  → $reason"
    ERR=1
  fi
}

check_dir "/root/zhitoujianli/frontend/build_backup" "构建备份目录不应存在于仓库/源码路径"
check_dir "/root/zhitoujianli/frontend/backup" "历史源码备份目录可能被误用"
check_dir "/root/zhitoujianli/PRODUCTION_FRONTEND" "历史生产包目录，可能被误当成部署源"
check_dir "/root/zhitoujianli/website" "旧网站代码目录，可能被误引用"

if [ $ERR -ne 0 ]; then
  echo ""
  echo "❌ 一致性检查失败：请根据 /frontend.plan.md 的 Step 1 执行清理/封存。"
  exit 2
fi

echo "✅ 一致性检查通过"


