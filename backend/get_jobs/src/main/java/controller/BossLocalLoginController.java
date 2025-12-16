package controller;

import java.io.File;
import java.io.FileWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;
import service.BossExecutionService;
import util.UserContextUtil;

/**
 * Boss本地登录控制器
 *
 * 支持用户在本地浏览器登录Boss后上传Cookie
 * 完全支持多租户隔离，每个用户使用独立的Boss账号
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-06
 */
@RestController
@RequestMapping("/api/boss/local-login")
@Slf4j
// ✅ 修复：移除@CrossOrigin注解，使用全局CorsConfig统一管理（已包含所有需要的域名）
public class BossLocalLoginController {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private BossExecutionService bossExecutionService;

    /**
     * Cookie数据模型
     */
    public static class CookieData {
        public String name;
        public String value;
        public String domain;
        public String path;
        public Long expires;
        public Boolean httpOnly;
        public Boolean secure;
        public String sameSite;
    }

    /**
     * Cookie上传请求模型
     */
    public static class CookieUploadRequest {
        public List<CookieData> cookies;
    }

    /**
     * 上传Boss登录Cookie
     *
     * 用户在本地浏览器登录Boss后，提取Cookie并上传到服务器
     * 确保每个用户使用自己的Boss账号，实现完全隔离
     *
     * @param request Cookie列表
     * @return 上传结果
     */
    @PostMapping("/cookie/upload")
    public ResponseEntity<Map<String, Object>> uploadCookie(@RequestBody CookieUploadRequest request) {
        try {
            // ✅ 获取当前登录用户ID
            String userId = UserContextUtil.getCurrentUserId();
            String safeUserId = UserContextUtil.sanitizeUserId(userId);

            log.info("📤 用户{}请求上传Boss Cookie", userId);

            // 验证请求
            if (request.cookies == null || request.cookies.isEmpty()) {
                log.warn("⚠️ Cookie列表为空");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Cookie列表不能为空"
                ));
            }

