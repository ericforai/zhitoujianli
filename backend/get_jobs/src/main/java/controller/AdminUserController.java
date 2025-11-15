package controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import entity.User;
import entity.UserPlan;
import enums.PlanType;
import lombok.extern.slf4j.Slf4j;
import repository.UserPlanRepository;
import service.AdminService;
import service.QuotaService;
import service.UserService;
import util.UserContextUtil;

/**
 * 管理员用户管理控制器
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = {
    "https://zhitoujianli.com",
    "https://www.zhitoujianli.com",
    "http://localhost:3000",
    "http://localhost:3001"
}, allowCredentials = "true")
public class AdminUserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private QuotaService quotaService;

    @Autowired
    private UserPlanRepository userPlanRepository;

    /**
     * 获取用户列表（分页、搜索、筛选）
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String planType,
            @RequestParam(required = false) Boolean active) {
        try {
            String adminUsername = UserContextUtil.getCurrentAdminUsername();
            if (adminUsername == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "需要管理员登录"
                ));
            }

            log.info("👥 获取用户列表: adminUsername={}, page={}, size={}", adminUsername, page, size);

            if (!adminService.hasPermission(adminUsername, "user_management_read")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限查看用户列表"
                ));
            }

            // 创建分页对象
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

            // 获取用户列表（TODO: 实现搜索和筛选功能）
            Page<User> usersPage = userService.getUsers(pageable);

            // 转换用户数据并添加套餐信息
            java.util.List<Map<String, Object>> usersList = usersPage.getContent().stream().map(user -> {
                Map<String, Object> userData = convertUserToResponse(user);

                // 查询用户套餐（UserId 是 Long，UserPlan.userId 是 String）
                try {
                    String userStringId = "user_" + user.getUserId();
                    Optional<UserPlan> userPlan = userPlanRepository.findByUserId(userStringId);
                    if (userPlan.isPresent()) {
                        userData.put("planType", userPlan.get().getPlanType().name());
                    }
                } catch (Exception e) {
                    log.warn("获取用户套餐失败: userId={}", user.getUserId(), e);
                }

                return userData;
            }).collect(java.util.stream.Collectors.toList());

            Map<String, Object> result = new HashMap<>();
            result.put("users", usersList);
            result.put("total", usersPage.getTotalElements());
            result.put("page", usersPage.getNumber());
            result.put("size", usersPage.getSize());
            result.put("totalPages", usersPage.getTotalPages());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", result
            ));

        } catch (Exception e) {
            log.error("❌ 获取用户列表异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取用户列表失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 获取用户详情
     */
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUserDetail(@PathVariable Long userId) {
        try {
            String adminUsername = UserContextUtil.getCurrentAdminUsername();
            if (adminUsername == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "需要管理员登录"
                ));
            }

            if (!adminService.hasPermission(adminUsername, "user_management_read")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限查看用户详情"
                ));
            }

            User user = userService.getUserById(userId);

            // 获取用户套餐信息
            Optional<UserPlan> userPlan = userPlanRepository.findByUserId("user_" + userId);

            Map<String, Object> userData = convertUserToResponse(user);
            if (userPlan.isPresent()) {
                userData.put("plan", convertPlanToResponse(userPlan.get()));
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", userData
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("❌ 获取用户详情异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取用户详情失败"
            ));
        }
    }

    /**
     * 更新用户套餐
     */
    @PutMapping("/{userId}/plan")
    public ResponseEntity<Map<String, Object>> updateUserPlan(
            @PathVariable Long userId,
            @RequestBody UpdatePlanRequest request) {
        try {
            String adminUsername = UserContextUtil.getCurrentAdminUsername();
            if (adminUsername == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "需要管理员登录"
                ));
            }

            if (!adminService.hasPermission(adminUsername, "user_management_update")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限更新用户套餐"
                ));
            }

            String userStringId = "user_" + userId;

            // 查找或创建用户套餐
            Optional<UserPlan> existingPlan = userPlanRepository.findByUserId(userStringId);
            UserPlan userPlan;

            if (existingPlan.isPresent()) {
                userPlan = existingPlan.get();
                userPlan.setPlanType(PlanType.valueOf(request.getPlanType()));
                userPlan.setStatus(UserPlan.PlanStatus.ACTIVE);
                userPlan.setStartDate(LocalDate.now());
                // endDate可以设置为null表示永不过期
                userPlan.setEndDate(request.getEndDate());
            } else {
                userPlan = UserPlan.builder()
                    .userId(userStringId)
                    .planType(PlanType.valueOf(request.getPlanType()))
                    .status(UserPlan.PlanStatus.ACTIVE)
                    .startDate(LocalDate.now())
                    .endDate(request.getEndDate())
                    .autoRenewal(false)
                    .build();
            }

            userPlanRepository.save(userPlan);

            log.info("✅ 用户套餐更新成功: userId={}, planType={}", userId, request.getPlanType());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "用户套餐更新成功",
                "data", convertPlanToResponse(userPlan)
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", "无效的套餐类型: " + e.getMessage()
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
     * 更新用户状态（激活/禁用）
     */
    @PutMapping("/{userId}/status")
    public ResponseEntity<Map<String, Object>> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody UpdateStatusRequest request) {
        try {
            String adminUsername = UserContextUtil.getCurrentAdminUsername();
            if (adminUsername == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "需要管理员登录"
                ));
            }

            if (!adminService.hasPermission(adminUsername, "user_management_update")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限更新用户状态"
                ));
            }

            // 更新用户状态
            userService.updateUserStatus(userId, request.getActive());

            log.info("✅ 用户状态更新成功: userId={}, active={}", userId, request.getActive());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "用户状态更新成功"
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("❌ 更新用户状态异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "更新用户状态失败"
            ));
        }
    }

    /**
     * 删除用户（软删除）
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> deleteUser(
            @PathVariable Long userId,
            @RequestBody(required = false) DeleteUserRequest request) {
        try {
            String adminId = UserContextUtil.getCurrentUserId();

            if (!adminService.hasPermission(adminId, "user_management_delete")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限删除用户"
                ));
            }

            String reason = request != null && request.getReason() != null
                ? request.getReason()
                : "管理员删除";

            userService.softDeleteUser(userId, reason);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "用户删除成功"
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("❌ 删除用户异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "删除用户失败"
            ));
        }
    }

    /**
     * 重置用户配额
     */
    @PostMapping("/{userId}/quota/reset")
    public ResponseEntity<Map<String, Object>> resetUserQuota(
            @PathVariable Long userId,
            @RequestBody(required = false) ResetQuotaRequest request) {
        try {
            String adminUsername = UserContextUtil.getCurrentAdminUsername();
            if (adminUsername == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "需要管理员登录"
                ));
            }

            if (!adminService.hasPermission(adminUsername, "quota_management_update")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限重置用户配额"
                ));
            }

            String userStringId = "user_" + userId;
            String quotaKey = request != null ? request.getQuotaKey() : null;

            quotaService.resetUserQuota(userStringId, quotaKey);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", quotaKey != null ?
                    String.format("配额 %s 重置成功", quotaKey) : "所有配额重置成功"
            ));

        } catch (Exception e) {
            log.error("❌ 重置用户配额异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "重置用户配额失败: " + e.getMessage()
            ));
        }
    }

    // ==================== 私有方法 ====================

    /**
     * 转换用户对象为响应格式
     */
    private Map<String, Object> convertUserToResponse(User user) {
        Map<String, Object> response = new HashMap<>();

        // 统一使用 userId 字段（转为String，便于前端使用）
        response.put("userId", user.getUserId().toString());
        // 保留 id 字段以兼容旧代码，但建议前端统一使用 userId
        response.put("id", user.getUserId().toString());

        response.put("email", user.getEmail());
        response.put("nickname", user.getUsername());  // 前端期望的 nickname 字段
        response.put("username", user.getUsername());
        response.put("emailVerified", user.getEmailVerified());

        // 统一状态字段：只返回 active (boolean)，前端统一使用 user.active
        response.put("active", user.getActive());
        // 保留 status 字段以兼容旧代码，但建议前端统一使用 active
        response.put("status", user.getActive() ? "enabled" : "disabled");

        // 套餐信息：从用户关联的套餐获取，默认 FREE
        response.put("planType", "FREE");  // 默认值，后续会从 UserPlan 覆盖

        response.put("createdAt", user.getCreatedAt());
        response.put("lastLoginAt", user.getLastLoginAt());
        response.put("lastLoginIp", user.getLastLoginIp());
        response.put("deleted", user.isDeleted());

        return response;
    }

    /**
     * 转换套餐对象为响应格式
     */
    private Map<String, Object> convertPlanToResponse(UserPlan plan) {
        Map<String, Object> response = new HashMap<>();
        response.put("planType", plan.getPlanType());
        response.put("status", plan.getStatus());
        response.put("startDate", plan.getStartDate());
        response.put("endDate", plan.getEndDate());
        response.put("autoRenewal", plan.getAutoRenewal());
        response.put("isValid", plan.isValid());
        return response;
    }

    // ==================== 请求类 ====================

    public static class UpdatePlanRequest {
        private String planType;
        private LocalDate endDate;

        public String getPlanType() { return planType; }
        public void setPlanType(String planType) { this.planType = planType; }
        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    }

    public static class UpdateStatusRequest {
        private Boolean active;

        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
    }

    public static class DeleteUserRequest {
        private String reason;

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class ResetQuotaRequest {
        private String quotaKey;
        private String reason;

        public String getQuotaKey() { return quotaKey; }
        public void setQuotaKey(String quotaKey) { this.quotaKey = quotaKey; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}

