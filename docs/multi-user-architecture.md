# 多用户架构设计文档

## 架构概览

### 设计目标

1. **零影响**：默认单用户模式，不影响现有功能
2. **可扩展**：通过环境变量开关轻松启用多用户
3. **安全隔离**：用户数据完全隔离，防止越权访问
4. **并发支持**：多用户可同时投递，资源有效管理

### 核心组件

```
┌─────────────────────────────────────────────────────────────┐
│                    用户请求（带JWT Token）                     │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────▼──────────────┐
         │ JwtAuthenticationFilter  │  验证Token，提取userId
         └───────────┬──────────────┘
                     │
         ┌───────────▼──────────────┐
         │   UserContextUtil        │  获取当前用户ID
         │  ├─ getCurrentUserId()   │  支持Long→String转换
         │  └─ sanitizeUserId()     │  防止路径遍历攻击
         └───────────┬──────────────┘
                     │
    ┌────────────────┴────────────────┐
    │                                 │
┌───▼────────────┐          ┌────────▼───────────┐
│  WebController │          │ BossLoginController│
│  配置API        │          │  登录API            │
│  ├─ /api/config│          │  ├─ /api/boss/     │
│  └─ 动态路径    │          │  └─ 用户级别锁      │
└────┬───────────┘          └──────┬─────────────┘
     │                              │
┌────▼─────────────────────────────▼────┐
│       BossExecutionService             │
│  ├─ executeBossProgram()               │
│  └─ 传递BOSS_USER_ID环境变量            │
└────────────────┬──────────────────────┘
                 │
     ┌───────────▼──────────────┐
     │    Boss.java (独立进程)   │
     │  ├─ initCookiePath()     │  动态Cookie路径
     │  └─ BossConfig.init()    │  读取用户配置
     └──────────────────────────┘
```

## 用户ID传递流程

### 流程图

```
HTTP请求 → JwtAuthenticationFilter → SecurityContext
                                           │
                                           ▼
                          UserContextUtil.getCurrentUserId()
                                           │
                           ┌───────────────┴──────────────┐
                           │                              │
                    WebController                  BossExecutionService
                           │                              │
                    保存到文件系统                    设置环境变量
                user_data/{userId}/              BOSS_USER_ID={userId}
                           │                              │
                           │                              ▼
                           │                        Boss.java进程
                           │                              │
                           │                    BossConfig.tryLoadUserConfig()
                           │                              │
                           └──────────────┬───────────────┘
                                          │
                                   读取同一个配置文件
                              user_data/{userId}/config.json
```

### 关键点说明

1. **Web请求层**：通过JWT Token传递用户身份
2. **Service层**：从SecurityContext获取userId
3. **文件系统层**：按userId创建独立目录
4. **Boss进程层**：通过环境变量接收userId

## 数据存储结构

### 目录结构

```
user_data/
├── default_user/              # 默认用户（单用户模式）
│   ├── config.json           # 配置文件
│   ├── resume.json           # 简历数据
│   └── resume.txt            # 简历文本
├── default_user.backup/       # 数据迁移备份
│   └── （与default_user相同结构）
├── user_1/                    # 首个注册用户（继承自default_user）
│   ├── config.json
│   ├── resume.json
│   └── resume.txt
├── user_2/                    # 第二个用户
│   ├── config.json
│   └── resume.json
└── user_N/                    # 第N个用户
    └── ...
```

### Cookie文件结构

```
/tmp/
├── boss_cookies.json              # 默认用户Cookie
├── boss_cookies_user_1.json       # 用户1的Cookie
├── boss_cookies_user_2.json       # 用户2的Cookie
└── boss_qrcode.png                # 二维码（共享，但登录后分用户存储）
```

## 关键代码模块

### 1. UserContextUtil - 用户上下文工具

**位置**：`backend/get_jobs/src/main/java/util/UserContextUtil.java`

**核心方法**：

```java
// 获取当前用户ID（支持多种类型转换）
public static String getCurrentUserId() {
    // 从SecurityContext获取
    // Long → "user_12345"
    // String → 原样返回
    // null → "default_user"
}

// 安全验证用户ID
public static String sanitizeUserId(String userId) {
    // 清理特殊字符
    // 防止路径遍历（..、/、\）
    // 只允许：[a-zA-Z0-9_-]
}
```

