# 🔧 CORS 跨域问题修复指南

## 📋 问题描述

当从 `https://www.zhitoujianli.com` 访问 `https://zhitoujianli.com/api` 时出现 CORS 错误：

```
Access to fetch at 'https://zhitoujianli.com/api/auth/send-verification-code'
from origin 'https://www.zhitoujianli.com' has been blocked by CORS policy.
```

## ✅ 已修复的内容

### 1️⃣ 后端 CORS 配置 (`CorsConfig.java`)

**文件位置**: `/backend/get_jobs/src/main/java/config/CorsConfig.java`

**修复内容**:

- ✅ 明确列出允许的源（`www.zhitoujianli.com` 和 `zhitoujianli.com`）
- ✅ 修复 `allowCredentials` + 通配符的浏览器限制问题
- ✅ 添加所有必要的 CORS 头部
- ✅ 支持开发环境和生产环境

**关键改动**:

```java
// ❌ 旧代码（会导致 CORS 错误）
configuration.setAllowedOriginPatterns(Arrays.asList("*"));

// ✅ 新代码（明确列出允许的源）
configuration.setAllowedOrigins(Arrays.asList(
    "https://www.zhitoujianli.com",
    "https://zhitoujianli.com",
    "http://localhost:3000",
    // ...其他开发环境
));
```

### 2️⃣ 前端请求逻辑 (`Register.tsx`)

**文件位置**: `/frontend/src/components/Register.tsx`

**修复内容**:

- ✅ 统一使用不带 `www` 的域名 (`https://zhitoujianli.com`)
- ✅ 添加 `credentials: 'include'` 支持跨域 Cookie
- ✅ 增强错误日志和调试信息
- ✅ 改进错误处理和用户提示

**关键改动**:

```typescript
// ✅ 添加 credentials 支持
const response = await fetch(apiUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
  credentials: 'include', // ✅ 支持跨域 Cookie 传递
});

// ✅ 增强日志输出
console.log('🔧 当前环境:', {
  hostname: window.location.hostname,
  protocol: window.location.protocol,
  apiBaseUrl: baseURL,
  fullUrl: apiUrl,
});
```

### 3️⃣ 开发环境代理 (`setupProxy.js`)

**文件位置**: `/frontend/src/setupProxy.js`

**修复内容**:

- ✅ 改进错误处理
- ✅ 添加详细的请求/响应日志
- ✅ 支持 WebSocket（如果需要）
- ✅ 添加备份 CORS 头部

### 4️⃣ 环境变量配置

**新增文件**:

- `/frontend/env.production.example`
- `/frontend/env.development.example`

**使用方法**:

```bash
cd /root/zhitoujianli/frontend

# 创建生产环境配置
cp env.production.example .env.production

# 创建开发环境配置
cp env.development.example .env.development
```

## 🚀 部署步骤

### 步骤 1: 创建环境变量文件

```bash
cd /root/zhitoujianli/frontend

# 生产环境
cat > .env.production << 'EOF'
REACT_APP_API_URL=https://zhitoujianli.com/api
REACT_APP_BACKEND_URL=https://zhitoujianli.com
NODE_ENV=production
GENERATE_SOURCEMAP=false
REACT_APP_ENABLE_ANALYTICS=true
EOF

# 开发环境
cat > .env.development << 'EOF'
REACT_APP_API_URL=/api
REACT_APP_BACKEND_URL=http://localhost:8080
NODE_ENV=development
REACT_APP_DEBUG=true
REACT_APP_ENABLE_ANALYTICS=false
EOF
```

### 步骤 2: 重新编译后端

```bash
cd /root/zhitoujianli/backend/get_jobs

# 清理并重新编译
mvn clean package -DskipTests

# 重启后端服务
./restart_backend.sh
# 或者
java -jar target/get_jobs-v2.0.1.jar
```

### 步骤 3: 重新构建前端

```bash
cd /root/zhitoujianli/frontend

# 安装依赖（如果需要）
npm install

# 开发环境
npm start

# 生产环境构建
npm run build
```

### 步骤 4: 部署到生产环境

```bash
cd /root/zhitoujianli

# 使用部署脚本
./deploy-production.sh
# 或
./deploy-www.sh
```

## 🧪 测试验证

### 测试清单

| 检查项          | 验证方法                                    | 预期结果                                                         |
| --------------- | ------------------------------------------- | ---------------------------------------------------------------- |
| ✅ CORS 头部    | 打开浏览器开发者工具 → Network → 查看响应头 | 包含 `Access-Control-Allow-Origin: https://www.zhitoujianli.com` |
| ✅ 无 CORS 错误 | 打开浏览器 Console                          | 无 "CORS policy" 相关错误                                        |
| ✅ 注册功能     | 访问注册页面，输入邮箱，点击"发送验证码"    | 成功发送，显示"验证码已发送到邮箱"                               |
| ✅ API 响应     | Network 面板查看 API 响应                   | 返回 `200 OK` 状态码                                             |
| ✅ HTTPS 安全   | 地址栏查看锁图标                            | 全部通过 HTTPS 加密                                              |

### 手动测试步骤

#### 1. 测试生产环境（HTTPS）

```bash
# 访问生产环境
https://www.zhitoujianli.com/register

# 或
https://zhitoujianli.com/register
```

**操作步骤**:

1. 打开浏览器开发者工具（F12）
2. 切换到 **Console** 标签
3. 输入测试邮箱（例如：`test@example.com`）
4. 点击"发送验证码"按钮
5. 查看控制台输出

**预期输出**:

