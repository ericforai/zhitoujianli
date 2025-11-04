# 🔐 Spring Security + JavaMail 完整实施计划

**项目**: 智投简历用户管理系统  
**方案**: Spring Security + JavaMail  
**预计时间**: 1.5-2天（12-16小时）  
**成本**: ¥0（完全免费）

---

## 📋 完整TODO清单

### ✅ 阶段1: 移除Authing（2小时）

#### 1.1 移除Maven依赖
- [ ] 从`pom.xml`删除Authing SDK依赖
  - `cn.authing:authing-java-sdk`
- [ ] 运行`mvn clean`清理

#### 1.2 删除Authing配置类
- [ ] 删除`config/AuthingConfig.java`
- [ ] 删除`config/AuthingAuthenticationConfig.java`
- [ ] 删除`config/AuthingManagementConfig.java`

#### 1.3 清理环境变量
- [ ] 从`.env`删除Authing配置项
  - `AUTHING_USER_POOL_ID`
  - `AUTHING_APP_ID`
  - `AUTHING_APP_SECRET`
  - `AUTHING_APP_HOST`

#### 1.4 重构AuthController
- [ ] 删除Authing相关import
- [ ] 删除`@Autowired AuthenticationClient`
- [ ] 删除`@Autowired ManagementClient`
- [ ] 保留JWT相关代码
- [ ] 标记需要重写的方法

**验收标准**: 
- ✅ `mvn clean compile`无Authing相关错误
- ✅ 项目可正常编译

**预计时间**: 2小时

---

### ✅ 阶段2: 配置JavaMail（4小时）

#### 2.1 添加Maven依赖
- [ ] 添加`spring-boot-starter-mail`到`pom.xml`
- [ ] 添加`commons-lang3`（用于工具类）
- [ ] 运行`mvn clean install`

#### 2.2 配置邮件服务器
- [ ] 在`.env`添加邮件配置
  ```
  MAIL_HOST=smtp.qq.com
  MAIL_PORT=465
  MAIL_USERNAME=your-email@qq.com
  MAIL_PASSWORD=您的QQ邮箱授权码
  MAIL_FROM=your-email@qq.com
  MAIL_FROM_NAME=智投简历
  ```
- [ ] 创建`MailConfig.java`配置类
- [ ] 配置JavaMailSender Bean

#### 2.3 创建邮件服务
- [ ] 创建`service/EmailService.java`
  - 方法: `sendVerificationCode(String email, String code)`
  - 方法: `sendPasswordResetEmail(String email, String token)`
  - 方法: `sendWelcomeEmail(String email, String username)`

#### 2.4 创建验证码服务
- [ ] 创建`service/VerificationCodeService.java`
  - 方法: `generateCode()` - 生成6位数字验证码
  - 方法: `storeCode(String email, String code)` - 存储验证码
  - 方法: `verifyCode(String email, String code)` - 验证验证码
  - 方法: `cleanExpiredCodes()` - 清理过期验证码

#### 2.5 测试邮件发送
- [ ] 创建单元测试`EmailServiceTest.java`
- [ ] 测试发送验证码邮件
- [ ] 验证邮件正常接收

**验收标准**:
- ✅ 能成功发送邮件到真实邮箱
- ✅ 验证码生成和验证逻辑正常
- ✅ 邮件模板美观清晰

**预计时间**: 4小时

---

### ✅ 阶段3: 实现用户注册（4小时）

#### 3.1 创建数据库表和实体
- [ ] 创建`User`实体类
  ```java
  - userId (Long, 主键)
  - email (String, 唯一)
  - password (String, 加密)
  - username (String)
  - emailVerified (Boolean)
  - createdAt (Timestamp)
  - updatedAt (Timestamp)
  ```
- [ ] 创建`UserRepository`接口
- [ ] 配置JPA/MyBatis

#### 3.2 创建用户服务
- [ ] 创建`service/UserService.java`
  - 方法: `registerUser(RegisterDTO dto)`
  - 方法: `findByEmail(String email)`
  - 方法: `updatePassword(Long userId, String newPassword)`
  - 方法: `verifyEmail(String email)`

#### 3.3 实现注册接口
- [ ] 重构`POST /api/auth/send-verification-code`
  - 调用EmailService发送邮件
  - 使用VerificationCodeService存储验证码
  