**使用示例**：

```java
String userId = UserContextUtil.getCurrentUserId();
userId = UserContextUtil.sanitizeUserId(userId);
String configPath = "user_data/" + userId + "/config.json";
```

### 2. BossConfig - 配置加载模块

**位置**：`backend/get_jobs/src/main/java/boss/BossConfig.java`

**多用户支持**：

```java
private static BossConfig tryLoadUserConfig() {
    // 1. 从环境变量获取用户ID
    String userId = System.getenv("BOSS_USER_ID");

    // 2. 如果未设置，使用default_user（向后兼容）
    if (userId == null || userId.isEmpty()) {
        userId = "default_user";
    }

    // 3. 加载用户配置
    String configPath = "user_data/" + userId + "/config.json";
    // ...
}
```

### 3. BossLoginController - 登录控制器

**位置**：`backend/get_jobs/src/main/java/controller/BossLoginController.java`

**多用户并发控制**：

```java
// 用户级别的登录状态锁
private static final Map<String, Boolean> userLoginStatus = new ConcurrentHashMap<>();
private static final Map<String, Long> userLoginStartTime = new ConcurrentHashMap<>();

@PostMapping("/start")
public ResponseEntity<Map<String, Object>> startLogin() {
    String userId = UserContextUtil.getCurrentUserId();

    // 检查该用户是否已在登录中
    Boolean inProgress = userLoginStatus.getOrDefault(userId, false);
    if (inProgress) {
        // 拒绝重复登录
    }

    // 标记该用户登录开始
    userLoginStatus.put(userId, true);
    // ...
}
```

### 4. Boss.java - Cookie路径隔离

**位置**：`backend/get_jobs/src/main/java/boss/Boss.java`

**动态Cookie路径**：

```java
static String cookiePath = initCookiePath();

private static String initCookiePath() {
    String userId = System.getenv("BOSS_USER_ID");
    if (userId == null || userId.isEmpty()) {
        return "/tmp/boss_cookies.json";  // 单用户
    }
    return "/tmp/boss_cookies_" + userId + ".json";  // 多用户
}
```

## 新增功能模块

### UserDataMigrationService - 数据迁移服务

**位置**：`backend/get_jobs/src/main/java/service/UserDataMigrationService.java`

**功能**：

- ✅ 自动迁移default_user数据到首个用户
- ✅ 迁移前自动备份
- ✅ 支持回滚
- ✅ 更新配置文件中的userId

**触发时机**：

```java
// AuthController.register()方法中
if (userCount == 1 && migrationService.shouldMigrate()) {
    String targetUserId = "user_" + user.getUserId();
    migrationService.migrateDefaultUserData(targetUserId);
}
```

## 并发控制策略

### 登录并发控制

**机制**：用户级别的锁（Map<userId, Boolean>）

**优点**：
- ✅ 用户A和用户B可同时登录
- ✅ 同一用户不能并发登录
- ✅ 支持超时自动释放（10分钟）

**实现**：

```java
// BossLoginController.java
private static final Map<String, Boolean> userLoginStatus = new ConcurrentHashMap<>();

// 定时任务清理超时锁
@Scheduled(fixedRate = 60000)  // 每分钟执行
public void checkLoginTimeout() {
    for (Map.Entry<String, Boolean> entry : userLoginStatus.entrySet()) {
        String userId = entry.getKey();
        // 检查超时并释放锁
    }
}
```

### 投递并发控制

**机制**：全局并发数限制

**配置**：`.env`文件中的`MAX_CONCURRENT_DELIVERIES=5`

**实现**：（计划中，尚未实现）

```java
// AutoDeliveryController.java
int currentDeliveries = BossExecutionService.getActiveDeliveriesCount();
if (currentDeliveries >= MAX_CONCURRENT_DELIVERIES) {
    return ResponseEntity.status(429).body(...);
}
```

## 安全机制

### 1. 路径遍历防护

**威胁**：恶意用户ID如`../etc/passwd`可能访问系统文件

**防护**：

