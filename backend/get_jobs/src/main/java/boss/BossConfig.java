package boss;

import java.io.File;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.Data;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import utils.JobUtils;

/**
 * @author loks666
 * 项目链接: <a href="https://github.com/ericforai/zhitoujianli">https://github.com/ericforai/zhitoujianli</a>
 */
@Slf4j
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class BossConfig {
    /**
     * 默认打招呼语（统一字段名）
     */
    private String defaultGreeting;

    /**
     * 开发者模式
     */
    private Boolean debugger;

    /**
     * 搜索关键词列表
     */
    private List<String> keywords;

    /**
     * 城市列表（统一字段名）
     */
    private List<String> cities;

    /**
     * 自定义城市编码映射
     */
    private Map<String, String> customCityCode;

    /**
     * 行业列表
     */
    private List<String> industry;

    /**
     * 工作经验要求（统一字段名）
     */
    private String experienceRequirement;

    /**
     * 工作类型
     */
    private String jobType;

    /**
     * 薪资范围（统一字段名）
     */
    private Map<String, Object> salaryRange;

    /**
     * 学历要求（统一字段名）
     */
    private String educationRequirement;

    /**
     * 公司规模列表（统一字段名）
     */
    private List<String> companySize;

    /**
     * 公司融资阶段列表（统一字段名）
     */
    private List<String> financingStage;

    /**
     * 是否开放AI检测
     */
    private Boolean enableAI;

    /**
     * 是否启用智能打招呼语生成（基于简历+JD）
     */
    private Boolean enableSmartGreeting;

    /**
     * 是否过滤不活跃hr
     */
    private Boolean filterDeadHR;

    /**
     * 是否发送图片简历
     */
    private Boolean sendImgResume;

    /**
     * 目标薪资
     */
    private List<Integer> expectedSalary;

    /**
     * 等待时间
     */
    private String waitTime;

    /**
     * HR未上线状态
     */
    private List<String> deadStatus;

    /**
     * 投递策略配置
     */
    private DeliveryStrategy deliveryStrategy;

    /**
     * 投递策略内部类
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DeliveryStrategy {
        /**
         * 是否启用自动投递
         */
        private Boolean enableAutoDelivery = false;

        /**
         * 投递频率（次/小时）
         */
        private Integer deliveryFrequency = 10;

        /**
         * 每日最大投递数
         */
        private Integer maxDailyDelivery = 100;

        /**
         * 投递间隔（秒）
         */
        private Integer deliveryInterval = 300;

        /**
         * 匹配度阈值（0.0-1.0）
         * 保留用于向后兼容，作为兜底阈值
         */
        private Double matchThreshold = 0.7;

        /**
         * 投递时间范围
         */
        private TimeRange deliveryTimeRange;

        /**
         * 关键词匹配模式
         * STRICT: 严格模式（只启用方案1-开头匹配）
         * STANDARD: 标准模式（启用方案1+2+3）
         * FLEXIBLE: 灵活模式（启用所有方案1-5）
         * CUSTOM: 自定义模式（根据matchingSchemes配置）
         */
        private String keywordMatchingMode = "STANDARD";

        /**
         * 匹配方案配置
         * 允许用户自定义启用哪些匹配方案
         */
        private MatchingSchemes matchingSchemes;
    }

    /**
     * 匹配方案配置内部类
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MatchingSchemes {
        /**
         * 方案1：开头匹配（岗位以关键词开头）
         * 例如："市场总监" 匹配 "市场总监（北京）"
         */
        private Boolean enableScheme1 = true;

        /**
         * 方案2：关键词+职位词组合匹配
         * 例如："市场" 匹配 "市场总监"、"市场经理"
         */
        private Boolean enableScheme2 = true;

        /**
         * 方案3：完整词匹配（词边界检查）
         * 例如："营销" 匹配 "数字营销总监"（完整词）
         */
        private Boolean enableScheme3 = true;

        /**
         * 方案4：拆分匹配（长关键词）
         * 例如："营销总监" 匹配 "营销运营总监"（都包含"营销"和"总监"）
         */
        private Boolean enableScheme4 = false;

        /**
         * 方案5：短词+职位组合匹配（短关键词）
         * 例如："市场" 匹配 "市场销售总监"（包含"市场"+"总监"）
         */
        private Boolean enableScheme5 = false;
    }

    /**
     * 时间范围内部类
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TimeRange {
        /**
         * 开始时间 (HH:mm格式)
         */
        private String startTime = "00:00";

        /**
         * 结束时间 (HH:mm格式)
         */
        private String endTime = "23:59";
    }

    /**
     * 尝试加载用户配置
     * 优先从用户数据目录读取配置，如果不存在则返回null
     */
    @SneakyThrows
    private static BossConfig tryLoadUserConfig() {
        try {
            // 1. 从环境变量获取用户ID（由BossExecutionService传递）
            String userId = System.getenv("BOSS_USER_ID");

            // 2. 如果未设置环境变量，尝试系统属性（向后兼容）
            if (userId == null || userId.isEmpty()) {
                userId = System.getProperty("boss.user.id");
            }

            // 3. ⚠️ 多租户模式 - 必须提供用户ID
            if (userId == null || userId.isEmpty()) {
                log.error("❌ 未检测到BOSS_USER_ID环境变量，多租户模式必须提供用户ID！");
                return null;
            }
            log.info("✅ 从环境变量获取用户ID: BOSS_USER_ID={}", userId);

            // 4. 构建用户配置路径（使用绝对路径）
            // ✅ 修复：确保userId已sanitize（环境变量中的userId应该已经是sanitize过的）
            // 但为了安全，再次sanitize（如果环境变量被修改）
            String safeUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "_");

            // 🔧 修复：使用环境变量USER_DATA_DIR构建绝对路径
            String userDataBaseDir = System.getenv("USER_DATA_DIR");
            if (userDataBaseDir == null || userDataBaseDir.isEmpty()) {
                // 备用方案：使用工作目录下的user_data
                userDataBaseDir = System.getProperty("user.dir") + "/user_data";
                log.info("📂 未设置USER_DATA_DIR环境变量，使用工作目录: {}", userDataBaseDir);
            } else {
                log.info("📂 从环境变量读取USER_DATA_DIR: {}", userDataBaseDir);
            }

            String userConfigPath = userDataBaseDir + "/" + safeUserId + "/config.json";
            log.info("🔍 尝试加载用户配置文件: {}", userConfigPath);

            File userConfigFile = new File(userConfigPath);

            if (!userConfigFile.exists()) {
                log.error("❌ 用户配置文件不存在: {} （用户: {}）", userConfigPath, userId);
                log.info("💡 请确保配置文件存在于正确路径，或在前端配置页面保存配置");
                return null;
            }

            log.info("✅ 找到用户配置文件: {}, 大小: {} bytes", userConfigPath, userConfigFile.length());

            // 读取用户配置
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> userConfig = mapper.readValue(userConfigFile, Map.class);

            // 🔧 统一字段：只使用bossConfig（已删除boss字段）
            @SuppressWarnings("unchecked")
            Map<String, Object> bossConfigMap = (Map<String, Object>) userConfig.get("bossConfig");

            if (bossConfigMap == null) {
                log.error("❌ 用户配置中没有bossConfig部分，请在前端保存配置");
                log.info("💡 提示：请访问前端「Boss直聘配置」页面保存配置");
                return null;
            }

            log.info("✅ 从bossConfig字段加载配置");

            // 🔧 v3.1.0 字段完全统一 - 不再需要映射
            // 直接使用前端字段名，删除所有映射代码
            BossConfig config = mapper.convertValue(bossConfigMap, BossConfig.class);

            log.info("✅ 字段已完全统一，无需映射");

            // ✅ 读取投递策略配置（如果存在）
            @SuppressWarnings("unchecked")
            Map<String, Object> deliveryStrategyMap = (Map<String, Object>) userConfig.get("deliveryStrategy");
            if (deliveryStrategyMap != null) {
                DeliveryStrategy strategy = mapper.convertValue(deliveryStrategyMap, DeliveryStrategy.class);
                config.setDeliveryStrategy(strategy);

                // 输出匹配策略信息
                String matchingMode = strategy.getKeywordMatchingMode() != null ? strategy.getKeywordMatchingMode() : "STANDARD";
                String schemesInfo = "未配置";
                if (strategy.getMatchingSchemes() != null) {
                    MatchingSchemes schemes = strategy.getMatchingSchemes();
                    schemesInfo = String.format("方案1=%s, 方案2=%s, 方案3=%s, 方案4=%s, 方案5=%s",
                        schemes.getEnableScheme1(), schemes.getEnableScheme2(), schemes.getEnableScheme3(),
                        schemes.getEnableScheme4(), schemes.getEnableScheme5());
                }

                log.info("📊 投递策略已加载: 自动投递={}, 频率={}/小时, 每日限额={}, 间隔={}秒, 匹配阈值={}, 匹配模式={}, 匹配方案=[{}]",
                    strategy.getEnableAutoDelivery(),
                    strategy.getDeliveryFrequency(),
                    strategy.getMaxDailyDelivery(),
                    strategy.getDeliveryInterval(),
                    strategy.getMatchThreshold(),
                    matchingMode,
                    schemesInfo);
            } else {
                log.info("⚠️ 未找到投递策略配置，使用默认值");
                config.setDeliveryStrategy(new DeliveryStrategy());
            }

            log.info("✅ 成功加载用户配置: userId={}, 配置文件: {}", userId, userConfigPath);
            log.info("📋 配置详情: keywords={}, salaryRange={}, cities={}, experienceReq={}, waitTime={}",
                    config.getKeywords(), config.getSalaryRange(), config.getCities(),
                    config.getExperienceRequirement(), config.getWaitTime());

            // 【新增】详细输出关键词列表，便于排查
            if (config.getKeywords() != null && !config.getKeywords().isEmpty()) {
                log.info("🔑 搜索关键词列表（共{}个）:", config.getKeywords().size());
                for (int i = 0; i < config.getKeywords().size(); i++) {
                    log.info("   {}. {}", i + 1, config.getKeywords().get(i));
                }
            } else {
                log.warn("⚠️ 警告：未配置搜索关键词！");
            }

            return config;

        } catch (Exception e) {
            log.warn("加载用户配置失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 为指定用户加载配置（方案B完全实例化）
     *
     * @param userId 用户ID
     * @return BossConfig实例
     */
    public static BossConfig loadForUser(String userId) {
        // 委托给init()方法，因为init()已经从环境变量读取BOSS_USER_ID
        return init();
    }

    @SneakyThrows
    public static BossConfig init() {
        // 优先尝试读取用户配置
        BossConfig config = tryLoadUserConfig();
        if (config == null) {
            // 如果用户配置不存在，使用默认配置
            log.warn("⚠️ 用户配置未找到或加载失败，将使用系统默认配置（config.yaml）");
            config = JobUtils.getConfig(BossConfig.class);

            // 【新增】输出默认配置的关键词列表
            if (config != null && config.getKeywords() != null && !config.getKeywords().isEmpty()) {
                log.info("📋 默认配置关键词列表（共{}个）:", config.getKeywords().size());
                for (int i = 0; i < config.getKeywords().size(); i++) {
                    log.info("   {}. {}", i + 1, config.getKeywords().get(i));
                }
            }
        } else {
            log.info("✅ 使用用户自定义配置（已从config.json加载）");
        }

        // 【安全检查】确保配置不为空
        if (config == null) {
            log.error("❌ 配置加载失败，无法继续执行");
            throw new IllegalStateException("Boss配置加载失败");
        }

        // 验证打招呼语是否为空，如果为空则尝试从default_greeting.json读取
        if (config.getDefaultGreeting() == null || config.getDefaultGreeting().trim().isEmpty()) {
            log.warn("⚠️ 用户的打招呼语为空，尝试从default_greeting.json读取...");

            try {
                // 尝试从default_greeting.json读取打招呼语
                String defaultGreeting = loadDefaultGreetingFromFile();
                if (defaultGreeting != null && !defaultGreeting.trim().isEmpty()) {
                    config.setDefaultGreeting(defaultGreeting);
                    log.info("✅ 已从default_greeting.json加载打招呼语，长度: {}字", defaultGreeting.length());
                } else {
                    log.warn("⚠️ default_greeting.json中也未找到打招呼语");
                    log.info("💡 建议：1. 上传简历 2. 生成AI默认打招呼语 3. 保存到Boss配置");
                }
            } catch (Exception e) {
                log.warn("读取default_greeting.json失败: {}", e.getMessage());
                log.info("💡 建议：1. 上传简历 2. 生成AI默认打招呼语 3. 保存到Boss配置");
            }
        } else {
            log.info("✅ 打招呼语已设置，长度: {}字", config.getDefaultGreeting().length());
        }

        // 【新增】如果enableSmartGreeting未配置，默认启用
        if (config.getEnableSmartGreeting() == null) {
            config.setEnableSmartGreeting(true);
            log.info("✅ enableSmartGreeting未配置，默认启用智能打招呼");
        } else {
            log.info("✅ enableSmartGreeting已配置: {}", config.getEnableSmartGreeting());
        }

        // 🔧 v3.1.0 枚举转换逻辑 - 使用统一字段名

        // 转换工作类型
        if (config.getJobType() != null && !config.getJobType().isEmpty()) {
            config.setJobType(BossEnum.JobType.forValue(config.getJobType()).getCode());
        }

        // 转换城市编码（cities字段）
        if (config.getCities() != null && !config.getCities().isEmpty()) {
            final BossConfig finalConfig = config;
            List<String> convertedCityCodes = config.getCities().stream()
                    .map(city -> {
                        // 优先从自定义映射中获取
                        if (finalConfig.getCustomCityCode() != null && finalConfig.getCustomCityCode().containsKey(city)) {
                            return finalConfig.getCustomCityCode().get(city);
                        }
                        // 否则从枚举中获取
                        return BossEnum.CityCode.forValue(city).getCode();
                    })
                    .collect(Collectors.toList());
            config.setCities(convertedCityCodes);
            log.debug("✓ 城市编码转换: {} → {}", config.getCities(), convertedCityCodes);
        }

        // 转换工作经验要求（experienceRequirement字段）
        if (config.getExperienceRequirement() != null && !config.getExperienceRequirement().isEmpty()) {
            String expCode = BossEnum.Experience.forValue(config.getExperienceRequirement()).getCode();
            config.setExperienceRequirement(expCode);
            log.debug("✓ 经验要求转换: {} → {}", config.getExperienceRequirement(), expCode);
        }

        // 转换学历要求（educationRequirement字段）
        if (config.getEducationRequirement() != null && !config.getEducationRequirement().isEmpty()) {
            String degreeCode = BossEnum.Degree.forValue(config.getEducationRequirement()).getCode();
            config.setEducationRequirement(degreeCode);
            log.debug("✓ 学历要求转换: {} → {}", config.getEducationRequirement(), degreeCode);
        }

        // 转换公司规模（companySize字段）
        if (config.getCompanySize() != null && !config.getCompanySize().isEmpty()) {
            List<String> convertedScales = config.getCompanySize().stream()
                    .map(value -> BossEnum.Scale.forValue(value).getCode())
                    .collect(Collectors.toList());
            config.setCompanySize(convertedScales);
        }

        // 转换公司融资阶段（financingStage字段）
        if (config.getFinancingStage() != null && !config.getFinancingStage().isEmpty()) {
            List<String> convertedStages = config.getFinancingStage().stream()
                    .map(value -> BossEnum.Financing.forValue(value).getCode())
                    .collect(Collectors.toList());
            config.setFinancingStage(convertedStages);
        }

        // 转换行业
        if (config.getIndustry() != null && !config.getIndustry().isEmpty()) {
            List<String> convertedIndustries = config.getIndustry().stream()
                    .map(value -> BossEnum.Industry.forValue(value).getCode())
                    .collect(Collectors.toList());
            config.setIndustry(convertedIndustries);
        }

        // 🔧转换薪资范围（salaryRange字段：对象格式 → Boss API格式）
        if (config.getSalaryRange() != null) {
            Map<String, Object> salaryRange = config.getSalaryRange();
            Object minSalary = salaryRange.get("minSalary");
            Object maxSalary = salaryRange.get("maxSalary");

            if (minSalary != null && maxSalary != null) {
                // 构建薪资字符串
                String salaryStr = minSalary + "K-" + maxSalary + "K";
                // 转换为Boss API编码
                String salaryCode = BossEnum.Salary.forValue(salaryStr).getCode();
                // 存回salaryRange（保持对象格式，但添加code字段）
                salaryRange.put("code", salaryCode);
                log.debug("✓ 薪资范围转换: {}K-{}K → {}", minSalary, maxSalary, salaryCode);
            }
        }

        return config;
    }

    /**
     * 从default_greeting.json文件加载默认打招呼语
     * 支持多种用户ID格式的查找
     */
    @SneakyThrows
    private static String loadDefaultGreetingFromFile() {
        try {
            // 获取当前用户ID（优先级：环境变量 > 系统属性）
            String userId = System.getenv("BOSS_USER_ID");
            if (userId == null || userId.isEmpty()) {
                userId = System.getProperty("boss.user.id");
            }
            if (userId == null || userId.isEmpty()) {
                // ❌ 不再使用default_user fallback（多租户隔离要求）
                log.error("❌ 未提供用户ID（BOSS_USER_ID或boss.user.id），无法加载默认打招呼语");
                return null;
            }

            log.debug("尝试为用户 {} 加载默认打招呼语", userId);

            // ✅ 修复：统一使用sanitize后的格式，但保留向后兼容（尝试多种格式）
            // 优先使用sanitize后的格式，然后尝试其他格式以兼容旧数据
            String safeUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "_");
            String[] possiblePaths = {
                "user_data/" + safeUserId + "/default_greeting.json",  // ✅ 优先：sanitize后的标准格式
                "user_data/" + userId + "/default_greeting.json",  // 向后兼容：原始格式
                "user_data/" + userId.replace("_", "@") + "/default_greeting.json",  // 向后兼容：邮箱格式
                "user_data/" + userId.replace("@", "_").replace(".", "_") + "/default_greeting.json",  // 向后兼容：安全格式
                "user_data/" + userId.replace("_sina_com", "@sina.com") + "/default_greeting.json",  // 向后兼容：特殊格式转换
                "user_data/" + userId.replace("_", "@").replace("_com", ".com") + "/default_greeting.json"  // 向后兼容：通用格式转换
            };

            for (String path : possiblePaths) {
                File greetingFile = new File(path);
                if (greetingFile.exists()) {
                    log.info("找到打招呼语文件: {}", path);

                    ObjectMapper mapper = new ObjectMapper();
                    @SuppressWarnings("unchecked")
                    Map<String, Object> greetingData = mapper.readValue(greetingFile, Map.class);
                    String greeting = (String) greetingData.get("greeting");

                    if (greeting != null && !greeting.trim().isEmpty()) {
                        return greeting;
                    }
                }
            }

            log.warn("未找到任何有效的打招呼语文件");
            return null;

        } catch (Exception e) {
            log.error("加载默认打招呼语失败: {}", e.getMessage());
            return null;
        }
    }

}
