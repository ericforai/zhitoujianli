package controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import entity.FeatureFlag;
import lombok.extern.slf4j.Slf4j;
import service.AdminService;
import service.FeatureFlagService;
import util.UserContextUtil;

/**
 * 管理员功能控制控制器
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/features")
@CrossOrigin(origins = {
    "https://zhitoujianli.com",
    "https://www.zhitoujianli.com",
    "http://localhost:3000",
    "http://localhost:3001"
}, allowCredentials = "true")
public class AdminFeatureController {

    @Autowired
    private FeatureFlagService featureFlagService;

    @Autowired
    private AdminService adminService;

    /**
     * 获取功能列表
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getFeatures() {
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
                    "message", "没有权限查看功能列表"
                ));
            }

            List<FeatureFlag> features = featureFlagService.getAllFeatures();

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", features.stream().map(this::convertFeatureToResponse).toList()
            ));

        } catch (Exception e) {
            log.error("❌ 获取功能列表异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取功能列表失败"
            ));
        }
    }

    /**
     * 获取功能详情
     */
    @GetMapping("/{featureKey}")
    public ResponseEntity<Map<String, Object>> getFeature(@PathVariable String featureKey) {
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
                    "message", "没有权限查看功能详情"
                ));
            }

            FeatureFlag feature = featureFlagService.getFeature(featureKey)
                    .orElseThrow(() -> new IllegalArgumentException("功能不存在: " + featureKey));

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", convertFeatureToResponse(feature)
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("❌ 获取功能详情异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取功能详情失败"
            ));
        }
    }

    /**
     * 创建功能开关
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createFeature(@RequestBody CreateFeatureRequest request) {
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
                    "message", "没有权限创建功能开关"
                ));
            }

            FeatureFlag feature = FeatureFlag.builder()
                    .featureKey(request.getFeatureKey())
                    .featureName(request.getFeatureName())
                    .description(request.getDescription())
                    .enabled(request.getEnabled() != null ? request.getEnabled() : true)
                    .targetPlans(request.getTargetPlans())
                    .targetUsers(request.getTargetUsers())
                    .config(request.getConfig())
                    .build();

            feature = featureFlagService.createFeature(feature);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "功能开关创建成功",
                "data", convertFeatureToResponse(feature)
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("❌ 创建功能开关异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "创建功能开关失败"
            ));
        }
    }

    /**
     * 更新功能开关
     */
    @PutMapping("/{featureKey}")
    public ResponseEntity<Map<String, Object>> updateFeature(
            @PathVariable String featureKey,
            @RequestBody UpdateFeatureRequest request) {
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
                    "message", "没有权限更新功能开关"
                ));
            }

            FeatureFlag existingFeature = featureFlagService.getFeature(featureKey)
                    .orElseThrow(() -> new IllegalArgumentException("功能不存在: " + featureKey));

            // 更新字段
            if (request.getFeatureName() != null) {
                existingFeature.setFeatureName(request.getFeatureName());
            }
            if (request.getDescription() != null) {
                existingFeature.setDescription(request.getDescription());
            }
            if (request.getEnabled() != null) {
                existingFeature.setEnabled(request.getEnabled());
            }
            if (request.getTargetPlans() != null) {
                existingFeature.setTargetPlans(request.getTargetPlans());
            }
            if (request.getTargetUsers() != null) {
                existingFeature.setTargetUsers(request.getTargetUsers());
            }
            if (request.getConfig() != null) {
                existingFeature.setConfig(request.getConfig());
            }

            FeatureFlag updatedFeature = featureFlagService.updateFeature(existingFeature);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "功能开关更新成功",
                "data", convertFeatureToResponse(updatedFeature)
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("❌ 更新功能开关异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "更新功能开关失败"
            ));
        }
    }

    /**
     * 切换功能状态
     */
    @PutMapping("/{featureKey}/toggle")
    public ResponseEntity<Map<String, Object>> toggleFeature(@PathVariable String featureKey) {
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
                    "message", "没有权限切换功能状态"
                ));
            }

            FeatureFlag feature = featureFlagService.toggleFeature(featureKey);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", feature.getEnabled() ? "功能已启用" : "功能已禁用",
                "data", convertFeatureToResponse(feature)
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("❌ 切换功能状态异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "切换功能状态失败"
            ));
        }
    }

    /**
     * 检查功能是否可用
     */
    @GetMapping("/check/{featureKey}")
    public ResponseEntity<Map<String, Object>> checkFeature(
            @PathVariable String featureKey,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String planType) {
        try {
            // 检查功能是否启用
            boolean enabled = featureFlagService.isFeatureEnabled(featureKey);

            Map<String, Object> result = new HashMap<>();
            result.put("featureKey", featureKey);
            result.put("enabled", enabled);

            // 如果提供了userId和planType，检查用户是否可以使用
            if (userId != null && planType != null) {
                boolean available = featureFlagService.isFeatureAvailable(featureKey, userId, planType);
                result.put("available", available);
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", result
            ));

        } catch (Exception e) {
            log.error("❌ 检查功能可用性异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "检查功能可用性失败"
            ));
        }
    }

    // ==================== 私有方法 ====================

    /**
     * 转换功能对象为响应格式
     */
    private Map<String, Object> convertFeatureToResponse(FeatureFlag feature) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", feature.getId());
        response.put("featureKey", feature.getFeatureKey());
        response.put("featureName", feature.getFeatureName());
        response.put("description", feature.getDescription());
        response.put("enabled", feature.getEnabled());
        response.put("targetPlans", feature.getTargetPlans());
        response.put("targetUsers", feature.getTargetUsers());
        response.put("config", feature.getConfig());
        response.put("createdAt", feature.getCreatedAt());
        response.put("updatedAt", feature.getUpdatedAt());
        return response;
    }

    // ==================== 请求类 ====================

    public static class CreateFeatureRequest {
        private String featureKey;
        private String featureName;
        private String description;
        private Boolean enabled;
        private java.util.List<String> targetPlans;
        private java.util.List<String> targetUsers;
        private java.util.Map<String, Object> config;

        // getters and setters
        public String getFeatureKey() { return featureKey; }
        public void setFeatureKey(String featureKey) { this.featureKey = featureKey; }
        public String getFeatureName() { return featureName; }
        public void setFeatureName(String featureName) { this.featureName = featureName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Boolean getEnabled() { return enabled; }
        public void setEnabled(Boolean enabled) { this.enabled = enabled; }
        public java.util.List<String> getTargetPlans() { return targetPlans; }
        public void setTargetPlans(java.util.List<String> targetPlans) { this.targetPlans = targetPlans; }
        public java.util.List<String> getTargetUsers() { return targetUsers; }
        public void setTargetUsers(java.util.List<String> targetUsers) { this.targetUsers = targetUsers; }
        public java.util.Map<String, Object> getConfig() { return config; }
        public void setConfig(java.util.Map<String, Object> config) { this.config = config; }
    }

    public static class UpdateFeatureRequest {
        private String featureName;
        private String description;
        private Boolean enabled;
        private java.util.List<String> targetPlans;
        private java.util.List<String> targetUsers;
        private java.util.Map<String, Object> config;

        // getters and setters
        public String getFeatureName() { return featureName; }
        public void setFeatureName(String featureName) { this.featureName = featureName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Boolean getEnabled() { return enabled; }
        public void setEnabled(Boolean enabled) { this.enabled = enabled; }
        public java.util.List<String> getTargetPlans() { return targetPlans; }
        public void setTargetPlans(java.util.List<String> targetPlans) { this.targetPlans = targetPlans; }
        public java.util.List<String> getTargetUsers() { return targetUsers; }
        public void setTargetUsers(java.util.List<String> targetUsers) { this.targetUsers = targetUsers; }
        public java.util.Map<String, Object> getConfig() { return config; }
        public void setConfig(java.util.Map<String, Object> config) { this.config = config; }
    }
}