```java
public static String sanitizeUserId(String userId) {
    // 1. 只保留安全字符
    String cleaned = userId.replaceAll("[^a-zA-Z0-9_-]", "_");

    // 2. 检测路径遍历
    if (cleaned.contains("..") || cleaned.startsWith("/")) {
        throw new SecurityException("非法的用户ID格式");
    }

    return cleaned;
}
```

**测试用例**：

```java
sanitizeUserId("../etc/passwd")  → SecurityException ✅
sanitizeUserId("/etc/passwd")    → SecurityException ✅
sanitizeUserId("user@123")       → "user_123" ✅
```

### 2. JWT认证

**流程**：

1. 用户登录 → 服务器生成JWT Token
2. 客户端保存Token到localStorage
3. 后续请求携带Token → JwtAuthenticationFilter验证
4. 验证通过 → 从Token提取userId → 设置SecurityContext
5. Controller通过UserContextUtil获取userId

**Token内容**：

```json
{
  "sub": "user@example.com",
  "userId": 1,
  "email": "user@example.com",
  "username": "User Name",
  "type": "access_token",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### 3. 用户数据隔离

**隔离层级**：

| 层级 | 隔离方式 | 示例 |
|------|---------|------|
| 配置文件 | 按userId创建独立目录 | `user_data/user_1/config.json` |
| Cookie | 按userId命名文件 | `/tmp/boss_cookies_user_1.json` |
| 日志文件 | 按userId命名 | `/tmp/boss_delivery_user_1.log` |
| Browser实例 | 独立进程+环境变量 | `BOSS_USER_ID=user_1` |

## 扩展开发指南

### 添加新的用户级别资源

**步骤**：

1. 在UserContextUtil添加路径方法：

```java
public static String getUserXxxPath() {
    String userId = getCurrentUserId();
    return getSafeUserDataPath() + "/xxx_file.json";
}
```

2. 在Controller中使用：

```java
String xxxPath = UserContextUtil.getUserXxxPath();
File xxxFile = new File(xxxPath);
// 读写操作
```

3. 在Boss程序中使用（如需要）：

```java
String userId = System.getenv("BOSS_USER_ID");
String xxxPath = "user_data/" + userId + "/xxx_file.json";
```

### 添加新的API接口

**模板**：

```java
@GetMapping("/api/your-endpoint")
public ResponseEntity<?> yourEndpoint() {
    try {
        // 1. 获取用户ID
        String userId = UserContextUtil.getCurrentUserId();
        userId = UserContextUtil.sanitizeUserId(userId);

        // 2. 构建用户数据路径
        String dataPath = "user_data/" + userId + "/your_data.json";

        // 3. 业务逻辑
        // ...

        // 4. 返回结果
        return ResponseEntity.ok(Map.of(
            "success", true,
            "userId", userId,  // 返回userId供前端确认
            "data", yourData
        ));

    } catch (SecurityException e) {
        // 安全验证失败
        return ResponseEntity.status(400).body(
            Map.of("success", false, "message", "安全验证失败")
        );
    } catch (Exception e) {
        // 其他错误
        return ResponseEntity.status(500).body(
            Map.of("success", false, "message", e.getMessage())
        );
    }
}
```

## 性能优化建议

### 1. Browser实例池

**当前**：每次投递创建新Browser，完成后销毁

**优化方向**：

```java
// 为每个用户维护一个Browser实例池
private static final Map<String, Browser> userBrowserPool = new ConcurrentHashMap<>();

public Browser getBrowserForUser(String userId) {
    return userBrowserPool.computeIfAbsent(userId, id -> {
        return PlaywrightUtil.initBrowser(false);
    });
}

// 定时清理空闲Browser（超过30分钟未使用）
@Scheduled(fixedRate = 300000)  // 5分钟
public void cleanupIdleBrowsers() {
    // 检查并关闭空闲Browser
}
```

### 2. 配置缓存

**当前**：每次请求都从文件读取

**优化方向**：

```java
// 使用Caffeine缓存
@Cacheable(value = "userConfig", key = "#userId")
public Map<String, Object> getUserConfig(String userId) {
    // 读取配置
}