            // 验证关键Cookie是否存在
            boolean hasWt2 = request.cookies.stream().anyMatch(c -> "wt2".equals(c.name));
            if (!hasWt2) {
                log.warn("⚠️ 缺少关键Cookie: wt2");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "缺少关键Cookie: wt2，请确保已成功登录Boss直聘"
                ));
            }

            // ✅ 使用用户隔离的Cookie路径
            String cookiePath = "/tmp/boss_cookies_" + safeUserId + ".json";
            log.info("📁 Cookie保存路径: {}", cookiePath);

            // 转换为JSON并保存
            String cookieJson = objectMapper.writerWithDefaultPrettyPrinter()
                .writeValueAsString(request.cookies);

            try (FileWriter writer = new FileWriter(cookiePath, StandardCharsets.UTF_8)) {
                writer.write(cookieJson);
            }

            log.info("✅ Boss Cookie上传成功: userId={}, cookieCount={}, path={}",
                userId, request.cookies.size(), cookiePath);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cookie上传成功，您现在可以使用自己的Boss账号投递简历");
            response.put("userId", userId);
            response.put("safeUserId", safeUserId);
            response.put("cookiePath", cookiePath);
            response.put("cookieCount", request.cookies.size());

            return ResponseEntity.ok(response);

        } catch (SecurityException e) {
            log.error("❌ 用户未登录", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "message", "请先登录系统"
            ));
        } catch (Exception e) {
            log.error("❌ 上传Cookie失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "上传Cookie失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 检查Cookie状态
     *
     * 检查当前用户是否已上传Boss Cookie
     *
     * @return Cookie状态信息
     */
    @GetMapping("/cookie/status")
    public ResponseEntity<Map<String, Object>> checkCookieStatus() {
        try {
            // ✅ 获取当前登录用户ID
            String userId = UserContextUtil.getCurrentUserId();
            String safeUserId = UserContextUtil.sanitizeUserId(userId);
            String cookiePath = "/tmp/boss_cookies_" + safeUserId + ".json";

            File cookieFile = new File(cookiePath);
            boolean exists = cookieFile.exists();
            long fileSize = exists ? cookieFile.length() : 0;

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("hasCookie", exists && fileSize > 10);
            response.put("userId", userId);
            response.put("cookiePath", cookiePath);

            if (exists && fileSize > 10) {
                // 解析Cookie文件，检查是否包含关键Cookie
                try {
                    String content = Files.readString(Paths.get(cookiePath));
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> cookies = objectMapper.readValue(content, List.class);

                    boolean hasWt2 = cookies.stream()
                        .anyMatch(c -> "wt2".equals(c.get("name")));

                    response.put("isValid", hasWt2);
                    response.put("cookieCount", cookies.size());
                    response.put("message", hasWt2 ? "Boss Cookie有效" : "Cookie无效，缺少关键字段");
                } catch (Exception e) {
                    log.warn("解析Cookie文件失败: {}", e.getMessage());
                    response.put("isValid", false);
                    response.put("message", "Cookie文件格式错误");
                }
            } else {
                response.put("isValid", false);
                response.put("message", exists ? "Cookie文件为空" : "尚未上传Cookie");
            }

            return ResponseEntity.ok(response);

        } catch (SecurityException e) {
            log.error("❌ 用户未登录", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "message", "请先登录系统"
            ));
        } catch (Exception e) {
            log.error("❌ 检查Cookie状态失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "检查Cookie状态失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 清除Boss Cookie
     *
     * 删除当前用户的Boss登录Cookie
     * 用户需要重新登录Boss
     *
     * @return 清除结果
     */
    @DeleteMapping("/cookie/clear")
    public ResponseEntity<Map<String, Object>> clearCookie() {
        try {
            // ✅ 获取当前登录用户ID
            String userId = UserContextUtil.getCurrentUserId();
            String safeUserId = UserContextUtil.sanitizeUserId(userId);
            String cookiePath = "/tmp/boss_cookies_" + safeUserId + ".json";

            File cookieFile = new File(cookiePath);
            boolean deleted = false;

            if (cookieFile.exists()) {
                deleted = cookieFile.delete();
                if (deleted) {
                    log.info("✅ Boss Cookie已清除: userId={}, path={}", userId, cookiePath);
                } else {
                    log.warn("⚠️ Cookie文件删除失败: {}", cookiePath);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", deleted ? "Cookie已清除，请重新登录Boss" : "Cookie文件不存在");
            response.put("userId", userId);
            response.put("deleted", deleted);

            return ResponseEntity.ok(response);

        } catch (SecurityException e) {
            log.error("❌ 用户未登录", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "message", "请先登录系统"
            ));
        } catch (Exception e) {
            log.error("❌ 清除Cookie失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "清除Cookie失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 获取Boss登录引导信息
     *
     * 返回本地登录的操作指南
     *
     * @return 登录引导信息
     */
    @GetMapping("/guide")
    public ResponseEntity<Map<String, Object>> getLoginGuide() {
        try {
            String userId = UserContextUtil.getCurrentUserId();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userId", userId);
            response.put("guide", Map.of(
                "step1", "在新窗口打开Boss直聘登录页: https://www.zhipin.com/web/user/?ka=header-login",
                "step2", "使用Boss直聘App扫码登录",
                "step3", "登录成功后，按F12打开浏览器开发者工具",
                "step4", "在Console中执行Cookie提取代码（见extractScript字段）",
                "step5", "复制输出的JSON内容",
                "step6", "粘贴到系统的Cookie上传表单并提交"
            ));
            response.put("loginUrl", "https://www.zhipin.com/web/user/?ka=header-login");
            response.put("extractScript", "JSON.stringify(document.cookie.split('; ').map(c => { const [name, value] = c.split('='); return {name, value, domain: '.zhipin.com', path: '/'}; }))");

            return ResponseEntity.ok(response);

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "message", "请先登录系统"
            ));
        } catch (Exception e) {
            log.error("获取登录引导失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "获取登录引导失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 启动服务器端扫码登录
     *
     * 启动Boss程序（只登录模式），显示二维码供用户扫码
     *
     * @return 启动结果
     */
    @PostMapping("/start-server-login")
    public ResponseEntity<Map<String, Object>> startServerLogin() {
        try {
            String userId = UserContextUtil.getCurrentUserId();
            log.info("📱 用户{}请求启动服务器端扫码登录", userId);

            // ✅ 修复：按用户隔离状态文件
            String safeUserId = UserContextUtil.sanitizeUserId(userId);
            String statusFile = System.getProperty("java.io.tmpdir") + File.separator + "boss_login_status_" + safeUserId + ".txt";
            File status = new File(statusFile);
            if (status.exists()) {
                try {
                    String statusContent = Files.readString(Paths.get(statusFile));

                    // ✅ 新增：检查文件修改时间，超过3分钟自动失效
                    long lastModified = status.lastModified();
                    long now = System.currentTimeMillis();
                    long ageMinutes = (now - lastModified) / (1000 * 60);

                    if (ageMinutes >= 3) {
                        log.warn("⚠️ 登录状态文件已超时（{}分钟），自动清理", ageMinutes);
                        status.delete();

                        // ✅ 清理可能存在的二维码文件
                        String qrcodePath = System.getProperty("java.io.tmpdir") + File.separator + "boss_qrcode_" + safeUserId + ".png";
                        new File(qrcodePath).delete();

                        log.info("✅ 已清理超时的登录任务，允许重新启动");
                    } else if ("waiting".equals(statusContent.trim())) {
                        log.warn("⚠️ 已有登录任务在运行（{}分钟）", ageMinutes);
                        return ResponseEntity.badRequest().body(Map.of(
                            "success", false,
                            "message", "已有登录任务在运行，请稍候（已运行" + ageMinutes + "分钟）"
                        ));
                    } else if ("success".equals(statusContent.trim())) {
                        // success状态保留较短时间即可，因为Cookie已经保存
                        if (ageMinutes < 1) {
                            log.info("⚠️ 登录刚刚成功，请勿重复启动");
                            return ResponseEntity.badRequest().body(Map.of(
                                "success", false,
                                "message", "登录已成功，无需重复启动"
                            ));
                        } else {
                            // 超过1分钟的success状态自动清理
                            log.info("✅ 清理旧的成功状态文件");
                            status.delete();
                        }
                    }
                } catch (Exception e) {
                    // 忽略读取错误，继续执行
                }
            }

            // 启动只登录模式的Boss程序
            String logFile = "/tmp/boss_login_" + System.currentTimeMillis() + ".log";
            bossExecutionService.executeBossProgram(logFile, false, true); // false=有头模式, true=只登录

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "扫码登录已启动，请等待二维码生成");
            response.put("userId", userId);
            response.put("logFile", logFile);

            return ResponseEntity.ok(response);

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "message", "请先登录系统"
            ));
        } catch (Exception e) {
            log.error("❌ 启动服务器端扫码登录失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "启动扫码登录失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 获取二维码图片
     *
     * @return 二维码图片（Base64编码）
     */
    @GetMapping("/qrcode")
    public ResponseEntity<Map<String, Object>> getQRCode() {
        try {
            // ✅ 修复：兼容匿名访问，尝试从SecurityContext获取，失败则从请求获取
            String userId;
            try {
                userId = UserContextUtil.getCurrentUserId();
            } catch (SecurityException e) {
                // 如果未认证，则查找最近的登录状态文件
                log.warn("未认证用户访问二维码，查找最近的登录状态文件");
                File tmpDir = new File(System.getProperty("java.io.tmpdir"));
                File[] qrcodeFiles = tmpDir.listFiles((dir, name) ->
                    name.startsWith("boss_qrcode_") && name.endsWith(".png"));

                if (qrcodeFiles == null || qrcodeFiles.length == 0) {
                    return ResponseEntity.ok(Map.of(
                        "success", false,
                        "hasQRCode", false,
                        "message", "二维码尚未生成，请先启动登录"
                    ));
                }

                // 返回最新的二维码文件
                File latestQrcode = qrcodeFiles[0];
                for (File f : qrcodeFiles) {
                    if (f.lastModified() > latestQrcode.lastModified()) {
                        latestQrcode = f;
                    }
                }

                byte[] imageBytes = Files.readAllBytes(latestQrcode.toPath());
                String base64Image = java.util.Base64.getEncoder().encodeToString(imageBytes);

                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "hasQRCode", true,
                    "imageData", "data:image/png;base64," + base64Image
                ));
            }

            String safeUserId = UserContextUtil.sanitizeUserId(userId);
            String qrcodePath = System.getProperty("java.io.tmpdir") + File.separator + "boss_qrcode_" + safeUserId + ".png";
            File qrcodeFile = new File(qrcodePath);

            if (!qrcodeFile.exists()) {
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "hasQRCode", false,
                    "message", "二维码尚未生成，请稍候"
                ));
            }

            // 读取图片并转换为Base64
            byte[] imageBytes = Files.readAllBytes(qrcodeFile.toPath());
            String base64Image = java.util.Base64.getEncoder().encodeToString(imageBytes);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "hasQRCode", true,
                "imageData", "data:image/png;base64," + base64Image
            ));

        } catch (Exception e) {
            log.error("❌ 获取二维码失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "hasQRCode", false,
                "message", "获取二维码失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 获取登录状态
     *
     * @return 登录状态：waiting, success, failed, not_started
     */
    @GetMapping("/login-status")
    public ResponseEntity<Map<String, Object>> getLoginStatus() {
        try {
            String userId = UserContextUtil.getCurrentUserId();
            // ✅ 修复：按用户隔离状态文件
            String safeUserId = UserContextUtil.sanitizeUserId(userId);
            String statusFile = System.getProperty("java.io.tmpdir") + File.separator + "boss_login_status_" + safeUserId + ".txt";
            File status = new File(statusFile);

            if (!status.exists()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "status", "not_started",
                    "message", "尚未启动登录"
                ));
            }

            String statusContent = Files.readString(Paths.get(statusFile)).trim();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("status", statusContent);

            if ("success".equals(statusContent)) {
                // 检查Cookie是否已保存
                String cookiePath = "/tmp/boss_cookies_" + safeUserId + ".json";
                File cookieFile = new File(cookiePath);

                response.put("message", "登录成功！Cookie已自动保存");
                response.put("hasCookie", cookieFile.exists());
            } else if ("waiting".equals(statusContent)) {
                response.put("message", "等待扫码登录...");
            } else if ("failed".equals(statusContent)) {
                response.put("message", "登录失败，请重试");
            } else {
                response.put("message", "未知状态: " + statusContent);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ 获取登录状态失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "status", "error",
                "message", "获取登录状态失败: " + e.getMessage()
            ));
        }
    }
}