- [ ] 重构`POST /api/auth/verify-code`
  - 验证验证码
  - 标记验证状态

- [ ] 重构`POST /api/auth/register`
  - 检查验证码已验证
  - 密码加密（BCrypt）
  - 创建用户到数据库
  - 生成JWT Token

#### 3.4 测试注册流程
- [ ] 测试发送验证码
- [ ] 测试验证码验证
- [ ] 测试用户注册
- [ ] 验证用户数据入库

**验收标准**:
- ✅ 能发送验证码邮件
- ✅ 验证码验证正确
- ✅ 用户成功注册
- ✅ 数据库有用户记录

**预计时间**: 4小时

---

### ✅ 阶段4: 实现登录和注销（4小时）

#### 4.1 实现登录接口
- [ ] 重构`POST /api/auth/login/email`
  - 验证邮箱和密码
  - 使用BCrypt验证密码
  - 生成JWT Token
  - 记录登录时间

- [ ] 优化JwtAuthenticationFilter
  - 从Header或Cookie获取Token
  - 验证Token有效性
  - 设置SecurityContext

#### 4.2 实现注销接口
- [ ] 创建`POST /api/auth/logout`
  - 清除客户端Token
  - 记录注销时间
  - （可选）Token黑名单

#### 4.3 实现Token刷新
- [ ] 创建`POST /api/auth/refresh-token`
  - 验证Refresh Token
  - 生成新的Access Token
  - 返回新Token

#### 4.4 实现用户信息查询
- [ ] 优化`GET /api/auth/user/info`
  - 从Token获取用户信息
  - 返回用户详情
  - 不返回敏感信息（密码）

**验收标准**:
- ✅ 用户能成功登录
- ✅ Token生成和验证正常
- ✅ 注销功能正常
- ✅ Token刷新正常

**预计时间**: 4小时

---

### ✅ 阶段5: 实现密码管理（4小时）

#### 5.1 修改密码
- [ ] 创建`POST /api/auth/change-password`
  - 验证当前密码
  - 验证新密码格式
  - 更新密码（BCrypt加密）
  - 使旧Token失效

#### 5.2 忘记密码
- [ ] 创建`POST /api/auth/forgot-password`
  - 验证邮箱存在
  - 生成重置Token（UUID）
  - 发送重置密码邮件（含链接）
  - 存储Token和过期时间

#### 5.3 重置密码
- [ ] 创建`POST /api/auth/reset-password`
  - 验证重置Token
  - 检查Token未过期
  - 更新密码
  - 使Token失效

**验收标准**:
- ✅ 能修改密码
- ✅ 能发送重置密码邮件
- ✅ 能通过邮件重置密码

**预计时间**: 4小时

---

### ✅ 阶段6: 完整测试（4小时）

#### 6.1 单元测试
- [ ] UserServiceTest - 用户服务测试
- [ ] EmailServiceTest - 邮件服务测试
- [ ] VerificationCodeServiceTest - 验证码测试

#### 6.2 集成测试
- [ ] 完整注册流程测试
- [ ] 完整登录流程测试
- [ ] 密码管理流程测试

#### 6.3 安全测试
- [ ] SQL注入测试
- [ ] XSS攻击测试
- [ ] CSRF防护测试
- [ ] 密码强度验证

#### 6.4 性能测试
- [ ] 并发登录测试
- [ ] 邮件发送性能
- [ ] Token验证性能

**验收标准**:
- ✅ 所有测试通过
- ✅ 无安全漏洞
- ✅ 性能满足要求

**预计时间**: 4小时

---

### ✅ 阶段7: 文档和部署（2小时）

#### 7.1 更新API文档
- [ ] 更新注册接口文档
- [ ] 更新登录接口文档
- [ ] 更新密码管理接口文档
- [ ] 添加错误码说明

#### 7.2 更新部署配置
- [ ] 更新`.env.example`
- [ ] 更新`README.md`
- [ ] 创建邮件配置指南

#### 7.3 前端适配
- [ ] 更新前端API调用（如有变化）
- [ ] 测试前后端联调

**验收标准**:
- ✅ 文档完整清晰
- ✅ 前端联调通过

**预计时间**: 2小时

---

## 📊 时间估算汇总

