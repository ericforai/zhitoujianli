# EdgeOne 部署配置文档

## 项目概述

智投简历项目已成功配置为在腾讯云 EdgeOne 平台上部署，支持自动从 GitHub 同步代码到生产环境。

## 部署架构

```
GitHub Repository → EdgeOne Pages → zhitoujianli.com
```

## 配置变更记录

### 1. API 端点配置更新

#### 文件: `src/services/authService.ts`
```typescript
// 更新前
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// 更新后
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://zhitoujianli.com/api';
```

### 2. 组件链接更新

#### 文件: `src/App.tsx`
```typescript
// 更新前
const url = `http://localhost:8080?token=${encodeURIComponent(token)}`;
window.location.href = 'http://localhost:8080/login';

// 更新后
const url = `https://zhitoujianli.com?token=${encodeURIComponent(token)}`;
window.location.href = 'https://zhitoujianli.com/login';
```

#### 文件: `src/components/Login.tsx`
```typescript
// 更新前
console.log('🎯 目标跳转地址: http://localhost:8080/');
window.location.href = 'http://localhost:8080/';
console.log('🚀 执行跳转到: http://localhost:8080/');

// 更新后
console.log('🎯 目标跳转地址: https://zhitoujianli.com/');
window.location.href = 'https://zhitoujianli.com/';
console.log('🚀 执行跳转到: https://zhitoujianli.com/');
```

#### 文件: `src/components/HeroSection.tsx`
```typescript
// 更新前
<a href="http://localhost:8080" target="_blank" rel="noopener noreferrer">

// 更新后
<a href="https://zhitoujianli.com" target="_blank" rel="noopener noreferrer">
```

#### 文件: `src/components/Navigation.tsx`
```typescript
// 更新前
<a href="http://localhost:4321/blog/" className="...">

// 更新后
<a href="https://zhitoujianli.com/blog/" className="...">
```

#### 文件: `src/components/Footer.tsx`
```typescript
// 更新前
<li><a href="http://localhost:4321/blog/" className="...">博客</a></li>

// 更新后
<li><a href="https://zhitoujianli.com/blog/" className="...">博客</a></li>
```

#### 文件: `src/components/BlogSection.tsx`
```typescript
// 更新前
<a href="http://localhost:4321/blog/resume-optimization-tips/" className="...">
<a href="http://localhost:4321/blog/interview-preparation-guide/" className="...">
<a href="http://localhost:4321/blog/zhitoujianli-introduction/" className="...">
href="http://localhost:4321/blog/"

// 更新后
<a href="https://zhitoujianli.com/blog/resume-optimization-tips/" className="...">
<a href="https://zhitoujianli.com/blog/interview-preparation-guide/" className="...">
<a href="https://zhitoujianli.com/blog/zhitoujianli-introduction/" className="...">
href="https://zhitoujianli.com/blog/"
```

### 3. 环境变量配置

#### 文件: `env.example`
```bash
# 环境变量配置示例
# 复制此文件为 .env.local 或 .env.production 并根据环境修改

# API 配置
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development
REACT_APP_DOMAIN=localhost

# 生产环境配置示例
# REACT_APP_API_URL=https://zhitoujianli.com/api
# REACT_APP_ENV=production
# REACT_APP_DOMAIN=zhitoujianli.com

# Authing 配置
REACT_APP_AUTHING_USER_POOL_ID=68db6e4c4f248dd866413bc2
REACT_APP_AUTHING_APP_ID=68db6e4e85de9cb8daf2b3d2
REACT_APP_AUTHING_APP_HOST=https://zhitoujianli.authing.cn

# 博客链接配置
REACT_APP_BLOG_URL=http://localhost:4321/blog
# 生产环境博客链接
# REACT_APP_BLOG_URL=https://zhitoujianli.com/blog
```

### 4. EdgeOne 部署配置

#### 文件: `edgeone.json`
```json
{
  "name": "zhitoujianli",
  "version": "1.0.0",
  "description": "智投简历 - AI智能求职助手",
  "build": {
    "command": "npm run build",
    "output": "build"
  },
  "routes": [
    {
      "path": "/api/*",
      "target": "https://zhitoujianli.com/api"
    },
    {
      "path": "/*",
      "target": "index.html"
    }
  ],
  "headers": {
    "/*": {
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "X-XSS-Protection": "1; mode=block"
    }
  },
  "redirects": [
    {
      "from": "/admin",
      "to": "https://zhitoujianli.com/admin"
    }
  ]
}
```

### 5. 后端 CORS 配置

#### 文件: `get_jobs/src/main/java/config/CorsConfig.java`
```java
// 允许的源
configuration.setAllowedOriginPatterns(Arrays.asList(
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "https://zhitoujianli.com",
    "https://www.zhitoujianli.com"
));
```

#### 文件: `get_jobs/src/main/java/config/SecurityConfig.java`
```java
corsConfig.setAllowedOriginPatterns(java.util.Arrays.asList(
    "http://localhost:3000", 
    "http://localhost:3001", 
    "http://127.0.0.1:3000",
    "https://zhitoujianli.com",
    "https://www.zhitoujianli.com"
));
```

#### 控制器 CORS 注解更新
- `get_jobs/src/main/java/controller/AuthController.java`
- `get_jobs/src/main/java/controller/PaymentController.java`
- `get_jobs/src/main/java/controller/AdminController.java`

```java
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080", "https://zhitoujianli.com", "https://www.zhitoujianli.com"})
```

## 部署流程

### 1. 自动部署流程
1. **代码推送**: 推送到 GitHub 主分支
2. **自动构建**: EdgeOne 自动检测变更并构建
3. **自动部署**: 构建完成后自动部署到生产环境
4. **域名访问**: 通过 `https://zhitoujianli.com` 访问

