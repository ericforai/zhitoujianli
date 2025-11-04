# 📋 监控告警 + Redis缓存 - 实施计划

**创建时间**: 2025-11-03 13:10
**预计工作量**: 监控2天 + Redis 4小时
**优先级**: P1（强烈建议）

---

## 📊 现状分析

### 已有基础

✅ **Spring Boot Actuator** - 已在pom.xml中配置
✅ **Prometheus配置** - application.yml已配置端点
✅ **HikariCP监控** - 数据库连接池监控已启用

### 缺失部分

❌ **Micrometer依赖** - 需要添加
❌ **Prometheus服务** - 未部署
❌ **Grafana可视化** - 未部署
❌ **告警规则** - 未配置
❌ **Redis** - 完全未配置

---

## 🎯 实施策略

### 方案选择

**监控告警**: 采用 Prometheus + Grafana（行业标准）
**Redis缓存**: 采用 Spring Data Redis + Lettuce（官方推荐）

---

## 📋 详细实施计划

### 阶段1: Redis缓存实施（4小时）

**优先做Redis的原因**:
- 工作量小（4小时 vs 2天）
- 立即见效（性能提升）
- 不依赖外部服务

#### Step 1.1: 添加Redis依赖（10分钟）

**修改**: `pom.xml`

```xml
<!-- Redis缓存支持 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- Lettuce客户端（默认，性能优于Jedis） -->
<dependency>
    <groupId>io.lettuce</groupId>
    <artifactId>lettuce-core</artifactId>
</dependency>
```

---

#### Step 1.2: 配置Redis连接（15分钟）

**修改**: `application.yml`

```yaml
spring:
  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD:}
    database: ${REDIS_DATABASE:0}
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 2
        max-wait: 3000ms
      shutdown-timeout: 100ms
    timeout: 3000ms
```

---

#### Step 1.3: 创建UserRedisService（1小时）

**新建**: `service/UserRedisService.java`

**功能**:
- ✅ 自动添加用户前缀到所有Redis key
- ✅ 提供get/set/delete等操作
- ✅ 确保多租户隔离

```java
@Service
@Slf4j
public class UserRedisService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * 生成用户专属key
     * 格式: user:{userId}:{resource}
     */
    private String getUserKey(String resource) {
        String userId = UserContextUtil.getCurrentUserId();
        String safeUserId = UserContextUtil.sanitizeUserId(userId);
        return "user:" + safeUserId + ":" + resource;
    }

    /**
     * 保存数据（自动隔离）
     */
    public void set(String resource, Object value) {
        String key = getUserKey(resource);
        redisTemplate.opsForValue().set(key, value);
        log.debug("✅ Redis SET: key={}", key);
    }

    /**
     * 保存数据（带过期时间）
     */
    public void setWithExpire(String resource, Object value, long seconds) {
        String key = getUserKey(resource);
        redisTemplate.opsForValue().set(key, value, seconds, TimeUnit.SECONDS);
        log.debug("✅ Redis SET with TTL: key={}, ttl={}s", key, seconds);
    }

    /**
     * 读取数据
     */
    public <T> T get(String resource, Class<T> clazz) {
        String key = getUserKey(resource);
        Object value = redisTemplate.opsForValue().get(key);
        log.debug("✅ Redis GET: key={}, found={}", key, value != null);
        return clazz.cast(value);
    }

    /**
     * 删除数据
     */
    public void delete(String resource) {
        String key = getUserKey(resource);
        redisTemplate.delete(key);
        log.debug("✅ Redis DELETE: key={}", key);
    }

    /**
     * 检查key是否存在
     */
    public boolean exists(String resource) {
        String key = getUserKey(resource);
        Boolean exists = redisTemplate.hasKey(key);
        return exists != null && exists;
    }

    /**
     * 增加计数器
     */
    public Long increment(String resource) {
        String key = getUserKey(resource);
        return redisTemplate.opsForValue().increment(key);
    }

    /**
     * 设置过期时间
     */
    public void expire(String resource, long seconds) {
        String key = getUserKey(resource);
        redisTemplate.expire(key, seconds, TimeUnit.SECONDS);
    }
}
```

---

#### Step 1.4: 应用Redis缓存（1.5小时）

**场景1: 缓存用户配置**

