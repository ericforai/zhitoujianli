package service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import util.UserContextUtil;

import java.util.concurrent.TimeUnit;

/**
 * 用户Redis缓存服务
 * ✅ 多租户隔离：所有Redis key自动添加用户前缀
 *
 * Key格式: user:{userId}:{resource}
 * 示例: user:luwenrong123_sina_com:config
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-03
 */
@Service
@Slf4j
public class UserRedisService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * 生成用户专属Redis key
     * ✅ 自动添加用户前缀，确保多租户隔离
     *
     * @param resource 资源名称（如：config, resume, session）
     * @return 完整的Redis key: user:{userId}:{resource}
     */
    private String getUserKey(String resource) {
        try {
            String userId = UserContextUtil.getCurrentUserId();
            String safeUserId = UserContextUtil.sanitizeUserId(userId);
            String key = "user:" + safeUserId + ":" + resource;
            log.trace("📝 生成Redis key: resource={} → key={}", resource, key);
            return key;
        } catch (exception.UnauthorizedException e) {
            log.error("❌ 未登录用户尝试访问Redis: resource={}", resource);
            throw e;
        }
    }

    /**
     * 保存数据到Redis（永久）
     *
     * @param resource 资源名称
     * @param value 值
     */
    public void set(String resource, Object value) {
        String key = getUserKey(resource);
        redisTemplate.opsForValue().set(key, value);
        log.debug("✅ Redis SET: key={}, valueType={}", key, value.getClass().getSimpleName());
    }

    /**
     * 保存数据到Redis（带过期时间）
     *
     * @param resource 资源名称
     * @param value 值
     * @param seconds 过期时间（秒）
     */
    public void setWithExpire(String resource, Object value, long seconds) {
        String key = getUserKey(resource);
        redisTemplate.opsForValue().set(key, value, seconds, TimeUnit.SECONDS);
        log.debug("✅ Redis SET with TTL: key={}, ttl={}s", key, seconds);
    }

    /**
     * 从Redis读取数据
     *
     * @param resource 资源名称
     * @return 值（如果不存在返回null）
     */
    public Object get(String resource) {
        String key = getUserKey(resource);
        Object value = redisTemplate.opsForValue().get(key);
        log.debug("✅ Redis GET: key={}, found={}", key, value != null);
        return value;
    }

    /**
     * 从Redis读取数据（指定类型）
     *
     * @param resource 资源名称
     * @param clazz 目标类型
     * @return 值（如果不存在返回null）
     */
    @SuppressWarnings("unchecked")
    public <T> T get(String resource, Class<T> clazz) {
        Object value = get(resource);
        if (value == null) {
            return null;
        }

        try {
            return (T) value;
        } catch (ClassCastException e) {
            log.error("❌ Redis类型转换失败: resource={}, expected={}, actual={}",
                resource, clazz.getName(), value.getClass().getName());
            return null;
        }
    }

    /**
     * 删除Redis数据
     *
     * @param resource 资源名称
     * @return 是否删除成功
     */
    public Boolean delete(String resource) {
        String key = getUserKey(resource);
        Boolean result = redisTemplate.delete(key);
        log.debug("✅ Redis DELETE: key={}, deleted={}", key, result);
        return result;
    }

    /**
     * 检查key是否存在
     *
     * @param resource 资源名称
     * @return 是否存在
     */
    public boolean exists(String resource) {
        String key = getUserKey(resource);
        Boolean exists = redisTemplate.hasKey(key);
        return exists != null && exists;
    }

    /**
     * 增加计数器（原子操作）
     *
     * @param resource 资源名称
     * @return 增加后的值
     */
    public Long increment(String resource) {
        String key = getUserKey(resource);
        Long result = redisTemplate.opsForValue().increment(key);
        log.debug("✅ Redis INCREMENT: key={}, value={}", key, result);
        return result;
    }

    /**
     * 减少计数器（原子操作）
     *
     * @param resource 资源名称
     * @return 减少后的值
     */
    public Long decrement(String resource) {
        String key = getUserKey(resource);
        Long result = redisTemplate.opsForValue().decrement(key);
        log.debug("✅ Redis DECREMENT: key={}, value={}", key, result);
        return result;
    }

    /**
     * 设置过期时间
     *
     * @param resource 资源名称
     * @param seconds 过期时间（秒）
     * @return 是否设置成功
     */
    public Boolean expire(String resource, long seconds) {
        String key = getUserKey(resource);
        Boolean result = redisTemplate.expire(key, seconds, TimeUnit.SECONDS);
        log.debug("✅ Redis EXPIRE: key={}, ttl={}s", key, seconds);
        return result;
    }

    /**
     * 获取剩余过期时间
     *
     * @param resource 资源名称
     * @return 剩余秒数（-1表示永久，-2表示key不存在）
     */
    public Long getTTL(String resource) {
        String key = getUserKey(resource);
        return redisTemplate.getExpire(key, TimeUnit.SECONDS);
    }

    /**
     * 清除当前用户的所有缓存
     * ⚠️ 谨慎使用
     */
    public void clearAllUserCache() {
        try {
            String userId = UserContextUtil.getCurrentUserId();
            String safeUserId = UserContextUtil.sanitizeUserId(userId);
            String pattern = "user:" + safeUserId + ":*";

            var keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("✅ 清除用户所有Redis缓存: userId={}, count={}", userId, keys.size());
            }
        } catch (Exception e) {
            log.error("❌ 清除用户缓存失败", e);
        }
    }
}




