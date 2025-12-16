package controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import entity.UserPlan;
import enums.PlanType;
import lombok.extern.slf4j.Slf4j;
import repository.UserPlanRepository;
import service.AdminService;
import util.UserContextUtil;

/**
 * 管理员用户套餐管理控制器
 *
 * 提供管理员手动升级/降级用户套餐的功能
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-13
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/user-plans")
// ✅ 修复：移除@CrossOrigin注解，使用全局CorsConfig统一管理
public class AdminUserPlanController {

    @Autowired
    private UserPlanRepository userPlanRepository;

    @Autowired
    private AdminService adminService;

    /**
     * 获取所有用户套餐列表
     */
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getAllUserPlans(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size
    ) {
        try {
            // 检查管理员权限
            String currentUserId = UserContextUtil.getCurrentUserId();
            if (!adminService.isAdmin(currentUserId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "需要管理员权限");
            }

            log.info("📋 管理员获取用户套餐列表: adminId={}", currentUserId);

            // 获取所有用户套餐（按创建时间倒序）
            List<UserPlan> allPlans = userPlanRepository.findAll();

            // 统计各套餐类型数量
            Map<PlanType, Long> planTypeCounts = allPlans.stream()
                .filter(p -> p.getStatus() == UserPlan.PlanStatus.ACTIVE)
                .collect(Collectors.groupingBy(UserPlan::getPlanType, Collectors.counting()));

            // 构建响应
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("plans", allPlans);
            response.put("total", allPlans.size());
            response.put("statistics", Map.of(
                "FREE", planTypeCounts.getOrDefault(PlanType.FREE, 0L),
                "BASIC", planTypeCounts.getOrDefault(PlanType.BASIC, 0L),
                "PROFESSIONAL", planTypeCounts.getOrDefault(PlanType.PROFESSIONAL, 0L)
            ));

            return ResponseEntity.ok(response);

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ 获取用户套餐列表失败", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "获取套餐列表失败");
        }
    }

    /**
     * 管理员手动升级/更改用户套餐
     */
    @PostMapping("/{userId}/upgrade")
    public ResponseEntity<Map<String, Object>> upgradeUserPlan(
        @PathVariable String userId,
        @RequestBody Map<String, String> request
    ) {
        try {
            // 检查管理员权限
            String currentUserId = UserContextUtil.getCurrentUserId();
            if (!adminService.isAdmin(currentUserId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "需要管理员权限");
            }

            String targetPlanStr = request.get("targetPlan");
            String reason = request.getOrDefault("reason", "管理员手动升级");

            if (targetPlanStr == null || targetPlanStr.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "目标套餐不能为空");
            }

            PlanType targetPlan;
            try {
                targetPlan = PlanType.valueOf(targetPlanStr);
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "无效的套餐类型");
            }

            log.info("⬆️ 管理员升级用户套餐: adminId={}, userId={}, targetPlan={}, reason={}",
                     currentUserId, userId, targetPlan, reason);

            // 查询用户当前套餐
            UserPlan currentPlan = userPlanRepository.findByUserIdAndStatus(
                userId, UserPlan.PlanStatus.ACTIVE
            ).orElse(null);

            // 取消当前套餐
            if (currentPlan != null) {
                currentPlan.setStatus(UserPlan.PlanStatus.CANCELLED);
                currentPlan.setUpdatedAt(LocalDateTime.now());
                userPlanRepository.save(currentPlan);
                log.info("✅ 已取消用户原套餐: userId={}, oldPlan={}", userId, currentPlan.getPlanType());
            }

            // 创建新套餐
            UserPlan newPlan = UserPlan.builder()
                .userId(userId)
                .planType(targetPlan)
                .startDate(LocalDate.now())
                .endDate(null) // 永不过期（可根据需要调整）
                .status(UserPlan.PlanStatus.ACTIVE)
                .autoRenewal(false)
                .purchasePrice(targetPlan.getMonthlyPrice())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

            userPlanRepository.save(newPlan);

            log.info("✅ 管理员升级用户套餐成功: userId={}, newPlan={}, adminId={}",
                     userId, targetPlan, currentUserId);

            // 构建响应
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "套餐升级成功");
            response.put("userId", userId);
            response.put("planType", newPlan.getPlanType());
            response.put("planName", newPlan.getPlanType().getDisplayName());
            response.put("oldPlan", currentPlan != null ? currentPlan.getPlanType() : null);

            return ResponseEntity.ok(response);

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ 管理员升级用户套餐失败", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "套餐升级失败");
        }
    }

    /**
     * 获取指定用户的套餐信息
     */
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUserPlan(@PathVariable String userId) {
        try {
            // 检查管理员权限
            String currentUserId = UserContextUtil.getCurrentUserId();
            if (!adminService.isAdmin(currentUserId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "需要管理员权限");
            }

            log.info("📋 管理员查询用户套餐: adminId={}, userId={}", currentUserId, userId);

            // 查询用户套餐
            UserPlan userPlan = userPlanRepository.findByUserIdAndStatus(
                userId, UserPlan.PlanStatus.ACTIVE
            ).orElse(null);

            // 如果没有套餐，返回默认免费套餐信息
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);

            if (userPlan != null) {
                response.put("planType", userPlan.getPlanType());
                response.put("planName", userPlan.getPlanType().getDisplayName());
                response.put("startDate", userPlan.getStartDate());
                response.put("endDate", userPlan.getEndDate());
                response.put("status", userPlan.getStatus());
            } else {
                response.put("planType", PlanType.FREE);
                response.put("planName", "求职入门版");
                response.put("status", "NO_PLAN");
                response.put("message", "用户暂无套餐（默认免费版）");
            }

            return ResponseEntity.ok(response);

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ 查询用户套餐失败", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "查询用户套餐失败");
        }
    }
}