// 保存配置时清除缓存
@CacheEvict(value = "userConfig", key = "#userId")
public void saveUserConfig(String userId, Map<String, Object> config) {
    // 保存配置
}
```

## 监控和日志

### 关键日志点

1. **用户ID获取**：

```java
log.debug("获取当前用户ID（Long转String）: {}", userId);
```

2. **环境变量传递**：

```java
log.info("📋 已设置Boss程序环境变量: BOSS_USER_ID={}", userId);
```

3. **配置加载**：

```java
log.info("✅ 从环境变量获取用户ID: BOSS_USER_ID={}", userId);
log.info("✅ 从文件加载用户配置: userId={}, path={}", userId, configPath);
```

4. **并发控制**：

```java
log.warn("用户{}登录流程已在进行中，拒绝重复启动", userId);
log.info("用户{}登录流程开始，已设置锁", userId);
```

### 监控指标

| 指标 | 说明 | 告警阈值 |
|------|------|---------|
| 并发登录用户数 | userLoginStatus.size() | >10 |
| 并发投递用户数 | userTasks.size() | >5 |
| 内存使用 | 每用户约500MB | >80% |
| 配置读取耗时 | 应<100ms | >1s |

## 故障排查

### 问题1：用户ID始终返回default_user

**排查步骤**：

1. 检查SECURITY_ENABLED配置：

```bash
grep SECURITY_ENABLED /opt/zhitoujianli/backend/.env
```

2. 检查JWT Token是否有效：

```bash
# 解码Token查看内容
echo "eyJhbGc..." | base64 -d
```

3. 检查日志：

```bash
tail -100 /opt/zhitoujianli/backend/logs/app.log | grep UserContextUtil
```

### 问题2：Boss程序未使用正确的用户配置

**排查步骤**：

1. 检查环境变量是否传递：

```bash
tail -100 /tmp/boss_login.log | grep BOSS_USER_ID
```

2. 检查配置文件是否存在：

```bash
ls -la /opt/zhitoujianli/backend/user_data/user_1/config.json
```

3. 检查BossConfig日志：

```bash
tail -100 /tmp/boss_login.log | grep "加载用户配置"
```

### 问题3：Cookie文件冲突

**排查步骤**：

1. 检查Cookie文件：

```bash
ls -la /tmp/boss_cookies*.json
```

2. 检查initCookiePath日志：

```bash
tail -100 /tmp/boss_login.log | grep "Cookie路径"
```

3. 手动清理：

```bash
rm -f /tmp/boss_cookies_*.json
```

## 向后兼容性

### 保持单用户模式正常工作

**措施**：

1. ✅ 环境变量默认值 `SECURITY_ENABLED=false`
2. ✅ userId缺失时返回 `"default_user"`
3. ✅ BOSS_USER_ID未设置时使用 `"default_user"`
4. ✅ Cookie路径默认 `/tmp/boss_cookies.json`
5. ✅ 保留全局锁机制（向后兼容）

### 升级路径

**从单用户到多用户**：

```
1. 修改.env：SECURITY_ENABLED=true
2. 重启服务
3. 首个用户注册 → 自动迁移数据
4. 后续用户注册 → 独立配置
```

**回退到单用户**：

```
1. 修改.env：SECURITY_ENABLED=false
2. 重启服务
3. 系统立即恢复单用户模式
4. 已注册用户数据保留（不影响）
```

## 代码审查清单

在添加新的用户级别功能时，检查：

- [ ] 是否使用 `UserContextUtil.getCurrentUserId()` 获取用户ID？
- [ ] 是否使用 `sanitizeUserId()` 进行安全验证？
- [ ] 文件路径是否按userId隔离？
- [ ] 是否处理SECURITY_ENABLED=false的情况？
- [ ] 是否添加了适当的日志？
- [ ] 异常处理是否完整？
- [ ] 是否更新了相关文档？

## 未来规划

### Phase 1（已完成）

- [x] 基础多用户架构
- [x] 配置隔离
- [x] Cookie隔离
- [x] 数据迁移

### Phase 2（计划中）

- [ ] Browser实例池（性能优化）
- [ ] 配置缓存（减少文件IO）
- [ ] 并发投递限流
- [ ] 用户配额管理（限制每日投递数）

### Phase 3（长期）

- [ ] 多租户支持（团队账号）
- [ ] 数据库存储配置（替代文件系统）
- [ ] 实时协作（WebSocket广播）
- [ ] 审计日志分析（用户行为追踪）