| 阶段 | 任务 | 预计时间 |
|------|------|---------|
| 阶段1 | 移除Authing | 2小时 |
| 阶段2 | 配置JavaMail | 4小时 |
| 阶段3 | 用户注册 | 4小时 |
| 阶段4 | 登录注销 | 4小时 |
| 阶段5 | 密码管理 | 4小时 |
| 阶段6 | 测试 | 4小时 |
| 阶段7 | 文档部署 | 2小时 |
| **总计** | **7个阶段** | **24小时** |

**实际工作日**: 1.5-2天（每天工作8-12小时）

---

## 🎯 里程碑

### Day 1上午（4小时）
- ✅ 阶段1完成：Authing已移除
- ✅ 阶段2完成：邮件服务可用

### Day 1下午（4小时）
- ✅ 阶段3完成：注册功能可用

### Day 2上午（4小时）
- ✅ 阶段4完成：登录注销可用
- ✅ 阶段5完成：密码管理可用

### Day 2下午（4小时）
- ✅ 阶段6完成：所有测试通过
- ✅ 阶段7完成：文档齐全

---

## 📁 将创建的文件

### 配置文件
```
backend/get_jobs/src/main/java/config/MailConfig.java
backend/get_jobs/src/main/resources/application-mail.yml
```

### 服务类
```
backend/get_jobs/src/main/java/service/EmailService.java
backend/get_jobs/src/main/java/service/VerificationCodeService.java
backend/get_jobs/src/main/java/service/UserService.java
```

### 实体和仓库
```
backend/get_jobs/src/main/java/entity/User.java
backend/get_jobs/src/main/java/repository/UserRepository.java
```

### DTO类
```
backend/get_jobs/src/main/java/dto/RegisterDTO.java
backend/get_jobs/src/main/java/dto/LoginDTO.java
backend/get_jobs/src/main/java/dto/ChangePasswordDTO.java
backend/get_jobs/src/main/java/dto/ResetPasswordDTO.java
```

### 测试文件
```
backend/get_jobs/src/test/java/service/EmailServiceTest.java
backend/get_jobs/src/test/java/service/UserServiceTest.java
backend/get_jobs/src/test/java/controller/AuthControllerTest.java
```

### 文档
```
SPRING_SECURITY_API_DOCUMENTATION.md
MAIL_SERVICE_SETUP_GUIDE.md
```

---

## 🔧 技术栈（全部免费）

### 核心依赖
```xml
<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- Spring Mail -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>

<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>

<!-- JPA（如果使用数据库）-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- MySQL Driver -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

### 邮件服务选项（免费）
- **QQ邮箱**: 免费，`smtp.qq.com:465`
- **163邮箱**: 免费，`smtp.163.com:465`
- **Gmail**: 免费，`smtp.gmail.com:587`

---

## 📝 API接口设计

### 用户注册
```
POST /api/auth/send-verification-code
Body: { "email": "user@example.com" }
Response: { "success": true, "message": "验证码已发送", "expiresIn": 300 }

POST /api/auth/verify-code
Body: { "email": "user@example.com", "code": "123456" }
Response: { "success": true, "message": "验证成功" }

POST /api/auth/register
Body: { 
  "email": "user@example.com", 
  "password": "password123",
  "username": "用户名",
  "verificationCode": "123456"
}
Response: { 
  "success": true, 
  "token": "eyJhbGci...",
  "user": { "userId": 1, "email": "...", "username": "..." }
}
```

### 用户登录
```
POST /api/auth/login
Body: { "email": "user@example.com", "password": "password123" }
Response: { 
  "success": true, 
  "token": "eyJhbGci...",
  "refreshToken": "...",
  "user": { "userId": 1, "email": "...", "username": "..." }
}

POST /api/auth/logout
Headers: { "Authorization": "Bearer token" }
Response: { "success": true, "message": "注销成功" }

POST /api/auth/refresh-token
Body: { "refreshToken": "..." }
Response: { "success": true, "token": "新的token" }
```

### 密码管理
```
POST /api/auth/change-password
Headers: { "Authorization": "Bearer token" }
Body: { "oldPassword": "old123", "newPassword": "new123" }
Response: { "success": true, "message": "密码修改成功" }

