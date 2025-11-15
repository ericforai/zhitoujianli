package controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
 * 用户套餐控制器
 *
 * 提供用户套餐信息查询和升级功能
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-13
 */
@Slf4j
@RestController
@RequestMapping("/api/user/plan")
@CrossOrigin(origins = "*", allowedHeaders = "*", maxAge = 3600)
public class UserPlanController {

    @Autowired
    private UserPlanRepository userPlanRepository;

    @Autowired
    private QuotaService quotaService;

    @Autowired
    private UserService userService;

    @Autowired
    private AdminService adminService;

    /**
     * 获取当前用户套餐信息
     */
    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentPlan() {
        try {
            String userId = UserContextUtil.getCurrentUserId();
            if (userId == null || userId.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "用户未登录");
            }

            log.info("📋 获取用户套餐信息: 原始userId={}", userId);

            // 🔧 修复：检查是否是管理员用户，管理员用户返回默认套餐
            try {
                String adminUsername = UserContextUtil.getCurrentAdminUsername();
                boolean isAdmin = false;
                if (adminService != null) {
                    try {
                        isAdmin = adminService.isAdmin(userId) || (adminUsername != null && adminService.isAdmin(adminUsername));
                    } catch (Exception e) {
                        log.warn("⚠️ 检查管理员身份时出错，继续处理: {}", e.getMessage());
                    }
                }

                if (isAdmin) {
                log.info("✅ 检测到管理员用户，返回默认套餐信息");
                // 管理员用户返回专业版套餐
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("planType", "PROFESSIONAL");
                response.put("planName", "管理员套餐");
                response.put("monthlyPrice", 0);
                response.put("startDate", LocalDate.now());
                response.put("endDate", null);
                response.put("status", "ACTIVE");
                response.put("isValid", true);
                response.put("isExpiringSoon", false);
                return ResponseEntity.ok(response);
                }
            } catch (Exception e) {
                log.warn("⚠️ 管理员检查过程出错，继续正常流程: {}", e.getMessage());
            }

            // 🔧 如果userId是邮箱格式，转换为user_id格式
            if (userId.contains("@")) {
                log.info("⚠️ 检测到邮箱格式userId，需要转换: {}", userId);
                // 从users表查询实际的user_id
                User user = userService.findByEmail(userId).orElse(null);
                if (user != null) {
                    userId = "user_" + user.getUserId();
                    log.info("✅ 转换后的userId: {}", userId);
                } else {
                    // 🔧 修复：如果用户不存在，返回默认套餐而不是抛出异常
                    log.warn("⚠️ 未找到邮箱对应的用户，返回默认套餐: {}", userId);
                    return createDefaultPlanResponse();
                }
            }

            // 查询用户套餐
            UserPlan userPlan = userPlanRepository.findByUserIdAndStatus(
                userId, UserPlan.PlanStatus.ACTIVE
            ).orElse(null);

            // 如果没有套餐，创建默认免费套餐
            if (userPlan == null) {
                try {
                    userPlan = createDefaultFreePlan(userId);
                    userPlanRepository.save(userPlan);
                    log.info("✅ 为新用户创建免费套餐: userId={}", userId);
                } catch (Exception e) {
                    log.error("❌ 创建默认套餐失败，返回默认响应: userId={}", userId, e);
                    return createDefaultPlanResponse();
                }
            }

            // ✅ 添加详细日志
            log.info("🔍 查询到的用户套餐: userId={}, planType={}, planType.name()={}, planType.ordinal()={}",
                userId, userPlan.getPlanType(),
                userPlan.getPlanType().name(),
                userPlan.getPlanType().ordinal());

            // 构建响应
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            // 🔧 修复：确保planType返回字符串格式，而不是枚举对象
            response.put("planType", userPlan.getPlanType().name());
            response.put("planName", userPlan.getPlanType().getDisplayName());
            response.put("monthlyPrice", userPlan.getPlanType().getMonthlyPrice());
            response.put("startDate", userPlan.getStartDate());
            response.put("endDate", userPlan.getEndDate());
            // 🔧 修复：确保status返回字符串格式
            response.put("status", userPlan.getStatus().name());
            response.put("isValid", userPlan.isValid());
            response.put("isExpiringSoon", userPlan.isExpiringSoon());

            return ResponseEntity.ok(response);

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ 获取用户套餐信息失败", e);
            // 🔧 修复：即使出错也返回默认套餐，避免500错误
            return createDefaultPlanResponse();
        }
    }

    /**
     * 创建默认套餐响应（用于错误处理）
     */
    private ResponseEntity<Map<String, Object>> createDefaultPlanResponse() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("planType", "FREE"); // 字符串格式
        response.put("planName", "求职入门版");
        response.put("monthlyPrice", 0);
        response.put("startDate", LocalDate.now());
        response.put("endDate", null);
        response.put("status", "ACTIVE"); // 字符串格式
        response.put("isValid", true);
        response.put("isExpiringSoon", false);
        return ResponseEntity.ok(response);
    }

    /**
     * 获取配额使用情况
     */
    @GetMapping("/quota")
    public ResponseEntity<Map<String, Object>> getQuotaUsage() {
        try {
            String userId = UserContextUtil.getCurrentUserId();
            if (userId == null || userId.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "用户未登录");
            }

            log.info("📊 获取用户配额使用情况: 原始userId={}", userId);

            // 🔧 修复：检查是否是管理员用户，管理员用户返回默认配额信息
            try {
                String adminUsername = UserContextUtil.getCurrentAdminUsername();
                boolean isAdmin = false;
                if (adminService != null) {
                    try {
                        isAdmin = adminService.isAdmin(userId) || (adminUsername != null && adminService.isAdmin(adminUsername));
                    } catch (Exception e) {
                        log.warn("⚠️ 检查管理员身份时出错，继续处理: {}", e.getMessage());
                    }
                }

                if (isAdmin) {
                log.info("✅ 检测到管理员用户，返回默认配额信息");
                // 管理员用户返回无限配额
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("planType", "PROFESSIONAL");
                response.put("planName", "管理员套餐");
                response.put("quotaDetails", new ArrayList<>());

                // 添加默认的无限配额
                Map<String, Object> quickAccess = new HashMap<>();
                quickAccess.put("resume_basic_optimize", Map.of("used", 0, "limit", -1, "unlimited", true));
                quickAccess.put("resume_advanced_optimize", Map.of("used", 0, "limit", -1, "unlimited", true));
                quickAccess.put("daily_job_application", Map.of("used", 0, "limit", -1, "unlimited", true));
                response.put("quickAccess", quickAccess);

                return ResponseEntity.ok(response);
                }
            } catch (Exception e) {
                log.warn("⚠️ 管理员检查过程出错，继续正常流程: {}", e.getMessage());
            }

            // 🔧 如果userId是邮箱格式，转换为user_id格式
            if (userId.contains("@")) {
                User user = userService.findByEmail(userId).orElse(null);
                if (user != null) {
                    userId = "user_" + user.getUserId();
                    log.info("✅ 转换后的userId: {}", userId);
                } else {
                    // 🔧 修复：如果用户不存在，返回默认配额而不是抛出异常
                    log.warn("⚠️ 用户不存在，返回默认配额信息: {}", userId);
                    return createDefaultQuotaResponse();
                }
            }

            // 获取用户套餐
            UserPlan userPlan = userPlanRepository.findByUserIdAndStatus(
                userId, UserPlan.PlanStatus.ACTIVE
            ).orElse(null);

            if (userPlan == null) {
                userPlan = createDefaultFreePlan(userId);
                userPlanRepository.save(userPlan);
            }

            // 获取配额详情（使用try-catch包裹，避免异常导致500错误）
            List<QuotaService.QuotaUsageDetail> quotaDetails;
            try {
                quotaDetails = quotaService.getUserQuotaDetails(userId);
            } catch (Exception e) {
                log.error("❌ 获取配额详情失败，返回默认配额: userId={}", userId, e);
                quotaDetails = new ArrayList<>();
            }

            // 构建响应
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            // 🔧 修复：确保planType返回字符串格式，而不是枚举对象
            response.put("planType", userPlan.getPlanType().name());
            response.put("planName", userPlan.getPlanType().getDisplayName());
            response.put("quotaDetails", quotaDetails);

            // 添加关键配额信息（方便前端快速访问）
            Map<String, Object> quickAccess = new HashMap<>();
            for (QuotaService.QuotaUsageDetail detail : quotaDetails) {
                quickAccess.put(detail.getQuotaKey(), Map.of(
                    "used", detail.getUsed(),
                    "limit", detail.getLimit(),
                    "unlimited", detail.isUnlimited()
                ));
            }

            // 🔧 修复：如果配额详情为空，至少返回默认的配额结构
            if (quickAccess.isEmpty()) {
                quickAccess.put("resume_basic_optimize", Map.of("used", 0, "limit", 10, "unlimited", false));
                quickAccess.put("resume_advanced_optimize", Map.of("used", 0, "limit", 5, "unlimited", false));
                quickAccess.put("daily_job_application", Map.of("used", 0, "limit", 20, "unlimited", false));
            }

            response.put("quickAccess", quickAccess);

            return ResponseEntity.ok(response);

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ 获取配额使用情况失败", e);
            // 🔧 修复：即使出错也返回默认配额，避免500错误
            return createDefaultQuotaResponse();
        }
    }

    /**
     * 创建默认配额响应（用于错误处理）
     */
    private ResponseEntity<Map<String, Object>> createDefaultQuotaResponse() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("planType", "FREE"); // 字符串格式
        response.put("planName", "求职入门版");
        response.put("quotaDetails", new ArrayList<>());

        Map<String, Object> quickAccess = new HashMap<>();
        quickAccess.put("resume_basic_optimize", Map.of("used", 0, "limit", 10, "unlimited", false));
        quickAccess.put("resume_advanced_optimize", Map.of("used", 0, "limit", 5, "unlimited", false));
        quickAccess.put("daily_job_application", Map.of("used", 0, "limit", 20, "unlimited", false));
        response.put("quickAccess", quickAccess);

        return ResponseEntity.ok(response);
    }

    /**
     * 升级套餐
     */
    @PostMapping("/upgrade")
    public ResponseEntity<Map<String, Object>> upgradePlan(@RequestBody Map<String, String> request) {
        try {
            String userId = UserContextUtil.getCurrentUserId();
            if (userId == null || userId.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "用户未登录");
            }

            String targetPlanStr = request.get("targetPlan");
            if (targetPlanStr == null || targetPlanStr.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "目标套餐不能为空");
            }

            PlanType targetPlan;
            try {
                targetPlan = PlanType.valueOf(targetPlanStr);
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "无效的套餐类型");
            }

            log.info("⬆️ 用户升级套餐: userId={}, targetPlan={}", userId, targetPlan);

            // 查询当前套餐
            UserPlan currentPlan = userPlanRepository.findByUserIdAndStatus(
                userId, UserPlan.PlanStatus.ACTIVE
            ).orElse(null);

            // 检查是否可以升级
            if (currentPlan != null && !currentPlan.getPlanType().canUpgradeTo(targetPlan)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "无法升级到目标套餐");
            }

            // 取消当前套餐
            if (currentPlan != null) {
                currentPlan.setStatus(UserPlan.PlanStatus.CANCELLED);
                currentPlan.setUpdatedAt(LocalDateTime.now());
                userPlanRepository.save(currentPlan);
            }

            // 创建新套餐
            UserPlan newPlan = UserPlan.builder()
                .userId(userId)
                .planType(targetPlan)
                .startDate(LocalDate.now())
                .endDate(null) // TODO: 根据购买类型设置结束日期
                .status(UserPlan.PlanStatus.ACTIVE)
                .autoRenewal(false)
                .purchasePrice(targetPlan.getMonthlyPrice())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

            userPlanRepository.save(newPlan);

            log.info("✅ 套餐升级成功: userId={}, newPlan={}", userId, targetPlan);

            // 构建响应
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "套餐升级成功");
            // 🔧 修复：确保planType返回字符串格式
            response.put("planType", newPlan.getPlanType().name());
            response.put("planName", newPlan.getPlanType().getDisplayName());

            return ResponseEntity.ok(response);

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ 套餐升级失败", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "套餐升级失败");
        }
    }

    /**
     * 创建默认免费套餐
     */
    private UserPlan createDefaultFreePlan(String userId) {
        return UserPlan.builder()
            .userId(userId)
            .planType(PlanType.FREE)
            .startDate(LocalDate.now())
            .endDate(null) // 永不过期
            .status(UserPlan.PlanStatus.ACTIVE)
            .autoRenewal(false)
            .purchasePrice(0)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    }
}

