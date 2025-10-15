#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🧪 完整注册流程测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 测试邮箱
TEST_EMAIL="testuser$(date +%s)@example.com"
TEST_PASSWORD="Test123456"
TEST_USERNAME="测试用户$(date +%H%M%S)"

echo "📧 测试邮箱: $TEST_EMAIL"
echo ""

# 步骤1: 发送验证码
echo "步骤1: 发送验证码..."
SEND_RESULT=$(curl -s -X POST http://localhost:8080/api/auth/send-verification-code \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\"}")

echo "$SEND_RESULT" | python3 -m json.tool
echo ""

# 提取验证码
VERIFICATION_CODE=$(echo "$SEND_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('code', ''))" 2>/dev/null)

if [ -z "$VERIFICATION_CODE" ]; then
    echo "❌ 未能获取验证码"
    echo "响应: $SEND_RESULT"
    exit 1
fi

echo "✅ 验证码: $VERIFICATION_CODE"
echo ""

# 步骤2: 验证验证码
echo "步骤2: 验证验证码..."
VERIFY_RESULT=$(curl -s -X POST http://localhost:8080/api/auth/verify-code \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"code\":\"$VERIFICATION_CODE\"}")

echo "$VERIFY_RESULT" | python3 -m json.tool
echo ""

VERIFY_SUCCESS=$(echo "$VERIFY_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null)

if [ "$VERIFY_SUCCESS" != "True" ]; then
    echo "❌ 验证码验证失败"
    exit 1
fi

echo "✅ 验证码验证成功"
echo ""

# 步骤3: 注册用户
echo "步骤3: 注册用户..."
REGISTER_RESULT=$(curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"username\":\"$TEST_USERNAME\",\"verificationCode\":\"$VERIFICATION_CODE\"}")

echo "$REGISTER_RESULT" | python3 -m json.tool
echo ""

REGISTER_SUCCESS=$(echo "$REGISTER_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null)

if [ "$REGISTER_SUCCESS" != "True" ]; then
    echo "❌ 用户注册失败"
    exit 1
fi

echo "✅ 用户注册成功！"
echo ""

# 步骤4: 登录测试
echo "步骤4: 测试登录..."
LOGIN_RESULT=$(curl -s -X POST http://localhost:8080/api/auth/login/email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

echo "$LOGIN_RESULT" | python3 -m json.tool
echo ""

LOGIN_SUCCESS=$(echo "$LOGIN_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null)

if [ "$LOGIN_SUCCESS" != "True" ]; then
    echo "❌ 登录失败"
    exit 1
fi

TOKEN=$(echo "$LOGIN_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)

echo "✅ 登录成功！"
echo "🔑 Token: ${TOKEN:0:50}..."
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎉 所有测试通过！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 测试结果:"
echo "   用户邮箱: $TEST_EMAIL"
echo "   用户名: $TEST_USERNAME"
echo "   注册: ✅"
echo "   登录: ✅"
echo "   Token生成: ✅"
echo ""
