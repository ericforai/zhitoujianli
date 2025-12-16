package controller;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import service.BossExecutionService;

/**
 * Boss直聘登录控制器（已废弃）
 *
 * ⚠️ 此控制器已废弃 - 服务器端二维码生成依赖图形界面，在生产环境无法使用
 *
 * 请使用 BossLocalLoginController 替代：
 * - 用户在本地浏览器登录Boss
 * - 提取Cookie并上传到服务器
 * - 支持完整的多租户隔离
 *
 * @deprecated 使用BossLocalLoginController替代
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 * @updated 2025-11-06 - 标记为废弃，推荐本地登录方案
 */
@RestController
@RequestMapping("/api/boss/login")
// ✅ 修复：移除@CrossOrigin注解，使用全局CorsConfig统一管理
@Deprecated
public class BossLoginController {

    private static final Logger log = LoggerFactory.getLogger(BossLoginController.class);

    @Autowired
    private BossExecutionService bossExecutionService;

    @Autowired
    private Environment environment;

    /**
     * 检查是否为生产环境
     */
    private boolean isProductionEnvironment() {
        String[] activeProfiles = environment.getActiveProfiles();
        for (String profile : activeProfiles) {
            if ("production".equalsIgnoreCase(profile) || "prod".equalsIgnoreCase(profile)) {
                return true;
            }
        }
        // 从环境变量检查
        String envProfile = System.getProperty("spring.profiles.active");
        if (envProfile != null) {
            return "production".equalsIgnoreCase(envProfile) || "prod".equalsIgnoreCase(envProfile);
        }
        return false;
    }

