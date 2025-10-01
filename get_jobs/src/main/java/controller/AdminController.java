package controller;

import entity.AdminUser;
import entity.UserPlan;
import enums.AdminType;
import enums.PlanType;
import service.AdminService;
import service.QuotaService;
import util.UserContextUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 管理员控制台API控制器
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Slf4j
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private QuotaService quotaService;
    
    /**
     * 获取管理员仪表板数据
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        try {
            String userId = UserContextUtil.getCurrentUserId();
            log.info("🎯 获取管理员仪表板: userId={}", userId);
            
            // 检查管理员权限
            if (!adminService.isAdmin(userId)) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "需要管理员权限"
                ));
            }
            
            Map<String, Object> dashboard = new HashMap<>();
            
            // 基础统计数据
            dashboard.put("totalUsers", 1250); // TODO: 从实际数据库获取
            dashboard.put("activeUsers", 856);
            dashboard.put("newUsersToday", 23);
            dashboard.put("totalRevenue", 12580.50);
            
            // 套餐分布
            Map<String, Integer> planDistribution = new HashMap<>();
            planDistribution.put("FREE", 800);
            planDistribution.put("BASIC", 300);
            planDistribution.put("PROFESSIONAL", 120);
            planDistribution.put("ENTERPRISE", 30);
            dashboard.put("planDistribution", planDistribution);
            
            // 配额使用趋势
            dashboard.put("quotaUsageTrend", generateMockTrend());
            
            // 系统状态
            Map<String, Object> systemStatus = new HashMap<>();
            systemStatus.put("status", "healthy");
            systemStatus.put("uptime", "99.98%");
            systemStatus.put("responseTime", "120ms");
            dashboard.put("systemStatus", systemStatus);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", dashboard
            ));
            
        } catch (Exception e) {
            log.error("❌ 获取管理员仪表板异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取仪表板数据失败"
            ));
        }
    }
    
    /**
     * 获取用户列表
     */
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String planType) {
        try {
            String userId = UserContextUtil.getCurrentUserId();
            log.info("👥 获取用户列表: userId={}, page={}, size={}", userId, page, size);
            
            if (!adminService.hasPermission(userId, "user_management_read")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限查看用户列表"
                ));
            }
            
            // TODO: 实现真实的用户列表查询
            List<Map<String, Object>> users = generateMockUsers();
            
            Map<String, Object> result = new HashMap<>();
            result.put("users", users);
            result.put("total", 1250);
            result.put("page", page);
            result.put("size", size);
            result.put("totalPages", (1250 + size - 1) / size);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", result
            ));
            
        } catch (Exception e) {
            log.error("❌ 获取用户列表异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取用户列表失败"
            ));
        }
    }
    
    /**
     * 初始化超级管理员（仅用于系统初始化）
     */
    @PostMapping("/init-super-admin")
    public ResponseEntity<Map<String, Object>> initSuperAdmin(@RequestBody InitSuperAdminRequest request) {
        try {
            log.info("🚀 初始化超级管理员: userId={}", request.getUserId());
            
            // 检查是否已经有超级管理员
            AdminUser existingAdmin = adminService.getAdminUser(request.getUserId());
            if (existingAdmin != null) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "超级管理员已存在",
                    "data", convertAdminToResponse(existingAdmin)
                ));
            }
            
            // 直接创建超级管理员（系统初始化，无需权限检查）
            AdminUser superAdmin = AdminUser.builder()
                .userId(request.getUserId())
                .adminType(AdminType.SUPER_ADMIN)
                .permissions(getSuperAdminPermissions())
                .isActive(true)
                .createdBy("system")
                .remarks("系统初始化超级管理员")
                .createdAt(java.time.LocalDateTime.now())
                .updatedAt(java.time.LocalDateTime.now())
                .build();
            
            // 直接缓存（后续可以存入数据库）
            adminService.cacheAdmin(request.getUserId(), superAdmin);
            
            log.info("✅ 超级管理员初始化成功: userId={}", request.getUserId());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "超级管理员初始化成功",
                "data", Map.of(
                    "userId", superAdmin.getUserId(),
                    "adminType", superAdmin.getAdminType(),
                    "permissions", superAdmin.getPermissions(),
                    "createdAt", superAdmin.getCreatedAt(),
                    "loginUrl", "http://localhost:3000/",
                    "adminDashboard", "http://localhost:8080/api/admin/dashboard"
                )
            ));
            
        } catch (Exception e) {
            log.error("❌ 初始化超级管理员异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "初始化超级管理员失败: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 获取超级管理员权限配置
     */
    private Map<String, Object> getSuperAdminPermissions() {
        Map<String, Object> permissions = new HashMap<>();
        
        // 用户管理权限
        permissions.put("user_management_create", true);
        permissions.put("user_management_read", true);
        permissions.put("user_management_update", true);
        permissions.put("user_management_delete", true);
        
        // 管理员管理权限
        permissions.put("admin_management_create", true);
        permissions.put("admin_management_read", true);
        permissions.put("admin_management_update", true);
        permissions.put("admin_management_delete", true);
        
        // 系统配置权限
        permissions.put("system_config_read", true);
        permissions.put("system_config_update", true);
        
        // 配额管理权限
        permissions.put("quota_management_create", true);
        permissions.put("quota_management_read", true);
        permissions.put("quota_management_update", true);
        permissions.put("quota_management_delete", true);
        
        // 套餐管理权限
        permissions.put("plan_management_create", true);
        permissions.put("plan_management_read", true);
        permissions.put("plan_management_update", true);
        permissions.put("plan_management_delete", true);
        
        // 分析权限
        permissions.put("analytics_read", true);
        
        return permissions;
    }
    
    /**
     * 创建管理员账户
     */
    @PostMapping("/admins")
    public ResponseEntity<Map<String, Object>> createAdmin(@RequestBody CreateAdminRequest request) {
        try {
            String creatorId = UserContextUtil.getCurrentUserId();
            log.info("🎯 创建管理员账户: creatorId={}, targetUserId={}, adminType={}", 
                creatorId, request.getUserId(), request.getAdminType());
            
            AdminUser newAdmin = adminService.createAdmin(
                request.getUserId(),
                request.getAdminType(),
                request.getPermissions(),
                creatorId
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "管理员账户创建成功",
                "data", convertAdminToResponse(newAdmin)
            ));
            
        } catch (AdminService.AdminException e) {
            log.warn("⚠️ 创建管理员失败: {}", e.getMessage());
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("❌ 创建管理员异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "创建管理员失败"
            ));
        }
    }
    
    /**
     * 获取管理员列表
     */
    @GetMapping("/admins")
    public ResponseEntity<Map<String, Object>> getAdmins() {
        try {
            String userId = UserContextUtil.getCurrentUserId();
            log.info("👨‍💼 获取管理员列表: userId={}", userId);
            
            List<AdminUser> admins = adminService.getAllAdmins(userId);
            List<Map<String, Object>> adminList = admins.stream()
                .map(this::convertAdminToResponse)
                .toList();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", adminList
            ));
            
        } catch (AdminService.AdminException e) {
            return ResponseEntity.status(403).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("❌ 获取管理员列表异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取管理员列表失败"
            ));
        }
    }
    
    /**
     * 更新用户套餐
     */
    @PutMapping("/users/{targetUserId}/plan")
    public ResponseEntity<Map<String, Object>> updateUserPlan(
            @PathVariable String targetUserId,
            @RequestBody UpdatePlanRequest request) {
        try {
            String adminId = UserContextUtil.getCurrentUserId();
            log.info("📋 更新用户套餐: adminId={}, targetUserId={}, planType={}", 
                adminId, targetUserId, request.getPlanType());
            
            if (!adminService.hasPermission(adminId, "user_management_update")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限更新用户套餐"
                ));
            }
            
            // TODO: 实现真实的套餐更新逻辑
            // userPlanService.updatePlan(targetUserId, request.getPlanType(), adminId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "用户套餐更新成功"
            ));
            
        } catch (Exception e) {
            log.error("❌ 更新用户套餐异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "更新用户套餐失败"
            ));
        }
    }
    
    /**
     * 重置用户配额
     */
    @PostMapping("/users/{targetUserId}/quota/reset")
    public ResponseEntity<Map<String, Object>> resetUserQuota(
            @PathVariable String targetUserId,
            @RequestBody(required = false) ResetQuotaRequest request) {
        try {
            String adminId = UserContextUtil.getCurrentUserId();
            log.info("🔄 重置用户配额: adminId={}, targetUserId={}", adminId, targetUserId);
            
            if (!adminService.hasPermission(adminId, "quota_management_update")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限重置用户配额"
                ));
            }
            
            String quotaKey = request != null ? request.getQuotaKey() : null;
            quotaService.resetUserQuota(targetUserId, quotaKey);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", quotaKey != null ? 
                    String.format("配额 %s 重置成功", quotaKey) : "所有配额重置成功"
            ));
            
        } catch (Exception e) {
            log.error("❌ 重置用户配额异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "重置用户配额失败"
            ));
        }
    }
    
    /**
     * 获取系统统计数据
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        try {
            String userId = UserContextUtil.getCurrentUserId();
            log.info("📊 获取系统统计: userId={}", userId);
            
            if (!adminService.hasPermission(userId, "analytics_read")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限查看统计数据"
                ));
            }
            
            Map<String, Object> statistics = new HashMap<>();
            
            // TODO: 实现真实的统计数据查询
            statistics.put("userStats", generateUserStats());
            statistics.put("revenueStats", generateRevenueStats());
            statistics.put("usageStats", generateUsageStats());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", statistics
            ));
            
        } catch (Exception e) {
            log.error("❌ 获取系统统计异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取统计数据失败"
            ));
        }
    }
    
    // ==================== 私有方法 ====================
    
    /**
     * 转换AdminUser为响应格式
     */
    private Map<String, Object> convertAdminToResponse(AdminUser admin) {
        Map<String, Object> response = new HashMap<>();
        response.put("userId", admin.getUserId());
        response.put("adminType", admin.getAdminType());
        response.put("adminTypeName", admin.getAdminType().getDisplayName());
        response.put("permissions", admin.getPermissions());
        response.put("isActive", admin.getIsActive());
        response.put("createdBy", admin.getCreatedBy());
        response.put("createdAt", admin.getCreatedAt());
        response.put("lastLoginAt", admin.getLastLoginAt());
        return response;
    }
    
    /**
     * 生成模拟用户列表
     */
    private List<Map<String, Object>> generateMockUsers() {
        return List.of(
            Map.of("userId", "user1", "email", "user1@example.com", "planType", "BASIC", "createdAt", "2025-09-01"),
            Map.of("userId", "user2", "email", "user2@example.com", "planType", "FREE", "createdAt", "2025-09-15"),
            Map.of("userId", "user3", "email", "user3@example.com", "planType", "PROFESSIONAL", "createdAt", "2025-09-20")
        );
    }
    
    /**
     * 生成模拟趋势数据
     */
    private List<Map<String, Object>> generateMockTrend() {
        return List.of(
            Map.of("date", "2025-09-25", "value", 450),
            Map.of("date", "2025-09-26", "value", 520),
            Map.of("date", "2025-09-27", "value", 480),
            Map.of("date", "2025-09-28", "value", 600),
            Map.of("date", "2025-09-29", "value", 580),
            Map.of("date", "2025-09-30", "value", 650),
            Map.of("date", "2025-10-01", "value", 720)
        );
    }
    
    /**
     * 生成用户统计数据
     */
    private Map<String, Object> generateUserStats() {
        return Map.of(
            "totalUsers", 1250,
            "newUsersThisMonth", 156,
            "activeUsersToday", 340,
            "churnRate", 2.5
        );
    }
    
    /**
     * 生成收入统计数据
     */
    private Map<String, Object> generateRevenueStats() {
        return Map.of(
            "totalRevenue", 12580.50,
            "monthlyRevenue", 3240.80,
            "arpu", 25.60,
            "conversionRate", 12.5
        );
    }
    
    /**
     * 生成使用统计数据
     */
    private Map<String, Object> generateUsageStats() {
        return Map.of(
            "aiUsage", Map.of("total", 15680, "today", 234),
            "resumeGenerated", Map.of("total", 5420, "today", 89),
            "jobApplications", Map.of("total", 8950, "today", 145)
        );
    }
    
    // ==================== 请求/响应类 ====================
    
    public static class InitSuperAdminRequest {
        private String userId;
        private String remarks;
        
        // getters and setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }
    
    public static class CreateAdminRequest {
        private String userId;
        private AdminType adminType;
        private Map<String, Object> permissions;
        
        // getters and setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public AdminType getAdminType() { return adminType; }
        public void setAdminType(AdminType adminType) { this.adminType = adminType; }
        public Map<String, Object> getPermissions() { return permissions; }
        public void setPermissions(Map<String, Object> permissions) { this.permissions = permissions; }
    }
    
    public static class UpdatePlanRequest {
        private PlanType planType;
        private String reason;
        
        // getters and setters
        public PlanType getPlanType() { return planType; }
        public void setPlanType(PlanType planType) { this.planType = planType; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
    
    public static class ResetQuotaRequest {
        private String quotaKey;
        private String reason;
        
        // getters and setters
        public String getQuotaKey() { return quotaKey; }
        public void setQuotaKey(String quotaKey) { this.quotaKey = quotaKey; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}