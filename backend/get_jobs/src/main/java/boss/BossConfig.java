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
 * 项目链接: <a href="https://github.com/loks666/get_jobs">https://github.com/loks666/get_jobs</a>
 */
@Slf4j
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class BossConfig {
    /**
     * 用于打招呼的语句
     */
    private String sayHi;

    /**
     * 开发者模式
     */
    private Boolean debugger;

    /**
     * 搜索关键词列表
     */
    private List<String> keywords;

    /**
     * 城市编码
     */
    private List<String> cityCode;

    /**
     * 自定义城市编码映射
     */
    private Map<String, String> customCityCode;

    /**
     * 行业列表
     */
    private List<String> industry;

    /**
     * 工作经验要求
     */
    private List<String> experience;

    /**
     * 工作类型
     */
    private String jobType;

    /**
     * 薪资范围
     */
    private List<String> salary;

    /**
     * 学历要求列表
     */
    private List<String> degree;

    /**
     * 公司规模列表
     */
    private List<String> scale;

    /**
     * 公司融资阶段列表
     */
    private List<String> stage;

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

            // 3. 如果仍未设置，则使用默认用户（保持向后兼容）
            if (userId == null || userId.isEmpty()) {
                userId = "default_user";
                log.info("未检测到BOSS_USER_ID环境变量，使用默认用户: {}", userId);
            } else {
                log.info("✅ 从环境变量获取用户ID: BOSS_USER_ID={}", userId);
            }

            // 4. 构建用户配置路径
            String userConfigPath = "user_data/" + userId + "/config.json";
            File userConfigFile = new File(userConfigPath);

            if (!userConfigFile.exists()) {
                log.info("用户配置文件不存在: {} （用户: {}）", userConfigPath, userId);
                return null;
            }

            // 读取用户配置
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> userConfig = mapper.readValue(userConfigFile, Map.class);

            // 提取boss配置部分
            @SuppressWarnings("unchecked")
            Map<String, Object> bossConfigMap = (Map<String, Object>) userConfig.get("boss");
            if (bossConfigMap == null) {
                log.warn("用户配置中没有boss部分");
                return null;
            }

            // 转换为BossConfig对象
            BossConfig config = mapper.convertValue(bossConfigMap, BossConfig.class);
            log.info("✅ 成功加载用户配置: userId={}", userId);
            log.info("📋 配置详情: keywords={}, salary={}, cityCode={}, experience={}, waitTime={}",
                    config.getKeywords(), config.getSalary(), config.getCityCode(),
                    config.getExperience(), config.getWaitTime());
            return config;

        } catch (Exception e) {
            log.warn("加载用户配置失败: {}", e.getMessage());
            return null;
        }
    }

    @SneakyThrows
    public static BossConfig init() {
        // 优先尝试读取用户配置
        BossConfig config = tryLoadUserConfig();
        if (config == null) {
            // 如果用户配置不存在，使用默认配置
            log.info("用户配置不存在，使用默认配置");
            config = JobUtils.getConfig(BossConfig.class);
        } else {
            log.info("使用用户自定义配置");
        }

        // 验证打招呼语是否为空，如果为空则尝试从default_greeting.json读取
        if (config.getSayHi() == null || config.getSayHi().trim().isEmpty()) {
            log.warn("⚠️ 用户的打招呼语为空，尝试从default_greeting.json读取...");

            try {
                // 尝试从default_greeting.json读取打招呼语
                String defaultGreeting = loadDefaultGreetingFromFile();
                if (defaultGreeting != null && !defaultGreeting.trim().isEmpty()) {
                    config.setSayHi(defaultGreeting);
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
            log.info("✅ 打招呼语已设置，长度: {}字", config.getSayHi().length());
        }

        // 【新增】如果enableSmartGreeting未配置，默认启用
        if (config.getEnableSmartGreeting() == null) {
            config.setEnableSmartGreeting(true);
            log.info("✅ enableSmartGreeting未配置，默认启用智能打招呼");
        } else {
            log.info("✅ enableSmartGreeting已配置: {}", config.getEnableSmartGreeting());
        }

        // 转换工作类型
        config.setJobType(BossEnum.JobType.forValue(config.getJobType()).getCode());
        // 转换薪资范围
        if (config.getSalary() != null && !config.getSalary().isEmpty()) {
            String salaryValue = config.getSalary().get(0);
            config.setSalary(List.of(BossEnum.Salary.forValue(salaryValue).getCode()));
        }
        // 转换城市编码
        if (config.getCityCode() != null) {
            final BossConfig finalConfig = config; // 创建final引用
            List<String> convertedCityCodes = config.getCityCode().stream()
                    .map(city -> {
                        // 优先从自定义映射中获取
                        if (finalConfig.getCustomCityCode() != null && finalConfig.getCustomCityCode().containsKey(city)) {
                            return finalConfig.getCustomCityCode().get(city);
                        }
                        // 否则从枚举中获取
                        return BossEnum.CityCode.forValue(city).getCode();
                    })
                    .collect(Collectors.toList());
            config.setCityCode(convertedCityCodes);
        }

        // 转换工作经验要求
        if (config.getExperience() != null) {
            config.setExperience(config.getExperience().stream().map(value -> BossEnum.Experience.forValue(value).getCode()).collect(Collectors.toList()));
        }

        // 转换学历要求
        if (config.getDegree() != null) {
            config.setDegree(config.getDegree().stream().map(value -> BossEnum.Degree.forValue(value).getCode()).collect(Collectors.toList()));
        }

        // 转换公司规模
        if (config.getScale() != null) {
            config.setScale(config.getScale().stream().map(value -> BossEnum.Scale.forValue(value).getCode()).collect(Collectors.toList()));
        }

        // 转换公司融资阶段
        if (config.getStage() != null) {
            config.setStage(config.getStage().stream().map(value -> BossEnum.Financing.forValue(value).getCode()).collect(Collectors.toList()));
        }

        // 转换行业
        if (config.getIndustry() != null) {
            config.setIndustry(config.getIndustry().stream().map(value -> BossEnum.Industry.forValue(value).getCode()).collect(Collectors.toList()));
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
            // 获取当前用户ID
            String userId = System.getenv("BOSS_USER_ID");
            if (userId == null || userId.isEmpty()) {
                userId = System.getProperty("boss.user.id");
            }
            if (userId == null || userId.isEmpty()) {
                userId = "default_user";
            }

            log.debug("尝试为用户 {} 加载默认打招呼语", userId);

            // 尝试多种可能的文件路径
            String[] possiblePaths = {
                "user_data/" + userId + "/default_greeting.json",  // 标准格式
                "user_data/" + userId.replace("_", "@") + "/default_greeting.json",  // 邮箱格式
                "user_data/" + userId.replace("@", "_").replace(".", "_") + "/default_greeting.json",  // 安全格式
                "user_data/" + userId.replace("_sina_com", "@sina.com") + "/default_greeting.json",  // 特殊格式转换
                "user_data/" + userId.replace("_", "@").replace("_com", ".com") + "/default_greeting.json"  // 通用格式转换
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
