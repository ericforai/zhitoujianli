# Boss.java 重构优化规则（2025-11-25）

## 🎯 核心原则（必须遵守）

### 1. 单一职责原则（SRP）

**规则**：每个服务类只负责一个明确的功能域，禁止在Boss.java中直接实现业务逻辑。

**服务类职责划分**：

| 服务类                 | 职责                                             | 文件路径                                 |
| ---------------------- | ------------------------------------------------ | ---------------------------------------- |
| `BossLoginService`     | 登录相关（二维码登录、Cookie管理、登录弹窗处理） | `boss/service/BossLoginService.java`     |
| `BossJobSearchService` | 岗位搜索（URL构建、页面导航、岗位列表滚动）      | `boss/service/BossJobSearchService.java` |
| `BossJobMatcher`       | 岗位匹配（关键词匹配、薪资检查、HR活跃度检查）   | `boss/matcher/BossJobMatcher.java`       |
| `BossDeliveryService`  | 简历投递（投递流程、消息发送、验证、安全点击）   | `boss/service/BossDeliveryService.java`  |
| `BossGreetingService`  | 打招呼语生成（AI生成、默认语、JD提取）           | `boss/service/BossGreetingService.java`  |
| `BossQuotaService`     | 配额管理（配额检查、配额消费、JDBC查询）         | `boss/service/BossQuotaService.java`     |
| `BossBlacklistService` | 黑名单管理（公司黑名单、职位黑名单、配置加载）   | `boss/service/BossBlacklistService.java` |
| `BossBehaviorLogger`   | 用户行为记录（行为日志、验证码通知）             | `boss/service/BossBehaviorLogger.java`   |
| `BossUtils`            | 工具方法（文本处理、薪资解码、字符串验证）       | `boss/util/BossUtils.java`               |

**禁止操作**：

```java
// ❌ 禁止：在Boss.java中直接实现登录逻辑
private void login() {
    // 登录代码...
}

// ✅ 正确：通过服务注入调用
private final BossLoginService loginService;
loginService.login(loginOnly);
```

### 2. 依赖注入原则

**规则**：所有服务必须通过构造函数注入，禁止在方法内部直接实例化服务。

**正确示例**：

```java
public class Boss {
    // ✅ 正确：通过构造函数注入服务
    private final BossLoginService loginService;
    private final BossJobSearchService searchService;
    private final BossJobMatcher jobMatcher;
    private final BossDeliveryService deliveryService;
    private final BossGreetingService greetingService;
    private final BossQuotaService quotaService;
    private final BossBlacklistService blacklistService;
    private final BossBehaviorLogger behaviorLogger;

    public Boss(String userId) {
        // 初始化服务
        this.behaviorLogger = new BossBehaviorLogger(userId);
        this.blacklistService = new BossBlacklistService(userId, this.dataPath);
        this.quotaService = new BossQuotaService(userId);
        this.greetingService = new BossGreetingService(this.config, userId);
        this.jobMatcher = new BossJobMatcher(this.config);
        this.searchService = new BossJobSearchService(this.config);
        this.loginService = new BossLoginService(userId, this.cookiePath, this.behaviorLogger);
        this.deliveryService = new BossDeliveryService(
            this.config, userId, this.greetingService,
            this.blacklistService, this.behaviorLogger, this.loginService);
    }
}
```

**禁止操作**：

```java
// ❌ 禁止：在方法内部直接实例化服务
public void execute(boolean loginOnly) {
    BossLoginService loginService = new BossLoginService(...); // ❌ 错误
    loginService.login(loginOnly);
}

// ❌ 禁止：使用静态方法调用业务逻辑
BossLoginService.login(...); // ❌ 错误
```

### 3. 向后兼容原则

**规则**：保持 `Boss.main()` 和 `Boss.execute()` 接口不变，确保现有调用代码无需修改。

**必须保持的接口**：

```java
// ✅ 必须保持：main方法接口不变
public static void main(String[] args) {
    // 实现可以改变，但接口签名必须保持不变
}

// ✅ 必须保持：execute方法接口不变
public void execute(boolean loginOnly) {
    // 实现可以改变，但接口签名必须保持不变
}
```

**已废弃方法处理**：

```java
// ✅ 正确：标记为@Deprecated，保留向后兼容
@Deprecated
private void oldMethod() {
    // 内部调用新服务
    newService.newMethod();
}
```

### 4. 文件大小控制

**规则**：Boss.java 文件大小应控制在 2500 行以内，超过时应考虑进一步拆分。

**当前状态**：

- 重构前：4070 行
- 重构后：2359 行
- 目标：< 2500 行

**拆分策略**：

- 如果单个方法超过 200 行，考虑拆分为多个私有方法
- 如果多个相关方法超过 500 行，考虑提取为新的服务类
- 如果工具方法超过 300 行，考虑迁移到 `BossUtils`

