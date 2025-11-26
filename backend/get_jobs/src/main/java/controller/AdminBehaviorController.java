package controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import entity.UserBehaviorLog;
import lombok.extern.slf4j.Slf4j;
import service.AdminService;
import service.UserBehaviorLogService;
import util.UserContextUtil;

/**
 * 管理员用户行为日志控制器
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/behavior")
@CrossOrigin(origins = {
    "https://zhitoujianli.com",
    "https://www.zhitoujianli.com",
    "http://localhost:3000",
    "http://localhost:3001"
}, allowCredentials = "true")
public class AdminBehaviorController {

    @Autowired
    private UserBehaviorLogService behaviorLogService;

    @Autowired
    private AdminService adminService;

    /**
     * 获取所有用户行为日志（分页）
     */
    @GetMapping("/logs")
    public ResponseEntity<Map<String, Object>> getAllBehaviorLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
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
                    "message", "没有权限查看行为日志"
                ));
            }

            Page<UserBehaviorLog> logsPage = behaviorLogService.getAllBehaviorLogs(page, size);

            Map<String, Object> result = new HashMap<>();
            result.put("logs", logsPage.getContent());
            result.put("total", logsPage.getTotalElements());
            result.put("page", logsPage.getNumber());
            result.put("size", logsPage.getSize());
            result.put("totalPages", logsPage.getTotalPages());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", result
            ));

        } catch (Exception e) {
            log.error("❌ 获取行为日志异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取行为日志失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 获取指定用户的行为日志
     */
    @GetMapping("/logs/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserBehaviorLogs(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
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
                    "message", "没有权限查看行为日志"
                ));
            }

            Page<UserBehaviorLog> logsPage = behaviorLogService.getUserBehaviorLogs(userId, page, size);

            Map<String, Object> result = new HashMap<>();
            result.put("logs", logsPage.getContent());
            result.put("total", logsPage.getTotalElements());
            result.put("page", logsPage.getNumber());
            result.put("size", logsPage.getSize());
            result.put("totalPages", logsPage.getTotalPages());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", result
            ));

        } catch (Exception e) {
            log.error("❌ 获取用户行为日志异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取用户行为日志失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 获取用户行为统计
     */
    @GetMapping("/stats/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserBehaviorStats(@PathVariable String userId) {
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
                    "message", "没有权限查看行为统计"
                ));
            }

            Map<String, Object> stats = behaviorLogService.getUserBehaviorStats(userId);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
            ));

        } catch (Exception e) {
            log.error("❌ 获取用户行为统计异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取用户行为统计失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 获取全局行为统计
     */
    @GetMapping("/stats/global")
    public ResponseEntity<Map<String, Object>> getGlobalBehaviorStats() {
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
                    "message", "没有权限查看全局统计"
                ));
            }

            Map<String, Object> stats = behaviorLogService.getGlobalBehaviorStats();

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
            ));

        } catch (Exception e) {
            log.error("❌ 获取全局行为统计异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取全局行为统计失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 记录用户行为（供后台任务调用，无需认证）
     */
    @PostMapping("/log")
    public ResponseEntity<Map<String, Object>> logBehavior(@RequestBody Map<String, Object> request) {
        try {
            String userId = (String) request.get("userId");
            String behaviorType = (String) request.get("behaviorType");
            String status = (String) request.get("status");
            String description = (String) request.get("description");
            @SuppressWarnings("unchecked")
            Map<String, Object> extraData = (Map<String, Object>) request.get("extraData");
            String platform = (String) request.get("platform");

            if (userId == null || behaviorType == null || status == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "缺少必要参数: userId, behaviorType, status"
                ));
            }

            UserBehaviorLog.BehaviorType type;
            try {
                type = UserBehaviorLog.BehaviorType.valueOf(behaviorType);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "无效的行为类型: " + behaviorType
                ));
            }

            UserBehaviorLog.BehaviorStatus behaviorStatus;
            try {
                behaviorStatus = UserBehaviorLog.BehaviorStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "无效的状态: " + status
                ));
            }

            behaviorLogService.logBehavior(userId, type, behaviorStatus, description, extraData, platform);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "行为记录成功"
            ));

        } catch (Exception e) {
            log.error("❌ 记录用户行为异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "记录用户行为失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 获取行为趋势分析
     */
    @GetMapping("/stats/trend")
    public ResponseEntity<Map<String, Object>> getBehaviorTrend(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "day") String groupBy,
            @RequestParam(required = false) String behaviorType) {
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
                    "message", "没有权限查看趋势分析"
                ));
            }

            // 默认查询最近30天
            LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(30);
            LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();

            UserBehaviorLog.BehaviorType type = null;
            if (behaviorType != null && !behaviorType.isEmpty()) {
                try {
                    type = UserBehaviorLog.BehaviorType.valueOf(behaviorType);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "无效的行为类型: " + behaviorType
                    ));
                }
            }

            Map<String, Object> trend = behaviorLogService.getBehaviorTrend(start, end, groupBy, type);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", trend
            ));

        } catch (Exception e) {
            log.error("❌ 获取行为趋势异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取行为趋势失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 获取转化漏斗分析
     */
    @GetMapping("/stats/funnel")
    public ResponseEntity<Map<String, Object>> getConversionFunnel(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
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
                    "message", "没有权限查看转化漏斗"
                ));
            }

            // 默认查询最近30天
            LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(30);
            LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();

            Map<String, Object> funnel = behaviorLogService.getConversionFunnel(start, end);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", funnel
            ));

        } catch (Exception e) {
            log.error("❌ 获取转化漏斗异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取转化漏斗失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 获取活跃用户统计
     */
    @GetMapping("/stats/active-users")
    public ResponseEntity<Map<String, Object>> getActiveUsersStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
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
                    "message", "没有权限查看活跃用户统计"
                ));
            }

            // 默认查询最近30天
            LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(30);
            LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();

            Map<String, Object> stats = behaviorLogService.getActiveUsersStats(start, end);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
            ));

        } catch (Exception e) {
            log.error("❌ 获取活跃用户统计异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取活跃用户统计失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 获取用户留存分析
     */
    @GetMapping("/stats/retention")
    public ResponseEntity<Map<String, Object>> getRetentionStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
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
                    "message", "没有权限查看留存分析"
                ));
            }

            // 默认查询最近30天
            LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(30);
            LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();

            Map<String, Object> stats = behaviorLogService.getRetentionStats(start, end);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
            ));

        } catch (Exception e) {
            log.error("❌ 获取留存分析异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取留存分析失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 导出行为日志数据
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportBehaviorLogs(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String userId) {
        try {
            String adminUsername = UserContextUtil.getCurrentAdminUsername();
            if (adminUsername == null) {
                return ResponseEntity.status(401).build();
            }

            if (!adminService.hasPermission(adminUsername, "analytics_read")) {
                return ResponseEntity.status(403).build();
            }

            // 默认查询最近30天
            LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(30);
            LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();

            String csv = behaviorLogService.exportBehaviorLogs(start, end, userId);
            byte[] csvBytes = csv.getBytes("UTF-8");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
            headers.setContentDispositionFormData("attachment",
                String.format("behavior_logs_%s_%s.csv", start, end));

            return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("❌ 导出行为日志异常", e);
            return ResponseEntity.status(500).build();
        }
    }
}

