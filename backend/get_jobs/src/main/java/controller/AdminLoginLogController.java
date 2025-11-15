package controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import entity.LoginLog;
import lombok.extern.slf4j.Slf4j;
import service.AdminService;
import service.LoginLogService;
import util.UserContextUtil;

/**
 * 管理员登录日志控制器
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/login-logs")
@CrossOrigin(origins = {
    "https://zhitoujianli.com",
    "https://www.zhitoujianli.com",
    "http://localhost:3000",
    "http://localhost:3001"
}, allowCredentials = "true")
public class AdminLoginLogController {

    @Autowired
    private LoginLogService loginLogService;

    @Autowired
    private AdminService adminService;

    /**
     * 获取登录日志列表（分页、搜索、筛选）
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getLoginLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String loginStatus,
            @RequestParam(required = false) String date, // 新增：日期筛选参数（格式：yyyy-MM-dd）
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        try {
            String adminId = UserContextUtil.getCurrentUserId();
            log.info("📋 获取登录日志列表: adminId={}, page={}, size={}, date={}", adminId, page, size, date);

            if (!adminService.hasPermission(adminId, "audit_logs_read")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限查看登录日志"
                ));
            }

            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<LoginLog> logsPage;

            // 如果有date参数，转换为startTime和endTime
            if (date != null && !date.isEmpty()) {
                try {
                    // 解析日期参数（格式：2025-11-02）
                    startTime = LocalDateTime.parse(date + "T00:00:00");
                    endTime = LocalDateTime.parse(date + "T23:59:59");
                    log.info("📅 日期过滤: {} -> {} 到 {}", date, startTime, endTime);
                } catch (Exception e) {
                    log.error("日期解析失败: {}", date, e);
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "日期格式错误，应为 yyyy-MM-dd"
                    ));
                }
            }

            // 🔧 修复：根据筛选条件查询，确保管理员可以查看所有用户的登录日志
            // 优先级：userId > email > loginStatus > 时间范围 > 默认（最近30天）
            // 注意：管理员查看登录日志时，应该看到所有用户的日志，而不是只看到自己的
            if (userId != null) {
                // 如果指定了userId，只查询该用户的日志
                logsPage = loginLogService.getUserLoginLogs(userId, pageable);
                log.info("📋 按用户ID查询登录日志: userId={}", userId);
            } else if (email != null) {
                // 如果指定了email，只查询该邮箱的日志
                logsPage = loginLogService.getLoginLogsByEmail(email, pageable);
                log.info("📋 按邮箱查询登录日志: email={}", email);
            } else if (loginStatus != null) {
                // 如果指定了loginStatus，查询所有该状态的日志（所有用户）
                logsPage = loginLogService.getLoginLogsByStatus(loginStatus, pageable);
                log.info("📋 按登录状态查询登录日志: status={}", loginStatus);
            } else if (startTime != null && endTime != null) {
                // 🔧 修复：如果指定了时间范围，查询该时间范围内所有用户的日志（不按用户过滤）
                logsPage = loginLogService.getLoginLogsByTimeRange(startTime, endTime, pageable);
                log.info("📋 按时间范围查询登录日志: {} 到 {} (所有用户)", startTime, endTime);
            } else {
                // 默认查询最近30天的所有用户日志（不按用户过滤）
                LocalDateTime defaultStartTime = LocalDateTime.now().minusDays(30);
                LocalDateTime defaultEndTime = LocalDateTime.now();
                logsPage = loginLogService.getLoginLogsByTimeRange(defaultStartTime, defaultEndTime, pageable);
                log.info("📋 默认查询最近30天的登录日志 (所有用户): {} 到 {}", defaultStartTime, defaultEndTime);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("logs", logsPage.getContent().stream().map(this::convertLogToResponse).toList());
            result.put("total", logsPage.getTotalElements());
            result.put("page", logsPage.getNumber());
            result.put("size", logsPage.getSize());
            result.put("totalPages", logsPage.getTotalPages());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", result
            ));

        } catch (Exception e) {
            log.error("❌ 获取登录日志列表异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取登录日志列表失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 获取登录日志详情
     */
    @GetMapping("/{logId}")
    public ResponseEntity<Map<String, Object>> getLoginLogDetail(@PathVariable Long logId) {
        try {
            String adminUsername = UserContextUtil.getCurrentAdminUsername();
            if (adminUsername == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "需要管理员登录"
                ));
            }

            if (!adminService.hasPermission(adminUsername, "audit_logs_read")) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "没有权限查看登录日志"
                ));
            }

            // TODO: 实现根据ID查询日志
            // 目前需要先查询列表然后筛选

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "功能待实现"
            ));

        } catch (Exception e) {
            log.error("❌ 获取登录日志详情异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取登录日志详情失败"
            ));
        }
    }

    /**
     * 获取登录统计
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getLoginStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
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

            // 如果没有指定时间范围，默认查询最近30天
            if (startTime == null || endTime == null) {
                startTime = LocalDateTime.now().minusDays(30);
                endTime = LocalDateTime.now();
            }

            Map<String, Object> stats = loginLogService.getLoginStatistics(startTime, endTime);

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
     * 清理过期日志
     */
    @DeleteMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> cleanupOldLogs(
            @RequestParam(defaultValue = "3") int monthsToKeep) {
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
                    "message", "没有权限清理日志"
                ));
            }

            int deletedCount = loginLogService.cleanupOldLogs(monthsToKeep);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", String.format("清理完成，删除了 %d 条过期日志", deletedCount),
                "deletedCount", deletedCount
            ));

        } catch (Exception e) {
            log.error("❌ 清理过期日志异常", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "清理过期日志失败: " + e.getMessage()
            ));
        }
    }

    // ==================== 私有方法 ====================

    /**
     * 转换登录日志对象为响应格式
     */
    private Map<String, Object> convertLogToResponse(LoginLog log) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", log.getId());
        response.put("userId", log.getUserId());
        response.put("email", log.getEmail());
        response.put("loginType", log.getLoginType());
        response.put("loginStatus", log.getLoginStatus());
        response.put("ipAddress", log.getIpAddress());
        response.put("userAgent", log.getUserAgent());
        response.put("deviceInfo", log.getDeviceInfo());
        response.put("location", log.getLocation());
        response.put("failureReason", log.getFailureReason());
        response.put("createdAt", log.getCreatedAt());
        return response;
    }
}

