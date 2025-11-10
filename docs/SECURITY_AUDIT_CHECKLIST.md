# 智投简历 - 上线前安全检查清单 v1.0

> **目标**: 确保生产环境零安全漏洞
> **作者**: ZhiTouJianLi Team
> **更新时间**: 2025-11-05

---

## 🎯 使用说明

**检查方式**：
- ✅ 已完成
- ❌ 未完成
- ⚠️  需要注意
- N/A 不适用

**检查频率**：
- 上线前：必须全部通过
- 每月：重新审查高危项
- 每季度：完整审查

---

## 1️⃣ 认证与授权安全 🔐

### 1.1 JWT认证

- [ ] JWT密钥长度 ≥ 32字符
- [ ] JWT密钥从环境变量读取，不硬编码
- [ ] JWT过期时间合理设置（建议24小时）
- [ ] Token刷新机制已实现
- [ ] 验证失败返回401状态码
- [ ] Token包含userId且不可伪造

**验证命令**：

```bash
# 检查JWT配置
grep "JWT_SECRET" /etc/zhitoujianli/backend.env
grep "jwt.secret" /root/zhitoujianli/backend/get_jobs/src/main/resources/application.yml

# 尝试未认证访问
curl -v http://localhost:8080/api/user/profile  # 应返回401
```

### 1.2 用户权限隔离

- [ ] `SECURITY_ENABLED=true` 已启用
- [ ] 删除了 `default_user` fallback
- [ ] UserContextUtil 抛出 SecurityException 而非返回默认值
- [ ] 所有API调用自动验证userId
- [ ] DataIsolationAspect 已启用

**验证命令**：

```bash
# 检查安全配置
grep "SECURITY_ENABLED" /etc/zhitoujianli/backend.env

# 检查代码
grep -A 5 "default_user" /root/zhitoujianli/backend/get_jobs/src/main/java/util/UserContextUtil.java
# 应该看到 throw SecurityException，而不是 return "default_user"
```

### 1.3 多租户数据隔离

- [ ] 所有Repository查询都通过AOP拦截
- [ ] 用户A无法访问用户B的数据
- [ ] 文件上传路径包含userId隔离
- [ ] 配置文件路径使用sanitizeUserId()清理
- [ ] 运行了MultiTenantIsolationTest测试

**验证测试**：

```bash
cd /root/zhitoujianli/backend/get_jobs
mvn test -Dtest=MultiTenantIsolationTest
```

---

## 2️⃣ 输入验证与注入防护 🛡️

### 2.1 SQL注入防护

- [ ] 使用JPA Repository，不拼接SQL
- [ ] Native Query使用参数化查询
- [ ] 用户输入不直接用于数据库查询
- [ ] @Query注解使用命名参数

**验证代码示例**：

```java
// ✅ 正确
@Query("SELECT u FROM User u WHERE u.email = :email")
Optional<User> findByEmail(@Param("email") String email);

// ❌ 错误
@Query("SELECT u FROM User u WHERE u.email = '" + email + "'")
```

### 2.2 路径遍历防护

- [ ] 所有userId使用sanitizeUserId()清理
- [ ] 文件上传路径不允许".."
- [ ] 禁止访问系统目录（/etc, /root等）

**验证测试**：

```bash
# 尝试路径遍历攻击
curl -X POST http://localhost:8080/api/candidate-resume/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/etc/passwd;filename=../../etc/passwd"
# 应该被拒绝
```

### 2.3 XSS防护

- [ ] 前端使用React自动转义
- [ ] API返回的HTML使用DOMPurify清理
- [ ] CSP头已配置
- [ ] 用户输入不直接渲染为HTML

**验证CSP**：

```bash
curl -I https://zhitoujianli.com | grep -i "Content-Security-Policy"
# 应该看到CSP头
```

---

## 3️⃣ 网络安全 🌐

### 3.1 HTTPS/TLS

- [ ] 生产环境强制HTTPS
- [ ] SSL证书有效且未过期
- [ ] 禁用TLS 1.0/1.1，仅允许TLS 1.2+
- [ ] HTTP自动重定向到HTTPS

**验证命令**：

```bash
# 检查SSL证书
curl -vI https://zhitoujianli.com 2>&1 | grep "SSL certificate"

# 测试HTTP重定向
curl -I http://zhitoujianli.com  # 应返回301/302到HTTPS
```

