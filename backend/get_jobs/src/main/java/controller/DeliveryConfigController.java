package controller;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;

import dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import util.UserContextUtil;

/**
 * 投递配置RESTful API控制器
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */
@RestController
@RequestMapping("/api/delivery/config")
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://115.190.182.95:3000", "http://115.190.182.95"})
public class DeliveryConfigController {

    // ✅ 废弃全局配置，改用用户隔离配置
    // private static final String CONFIG_PATH = "src/main/resources/config.yaml";
    private final ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());
    private final ObjectMapper jsonMapper = new ObjectMapper();  // JSON格式（与Boss程序保持一致）

    /**
     * 获取投递配置
     */
    @GetMapping("/config")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDeliveryConfig() {
        try {
            Map<String, Object> config = loadConfig();
            return ResponseEntity.ok(ApiResponse.success(config, "获取投递配置成功"));
        } catch (exception.UnauthorizedException e) {
            log.warn("用户未登录，无法获取配置: {}", e.getMessage());
            return ResponseEntity.status(401)
                .body(ApiResponse.error("用户未登录或Token无效，请先登录"));
        } catch (Exception e) {
            log.error("获取投递配置失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("获取投递配置失败: " + e.getMessage()));
        }
    }

    /**
     * 更新投递配置
     */
    @PutMapping("/config")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateDeliveryConfig(
            @RequestBody Map<String, Object> config) {
        try {
            log.info("📥 收到配置更新请求，数据: {}", config);
            saveConfig(config);
            log.info("✅ 配置保存完成");
            return ResponseEntity.ok(ApiResponse.success(config, "投递配置更新成功"));
        } catch (exception.UnauthorizedException e) {
            log.warn("用户未登录，无法保存配置: {}", e.getMessage());
            return ResponseEntity.status(401)
                .body(ApiResponse.error("用户未登录或Token无效，请先登录"));
        } catch (Exception e) {
            log.error("❌ 更新投递配置失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("更新投递配置失败: " + e.getMessage()));
        }
    }

    /**
     * 获取Boss直聘配置
     */
    @GetMapping("/boss-config")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBossConfig() {
        try {
            Map<String, Object> config = loadConfig();
            Map<String, Object> bossConfig = (Map<String, Object>) config.getOrDefault("bossConfig", new HashMap<>());
            return ResponseEntity.ok(ApiResponse.success(bossConfig, "获取Boss配置成功"));
        } catch (Exception e) {
            log.error("获取Boss配置失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("获取Boss配置失败: " + e.getMessage()));
        }
    }

    /**
     * 更新Boss直聘配置
     */
    @PutMapping("/boss-config")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateBossConfig(
            @RequestBody Map<String, Object> bossConfig) {
        try {
            Map<String, Object> config = loadConfig();
            config.put("bossConfig", bossConfig);
            saveConfig(config);
            return ResponseEntity.ok(ApiResponse.success(bossConfig, "Boss配置更新成功"));
        } catch (Exception e) {
            log.error("更新Boss配置失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("更新Boss配置失败: " + e.getMessage()));
        }
    }

    /**
     * 添加黑名单项
     */
    @PostMapping("/blacklist")
    public ResponseEntity<ApiResponse<Void>> addBlacklistItem(
            @RequestBody Map<String, String> request) {
        try {
            String type = request.get("type");
            String value = request.get("value");

            Map<String, Object> config = loadConfig();
            Map<String, Object> blacklistConfig = (Map<String, Object>) config.getOrDefault("blacklistConfig", new HashMap<>());

            java.util.List<String> list;
            switch (type) {
                case "company":
                    list = (java.util.List<String>) blacklistConfig.getOrDefault("companyBlacklist", new java.util.ArrayList<>());
                    list.add(value);
                    blacklistConfig.put("companyBlacklist", list);
                    break;
                case "position":
                    list = (java.util.List<String>) blacklistConfig.getOrDefault("positionBlacklist", new java.util.ArrayList<>());
                    list.add(value);
                    blacklistConfig.put("positionBlacklist", list);
                    break;
                case "keyword":
                    list = (java.util.List<String>) blacklistConfig.getOrDefault("keywordBlacklist", new java.util.ArrayList<>());
                    list.add(value);
                    blacklistConfig.put("keywordBlacklist", list);
                    break;
            }

            config.put("blacklistConfig", blacklistConfig);
            saveConfig(config);

            return ResponseEntity.ok(ApiResponse.success("黑名单项添加成功"));
        } catch (Exception e) {
            log.error("添加黑名单项失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("添加黑名单项失败: " + e.getMessage()));
        }
    }

    /**
     * 获取黑名单配置
     */
    @GetMapping("/blacklist")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBlacklistConfig() {
        try {
            Map<String, Object> config = loadConfig();
            Map<String, Object> blacklistConfig = (Map<String, Object>) config.getOrDefault("blacklistConfig", new HashMap<>());
            return ResponseEntity.ok(ApiResponse.success(blacklistConfig, "获取黑名单配置成功"));
        } catch (Exception e) {
            log.error("获取黑名单配置失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("获取黑名单配置失败: " + e.getMessage()));
        }
    }

    /**
     * 获取用户配置文件路径（用户隔离）
     */
    private String getUserConfigPath() throws exception.UnauthorizedException {
        String userId = UserContextUtil.getCurrentUserId();  // 可能抛出UnauthorizedException
        // 清理userId中的非法字符（与Boss程序保持一致）
        String safeUserId = userId.replaceAll("[^a-zA-Z0-9_@.-]", "_");

        // 使用user_data目录（与Boss程序保持一致）
        String configPath = "user_data" + File.separator + safeUserId + File.separator + "config.json";
        log.info("用户配置路径: userId={}, path={}", userId, configPath);
        return configPath;
    }

    /**
     * 加载配置文件（用户隔离）
     */
    private Map<String, Object> loadConfig() throws Exception {
        String configPath = getUserConfigPath();
        File configFile = new File(configPath);

        if (!configFile.exists()) {
            log.info("用户配置文件不存在，返回空配置: {}", configPath);
            return new HashMap<>();
        }

        // 使用JSON格式（与Boss程序保持一致）
        Map<String, Object> config = jsonMapper.readValue(configFile, Map.class);
        log.info("✅ 加载用户配置成功: {}", configPath);
        return config;
    }

    /**
     * 保存配置文件（用户隔离）
     */
    private void saveConfig(Map<String, Object> config) throws Exception {
        String configPath = getUserConfigPath();
        File configFile = new File(configPath);

        log.info("💾 准备保存配置到: {}", configPath);
        log.info("💾 配置数据: {}", config);

        // 确保目录存在
        File parentDir = configFile.getParentFile();
        if (!parentDir.exists()) {
            parentDir.mkdirs();
            log.info("📁 创建用户配置目录: {}", parentDir.getAbsolutePath());
        }

        // 添加元数据
        String userId = UserContextUtil.getCurrentUserId();
        config.put("userId", userId);
        config.put("lastModified", System.currentTimeMillis());

        log.info("💾 最终保存的数据: {}", config);

        // 使用JSON格式（与Boss程序保持一致）
        jsonMapper.writerWithDefaultPrettyPrinter().writeValue(configFile, config);

        // 验证文件是否真的被写入
        if (configFile.exists()) {
            log.info("✅ 保存用户配置成功: {}, 文件大小: {} bytes", configPath, configFile.length());
        } else {
            log.error("❌ 文件保存失败！文件不存在: {}", configPath);
            throw new Exception("配置文件保存失败");
        }
    }
}


