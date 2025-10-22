package controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;
import org.slf4j.MDC;
import service.BossExecutionService;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Boss直聘登录控制器
 * 提供二维码扫码登录功能
 */
@RestController
@RequestMapping("/api/boss/login")
@CrossOrigin(origins = "*")
public class BossLoginController {

    private static final Logger log = LoggerFactory.getLogger(BossLoginController.class);

    @Autowired
    private BossExecutionService bossExecutionService;

    // 二维码截图保存路径
    private static final String QRCODE_PATH = "/tmp/boss_qrcode.png";

    // 登录状态标记文件
    private static final String LOGIN_STATUS_FILE = "/tmp/boss_login_status.txt";

    // 【多用户支持】用户级别的登录状态锁（Map<userId, isInProgress>）
    private static final Map<String, Boolean> userLoginStatus = new ConcurrentHashMap<>();
    private static final Map<String, Long> userLoginStartTime = new ConcurrentHashMap<>();

    // 登录超时时间 (10分钟)
    private static final long LOGIN_TIMEOUT_MS = 10 * 60 * 1000;

    // 【向后兼容】全局锁（仅在未启用多用户时使用）
    private static final Object LOGIN_LOCK = new Object();
    private static volatile boolean isLoginInProgress = false;
    private static volatile long loginStartTime = 0;