### 3.2 CORS配置

- [ ] CORS仅允许官方域名（不使用"*"）
- [ ] AllowedHeaders明确列出，不使用"*"
- [ ] AllowCredentials=true时验证Origin
- [ ] 生产环境不允许localhost

**验证代码**：

```java
// 检查 SecurityConfig.java
corsConfig.setAllowedOriginPatterns(java.util.Arrays.asList(
    "https://zhitoujianli.com",
    "https://www.zhitoujianli.com"
));  // ✅ 正确，明确列出
```

### 3.3 CSRF防护

- [ ] API使用JWT，已禁用CSRF
- [ ] Web表单启用CSRF Token
- [ ] 敏感操作二次验证

---

## 4️⃣ 敏感信息保护 🔒

### 4.1 密钥管理

- [ ] 所有密钥从环境变量读取
- [ ] 代码中无硬编码密钥
- [ ] .env文件不提交到Git
- [ ] .env文件权限 = 600

**验证命令**：

```bash
# 检查文件权限
ls -l /etc/zhitoujianli/backend.env  # 应显示 -rw-------

# 搜索代码中的硬编码密钥（应无结果）
grep -r "api_key\s*=\s*\"sk-" /root/zhitoujianli/backend/
```

### 4.2 日志安全

- [ ] 日志不输出用户密码
- [ ] 日志不输出JWT Token
- [ ] 日志不输出API密钥
- [ ] 错误消息不泄露系统路径

**验证日志**：

```bash
# 检查日志中是否有敏感信息
grep -E "(password|token|api[_-]?key)" /opt/zhitoujianli/logs/zhitoujianli.log | head -n 10
# 应该没有明文密钥
```

### 4.3 数据加密

- [ ] 数据库连接使用SSL（如需要）
- [ ] 用户密码使用BCrypt加密
- [ ] 敏感字段数据库加密存储

---

## 5️⃣ 会话与Cookie安全 🍪

### 5.1 Cookie配置

- [ ] Cookie设置HttpOnly标记
- [ ] Cookie设置Secure标记（HTTPS）
- [ ] Cookie设置SameSite=Strict/Lax
- [ ] Cookie设置合理过期时间

**验证代码**：

```typescript
// 前端 authService.ts
cookieAttributes.push('Secure');  // ✅
cookieAttributes.push('HttpOnly'); // ⚠️ 前端JS无法设置，需后端
cookieAttributes.push('SameSite=Strict');  // ✅
```

### 5.2 会话管理

- [ ] 使用无状态JWT，不依赖服务器会话
- [ ] Token过期后自动登出
- [ ] 登出时清除所有Token

---

## 6️⃣ 多租户数据隔离 🏢

### 6.1 数据隔离验证

- [ ] 用户A登录后无法查询用户B的简历
- [ ] 用户A登录后无法查询用户B的配额
- [ ] 用户A登录后无法启动用户B的投递任务
- [ ] 未认证用户无法访问任何用户数据

**自动化测试**：

```bash
cd /root/zhitoujianli/backend/get_jobs
mvn test -Dtest=MultiTenantIsolationTest
# 所有测试应通过
```

### 6.2 文件隔离验证

- [ ] 用户简历文件存储在 `user_data/{userId}/`
- [ ] 无法通过URL猜测访问其他用户文件
- [ ] 文件上传大小限制（10MB）
- [ ] 文件类型白名单验证

---

## 7️⃣ API安全 🔌

### 7.1 速率限制

- [ ] 登录接口限制：5次/分钟
- [ ] API调用限制：100次/分钟
- [ ] 文件上传限制：10次/小时
- [ ] 使用Spring RateLimiter或Redis

**TODO**: 需实现

```java
@RateLimiter(name = "login", fallbackMethod = "rateLimitFallback")
public LoginResponse login(String email, String password) {
    // ...
}
```

### 7.2 API版本控制

- [ ] API包含版本号（如 /api/v1/）
- [ ] 旧版本有弃用通知
- [ ] 新旧版本兼容性测试

### 7.3 错误处理

- [ ] 统一错误响应格式
- [ ] 错误消息不泄露敏感信息
- [ ] 生产环境不返回堆栈跟踪