```
🔗 发送验证码请求到: https://zhitoujianli.com/api/auth/send-verification-code
🔧 当前环境: {hostname: 'www.zhitoujianli.com', protocol: 'https:', ...}
📊 响应状态: {status: 200, statusText: 'OK', ...}
✅ 验证码已发送
```

**检查 Network 标签**:

1. 切换到 **Network** 标签
2. 找到 `send-verification-code` 请求
3. 点击查看 **Headers**
4. 确认响应头包含：
   ```
   Access-Control-Allow-Origin: https://www.zhitoujianli.com
   Access-Control-Allow-Credentials: true
   ```

#### 2. 测试开发环境（HTTP）

```bash
cd /root/zhitoujianli/frontend
npm start
```

访问: `http://localhost:3000/register`

**预期行为**:

- 所有 `/api` 请求自动代理到 `http://localhost:8080`
- 控制台显示代理日志：
  ```
  🔄 代理请求: POST /api/auth/send-verification-code -> http://localhost:8080/api/auth/send-verification-code
  ✅ 代理响应: 200 /api/auth/send-verification-code
  ```

## 🐛 常见问题排查

### 问题 1: 仍然出现 CORS 错误

**可能原因**:

- 后端服务未重启
- Nginx 缓存未清除
- 浏览器缓存未清除

**解决方案**:

```bash
# 1. 重启后端
cd /root/zhitoujianli/backend/get_jobs
./restart_backend.sh

# 2. 重启 Nginx
sudo systemctl restart nginx

# 3. 清除浏览器缓存
# Chrome: Ctrl+Shift+Delete → 清除缓存和Cookie
# 或使用隐私模式测试
```

### 问题 2: 前端构建失败

**可能原因**:

- 环境变量文件缺失
- 依赖包未安装

**解决方案**:

```bash
cd /root/zhitoujianli/frontend

# 1. 创建环境变量文件（见上文）
cp env.production.example .env.production
cp env.development.example .env.development

# 2. 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 3. 重新构建
npm run build
```

### 问题 3: 开发环境代理失败

**可能原因**:

- 后端未启动
- 端口被占用
- setupProxy.js 配置错误

**解决方案**:

```bash
# 1. 检查后端是否运行
curl http://localhost:8080/api/health
# 或
lsof -i :8080

# 2. 检查前端端口
lsof -i :3000

# 3. 查看代理日志
# 启动前端时会显示详细的代理日志
```

### 问题 4: Nginx 配置冲突

**可能原因**:

- Nginx 也配置了 CORS，与后端冲突
- 请求被 Nginx 拦截，未到达后端

**解决方案**:

检查 Nginx 配置文件（通常在 `/etc/nginx/sites-available/`）:

```nginx
# ❌ 删除 Nginx 中的 CORS 配置（让后端处理）
# 找到并注释掉这些行：
# add_header 'Access-Control-Allow-Origin' '*';
# add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';

# ✅ 确保请求正确代理到后端
location /api/ {
    proxy_pass http://localhost:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

重启 Nginx:

```bash
sudo nginx -t  # 测试配置
sudo systemctl restart nginx
```

## 📊 技术细节

### CORS 工作原理

1. **浏览器发送预检请求**（OPTIONS）:

   ```
   Origin: https://www.zhitoujianli.com
   Access-Control-Request-Method: POST
   Access-Control-Request-Headers: Content-Type
   ```

2. **服务器响应预检请求**:

   ```
   Access-Control-Allow-Origin: https://www.zhitoujianli.com
   Access-Control-Allow-Methods: GET, POST, OPTIONS
   Access-Control-Allow-Headers: Content-Type
   Access-Control-Allow-Credentials: true
   ```

3. **浏览器发送实际请求**（POST）:

   ```
   Origin: https://www.zhitoujianli.com
   Content-Type: application/json
   ```

4. **服务器响应实际请求**:
   ```
   Access-Control-Allow-Origin: https://www.zhitoujianli.com
   Access-Control-Allow-Credentials: true
   ```

### 为什么不能使用通配符 `*`？

当 `Access-Control-Allow-Credentials: true` 时，浏览器**不允许**使用通配符 `*`，必须明确指定允许的源。

```java
// ❌ 错误：会导致 CORS 错误
configuration.setAllowedOriginPatterns(Arrays.asList("*"));
configuration.setAllowCredentials(true);

// ✅ 正确：明确列出允许的源
configuration.setAllowedOrigins(Arrays.asList(
    "https://www.zhitoujianli.com",
    "https://zhitoujianli.com"
));
configuration.setAllowCredentials(true);
```

## 🔒 安全性说明

1. **生产环境**: 仅允许明确的域名访问
2. **开发环境**: 可以放宽限制（localhost）
3. **凭证传递**: 仅在必要时启用 `allowCredentials`
4. **HTTPS**: 生产环境强制使用 HTTPS

## 📚 相关文档

- [MDN: CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)
- [Spring CORS 文档](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-cors)
- [React 代理配置](https://create-react-app.dev/docs/proxying-api-requests-in-development/)

## ✅ 修复完成清单

- [x] 更新后端 `CorsConfig.java`
- [x] 优化前端 `Register.tsx` 请求逻辑
- [x] 增强 `setupProxy.js` 开发代理
- [x] 创建环境变量示例文件
- [x] 编写测试验证指南
- [x] 编写故障排查文档

## 🎯 下一步

1. 按照"部署步骤"重新部署应用
2. 使用"测试验证"部分进行功能测试
3. 如遇问题，参考"常见问题排查"
4. 监控生产环境日志，确保稳定运行

---

**更新时间**: 2025-10-16
**作者**: Cursor AI Assistant
**状态**: ✅ 修复完成，待部署验证
