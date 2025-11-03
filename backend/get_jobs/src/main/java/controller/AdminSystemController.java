package controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import entity.SystemConfig;
import lombok.extern.slf4j.Slf4j;
import service.AdminService;
import service.SystemConfigService;
import util.UserContextUtil;

/**
 * 管理员系统配置控制器
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/system")
@CrossOrigin(origins = {
    "https://zhitoujianli.com",
    "https://www.zhitoujianli.com",
    "http://localhost:3000",
    "http://localhost:3001"
}, allowCredentials = "true")
public class AdminSystemController {

    @Autowired
    private SystemConfigService systemConfigService;

    @Autowired
    private AdminService adminService;

    /**
     * 获取系统配置（单数路径，兼容前端）
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfigSingular() {
        return getConfigs();
    }

    /**
     * 获取系统配置列表
     */
    @GetMapping("/configs")
    public ResponseEntity<Map<String, Object>> getConfigs() {
        try {
            String adminUsername = UserContextUtil.getCurrentAdminUsername();
            if (adminUsername == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "需要管理员登录"
                ));
            }

            if (!adminService.hasPermission(adminUsername, "system_config_read")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限查看系统配置"
                ));
            }

            List<SystemConfig> configs = systemConfigService.getAllConfigs();

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", configs.stream().map(this::convertConfigToResponse).toList()
            ));

        } catch (Exception e) {
            log.error("❌ 获取系统配置列表异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取系统配置列表失败"
            ));
        }
    }

    /**
     * 获取配置值
     */
    @GetMapping("/configs/{configKey}")
    public ResponseEntity<Map<String, Object>> getConfig(@PathVariable String configKey) {
        try {
            String adminUsername = UserContextUtil.getCurrentAdminUsername();
            if (adminUsername == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "需要管理员登录"
                ));
            }

            if (!adminService.hasPermission(adminUsername, "system_config_read")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限查看系统配置"
                ));
            }

            SystemConfig config = systemConfigService.getConfig(configKey)
                    .orElseThrow(() -> new IllegalArgumentException("配置不存在: " + configKey));

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", convertConfigToResponse(config)
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("❌ 获取系统配置异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取系统配置失败"
            ));
        }
    }

    /**
     * 更新配置值
     */
    @PutMapping("/configs/{configKey}")
    public ResponseEntity<Map<String, Object>> updateConfig(
            @PathVariable String configKey,
            @RequestBody UpdateConfigRequest request) {
        try {
            String adminUsername = UserContextUtil.getCurrentAdminUsername();
            if (adminUsername == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "需要管理员登录"
                ));
            }

            if (!adminService.hasPermission(adminUsername, "system_config_update")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限更新系统配置"
                ));
            }

            SystemConfig config = systemConfigService.setConfig(
                    configKey,
                    request.getConfigValue(),
                    request.getConfigType() != null ? request.getConfigType() : SystemConfig.ConfigType.STRING.name(),
                    request.getDescription(),
                    adminUsername);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "系统配置更新成功",
                "data", convertConfigToResponse(config)
            ));

        } catch (Exception e) {
            log.error("❌ 更新系统配置异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "更新系统配置失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 删除配置
     */
    @DeleteMapping("/configs/{configKey}")
    public ResponseEntity<Map<String, Object>> deleteConfig(@PathVariable String configKey) {
        try {
            String adminUsername = UserContextUtil.getCurrentAdminUsername();
            if (adminUsername == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "需要管理员登录"
                ));
            }

            if (!adminService.hasPermission(adminUsername, "system_config_update")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限删除系统配置"
                ));
            }

            systemConfigService.deleteConfig(configKey);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "系统配置删除成功"
            ));

        } catch (Exception e) {
            log.error("❌ 删除系统配置异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "删除系统配置失败: " + e.getMessage()
            ));
        }
    }

    // ==================== 私有方法 ====================

    /**
     * 转换系统配置对象为响应格式
     */
    private Map<String, Object> convertConfigToResponse(SystemConfig config) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", config.getId());
        response.put("configKey", config.getConfigKey());
        response.put("configValue", config.getConfigValue());
        response.put("configType", config.getConfigType());
        response.put("description", config.getDescription());
        response.put("updatedBy", config.getUpdatedBy());
        response.put("updatedAt", config.getUpdatedAt());
        response.put("valueAsType", config.getValueAsType());
        return response;
    }

    // ==================== 请求类 ====================

    public static class UpdateConfigRequest {
        private String configValue;
        private String configType;
        private String description;

        // getters and setters
        public String getConfigValue() { return configValue; }
        public void setConfigValue(String configValue) { this.configValue = configValue; }
        public String getConfigType() { return configType; }
        public void setConfigType(String configType) { this.configType = configType; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
}

