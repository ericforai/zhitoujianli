package controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;
import service.AdminService;
import service.StatisticsService;
import util.UserContextUtil;

/**
 * 管理员仪表板控制器
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Slf4j
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {
    "https://zhitoujianli.com",
    "https://www.zhitoujianli.com",
    "http://localhost:3000",
    "http://localhost:3001"
}, allowCredentials = "true")
public class AdminDashboardController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private StatisticsService statisticsService;

    /**
     * 获取管理员仪表板数据
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        try {
            String adminUsername = UserContextUtil.getCurrentAdminUsername();
            if (adminUsername == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "需要管理员登录"
                ));
            }

            log.info("🎯 获取管理员仪表板: adminUsername={}", adminUsername);

            // 检查管理员权限
            if (!adminService.isAdmin(adminUsername)) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "需要管理员权限"
                ));
            }

            Map<String, Object> dashboard = statisticsService.getDashboardOverview();

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", dashboard
            ));

        } catch (Exception e) {
            log.error("❌ 获取管理员仪表板异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取仪表板数据失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 获取统计数据
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        try {
            String adminUsername = UserContextUtil.getCurrentAdminUsername();
            if (adminUsername == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "需要管理员登录"
                ));
            }

            if (!adminService.hasPermission(adminUsername, "analytics_read")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限查看统计数据"
                ));
            }

            Map<String, Object> stats = new HashMap<>();
            stats.put("users", statisticsService.getUserStatistics());
            stats.put("plans", statisticsService.getPlanDistribution());
            stats.put("logins", statisticsService.getLoginStatistics());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
            ));

        } catch (Exception e) {
            log.error("❌ 获取统计数据异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取统计数据失败"
            ));
        }
    }

    /**
     * 获取用户统计
     */
    @GetMapping("/statistics/users")
    public ResponseEntity<Map<String, Object>> getUserStatistics() {
        try {
            String adminUsername = UserContextUtil.getCurrentAdminUsername();
            if (adminUsername == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "需要管理员登录"
                ));
            }

            if (!adminService.hasPermission(adminUsername, "analytics_read")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限查看用户统计"
                ));
            }

            Map<String, Object> stats = statisticsService.getUserStatistics();

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
            ));

        } catch (Exception e) {
            log.error("❌ 获取用户统计异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取用户统计失败"
            ));
        }
    }

    /**
     * 获取登录统计
     */
    @GetMapping("/statistics/logins")
    public ResponseEntity<Map<String, Object>> getLoginStatistics() {
        try {
            String adminUsername = UserContextUtil.getCurrentAdminUsername();
            if (adminUsername == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "需要管理员登录"
                ));
            }

            if (!adminService.hasPermission(adminUsername, "analytics_read")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限查看登录统计"
                ));
            }

            Map<String, Object> stats = statisticsService.getLoginStatistics();

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
            ));

        } catch (Exception e) {
            log.error("❌ 获取登录统计异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取登录统计失败"
            ));
        }
    }

    /**
     * 获取套餐分布统计
     */
    @GetMapping("/statistics/plans")
    public ResponseEntity<Map<String, Object>> getPlanStatistics() {
        try {
            String adminUsername = UserContextUtil.getCurrentAdminUsername();
            if (adminUsername == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "需要管理员登录"
                ));
            }

            if (!adminService.hasPermission(adminUsername, "analytics_read")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限查看套餐统计"
                ));
            }

            Map<String, Object> stats = statisticsService.getPlanDistribution();

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
            ));

        } catch (Exception e) {
            log.error("❌ 获取套餐统计异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取套餐统计失败"
            ));
        }
    }
}

