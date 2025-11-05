# 智投简历 - 强制多租户架构规则

**版本**: v2.1.3-multitenant-secured
**生效日期**: 2025-11-04
**优先级**: CRITICAL（最高优先级，不可违反）

---

## ⚠️ 核心原则

本项目采用**强制多租户SaaS架构**，这是系统的基础架构，**绝对不允许在任何情况下禁用**。

### 强制性要求

1. **SECURITY_ENABLED永久启用**
   - 配置文件：`/etc/zhitoujianli/backend.env`
   - 值：`SECURITY_ENABLED=true`
   - ❌ **禁止设置为false**
   - ❌ **禁止添加禁用开关**

2. **用户认证强制要求**
   - 所有数据操作必须基于当前登录用户
   - 未登录用户无法访问任何配置或数据
   - API返回401 JSON响应：`{"success": false, "message": "需要登录认证"}`

3. **用户数据完全隔离**
   - 每个用户的数据独立存储在：`user_data/{userId}/`
   - 配置文件：`user_data/{userId}/config.json`
   - AI配置：`user_data/{userId}/ai_config.json`
   - 简历数据：`user_data/{userId}/resume/`

4. **禁止default_user**
   - ❌ 不允许使用`default_user`作为fallback
   - ❌ 不允许在未登录时使用默认用户
   - ❌ Boss程序必须传递`BOSS_USER_ID`环境变量

---

## 📂 代码实现规范

### 1. UserDataService.java

**强制要求用户认证：**

```java
public boolean saveUserConfig(Map<String, Object> config) {
    // ✅ 强制要求用户认证（多租户核心功能）
    try {
        if (!UserContextUtil.hasCurrentUser()) {
            log.error("❌ 用户未登录，无法保存配置（多租户模式强制要求认证）");
            return false;
        }
        userId = UserContextUtil.getCurrentUserId();
        // ... 用户数据操作
    } catch (Exception e) {
        log.error("❌ 获取用户信息失败", e);
        return false;
    }
}
```

**❌ 禁止的代码模式：**

```java
// ❌ 禁止！不允许检查securityEnabled
boolean securityEnabled = dotenv.get("SECURITY_ENABLED", "true");

// ❌ 禁止！不允许default_user fallback
if (!securityEnabled) {
    userId = "default_user"; // ❌ 绝对禁止！
}
```

---

### 2. BossConfig.java

**强制要求用户ID：**

```java
private static BossConfig tryLoadUserConfig() {
    String userId = System.getenv("BOSS_USER_ID");

    // ⚠️ 多租户模式 - 必须提供用户ID
    if (userId == null || userId.isEmpty()) {
        log.error("❌ 未检测到BOSS_USER_ID环境变量，多租户模式必须提供用户ID！");
        return null;
    }

    String userConfigPath = "user_data/" + userId + "/config.json";
    // ... 加载用户配置
}
```

**❌ 禁止的代码模式：**

```java
// ❌ 禁止！不允许default_user fallback
if (userId == null || userId.isEmpty()) {
    userId = "default_user"; // ❌ 绝对禁止！
}
```

---

### 3. SimpleSecurityConfig.java

**多租户核心API必须认证：**

```java
.requestMatchers(
    "/api/delivery/**",                     // 投递配置接口（多租户核心）
    "/api/candidate-resume/**",             // 简历管理接口（多租户核心）
    "/api/config",                          // 用户配置
    "/api/ai-config"                        // AI配置
).authenticated()
```

**❌ 禁止的配置：**

```java
// ❌ 禁止！多租户核心API不允许公开访问
.requestMatchers(
    "/api/delivery/**",      // ❌ 绝对禁止设置为permitAll！
    "/api/config"            // ❌ 绝对禁止设置为permitAll！
).permitAll()
```

---

### 4. DeliveryConfigController.java

**字段映射（前后端兼容）：**

后端存储格式（Boss程序兼容）：

```json
{
  "boss": {
    "sayHi": "测试打招呼语",
    "keywords": ["市场总监"],
    "cityCode": ["上海"],
    "expectedSalary": [30, 50]
  }
}
```

前端期待格式：

```json
{
  "bossConfig": {
    "defaultGreeting": "测试打招呼语",
    "keywords": ["市场总监"],
    "cities": ["上海"],
    "salaryRange": { "minSalary": 30, "maxSalary": 50, "unit": "K" }
  }
}
```

**实现：** 通过`transformBossConfigFields()`自动映射

---

## 🔐 安全架构

### API认证流程

1. **前端发送请求** → 携带JWT Token
2. **JwtAuthenticationFilter拦截** → 验证Token
3. **UserContextUtil获取用户** → 设置SecurityContext
4. **Controller处理请求** → 基于当前用户操作数据
5. **返回用户隔离的数据** → 仅返回该用户的数据

### 未登录用户处理

**API请求（JSON）**：

```json
HTTP 401 Unauthorized
{
  "success": false,
  "message": "需要登录认证",
  "redirectTo": "/login"
}
```

**浏览器请求（HTML）**：

```
HTTP 302 Found
Location: /login
```

---

