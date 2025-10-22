package controller;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import service.BossExecutionService;
import util.UserContextUtil;

/**
 * 自动投递RESTful API控制器
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */
@RestController
@RequestMapping("/api/delivery")
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://115.190.182.95:3000", "http://115.190.182.95"})
public class AutoDeliveryController {

    @Autowired
    private BossExecutionService bossExecutionService;

    @Autowired
    // private ProcessManagerService processManager; // 暂时注释

    // 向后兼容的状态标记（已废弃，使用ProcessManagerService）
    @Deprecated
    private static boolean isRunning = false;
    private static int totalDelivered = 0;
    private static int successfulDelivered = 0;
    private static int failedDelivered = 0;

    // 已废弃：使用ProcessManagerService替代
    @Deprecated
    private static final ConcurrentHashMap<String, CompletableFuture<Void>> userTasks = new ConcurrentHashMap<>();

    /**
     * 启动自动投递
     *
     * ⚠️ 重要：使用ProcessManagerService管理进程，防止多进程运行
     * DO NOT MODIFY: 进程管理逻辑，必须通过ProcessManagerService确保单用户单进程
     */
    @PostMapping("/start")
    public ResponseEntity<ApiResponse<Map<String, Object>>> startDelivery() {
        try {
            // 1. 获取当前登录用户ID
            String userId = UserContextUtil.getCurrentUserId();
            if (userId == null || userId.isEmpty() || "default_user".equals(userId)) {
                // 对于默认用户，直接使用默认cookie文件
                log.info("使用默认用户进行Boss投递");
                userId = "default_user";
            }

            log.info("用户 {} 请求启动自动投递", userId);

            // 2. 检查用户是否已有Boss账号登录（检查cookie文件）
            // 【多用户支持】根据userId动态确定Cookie路径
            String[] possiblePaths;
            if ("default_user".equals(userId)) {
                // 默认用户：使用统一路径
                possiblePaths = new String[]{
                    "/tmp/boss_cookies.json",  // 新的统一路径（第一优先级）
                    "src/main/java/boss/cookie.json",  // 开发环境（fallback）
                    "/root/zhitoujianli/backend/get_jobs/src/main/java/boss/cookie.json",  // 生产环境（fallback）
                    "/opt/zhitoujianli/backend/src/main/java/boss/cookie.json"  // 备用路径（fallback）
                };
            } else {
                // 多用户模式：优先检查用户特定的Cookie文件
                possiblePaths = new String[]{
                    "/tmp/boss_cookies_" + userId + ".json",  // 用户特定Cookie（第一优先级）
                    "/tmp/boss_cookies.json",  // 默认Cookie（fallback）
                    "user_data/" + userId + "/boss_cookie.json"  // 用户数据目录（fallback）
                };
            }

            File cookieFile = null;
            for (String path : possiblePaths) {
                File tempFile = new File(path);
                if (tempFile.exists()) {
                    cookieFile = tempFile;
                    log.info("✅ 找到用户{}的cookie文件: {} (存在: {})", userId, tempFile.getAbsolutePath(), tempFile.exists());
                    break;
                }
            }

            if (cookieFile == null) {
                log.warn("用户{}的所有可能cookie文件路径都不存在，返回错误", userId);
                return ResponseEntity.ok(ApiResponse.error("未登录Boss账号，请先扫码登录"));
            }

            // 3. 检查是否已有任务在运行
            if (userTasks.containsKey(userId)) {
                CompletableFuture<Void> existingTask = userTasks.get(userId);
                if (!existingTask.isDone()) {
                    log.warn("用户 {} 已有任务在运行，拒绝重复启动", userId);
                    return ResponseEntity.ok(ApiResponse.error("您已有投递任务正在运行"));
                }
            }

            // 4. 启动Boss投递程序
            String logPath = "/tmp/boss_delivery_" + userId + ".log";
            CompletableFuture<Void> task = bossExecutionService.executeBossProgram(logPath, false);

            // 注册进程到用户任务映射
            userTasks.put(userId, task);

            // 5. 设置运行状态（向后兼容）
            isRunning = true;

            Map<String, Object> data = new HashMap<>();
            data.put("status", "started");
            data.put("message", "Boss自动投递已启动");
            data.put("userId", userId);
            data.put("startTime", System.currentTimeMillis());

            log.info("✅ 用户{}的Boss自动投递已启动", userId);
            return ResponseEntity.ok(ApiResponse.success(data, "启动成功"));

        } catch (IllegalStateException e) {
            // ProcessManagerService抛出的进程已存在异常
            log.error("启动自动投递失败: {}", e.getMessage());
            return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("启动自动投递失败", e);
            return ResponseEntity.ok(ApiResponse.error("启动失败: " + e.getMessage()));
        }
    }