    /**
     * 返回废弃接口的引导信息（410 Gone）
     */
    private ResponseEntity<Map<String, Object>> createDeprecatedResponse() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("deprecated", true);
        response.put("status", "gone");
        response.put("message", "此接口已废弃，请使用新的本地登录方案");
        response.put("alternative", Map.of(
            "guide", "/api/boss/local-login/guide",
            "upload", "/api/boss/local-login/upload-cookie",
            "description", "推荐使用本地浏览器登录Boss直聘，然后上传Cookie到服务器"
        ));
        return ResponseEntity.status(HttpStatus.GONE).body(response);
    }

    // 二维码截图保存路径
    // ✅ 修复：二维码文件路径需要包含用户ID，与Boss.java中的生成逻辑保持一致
    // Boss.java生成: boss_qrcode_{safeUserId}.png
    // 此方法用于获取当前用户的二维码文件路径
    private String getQRCodePath() {
        try {
            String userId = util.UserContextUtil.sanitizeUserId(util.UserContextUtil.getCurrentUserId());
            String safeUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "_");
            return System.getProperty("java.io.tmpdir") + File.separator + "boss_qrcode_" + safeUserId + ".png";
        } catch (SecurityException e) {
            // 如果未登录，返回默认路径（向后兼容）
            log.warn("无法获取用户ID，使用默认二维码路径: {}", e.getMessage());
            return System.getProperty("java.io.tmpdir") + File.separator + "boss_qrcode.png";
        }
    }

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
     * 启动登录流程（已废弃）
     *
     * ⚠️ 服务器端二维码生成依赖图形界面，在生产环境无法使用
     *
     * @deprecated 使用BossLocalLoginController的本地登录方案
     */
    @PostMapping("/start")
    @Deprecated
    public ResponseEntity<Map<String, Object>> startLogin() {
        // ✅ 修复：生产环境直接返回410 Gone状态码
        if (isProductionEnvironment()) {
            log.warn("⚠️ 生产环境拒绝访问已废弃的接口 /api/boss/login/start");
            return createDeprecatedResponse();
        }

        // 获取当前用户ID（多用户支持）
        String userId = util.UserContextUtil.getCurrentUserId();
        log.warn("⚠️ 用户{}调用了已废弃的接口 /api/boss/login/start", userId);
        log.warn("⚠️ 推荐使用本地登录方案: /api/boss/local-login/guide");
        log.info("收到启动登录请求，用户: {}", userId);

        Map<String, Object> response = new HashMap<>();

        // ✅ 进程检查：检查是否有该用户的Boss进程在运行
        if (util.BossProcessManager.isUserBossProcessRunning(userId)) {
            List<Long> existingPids = util.BossProcessManager.findUserBossProcesses(userId);
            response.put("success", false);
            response.put("message", String.format(
                "您已有Boss进程在运行（PID: %s），请等待当前任务完成或先终止现有进程",
                existingPids
            ));
            response.put("status", "process_running");
            response.put("existingPids", existingPids);
            response.put("userId", userId);
            log.warn("用户{}已有Boss进程在运行，拒绝重复启动登录流程", userId);
            return ResponseEntity.ok(response);
        }

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

            // ✅ 修复：在异步任务之前获取SecurityContext，避免在异步线程中丢失
            final org.springframework.security.core.context.SecurityContext securityContext =
                org.springframework.security.core.context.SecurityContextHolder.getContext();
            final String finalUserId = userId; // 保存userId的最终引用

            // 异步启动Boss程序（有头模式，用于生成二维码）
            CompletableFuture.runAsync(() -> {
                // ✅ 修复：在异步线程中恢复SecurityContext
                org.springframework.security.core.context.SecurityContextHolder.setContext(securityContext);

                try {
                    log.info("🚀 异步启动Boss程序以生成登录二维码... (用户: {})", finalUserId);

                    // ✅ 启动Boss程序（只登录模式，不执行投递）
                    bossExecutionService.executeBossProgram(
                        System.getProperty("java.io.tmpdir") + File.separator + "boss_login.log",
                        false,  // headless=false（有头模式，用于生成二维码）
                        true    // loginOnly=true（只登录，不投递）
                    );

                    // 等待二维码生成（最多等待30秒）
                    int maxWaitTime = 30; // 30秒
                    int waitInterval = 2; // 每2秒检查一次

                    for (int i = 0; i < maxWaitTime; i += waitInterval) {
                        Thread.sleep(waitInterval * 1000L);

                        // ✅ 修复：使用用户ID相关的二维码文件路径
                        String qrcodePath = System.getProperty("java.io.tmpdir") + File.separator + "boss_qrcode_" +
                            finalUserId.replaceAll("[^a-zA-Z0-9_-]", "_") + ".png";
                        File qrcodeFile = new File(qrcodePath);
                        if (qrcodeFile.exists() && qrcodeFile.length() > 0) {
                            log.info("✅ 二维码文件已生成: {} ({}KB)", qrcodePath, qrcodeFile.length() / 1024);
                            break;
                        }

                        log.debug("⏳ 等待二维码生成... ({}/{}秒)", i + waitInterval, maxWaitTime);
                    }

                    // ✅ 修复：检查最终状态，使用用户ID相关的二维码文件路径
                    String qrcodePath = System.getProperty("java.io.tmpdir") + File.separator + "boss_qrcode_" +
                        finalUserId.replaceAll("[^a-zA-Z0-9_-]", "_") + ".png";
                    File qrcodeFile = new File(qrcodePath);
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
                    userLoginStatus.put(finalUserId, false);
                    log.info("用户{}登录流程结束，已释放锁", finalUserId);

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
     * 获取二维码图片（已废弃）
     *
     * ⚠️ 服务器端二维码生成在生产环境无法使用
     *
     * @deprecated 使用本地登录方案
     */
    @GetMapping("/qrcode")
    @Deprecated
    public ResponseEntity<?> getQRCode(@RequestParam(value = "format", required = false) String format) {
        // ✅ 修复：生产环境直接返回410 Gone状态码
        if (isProductionEnvironment()) {
            log.warn("⚠️ 生产环境拒绝访问已废弃的接口 /api/boss/login/qrcode");
            return createDeprecatedResponse();
        }

        log.warn("⚠️ 调用了已废弃的接口 /api/boss/login/qrcode");
        log.warn("⚠️ 服务器无图形界面，无法生成二维码，请使用本地登录方案");
        // 为链路追踪生成traceId并写入响应头
        String traceId = java.util.UUID.randomUUID().toString();
        MDC.put("traceId", traceId);
        try {
            // ✅ 修复：使用用户ID相关的二维码文件路径
            String qrcodePath = getQRCodePath();
            File qrcodeFile = new File(qrcodePath);

            if (!qrcodeFile.exists()) {
                log.warn("[{}] 二维码文件不存在: {}", traceId, qrcodePath);
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
            // ✅ 修复：统一使用sanitizeUserId()确保用户ID格式一致
            String userId = util.UserContextUtil.sanitizeUserId(util.UserContextUtil.getCurrentUserId());
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
            // ✅ 修复：使用用户隔离的状态文件路径
            String userId = util.UserContextUtil.sanitizeUserId(util.UserContextUtil.getCurrentUserId());
            String safeUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "_");
            String userStatusFile = System.getProperty("java.io.tmpdir") + File.separator + "boss_login_status_" + safeUserId + ".txt";

            // 【新增】检查是否有登录流程正在进行
            if (isLoginInProgress) {
                long elapsed = System.currentTimeMillis() - loginStartTime;
                response.put("isInProgress", true);
                response.put("elapsedSeconds", elapsed / 1000);
            } else {
                response.put("isInProgress", false);
            }

            // ✅ 修复：优先使用用户隔离的状态文件，如果不存在则使用全局状态文件（向后兼容）
            File statusFile = new File(userStatusFile);
            if (!statusFile.exists()) {
                // 向后兼容：检查全局状态文件
                statusFile = new File(LOGIN_STATUS_FILE);
            }

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
                    // ✅ 修复：使用用户ID相关的二维码文件路径
                    String qrcodePath = getQRCodePath();
                    response.put("hasQRCode", new File(qrcodePath).exists());
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
     * @param userId 用户ID
     */
    private void cleanupLoginFiles(String userId) {
        try {
            // ❌ 已删除default_user判断（所有用户都需要清理自己的Cookie）
            if (userId != null) {
                // ✅ 修复：确保userId已sanitize（如果传入的是原始格式，需要sanitize）
                String safeUserId = userId.contains("@") ? util.UserContextUtil.sanitizeUserId(userId) : userId;
                // 清理用户特定的Cookie文件
                String userCookiePath = "/tmp/boss_cookies_" + safeUserId + ".json";
                Files.deleteIfExists(Paths.get(userCookiePath));
                log.info("清理用户{}的Cookie文件: {}", safeUserId, userCookiePath);
            }

            // ✅ 修复：清理用户特定的二维码和状态文件
            if (userId != null && !userId.isEmpty()) {
                String safeUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "_");
                String qrcodePath = System.getProperty("java.io.tmpdir") + File.separator + "boss_qrcode_" + safeUserId + ".png";
                String statusFilePath = System.getProperty("java.io.tmpdir") + File.separator + "boss_login_status_" + safeUserId + ".txt";
                Files.deleteIfExists(Paths.get(qrcodePath));
                Files.deleteIfExists(Paths.get(statusFilePath));
                log.info("清理登录文件完成（用户: {}）", userId);
            } else {
                log.warn("用户ID为空，跳过清理登录文件");
            }
        } catch (IOException e) {
            log.warn("清理登录文件失败", e);
        }
    }

    /**
     * 清理登录文件（向后兼容：无用户ID参数）
     * @deprecated 建议使用 cleanupLoginFiles(String userId)
     */
    @Deprecated
    private void cleanupLoginFiles() {
        log.warn("⚠️ 调用了过时的cleanupLoginFiles()方法，请使用带userId参数的版本");
        // ✅ 修复：清理默认路径的登录文件（向后兼容）
        try {
            String defaultQrcodePath = System.getProperty("java.io.tmpdir") + File.separator + "boss_qrcode.png";
            String defaultStatusPath = System.getProperty("java.io.tmpdir") + File.separator + "boss_login_status.txt";
            Files.deleteIfExists(Paths.get(defaultQrcodePath));
            Files.deleteIfExists(Paths.get(defaultStatusPath));
        } catch (IOException e) {
            log.warn("清理登录文件失败", e);
        }
    }

    /**
     * 检查Cookie有效性
     * @param userId 用户ID
     * @return true如果Cookie有效，false如果无效或不存在
     */
    private boolean checkCookieValidity(String userId) {
        try {
            // 获取可能的Cookie文件路径
            // ❌ 已删除default_user fallback机制（多租户隔离要求）
            // 每个用户只检查自己的Cookie文件
            String sanitizedUserId = util.UserContextUtil.sanitizeUserId(userId);

            // ✅ 修复：使用System.getProperty("java.io.tmpdir")获取临时目录，与BossLoginService保持一致
            String tempDir = System.getProperty("java.io.tmpdir");
            String[] possiblePaths = {
                tempDir + File.separator + "boss_cookies_" + sanitizedUserId + ".json",  // 系统临时目录（第一优先级）
                "/tmp/boss_cookies_" + sanitizedUserId + ".json",  // Linux标准临时目录（第二优先级）
                "user_data/" + sanitizedUserId + "/boss_cookie.json"  // 用户数据目录（第三优先级）
            };

            log.info("检查Cookie文件路径，用户: {}, 临时目录: {}", sanitizedUserId, tempDir);

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
