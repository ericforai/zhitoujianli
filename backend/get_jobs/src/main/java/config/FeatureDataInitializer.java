package config;

import entity.FeatureFlag;
import entity.SystemConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import repository.FeatureFlagRepository;
import repository.SystemConfigRepository;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/**
 * 功能开关和系统配置数据初始化
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-01
 */
@Slf4j
@Component
public class FeatureDataInitializer implements CommandLineRunner {

    @Autowired
    private FeatureFlagRepository featureFlagRepository;

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    @Override
    public void run(String... args) {
        initializeFeatureFlags();
        initializeSystemConfigs();
    }

    /**
     * 初始化功能开关
     */
    private void initializeFeatureFlags() {
        try {
            long count = featureFlagRepository.count();
            if (count > 0) {
                log.info("✅ 功能开关已存在 {} 条记录，跳过初始化", count);
                return;
            }

            log.info("🚀 开始初始化功能开关...");

            // 1. AI 简历优化
            createFeatureIfNotExists(
                "ai_resume_optimization",
                "AI简历优化",
                "使用AI技术智能优化简历内容，提升求职成功率",
                true,
                Arrays.asList("BASIC", "PROFESSIONAL", "FLAGSHIP"),
                null
            );

            // 2. 自动投递
            createFeatureIfNotExists(
                "auto_job_delivery",
                "自动职位投递",
                "自动化投递简历到匹配的职位",
                true,
                Arrays.asList("PROFESSIONAL", "FLAGSHIP"),
                null
            );

            // 3. Boss直聘集成
            createFeatureIfNotExists(
                "boss_zhipin_integration",
                "Boss直聘集成",
                "集成Boss直聘平台，快速投递职位",
                true,
                Arrays.asList("BASIC", "PROFESSIONAL", "FLAGSHIP"),
                null
            );

            // 4. 智能打招呼
            createFeatureIfNotExists(
                "smart_greeting",
                "智能打招呼",
                "AI生成个性化打招呼语，提高HR回复率",
                true,
                Arrays.asList("PROFESSIONAL", "FLAGSHIP"),
                null
            );

            // 5. JD 智能匹配
            createFeatureIfNotExists(
                "jd_matching",
                "JD智能匹配",
                "根据简历智能匹配适合的职位",
                true,
                Arrays.asList("FREE", "BASIC", "PROFESSIONAL", "FLAGSHIP"),
                null
            );

            // 6. 简历模板库
            createFeatureIfNotExists(
                "resume_templates",
                "简历模板库",
                "提供多种专业简历模板",
                true,
                Arrays.asList("FREE", "BASIC", "PROFESSIONAL", "FLAGSHIP"),
                null
            );

            // 7. 数据分析报告
            createFeatureIfNotExists(
                "analytics_report",
                "数据分析报告",
                "投递数据统计和求职分析报告",
                true,
                Arrays.asList("PROFESSIONAL", "FLAGSHIP"),
                null
            );

            // 8. 多账号管理
            createFeatureIfNotExists(
                "multi_account",
                "多账号管理",
                "同时管理多个招聘平台账号",
                false,
                Arrays.asList("FLAGSHIP"),
                null
            );

            log.info("✅ 功能开关初始化完成");

        } catch (Exception e) {
            log.error("❌ 功能开关初始化失败", e);
        }
    }

    /**
     * 初始化系统配置
     */
    private void initializeSystemConfigs() {
        try {
            long count = systemConfigRepository.count();
            if (count > 0) {
                log.info("✅ 系统配置已存在 {} 条记录，跳过初始化", count);
                return;
            }

            log.info("🚀 开始初始化系统配置...");

            // 1. 文件上传配置
            createConfigIfNotExists(
                "max_file_size",
                "10485760",
                "NUMBER",
                "最大文件上传大小（字节）",
                "system"
            );

            createConfigIfNotExists(
                "allowed_file_types",
                "pdf,doc,docx,txt",
                "STRING",
                "允许的文件类型",
                "system"
            );

            // 2. 默认套餐配置
            createConfigIfNotExists(
                "default_plan_type",
                "FREE",
                "STRING",
                "新用户默认套餐类型",
                "system"
            );

            // 3. 配额重置配置
            createConfigIfNotExists(
                "quota_reset_day",
                "1",
                "NUMBER",
                "每月配额重置日（1-28）",
                "system"
            );

            // 4. AI 服务配置
            createConfigIfNotExists(
                "ai_service_provider",
                "deepseek",
                "STRING",
                "AI服务提供商（deepseek/openai/ollama）",
                "system"
            );

            createConfigIfNotExists(
                "ai_max_tokens",
                "2000",
                "NUMBER",
                "AI生成最大Token数",
                "system"
            );

            // 5. 邮件配置
            createConfigIfNotExists(
                "smtp_host",
                "smtp.example.com",
                "STRING",
                "SMTP服务器地址",
                "system"
            );

            createConfigIfNotExists(
                "smtp_port",
                "587",
                "NUMBER",
                "SMTP服务器端口",
                "system"
            );

            createConfigIfNotExists(
                "email_from",
                "noreply@zhitoujianli.com",
                "STRING",
                "发件人邮箱地址",
                "system"
            );

            // 6. 系统维护配置
            createConfigIfNotExists(
                "maintenance_mode",
                "false",
                "BOOLEAN",
                "系统维护模式开关",
                "system"
            );

            createConfigIfNotExists(
                "maintenance_message",
                "系统正在维护中，预计1小时后恢复",
                "STRING",
                "维护模式提示信息",
                "system"
            );

            log.info("✅ 系统配置初始化完成");

        } catch (Exception e) {
            log.error("❌ 系统配置初始化失败", e);
        }
    }

    /**
     * 创建功能开关（如果不存在）
     */
    private void createFeatureIfNotExists(
            String featureKey,
            String featureName,
            String description,
            Boolean enabled,
            java.util.List<String> targetPlans,
            java.util.List<String> targetUsers) {

        if (featureFlagRepository.findByFeatureKey(featureKey).isPresent()) {
            return;
        }

        Map<String, Object> config = new HashMap<>();
        config.put("priority", 1);
        config.put("rolloutPercentage", 100);

        FeatureFlag feature = FeatureFlag.builder()
                .featureKey(featureKey)
                .featureName(featureName)
                .description(description)
                .enabled(enabled)
                .targetPlans(targetPlans)
                .targetUsers(targetUsers)
                .config(config)
                .build();

        featureFlagRepository.save(feature);
        log.info("✅ 创建功能开关: {} - {}", featureKey, featureName);
    }

    /**
     * 创建系统配置（如果不存在）
     */
    private void createConfigIfNotExists(
            String configKey,
            String configValue,
            String configType,
            String description,
            String updatedBy) {

        if (systemConfigRepository.findByConfigKey(configKey).isPresent()) {
            return;
        }

        SystemConfig config = SystemConfig.builder()
                .configKey(configKey)
                .configValue(configValue)
                .configType(configType)
                .description(description)
                .updatedBy(updatedBy)
                .build();

        systemConfigRepository.save(config);
        log.info("✅ 创建系统配置: {} = {}", configKey, configValue);
    }
}

