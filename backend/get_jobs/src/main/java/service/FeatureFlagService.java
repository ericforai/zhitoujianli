package service;

import com.fasterxml.jackson.databind.ObjectMapper;
import entity.FeatureFlag;
import enums.PlanType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repository.FeatureFlagRepository;

import java.util.List;
import java.util.Optional;

/**
 * 功能开关服务
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Slf4j
@Service
public class FeatureFlagService {

    @Autowired
    private FeatureFlagRepository featureFlagRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 检查功能是否启用
     *
     * @param featureKey 功能键
     * @return 是否启用
     */
    public boolean isFeatureEnabled(String featureKey) {
        Optional<FeatureFlag> feature = featureFlagRepository.findByFeatureKey(featureKey);
        return feature.map(FeatureFlag::getEnabled).orElse(false);
    }

    /**
     * 检查用户是否可以使用指定功能
     *
     * @param featureKey 功能键
     * @param userId 用户ID
     * @param planType 用户套餐类型
     * @return 是否可以使用
     */
    public boolean isFeatureAvailable(String featureKey, String userId, PlanType planType) {
        return isFeatureAvailable(featureKey, userId, planType.name());
    }

    /**
     * 检查用户是否可以使用指定功能（重载方法，使用String套餐类型）
     */
    public boolean isFeatureAvailable(String featureKey, String userId, String planType) {
        try {
            // 先尝试使用数据库查询（更高效）
            String planTypeJson = "[\"" + planType + "\"]";
            String userIdJson = "[\"" + userId + "\"]";

            Optional<FeatureFlag> featureOpt = featureFlagRepository.findEnabledAndAllowed(
                featureKey, planTypeJson, userIdJson);

            if (featureOpt.isPresent()) {
                return true;
            }

            // 如果数据库查询没有结果，使用实体方法检查（兼容性）
            Optional<FeatureFlag> feature = featureFlagRepository.findByFeatureKey(featureKey);
            if (feature.isEmpty()) {
                log.warn("⚠️ 功能不存在: {}", featureKey);
                return false;
            }

            return feature.get().isUserAllowed(userId, planType);

        } catch (Exception e) {
            log.error("❌ 检查功能可用性失败: featureKey={}, userId={}, planType={}",
                     featureKey, userId, planType, e);
            return false;
        }
    }

    /**
     * 获取所有启用的功能列表
     */
    public List<FeatureFlag> getAllEnabledFeatures() {
        return featureFlagRepository.findByEnabledTrue();
    }

    /**
     * 根据套餐类型获取可用功能列表
     */
    public List<FeatureFlag> getAvailableFeaturesByPlan(String planType) {
        try {
            // 将套餐类型转换为JSON字符串格式 ["PLAN_TYPE"]
            String planTypeJson = "[\"" + planType + "\"]";
            return featureFlagRepository.findEnabledByPlanType(planTypeJson);
        } catch (Exception e) {
            log.error("❌ 获取套餐可用功能失败: planType={}", planType, e);
            return List.of();
        }
    }

    /**
     * 根据套餐类型获取可用功能列表（使用枚举）
     */
    public List<FeatureFlag> getAvailableFeaturesByPlan(PlanType planType) {
        return getAvailableFeaturesByPlan(planType.name());
    }

    /**
     * 获取功能详情
     */
    public Optional<FeatureFlag> getFeature(String featureKey) {
        return featureFlagRepository.findByFeatureKey(featureKey);
    }

    /**
     * 创建功能开关
     */
    @Transactional
    public FeatureFlag createFeature(FeatureFlag feature) {
        if (featureFlagRepository.existsByFeatureKey(feature.getFeatureKey())) {
            throw new IllegalArgumentException("功能键已存在: " + feature.getFeatureKey());
        }
        return featureFlagRepository.save(feature);
    }

    /**
     * 更新功能开关
     */
    @Transactional
    public FeatureFlag updateFeature(FeatureFlag feature) {
        if (!featureFlagRepository.existsByFeatureKey(feature.getFeatureKey())) {
            throw new IllegalArgumentException("功能不存在: " + feature.getFeatureKey());
        }
        return featureFlagRepository.save(feature);
    }

    /**
     * 切换功能状态
     */
    @Transactional
    public FeatureFlag toggleFeature(String featureKey) {
        FeatureFlag feature = featureFlagRepository.findByFeatureKey(featureKey)
                .orElseThrow(() -> new IllegalArgumentException("功能不存在: " + featureKey));

        feature.setEnabled(!feature.getEnabled());
        return featureFlagRepository.save(feature);
    }

    /**
     * 启用功能
     */
    @Transactional
    public void enableFeature(String featureKey) {
        FeatureFlag feature = featureFlagRepository.findByFeatureKey(featureKey)
                .orElseThrow(() -> new IllegalArgumentException("功能不存在: " + featureKey));
        feature.setEnabled(true);
        featureFlagRepository.save(feature);
    }

    /**
     * 禁用功能
     */
    @Transactional
    public void disableFeature(String featureKey) {
        FeatureFlag feature = featureFlagRepository.findByFeatureKey(featureKey)
                .orElseThrow(() -> new IllegalArgumentException("功能不存在: " + featureKey));
        feature.setEnabled(false);
        featureFlagRepository.save(feature);
    }

    /**
     * 删除功能开关
     */
    @Transactional
    public void deleteFeature(String featureKey) {
        FeatureFlag feature = featureFlagRepository.findByFeatureKey(featureKey)
                .orElseThrow(() -> new IllegalArgumentException("功能不存在: " + featureKey));
        featureFlagRepository.delete(feature);
        log.info("✅ 功能开关删除成功: {}", featureKey);
    }

    /**
     * 获取所有功能列表
     */
    public List<FeatureFlag> getAllFeatures() {
        return featureFlagRepository.findAll();
    }
}

