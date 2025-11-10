# 数据库查询用户隔离修复指南

## 问题

当前系统中，`QuotaService`、`AdminService` 等服务的数据库查询方法标记为 `FIXME`，未实现实际查询逻辑。未来实现时，必须确保所有查询都包含 `userId` 过滤，防止数据泄露。

## 风险

- 如果未来实现数据库查询时忘记添加 `WHERE user_id = ?`，可能导致用户A访问到用户B的数据
- 中等安全风险

## 修复原则

### 🔒 **强制规则：所有用户数据表查询必须包含 userId 过滤**

### 示例1：正确的 JPA Repository 实现

```java
@Repository
public interface UserPlanRepository extends JpaRepository<UserPlan, Long> {

    // ✅ 正确：包含 userId 过滤
    @Query("SELECT up FROM UserPlan up WHERE up.userId = :userId AND up.status = :status")
    Optional<UserPlan> findByUserIdAndStatus(@Param("userId") String userId, @Param("status") PlanStatus status);

    // ✅ 正确：所有查询都包含 userId
    List<UserPlan> findByUserIdOrderByCreatedAtDesc(String userId);

    // ❌ 错误：缺少 userId 过滤（禁止！）
    // List<UserPlan> findAll();  // ← 会返回所有用户的数据！
}
```

### 示例2：QuotaService 修复

**修复前（当前代码）：**

```java
private UserPlan getUserCurrentPlan(String userId) {
    // 先从缓存获取
    UserPlan cachedPlan = userPlanCache.get(userId);
    if (cachedPlan != null && cachedPlan.isValid()) {
        return cachedPlan;
    }

    // FIXME: 从数据库查询用户套餐
    // UserPlan plan = userPlanRepository.findByUserIdAndStatus(userId, PlanStatus.ACTIVE);

    // 临时返回免费套餐
    UserPlan freePlan = createDefaultFreePlan(userId);
    userPlanCache.put(userId, freePlan);

    return freePlan;
}
```

**修复后：**

```java
@Autowired
private UserPlanRepository userPlanRepository;  // ← 新增

private UserPlan getUserCurrentPlan(String userId) {
    // 1. 参数验证
    if (userId == null || userId.isEmpty()) {
        throw new IllegalArgumentException("userId不能为空");
    }

    // 2. 先从缓存获取
    UserPlan cachedPlan = userPlanCache.get(userId);
    if (cachedPlan != null && cachedPlan.isValid()) {
        log.debug("✅ 从缓存获取用户套餐: userId={}", userId);
        return cachedPlan;
    }

    // 3. ✅ 从数据库查询（必须包含 userId 过滤）
    Optional<UserPlan> planOpt = userPlanRepository.findByUserIdAndStatus(userId, PlanStatus.ACTIVE);

    if (planOpt.isPresent()) {
        UserPlan plan = planOpt.get();
        // 4. 更新缓存
        userPlanCache.put(userId, plan);
        log.info("✅ 从数据库加载用户套餐: userId={}, planType={}", userId, plan.getPlanType());
        return plan;
    } else {
        // 5. 如果没有套餐，创建默认免费套餐
        UserPlan freePlan = createDefaultFreePlan(userId);
        userPlanCache.put(userId, freePlan);
        log.info("⚠️ 用户无套餐，使用默认免费套餐: userId={}", userId);
        return freePlan;
    }
}
```

### 示例3：配额使用记录查询

```java
@Repository
public interface UserQuotaUsageRepository extends JpaRepository<UserQuotaUsage, Long> {

    // ✅ 正确：包含 userId 和 quotaId 过滤
    @Query("SELECT uqu FROM UserQuotaUsage uqu " +
           "WHERE uqu.userId = :userId " +
           "AND uqu.quotaId = :quotaId " +
           "AND uqu.periodStart <= :currentDate " +
           "AND uqu.periodEnd >= :currentDate")
    Optional<UserQuotaUsage> findCurrentUsage(
        @Param("userId") String userId,
        @Param("quotaId") Long quotaId,
        @Param("currentDate") LocalDate currentDate
    );

    // ✅ 正确：统计查询也必须包含 userId
    @Query("SELECT SUM(uqu.usedAmount) FROM UserQuotaUsage uqu " +
           "WHERE uqu.userId = :userId " +
           "AND uqu.quotaId = :quotaId " +
           "AND uqu.periodStart >= :startDate")
    Long sumUsageByUserAndQuota(
        @Param("userId") String userId,
        @Param("quotaId") Long quotaId,
        @Param("startDate") LocalDate startDate
    );
}
```

