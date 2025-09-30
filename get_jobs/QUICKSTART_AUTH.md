# 快速开始：10分钟集成Authing身份认证

> 🚀 这是最快的实施方案，适合立即上线使用

---

## 📋 准备工作检查清单

在开始之前，请确认：

- [ ] 有电脑和浏览器
- [ ] 有手机号或邮箱（用于注册Authing）
- [ ] 项目能正常运行（Spring Boot启动正常）
- [ ] （可选）有营业执照（用于申请支付功能）

---

## 第一步：注册Authing账号（5分钟）

### 1.1 访问Authing官网

打开浏览器，访问：**https://authing.cn/**

### 1.2 注册账号

- 点击"免费注册"
- 使用手机号或邮箱注册
- 验证邮箱或手机号

### 1.3 创建用户池

登录后，点击"创建用户池"：
- **用户池名称**：智投简历
- **用户池域名**：zhitoujianli（会生成：zhitoujianli.authing.cn）

### 1.4 创建应用

在用户池中，点击"应用" → "创建应用"：
- **应用名称**：智投简历后台
- **应用类型**：标准Web应用
- **认证配置**：
  - 登录回调URL：`http://localhost:3000/callback`
  - 登出回调URL：`http://localhost:3000/`

### 1.5 获取配置信息

创建完成后，在应用详情页面记录以下信息：

```
App ID: 6xxxxxxxxxxxxxxx
App Secret: 6xxxxxxxxxxxxxxx
用户池ID: 6xxxxxxxxxxxxxxx
用户池域名: zhitoujianli.authing.cn
```

**⚠️ 重要**：App Secret是敏感信息，不要泄露！

---

## 第二步：配置登录方式（5分钟）

### 2.1 配置手机号登录

在Authing控制台：
1. 点击"认证配置" → "登录注册方式"
2. 启用"手机号验证码登录"
3. 配置短信服务商（推荐：阿里云SMS或腾讯云SMS）

**短信服务商配置**：
- 阿里云SMS：https://dysms.console.aliyun.com/
- 腾讯云SMS：https://console.cloud.tencent.com/smsv2

### 2.2 配置邮箱登录

1. 启用"邮箱密码登录"
2. 启用"邮箱验证码登录"（可选）
3. 配置邮件服务商（Authing提供默认邮件服务）

### 2.3 配置微信登录

1. 点击"社交化登录" → "添加社交登录"
2. 选择"微信网页授权登录"
3. 填写微信开放平台的AppID和AppSecret

**如何获取微信AppID**：
1. 访问 https://open.weixin.qq.com/
2. 注册并创建网站应用
3. 获取AppID和AppSecret
4. 配置授权回调域：`zhitoujianli.authing.cn`

### 2.4 配置支付宝登录

1. 点击"社交化登录" → "添加社交登录"
2. 选择"支付宝登录"
3. 填写支付宝开放平台的AppID

**如何获取支付宝AppID**：
1. 访问 https://open.alipay.com/
2. 创建应用（选择"网页&移动应用"）
3. 获取AppID和密钥
4. 配置授权回调地址：`https://zhitoujianli.authing.cn/api/v2/connection/social/alipay/callback`

---

## 第三步：集成到Spring Boot项目（10分钟）

### 3.1 添加Maven依赖

编辑 `get_jobs/pom.xml`，在 `<dependencies>` 标签内添加：

```xml
<!-- Authing Java SDK -->
<dependency>
    <groupId>cn.authing</groupId>
    <artifactId>authing-java-sdk</artifactId>
    <version>3.0.0</version>
</dependency>

<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- JWT处理 -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
</dependency>
```

### 3.2 配置环境变量

编辑 `get_jobs/src/main/resources/.env`，添加：

```bash
# ========== Authing配置 ==========
AUTHING_USER_POOL_ID=6xxxxxxxxxxxxxxx
AUTHING_APP_ID=6xxxxxxxxxxxxxxx
AUTHING_APP_SECRET=6xxxxxxxxxxxxxxx
AUTHING_APP_HOST=https://zhitoujianli.authing.cn

# ========== JWT配置 ==========
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars
JWT_EXPIRATION=86400000

# ========== 原有配置保持不变 ==========
HOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your_key_here
BASE_URL=http://localhost:11434
API_KEY=ollama
MODEL=qwen2.5:7b
```

