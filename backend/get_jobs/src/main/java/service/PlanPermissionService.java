package service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import enums.PlanType;
import lombok.extern.slf4j.Slf4j;
import service.QuotaService.QuotaExceededException;

/**
 * 套餐权限服务
 *
 * 提供套餐权限检查、配额验证和消费功能
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-13
 */
@Slf4j
@Service
public class PlanPermissionService {

    @Autowired
    private QuotaService quotaService;

    /**
     * 检查用户是否有权限使用功能
     *
     * @param userId 用户ID
     * @param quotaKey 配额键
     * @param amount 请求数量
     * @return 是否有权限
     */
    public boolean hasPermission(String userId, String quotaKey, long amount) {
        try {
            // 检查配额是否足够
            return quotaService.checkQuotaLimit(userId, quotaKey, amount);
        } catch (Exception e) {
            log.error("❌ 权限检查异常: userId={}, quotaKey={}, amount={}",
                      userId, quotaKey, amount, e);
            return false;
        }
    }

    /**
     * 检查用户套餐类型
     *
     * @param userId 用户ID
     * @return 用户套餐类型
     */
    public PlanType getUserPlanType(String userId) {
        try {
            // 通过QuotaService获取用户套餐
            // QuotaService内部会调用getUserCurrentPlan方法
            var userPlan = getUserPlan(userId);
            return userPlan != null ? userPlan.getPlanType() : PlanType.FREE;
        } catch (Exception e) {
            log.error("❌ 获取用户套餐类型异常: userId={}", userId, e);
            return PlanType.FREE; // 默认返回免费版
        }
    }

    /**
     * 消费配额
     *
     * @param userId 用户ID
     * @param quotaKey 配额键
     * @param amount 消费数量
     */
    public void consumeQuota(String userId, String quotaKey, long amount) {
        try {
            quotaService.consumeQuota(userId, quotaKey, amount);
            log.debug("✅ 配额消费成功: userId={}, quotaKey={}, amount={}",
                      userId, quotaKey, amount);
        } catch (QuotaExceededException e) {
            log.warn("⚠️ 配额不足: userId={}, quotaKey={}, amount={}, message={}",
                     userId, quotaKey, amount, e.getMessage());
            throw new RuntimeException(e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ 配额消费异常: userId={}, quotaKey={}, amount={}",
                      userId, quotaKey, amount, e);
            throw new RuntimeException("配额消费失败", e);
        }
    }

    /**
     * 获取用户套餐（通过反射调用QuotaService的私有方法）
     * 这是一个临时方案，后续应该在QuotaService中提供公共方法
     */
    private entity.UserPlan getUserPlan(String userId) {
        try {
            // 使用反射调用QuotaService的私有方法getUserCurrentPlan
            java.lang.reflect.Method method = QuotaService.class.getDeclaredMethod("getUserCurrentPlan", String.class);
            method.setAccessible(true);
            return (entity.UserPlan) method.invoke(quotaService, userId);
        } catch (Exception e) {
            log.error("❌ 获取用户套餐失败: userId={}", userId, e);
            return null;
        }
    }
}