POST /api/auth/forgot-password
Body: { "email": "user@example.com" }
Response: { "success": true, "message": "重置邮件已发送" }

POST /api/auth/reset-password
Body: { "token": "reset-token", "newPassword": "new123" }
Response: { "success": true, "message": "密码重置成功" }
```

### 用户信息
```
GET /api/auth/user/info
Headers: { "Authorization": "Bearer token" }
Response: { 
  "success": true, 
  "user": { "userId": 1, "email": "...", "username": "..." }
}

PUT /api/auth/user/info
Headers: { "Authorization": "Bearer token" }
Body: { "username": "新用户名" }
Response: { "success": true, "message": "更新成功" }
```

---

## ✅ 功能检查清单

完成实施后，确保以下功能全部可用：

### 基础功能
- [ ] 用户可以注册新账号
- [ ] 邮箱验证码正常接收
- [ ] 用户可以登录
- [ ] 用户可以注销
- [ ] JWT Token正常生成和验证

### 密码管理
- [ ] 用户可以修改密码
- [ ] 用户可以通过邮件重置密码
- [ ] 密码强度验证正常

### 安全功能
- [ ] 密码BCrypt加密存储
- [ ] SQL注入防护
- [ ] XSS防护
- [ ] CSRF防护
- [ ] 验证码防暴力破解
- [ ] Token过期处理

### 邮件功能
- [ ] 验证码邮件模板美观
- [ ] 重置密码邮件模板美观
- [ ] 欢迎邮件模板美观
- [ ] 邮件发送稳定

---

## 🧪 测试用例

### 注册流程测试
```bash
# 1. 发送验证码
curl -X POST http://localhost:8080/api/auth/send-verification-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@qq.com"}'

# 2. 查收邮件，获取验证码

# 3. 验证验证码
curl -X POST http://localhost:8080/api/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@qq.com","code":"123456"}'

# 4. 注册用户
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@qq.com",
    "password":"Test123456",
    "username":"测试用户",
    "verificationCode":"123456"
  }'
```

### 登录流程测试
```bash
# 登录
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@qq.com","password":"Test123456"}'

# 获取用户信息
curl -X GET http://localhost:8080/api/auth/user/info \
  -H "Authorization: Bearer <token>"

# 注销
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer <token>"
```

---

## 📞 邮件服务配置指南

### 获取QQ邮箱授权码（5分钟）

1. 登录 https://mail.qq.com/
2. 点击【设置】→【账户】
3. 找到【POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务】
4. 开启【POP3/SMTP服务】
5. 点击【生成授权码】
6. 通过手机验证后获得授权码（16位）
7. 保存授权码到`.env`

### 配置示例
```bash
MAIL_HOST=smtp.qq.com
MAIL_PORT=465
MAIL_USERNAME=your-email@qq.com
MAIL_PASSWORD=你的16位授权码
MAIL_FROM=your-email@qq.com
MAIL_FROM_NAME=智投简历
```

---

## 🎯 验收标准

### 功能验收
- [ ] 所有API接口正常工作
- [ ] 邮件正常发送和接收
- [ ] 用户数据正确存储
- [ ] Token认证正常

### 安全验收
- [ ] 密码加密存储
- [ ] Token签名验证
- [ ] 防暴力破解
- [ ] 防SQL注入

### 性能验收
- [ ] 登录响应 < 500ms
- [ ] 注册响应 < 2s
- [ ] 邮件发送 < 5s

---

## 📦 交付成果

完成后您将获得：

1. **完整的认证系统**
   - 注册、登录、注销
   - 邮箱验证
   - 密码管理

2. **稳定的邮件服务**
   - 验证码邮件
   - 重置密码邮件
   - 欢迎邮件

3. **完整的文档**
   - API文档
   - 配置指南
   - 测试报告

4. **高质量代码**
   - 单元测试
   - 集成测试
   - 代码注释

---

## 🚀 立即开始

准备好了吗？告诉我：

**"开始实施"** → 我立即开始阶段1（移除Authing）

或者：

**"先看Demo"** → 我先做一个邮件发送的小Demo给您看

**您的指令？** 🎯

---

**计划生成时间**: 2025-10-10 15:40  
**总工作量**: 24小时（1.5-2天）  
**成本**: ¥0  
**功能完整度**: 100%