**⚠️ 重要**：
- 将 `6xxxxxxxxxxxxxxx` 替换为你在Authing控制台获取的实际值
- 将 `JWT_SECRET` 改为随机的强密码（至少32位）

### 3.3 配置Spring Boot读取环境变量

编辑 `get_jobs/src/main/resources/application.yml`（如果没有则创建）：

```yaml
spring:
  application:
    name: zhitoujianli-backend

# Authing配置
authing:
  userPoolId: ${AUTHING_USER_POOL_ID}
  appId: ${AUTHING_APP_ID}
  appSecret: ${AUTHING_APP_SECRET}
  appHost: ${AUTHING_APP_HOST}

# JWT配置
jwt:
  secret: ${JWT_SECRET}
  expiration: ${JWT_EXPIRATION}

# 服务器配置
server:
  port: 8080
```

### 3.4 运行Maven更新依赖

```bash
cd /Users/user/autoresume/get_jobs
mvn clean install
```

---

## 第四步：测试认证功能（5分钟）

### 4.1 启动后端服务

```bash
cd /Users/user/autoresume/get_jobs
mvn spring-boot:run
```

### 4.2 测试健康检查

```bash
curl http://localhost:8080/api/auth/health
```

**期望响应**：
```json
{
  "success": true,
  "authingConfigured": true,
  "appId": "6xxxxxxxxxxxxxxx",
  "message": "Authing配置正常"
}
```

### 4.3 测试注册功能

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "username": "测试用户"
  }'
```

**期望响应**：
```json
{
  "success": true,
  "message": "注册成功，请登录",
  "userId": "6xxxxxxxxxxxxxxx"
}
```

### 4.4 测试登录功能

```bash
curl -X POST http://localhost:8080/api/auth/login/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

**期望响应**：
```json
{
  "success": true,
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "xxx",
  "expiresIn": 3600,
  "user": {
    "userId": "6xxxxxxxxxxxxxxx",
    "email": "test@example.com",
    "username": "测试用户"
  }
}
```

### 4.5 测试访问受保护的接口

```bash
# 不带Token访问（应该失败）
curl http://localhost:8080/api/status

# 带Token访问（应该成功）
curl http://localhost:8080/api/status \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 第五步：前端集成（15分钟）

### 5.1 安装Authing SDK

```bash
cd /Users/user/autoresume/zhitoujianli-website
npm install @authing/web
```

### 5.2 创建登录组件

创建 `src/components/Login.tsx`（参考方案文档中的代码）

### 5.3 创建认证服务

创建 `src/services/authService.ts`：

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动添加Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：处理401错误
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期，清除并跳转到登录页
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // 邮箱密码登录
  loginByEmail: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login/email', {
      email,
      password,
    });
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // 手机号验证码登录
  sendCode: async (phone: string) => {
    return (await apiClient.post('/auth/send-code', { phone })).data;
  },

  loginByPhone: async (phone: string, code: string) => {
    const response = await apiClient.post('/auth/login/phone', {
      phone,
      code,
    });
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // 注册
  register: async (email: string, password: string, username?: string) => {
    return (await apiClient.post('/auth/register', {
      email,
      password,
      username,
    })).data;
  },

  // 登出
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    return (await apiClient.get('/auth/user/info')).data;
  },

  // 检查是否登录
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },
};

export default apiClient;
```

---

## 第六步：前端路由保护（10分钟）

### 6.1 创建路由守卫

创建 `src/components/PrivateRoute.tsx`：

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // 未登录，重定向到登录页
    return <Navigate to="/login" replace />;
  }

  // 已登录，显示内容
  return <>{children}</>;
};

