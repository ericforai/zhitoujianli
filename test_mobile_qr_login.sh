#!/bin/bash

# 测试脚本：模拟手机端扫码登录流程
# 用途：测试修复后的登录检测逻辑

BASE_URL="http://localhost:8080"
TEST_EMAIL="552368961@qq.com"

echo "=========================================="
echo "🧪 手机端扫码登录测试脚本"
echo "=========================================="
echo ""

# 1. 首先获取JWT Token（使用测试邮箱）
echo "📝 步骤1: 获取用户Token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/send-email-code" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\"}")

echo "   响应: $LOGIN_RESPONSE"
echo ""

# 2. 启动Boss二维码登录
echo "📱 步骤2: 启动Boss二维码登录..."
START_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/boss/local-login/start" \
  -H "Content-Type: application/json" \
  -H "Cookie: $(curl -s -c - -X POST "$BASE_URL/api/auth/send-email-code" -d "{\"email\":\"$TEST_EMAIL\"}" | grep -i token | awk '{print $NF}')" \
  -d '{"headless":false}')

echo "   响应: $START_LOGIN_RESPONSE"
echo ""

# 3. 获取二维码
echo "🔍 步骤3: 获取二维码..."
sleep 5  # 等待二维码生成
QRCODE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/boss/local-login/qrcode" \
  -H "Cookie: $(curl -s -c - -X POST "$BASE_URL/api/auth/send-email-code" -d "{\"email\":\"$TEST_EMAIL\"}" | grep -i token | awk '{print $NF}')")

echo "   二维码是否存在: $(echo $QRCODE_RESPONSE | grep -o '"hasQRCode":[^,]*' | cut -d: -f2)"
echo ""

# 4. 监控登录状态（持续检查）
echo "⏳ 步骤4: 监控登录状态（持续60秒，每5秒检查一次）..."
echo "   💡 请在手机上扫码并确认登录..."
echo ""

for i in {1..12}; do
  echo "   [检查 $i/12] 等待中..."

  STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/boss/local-login/status" \
    -H "Cookie: $(curl -s -c - -X POST "$BASE_URL/api/auth/send-email-code" -d "{\"email\":\"$TEST_EMAIL\"}" | grep -i token | awk '{print $NF}')")

  STATUS=$(echo $STATUS_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)
  MESSAGE=$(echo $STATUS_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)

  echo "   状态: $STATUS - $MESSAGE"

  if [ "$STATUS" == "success" ]; then
    echo ""
    echo "   ✅ 登录成功！"
    break
  elif [ "$STATUS" == "failed" ]; then
    echo ""
    echo "   ❌ 登录失败！"
    break
  fi

  sleep 5
done

echo ""
echo "=========================================="
echo "📊 测试完成"
echo "=========================================="

# 5. 查看最新的登录日志
echo ""
echo "📋 查看最新登录日志..."
echo "----------------------------------------"
LATEST_LOG=$(ls -t /tmp/boss_login_*.log 2>/dev/null | head -1)
if [ -n "$LATEST_LOG" ]; then
  echo "日志文件: $LATEST_LOG"
  echo ""
  tail -50 "$LATEST_LOG" | grep -E "(登录检测|Cookie|刷新|二维码|waiting|success|failed)" | tail -20
else
  echo "未找到登录日志文件"
fi