## 🚫 绝对禁止的操作

### 代码层面

1. ❌ **禁止添加`SECURITY_ENABLED=false`检查逻辑**
2. ❌ **禁止使用`default_user`作为fallback**
3. ❌ **禁止将多租户核心API设置为`permitAll()`**
4. ❌ **禁止在未认证情况下返回任何用户数据**
5. ❌ **禁止跨用户数据访问**

### 配置层面

1. ❌ **禁止设置`SECURITY_ENABLED=false`**
2. ❌ **禁止移除JWT认证配置**
3. ❌ **禁止禁用Spring Security**
4. ❌ **禁止移除用户数据目录隔离**

### 运维层面

1. ❌ **禁止手动修改其他用户的数据目录**
2. ❌ **禁止在生产环境使用default_user**
3. ❌ **禁止禁用数据库用户隔离（未来）**

---

## ✅ 开发者检查清单

在提交代码前，请确认：

- [ ] 所有新增的数据操作都检查了`UserContextUtil.hasCurrentUser()`
- [ ] 没有使用`default_user`或类似的fallback逻辑
- [ ] 没有添加`SECURITY_ENABLED`相关的条件判断
- [ ] 新增的API端点在`SimpleSecurityConfig`中正确配置了认证
- [ ] 用户数据存储路径使用`UserContextUtil.getUserConfigPath()`
- [ ] 日志中包含userId信息，便于调试和审计

---

## 📝 代码审查要点

在审查代码时，重点检查：

1. **用户认证检查**
   - 是否有`UserContextUtil.hasCurrentUser()`检查？
   - 是否有适当的错误处理？

2. **数据隔离**
   - 数据存储路径是否包含userId？
   - 是否使用了用户特定的配置文件？

3. **安全配置**
   - 新API是否正确配置了认证？
   - 是否有绕过认证的逻辑？

4. **日志记录**
   - 关键操作是否记录了userId？
   - 错误日志是否包含足够的上下文？

---

## 🔄 数据迁移指南

### 从单用户模式迁移到多租户模式

如果系统之前使用了`default_user`，需要进行数据迁移：

1. **备份数据**

   ```bash
   cp -r user_data/default_user user_data/default_user_backup
   ```

2. **为真实用户创建目录**

   ```bash
   mkdir -p user_data/{realUserId}/
   ```

3. **迁移配置文件**

   ```bash
   cp user_data/default_user/config.json user_data/{realUserId}/config.json
   ```

4. **更新配置中的userId字段**

   ```bash
   # 编辑config.json，将userId从"default_user"改为真实用户ID
   ```

5. **删除default_user数据**（⚠️ 确认迁移成功后）
   ```bash
   rm -rf user_data/default_user
   ```

---

## 🎯 未来扩展规划

### 数据库多租户隔离

当引入数据库时，必须实现：

1. **行级安全（Row Level Security）**

   ```sql
   CREATE POLICY tenant_isolation ON user_data
   USING (user_id = current_user_id());
   ```

2. **查询拦截器**
   ```java
   @Component
   public class TenantQueryInterceptor {
       @Around("@annotation(TenantIsolated)")
       public Object addTenantFilter(ProceedingJoinPoint jp) {
           String userId = UserContextUtil.getCurrentUserId();
           // 自动添加WHERE user_id = ?条件
       }
   }
   ```

### 跨租户数据共享（仅限管理员）

如果需要管理员查看所有用户数据：

```java
@PreAuthorize("hasRole('ADMIN')")
public List<UserConfig> getAllUserConfigs() {
    // 仅管理员可访问
}
```

---

## 📚 相关文档

- [部署指南](/opt/zhitoujianli/docs/DEPLOYMENT_GUIDE.md)
- [API文档](/root/zhitoujianli/backend/get_jobs/API_DOCUMENTATION.md)
- [安全规范](/root/zhitoujianli/SECURITY_GUIDELINES.md)

---

## 🆘 问题排查

### Q1: API返回"用户未登录"错误

**原因**: JWT Token未携带或已过期

**解决方案**:

```javascript
// 前端确保携带Token
axios.get('/api/delivery/config/config', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
  },
});
```

### Q2: Boss程序报错"未检测到BOSS_USER_ID"

**原因**: 环境变量未传递

**解决方案**:

```java
// 在启动Boss程序前设置环境变量
ProcessBuilder pb = new ProcessBuilder();
pb.environment().put("BOSS_USER_ID", userId);
```

### Q3: 用户数据混乱，出现other用户的数据

**原因**: 代码中可能存在数据隔离漏洞

**解决方案**:

1. 检查代码是否使用了`default_user`
2. 检查是否正确调用`UserContextUtil.getCurrentUserId()`
3. 检查数据存储路径是否包含userId

---

## 📌 最后提醒

**这不是一个可选功能，这是系统的基础架构！**

任何违反本文档规则的代码修改都将被**立即拒绝**。

如有疑问，请参考本文档或咨询架构负责人。

---

**文档版本**: v1.0
**最后更新**: 2025-11-04
**维护者**: ZhiTouJianLi Team
**审核状态**: ✅ 已审核通过
