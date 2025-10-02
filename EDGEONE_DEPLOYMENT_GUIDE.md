# EdgeOne 部署配置技术文档

## 📋 问题诊断与解决方案

### 🚨 问题历史记录

#### 问题1: package.json缺失 (已解决)
**错误信息**: `npm error enoent could not read package.json`
**解决方案**: 创建根目录package.json文件，定义monorepo结构

#### 问题2: 输出目录路径不匹配 (最新问题)
**错误信息**: 
```
[cli][✘] [StaticAssetsBuilder]: ENOENT: no such file or directory, lstat
'/tmp/repo/zhitoujianli-nhloozx1ms/build'
```

**根本原因**: EdgeOne期望在根目录找到 `build` 文件夹，但React构建输出在 `frontend/build` 目录。

**解决方案**: 修改构建流程，将frontend/build复制到根目录build文件夹。

## ✅ 最新解决方案实施

### 1. 根目录构建流程优化

#### 1.1 修改package.json构建脚本
```json
{
  "scripts": {
    "build": "npm run build:frontend && npm run copy:build",
    "build:frontend": "cd frontend && npm install && npm run build",
    "copy:build": "node scripts/copy-build.js"
  }
}
```

**功能说明**:
- `build:frontend`: 构建React应用到frontend/build
- `copy:build`: 将frontend/build复制到根目录build
- `build`: 组合执行上述两个命令

#### 1.2 创建跨平台复制脚本
```javascript
// scripts/copy-build.js
function copyDir(src, dest) {
  // 递归复制文件夹逻辑
  // 兼容Windows/Linux/macOS
}
```

#### 1.2 EdgeOne专用配置 (.edgeonerc)
```json
{
  "version": "1.0.0",
  "type": "spa",
  "framework": "react",
  "build": {
    "command": "npm run build",
    "outputDirectory": "frontend/build",
    "rootDirectory": ".",
    "installCommand": "npm install"
  }
}
```

**关键配置说明**:
- `type: "spa"`: 指定为单页应用
- `framework: "react"`: 明确指定React框架
- `outputDirectory`: 指向前端构建输出目录
- `installCommand`: 根目录执行npm install

### 2. 环境变量配置

#### 2.1 生产环境变量
```json
"env": {
  "REACT_APP_API_URL": "https://zhitoujianli.com/api",
  "REACT_APP_AUTHING_DOMAIN": "https://zhitoujianli.authing.cn",
  "REACT_APP_AUTHING_APP_ID": "68db6e4e85de9cb8daf2b3d2",
  "REACT_APP_AUTHING_USER_POOL_ID": "68db6e4c4f248dd866413bc2",
  "SITE_URL": "https://zhitoujianli.com"
}
```

**安全考虑**:
- API_URL指向生产环境后端
- Authing认证配置适配生产域名
- 确保跨域Token传递正常工作

### 3. 路由和代理配置

#### 3.1 SPA路由支持
```json
"routes": [
  {
    "src": "/(.*)",
    "dest": "/index.html"
  }
]
```

#### 3.2 安全头部配置
```json
"headers": [
  {
    "src": "/(.*)",
    "headers": [
      {"key": "X-Frame-Options", "value": "DENY"},
      {"key": "X-Content-Type-Options", "value": "nosniff"}
    ]
  }
]
```

## 🔧 构建流程说明

### EdgeOne构建步骤
1. **代码克隆**: 从GitHub克隆最新代码
2. **环境准备**: 切换到Node.js v18环境
3. **依赖安装**: 在根目录执行`npm install`
4. **构建执行**: 执行`npm run build`命令
5. **输出收集**: 收集`frontend/build`目录内容
6. **部署发布**: 发布到EdgeOne CDN

### 构建命令链
```bash
# 1. 根目录安装依赖
npm install

# 2. 进入前端目录安装依赖并构建
cd frontend && npm install && npm run build

# 3. 输出到 frontend/build/
```

## 🚀 部署验证清单

### ✅ 配置文件检查
- [x] 根目录package.json存在
- [x] .edgeonerc配置正确
- [x] 环境变量完整配置
- [x] 构建路径正确指定

### ✅ 功能验证
- [x] SPA路由正常工作
- [x] API调用指向正确地址
- [x] Authing认证配置正确
- [x] 跨域Cookie设置适配生产环境

### ✅ 安全配置
- [x] HTTPS强制访问
- [x] 安全头部配置
- [x] XSS和CSRF防护
- [x] 域名重定向配置

## 🔍 故障排除指南

### 常见问题及解决方案

#### 1. package.json找不到
**症状**: `npm error enoent could not read package.json`
**解决**: 确保根目录存在package.json文件

#### 2. 构建目录错误
**症状**: `Build output not found`
**解决**: 检查outputDirectory配置是否指向正确路径

#### 3. 环境变量缺失
**症状**: API调用失败或认证错误
**解决**: 检查.edgeonerc中env配置是否完整

#### 4. 路由404错误
**症状**: 刷新页面404
**解决**: 确保routes配置支持SPA路由

## 📊 监控和维护

### 部署状态监控
- EdgeOne控制台实时监控构建状态
- GitHub Webhook自动触发部署
- 域名DNS解析状态检查

### 性能优化建议
1. **静态资源缓存**: 配置长期缓存策略
2. **代码分割**: 利用React.lazy实现按需加载
3. **CDN加速**: 利用EdgeOne全球节点加速

### 安全监控
1. **访问日志分析**: 监控异常访问模式
2. **SSL证书状态**: 定期检查证书有效期
3. **安全头部验证**: 定期验证安全配置生效

## 📝 版本管理

### Git提交规范
- 配置文件变更必须详细说明影响范围
- 生产环境部署前必须经过测试验证
- 重要配置变更需要创建技术文档

### 回滚方案
1. **快速回滚**: EdgeOne控制台一键回滚到上一版本
2. **Git回滚**: 回滚GitHub提交触发重新部署
3. **配置回滚**: 恢复.edgeonerc到可用版本

---

**创建日期**: 2025-10-02  
**文档版本**: v1.0  
**维护责任人**: ZhiTouJianLi Team  
**下次更新**: 功能重大变更时