#!/bin/bash

# API测试脚本：验证二维码登录修复是否生效
# 用途：测试登录流程能否正常启动，检查日志输出格式

BASE_URL="http://localhost:8080"
TEST_EMAIL="552368961@qq.com"

echo "=========================================="
echo "🧪 Boss二维码登录API测试"
echo "=========================================="
echo ""

# 清理旧的状态文件和日志
echo "🧹 清理旧的状态文件和日志..."
rm -f /tmp/boss_qrcode_*.png
rm -f /tmp/boss_login_status_*.txt
rm -f /tmp/boss_login_*.log
echo "✅ 清理完成"
echo ""

# 检查服务状态
echo "📊 检查后端服务状态..."
if systemctl is-active --quiet zhitoujianli-backend.service; then
    echo "✅ 后端服务运行中"
else
    echo "❌ 后端服务未运行，请先启动服务"
    exit 1
fi
echo ""

# 测试：检查API是否可访问
echo "🔍 步骤1: 测试API可访问性..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health" 2>/dev/null)
if [ "$HEALTH_CHECK" == "200" ] || [ "$HEALTH_CHECK" == "404" ]; then
    echo "✅ API可访问（HTTP状态码: $HEALTH_CHECK）"
else
    echo "⚠️ API可能不可访问（HTTP状态码: $HEALTH_CHECK），继续测试..."
fi
echo ""

# 测试：发送验证码（获取Token）
echo "🔍 步骤2: 获取用户Token..."
SEND_CODE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/send-email-code" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\"}")

if echo "$SEND_CODE_RESPONSE" | grep -q "success"; then
    echo "✅ 验证码发送成功（或使用演示模式）"
    echo "   响应: $(echo $SEND_CODE_RESPONSE | jq -r '.message // .success' 2>/dev/null || echo $SEND_CODE_RESPONSE)"
else
    echo "❌ 验证码发送失败"
    echo "   响应: $SEND_CODE_RESPONSE"
    exit 1
fi
echo ""

# 测试：启动Boss登录流程
echo "🔍 步骤3: 启动Boss二维码登录..."
echo "   （此步骤需要用户认证，如果没有Token可能会失败）"
echo ""

# 等待一下，让用户手动测试
echo "=========================================="
echo "📋 手动测试指南"
echo "=========================================="
echo ""
echo "请在浏览器中执行以下步骤："
echo ""
echo "1. 访问前端页面，登录系统"
echo "2. 进入Boss登录页面，点击'启动二维码登录'"
echo "3. 在手机上扫码并确认登录"
echo "4. 观察日志输出是否符合预期"
echo ""
echo "监控日志的命令："
echo "   tail -f /tmp/boss_login_*.log | grep -E '(登录检测|Cookie|刷新|成功|失败|提示)'"
echo ""
echo "或者运行监控脚本："
echo "   cd /root/zhitoujianli && ./test_qr_login_monitor.sh"
echo ""
echo "预期日志输出应该包含："
echo "   ✅ Cookie数量跟踪（每10秒）"
echo "   ✅ 手机端扫码提示（每60秒）"
echo "   ✅ 智能刷新逻辑（60秒后）"
echo "   ✅ 刷新后重新截图二维码"
echo ""

# 检查是否有日志文件生成（如果用户已经启动了登录）
sleep 5
LATEST_LOG=$(ls -t /tmp/boss_login_*.log 2>/dev/null | head -1)
if [ -n "$LATEST_LOG" ]; then
    echo "✅ 发现登录日志文件: $LATEST_LOG"
    echo ""
    echo "📊 最新日志内容（最后20行）:"
    echo "----------------------------------------"
    tail -20 "$LATEST_LOG" | grep -E "(登录检测|Cookie|刷新|二维码|waiting|success|failed|提示)" || tail -20 "$LATEST_LOG"
    echo ""
    echo "💡 如果要实时监控，运行:"
    echo "   tail -f $LATEST_LOG | grep -E '(登录检测|Cookie|刷新|成功|失败)'"
else
    echo "ℹ️ 尚未发现登录日志文件，请启动二维码登录流程"
fi

echo ""
echo "=========================================="
echo "✅ 测试准备完成"
echo "=========================================="