export default PrivateRoute;
```

### 6.2 使用路由守卫

在 `src/App.tsx` 中：

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 受保护的路由 */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/resume-parser"
          element={
            <PrivateRoute>
              <ResumeParser />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 第七步：保护后台API（5分钟）

### 7.1 更新WebController

在现有的 `WebController.java` 中，所有方法会自动被Spring Security保护。

如果需要获取当前登录用户信息：

```java
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@GetMapping("/")
public String index(
        Model model,
        @AuthenticationPrincipal Object user) {  // 获取当前登录用户
    
    // user就是Authing返回的用户信息对象
    log.info("当前登录用户: {}", user);
    
    // 继续原有逻辑...
    return "index";
}
```

---

## 测试验证

### 完整测试流程

1. **启动后端**：
```bash
cd /Users/user/autoresume/get_jobs
mvn spring-boot:run
```

2. **启动前端**：
```bash
cd /Users/user/autoresume/zhitoujianli-website
npm start
```

3. **测试场景**：

| 测试场景 | 操作步骤 | 预期结果 |
|---------|---------|---------|
| 未登录访问 | 直接访问 `http://localhost:3000/` | 自动跳转到登录页 |
| 邮箱注册 | 填写邮箱和密码，点击注册 | 注册成功提示 |
| 邮箱登录 | 填写邮箱和密码，点击登录 | 跳转到主页，显示用户信息 |
| 手机号登录 | 输入手机号，获取验证码，登录 | 登录成功，进入主页 |
| 微信登录 | 点击微信登录按钮，扫码 | 登录成功，进入主页 |
| 访问API | 登录后访问 `/api/status` | 返回正常数据 |
| Token过期 | 等待Token过期（默认1小时） | 自动跳转到登录页 |
| 登出 | 点击登出按钮 | 清除Token，跳转到登录页 |

---

## 故障排查

### 问题1：Authing配置未生效

**现象**：访问 `/api/auth/health` 返回 `authingConfigured: false`

**解决**：
```bash
# 检查.env文件是否正确
cat src/main/resources/.env | grep AUTHING

# 确保环境变量被加载
# 在application.yml中检查配置是否正确
```

### 问题2：发送短信验证码失败

**现象**：调用 `/api/auth/send-code` 失败

**解决**：
1. 登录Authing控制台
2. 检查"认证配置" → "短信服务"是否配置
3. 检查短信服务商（阿里云/腾讯云）余额是否充足

### 问题3：登录后访问API仍然401

**现象**：登录成功，但访问受保护接口返回401

**解决**：
```javascript
// 检查前端是否正确发送Token
console.log('Token:', localStorage.getItem('token'));

// 检查请求头
fetch('http://localhost:8080/api/status', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

### 问题4：Spring Security拦截了所有请求

**现象**：访问登录页面也返回403

**解决**：
检查 `SecurityConfig.java` 中的配置，确保登录相关路径在 `permitAll()` 列表中。

---

## 下一步

完成基础认证后，你可以：

1. **配置更多登录方式**：
   - 在Authing控制台添加GitHub、Google等登录
   
2. **实现会员体系**：
   - 创建用户表存储VIP状态
   - 根据VIP等级限制功能使用

3. **集成支付功能**：
   - 参考 `README_AUTH_PAYMENT.md` 中的支付集成方案
   - 申请微信支付和支付宝商户号

4. **添加权限管理**：
   - 在Authing中配置角色（普通用户、VIP、管理员）
   - 在代码中根据角色限制功能

---

## 🎉 恭喜

如果你完成了上述步骤，你的项目现在已经拥有：

✅ 安全的用户认证系统  
✅ 支持多种登录方式  
✅ JWT令牌保护的API  
✅ 前端路由保护  
✅ 符合行业安全标准

**总耗时**：约30-40分钟  
**代码行数**：约200行（大部分由Authing处理）  
**安全性**：企业级

---

## 🆘 需要帮助？

- **Authing官方文档**：https://docs.authing.cn/v2/
- **Authing Java SDK文档**：https://docs.authing.cn/v2/reference/sdk-for-java/
- **示例代码**：https://github.com/Authing/authing-java-sdk-demo
- **技术支持**：关注Authing公众号，加入技术交流群

---

**立即开始，30分钟让你的项目拥有企业级安全保护！** 🚀