### 示例4：投递记录查询（未来实现）

```java
@Repository
public interface DeliveryRecordRepository extends JpaRepository<DeliveryRecord, Long> {

    // ✅ 查询用户的投递记录
    @Query("SELECT dr FROM DeliveryRecord dr " +
           "WHERE dr.userId = :userId " +
           "ORDER BY dr.createdAt DESC")
    Page<DeliveryRecord> findByUserId(@Param("userId") String userId, Pageable pageable);

    // ✅ 统计用户今日投递数
    @Query("SELECT COUNT(dr) FROM DeliveryRecord dr " +
           "WHERE dr.userId = :userId " +
           "AND dr.createdAt >= :startOfDay " +
           "AND dr.createdAt < :endOfDay")
    Long countTodayDeliveries(
        @Param("userId") String userId,
        @Param("startOfDay") LocalDateTime startOfDay,
        @Param("endOfDay") LocalDateTime endOfDay
    );

    // ✅ 查询用户在特定公司的投递记录
    @Query("SELECT dr FROM DeliveryRecord dr " +
           "WHERE dr.userId = :userId " +
           "AND dr.companyName = :companyName " +
           "ORDER BY dr.createdAt DESC")
    List<DeliveryRecord> findByUserIdAndCompany(
        @Param("userId") String userId,
        @Param("companyName") String companyName
    );
}
```

## Service 层强制规则

### 规则1：所有数据查询方法必须接受 userId 参数

```java
// ✅ 正确：明确接受 userId 参数
public List<DeliveryRecord> getUserDeliveryRecords(String userId, int page, int size) {
    Pageable pageable = PageRequest.of(page, size);
    return deliveryRecordRepository.findByUserId(userId, pageable).getContent();
}

// ❌ 错误：没有 userId 参数（禁止！）
public List<DeliveryRecord> getAllDeliveryRecords(int page, int size) {
    // ❌ 这会返回所有用户的数据！
    return deliveryRecordRepository.findAll(PageRequest.of(page, size)).getContent();
}
```

### 规则2：从 SecurityContext 获取当前用户ID

```java
@Service
public class DeliveryService {

    @Autowired
    private DeliveryRecordRepository deliveryRecordRepository;

    /**
     * 获取当前用户的投递记录
     * ✅ 自动从 SecurityContext 获取 userId，确保安全
     */
    public List<DeliveryRecord> getMyDeliveryRecords(int page, int size) {
        // 1. 从 SecurityContext 获取当前用户ID（已认证）
        String userId = UserContextUtil.getCurrentUserId();

        // 2. 查询当前用户的数据
        Pageable pageable = PageRequest.of(page, size);
        return deliveryRecordRepository.findByUserId(userId, pageable).getContent();
    }

    /**
     * 管理员查询指定用户的投递记录
     * ⚠️ 需要管理员权限验证
     */
    @PreAuthorize("hasRole('ADMIN')")  // ← Spring Security 权限验证
    public List<DeliveryRecord> getUserDeliveryRecordsAsAdmin(String targetUserId, int page, int size) {
        // 1. 验证管理员权限（由 @PreAuthorize 自动验证）

        // 2. 记录审计日志
        String adminUserId = UserContextUtil.getCurrentUserId();
        log.info("🔍 管理员查询用户数据: adminId={}, targetUserId={}", adminUserId, targetUserId);

        // 3. 查询目标用户的数据
        Pageable pageable = PageRequest.of(page, size);
        return deliveryRecordRepository.findByUserId(targetUserId, pageable).getContent();
    }
}
```

## Controller 层强制规则

### 规则1：禁止直接接受前端传递的 userId

```java
@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    // ✅ 正确：不接受 userId 参数，从 SecurityContext 自动获取
    @GetMapping("/my-records")
    public ResponseEntity<List<DeliveryRecord>> getMyRecords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<DeliveryRecord> records = deliveryService.getMyDeliveryRecords(page, size);
        return ResponseEntity.ok(records);
    }

    // ❌ 错误：直接接受前端传递的 userId（禁止！）
    // @GetMapping("/records")
    // public ResponseEntity<List<DeliveryRecord>> getRecords(
    //         @RequestParam String userId,  // ← 前端可以伪造！
    //         @RequestParam(defaultValue = "0") int page,
    //         @RequestParam(defaultValue = "20") int size) {
    //
    //     // ❌ 这会导致用户A可以查询用户B的数据！
    //     return ResponseEntity.ok(deliveryService.getUserDeliveryRecords(userId, page, size));
    // }
}
```

### 规则2：管理员接口必须有权限验证

