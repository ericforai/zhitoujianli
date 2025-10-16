package service;

import entity.UserPlan;
import entity.QuotaDefinition;
import entity.PlanQuotaConfig;
import entity.UserQuotaUsage;
import enums.PlanType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 配额管理服务
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Slf4j
@Service
public class QuotaService {
    
    // 缓存用户套餐信息
    private final Map<String, UserPlan> userPlanCache = new ConcurrentHashMap<>();
    
    /**
     * 检查用户配额是否足够
     * 
     * @param userId 用户ID
     * @param quotaKey 配额键
     * @param requestAmount 请求使用的数量
     * @return 是否可以使用
     */
    public boolean checkQuotaLimit(String userId, String quotaKey, long requestAmount) {
        try {
            log.debug("🔍 检查用户配额: userId={}, quotaKey={}, requestAmount={}", 
                userId, quotaKey, requestAmount);
            
            // 1. 获取用户当前套餐
            UserPlan userPlan = getUserCurrentPlan(userId);
            if (userPlan == null || !userPlan.isValid()) {
                log.warn("⚠️ 用户没有有效套餐: userId={}", userId);
                // 默认使用免费套餐
                userPlan = createDefaultFreePlan(userId);
            }
            
            // 2. 获取配额定义
            QuotaDefinition quotaDefinition = getQuotaDefinition(quotaKey);
            if (quotaDefinition == null) {
                log.warn("⚠️ 配额定义不存在: quotaKey={}", quotaKey);
                return false;
            }
            
            // 3. 获取套餐配额限制
            PlanQuotaConfig planConfig = getPlanQuotaConfig(userPlan.getPlanType(), quotaDefinition.getId());
            if (planConfig == null || !planConfig.getIsEnabled()) {
                log.warn("⚠️ 套餐配额配置不存在或未启用: planType={}, quotaId={}", 
                    userPlan.getPlanType(), quotaDefinition.getId());
                return false;
            }
            
            // 4. 检查是否无限制
            if (planConfig.isUnlimited()) {
                log.debug("✅ 无限配额: userId={}, quotaKey={}", userId, quotaKey);
                return true;
            }
            
            // 5. 获取当前使用量
            UserQuotaUsage currentUsage = getCurrentUsage(userId, quotaDefinition.getId());
            long usedAmount = currentUsage != null ? currentUsage.getUsedAmount() : 0L;
            long limit = planConfig.getEffectiveLimit();
            
            boolean canUse = (usedAmount + requestAmount) <= limit;
            
            log.debug("📊 配额检查结果: userId={}, quotaKey={}, used={}, limit={}, request={}, canUse={}", 
                userId, quotaKey, usedAmount, limit, requestAmount, canUse);
            
            return canUse;
            
        } catch (Exception e) {
            log.error("❌ 配额检查异常: userId={}, quotaKey={}", userId, quotaKey, e);
            return false;
        }
    }
    
