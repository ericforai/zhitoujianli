# ⚡ 多租户安全问题 - 快速修复指南

> **紧急度**: 🔴 立即执行
> **预计工作量**: 2-3天
> **影响范围**: 核心业务功能

---

## 🎯 修复目标

**当前状态**: 🔴 存在数据混乱风险
**目标状态**: ✅ 每个用户数据完全隔离

---

## 🔴 P0 - 今日必修（严重问题）

### 1. Boss Cookie 存储隔离

**问题文件**: `backend/get_jobs/src/main/java/controller/BossCookieController.java`

**当前代码**:
```java
// ❌ 问题：所有用户共享一个cookie.json
private static final String COOKIE_FILE_PATH = "src/main/java/boss/cookie.json";
```

**修复代码**:
```java
@PostMapping("/cookie")
public Map<String, Object> saveCookie(@RequestBody Map<String, Object> request) {
    // ✅ 获取当前用户ID
    String userId = UserContextUtil.getCurrentUserId();
    String cookiePath = String.format("user_data/%s/boss_cookie.json",
        UserContextUtil.sanitizeUserId(userId));

    // ✅ 创建用户专属目录
    File cookieFile = new File(cookiePath);
    cookieFile.getParentFile().mkdirs();

    // 保存Cookie...
}
```

**同步修改**:
- `backend/get_jobs/src/main/java/boss/Boss.java` 的 `initCookiePath()` 方法
- `backend/get_jobs/src/main/java/boss/BossConfig.java` 的Cookie加载逻辑

**验证方法**:
```bash
# 测试：两个用户登录，检查是否创建了独立的cookie文件
ls -la user_data/user_123/boss_cookie.json
ls -la user_data/user_456/boss_cookie.json
```

---

### 2. 移除 default_user fallback

**问题文件**: `backend/get_jobs/src/main/java/util/UserContextUtil.java`

**当前代码**:
```java
// ❌ 问题：未登录时返回default_user，导致多用户共享数据
public static String getCurrentUserId() {
    // ...
    return "default_user";
}
```

**修复代码**:
```java
public static String getCurrentUserId() {
    try {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
            && !"anonymousUser".equals(authentication.getPrincipal())) {

            if (authentication.getPrincipal() instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> userInfo = (Map<String, Object>) authentication.getPrincipal();

                Object userIdObj = userInfo.get("userId");
                if (userIdObj != null) {
                    return convertToUserId(userIdObj);
                }
            }
        }
    } catch (Exception e) {
        log.error("获取当前用户ID失败", e);
    }

    // ✅ 修复：未登录时抛出异常
    throw new UnauthorizedException("用户未登录，请先登录");
}

// ✅ 兼容开发环境的安全降级方法
public static String getCurrentUserIdOrDefault() {
    try {
        return getCurrentUserId();
    } catch (UnauthorizedException e) {
        // 仅在非生产环境且安全认证禁用时允许
        if (!isProductionEnvironment() && !isSecurityEnabled()) {
            log.warn("⚠️ 开发模式：使用default_user（生产环境将抛出异常）");
            return "default_user";
        }
        throw e;
    }
}
```

**需要同步修改的文件**:
```bash
# 搜索所有使用 getCurrentUserId 的地方，判断是否需要改用 getCurrentUserIdOrDefault
grep -r "getCurrentUserId()" backend/get_jobs/src/main/java/
```

**修复清单**:
- [ ] `service/UserDataService.java` - 配置加载逻辑
- [ ] `controller/BossCookieController.java` - Cookie保存逻辑
- [ ] `boss/Boss.java` - 数据路径初始化
- [ ] 所有Controller - 验证是否需要处理UnauthorizedException

---

### 3. Boss任务用户上下文传递

**问题文件**: `backend/get_jobs/src/main/java/controller/WebController.java`

**当前代码**:
```java
// ❌ 问题：异步任务丢失用户上下文
CompletableFuture.runAsync(() -> {
    BossScheduled.startNow(config);  // SecurityContext丢失
});
```