### 5. 测试覆盖要求

**规则**：每个服务类必须有对应的单元测试，测试覆盖率应 ≥ 60%。

**测试文件命名**：

- `BossLoginService` → `BossLoginServiceTest.java`
- `BossJobSearchService` → `BossJobSearchServiceTest.java`
- `BossJobMatcher` → `BossJobMatcherTest.java`
- `BossDeliveryService` → `BossDeliveryServiceTest.java`
- `BossGreetingService` → `BossGreetingServiceTest.java`
- `BossQuotaService` → `BossQuotaServiceTest.java`
- `BossBlacklistService` → `BossBlacklistServiceTest.java`
- `BossBehaviorLogger` → `BossBehaviorLoggerTest.java`
- `BossUtils` → `BossUtilsTest.java`

**测试要求**：

- 使用 Mock 模拟外部依赖（Playwright、数据库、文件系统）
- 使用 `@ParameterizedTest` 覆盖多种场景
- 使用 `@DisplayName` 提供清晰的测试描述
- 集成测试标记为 `@Disabled`（需要真实环境）

## 📋 开发检查清单

### 新增功能时

- [ ] 确定功能属于哪个服务类
- [ ] 如果不存在合适的服务类，创建新的服务类
- [ ] 在Boss.java中通过服务注入调用，而不是直接实现
- [ ] 为新服务类添加单元测试
- [ ] 更新相关文档

### 修改现有功能时

- [ ] 检查功能是否已迁移到服务类
- [ ] 如果已迁移，修改对应的服务类
- [ ] 如果未迁移，先迁移到服务类，再修改
- [ ] 更新相关测试
- [ ] 确保向后兼容性

### 重构代码时

- [ ] 遵循单一职责原则
- [ ] 使用依赖注入，避免直接实例化
- [ ] 保持接口向后兼容
- [ ] 添加/更新单元测试
- [ ] 运行所有测试确保通过

## 🚫 绝对禁止的操作

1. **禁止在Boss.java中直接实现业务逻辑**

   ```java
   // ❌ 禁止
   private void login() { /* 登录代码 */ }

   // ✅ 正确
   loginService.login(loginOnly);
   ```

2. **禁止在方法内部直接实例化服务**

   ```java
   // ❌ 禁止
   public void execute() {
       BossLoginService service = new BossLoginService(...);
   }

   // ✅ 正确
   private final BossLoginService loginService; // 构造函数注入
   ```

3. **禁止修改Boss.main()和Boss.execute()的接口签名**

   ```java
   // ❌ 禁止：修改参数
   public static void main(String[] args, String extraParam) { }

   // ✅ 正确：保持接口不变
   public static void main(String[] args) { }
   ```

4. **禁止在服务类之间直接依赖**

   ```java
   // ❌ 禁止：服务类之间直接依赖
   public class BossDeliveryService {
       private BossLoginService loginService = new BossLoginService(...);
   }

   // ✅ 正确：通过构造函数注入
   public class BossDeliveryService {
       private final BossLoginService loginService;
       public BossDeliveryService(..., BossLoginService loginService) {
           this.loginService = loginService;
       }
   }
   ```

5. **禁止创建超过500行的服务类**
   - 如果服务类超过500行，考虑进一步拆分
   - 将相关功能提取为子服务或工具类

## ✅ 代码审查标准

### 必须检查项

1. **职责清晰**：每个服务类只负责一个功能域
2. **依赖注入**：所有服务通过构造函数注入
3. **向后兼容**：main()和execute()接口未改变
4. **测试覆盖**：每个服务类都有对应的单元测试
5. **文件大小**：Boss.java < 2500行，服务类 < 500行

### 代码质量指标

- **圈复杂度**：单个方法 < 10
- **代码行数**：Boss.java < 2500行，服务类 < 500行
- **测试覆盖率**：≥ 60%
- **编译警告**：0个错误，警告 < 10个

## 📚 参考文档

- **重构方案**：`backend/get_jobs/Boss.java重构拆分方案.plan.md`
- **部署清单**：`backend/get_jobs/DEPLOYMENT_CHECKLIST.md`
- **测试总结**：`backend/get_jobs/TESTING_SUMMARY.md`

## 🔄 版本历史

- **v2.1.0** (2025-11-25)：初始重构完成
  - Boss.java 从 4070行 减少到 2359行
  - 创建 9 个服务类
  - 添加 112 个单元测试
  - 集成 JaCoCo 覆盖率检查

---

**🤖 AI提醒：每次开发Boss.java相关代码时，必须遵守以上规则！**

**🚨 铁律：单一职责 + 依赖注入 + 向后兼容 + 测试覆盖！**