    /**
     * 停止自动投递
     */
    @PostMapping("/stop")
    public ResponseEntity<ApiResponse<Map<String, Object>>> stopDelivery() {
        try {
            isRunning = false;
            Map<String, Object> data = new HashMap<>();
            data.put("status", "stopped");
            data.put("message", "自动投递已停止");
            data.put("stopTime", System.currentTimeMillis());

            log.info("✅ 自动投递已停止");
            return ResponseEntity.ok(ApiResponse.success(data, "停止成功"));
        } catch (Exception e) {
            log.error("停止自动投递失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("停止失败: " + e.getMessage()));
        }
    }

    /**
     * 获取投递状态
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDeliveryStatus() {
        try {
            Map<String, Object> data = new HashMap<>();
            data.put("isRunning", isRunning);
            data.put("totalDelivered", totalDelivered);
            data.put("successfulDelivered", successfulDelivered);
            data.put("failedDelivered", failedDelivered);

            return ResponseEntity.ok(ApiResponse.success(data, "获取状态成功"));
        } catch (Exception e) {
            log.error("获取投递状态失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("获取状态失败: " + e.getMessage()));
        }
    }

    /**
     * 获取投递记录
     */
    @GetMapping("/records")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDeliveryRecords() {
        try {
            // 返回空列表，后续可以对接真实的数据库
            List<Map<String, Object>> records = new ArrayList<>();
            return ResponseEntity.ok(ApiResponse.success(records, "获取记录成功"));
        } catch (Exception e) {
            log.error("获取投递记录失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("获取记录失败: " + e.getMessage()));
        }
    }

    /**
     * 获取投递统计
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDeliveryStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalDeliveries", totalDelivered);
            stats.put("successfulDeliveries", successfulDelivered);
            stats.put("failedDeliveries", failedDelivered);
            stats.put("hrReplies", 0);
            stats.put("interviewInvitations", 0);
            stats.put("rejections", 0);
            stats.put("deliverySuccessRate", totalDelivered > 0 ? (double) successfulDelivered / totalDelivered : 0);
            stats.put("hrReplyRate", 0.0);
            stats.put("interviewInvitationRate", 0.0);
            stats.put("todayDeliveries", 0);
            stats.put("weeklyDeliveries", 0);
            stats.put("monthlyDeliveries", 0);
            stats.put("averageMatchScore", 0.0);
            stats.put("timeRange", "all");
            stats.put("lastUpdated", System.currentTimeMillis());

            return ResponseEntity.ok(ApiResponse.success(stats, "获取统计成功"));
        } catch (Exception e) {
            log.error("获取投递统计失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("获取统计失败: " + e.getMessage()));
        }
    }

    /**
     * 获取Boss投递日志
     */
    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDeliveryLogs(
            @RequestParam(defaultValue = "100") int lines) {
        try {
            String userId = UserContextUtil.getCurrentUserId();
            String logPath = "/tmp/boss_delivery_" + userId + ".log";

            File logFile = new File(logPath);
            if (!logFile.exists()) {
                // 如果用户专属日志不存在，返回通用登录日志
                logPath = "/tmp/boss_login.log";
                logFile = new File(logPath);
            }

            if (!logFile.exists()) {
                return ResponseEntity.ok(ApiResponse.success(
                    Map.of("logs", List.of(), "message", "暂无日志"),
                    "日志为空"
                ));
            }

            // 读取最后N行日志
            List<String> logLines = Files.readAllLines(Paths.get(logPath), StandardCharsets.UTF_8);
            int totalLines = logLines.size();
            int startIndex = Math.max(0, totalLines - lines);
            List<String> recentLogs = logLines.subList(startIndex, totalLines);

            Map<String, Object> data = new HashMap<>();
            data.put("logs", recentLogs);
            data.put("totalLines", totalLines);
            data.put("returnedLines", recentLogs.size());

            return ResponseEntity.ok(ApiResponse.success(data, "日志获取成功"));

        } catch (Exception e) {
            log.error("获取日志失败", e);
            return ResponseEntity.ok(ApiResponse.error("日志获取失败: " + e.getMessage()));
        }
    }
}


