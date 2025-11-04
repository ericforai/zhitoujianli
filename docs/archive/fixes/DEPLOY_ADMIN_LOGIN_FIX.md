# 管理员登录修复 - 部署指南

## 🚨 问题说明

生产环境出现 Mixed Content 错误：

- 页面使用 HTTPS
- 代码尝试使用 HTTP 请求
- 浏览器阻止混合内容

## ✅ 已修复的代码

### 修复位置

- `frontend/src/components/Login.tsx`

### 修复内容

1. 移除硬编码的绝对 URL (`https://zhitoujianli.com`)
2. 使用配置模块的相对路径 (`/api`)
3. 自动适配生产/开发环境

### 修复前的代码

```typescript
const getApiBaseUrl = () => {
  if (window.location.hostname === 'zhitoujianli.com') {
    return 'https://zhitoujianli.com'; // ❌ 硬编码，可能导致Mixed Content
  }
  return 'http://localhost:8080';
};
```

### 修复后的代码

```typescript
import config from '../config/environment';

// 使用配置中的API基础URL（相对路径，避免Mixed Content错误）
const baseUrl = config.apiBaseUrl.endsWith('/api') ? config.apiBaseUrl : config.apiBaseUrl + '/api';
const apiUrl = `${baseUrl}/admin/auth/login`;
```

## 📋 部署步骤

### 方式一：通过 Git 提交部署（推荐）

如果生产环境配置了自动部署：

```bash
# 1. 提交修改
cd /root/zhitoujianli
git add frontend/src/components/Login.tsx
git commit -m "fix(admin): 修复管理员登录Mixed Content错误"
git push origin main

# 2. 等待自动部署（如果配置了CI/CD）
# 或手动触发部署
```

### 方式二：手动构建和部署

```bash
# 1. 进入前端目录
cd /root/zhitoujianli/frontend

# 2. 安装依赖（如果需要）
npm install

# 3. 构建生产版本
npm run build

# 4. 复制构建文件到部署目录
# 根据您的部署方式，可能需要：
# - 复制到 Nginx 静态文件目录
# - 复制到火山云部署目录
# - 上传到 CDN

# 示例：如果使用 Nginx
sudo cp -r build/* /var/www/zhitoujianli/

# 示例：如果使用火山云
# 上传 build 目录到火山云部署平台
```

### 方式三：快速验证（本地构建测试）

```bash
# 1. 构建
cd /root/zhitoujianli/frontend
npm run build

# 2. 查看构建产物
ls -la build/

# 3. 检查构建后的文件
grep -r "admin/auth/login" build/
# 应该看到使用相对路径的代码
```

## 🔍 验证修复

### 部署后检查清单

- [ ] 浏览器控制台无 Mixed Content 错误
- [ ] 管理员登录请求使用相对路径 `/api/admin/auth/login`
- [ ] 登录请求成功（状态码 200）
- [ ] 管理员可以成功登录

### 检查方法

1. **打开浏览器开发者工具**
   - 访问 `https://zhitoujianli.com/login`
   - 打开 Network 标签
   - 尝试管理员登录

2. **查看网络请求**
   - 找到 `admin/auth/login` 请求
   - 检查 Request URL：
     - ✅ 正确：`https://zhitoujianli.com/api/admin/auth/login`
     - ❌ 错误：`http://zhitoujianli.com/api/admin/auth/login`

3. **查看控制台**
   - 不应该有 Mixed Content 错误
   - 不应该有 "Failed to fetch" 错误

## 🚀 立即部署命令

```bash
# 完整部署流程
cd /root/zhitoujianli

# 1. 提交代码
git add frontend/src/components/Login.tsx
git commit -m "fix(admin): 修复管理员登录Mixed Content错误"

# 2. 构建前端
cd frontend
npm run build

# 3. 部署（根据您的部署方式选择）
# 选项A：Nginx部署
sudo cp -r build/* /var/www/zhitoujianli/

# 选项B：火山云部署
# 上传 build 目录

# 选项C：Docker部署
# docker build -t frontend .
# docker push frontend
```

## ⚠️ 重要提示

1. **代码已修改但未部署**
   - 修改仅在本地文件系统中
   - 需要构建和部署才能生效

2. **清除浏览器缓存**
   - 部署后建议清除浏览器缓存
   - 或使用隐私模式测试

3. **检查生产环境配置**
   - 确认 `config.apiBaseUrl` 在生产环境返回 `/api`
   - 确认 API 代理配置正确

## 📞 需要帮助？

如果部署后仍有问题，请检查：

1. 构建产物是否正确生成
2. 部署文件是否完整上传
3. 浏览器缓存是否清除
4. 网络请求的完整URL

---

**修复时间**: 2025-10-29
**修复版本**: v1.0
**维护者**: 智投简历开发团队
