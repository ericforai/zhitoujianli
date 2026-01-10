package controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
import service.UserActivationService;
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

    @Autowired
    private UserActivationService userActivationService;

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

                // 查询用户套餐（使用email生成userStringId，与数据库格式一致）
                try {
                    // 🔧 修复：使用email生成userStringId（格式：1@1.com -> 1_1_com）
                    String userStringId = user.getEmail().replace("@", "_").replace(".", "_");
                    // 🔧 修复：处理多条套餐记录的情况
                    List<UserPlan> userPlans = userPlanRepository.findByUserIdOrderByCreatedAtDesc(userStringId);
                    Optional<UserPlan> userPlan = userPlans.isEmpty() ? Optional.empty() : Optional.of(userPlans.get(0));
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

            // 🔧 修复：处理多条套餐记录的情况
            List<UserPlan> userPlans = userPlanRepository.findByUserIdOrderByCreatedAtDesc("user_" + userId);
            Optional<UserPlan> userPlan = userPlans.isEmpty() ? Optional.empty() : Optional.of(userPlans.get(0));

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

            // 🔧 修复：根据用户ID查找用户，使用email生成正确的userStringId
            User user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "用户不存在"
                ));
            }
            
            // 使用email生成userStringId（与系统其他部分保持一致）
            // 格式：1@1.com -> 1_1_com
            String userStringId = user.getEmail().replace("@", "_").replace(".", "_");
            log.info("🔍 升级套餐: userId={}, email={}, userStringId={}", userId, user.getEmail(), userStringId);

            // 🔧 修复：处理多条套餐记录的情况
            // 先取消所有ACTIVE状态的套餐，然后创建新套餐
            List<UserPlan> activePlans = userPlanRepository.findByUserIdOrderByCreatedAtDesc(userStringId)
                .stream()
                .filter(plan -> plan.getStatus() == UserPlan.PlanStatus.ACTIVE)
                .collect(Collectors.toList());

            // 取消所有ACTIVE状态的套餐
            for (UserPlan plan : activePlans) {
                plan.setStatus(UserPlan.PlanStatus.CANCELLED);
                plan.setUpdatedAt(LocalDateTime.now());
                userPlanRepository.save(plan);
                log.info("✅ 已取消用户旧套餐: userId={}, planId={}, planType={}", 
                    userStringId, plan.getId(), plan.getPlanType());
            }

            // 创建新套餐
            UserPlan userPlan = UserPlan.builder()
                .userId(userStringId)
                .planType(PlanType.valueOf(request.getPlanType()))
                .status(UserPlan.PlanStatus.ACTIVE)
                .startDate(LocalDate.now())
                .endDate(request.getEndDate())
                .autoRenewal(false)
                .purchasePrice(PlanType.valueOf(request.getPlanType()).getMonthlyPrice())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

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
     * 🔧 修复：支持String类型的userId（前端可能发送字符串）
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> deleteUser(
            @PathVariable String userId,
            @RequestBody(required = false) DeleteUserRequest request) {
        try {
            String adminId = UserContextUtil.getCurrentUserId();

            if (!adminService.hasPermission(adminId, "user_management_delete")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限删除用户"
                ));
            }

            // 🔧 修复：将String类型的userId转换为Long
            Long userIdLong;
            try {
                userIdLong = Long.parseLong(userId);
            } catch (NumberFormatException e) {
                log.error("❌ 无效的用户ID格式: userId={}", userId);
                return ResponseEntity.status(400).body(Map.of(
                    "success", false,
                    "message", "无效的用户ID格式"
                ));
            }

            String reason = request != null && request.getReason() != null
                ? request.getReason()
                : "管理员删除";

            log.info("🗑️ 删除用户请求: userId={}, reason={}, adminId={}", userIdLong, reason, adminId);

            userService.softDeleteUser(userIdLong, reason);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "用户删除成功"
            ));

        } catch (IllegalArgumentException e) {
            // 🔧 修复：区分"用户不存在"和"用户已被删除"两种情况
            String errorMessage = e.getMessage();
            int statusCode;

            if (errorMessage.contains("已被删除")) {
                // 用户已被删除，使用409 Conflict（资源冲突）
                statusCode = 409;
            } else if (errorMessage.contains("不存在")) {
                // 用户不存在，使用404 Not Found
                statusCode = 404;
            } else {
                // 其他参数错误，使用400 Bad Request
                statusCode = 400;
            }

            return ResponseEntity.status(statusCode).body(Map.of(
                "success", false,
                "message", errorMessage
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
     * 批量删除用户（软删除）
     * 🔧 新增：支持批量删除，提高管理效率
     * 🔒 安全：限制最多50个用户，需要权限检查
     */
    @PostMapping("/batch-delete")
    public ResponseEntity<Map<String, Object>> batchDeleteUsers(
            @RequestBody BatchDeleteRequest request) {
        try {
            String adminId = UserContextUtil.getCurrentUserId();

            if (!adminService.hasPermission(adminId, "user_management_delete")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限删除用户"
                ));
            }

            List<String> userIdStrings = request.getUserIds();
            if (userIdStrings == null || userIdStrings.isEmpty()) {
                return ResponseEntity.status(400).body(Map.of(
                    "success", false,
                    "message", "请选择要删除的用户"
                ));
            }

            // 🔒 安全限制：最多允许批量删除50个用户
            if (userIdStrings.size() > 50) {
                return ResponseEntity.status(400).body(Map.of(
                    "success", false,
                    "message", "批量删除最多支持50个用户，请分批操作"
                ));
            }

            String reason = request.getReason() != null
                ? request.getReason()
                : "管理员批量删除";

            log.info("🗑️ 批量删除用户请求: userIds={}, count={}, reason={}, adminId={}",
                userIdStrings, userIdStrings.size(), reason, adminId);

            // 批量删除结果统计
            int successCount = 0;
            int failCount = 0;
            List<Map<String, Object>> failedUsers = new ArrayList<>();

            for (String userIdStr : userIdStrings) {
                try {
                    Long userId = Long.parseLong(userIdStr);
                    userService.softDeleteUser(userId, reason);
                    successCount++;
                } catch (NumberFormatException e) {
                    log.warn("⚠️ 无效的用户ID格式: userId={}", userIdStr);
                    failCount++;
                    failedUsers.add(Map.of(
                        "userId", userIdStr,
                        "error", "无效的用户ID格式"
                    ));
                } catch (IllegalArgumentException e) {
                    log.warn("⚠️ 删除用户失败: userId={}, error={}", userIdStr, e.getMessage());
                    failCount++;
                    failedUsers.add(Map.of(
                        "userId", userIdStr,
                        "error", e.getMessage()
                    ));
                } catch (Exception e) {
                    log.error("❌ 删除用户异常: userId={}", userIdStr, e);
                    failCount++;
                    failedUsers.add(Map.of(
                        "userId", userIdStr,
                        "error", "删除失败: " + e.getMessage()
                    ));
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("success", failCount == 0);
            result.put("message", String.format("批量删除完成：成功 %d 个，失败 %d 个", successCount, failCount));
            result.put("successCount", successCount);
            result.put("failCount", failCount);
            if (!failedUsers.isEmpty()) {
                result.put("failedUsers", failedUsers);
            }

            log.info("✅ 批量删除完成: 成功={}, 失败={}", successCount, failCount);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("❌ 批量删除用户异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "批量删除失败: " + e.getMessage()
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
        public void setEndDate(LocalDate endDate) { 
            // 🔧 修复：允许 null 值（表示永不过期）
            this.endDate = endDate; 
        }
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

    /**
     * 批量删除用户请求
     */
    public static class BatchDeleteRequest {
        private List<String> userIds;
        private String reason;

        public List<String> getUserIds() {
            return userIds;
        }

        public void setUserIds(List<String> userIds) {
            this.userIds = userIds;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }

    public static class ResetQuotaRequest {
        private String quotaKey;
        private String reason;

        public String getQuotaKey() { return quotaKey; }
        public void setQuotaKey(String quotaKey) { this.quotaKey = quotaKey; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    // ==================== 用户激活邮件功能 ====================

    /**
     * 获取未使用的用户列表
     */
    @GetMapping("/inactive")
    public ResponseEntity<Map<String, Object>> getInactiveUsers() {
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
                    "message", "没有权限查看用户列表"
                ));
            }

            List<User> inactiveUsers = userActivationService.getInactiveUsers();

            List<Map<String, Object>> usersList = inactiveUsers.stream()
                .map(this::convertUserToResponse)
                .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                    "users", usersList,
                    "total", inactiveUsers.size()
                )
            ));
        } catch (Exception e) {
            log.error("获取未使用用户列表失败", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取未使用用户列表失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 批量发送激活邮件给未使用的用户
     *
     * @param maxEmails 最大发送数量（默认50）
     * @param delaySeconds 每封邮件之间的延迟秒数（默认2秒）
     */
    @PostMapping("/send-activation-emails")
    public ResponseEntity<Map<String, Object>> sendActivationEmails(
            @RequestParam(defaultValue = "50") int maxEmails,
            @RequestParam(defaultValue = "2") int delaySeconds) {
        try {
            String adminUsername = UserContextUtil.getCurrentAdminUsername();
            if (adminUsername == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "需要管理员登录"
                ));
            }

            if (!adminService.hasPermission(adminUsername, "user_management_write")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限发送激活邮件"
                ));
            }

            log.info("📧 开始批量发送激活邮件: adminUsername={}, maxEmails={}, delaySeconds={}",
                    adminUsername, maxEmails, delaySeconds);

            // 限制最大发送数量，防止误操作
            if (maxEmails > 200) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "单次最多发送200封邮件，请分批发送"
                ));
            }

            Map<String, Object> result = userActivationService.sendActivationEmailsToInactiveUsers(
                    maxEmails, delaySeconds);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", result,
                "message", String.format("激活邮件发送完成: 成功 %d 封，失败 %d 封",
                    result.get("sentCount"), result.get("failedCount"))
            ));
        } catch (Exception e) {
            log.error("批量发送激活邮件失败", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "批量发送激活邮件失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 发送激活邮件给单个用户（用于测试）
     */
    @PostMapping("/{userId}/send-activation-email")
    public ResponseEntity<Map<String, Object>> sendActivationEmailToUser(@PathVariable Long userId) {
        try {
            String adminUsername = UserContextUtil.getCurrentAdminUsername();
            if (adminUsername == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "需要管理员登录"
                ));
            }

            if (!adminService.hasPermission(adminUsername, "user_management_write")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限发送激活邮件"
                ));
            }

            User user = userService.getUserById(userId);
            Map<String, Object> result = userActivationService.sendActivationEmailToUser(user.getEmail());

            return ResponseEntity.ok(Map.of(
                "success", result.get("success"),
                "data", result,
                "message", result.get("message")
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("发送激活邮件失败: userId={}", userId, e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "发送激活邮件失败: " + e.getMessage()
            ));
        }
    }
}

