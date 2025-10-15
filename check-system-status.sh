#!/bin/bash

echo "========================================"
echo "🧪 智投简历系统状态检查"
echo "========================================"
echo ""

# 检查前端服务
echo "📱 前端服务状态："
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://115.190.182.95:3000/)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "  ✅ 前端服务正常 (HTTP $FRONTEND_STATUS)"
else
    echo "  ❌ 前端服务异常 (HTTP $FRONTEND_STATUS)"
fi

# 检查新路由
echo "🔗 新路由状态："
ROUTE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://115.190.182.95:3000/resume)
if [ "$ROUTE_STATUS" = "200" ]; then
    echo "  ✅ /resume 路由正常 (HTTP $ROUTE_STATUS)"
else
    echo "  ❌ /resume 路由异常 (HTTP $ROUTE_STATUS)"
fi

# 检查后端服务
echo "🔧 后端服务状态："
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://115.190.182.95:8080/api/candidate-resume/check)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "  ✅ 后端API正常 (HTTP $BACKEND_STATUS)"
else
    echo "  ❌ 后端API异常 (HTTP $BACKEND_STATUS)"
fi

# 检查CORS
echo "🌐 CORS配置："
CORS_TEST=$(curl -s -H "Origin: http://115.190.182.95:3000" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: X-Requested-With" -X OPTIONS http://115.190.182.95:8080/api/candidate-resume/check -o /dev/null -w "%{http_code}")
if [ "$CORS_TEST" = "200" ] || [ "$CORS_TEST" = "204" ]; then
    echo "  ✅ CORS配置正常 (HTTP $CORS_TEST)"
else
    echo "  ❌ CORS配置异常 (HTTP $CORS_TEST)"
fi

echo ""
echo "========================================"
echo "🎯 访问地址："
echo "   http://115.190.182.95:3000/resume"
echo "========================================"
echo ""
echo "📋 如果所有状态都是 ✅，请："
echo "   1. 在浏览器中访问上述地址"
echo "   2. 如果页面有问题，请强制刷新 (Ctrl+Shift+R)"
echo "   3. 检查浏览器控制台是否还有错误"
echo ""

# 总体状态
if [ "$FRONTEND_STATUS" = "200" ] && [ "$ROUTE_STATUS" = "200" ] && [ "$BACKEND_STATUS" = "200" ]; then
    echo "🎉 系统状态：完全正常！"
    exit 0
else
    echo "⚠️  系统状态：存在问题，请检查上述错误"
    exit 1
fi