    /**
     * 启动登录流程
     * 触发Boss程序在Xvfb上启动浏览器
     */
    @PostMapping("/start")
    public ResponseEntity<Map<String, Object>> startLogin() {
        // 获取当前用户ID（多用户支持）
        String userId = util.UserContextUtil.getCurrentUserId();
        log.info("收到启动登录请求，用户: {}", userId);

        Map<String, Object> response = new HashMap<>();

        // 【多用户支持】用户级别的锁检查，支持超时自动释放
        Boolean inProgress = userLoginStatus.getOrDefault(userId, false);
        if (inProgress) {
            Long startTime = userLoginStartTime.get(userId);
            long elapsed = System.currentTimeMillis() - (startTime != null ? startTime : 0);

            if (elapsed < LOGIN_TIMEOUT_MS) {
                response.put("success", false);
                response.put("message", "登录流程正在进行中，请稍候...");
                response.put("status", "in_progress");
                response.put("elapsedSeconds", elapsed / 1000);
                response.put("userId", userId);
                log.warn("用户{}登录流程已在进行中，拒绝重复启动（已进行{}秒）", userId, elapsed / 1000);
                return ResponseEntity.ok(response);
            } else {
                // 超过10分钟，认为上次登录已失效
                log.warn("用户{}上次登录流程超时（{}秒），强制释放锁并重置状态", userId, elapsed / 1000);
                userLoginStatus.put(userId, false);
                cleanupLoginFiles(userId);
            }
        }

        // 标记该用户登录开始
        userLoginStatus.put(userId, true);
        userLoginStartTime.put(userId, System.currentTimeMillis());
        log.info("用户{}登录流程开始，已设置锁", userId);

        try {
            // 清理旧的登录状态
            cleanupLoginFiles();

            // 创建登录状态文件，标记为"等待登录"
            Files.write(Paths.get(LOGIN_STATUS_FILE), "waiting".getBytes());

            // 异步启动Boss程序（有头模式，用于生成二维码）
            CompletableFuture.runAsync(() -> {
                try {
                    log.info("🚀 异步启动Boss程序以生成登录二维码...");

                    // 启动Boss程序并等待二维码生成
                    CompletableFuture<Void> bossFuture = bossExecutionService.executeBossProgram("/tmp/boss_login.log", false);

                    // 等待二维码生成（最多等待30秒）
                    int maxWaitTime = 30; // 30秒
                    int waitInterval = 2; // 每2秒检查一次

                    for (int i = 0; i < maxWaitTime; i += waitInterval) {
                        Thread.sleep(waitInterval * 1000);

                        // 检查二维码文件是否生成
                        File qrcodeFile = new File(QRCODE_PATH);
                        if (qrcodeFile.exists() && qrcodeFile.length() > 0) {
                            log.info("✅ 二维码文件已生成: {} ({}KB)", QRCODE_PATH, qrcodeFile.length() / 1024);
                            break;
                        }

                        log.debug("⏳ 等待二维码生成... ({}/{}秒)", i + waitInterval, maxWaitTime);
                    }

                    // 检查最终状态
                    File qrcodeFile = new File(QRCODE_PATH);
                    if (!qrcodeFile.exists() || qrcodeFile.length() == 0) {
                        log.warn("⚠️ 二维码文件未在预期时间内生成");
                        Files.write(Paths.get(LOGIN_STATUS_FILE), "failed".getBytes());
                    }

                } catch (Exception e) {
                    log.error("Boss程序启动失败", e);
                    try {
                        Files.write(Paths.get(LOGIN_STATUS_FILE), "failed".getBytes());
                    } catch (IOException ioException) {
                        log.error("更新失败状态文件失败", ioException);
                    }
                } finally {
                    // 【多用户支持】登录流程结束，释放用户锁
                    userLoginStatus.put(userId, false);
                    log.info("用户{}登录流程结束，已释放锁", userId);

                    // 【向后兼容】同时释放全局锁
                    synchronized (LOGIN_LOCK) {
                        isLoginInProgress = false;
                        log.debug("全局锁已释放（向后兼容）");
                    }
                }
            });

            response.put("success", true);
            response.put("message", "登录流程已启动，请稍候...");
            response.put("status", "started");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("启动登录失败", e);
            // 【新增】异常时释放锁
            synchronized (LOGIN_LOCK) {
                isLoginInProgress = false;
                log.info("启动登录异常，已释放全局锁");
            }
            response.put("success", false);
            response.put("message", "启动登录失败：" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 获取二维码图片
     * 返回Boss登录页面的二维码截图
     */
    @GetMapping("/qrcode")
    public ResponseEntity<?> getQRCode(@RequestParam(value = "format", required = false) String format) {
        // 为链路追踪生成traceId并写入响应头
        String traceId = java.util.UUID.randomUUID().toString();
        MDC.put("traceId", traceId);
        try {
            File qrcodeFile = new File(QRCODE_PATH);

            if (!qrcodeFile.exists()) {
                log.warn("[{}] 二维码文件不存在: {}", traceId, QRCODE_PATH);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .header("X-Request-Id", traceId)
                        .body(Map.of("success", false, "message", "二维码尚未生成", "traceId", traceId));
            }

            byte[] imageBytes = Files.readAllBytes(qrcodeFile.toPath());

            // 当 format=base64 时，返回JSON，避免跨层代理对图片流的协议细节敏感
            if ("base64".equalsIgnoreCase(format)) {
                String base64 = java.util.Base64.getEncoder().encodeToString(imageBytes);
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", true);
                resp.put("data", Map.of("qrcodeBase64", base64, "contentType", "image/png"));
                resp.put("traceId", traceId);
                return ResponseEntity.ok()
                        .cacheControl(org.springframework.http.CacheControl.noStore())
                        .header("X-Request-Id", traceId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(resp);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setCacheControl("no-cache, no-store, must-revalidate");
            headers.setPragma("no-cache");
            headers.setExpires(0);
            headers.add("X-Request-Id", traceId);

            return ResponseEntity.ok()
                .headers(headers)
                .body(imageBytes);

        } catch (IOException e) {
            log.error("[{}] 读取二维码失败", traceId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("X-Request-Id", traceId)
                    .body(Map.of("success", false, "message", "读取二维码失败", "traceId", traceId));
        } finally {
            MDC.remove("traceId");
        }
    }

    /**
     * 检查登录状态
     * 返回当前登录进度
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> checkLoginStatus() {
        Map<String, Object> response = new HashMap<>();

        try {
            // 【新增】检查是否有登录流程正在进行
            if (isLoginInProgress) {
                long elapsed = System.currentTimeMillis() - loginStartTime;
                response.put("isInProgress", true);
                response.put("elapsedSeconds", elapsed / 1000);
            } else {
                response.put("isInProgress", false);
            }

            File statusFile = new File(LOGIN_STATUS_FILE);

            if (!statusFile.exists()) {
                response.put("status", "not_started");
                response.put("message", "登录流程未启动");
                return ResponseEntity.ok(response);
            }

            String status = new String(Files.readAllBytes(statusFile.toPath())).trim();

            switch (status) {
                case "waiting":
                    response.put("status", "waiting");
                    response.put("message", "等待扫码中...");
                    response.put("hasQRCode", new File(QRCODE_PATH).exists());
                    break;
                case "success":
                    response.put("status", "success");
                    response.put("message", "登录成功！");
                    // 【新增】登录成功后重置进行中状态
                    synchronized (LOGIN_LOCK) {
                        isLoginInProgress = false;
                        log.info("检测到登录成功，已释放全局锁");
                    }
                    break;
                case "failed":
                    response.put("status", "failed");
                    response.put("message", "登录失败，请重试");
                    // 【新增】登录失败后重置进行中状态
                    synchronized (LOGIN_LOCK) {
                        isLoginInProgress = false;
                        log.info("检测到登录失败，已释放全局锁");
                    }
                    break;
                default:
                    response.put("status", "unknown");
                    response.put("message", "未知状态");
            }

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            log.error("检查登录状态失败", e);
            response.put("status", "error");
            response.put("message", "检查状态失败：" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 清理登录相关文件
     */
    /**
     * 清理登录文件（多用户支持）
     * @param userId 用户ID，如果为null则清理全局文件
     */
    private void cleanupLoginFiles(String userId) {
        try {
            if (userId != null && !userId.equals("default_user")) {
                // 多用户模式：清理用户特定的Cookie文件
                String userCookiePath = "/tmp/boss_cookies_" + userId + ".json";
                Files.deleteIfExists(Paths.get(userCookiePath));
                log.info("清理用户{}的Cookie文件: {}", userId, userCookiePath);
            }

            // 清理全局登录文件（二维码和状态）
            Files.deleteIfExists(Paths.get(QRCODE_PATH));
            Files.deleteIfExists(Paths.get(LOGIN_STATUS_FILE));
            log.info("清理登录文件完成（用户: {}）", userId);
        } catch (IOException e) {
            log.warn("清理登录文件失败", e);
        }
    }

    /**
     * 清理登录文件（向后兼容：无用户ID参数）
     */
    private void cleanupLoginFiles() {
        cleanupLoginFiles("default_user");
    }

    /**
     * 定时检查登录超时（多用户支持）
     * 每分钟执行一次，自动释放超时的登录锁
     */
    @Scheduled(fixedRate = 60000)
    public void checkLoginTimeout() {
        // 检查所有用户的登录状态
        for (Map.Entry<String, Boolean> entry : userLoginStatus.entrySet()) {
            String userId = entry.getKey();
            Boolean inProgress = entry.getValue();

            if (inProgress != null && inProgress) {
                Long startTime = userLoginStartTime.get(userId);
                if (startTime != null) {
                    long elapsed = System.currentTimeMillis() - startTime;
                    if (elapsed > LOGIN_TIMEOUT_MS) {
                        log.warn("定时检测到用户{}登录超时（{}秒），自动释放锁", userId, elapsed / 1000);
                        userLoginStatus.put(userId, false);
                        cleanupLoginFiles(userId);
                    }
                }
            }
        }

        // 【向后兼容】检查全局锁
        synchronized (LOGIN_LOCK) {
            if (isLoginInProgress) {
                long elapsed = System.currentTimeMillis() - loginStartTime;
                if (elapsed > LOGIN_TIMEOUT_MS) {
                    log.warn("定时检测到全局登录超时（{}秒），自动释放锁", elapsed / 1000);
                    isLoginInProgress = false;
                    cleanupLoginFiles();
                }
            }
        }
    }
}