```java
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")  // ← 全局管理员权限
public class AdminController {

    @Autowired
    private DeliveryService deliveryService;

    // ✅ 正确：管理员查询指定用户数据
    @GetMapping("/users/{userId}/records")
    public ResponseEntity<List<DeliveryRecord>> getUserRecords(
            @PathVariable String userId,  // ← 管理员可以指定 userId
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        // ✅ Service 层会记录审计日志
        List<DeliveryRecord> records = deliveryService.getUserDeliveryRecordsAsAdmin(userId, page, size);
        return ResponseEntity.ok(records);
    }
}
```

## 单元测试规范

### 测试1：验证用户只能访问自己的数据

```java
@SpringBootTest
@AutoConfigureMockMvc
public class DeliveryServiceTest {

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private DeliveryRecordRepository deliveryRecordRepository;

    @Test
    @WithMockUser(username = "user_A@example.com")  // 模拟用户A登录
    public void testUserCanOnlyAccessOwnData() {
        // 1. 准备测试数据
        DeliveryRecord recordA = createRecord("user_A@example.com", "公司A");
        DeliveryRecord recordB = createRecord("user_B@example.com", "公司B");
        deliveryRecordRepository.saveAll(Arrays.asList(recordA, recordB));

        // 2. 用户A查询自己的数据
        List<DeliveryRecord> records = deliveryService.getMyDeliveryRecords(0, 10);

        // 3. 验证结果：只能看到自己的数据
        assertEquals(1, records.size());
        assertEquals("user_A@example.com", records.get(0).getUserId());
        assertEquals("公司A", records.get(0).getCompanyName());

        // 4. 验证：看不到其他用户的数据
        assertFalse(records.stream().anyMatch(r -> r.getUserId().equals("user_B@example.com")));
    }

    @Test
    @WithMockUser(username = "user_B@example.com")  // 模拟用户B登录
    public void testUserBCanOnlyAccessOwnData() {
        // 确保用户B也只能看到自己的数据
        List<DeliveryRecord> records = deliveryService.getMyDeliveryRecords(0, 10);

        assertEquals(1, records.size());
        assertEquals("user_B@example.com", records.get(0).getUserId());
    }
}
```

### 测试2：验证管理员可以查询指定用户数据

```java
@Test
@WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
public void testAdminCanAccessUserData() {
    // 1. 管理员查询用户A的数据
    List<DeliveryRecord> records = deliveryService.getUserDeliveryRecordsAsAdmin("user_A@example.com", 0, 10);

    // 2. 验证：管理员可以看到用户A的数据
    assertEquals(1, records.size());
    assertEquals("user_A@example.com", records.get(0).getUserId());
}

@Test
@WithMockUser(username = "user_A@example.com", roles = {"USER"})  // 普通用户
public void testNormalUserCannotAccessAdminAPI() {
    // 普通用户尝试调用管理员API（应该被拒绝）
    assertThrows(AccessDeniedException.class, () -> {
        deliveryService.getUserDeliveryRecordsAsAdmin("user_B@example.com", 0, 10);
    });
}
```

## 审计日志记录

### 所有敏感操作必须记录审计日志

```java
@Aspect
@Component
@Slf4j
public class DataAccessAuditAspect {

    /**
     * 记录所有数据查询操作
     */
    @Around("@annotation(org.springframework.data.jpa.repository.Query)")
    public Object auditDataAccess(ProceedingJoinPoint joinPoint) throws Throwable {
        // 1. 获取当前用户
        String userId = UserContextUtil.getCurrentUserId();

        // 2. 获取方法信息
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();

        // 3. 记录审计日志
        log.info("📋 数据访问审计: userId={}, method={}, args={}", userId, methodName, args);

        // 4. 执行查询
        Object result = joinPoint.proceed();

        // 5. 记录结果（可选）
        if (result instanceof Collection) {
            log.debug("📋 查询结果数量: {}", ((Collection<?>) result).size());
        }

        return result;
    }
}
```

## 检查清单

实现数据库查询时，请确保：

- [ ] ✅ 所有 Repository 查询方法都包含 `userId` 参数
- [ ] ✅ 所有 Service 方法从 `SecurityContext` 获取 `userId`
- [ ] ✅ Controller 不接受前端直接传递的 `userId`
- [ ] ✅ 管理员接口有 `@PreAuthorize` 权限验证
- [ ] ✅ 编写单元测试验证用户隔离
- [ ] ✅ 记录审计日志
- [ ] ✅ 代码评审时专门检查用户隔离

## 优先级

**P2（中优先级）** - 在实现数据库查询时必须遵守此规范
