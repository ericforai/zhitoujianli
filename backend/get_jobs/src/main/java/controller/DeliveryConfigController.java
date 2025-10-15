package controller;

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

/**
 * 投递配置RESTful API控制器
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */
@RestController
@RequestMapping("/api/delivery")
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://115.190.182.95:3000", "http://115.190.182.95"})
public class DeliveryConfigController {

    private final String CONFIG_PATH = "src/main/resources/config.yaml";
    private final ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());

    /**
     * 获取投递配置
     */
    @GetMapping("/config")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDeliveryConfig() {
        try {
            Map<String, Object> config = loadConfig();
            return ResponseEntity.ok(ApiResponse.success(config, "获取投递配置成功"));
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
            saveConfig(config);
            return ResponseEntity.ok(ApiResponse.success(config, "投递配置更新成功"));
        } catch (Exception e) {
            log.error("更新投递配置失败", e);
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
     * 加载配置文件
     */
    private Map<String, Object> loadConfig() throws Exception {
        java.io.File configFile = new java.io.File(CONFIG_PATH);
        if (!configFile.exists()) {
            return new HashMap<>();
        }
        return yamlMapper.readValue(configFile, Map.class);
    }

    /**
     * 保存配置文件
     */
    private void saveConfig(Map<String, Object> config) throws Exception {
        yamlMapper.writeValue(new java.io.File(CONFIG_PATH), config);
    }
}


