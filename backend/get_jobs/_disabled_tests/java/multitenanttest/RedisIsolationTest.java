package multitenanttest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

import service.UserRedisService;
import service.RateLimitService;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Redis多租户隔离测试
 * 验证：Redis缓存按用户隔离，用户A的缓存不会被用户B看到
 *
 * 注意：此测试需要Redis服务运行
 * 如果Redis未配置，测试将被跳过
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-03
 */
@ConditionalOnProperty(name = "spring.redis.host")
public class RedisIsolationTest extends BaseMultiTenantTest {

    @Autowired(required = false)
    private UserRedisService redis;

    @Autowired(required = false)
    private RateLimitService rateLimitService;

    @Test
    public void testRedisKeyIsolation_DifferentUsersDifferentKeys() {
        // 如果Redis未配置，跳过测试
        if (redis == null) {
            System.out.println("⚠️  Redis未配置，跳过测试");
            return;
        }

        System.out.println("\n📋 测试：Redis Key隔离 - 不同用户有不同的key");

        // 1. 用户A保存数据
        loginAs(testUserA);
        redis.set("test_data", "value_from_user_a");
        System.out.println("✅ 用户A保存数据到Redis");

        // 2. 用户B保存相同key的不同数据
        loginAs(testUserB);
        redis.set("test_data", "value_from_user_b");
        System.out.println("✅ 用户B保存数据到Redis");

        // 3. 用户A读取（应该是自己的数据）
        loginAs(testUserA);
        String valueA = redis.get("test_data", String.class);
        assertEquals("value_from_user_a", valueA,
            "用户A应该读取到自己的数据");
        System.out.println("✅ 用户A读取到正确的数据: " + valueA);

        // 4. 用户B读取（应该是自己的数据，不是用户A的）
        loginAs(testUserB);
        String valueB = redis.get("test_data", String.class);
        assertEquals("value_from_user_b", valueB,
            "用户B应该读取到自己的数据");
        System.out.println("✅ 用户B读取到正确的数据: " + valueB);

        // 5. 验证数据确实不同
        assertNotEquals(valueA, valueB,
            "用户A和用户B的数据应该不同");

        System.out.println("🎉 测试通过：Redis Key完全隔离");
    }

    @Test
    public void testRedisCacheForConfig() {
        if (redis == null) {
            System.out.println("⚠️  Redis未配置，跳过测试");
            return;
        }

        System.out.println("\n📋 测试：Redis缓存 - 配置数据缓存");

        // 1. 用户A保存配置到缓存
        loginAs(testUserA);
        Map<String, Object> configA = new HashMap<>();
        configA.put("keywords", "Java");
        configA.put("salary", "20K");
        redis.setWithExpire("config", configA, 60);
        System.out.println("✅ 用户A保存配置到Redis（60秒TTL）");

        // 2. 验证缓存存在
        assertTrue(redis.exists("config"), "配置缓存应该存在");

        // 3. 读取缓存
        @SuppressWarnings("unchecked")
        Map<String, Object> cached = redis.get("config", Map.class);
        assertNotNull(cached, "应该能从缓存读取配置");
        assertEquals("Java", cached.get("keywords"));
        System.out.println("✅ 从Redis读取配置成功");

        // 4. 用户B登录（应该读不到用户A的缓存）
        loginAs(testUserB);
        assertFalse(redis.exists("config"), "用户B不应看到用户A的缓存");
        System.out.println("✅ 用户B无法访问用户A的缓存");

        System.out.println("🎉 测试通过：Redis缓存隔离正常");
    }

    @Test
    public void testRateLimitIsolation() {
        if (rateLimitService == null) {
            System.out.println("⚠️  Redis未配置，跳过限流测试");
            return;
        }

        System.out.println("\n📋 测试：限流隔离 - 每个用户独立限流");

        // 1. 用户A调用API（限制：5次/60秒）
        loginAs(testUserA);

        for (int i = 0; i < 5; i++) {
            boolean allowed = rateLimitService.checkRateLimit("api_test", 5, 60);
            assertTrue(allowed, "前5次请求应该被允许");
        }
        System.out.println("✅ 用户A前5次请求通过");

        // 第6次应该被限流
        boolean blocked = rateLimitService.checkRateLimit("api_test", 5, 60);
        assertFalse(blocked, "第6次请求应该被限流");
        System.out.println("✅ 用户A第6次请求被限流");

        // 2. 用户B调用相同API（应该有自己独立的限流计数）
        loginAs(testUserB);

        boolean allowedB = rateLimitService.checkRateLimit("api_test", 5, 60);
        assertTrue(allowedB, "用户B的首次请求应该被允许（独立计数）");
        System.out.println("✅ 用户B有独立的限流计数");

        System.out.println("🎉 测试通过：限流按用户隔离");
    }
}