**修复代码**:
```java
@PostMapping("/runBoss")
public Map<String, Object> runBoss(@RequestBody Map<String, Object> config) {
    // ✅ 在主线程获取用户上下文
    String userId = UserContextUtil.getCurrentUserId();
    String userEmail = UserContextUtil.getCurrentUserEmail();
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();

    CompletableFuture.runAsync(() -> {
        try {
            // ✅ 在异步线程中恢复用户上下文
            SecurityContextHolder.getContext().setAuthentication(auth);

            log.info("🚀 启动Boss任务: userId={}", userId);

            // ✅ 传递userId到Boss任务
            config.put("userId", userId);
            config.put("userEmail", userEmail);

            BossScheduled.startNow(config);

        } finally {
            SecurityContextHolder.clearContext();
        }
    });
}
```

**Boss.java 修改**:
```java
// 新增：支持传入userId
public static void startNowWithUserId(String userId, Map<String, Object> config) {
    // 设置当前用户上下文
    System.setProperty("current.user.id", userId);

    // 使用用户专属的数据路径
    dataPath = "user_data/" + sanitizeUserId(userId);
    cookiePath = dataPath + "/boss_cookie.json";

    // 原有逻辑...
}
```

---

## 🟠 P1 - 明日必修（高危问题）

### 4. 收紧JWT Filter白名单

**问题文件**: `backend/get_jobs/src/main/java/filter/JwtAuthenticationFilter.java`

**当前代码**:
```java
// ❌ 问题：整个模块都跳过认证
return path.startsWith("/api/boss/") ||
       path.startsWith("/api/delivery/") ||
       path.startsWith("/api/candidate-resume/");
```

**修复代码**:
```java
@Override
protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getRequestURI();

    // ✅ 仅以下路径无需认证
    return path.equals("/api/auth/login") ||
           path.equals("/api/auth/register") ||
           path.equals("/api/auth/send-verification-code") ||
           path.equals("/api/auth/verify-code") ||
           path.equals("/api/health") ||
           path.equals("/status") ||
           path.equals("/favicon.ico");

    // ✅ 所有其他API都需要JWT Token
}
```

**Spring Security配置同步修改**:
```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated()  // ✅ 默认需要认证
        );
}
```

---

### 5. 统一 userId 类型

**影响文件**:
- `entity/User.java` - `Long userId`
- `entity/UserPlan.java` - `String userId` ❌
- `entity/LoginLog.java` - `Long userId`
- `entity/UserAuditLog.java` - `Long userId`

**修复方案**:

**方案A: 全部改为Long（推荐）**
```java
@Entity
@Table(name = "user_plans")
public class UserPlan {
    // ✅ 改为Long类型
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // ✅ 添加外键关联
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
}
```

**数据库迁移SQL**:
```sql
-- 检查现有数据
SELECT user_id, COUNT(*) FROM user_plans GROUP BY user_id;

-- 如果有String格式的userId（如"user_12345"），先转换
UPDATE user_plans SET user_id = CAST(REPLACE(user_id, 'user_', '') AS BIGINT);

-- 修改列类型
ALTER TABLE user_plans ALTER COLUMN user_id TYPE BIGINT USING user_id::BIGINT;

-- 添加外键约束
ALTER TABLE user_plans
ADD CONSTRAINT fk_user_plans_user
FOREIGN KEY (user_id) REFERENCES users(user_id);
```

---

## 🟡 P2 - 本周内修复（中危问题）

### 6. 实现 Hibernate Filter 自动租户过滤

**新建文件**: `backend/get_jobs/src/main/java/config/TenantFilterConfig.java`

```java
@Configuration
public class TenantFilterConfig {

    @Bean
    public FilterRegistrationBean<TenantFilter> tenantFilter() {
        FilterRegistrationBean<TenantFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new TenantFilter());
        registrationBean.addUrlPatterns("/api/*");
        return registrationBean;
    }
}

@Component
class TenantFilter implements Filter {
    @Autowired
    private EntityManager entityManager;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        try {
            Long userId = getCurrentUserIdFromRequest((HttpServletRequest) request);
            if (userId != null) {
                Session session = entityManager.unwrap(Session.class);
                Filter filter = session.enableFilter("tenantFilter");
                filter.setParameter("userId", userId);
            }
            chain.doFilter(request, response);
        } finally {
            Session session = entityManager.unwrap(Session.class);
            session.disableFilter("tenantFilter");
        }
    }
}
```

