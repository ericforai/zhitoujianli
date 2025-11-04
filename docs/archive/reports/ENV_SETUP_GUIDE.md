# 环境变量配置指南

## 📋 概述

本项目使用环境变量来管理不同环境（开发、测试、生产）的配置。这样可以：
- ✅ 避免敏感信息泄露到代码库
- ✅ 便于在不同环境切换配置
- ✅ 提高安全性和可维护性

---

## 🚀 快速开始

### 1. 后端环境配置

```bash
# 进入后端目录
cd backend/get_jobs

# 复制示例文件
cp .env.example .env

# 编辑配置文件
vim .env  # 或使用其他编辑器
```

**必需配置项:**
```bash
# JWT密钥 - 🔐 重要：必须修改
JWT_SECRET=your-256-bit-secret-key-here

# Authing配置
AUTHING_USER_POOL_ID=your-user-pool-id
AUTHING_APP_ID=your-app-id
AUTHING_APP_SECRET=your-app-secret
AUTHING_APP_HOST=https://your-domain.authing.cn
```

### 2. 前端环境配置

```bash
# 进入前端目录
cd frontend

# 复制示例文件
cp .env.example .env

# 编辑配置文件
vim .env
```

**必需配置项:**
```bash
# API地址
REACT_APP_API_URL=http://localhost:8080
```

---

## 🔐 生成安全的JWT密钥

### 方法1: 使用OpenSSL (推荐)
```bash
openssl rand -base64 32
```

### 方法2: 使用Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 方法3: 使用Python
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**复制输出的字符串到 `.env` 文件中的 `JWT_SECRET`**

---

## 🔑 Authing配置获取

1. 注册/登录 [Authing控制台](https://console.authing.cn/)
2. 创建应用
3. 在应用详情页面获取配置信息：
   - **用户池ID**: AUTHING_USER_POOL_ID
   - **应用ID**: AUTHING_APP_ID
   - **应用密钥**: AUTHING_APP_SECRET
   - **应用域名**: AUTHING_APP_HOST

---

## 📁 环境变量文件说明

### 后端

| 文件 | 用途 | 提交到Git |
|------|------|----------|
| `.env.example` | 配置示例模板 | ✅ 是 |
| `.env` | 本地开发配置 | ❌ 否 |
| `.env.production` | 生产环境配置 | ❌ 否 |

### 前端

| 文件 | 用途 | 提交到Git |
|------|------|----------|
| `.env.example` | 配置示例模板 | ✅ 是 |
| `.env` | 本地开发配置 | ❌ 否 |
| `.env.production` | 生产环境配置 | ❌ 否 |
| `.env.local` | 本地覆盖配置 | ❌ 否 |

---

## 🌍 多环境配置

### 开发环境
```bash
# .env
SECURITY_ENABLED=false  # 可以禁用认证方便调试
JWT_SECRET=dev-secret-key
REACT_APP_API_URL=http://localhost:8080
```

### 测试环境
```bash
# .env.staging
SECURITY_ENABLED=true
JWT_SECRET=staging-strong-secret-key
REACT_APP_API_URL=https://api-staging.zhitoujianli.com
```

### 生产环境
```bash
# .env.production
SECURITY_ENABLED=true
JWT_SECRET=production-very-strong-random-secret-key
REACT_APP_API_URL=https://api.zhitoujianli.com
SPRING_PROFILES_ACTIVE=production
```

---

## ⚙️ 使用环境变量

### Java (后端)

```java
@Autowired
private Dotenv dotenv;

// 读取环境变量
String jwtSecret = dotenv.get("JWT_SECRET");
String serverPort = dotenv.get("SERVER_PORT", "8080"); // 带默认值
```

### TypeScript (前端)

```typescript
// 读取环境变量 (必须以REACT_APP_开头)
const apiUrl = process.env.REACT_APP_API_URL;
const env = process.env.REACT_APP_ENV || 'development';

// 使用配置
import { API_CONFIG } from './config/env';
console.log(API_CONFIG.baseURL);
```

---

## ✅ 配置验证

### 后端验证

应用启动时会自动验证JWT配置，如果配置不正确会抛出异常：

```
❌ 致命错误：JWT_SECRET未配置！应用无法启动。
请在.env文件中配置JWT_SECRET
```

### 前端验证

在 `src/config/env.ts` 中可以添加验证逻辑：

```typescript
if (!API_CONFIG.baseURL) {
  throw new Error('REACT_APP_API_URL未配置');
}
```

---

## 🔒 安全最佳实践

### ✅ 应该做的

1. **使用强密钥**
   - JWT_SECRET至少32字节（256位）
   - 使用随机生成的字符串
   - 不同环境使用不同的密钥

2. **保护.env文件**
   - 添加到 `.gitignore`
   - 设置文件权限 `chmod 600 .env`
   - 不要通过邮件/聊天工具传输

3. **定期更换密钥**
   - 生产环境每季度更换一次
   - 发生安全事件立即更换
   - 记录密钥更换历史

4. **分离环境配置**
   - 开发/测试/生产使用不同配置
   - 生产配置仅存储在生产服务器
   - 使用密钥管理系统（如AWS Secrets Manager）

### ❌ 不应该做的

1. **不要硬编码**
   - 不要在代码中写死配置
   - 不要提交 `.env` 文件到Git
   - 不要在日志中输出敏感信息

2. **不要使用弱密钥**
   - 不要使用 "secret", "123456" 等简单密钥
   - 不要使用字典词汇
   - 不要重复使用密钥

3. **不要暴露敏感信息**
   - 前端环境变量会暴露给用户
   - 不要在前端存储API密钥
   - 不要在错误信息中暴露配置

---

## 🐛 常见问题

### Q1: 修改.env后不生效？

**A:** 需要重启应用

```bash
# 后端
mvn spring-boot:run

# 前端
npm start
```

### Q2: 前端读取环境变量返回undefined？

**A:** 检查以下几点：
1. 变量名必须以 `REACT_APP_` 开头
2. 修改后需要重启开发服务器
3. 使用 `process.env.REACT_APP_XXX` 访问

### Q3: 生产环境如何配置环境变量？

**A:** 有多种方式：
1. 创建 `.env.production` 文件
2. 在服务器上设置系统环境变量
3. 使用Docker环境变量
4. 使用云服务商的配置管理

### Q4: JWT_SECRET长度不足？

**A:**

```
❌ 安全警告：JWT_SECRET长度不足！
当前长度：16字节，建议至少32字节（256位）
```

**解决方案**: 使用 `openssl rand -base64 32` 生成新密钥

---

## 📦 部署检查清单

部署到生产环境前，请确保：

- [ ] 已创建 `.env` 文件
- [ ] JWT_SECRET已修改为强随机密钥
- [ ] Authing配置已填写正确
- [ ] SECURITY_ENABLED=true
- [ ] CORS_ALLOWED_ORIGINS仅包含生产域名
- [ ] 移除了所有测试/演示配置
- [ ] 检查了所有必需的环境变量
- [ ] `.env` 文件在 `.gitignore` 中
- [ ] 生产密钥已妥善保管

---

## 📞 获取帮助

如有问题，请查看：
1. [README.md](./README.md) - 项目文档
2. [CODE_REVIEW_REPORT.md](./CODE_REVIEW_REPORT.md) - 代码审查报告
3. GitHub Issues - 提交问题

---

**最后更新**: 2025-10-10
**维护者**: ZhiTouJianLi Team