```java
@Service
public class UserConfigCache {

    @Autowired
    private UserRedisService redis;

    @Autowired
    private UserDataService userDataService;

    /**
     * 获取用户配置（带缓存）
     */
    public Map<String, Object> getUserConfig() {
        // 1. 尝试从Redis读取
        Map config = redis.get("config", Map.class);

        if (config != null) {
            log.debug("✅ 从Redis缓存读取配置");
            return config;
        }

        // 2. 缓存未命中，从文件读取
        config = userDataService.loadUserConfig();

        // 3. 写入Redis缓存（5分钟过期）
        if (config != null) {
            redis.setWithExpire("config", config, 300);
        }

        return config;
    }

    /**
     * 保存配置（更新缓存）
     */
    public void saveUserConfig(Map<String, Object> config) {
        // 1. 保存到文件
        userDataService.saveUserConfig(config);

        // 2. 更新Redis缓存
        redis.setWithExpire("config", config, 300);
    }
}
```

**场景2: API限流（按用户）**

```java
@Service
public class RateLimitService {

    @Autowired
    private UserRedisService redis;

    /**
     * 检查是否超过限流
     */
    public boolean checkRateLimit(String action, int maxRequests, int windowSeconds) {
        String resource = "ratelimit:" + action;

        Long count = redis.increment(resource);

        if (count == 1) {
            // 首次请求，设置过期时间
            redis.expire(resource, windowSeconds);
        }

        if (count > maxRequests) {
            log.warn("⚠️ 用户超过限流: action={}, count={}/{}", action, count, maxRequests);
            return false;
        }

        return true;
    }
}
```

---

#### Step 1.5: Redis测试（30分钟）

**新建**: `src/test/java/redistest/RedisIsolationTest.java`

```java
@SpringBootTest(classes = com.superxiang.WebApplication.class)
public class RedisIsolationTest extends BaseMultiTenantTest {

    @Autowired
    private UserRedisService redis;

    @Test
    public void testRedisKeyIsolation() {
        // 用户A保存数据
        loginAs(testUserA);
        redis.set("test_data", "user_a_value");

        // 用户B保存数据
        loginAs(testUserB);
        redis.set("test_data", "user_b_value");

        // 用户A读取（应该是自己的）
        loginAs(testUserA);
        String valueA = redis.get("test_data", String.class);
        assertEquals("user_a_value", valueA);

        // 用户B读取（应该是自己的）
        loginAs(testUserB);
        String valueB = redis.get("test_data", String.class);
        assertEquals("user_b_value", valueB);

        System.out.println("✅ Redis隔离测试通过");
    }
}
```

---

### 阶段2: 监控告警实施（2天）

#### Step 2.1: 添加Micrometer依赖（10分钟）

**修改**: `pom.xml`

```xml
<!-- Micrometer Prometheus -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

---

#### Step 2.2: 创建自定义指标（2小时）

**新建**: `config/MetricsConfig.java`

```java
@Configuration
public class MetricsConfig {

    @Bean
    public MeterRegistryCustomizer<MeterRegistry> metricsCommonTags() {
        return registry -> registry.config()
            .commonTags("application", "zhitoujianli");
    }
}
```

**新建**: `aspect/MetricsAspect.java`

```java
@Aspect
@Component
@Slf4j
public class MetricsAspect {

    @Autowired
    private MeterRegistry meterRegistry;

    /**
     * 监控API调用
     */
    @Around("@annotation(org.springframework.web.bind.annotation.PostMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.GetMapping)")
    public Object monitorApiCall(ProceedingJoinPoint pjp) throws Throwable {
        String methodName = pjp.getSignature().getName();
        Timer.Sample sample = Timer.start(meterRegistry);

        try {
            Object result = pjp.proceed();

            sample.stop(Timer.builder("api.calls")
                .tag("method", methodName)
                .tag("result", "success")
                .register(meterRegistry));

            return result;
        } catch (Exception e) {
            sample.stop(Timer.builder("api.calls")
                .tag("method", methodName)
                .tag("result", "error")
                .register(meterRegistry));
            throw e;
        }
    }

    /**
     * 监控多租户访问
     */
    @Around("execution(* service..*(..))")
    public Object monitorDataAccess(ProceedingJoinPoint pjp) throws Throwable {
        try {
            String userId = UserContextUtil.getCurrentUserId();

            // 记录用户活跃度
            meterRegistry.counter("user.activity",
                "userId", userId,
                "service", pjp.getTarget().getClass().getSimpleName()
            ).increment();

            return pjp.proceed();
        } catch (UnauthorizedException e) {
            // 记录未授权访问
            meterRegistry.counter("security.unauthorized").increment();
            throw e;
        }
    }
}
```

---

#### Step 2.3: 部署Prometheus（2小时）

**创建**: `docker-compose.monitoring.yml`

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: zhitoujianli-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    restart: unless-stopped
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: zhitoujianli-grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    restart: unless-stopped
    networks:
      - monitoring
    depends_on:
      - prometheus

  alertmanager:
    image: prom/alertmanager:latest
    container_name: zhitoujianli-alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager-data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    restart: unless-stopped
    networks:
      - monitoring

volumes:
  prometheus-data:
  grafana-data:
  alertmanager-data:

networks:
  monitoring:
    driver: bridge
```

