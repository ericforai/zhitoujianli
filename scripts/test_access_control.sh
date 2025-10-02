#!/bin/bash

echo "=== 三层访问权限控制系统测试 ==="
echo

# 测试公开页面访问
echo "1. 测试公开页面访问"
echo "1.1 测试首页 (http://localhost:3000/)"
RESPONSE1=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
if [ "$RESPONSE1" = "200" ]; then
    echo "✅ 首页访问成功 ($RESPONSE1)"
else
    echo "❌ 首页访问失败 ($RESPONSE1)"
fi

echo "1.2 测试博客 (http://localhost:4321/blog/)"
RESPONSE2=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/blog/)
if [ "$RESPONSE2" = "200" ]; then
    echo "✅ 博客访问成功 ($RESPONSE2)"
else
    echo "❌ 博客访问失败 ($RESPONSE2)"
fi

echo

# 测试未登录访问后台管理
echo "2. 测试未登录访问后台管理"
RESPONSE3=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/)
if [ "$RESPONSE3" = "302" ]; then
    echo "✅ 未登录访问后台管理正确重定向 ($RESPONSE3)"
else
    echo "❌ 未登录访问后台管理未重定向，权限控制可能失效 ($RESPONSE3)"
fi

echo

# 测试登录API
echo "3. 测试登录API"
LOGIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  http://localhost:8080/api/auth/login/email)

echo "登录API响应:"
echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"

# 尝试提取Token（如果登录成功）
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty' 2>/dev/null)

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "✅ 登录成功，获得Token: ${TOKEN:0:30}..."
    
    echo
    echo "4. 测试Token访问后台管理"
    
    # 使用Token访问后台管理（通过Header）
    RESPONSE4=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "Authorization: Bearer $TOKEN" \
      -H "X-Requested-With: XMLHttpRequest" \
      http://localhost:8080/)
    
    if [ "$RESPONSE4" = "200" ]; then
        echo "✅ 使用Token访问后台管理成功 ($RESPONSE4)"
    else
        echo "❌ 使用Token访问后台管理失败 ($RESPONSE4)"
    fi
    
    # 使用Cookie访问后台管理
    RESPONSE5=$(curl -s -o /dev/null -w "%{http_code}" \
      -b "authToken=$TOKEN" \
      http://localhost:8080/)
    
    if [ "$RESPONSE5" = "200" ]; then
        echo "✅ 使用Cookie访问后台管理成功 ($RESPONSE5)"
    else
        echo "❌ 使用Cookie访问后台管理失败 ($RESPONSE5)"
    fi
    
else
    echo "❌ 登录失败，无法获得Token"
fi

echo
echo "=== 测试完成 ==="