### 2. 手动部署步骤
```bash
# 1. 构建项目
npm run build

# 2. 推送到 GitHub
git add .
git commit -m "更新配置"
git push origin main

# 3. EdgeOne 自动部署
# 在 EdgeOne 控制台查看部署状态
```

## 环境变量配置

### 生产环境变量
在 EdgeOne 控制台设置以下环境变量：

```bash
REACT_APP_API_URL=https://zhitoujianli.com/api
REACT_APP_ENV=production
REACT_APP_DOMAIN=zhitoujianli.com
REACT_APP_BLOG_URL=https://zhitoujianli.com/blog
REACT_APP_AUTHING_USER_POOL_ID=68db6e4c4f248dd866413bc2
REACT_APP_AUTHING_APP_ID=68db6e4e85de9cb8daf2b3d2
REACT_APP_AUTHING_APP_HOST=https://zhitoujianli.authing.cn
```

### 开发环境变量
```bash
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development
REACT_APP_DOMAIN=localhost
REACT_APP_BLOG_URL=http://localhost:4321/blog
```

## 重要配置说明

### 1. API 代理配置
EdgeOne 需要配置 API 代理，将 `/api/*` 请求转发到后端服务：
- 前端请求: `https://zhitoujianli.com/api/auth/register`
- 后端处理: `https://zhitoujianli.com/api/auth/register`

### 2. CORS 跨域配置
后端已配置 CORS 支持生产域名，确保跨域请求正常：
- 允许的源: `https://zhitoujianli.com`, `https://www.zhitoujianli.com`
- 允许的方法: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`, `PATCH`
- 允许的头部: `*`
- 允许凭证: `true`

### 3. 认证配置
使用 Authing 服务进行用户认证：
- 用户池ID: `68db6e4c4f248dd866413bc2`
- 应用ID: `68db6e4e85de9cb8daf2b3d2`
- 应用域名: `https://zhitoujianli.authing.cn`

## 验证步骤

### 1. 部署验证
1. 推送代码到 GitHub
2. 在 EdgeOne 控制台查看部署状态
3. 访问 `https://zhitoujianli.com` 验证功能
4. 测试注册、登录等核心功能
5. 检查 API 请求是否正常

### 2. 功能验证
- [ ] 首页正常加载
- [ ] 注册功能正常
- [ ] 登录功能正常
- [ ] 博客链接正常
- [ ] 后台管理链接正常
- [ ] API 请求正常
- [ ] CORS 跨域正常

## 故障排除

### 1. API 请求失败
- 检查 EdgeOne 的 API 代理配置
- 确认后端服务正常运行
- 验证 CORS 配置

### 2. 页面无法访问
- 检查域名解析
- 确认 EdgeOne 部署状态
- 查看构建日志

### 3. 认证问题
- 检查 Authing 配置
- 确认环境变量设置
- 验证 Token 传递

### 4. CORS 错误
- 检查后端 CORS 配置
- 确认域名在允许列表中
- 验证请求头设置

## 监控和维护

### 1. 部署监控
- EdgeOne 控制台查看部署状态
- 浏览器开发者工具检查网络请求
- 后端日志监控 API 调用

### 2. 性能监控
- 页面加载速度
- API 响应时间
- 错误率统计

### 3. 安全监控
- 认证状态检查
- 跨域请求监控
- 安全头配置验证

## 更新流程

### 1. 代码更新
1. 修改代码
2. 提交到 GitHub
3. EdgeOne 自动部署
4. 验证功能正常

### 2. 配置更新
1. 修改配置文件
2. 更新环境变量
3. 重新部署
4. 验证配置生效

## 联系支持

如有问题，请联系技术支持团队或查看相关文档：
- EdgeOne 官方文档: https://edgeone.ai/zh/document/186503783709097984?product=edgedeveloperplatform
- 项目部署指南: `DEPLOYMENT_GUIDE.md`
- 技术文档: `ADMIN_SYSTEM_TECHNICAL_DOCUMENTATION.md`

---

**最后更新**: 2025-10-02  
**版本**: 1.0.0  
**维护者**: ZhiTouJianLi Team
