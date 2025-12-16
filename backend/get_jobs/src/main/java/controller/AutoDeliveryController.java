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

    // ✅ 修复：使用用户级别的状态映射，确保用户数据隔离
    private static final ConcurrentHashMap<String, Boolean> userRunningStatus = new ConcurrentHashMap<>();
    private static final ConcurrentHashMap<String, Integer> userTotalDelivered = new ConcurrentHashMap<>();
    private static final ConcurrentHashMap<String, Integer> userSuccessfulDelivered = new ConcurrentHashMap<>();
    private static final ConcurrentHashMap<String, Integer> userFailedDelivered = new ConcurrentHashMap<>();

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
            // 1. 获取当前登录用户ID（已强制认证，不会返回null）
            // ✅ 使用sanitizeUserId()确保与登录状态检查使用相同的Cookie文件路径
            String userId = UserContextUtil.sanitizeUserId(
                UserContextUtil.getCurrentUserId()
            );
            log.info("用户 {} 请求启动自动投递", userId);

            // 2. 检查用户是否已有Boss账号登录（检查cookie文件）
            // ✅ 修复：使用与check-status API相同的检查逻辑，确保状态一致性
            // ❌ 已删除default_user fallback机制（2025-11-06修复多租户隔离BUG）
            // 每个用户必须使用自己的Boss账号登录，不能共享Cookie
            String sanitizedUserId = util.UserContextUtil.sanitizeUserId(userId);
            String tempDir = System.getProperty("java.io.tmpdir");
            String[] possiblePaths = {
                tempDir + File.separator + "boss_cookies_" + sanitizedUserId + ".json",  // 系统临时目录（第一优先级）
                "/tmp/boss_cookies_" + sanitizedUserId + ".json",  // Linux标准临时目录（第二优先级）
                "user_data/" + sanitizedUserId + "/boss_cookie.json"  // 用户数据目录（第三优先级）
            };

            File cookieFile = null;
            for (String path : possiblePaths) {
                File tempFile = new File(path);
                log.info("检查cookie文件路径: {} (存在: {}, 大小: {}KB)", 
                    tempFile.getAbsolutePath(), tempFile.exists(), 
                    tempFile.exists() ? tempFile.length() / 1024 : 0);
                if (tempFile.exists() && tempFile.length() > 0) {
                    // ✅ 修复：检查Cookie文件内容是否有效（与checkCookieValidity保持一致）
                    try {
                        String content = new String(Files.readAllBytes(tempFile.toPath()));
                        if (content.trim().length() > 0 && !content.trim().equals("[]")) {
                            cookieFile = tempFile;
                            log.info("✅ 找到用户{}的有效cookie文件: {} ({}KB)", 
                                userId, tempFile.getAbsolutePath(), tempFile.length() / 1024);
                            break;
                        } else {
                            log.warn("Cookie文件为空或无效: {}", path);
                        }
                    } catch (Exception e) {
                        log.warn("读取Cookie文件失败: {}", path, e);
                    }
                }
            }

            if (cookieFile == null) {
                log.warn("用户{}的所有可能cookie文件路径都不存在或无效，返回错误", userId);
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
            // ✅ 修复：统一使用sanitizeUserId()确保日志文件名格式一致
            String safeUserId = UserContextUtil.sanitizeUserId(userId);
            String logPath = "/tmp/boss_delivery_" + safeUserId + ".log";
            CompletableFuture<Void> task = bossExecutionService.executeBossProgram(logPath, false);

            // 注册进程到用户任务映射
            userTasks.put(userId, task);

            // 5. ✅ 修复：设置用户级别的运行状态
            userRunningStatus.put(userId, true);

            // 任务完成时自动清除状态
            task.whenComplete((result, throwable) -> {
                userRunningStatus.put(userId, false);
                log.info("✅ 用户{}的投递任务已完成，状态已清除", userId);
            });

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
            // 获取当前用户ID
            // ✅ 使用sanitizeUserId()确保与登录状态检查使用相同的Cookie文件路径
            String userId = UserContextUtil.sanitizeUserId(
                UserContextUtil.getCurrentUserId()
            );
            log.info("用户 {} 请求停止自动投递", userId);

            // 1. ✅ 修复：设置用户级别的状态为停止
            userRunningStatus.put(userId, false);

            // 清除任务映射
            userTasks.remove(userId);

            // 2. 实际停止Boss进程
            boolean processStopped = stopBossProcess(userId);

            Map<String, Object> data = new HashMap<>();
            data.put("status", "stopped");
            data.put("message", processStopped ? "自动投递已停止" : "状态已更新，但进程可能仍在运行");
            data.put("stopTime", System.currentTimeMillis());
            data.put("processStopped", processStopped);

            log.info("✅ 自动投递已停止，进程停止状态: {}", processStopped);
            return ResponseEntity.ok(ApiResponse.success(data, "停止成功"));
        } catch (Exception e) {
            log.error("停止自动投递失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("停止失败: " + e.getMessage()));
        }
    }

    /**
     * 停止Boss进程
     * @param userId 用户ID
     * @return true如果成功停止进程，false如果进程不存在或停止失败
     */
    private boolean stopBossProcess(String userId) {
        try {
            // ✅ 使用新的进程管理工具终止进程
            int killedCount = util.BossProcessManager.killUserBossProcesses(userId);

            if (killedCount > 0) {
                log.info("✅ 用户{}的Boss进程已终止: {}个", userId, killedCount);
                return true;
            } else {
                log.info("用户{}没有运行中的Boss进程", userId);
                return false;
            }
        } catch (Exception e) {
            log.error("停止Boss进程失败", e);
            return false;
        }
    }

    /**
     * 获取投递状态
     * ✅ 修复：按用户隔离状态，确保用户只能看到自己的投递状态
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDeliveryStatus() {
        try {
            // ✅ 修复：获取当前用户ID，只返回该用户的状态
            String userId = UserContextUtil.sanitizeUserId(
                UserContextUtil.getCurrentUserId()
            );

            // ✅ 修复：从用户级别的状态映射中获取状态
            boolean isRunning = userRunningStatus.getOrDefault(userId, false);

            // ✅ 修复：同时检查任务是否真的在运行（双重验证）
            if (userTasks.containsKey(userId)) {
                CompletableFuture<Void> task = userTasks.get(userId);
                if (task != null && !task.isDone()) {
                    isRunning = true;
                } else if (task != null && task.isDone()) {
                    // 任务已完成，清除状态
                    isRunning = false;
                    userRunningStatus.put(userId, false);
                    userTasks.remove(userId);
                }
            }

            Map<String, Object> data = new HashMap<>();
            data.put("isRunning", isRunning);
            data.put("totalDelivered", userTotalDelivered.getOrDefault(userId, 0));
            data.put("successfulDelivered", userSuccessfulDelivered.getOrDefault(userId, 0));
            data.put("failedDelivered", userFailedDelivered.getOrDefault(userId, 0));
            data.put("userId", userId); // 添加userId用于调试

            log.debug("用户{}查询投递状态: isRunning={}", userId, isRunning);
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
     * ✅ 修复：按用户隔离统计，确保用户只能看到自己的统计信息
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDeliveryStatistics() {
        try {
            // ✅ 修复：获取当前用户ID，只返回该用户的统计
            String userId = UserContextUtil.sanitizeUserId(
                UserContextUtil.getCurrentUserId()
            );

            int totalDelivered = userTotalDelivered.getOrDefault(userId, 0);
            int successfulDelivered = userSuccessfulDelivered.getOrDefault(userId, 0);
            int failedDelivered = userFailedDelivered.getOrDefault(userId, 0);

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
            // ✅ 使用sanitizeUserId()确保与登录状态检查使用相同的日志文件路径
            String userId = UserContextUtil.sanitizeUserId(
                UserContextUtil.getCurrentUserId()
            );
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


