package service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import boss.BossEnum;

/**
 * 本地Agent职位搜索服务
 * 负责从用户配置读取搜索条件，生成职位URL列表
 *
 * @author ZhiTouJianLi Team
 * @since 2025-12-19
 */
@Service
public class LocalAgentJobSearchService {

    private static final Logger log = LoggerFactory.getLogger(LocalAgentJobSearchService.class);

    private static final String BASE_URL = "https://www.zhipin.com/web/geek/job";

    @Autowired
    private LocalAgentService localAgentService;

    @Autowired
    private UserDataService userDataService;

    /**
     * 为用户搜索职位并下发任务
     *
     * @param userId 用户ID
     * @return 下发的任务数量
     */
    public int searchAndDispatchJobs(String userId) {
        log.info("📋 开始为用户 {} 搜索职位", userId);

        // 1. 使用UserDataService加载用户配置（复用现有认证上下文）
        Map<String, Object> userConfig = userDataService.loadUserConfig();
        if (userConfig == null || userConfig.isEmpty()) {
            log.error("❌ 无法加载用户配置: userId={}", userId);
            return 0;
        }

        // 2. 从配置中获取搜索参数 - 兼容两种字段名: bossConfig 和 boss
        @SuppressWarnings("unchecked")
        Map<String, Object> bossConfig = (Map<String, Object>) userConfig.get("bossConfig");
        if (bossConfig == null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> bossLegacy = (Map<String, Object>) userConfig.get("boss");
            bossConfig = bossLegacy;
        }

        if (bossConfig == null) {
            log.error("❌ 用户配置中没有 bossConfig 或 boss: userId={}", userId);
            return 0;
        }

        // 3. 提取关键词和城市（兼容多种字段名）
        @SuppressWarnings("unchecked")
        List<String> keywords = (List<String>) bossConfig.get("keywords");

        @SuppressWarnings("unchecked")
        List<String> cities = (List<String>) bossConfig.get("cities");
        if (cities == null) {
            // 兼容旧字段名 cityCode
            @SuppressWarnings("unchecked")
            List<String> cityCode = (List<String>) bossConfig.get("cityCode");
            cities = cityCode;
        }

        String defaultGreeting = (String) bossConfig.get("defaultGreeting");
        if (defaultGreeting == null) {
            // 兼容旧字段名 sayHi
            defaultGreeting = (String) bossConfig.get("sayHi");
        }

        // 添加日志确认打招呼语
        log.info("📋 打招呼语配置: {}", defaultGreeting != null ?
            (defaultGreeting.length() > 50 ? defaultGreeting.substring(0, 50) + "..." : defaultGreeting) : "未配置");

        if (keywords == null || keywords.isEmpty()) {
            log.error("❌ 用户未配置搜索关键词: userId={}", userId);
            return 0;
        }

        log.info("📋 用户配置: 关键词={}, 城市={}", keywords, cities);

        // 3. 生成职位搜索URL列表
        List<Map<String, String>> jobList = generateJobUrls(keywords, cities, bossConfig);

        if (jobList.isEmpty()) {
            log.warn("⚠️ 未生成任何职位URL");
            return 0;
        }

        // 4. 下发单个批量任务给Agent（包含所有关键词，Agent按顺序处理）
        // 构建批量任务config
        Map<String, Object> taskConfig = new HashMap<>();
        taskConfig.put("taskType", "batch_search");  // 批量搜索任务
        taskConfig.put("searchTasks", jobList);  // 所有搜索任务列表
        taskConfig.put("defaultGreeting", defaultGreeting != null ? defaultGreeting : "您好，我对贵公司的职位很感兴趣！");

        // 从用户配置获取投递间隔设置
        Integer deliveryInterval = 30;  // 默认30秒间隔
        Integer maxDeliveryPerKeyword = 5;  // 每个关键词最多投递5个

        @SuppressWarnings("unchecked")
        Map<String, Object> deliveryStrategy = (Map<String, Object>) bossConfig.get("deliveryStrategy");
        if (deliveryStrategy != null) {
            if (deliveryStrategy.get("deliveryInterval") != null) {
                deliveryInterval = ((Number) deliveryStrategy.get("deliveryInterval")).intValue();
            }
            if (deliveryStrategy.get("maxDeliveryPerKeyword") != null) {
                maxDeliveryPerKeyword = ((Number) deliveryStrategy.get("maxDeliveryPerKeyword")).intValue();
            }
        }

        taskConfig.put("deliveryInterval", deliveryInterval);  // 每次投递间隔（秒）
        taskConfig.put("maxDeliveryPerKeyword", maxDeliveryPerKeyword);  // 每个关键词最多投递数
        taskConfig.put("keywordInterval", 60);  // 关键词切换间隔（秒）

        String taskId = localAgentService.createDeliveryTask(
            userId,
            jobList.get(0).get("url"),  // 第一个搜索URL
            "批量搜索投递",
            "Boss直聘",
            defaultGreeting,
            taskConfig
        );

        if (taskId != null) {
            log.info("✅ 批量任务已下发: taskId={}, 关键词数量={}", taskId, jobList.size());
            return 1;  // 返回1个批量任务
        }

        return 0;
    }

