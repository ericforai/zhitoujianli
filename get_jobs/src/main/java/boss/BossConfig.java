package boss;

import lombok.Data;
import lombok.SneakyThrows;
import utils.JobUtils;
import util.UserContextUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.File;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

/**
 * @author loks666
 * 项目链接: <a href="https://github.com/loks666/get_jobs">https://github.com/loks666/get_jobs</a>
 */
@Data
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
    private String salary;

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

    @SneakyThrows
    public static BossConfig init() {
        return init(null);
    }

    @SneakyThrows
    public static BossConfig init(String userId) {
        // 1. 首先加载默认配置
        BossConfig defaultConfig = JobUtils.getConfig(BossConfig.class);
        
        // 2. 如果提供了userId，尝试加载用户个人配置
        BossConfig userConfig = null;
        if (userId != null && !userId.isEmpty()) {
            userConfig = loadUserConfig(userId);
        }
        
        // 3. 合并配置：用户配置覆盖默认配置
        BossConfig finalConfig = mergeConfig(defaultConfig, userConfig);
        
        // 4. 执行配置转换
        convertConfig(finalConfig);
        
        return finalConfig;
    }

    @SneakyThrows
    private static BossConfig loadUserConfig(String userId) {
        try {
            String cleanUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "_");
            String userConfigPath = "user_data/" + cleanUserId + "/config.json";
            File configFile = new File(userConfigPath);
            
            if (!configFile.exists()) {
                System.out.println("用户配置文件不存在: " + userConfigPath);
                return null;
            }
            
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(configFile);
            JsonNode bossNode = rootNode.path("boss");
            
            if (bossNode.isMissingNode()) {
                System.out.println("用户配置中没有boss配置节点");
                return null;
            }
            
            BossConfig userConfig = mapper.treeToValue(bossNode, BossConfig.class);
            System.out.println("✅ 成功加载用户配置: userId=" + userId + ", keywords=" + userConfig.getKeywords());
            return userConfig;
            
        } catch (Exception e) {
            System.err.println("❌ 加载用户配置失败: userId=" + userId + ", error=" + e.getMessage());
            return null;
        }
    }

    private static BossConfig mergeConfig(BossConfig defaultConfig, BossConfig userConfig) {
        if (userConfig == null) {
            System.out.println("使用默认配置");
            return defaultConfig;
        }
        
        BossConfig merged = new BossConfig();
        
        // 复制默认配置
        merged.setSayHi(defaultConfig.getSayHi());
        merged.setDebugger(defaultConfig.getDebugger());
        merged.setKeywords(defaultConfig.getKeywords());
        merged.setCityCode(defaultConfig.getCityCode());
        merged.setCustomCityCode(defaultConfig.getCustomCityCode());
        merged.setIndustry(defaultConfig.getIndustry());
        merged.setExperience(defaultConfig.getExperience());
        merged.setJobType(defaultConfig.getJobType());
        merged.setSalary(defaultConfig.getSalary());
        merged.setDegree(defaultConfig.getDegree());
        merged.setScale(defaultConfig.getScale());
        merged.setStage(defaultConfig.getStage());
        merged.setEnableAI(defaultConfig.getEnableAI());
        merged.setEnableSmartGreeting(defaultConfig.getEnableSmartGreeting());
        merged.setFilterDeadHR(defaultConfig.getFilterDeadHR());
        merged.setSendImgResume(defaultConfig.getSendImgResume());
        merged.setExpectedSalary(defaultConfig.getExpectedSalary());
        merged.setWaitTime(defaultConfig.getWaitTime());
        merged.setDeadStatus(defaultConfig.getDeadStatus());
        
        // 用用户配置覆盖默认配置
        if (userConfig.getSayHi() != null) merged.setSayHi(userConfig.getSayHi());
        if (userConfig.getDebugger() != null) merged.setDebugger(userConfig.getDebugger());
        if (userConfig.getKeywords() != null) merged.setKeywords(userConfig.getKeywords());
        if (userConfig.getCityCode() != null) merged.setCityCode(userConfig.getCityCode());
        if (userConfig.getCustomCityCode() != null) merged.setCustomCityCode(userConfig.getCustomCityCode());
        if (userConfig.getIndustry() != null) merged.setIndustry(userConfig.getIndustry());
        if (userConfig.getExperience() != null) merged.setExperience(userConfig.getExperience());
        if (userConfig.getJobType() != null) merged.setJobType(userConfig.getJobType());
        if (userConfig.getSalary() != null) merged.setSalary(userConfig.getSalary());
        if (userConfig.getDegree() != null) merged.setDegree(userConfig.getDegree());
        if (userConfig.getScale() != null) merged.setScale(userConfig.getScale());
        if (userConfig.getStage() != null) merged.setStage(userConfig.getStage());
        if (userConfig.getEnableAI() != null) merged.setEnableAI(userConfig.getEnableAI());
        if (userConfig.getEnableSmartGreeting() != null) merged.setEnableSmartGreeting(userConfig.getEnableSmartGreeting());
        if (userConfig.getFilterDeadHR() != null) merged.setFilterDeadHR(userConfig.getFilterDeadHR());
        if (userConfig.getSendImgResume() != null) merged.setSendImgResume(userConfig.getSendImgResume());
        if (userConfig.getExpectedSalary() != null) merged.setExpectedSalary(userConfig.getExpectedSalary());
        if (userConfig.getWaitTime() != null) merged.setWaitTime(userConfig.getWaitTime());
        if (userConfig.getDeadStatus() != null) merged.setDeadStatus(userConfig.getDeadStatus());
        
        System.out.println("✅ 配置合并完成: keywords=" + merged.getKeywords());
        return merged;
    }

    private static void convertConfig(BossConfig config) {
        // 转换工作类型
        if (config.getJobType() != null) {
        config.setJobType(BossEnum.JobType.forValue(config.getJobType()).getCode());
        }
        // 转换薪资范围
        if (config.getSalary() != null) {
        config.setSalary(BossEnum.Salary.forValue(config.getSalary()).getCode());
        }
        // 转换城市编码
        if (config.getCityCode() != null) {
            List<String> convertedCityCodes = config.getCityCode().stream()
                    .map(city -> {
                        // 优先从自定义映射中获取
                        if (config.getCustomCityCode() != null && config.getCustomCityCode().containsKey(city)) {
                            return config.getCustomCityCode().get(city);
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
    }

}