**验证**：

```bash
# 故意触发错误
curl -X POST http://localhost:8080/api/invalid-endpoint
# 不应返回完整堆栈跟踪
```

---

## 8️⃣ 前端安全 💻

### 8.1 Token存储

- [ ] Token存储在httpOnly Cookie（后端设置）
- [ ] 不使用localStorage存储敏感Token
- [ ] 前端刷新时自动获取新Token

### 8.2 前端路由保护

- [ ] 使用PrivateRoute组件
- [ ] 未登录自动跳转登录页
- [ ] Token失效自动登出

**验证代码**：

```tsx
// App.tsx
<Route path="/dashboard" element={
  <PrivateRoute>
    <Dashboard />
  </PrivateRoute>
} />
```

---

## 9️⃣ 依赖安全 📦

### 9.1 后端依赖

- [ ] 运行 `mvn dependency:tree` 检查依赖
- [ ] 无已知CVE漏洞依赖
- [ ] 定期更新依赖版本

**检查命令**：

```bash
cd /root/zhitoujianli/backend/get_jobs
mvn versions:display-dependency-updates
mvn dependency-check:check  # 需安装OWASP插件
```

### 9.2 前端依赖

- [ ] 运行 `npm audit` 检查漏洞
- [ ] 修复高危漏洞
- [ ] 定期运行 `npm audit fix`

**检查命令**：

```bash
cd /root/zhitoujianli/frontend
npm audit
# 应该0 vulnerabilities
```

---

## 🔟 服务器与运维安全 🖥️

### 10.1 系统加固

- [ ] SSH禁用密码登录，仅允许密钥
- [ ] 防火墙仅开放必要端口（80,443,22）
- [ ] 系统补丁及时更新
- [ ] 禁用root远程登录

**验证命令**：

```bash
# 检查SSH配置
grep "PasswordAuthentication" /etc/ssh/sshd_config  # 应为 no

# 检查防火墙
sudo ufw status
```

### 10.2 数据库安全

- [ ] PostgreSQL仅监听localhost
- [ ] 数据库密码强度 ≥ 16字符
- [ ] 定期自动备份（每日）
- [ ] 备份文件加密存储

**验证配置**：

```bash
# 检查PostgreSQL监听地址
sudo grep "listen_addresses" /etc/postgresql/14/main/postgresql.conf
# 应为 'localhost'
```

### 10.3 日志与审计

- [ ] 启用审计日志记录
- [ ] 记录所有登录尝试
- [ ] 记录敏感操作（删除、导出数据）
- [ ] 日志集中存储，防篡改

---

## 1️⃣1️⃣ 监控与告警 📊

### 11.1 安全监控

- [ ] 监控异常登录（短时间多次失败）
- [ ] 监控SQL注入尝试
- [ ] 监控API异常流量
- [ ] 监控数据库连接异常

### 11.2 告警配置

- [ ] 认证失败 > 10次/分钟 → 告警
- [ ] API 5xx错误 > 50次/分钟 → 告警
- [ ] 磁盘使用率 > 80% → 告警
- [ ] 数据库连接池耗尽 → 告警

---

## ✅ 上线前最终确认

### 关键项（必须全部通过）

- [ ] `SECURITY_ENABLED=true`
- [ ] 所有密钥已更换为生产密钥
- [ ] 删除了`default_user` fallback
- [ ] 多租户隔离测试通过
- [ ] HTTPS证书有效
- [ ] 数据库备份脚本已配置
- [ ] 回滚方案已测试
- [ ] 监控和告警已配置

### 签字确认

| 角色 | 姓名 | 签字 | 日期 |
|------|------|------|------|
| 安全负责人 | ___ | ___ | ___ |
| 后端负责人 | ___ | ___ | ___ |
| 运维负责人 | ___ | ___ | ___ |
| 项目负责人 | ___ | ___ | ___ |

---

## 📞 安全事件响应

如果发现安全漏洞：

1. **立即**：隔离受影响系统
2. **5分钟内**：通知安全负责人
3. **30分钟内**：评估影响范围
4. **2小时内**：修复并部署补丁
5. **24小时内**：完成事后分析报告

**紧急联系方式**: [填写]

---

**祝上线顺利！** 🚀

