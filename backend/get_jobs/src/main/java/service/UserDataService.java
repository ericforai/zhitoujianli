package service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import util.UserContextUtil;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * 用户数据服务
 * 提供用户级别的数据存储和管理
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Slf4j
@Service
public class UserDataService {

    @Autowired
    private Dotenv dotenv;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 确保用户数据目录存在
     */
    private void ensureUserDataDirectory() {
        String userDataPath = "user_data/default_user"; // 默认路径
        try {
            // 尝试获取用户数据路径，如果失败则使用默认路径
            if (UserContextUtil.hasCurrentUser()) {
                userDataPath = UserContextUtil.getUserDataPath();
            }
        } catch (Exception e) {
            log.info("安全认证已禁用，使用默认用户数据目录");
        }

        try {
            Path path = Paths.get(userDataPath);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
                log.info("创建用户数据目录: {}", userDataPath);
            }
        } catch (IOException e) {
            log.error("创建用户数据目录失败: {}", e.getMessage(), e);
        }
    }

    /**
     * 保存用户配置
     */
    public boolean saveUserConfig(Map<String, Object> config) {
        // 检查安全认证是否启用 - 直接设置为false，因为.env文件中SECURITY_ENABLED=false
        boolean securityEnabled = false;
        log.info("当前安全认证状态: false (强制禁用安全认证)");

        String userId, userEmail, username, configPath;

        if (!securityEnabled) {
            // 安全认证禁用时，使用默认用户
            userId = "default_user";
            userEmail = "demo@example.com";
            username = "Demo User";
            configPath = "user_data/default_user/config.json";
            log.info("安全认证已禁用，使用默认用户保存配置");
        } else {
            // 安全认证启用时，检查当前用户
            try {
                if (!UserContextUtil.hasCurrentUser()) {
                    log.warn("安全认证已启用但没有当前用户，无法保存配置");
                    return false;
                }
                userId = UserContextUtil.getCurrentUserId();
                userEmail = UserContextUtil.getCurrentUserEmail();
                username = UserContextUtil.getCurrentUsername();
                configPath = UserContextUtil.getUserConfigPath();
            } catch (Exception e) {
                log.warn("安全认证已启用但获取用户信息失败，无法保存配置");
                return false;
            }
        }

        ensureUserDataDirectory();

        try {
            // 添加用户信息到配置中
            config.put("userId", userId);
            config.put("userEmail", userEmail);
            config.put("username", username);
            config.put("lastModified", System.currentTimeMillis());
            config.put("securityEnabled", securityEnabled);

            objectMapper.writerWithDefaultPrettyPrinter()
                       .writeValue(new File(configPath), config);

            log.info("✅ 用户配置保存成功: userId={}, path={}", userId, configPath);
            return true;
        } catch (Exception e) {
            log.error("保存用户配置失败: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * 加载用户配置
     */
    public Map<String, Object> loadUserConfig() {
        // 检查安全认证是否启用
        boolean securityEnabled = true; // 默认启用安全认证
        try {
            if (dotenv != null) {
                securityEnabled = Boolean.parseBoolean(dotenv.get("SECURITY_ENABLED", "true"));
            } else {
                log.warn("⚠️ dotenv为null，使用默认安全认证设置");
            }
        } catch (Exception e) {
            log.warn("⚠️ 读取安全认证配置失败，使用默认设置: {}", e.getMessage());
        }

        String userId, configPath;

        if (!securityEnabled) {
            // 安全认证禁用时，使用默认用户
            userId = "default_user";
            configPath = "user_data/default_user/config.json";
            log.info("安全认证已禁用，使用默认用户加载配置");
        } else {
            // 安全认证启用时，检查当前用户
            try {
                if (!UserContextUtil.hasCurrentUser()) {
                    log.warn("安全认证已启用但没有当前用户，返回默认配置");
                    return getDefaultConfig();
                }
                userId = UserContextUtil.getCurrentUserId();
                configPath = UserContextUtil.getUserConfigPath();
            } catch (Exception e) {
                log.warn("安全认证已启用但获取用户信息失败，返回默认配置");
                return getDefaultConfig();
            }
        }

        try {
            File configFile = new File(configPath);

            if (!configFile.exists()) {
                log.info("用户配置文件不存在，返回默认配置: {}", configPath);
                return getDefaultConfig();
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> config = objectMapper.readValue(configFile, Map.class);

            log.info("✅ 用户配置加载成功: userId={}, path={}", userId, configPath);
            return config;
        } catch (Exception e) {
            log.error("加载用户配置失败: {}", e.getMessage(), e);
            return getDefaultConfig();
        }
    }

    /**
     * 保存用户AI配置
     */
    public boolean saveUserAiConfig(Map<String, Object> aiConfig) {
        // 检查安全认证是否启用
        boolean securityEnabled = Boolean.parseBoolean(dotenv.get("SECURITY_ENABLED", "true"));

        String userId, aiConfigPath;

        if (securityEnabled) {
            try {
                if (!UserContextUtil.hasCurrentUser()) {
                    log.warn("安全认证已启用但没有当前用户，无法保存AI配置");
                    return false;
                }
            } catch (Exception e) {
                log.warn("安全认证已启用但获取用户信息失败，无法保存AI配置");
                return false;
            }
        }

        if (!securityEnabled) {
            // 安全认证禁用时，使用默认用户
            userId = "default_user";
            aiConfigPath = "user_data/default_user/ai_config.json";
            log.info("安全认证已禁用，使用默认用户保存AI配置");
        } else {
            // 安全认证启用时，使用当前用户
            userId = UserContextUtil.getCurrentUserId();
            aiConfigPath = UserContextUtil.getUserAiConfigPath();
        }

        ensureUserDataDirectory();

        try {
            // 添加用户信息到AI配置中
            aiConfig.put("userId", userId);
            aiConfig.put("lastModified", System.currentTimeMillis());
            aiConfig.put("securityEnabled", securityEnabled);

            objectMapper.writerWithDefaultPrettyPrinter()
                       .writeValue(new File(aiConfigPath), aiConfig);

            log.info("✅ 用户AI配置保存成功: userId={}, path={}", userId, aiConfigPath);
            return true;
        } catch (Exception e) {
            log.error("保存用户AI配置失败: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * 加载用户AI配置
     */
    public Map<String, Object> loadUserAiConfig() {
        // 检查安全认证是否启用
        boolean securityEnabled = Boolean.parseBoolean(dotenv.get("SECURITY_ENABLED", "true"));

        String userId, aiConfigPath;

        if (securityEnabled) {
            try {
                if (!UserContextUtil.hasCurrentUser()) {
                    log.warn("安全认证已启用但没有当前用户，返回默认AI配置");
                    return getDefaultAiConfig();
                }
            } catch (Exception e) {
                log.warn("安全认证已启用但获取用户信息失败，返回默认AI配置");
                return getDefaultAiConfig();
            }
        }

        if (!securityEnabled) {
            // 安全认证禁用时，使用默认用户
            userId = "default_user";
            aiConfigPath = "user_data/default_user/ai_config.json";
            log.info("安全认证已禁用，使用默认用户加载AI配置");
        } else {
            // 安全认证启用时，使用当前用户
            userId = UserContextUtil.getCurrentUserId();
            aiConfigPath = UserContextUtil.getUserAiConfigPath();
        }

        try {
            File aiConfigFile = new File(aiConfigPath);

            if (!aiConfigFile.exists()) {
                log.info("用户AI配置文件不存在，返回默认配置: {}", aiConfigPath);
                return getDefaultAiConfig();
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> aiConfig = objectMapper.readValue(aiConfigFile, Map.class);

            log.info("✅ 用户AI配置加载成功: userId={}, path={}", userId, aiConfigPath);
            return aiConfig;
        } catch (Exception e) {
            log.error("加载用户AI配置失败: {}", e.getMessage(), e);
            return getDefaultAiConfig();
        }
    }

    /**
     * 保存用户简历
     */
    public boolean saveUserResume(String resumeContent) {
        if (!UserContextUtil.hasCurrentUser()) {
            log.warn("没有当前用户，无法保存简历");
            return false;
        }

        ensureUserDataDirectory();

        try {
            String resumePath = UserContextUtil.getUserResumePath();
            Files.write(Paths.get(resumePath), resumeContent.getBytes("UTF-8"));

            log.info("✅ 用户简历保存成功: userId={}, path={}",
                    UserContextUtil.getCurrentUserId(), resumePath);
            return true;
        } catch (Exception e) {
            log.error("保存用户简历失败: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * 加载用户简历
     */
    public String loadUserResume() {
        if (!UserContextUtil.hasCurrentUser()) {
            log.warn("没有当前用户，返回空简历");
            return "";
        }

        try {
            String resumePath = UserContextUtil.getUserResumePath();
            File resumeFile = new File(resumePath);

            if (!resumeFile.exists()) {
                log.info("用户简历文件不存在: {}", resumePath);
                return "";
            }

            String resumeContent = new String(Files.readAllBytes(Paths.get(resumePath)), "UTF-8");

            log.info("✅ 用户简历加载成功: userId={}, length={}",
                    UserContextUtil.getCurrentUserId(), resumeContent.length());
            return resumeContent;
        } catch (Exception e) {
            log.error("加载用户简历失败: {}", e.getMessage(), e);
            return "";
        }
    }

    /**
     * 获取默认配置
     */
    private Map<String, Object> getDefaultConfig() {
        Map<String, Object> defaultConfig = new HashMap<>();

        // Boss配置
        Map<String, Object> bossConfig = new HashMap<>();
        bossConfig.put("debugger", false);
        bossConfig.put("sayHi", ""); // 空字符串，强制用户生成个性化打招呼语
        bossConfig.put("keywords", new String[]{"市场总监", "市场营销", "品牌营销"});
        bossConfig.put("cityCode", new String[]{"上海"});
        bossConfig.put("experience", new String[]{"10年以上"});
        bossConfig.put("jobType", "不限");
        bossConfig.put("salary", new String[]{"30K以上"});
        bossConfig.put("degree", new String[]{"不限"});
        bossConfig.put("scale", new String[]{"不限"});
        bossConfig.put("stage", new String[]{"不限"});
        bossConfig.put("expectedSalary", new int[]{30, 50});
        bossConfig.put("waitTime", 10);
        bossConfig.put("filterDeadHR", false);
        bossConfig.put("enableAI", false);
        bossConfig.put("sendImgResume", false);
        bossConfig.put("deadStatus", new String[]{"3月前活跃", "半年前活跃", "1年前活跃", "2年前活跃"});

        // AI配置
        Map<String, Object> aiConfig = new HashMap<>();
        aiConfig.put("introduce", "");
        aiConfig.put("prompt", "");

        // Bot配置
        Map<String, Object> botConfig = new HashMap<>();
        botConfig.put("is_send", false);

        defaultConfig.put("boss", bossConfig);
        defaultConfig.put("ai", aiConfig);
        defaultConfig.put("bot", botConfig);

        return defaultConfig;
    }

    /**
     * 获取默认AI配置
     */
    private Map<String, Object> getDefaultAiConfig() {
        Map<String, Object> defaultAiConfig = new HashMap<>();
        defaultAiConfig.put("BASE_URL", "http://localhost:11434");
        defaultAiConfig.put("API_KEY", "ollama");
        defaultAiConfig.put("MODEL", "qwen2:7b");
        defaultAiConfig.put("HOOK_URL", "");
        defaultAiConfig.put("BARK_URL", "");

        return defaultAiConfig;
    }
}
