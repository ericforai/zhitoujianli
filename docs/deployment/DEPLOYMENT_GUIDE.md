# 智投简历 - 火山云部署指南

## 概述

本项目已配置为在火山云平台上部署，支持自动从 GitHub 同步代码。

## 部署架构

```
GitHub Repository → 火山云服务器 → zhitoujianli.com
```

## 配置说明

### 1. 前端配置

- **API 端点**: `https://zhitoujianli.com/api`
- **域名**: `zhitoujianli.com`
- **环境变量**: 通过 `env.example` 配置

### 2. 后端配置

- **CORS**: 已配置支持 `https://zhitoujianli.com`
- **认证**: 使用 Authing 服务
- **API 路径**: `/api/*`

### 3. 火山云配置

- **部署方式**: Docker容器化部署
- **构建命令**: `npm run build`
- **输出目录**: `build`

## 环境变量

### 生产环境

```bash
REACT_APP_API_URL=https://zhitoujianli.com/api
REACT_APP_ENV=production
REACT_APP_DOMAIN=zhitoujianli.com
REACT_APP_BLOG_URL=https://zhitoujianli.com/blog
```

### 开发环境

```bash
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development
REACT_APP_DOMAIN=localhost
REACT_APP_BLOG_URL=http://localhost:4321/blog
```

## 部署流程

1. **代码推送**: 推送到 GitHub 主分支
2. **自动构建**: 火山云自动检测变更并构建
3. **自动部署**: 构建完成后自动部署到生产环境
4. **域名访问**: 通过 `https://zhitoujianli.com` 访问

## 注意事项

### 1. API 代理

火山云需要配置 API 代理，将 `/api/*` 请求转发到后端服务。

### 2. CORS 配置

后端已配置 CORS 支持生产域名，确保跨域请求正常。

### 3. 环境变量

在火山云控制台配置生产环境变量。

### 4. 域名解析

确保域名 `zhitoujianli.com` 正确解析到火山云服务器。

## 故障排除

### 1. API 请求失败

- 检查火山云的 API 代理配置
- 确认后端服务正常运行
- 验证 CORS 配置

### 2. 页面无法访问

- 检查域名解析
- 确认火山云部署状态
- 查看构建日志

### 3. 认证问题

- 检查 Authing 配置
- 确认环境变量设置
- 验证 Token 传递

## 更新流程

1. 修改代码
2. 提交到 GitHub
3. 火山云自动部署
4. 验证功能正常

## 监控

- 火山云控制台查看部署状态
- 浏览器开发者工具检查网络请求
- 后端日志监控 API 调用

## 联系支持

如有问题，请联系技术支持团队。
