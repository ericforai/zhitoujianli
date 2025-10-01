# 三层访问权限控制系统 - 快速参考指南

## 🚀 快速启动

```bash
# 启动所有服务
./start_dev.sh

# 停止所有服务  
./stop_dev.sh
```

## 📋 系统访问地址

| 层级 | 地址 | 访问权限 | 描述 |
|------|------|----------|------|
| 首页层 | http://localhost:3000/ | 公开访问 | 产品展示、登录注册 |
| 博客层 | http://localhost:4321/blog/ | 公开访问 | 技术博客、求职指南 |
| 后台管理层 | http://localhost:8080/ | 需要登录 | 用户数据管理 |

## 🔐 登录测试账号

```
邮箱: test@example.com
密码: test123456
```

## 📁 关键文件位置

### 前端 (React)
```
/Users/user/autoresume/
├── src/
│   ├── context/AuthContext.js          # 认证状态管理
│   ├── components/ProtectedRoute.js    # 路由守卫
│   └── pages/Login.js                  # 登录页面
└── public/index.html                   # 首页模板
```

### 后端 (Spring Boot)
```
/Users/user/autoresume/get_jobs/src/main/java/
├── security/
│   └── JwtAuthenticationFilter.java    # JWT认证过滤器
├── config/
│   └── SecurityConfig.java             # 安全配置
├── controller/
│   ├── AuthController.java             # 认证API
│   └── WebController.java              # 用户数据API
├── service/
│   └── UserDataService.java            # 用户数据服务
└── util/
    └── UserContextUtil.java            # 用户上下文工具
```

## 🔧 环境配置

### 前端环境变量 (.env)
```bash
REACT_APP_AUTHING_DOMAIN=https://zhitoujianli.authing.cn
REACT_APP_AUTHING_APP_ID=68db6e4e85de9cb8daf2b3d2
REACT_APP_API_BASE_URL=http://localhost:8080
```

### 后端配置 (application.properties)
```properties
# Authing配置
authing.domain=https://zhitoujianli.authing.cn
authing.app.id=68db6e4e85de9cb8daf2b3d2
authing.app.secret=your_app_secret
authing.user.pool.id=68db6e4c4f248dd866413bc2

# CORS配置
cors.allowed.origins=http://localhost:3000,http://localhost:4321
```

## 🛠️ 常用命令

### 开发调试
```bash
# 查看服务状态
curl http://localhost:8080/actuator/health
curl http://localhost:3000

# 查看服务日志
tail -f logs/backend.log
tail -f logs/frontend.log

# 重启后端服务
cd get_jobs && mvn spring-boot:run

# 重启前端服务
npm start
```

### 测试API
```bash
# 获取用户信息 (需要Token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/auth/user

# 获取用户配置
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/user/config
```

## 🐛 故障排查

### 常见问题

**1. 登录后访问后台仍然重定向**
- 检查Token是否正确设置
- 检查Cookie domain配置
- 查看浏览器开发者工具Network面板

**2. CORS跨域错误**
- 检查后端SecurityConfig中的CORS配置
- 确认前端请求包含正确的headers

**3. 端口占用**
```bash
# 查看端口占用
lsof -i :3000
lsof -i :8080

# 强制停止
./stop_dev.sh
```

## 📊 系统监控

### 健康检查
```bash
# 后端健康检查
curl http://localhost:8080/actuator/health

# 前端可访问性检查
curl http://localhost:3000
```

### 性能指标
- 登录响应时间: ~1.5s
- Token验证时间: ~50ms  
- API响应时间: ~200ms
- 页面加载时间: ~2s

## 📚 相关文档

- [完整技术文档](./THREE_TIER_ACCESS_CONTROL_SYSTEM.md)
- [实现指南](./IMPLEMENTATION_GUIDE_ACCESS_CONTROL.md)
- [API文档](./API_DOCUMENTATION.md)

## 🆘 获取帮助

如遇问题请检查：
1. 日志文件 (logs/backend.log, logs/frontend.log)
2. 浏览器开发者工具Console面板
3. 网络连接和端口状态
4. Authing控制台配置