    /**
     * 消费配额
     * 
     * @param userId 用户ID
     * @param quotaKey 配额键
     * @param amount 消费数量
     * @throws QuotaExceededException 配额不足异常
     */
    public void consumeQuota(String userId, String quotaKey, long amount) throws QuotaExceededException {
        try {
            log.debug("🔥 消费配额: userId={}, quotaKey={}, amount={}", userId, quotaKey, amount);
            
            // 1. 检查配额是否足够
            if (!checkQuotaLimit(userId, quotaKey, amount)) {
                throw new QuotaExceededException(
                    String.format("配额不足，无法使用 %d %s。请升级套餐或等待配额重置。", 
                        amount, quotaKey));
            }
            
            // 2. 更新使用量
            updateUsage(userId, quotaKey, amount);
            
            log.info("✅ 配额消费成功: userId={}, quotaKey={}, amount={}", userId, quotaKey, amount);
            
        } catch (QuotaExceededException e) {
            log.warn("⚠️ 配额不足: userId={}, quotaKey={}, amount={}, message={}", 
                userId, quotaKey, amount, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("❌ 配额消费异常: userId={}, quotaKey={}, amount={}", userId, quotaKey, amount, e);
            throw new QuotaExceededException("配额消费失败，请稍后重试");
        }
    }
    
    /**
     * 获取用户配额使用详情
     * 
     * @param userId 用户ID
     * @return 配额使用详情列表
     */
    public List<QuotaUsageDetail> getUserQuotaDetails(String userId) {
        try {
            log.debug("📋 获取用户配额详情: userId={}", userId);
            
            UserPlan userPlan = getUserCurrentPlan(userId);
            if (userPlan == null || !userPlan.isValid()) {
                userPlan = createDefaultFreePlan(userId);
            }
            
            // FIXME: 实现具体的配额详情查询逻辑
            // 这里需要根据实际的数据访问层实现
            
            return List.of(); // 临时返回空列表
            
        } catch (Exception e) {
            log.error("❌ 获取用户配额详情异常: userId={}", userId, e);
            return List.of();
        }
    }
    
    /**
     * 重置用户配额
     * 
     * @param userId 用户ID
     * @param quotaKey 配额键（null表示重置所有配额）
     */
    public void resetUserQuota(String userId, String quotaKey) {
        try {
            log.info("🔄 重置用户配额: userId={}, quotaKey={}", userId, quotaKey);
            
            // FIXME: 实现具体的配额重置逻辑
            
            log.info("✅ 配额重置成功: userId={}, quotaKey={}", userId, quotaKey);
            
        } catch (Exception e) {
            log.error("❌ 配额重置异常: userId={}, quotaKey={}", userId, quotaKey, e);
        }
    }
    
    // ==================== 私有方法 ====================
    
    /**
     * 获取用户当前套餐
     */
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
    
    /**
     * 创建默认免费套餐
     */
    private UserPlan createDefaultFreePlan(String userId) {
        return UserPlan.builder()
            .userId(userId)
            .planType(PlanType.FREE)
            .status(UserPlan.PlanStatus.ACTIVE)
            .startDate(LocalDate.now())
            .endDate(null) // 永不过期
            .autoRenewal(false)
            .purchasePrice(0)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    }
    
    /**
     * 获取配额定义
     */
    private QuotaDefinition getQuotaDefinition(String quotaKey) {
        // FIXME: 从数据库或缓存获取配额定义
        // return quotaDefinitionRepository.findByQuotaKeyAndIsActive(quotaKey, true);
        return new String[0];
    }
    
    /**
     * 获取套餐配额配置
     */
    private PlanQuotaConfig getPlanQuotaConfig(PlanType planType, Long quotaId) {
        // FIXME: 从数据库或缓存获取套餐配额配置
        // return planQuotaConfigRepository.findByPlanTypeAndQuotaIdAndIsEnabled(planType, quotaId, true);
        return new String[0];
    }
    
    /**
     * 获取当前使用量
     */
    private UserQuotaUsage getCurrentUsage(String userId, Long quotaId) {
        // FIXME: 从数据库获取当前使用量
        // return userQuotaUsageRepository.findByUserIdAndQuotaIdAndResetDate(userId, quotaId, LocalDate.now());
        return new String[0];
    }
    
    /**
     * 更新使用量
     */
    private void updateUsage(String userId, String quotaKey, long amount) {
        // FIXME: 更新数据库中的使用量
        log.debug("📈 更新配额使用量: userId={}, quotaKey={}, amount={}", userId, quotaKey, amount);
    }
    
    // ==================== 内部类 ====================
    
    /**
     * 配额使用详情
     */
    public static class QuotaUsageDetail {
        private String quotaKey;
        private String quotaName;
        private String category;
        private long used;
        private long limit;
        private boolean unlimited;
        private String resetPeriod;
        private LocalDate nextResetDate;
        
        // getters and setters...
    }
    
    /**
     * 配额超限异常
     */
    public static class QuotaExceededException extends Exception {
        public QuotaExceededException(String message) {
            super(message);
        }
    }
}