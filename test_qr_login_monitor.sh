#!/bin/bash

# 监控二维码登录流程的测试脚本
# 用途：观察修复后的登录检测逻辑是否正常工作

echo "=========================================="
echo "🔍 Boss二维码登录流程监控"
echo "=========================================="
echo ""
echo "📋 监控项目："
echo "   1. Cookie数量变化"
echo "   2. 刷新策略执行"
echo "   3. 登录状态更新"
echo ""
echo "💡 请在另一个终端启动二维码登录，或通过前端界面操作"
echo ""
echo "等待登录流程启动..."
echo ""

# 等待登录文件出现
max_wait=60
count=0
while [ $count -lt $max_wait ]; do
  if ls /tmp/boss_login_*.log 2>/dev/null | grep -q .; then
    LATEST_LOG=$(ls -t /tmp/boss_login_*.log 2>/dev/null | head -1)
    if [ -n "$LATEST_LOG" ] && [ -s "$LATEST_LOG" ]; then
      echo "✅ 发现登录日志文件: $LATEST_LOG"
      break
    fi
  fi
  sleep 1
  count=$((count + 1))
done

if [ $count -eq $max_wait ]; then
  echo "❌ 等待超时，未发现登录日志文件"
  echo "💡 请手动启动二维码登录流程"
  exit 1
fi

echo ""
echo "=========================================="
echo "📊 实时监控登录流程（按 Ctrl+C 退出）"
echo "=========================================="
echo ""

# 实时监控日志
tail -f "$LATEST_LOG" 2>/dev/null | grep --line-buffered -E "(登录检测|Cookie|刷新|二维码|waiting|success|failed|方式|检测到|未发现|提示)" | while IFS= read -r line; do
  # 高亮显示关键信息
  if echo "$line" | grep -q "Cookie数量"; then
    echo "🍪 $line" | sed 's/Cookie数量/Cookie数量/g'
  elif echo "$line" | grep -q "刷新"; then
    echo "🔄 $line" | sed 's/刷新/刷新/g'
  elif echo "$line" | grep -q "成功"; then
    echo "✅ $line" | sed 's/成功/成功/g'
  elif echo "$line" | grep -q "失败\|未发现\|❌"; then
    echo "❌ $line" | sed 's/失败\|未发现/失败/g'
  elif echo "$line" | grep -q "二维码"; then
    echo "📱 $line" | sed 's/二维码/二维码/g'
  elif echo "$line" | grep -q "提示"; then
    echo "💡 $line" | sed 's/提示/提示/g'
  else
    echo "   $line"
  fi
done

