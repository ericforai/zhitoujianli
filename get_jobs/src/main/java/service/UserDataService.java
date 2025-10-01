package service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
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

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 确保用户数据目录存在
     */
    private void ensureUserDataDirectory() {
        String userDataPath = UserContextUtil.getUserDataPath();
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
        if (!UserContextUtil.hasCurrentUser()) {
            log.warn("没有当前用户，无法保存配置");
            return false;
        }

        ensureUserDataDirectory();
        
        try {
            String configPath = UserContextUtil.getUserConfigPath();
            
            // 添加用户信息到配置中
            config.put("userId", UserContextUtil.getCurrentUserId());
            config.put("userEmail", UserContextUtil.getCurrentUserEmail());
            config.put("username", UserContextUtil.getCurrentUsername());
            config.put("lastModified", System.currentTimeMillis());
            
            objectMapper.writerWithDefaultPrettyPrinter()
                       .writeValue(new File(configPath), config);
            
            log.info("✅ 用户配置保存成功: userId={}, path={}", 
                    UserContextUtil.getCurrentUserId(), configPath);
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
        if (!UserContextUtil.hasCurrentUser()) {
            log.warn("没有当前用户，返回默认配置");
            return getDefaultConfig();
        }

        try {
            String configPath = UserContextUtil.getUserConfigPath();
            File configFile = new File(configPath);
            
            if (!configFile.exists()) {
                log.info("用户配置文件不存在，返回默认配置: {}", configPath);
                return getDefaultConfig();
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> config = objectMapper.readValue(configFile, Map.class);
            
            log.info("✅ 用户配置加载成功: userId={}, path={}", 
                    UserContextUtil.getCurrentUserId(), configPath);
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
        if (!UserContextUtil.hasCurrentUser()) {
            log.warn("没有当前用户，无法保存AI配置");
            return false;
        }

        ensureUserDataDirectory();
        
        try {
            String aiConfigPath = UserContextUtil.getUserAiConfigPath();
            
            // 添加用户信息到AI配置中
            aiConfig.put("userId", UserContextUtil.getCurrentUserId());
            aiConfig.put("lastModified", System.currentTimeMillis());
            
            objectMapper.writerWithDefaultPrettyPrinter()
                       .writeValue(new File(aiConfigPath), aiConfig);
            
            log.info("✅ 用户AI配置保存成功: userId={}, path={}", 
                    UserContextUtil.getCurrentUserId(), aiConfigPath);
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
        if (!UserContextUtil.hasCurrentUser()) {
            log.warn("没有当前用户，返回默认AI配置");
            return getDefaultAiConfig();
        }

        try {
            String aiConfigPath = UserContextUtil.getUserAiConfigPath();
            File aiConfigFile = new File(aiConfigPath);
            
            if (!aiConfigFile.exists()) {
                log.info("用户AI配置文件不存在，返回默认配置: {}", aiConfigPath);
                return getDefaultAiConfig();
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> aiConfig = objectMapper.readValue(aiConfigFile, Map.class);
            
            log.info("✅ 用户AI配置加载成功: userId={}, path={}", 
                    UserContextUtil.getCurrentUserId(), aiConfigPath);
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
        bossConfig.put("sayHi", "您好！我对这个岗位非常感兴趣...");
        bossConfig.put("keywords", new String[]{"市场总监", "市场营销", "品牌营销"});
        bossConfig.put("cityCode", new String[]{"上海"});
        bossConfig.put("experience", new String[]{"10年以上"});
        bossConfig.put("jobType", "不限");
        bossConfig.put("salary", "30K以上");
        bossConfig.put("degree", new String[]{"不限"});
        bossConfig.put("scale", new String[]{"不限"});
        bossConfig.put("stage", new String[]{"不限"});
        bossConfig.put("expectedSalary", new int[]{30, 50});
        bossConfig.put("waitTime", 10);
        bossConfig.put("filterDeadHR", false);
        bossConfig.put("enableAI", false);
        bossConfig.put("sendImgResume", false);
        bossConfig.put("deadStatus", new String[]{"2周内活跃", "本月活跃", "2月内活跃", "半年前活跃"});
        
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