    /**
     * 生成职位搜索URL列表
     * 注意：这里生成的是搜索页面URL，Agent会在本地浏览器中打开并自动投递
     */
    private List<Map<String, String>> generateJobUrls(List<String> keywords, List<String> cities, Map<String, Object> bossConfig) {
        List<Map<String, String>> jobs = new ArrayList<>();

        // 获取城市编码（默认北京）
        List<String> cityCodes = new ArrayList<>();
        if (cities != null && !cities.isEmpty()) {
            for (String city : cities) {
                String code = BossEnum.CityCode.forValue(city).getCode();
                cityCodes.add(code);
            }
        } else {
            cityCodes.add("101010100"); // 默认北京
        }

        // 为每个关键词和城市组合生成任务
        for (String keyword : keywords) {
            for (String cityCode : cityCodes) {
                // 构建搜索URL
                String encodedKeyword = URLEncoder.encode(keyword, StandardCharsets.UTF_8);
                String searchUrl = BASE_URL + "?city=" + cityCode + "&query=" + encodedKeyword;

                // 添加其他搜索参数
                searchUrl = appendSearchParams(searchUrl, bossConfig);

                Map<String, String> job = new HashMap<>();
                job.put("url", searchUrl);
                job.put("jobName", keyword);
                job.put("companyName", "Boss直聘");
                job.put("keyword", keyword);
                job.put("city", cityCode);
                job.put("taskType", "search");  // 标记为搜索任务

                jobs.add(job);

                log.info("生成搜索URL: keyword={}, city={}", keyword, cityCode);
            }
        }

        return jobs;
    }

    /**
     * 添加搜索参数到URL
     */
    private String appendSearchParams(String url, Map<String, Object> bossConfig) {
        StringBuilder sb = new StringBuilder(url);

        // 经验要求 - 兼容多种字段名
        String experience = (String) bossConfig.get("experienceRequirement");
        if (experience == null) {
            @SuppressWarnings("unchecked")
            List<String> expList = (List<String>) bossConfig.get("experience");
            if (expList != null && !expList.isEmpty()) {
                experience = expList.get(0);
            }
        }
        if (experience != null && !experience.isEmpty()) {
            String expCode = BossEnum.Experience.forValue(experience).getCode();
            sb.append("&experience=").append(expCode);
        }

        // 学历要求 - 兼容多种字段名
        String education = (String) bossConfig.get("educationRequirement");
        if (education == null) {
            @SuppressWarnings("unchecked")
            List<String> degreeList = (List<String>) bossConfig.get("degree");
            if (degreeList != null && !degreeList.isEmpty()) {
                education = degreeList.get(0);
            }
        }
        if (education != null && !education.isEmpty()) {
            String eduCode = BossEnum.Degree.forValue(education).getCode();
            sb.append("&degree=").append(eduCode);
        }

        // 薪资范围 - 兼容多种格式
        @SuppressWarnings("unchecked")
        Map<String, Object> salaryRange = (Map<String, Object>) bossConfig.get("salaryRange");
        if (salaryRange != null) {
            Object minSalary = salaryRange.get("minSalary");
            Object maxSalary = salaryRange.get("maxSalary");
            if (minSalary != null && maxSalary != null) {
                String salaryStr = minSalary + "K-" + maxSalary + "K";
                String salaryCode = BossEnum.Salary.forValue(salaryStr).getCode();
                sb.append("&salary=").append(salaryCode);
            }
        } else {
            // 兼容旧格式 salary 字段（字符串数组）
            @SuppressWarnings("unchecked")
            List<String> salaryList = (List<String>) bossConfig.get("salary");
            if (salaryList != null && !salaryList.isEmpty()) {
                String salaryCode = BossEnum.Salary.forValue(salaryList.get(0)).getCode();
                sb.append("&salary=").append(salaryCode);
            }
        }

        return sb.toString();
    }
}
