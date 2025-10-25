package controller;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import service.BossExecutionService;

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
    private static final String QRCODE_PATH = System.getProperty("java.io.tmpdir") + File.separator + "boss_qrcode.png";

    // 登录状态标记文件
    private static final String LOGIN_STATUS_FILE = System.getProperty("java.io.tmpdir") + File.separator + "boss_login_status.txt";

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
            Files.write(Paths.get(LOGIN_STATUS_FILE), "waiting".getBytes(StandardCharsets.UTF_8));

            // 异步启动Boss程序（有头模式，用于生成二维码）
            CompletableFuture.runAsync(() -> {
                try {
                    log.info("🚀 异步启动Boss程序以生成登录二维码...");

                    // 启动Boss程序并等待二维码生成
                    CompletableFuture<Void> bossFuture = bossExecutionService.executeBossProgram(System.getProperty("java.io.tmpdir") + File.separator + "boss_login.log", false);

                    // 等待二维码生成（最多等待30秒）
                    int maxWaitTime = 30; // 30秒
                    int waitInterval = 2; // 每2秒检查一次

                    for (int i = 0; i < maxWaitTime; i += waitInterval) {
                        Thread.sleep(waitInterval * 1000L);

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
                        Files.write(Paths.get(LOGIN_STATUS_FILE), "failed".getBytes(StandardCharsets.UTF_8));
                    }

                } catch (Exception e) {
                    log.error("Boss程序启动失败", e);
                    try {
                        Files.write(Paths.get(LOGIN_STATUS_FILE), "failed".getBytes(StandardCharsets.UTF_8));
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
     * 检查Boss登录状态（Cookie有效性）
     * 用于系统启动时自动检查用户是否已登录Boss
     */
    @GetMapping("/check-status")
    public ResponseEntity<Map<String, Object>> checkBossLoginStatus() {
        Map<String, Object> response = new HashMap<>();

        try {
            // 获取当前用户ID
            String userId = util.UserContextUtil.getCurrentUserId();
            log.info("检查用户{}的Boss登录状态", userId);

            // 检查Cookie文件是否存在且有效
            boolean isLoggedIn = checkCookieValidity(userId);

            response.put("success", true);
            response.put("isLoggedIn", isLoggedIn);
            response.put("userId", userId);
            response.put("message", isLoggedIn ? "已登录Boss" : "需要扫码登录Boss");

            log.info("用户{}的Boss登录状态: {}", userId, isLoggedIn ? "已登录" : "未登录");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("检查Boss登录状态失败", e);
            response.put("success", false);
            response.put("isLoggedIn", false);
            response.put("message", "检查登录状态失败");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
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
     * 检查Cookie有效性
     * @param userId 用户ID
     * @return true如果Cookie有效，false如果无效或不存在
     */
    private boolean checkCookieValidity(String userId) {
        try {
            // 获取可能的Cookie文件路径
            String[] possiblePaths;
            String sanitizedUserId = util.UserContextUtil.sanitizeUserId(userId);

            if ("default_user".equals(sanitizedUserId)) {
                // 默认用户：使用统一路径
                possiblePaths = new String[]{
                    "/tmp/boss_cookies.json",  // 新的统一路径（第一优先级）
                    "src/main/java/boss/cookie.json",  // 开发环境（fallback）
                    "/root/zhitoujianli/backend/get_jobs/src/main/java/boss/cookie.json",  // 生产环境（fallback）
                    "/opt/zhitoujianli/backend/src/main/java/boss/cookie.json"  // 备用路径（fallback）
                };
            } else {
                // 多用户模式：优先检查用户特定的Cookie文件，但也要检查default_user的cookie
                // 因为Boss程序可能使用default_user保存cookie，即使有认证用户
                possiblePaths = new String[]{
                    "/tmp/boss_cookies_" + sanitizedUserId + ".json",  // 用户特定Cookie（第一优先级）
                    "/tmp/boss_cookies_default_user.json", // 检查default_user的cookie（新增）
                    "/tmp/boss_cookies.json",  // 默认Cookie（fallback）
                    "user_data/" + sanitizedUserId + "/boss_cookie.json"  // 用户数据目录（fallback）
                };
            }

            // 检查每个可能的路径
            for (String path : possiblePaths) {
                File cookieFile = new File(path);
                if (cookieFile.exists() && cookieFile.length() > 0) {
                    log.info("找到Cookie文件: {} ({}KB)", path, cookieFile.length() / 1024);

                    // 检查Cookie文件内容是否有效
                    try {
                        String content = new String(Files.readAllBytes(cookieFile.toPath()));
                        if (content.trim().length() > 0 && !content.trim().equals("[]")) {
                            log.info("Cookie文件内容有效，用户{}已登录Boss", userId);
                            return true;
                        } else {
                            log.warn("Cookie文件为空或无效: {}", path);
                        }
                    } catch (Exception e) {
                        log.warn("读取Cookie文件失败: {}", path, e);
                    }
                }
            }

            log.info("未找到有效的Cookie文件，用户{}需要登录Boss", userId);
            return false;

        } catch (Exception e) {
            log.error("检查Cookie有效性失败", e);
            return false;
        }
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
