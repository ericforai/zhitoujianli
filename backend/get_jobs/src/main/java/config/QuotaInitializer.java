package config;

import enums.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 配额系统初始化器
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Slf4j
@Component
public class QuotaInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        log.info("🚀 开始初始化配额系统...");
        
        try {
            // 1. 初始化配额定义
            initializeQuotaDefinitions();
            
            // 2. 初始化套餐配额配置
            initializePlanQuotaConfigs();
            
            log.info("✅ 配额系统初始化完成");
            
        } catch (Exception e) {
            log.error("❌ 配额系统初始化失败", e);
        }
    }
    
    /**
     * 初始化配额定义
     */
    private void initializeQuotaDefinitions() {
        log.info("📋 正在初始化配额定义...");
        
        List<QuotaDefinition> quotaDefinitions = new ArrayList<>();
        
        // 简历相关配额
        quotaDefinitions.addAll(createResumeQuotas());
        
        // AI服务配额
        quotaDefinitions.addAll(createAIQuotas());
        
        // 投递功能配额
        quotaDefinitions.addAll(createDeliveryQuotas());
        
        // 存储数据配额
        quotaDefinitions.addAll(createStorageQuotas());
        
        // 高级功能配额
        quotaDefinitions.addAll(createAdvancedQuotas());
        
        // TODO: 保存到数据库
        // quotaDefinitionRepository.saveAll(quotaDefinitions);
        
        log.info("✅ 配额定义初始化完成，共 {} 个配额", quotaDefinitions.size());
    }
    
    /**
     * 初始化套餐配额配置
     */
    private void initializePlanQuotaConfigs() {
        log.info("🎯 正在初始化套餐配额配置...");
        
        // TODO: 根据配额定义创建各套餐的配额限制
        
        log.info("✅ 套餐配额配置初始化完成");
    }
    
    // ==================== 配额定义创建方法 ====================
    
    /**
     * 创建简历相关配额
     */
    private List<QuotaDefinition> createResumeQuotas() {
        List<QuotaDefinition> quotas = new ArrayList<>();
        
        quotas.add(QuotaDefinition.builder()
            .quotaKey("resume_templates")
            .quotaName("简历模板数量")
            .quotaDescription("可使用的简历模板总数")
            .quotaCategory(QuotaCategory.RESUME)
            .unitType(UnitType.COUNT)
            .resetPeriod(ResetPeriod.NEVER)
            .isActive(true)
            .sortOrder(1)
            .build());
            
        quotas.add(QuotaDefinition.builder()
            .quotaKey("resume_create")
            .quotaName("可创建简历数量")
            .quotaDescription("可以创建的简历总数")
            .quotaCategory(QuotaCategory.RESUME)
            .unitType(UnitType.COUNT)
            .resetPeriod(ResetPeriod.NEVER)
            .isActive(true)
            .sortOrder(2)
            .build());
            
        quotas.add(QuotaDefinition.builder()
            .quotaKey("resume_export_monthly")
            .quotaName("简历导出次数")
            .quotaDescription("每月可导出简历的次数")
            .quotaCategory(QuotaCategory.RESUME)
            .unitType(UnitType.COUNT)
            .resetPeriod(ResetPeriod.MONTHLY)
            .isActive(true)
            .sortOrder(3)
            .build());
            
        return quotas;
    }
    
    /**
     * 创建AI服务配额
     */
    private List<QuotaDefinition> createAIQuotas() {
        List<QuotaDefinition> quotas = new ArrayList<>();
        
        quotas.add(QuotaDefinition.builder()
            .quotaKey("ai_resume_optimize_monthly")
            .quotaName("AI简历优化")
            .quotaDescription("每月AI简历优化次数")
            .quotaCategory(QuotaCategory.AI)
            .unitType(UnitType.COUNT)
            .resetPeriod(ResetPeriod.MONTHLY)
            .isActive(true)
            .sortOrder(10)
            .build());
            
        quotas.add(QuotaDefinition.builder()
            .quotaKey("ai_greeting_generate_monthly")
            .quotaName("AI打招呼生成")
            .quotaDescription("每月AI打招呼生成次数")
            .quotaCategory(QuotaCategory.AI)
            .unitType(UnitType.COUNT)
            .resetPeriod(ResetPeriod.MONTHLY)
            .isActive(true)
            .sortOrder(11)
            .build());
            
        quotas.add(QuotaDefinition.builder()
            .quotaKey("ai_interview_practice_monthly")
            .quotaName("AI面试练习")
            .quotaDescription("每月AI面试问答练习次数")
            .quotaCategory(QuotaCategory.AI)
            .unitType(UnitType.COUNT)
            .resetPeriod(ResetPeriod.MONTHLY)
            .isActive(true)
            .sortOrder(12)
            .build());
            
        quotas.add(QuotaDefinition.builder()
            .quotaKey("ai_job_matching_monthly")
            .quotaName("AI职位匹配")
            .quotaDescription("每月AI职位匹配分析次数")
            .quotaCategory(QuotaCategory.AI)
            .unitType(UnitType.COUNT)
            .resetPeriod(ResetPeriod.MONTHLY)
            .isActive(true)
            .sortOrder(13)
            .build());
            
        return quotas;
    }
    
    /**
     * 创建投递功能配额
     */
    private List<QuotaDefinition> createDeliveryQuotas() {
        List<QuotaDefinition> quotas = new ArrayList<>();
        
        quotas.add(QuotaDefinition.builder()
            .quotaKey("auto_delivery_daily")
            .quotaName("自动投递")
            .quotaDescription("每日自动投递次数")
            .quotaCategory(QuotaCategory.DELIVERY)
            .unitType(UnitType.COUNT)
            .resetPeriod(ResetPeriod.DAILY)
            .isActive(true)
            .sortOrder(20)
            .build());
            
        return quotas;
    }
    
    /**
     * 创建存储数据配额
     */
    private List<QuotaDefinition> createStorageQuotas() {
        List<QuotaDefinition> quotas = new ArrayList<>();
        
        quotas.add(QuotaDefinition.builder()
            .quotaKey("storage_space")
            .quotaName("存储空间")
            .quotaDescription("总存储空间大小")
            .quotaCategory(QuotaCategory.STORAGE)
            .unitType(UnitType.SIZE)
            .resetPeriod(ResetPeriod.NEVER)
            .isActive(true)
            .sortOrder(30)
            .build());
            
        quotas.add(QuotaDefinition.builder()
            .quotaKey("resume_versions")
            .quotaName("简历版本历史")
            .quotaDescription("可保存的简历版本数量")
            .quotaCategory(QuotaCategory.STORAGE)
            .unitType(UnitType.COUNT)
            .resetPeriod(ResetPeriod.NEVER)
            .isActive(true)
            .sortOrder(31)
            .build());
            
        quotas.add(QuotaDefinition.builder()
            .quotaKey("file_upload_size")
            .quotaName("文件上传大小")
            .quotaDescription("单个文件上传大小限制")
            .quotaCategory(QuotaCategory.STORAGE)
            .unitType(UnitType.SIZE)
            .resetPeriod(ResetPeriod.NEVER)
            .isActive(true)
            .sortOrder(32)
            .build());
            
        return quotas;
    }
    
    /**
     * 创建高级功能配额
     */
    private List<QuotaDefinition> createAdvancedQuotas() {
        List<QuotaDefinition> quotas = new ArrayList<>();
        
        quotas.add(QuotaDefinition.builder()
            .quotaKey("custom_ai_prompts")
            .quotaName("自定义AI提示词")
            .quotaDescription("是否可以自定义AI提示词")
            .quotaCategory(QuotaCategory.ADVANCED)
            .unitType(UnitType.COUNT)
            .resetPeriod(ResetPeriod.NEVER)
            .isActive(true)
            .sortOrder(40)
            .build());
            
        quotas.add(QuotaDefinition.builder()
            .quotaKey("advanced_analytics")
            .quotaName("高级数据分析")
            .quotaDescription("是否可以使用高级数据分析功能")
            .quotaCategory(QuotaCategory.ADVANCED)
            .unitType(UnitType.COUNT)
            .resetPeriod(ResetPeriod.NEVER)
            .isActive(true)
            .sortOrder(41)
            .build());
            
        return quotas;
    }
    
    /**
     * 配额定义数据类（临时用于初始化）
     */
    private static class QuotaDefinition {
        private String quotaKey;
        private String quotaName;
        private String quotaDescription;
        private QuotaCategory quotaCategory;
        private UnitType unitType;
        private ResetPeriod resetPeriod;
        private Boolean isActive;
        private Integer sortOrder;
        
        public static QuotaDefinitionBuilder builder() {
            return new QuotaDefinitionBuilder();
        }
        
        public static class QuotaDefinitionBuilder {
            private QuotaDefinition definition = new QuotaDefinition();
            
            public QuotaDefinitionBuilder quotaKey(String quotaKey) {
                definition.quotaKey = quotaKey;
                return this;
            }
            
            public QuotaDefinitionBuilder quotaName(String quotaName) {
                definition.quotaName = quotaName;
                return this;
            }
            
            public QuotaDefinitionBuilder quotaDescription(String quotaDescription) {
                definition.quotaDescription = quotaDescription;
                return this;
            }
            
            public QuotaDefinitionBuilder quotaCategory(QuotaCategory quotaCategory) {
                definition.quotaCategory = quotaCategory;
                return this;
            }
            
            public QuotaDefinitionBuilder unitType(UnitType unitType) {
                definition.unitType = unitType;
                return this;
            }
            
            public QuotaDefinitionBuilder resetPeriod(ResetPeriod resetPeriod) {
                definition.resetPeriod = resetPeriod;
                return this;
            }
            
            public QuotaDefinitionBuilder isActive(Boolean isActive) {
                definition.isActive = isActive;
                return this;
            }
            
            public QuotaDefinitionBuilder sortOrder(Integer sortOrder) {
                definition.sortOrder = sortOrder;
                return this;
            }
            
            public QuotaDefinition build() {
                return definition;
            }
        }
    }
}