**在Entity上添加Filter定义**:
```java
@Entity
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "userId", type = Long.class))
@Filter(name = "tenantFilter", condition = "user_id = :userId")
public class UserPlan {
    // ...
}
```

---

### 7. 前端LocalStorage清理

**问题文件**: `frontend/src/services/authService.ts`

**修复代码**:
```typescript
class TokenManager {
    /**
     * 清除所有用户相关数据
     */
    static clearAllUserData(): void {
        const protectedKeys = ['app_theme', 'app_language', 'cookie_consent'];

        // 获取所有localStorage keys
        const allKeys = Object.keys(localStorage);

        // 清除非保护的keys
        allKeys.forEach(key => {
            if (!protectedKeys.includes(key)) {
                localStorage.removeItem(key);
            }
        });

        // 清除所有cookies
        document.cookie.split(";").forEach(cookie => {
            const [name] = cookie.split("=");
            document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });

        console.log('🧹 已清除所有用户数据');
    }
}
```

---

## 📋 完整执行清单

### Day 1 - Boss Cookie隔离
- [ ] 修改 `BossCookieController.java`
- [ ] 修改 `Boss.java` 的 `initCookiePath()`
- [ ] 修改 `BossConfig.java` 的Cookie加载
- [ ] 测试多用户登录场景
- [ ] 数据迁移：将现有cookie.json迁移到user_data/default_user/

### Day 2 - 移除default_user
- [ ] 修改 `UserContextUtil.java`
- [ ] 创建 `UnauthorizedException`
- [ ] 修改所有使用 `getCurrentUserId()` 的地方
- [ ] 添加环境判断逻辑
- [ ] 全量测试（登录/未登录场景）

### Day 3 - 异步任务上下文传递
- [ ] 修改 `WebController.java` 的 `/runBoss` 方法
- [ ] 修改 `Boss.java` 添加 `startNowWithUserId` 方法
- [ ] 修改 `BossScheduled.java`
- [ ] 测试异步任务执行

### Day 4 - API安全加固
- [ ] 修改 `JwtAuthenticationFilter.java`
- [ ] 更新 `SimpleSecurityConfig.java`
- [ ] 测试所有API端点
- [ ] 更新API文档

### Day 5 - 数据库Schema变更
- [ ] 备份数据库
- [ ] 执行userId类型迁移SQL
- [ ] 修改Entity定义
- [ ] 添加外键约束
- [ ] 回归测试

---

## 🧪 测试验证清单

### 功能测试

```bash
# 1. 多用户Boss Cookie隔离测试
curl -X POST http://localhost:8080/api/boss/cookie \
  -H "Authorization: Bearer <user1_token>" \
  -d '{"zp_token":"token1","session":"session1"}'

curl -X POST http://localhost:8080/api/boss/cookie \
  -H "Authorization: Bearer <user2_token>" \
  -d '{"zp_token":"token2","session":"session2"}'

# 验证：应该创建两个独立的文件
ls user_data/user_*/boss_cookie.json
```

### 安全测试

```bash
# 1. 测试未授权访问
curl http://localhost:8080/api/candidate-resume/load
# ✅ 应返回401 Unauthorized

# 2. 测试跨用户访问
# 用户A上传简历后，用户B不应能访问
```

### 性能测试

```bash
# 1. 并发用户测试
ab -n 100 -c 10 http://localhost:8080/api/boss/cookie
```

---

## 📞 需要帮助？

**问题升级流程**:
1. 检查本指南是否有解决方案
2. 查看完整报告 `MULTI_TENANT_SECURITY_AUDIT_REPORT.md`
3. 提交Issue到项目仓库

**紧急联系**:
- 技术负责人: 立即通知
- 安全团队: 如发现数据泄露

---

**最后更新**: 2025-11-02
**下次审查**: 修复完成后1周

