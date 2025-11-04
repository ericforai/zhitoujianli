package service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * API限流服务
 * ✅ 使用Redis实现分布式限流
 * ✅ 自动按用户隔离
 *
 * 示例：
 * - 限制每个用户每分钟最多调用100次API
 * - 限制每个用户每小时最多投递50次
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-03
 */
@Service
@Slf4j
public class RateLimitService {

    @Autowired
    private UserRedisService redis;

    /**
     * 检查是否超过限流
     *
     * @param action 操作类型（如：api_call, delivery）
     * @param maxRequests 最大请求数
     * @param windowSeconds 时间窗口（秒）
     * @return true=允许访问，false=超过限流
     */
    public boolean checkRateLimit(String action, int maxRequests, int windowSeconds) {
        try {
            String resource = "ratelimit:" + action;

            // 原子递增计数器
            Long count = redis.increment(resource);

            if (count == null) {
                log.warn("⚠️  Redis increment返回null");
                return true; // 降级：允许访问
            }

            if (count == 1) {
                // 首次请求，设置过期时间
                redis.expire(resource, windowSeconds);
                log.debug("✅ 限流计数器初始化: action={}, window={}s", action, windowSeconds);
            }

            if (count > maxRequests) {
                log.warn("⚠️  用户超过限流: action={}, count={}/{}, window={}s",
                    action, count, maxRequests, windowSeconds);
                return false;
            }

            log.debug("✅ 限流检查通过: action={}, count={}/{}", action, count, maxRequests);
            return true;

        } catch (Exception e) {
            log.error("❌ 限流检查失败，降级允许访问", e);
            return true; // 降级：允许访问
        }
    }

    /**
     * 重置限流计数器
     *
     * @param action 操作类型
     */
    public void resetRateLimit(String action) {
        try {
            String resource = "ratelimit:" + action;
            redis.delete(resource);
            log.info("✅ 限流计数器已重置: action={}", action);
        } catch (Exception e) {
            log.error("❌ 重置限流计数器失败", e);
        }
    }

    /**
     * 获取当前限流计数
     *
     * @param action 操作类型
     * @return 当前计数
     */
    public Long getCurrentCount(String action) {
        try {
            String resource = "ratelimit:" + action;
            Object value = redis.get(resource);
            if (value instanceof Number) {
                return ((Number) value).longValue();
            }
            return 0L;
        } catch (Exception e) {
            log.error("❌ 获取限流计数失败", e);
            return 0L;
        }
    }
}