---

#### Step 2.4: Prometheus配置（30分钟）

**创建**: `monitoring/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

# 告警规则文件
rule_files:
  - '/etc/prometheus/alerts/*.yml'

# Alertmanager配置
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

# 抓取配置
scrape_configs:
  # 智投简历后端
  - job_name: 'zhitoujianli-backend'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['host.docker.internal:8080']
        labels:
          service: 'backend'
          environment: 'production'
```

---

#### Step 2.5: 告警规则配置（1小时）

**创建**: `monitoring/alerts/multi-tenant-security.yml`

```yaml
groups:
  - name: multi_tenant_security
    interval: 30s
    rules:
      # 检测跨租户访问
      - alert: CrossTenantAccessDetected
        expr: increase(security_cross_tenant_access_total[5m]) > 0
        for: 1m
        labels:
          severity: critical
          category: security
        annotations:
          summary: "检测到跨租户数据访问！"
          description: "在过去5分钟内检测到{{ $value }}次跨租户访问尝试"

      # 未授权访问过多
      - alert: TooManyUnauthorizedAccess
        expr: rate(security_unauthorized_total[5m]) > 10
        for: 5m
        labels:
          severity: warning
          category: security
        annotations:
          summary: "未授权访问过多"
          description: "过去5分钟平均每分钟{{ $value }}次未授权访问"
```

**创建**: `monitoring/alerts/performance.yml`

```yaml
groups:
  - name: performance
    interval: 30s
    rules:
      # API响应时间过长
      - alert: SlowAPIResponse
        expr: histogram_quantile(0.95, rate(api_calls_seconds_bucket[5m])) > 5
        for: 5m
        labels:
          severity: warning
          category: performance
        annotations:
          summary: "API响应时间过长"
          description: "95%的API请求响应时间超过5秒"

      # 数据库连接池耗尽
      - alert: DatabaseConnectionPoolExhausted
        expr: hikaricp_connections_active / hikaricp_connections_max > 0.9
        for: 5m
        labels:
          severity: critical
          category: database
        annotations:
          summary: "数据库连接池即将耗尽"
          description: "当前活跃连接{{ $value | humanizePercentage }}"
```

**创建**: `monitoring/alerts/availability.yml`

```yaml
groups:
  - name: availability
    interval: 30s
    rules:
      # 服务宕机
      - alert: ServiceDown
        expr: up{job="zhitoujianli-backend"} == 0
        for: 1m
        labels:
          severity: critical
          category: availability
        annotations:
          summary: "后端服务宕机！"
          description: "智投简历后端服务已停止响应超过1分钟"

      # JVM内存使用率高
      - alert: HighMemoryUsage
        expr: (jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}) > 0.9
        for: 5m
        labels:
          severity: warning
          category: resource
        annotations:
          summary: "JVM内存使用率过高"
          description: "堆内存使用率：{{ $value | humanizePercentage }}"
```

---

#### Step 2.6: Grafana Dashboard（1小时）

**创建**: `monitoring/grafana/dashboards/zhitoujianli-overview.json`

**包含面板**:
1. **系统概览**
   - 在线用户数
   - API调用总数
   - 平均响应时间
   - 错误率

2. **多租户安全**
   - 跨租户访问次数
   - 未授权访问次数
   - 用户活跃度分布

3. **性能指标**
   - API响应时间（P50, P95, P99）
   - 数据库连接池状态
   - Redis缓存命中率

4. **资源使用**
   - CPU使用率
   - 内存使用率
   - JVM Heap使用率
   - 磁盘使用率

---

## ⏱️ 实施时间表

### Day 1 (4小时) - Redis缓存

```
09:00-09:30  添加Redis依赖和配置
09:30-10:30  创建UserRedisService
10:30-12:00  应用Redis缓存到配置、简历等模块
12:00-12:30  编写Redis隔离测试
```

### Day 2 (4小时) - 监控基础

```
09:00-10:00  添加Micrometer依赖和自定义指标
10:00-11:00  创建监控切面（API、安全、性能）
11:00-12:00  部署Prometheus
12:00-13:00  配置告警规则
```

### Day 3 (4小时) - 可视化和告警

```
09:00-10:30  部署Grafana
10:30-12:00  创建Dashboard
12:00-13:00  配置Alertmanager和通知渠道
13:00-13:30  测试告警
```

**总计**: 12小时 (1.5天)

---

## 📚 详细文档位置

完整实施计划将保存在：
- 本文档: `MONITORING_AND_REDIS_PLAN.md`
- Redis实施详情: (执行时创建)
- 监控实施详情: (执行时创建)

---

**计划创建完成，准备开始执行**






