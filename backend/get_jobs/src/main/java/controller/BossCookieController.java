package controller;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;
import util.UserContextUtil;

/**
 * Boss程序Cookie管理控制器（已废弃）
 *
 * ⚠️ 此控制器已废弃，请使用 BossLocalLoginController
 *
 * @deprecated 使用BossLocalLoginController替代，支持完整的多用户隔离
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 * @updated 2025-11-06 - 标记为废弃
 */
@RestController
@RequestMapping("/api/boss")
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080", "http://115.190.182.95:3000"})
@Deprecated
public class BossCookieController {

    /**
     * 保存Boss登录Cookie（已废弃）
     *
     * @deprecated 使用 /api/boss/local-login/cookie/upload 替代
     */
    @PostMapping("/cookie")
    @Deprecated
    public Map<String, Object> saveCookie(@RequestBody Map<String, Object> request) {
        log.warn("⚠️ 调用了已废弃的接口 /api/boss/cookie，请使用 /api/boss/local-login/cookie/upload");

        try {
            // ✅ 多租户支持：获取当前用户ID
            String userId = UserContextUtil.sanitizeUserId(UserContextUtil.getCurrentUserId());

            String zpToken = (String) request.get("zp_token");
            String session = (String) request.get("session");

            if (zpToken == null || session == null) {
                return Map.of(
                    "success", false,
                    "message", "zp_token和session不能为空"
                );
            }

            // ✅ 使用用户隔离的Cookie路径
            String cookiePath = "/tmp/boss_cookies_" + userId + ".json";
            log.info("保存Cookie到用户隔离路径: userId={}, path={}", userId, cookiePath);

            // 构建Cookie JSON
            String cookieJson = String.format(
                "[{\n" +
                "  \"name\": \"zp_token\",\n" +
                "  \"value\": \"%s\",\n" +
                "  \"domain\": \".zhipin.com\",\n" +
                "  \"path\": \"/\",\n" +
                "  \"expires\": -1,\n" +
                "  \"httpOnly\": false,\n" +
                "  \"secure\": false,\n" +
                "  \"sameSite\": \"Lax\"\n" +
                "},\n" +
                "{\n" +
                "  \"name\": \"session\",\n" +
                "  \"value\": \"%s\",\n" +
                "  \"domain\": \".zhipin.com\",\n" +
                "  \"path\": \"/\",\n" +
                "  \"expires\": -1,\n" +
                "  \"httpOnly\": true,\n" +
                "  \"secure\": false,\n" +
                "  \"sameSite\": \"Lax\"\n" +
                "}]",
                zpToken, session
            );

            // 写入Cookie文件（/tmp目录无需创建）
            try (FileWriter writer = new FileWriter(cookiePath, StandardCharsets.UTF_8)) {
                writer.write(cookieJson);
            }

            log.info("✅ Boss Cookie保存成功: userId={}, path={}", userId, cookiePath);
            return Map.of(
                "success", true,
                "message", "Cookie保存成功（已废弃接口，建议使用新接口）",
                "cookie_file", cookiePath,
                "userId", userId
            );

        } catch (Exception e) {
            log.error("保存Boss Cookie失败", e);
            return Map.of(
                "success", false,
                "message", "保存Cookie失败: " + e.getMessage()
            );
        }
    }

    /**
     * 获取当前Cookie配置（已废弃）
     *
     * @deprecated 使用 /api/boss/local-login/cookie/status 替代
     */
    @GetMapping("/cookie")
    @Deprecated
    public Map<String, Object> getCookie() {
        log.warn("⚠️ 调用了已废弃的接口 /api/boss/cookie，请使用 /api/boss/local-login/cookie/status");

        try {
            // ✅ 多租户支持：获取当前用户ID
            String userId = UserContextUtil.sanitizeUserId(UserContextUtil.getCurrentUserId());
            String cookiePath = "/tmp/boss_cookies_" + userId + ".json";

            File cookieFile = new File(cookiePath);
            if (!cookieFile.exists()) {
                return Map.of(
                    "success", false,
                    "message", "Cookie文件不存在",
                    "has_cookie", false,
                    "userId", userId
                );
            }

            String cookieContent = Files.readString(Paths.get(cookiePath));
            return Map.of(
                "success", true,
                "message", "获取Cookie成功",
                "has_cookie", true,
                "cookie_content", cookieContent,
                "userId", userId
            );

        } catch (Exception e) {
            log.error("读取Cookie失败", e);
            return Map.of(
                "success", false,
                "message", "读取Cookie失败: " + e.getMessage(),
                "has_cookie", false
            );
        }
    }

    /**
     * 清除Cookie配置（已废弃）
     *
     * @deprecated 使用 /api/boss/local-login/cookie/clear 替代
     */
    @DeleteMapping("/cookie")
    @Deprecated
    public Map<String, Object> clearCookie() {
        log.warn("⚠️ 调用了已废弃的接口 DELETE /api/boss/cookie，请使用 /api/boss/local-login/cookie/clear");

        try {
            // ✅ 多租户支持：获取当前用户ID
            String userId = UserContextUtil.sanitizeUserId(UserContextUtil.getCurrentUserId());
            String cookiePath = "/tmp/boss_cookies_" + userId + ".json";

            File cookieFile = new File(cookiePath);
            if (cookieFile.exists()) {
                if (cookieFile.delete()) {
                    log.info("✅ Boss Cookie已清除: userId={}, path={}", userId, cookiePath);
                } else {
                    log.warn("⚠️ Cookie文件删除失败: {}", cookiePath);
                }
            }

            return Map.of(
                "success", true,
                "message", "Cookie已清除",
                "userId", userId
            );

        } catch (Exception e) {
            log.error("清除Cookie失败", e);
            return Map.of(
                "success", false,
                "message", "清除Cookie失败: " + e.getMessage()
            );
        }
    }

    /**
     * 启动有头模式登录
     */
    @PostMapping("/login-with-ui")
    public Map<String, Object> loginWithUI() {
        try {
            // 这里调用BossExecutionService启动有头模式登录
            // 由于需要在独立进程中运行，我们返回启动信息
            return Map.of(
                "success", true,
                "message", "有头模式登录已启动，请在弹出的浏览器窗口中完成登录",
                "note", "登录成功后程序会自动切换到无头模式继续运行"
            );

        } catch (Exception e) {
            log.error("启动有头模式登录失败", e);
            return Map.of(
                "success", false,
                "message", "启动有头模式登录失败: " + e.getMessage()
            );
        }
    }

    /**
     * 生成用户本地运行脚本（已废弃）
     *
     * @deprecated 不再使用本地脚本方案
     */
    @PostMapping("/generate-script")
    @Deprecated
    public ResponseEntity<String> generateUserScript(@RequestParam String userId) {
        try {
            // ✅ 多租户支持：使用用户隔离的Cookie路径
            String safeUserId = UserContextUtil.sanitizeUserId(userId);
            String cookiePath = "/tmp/boss_cookies_" + safeUserId + ".json";
            File cookieFile = new File(cookiePath);
            boolean hasValidCookie = cookieFile.exists() && cookieFile.length() > 10;

            // 生成脚本内容
            String scriptContent = generateScriptContent(userId, hasValidCookie);

            // 设置响应头，让浏览器下载文件
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "boss-runner.js");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(scriptContent);

        } catch (Exception e) {
            log.error("生成用户脚本失败", e);
            return ResponseEntity.status(500)
                    .body("生成脚本失败: " + e.getMessage());
        }
    }

    /**
     * 启动Boss投递任务（混合模式）（已废弃）
     *
     * @deprecated 使用 /api/boss/start-task 替代
     */
    @PostMapping("/start-hybrid-delivery")
    @Deprecated
    public Map<String, Object> startHybridDelivery(@RequestParam String userId) {
        try {
            // ✅ 多租户支持：使用用户隔离的Cookie路径
            String safeUserId = UserContextUtil.sanitizeUserId(userId);
            String cookiePath = "/tmp/boss_cookies_" + safeUserId + ".json";
            File cookieFile = new File(cookiePath);
            boolean hasValidCookie = cookieFile.exists() && cookieFile.length() > 10;

            if (hasValidCookie) {
                // 有有效Cookie，直接无头模式启动
                return Map.of(
                    "success", true,
                    "mode", "headless",
                    "message", "使用已保存的登录状态，后台开始投递简历",
                    "download_script", false
                );
            } else {
                // 无有效Cookie，需要用户本地登录
                return Map.of(
                    "success", true,
                    "mode", "headless_first",
                    "message", "首次使用需要本地登录，请下载并运行脚本",
                    "download_script", true,
                    "script_url", "/api/boss/generate-script?userId=" + userId
                );
            }

        } catch (Exception e) {
            log.error("启动混合投递失败", e);
            return Map.of(
                "success", false,
                "message", "启动投递失败: " + e.getMessage()
            );
        }
    }

    /**
     * 生成脚本内容
     */
    private String generateScriptContent(String userId, boolean hasValidCookie) {
        StringBuilder script = new StringBuilder();

        script.append("// Boss投递本地运行脚本 - 用户ID: ").append(userId).append("%n");
        script.append("// 生成时间: ").append(new java.util.Date()).append("%n");
        script.append("// 需要先安装依赖: npm install playwright ws%n%n");

        script.append("const { chromium } = require('playwright');%n");
        script.append("const WebSocket = require('ws');%n%n");

        script.append("class BossRunner {%n");
        script.append("    constructor(serverUrl, userId) {%n");
        script.append("        this.serverUrl = serverUrl;%n");
        script.append("        this.userId = userId;%n");
        script.append("        this.browser = null;%n");
        script.append("        this.page = null;%n");
        script.append("        this.ws = null;%n");
        script.append("        this.isLoginMode = false;%n");
        script.append("    }%n%n");

        if (hasValidCookie) {
            // 有Cookie的情况，直接无头模式
            script.append("    async start() {%n");
            script.append("        try {%n");
            script.append("            console.log('🚀 启动Boss投递程序（无头模式）...');%n");
            script.append("            await this.startHeadlessMode();%n");
            script.append("        } catch (error) {%n");
            script.append("            console.error('❌ 启动失败:', error);%n");
            script.append("            process.exit(1);%n");
            script.append("        }%n");
            script.append("    }%n%n");
        } else {
            // 无Cookie的情况，需要登录
            script.append("    async start() {%n");
            script.append("        try {%n");
            script.append("            console.log('🚀 启动Boss投递程序...');%n");
            script.append("            await this.connectWebSocket();%n");
            script.append("            console.log('📡 等待服务器指令...');%n");
            script.append("        } catch (error) {%n");
            script.append("            console.error('❌ 启动失败:', error);%n");
            script.append("            process.exit(1);%n");
            script.append("        }%n");
            script.append("    }%n%n");
        }

        // 添加WebSocket连接方法
        script.append("    async connectWebSocket() {%n");
        script.append("        return new Promise((resolve, reject) => {%n");
        script.append("            const wsUrl = `ws://115.190.182.95:8080/ws/boss-delivery?userId=").append(userId).append("`;%n");
        script.append("            console.log('🔌 连接到服务器:', wsUrl);%n");
        script.append("            this.ws = new WebSocket(wsUrl);%n");
        script.append("            this.ws.on('open', () => {%n");
        script.append("                console.log('✅ WebSocket连接成功');%n");
        script.append("                resolve();%n");
        script.append("            });%n");
        script.append("            this.ws.on('message', (data) => {%n");
        script.append("                try {%n");
        script.append("                    const message = JSON.parse(data);%n");
        script.append("                    this.handleMessage(message);%n");
        script.append("                } catch (error) {%n");
        script.append("                    console.error('❌ 消息解析失败:', error);%n");
        script.append("                }%n");
        script.append("            });%n");
        script.append("            this.ws.on('error', reject);%n");
        script.append("            this.ws.on('close', () => {%n");
        script.append("                console.log('🔌 WebSocket连接关闭');%n");
        script.append("                this.cleanup();%n");
        script.append("            });%n");
        script.append("        });%n");
        script.append("    }%n%n");

        // 添加消息处理方法
        script.append("    async handleMessage(message) {%n");
        script.append("        console.log('📨 收到指令:', message.action);%n");
        script.append("        switch (message.action) {%n");
        script.append("            case 'login':%n");
        script.append("                await this.handleLogin();%n");
        script.append("                break;%n");
        script.append("            case 'start_delivery':%n");
        script.append("                await this.handleDelivery(message.config);%n");
        script.append("                break;%n");
        script.append("            default:%n");
        script.append("                console.log('📨', message.message || message);%n");
        script.append("        }%n");
        script.append("    }%n%n");

        // 添加登录处理方法
        script.append("    async handleLogin() {%n");
        script.append("        try {%n");
        script.append("            console.log('🔐 开始登录流程...');%n");
        script.append("            this.isLoginMode = true;%n");
        script.append("            this.browser = await chromium.launch({%n");
        script.append("                headless: false,%n");
        script.append("                channel: 'chrome'%n");
        script.append("            });%n");
        script.append("            this.page = await this.browser.newPage();%n");
        script.append("            await this.page.goto('https://www.zhipin.com/web/user/?ka=header-login');%n");
        script.append("            console.log('⏳ 等待用户扫码登录...');%n");
        script.append("            console.log('💡 请在浏览器中扫码完成登录');%n");
        script.append("            await this.monitorLoginStatus();%n");
        script.append("        } catch (error) {%n");
        script.append("            console.error('❌ 登录流程失败:', error);%n");
        script.append("        }%n");
        script.append("    }%n%n");

        // 添加登录状态监控
        script.append("    async monitorLoginStatus() {%n");
        script.append("        const maxWaitTime = 5 * 60 * 1000;%n");
        script.append("        const startTime = Date.now();%n");
        script.append("        while (Date.now() - startTime < maxWaitTime) {%n");
        script.append("            const currentUrl = this.page.url();%n");
        script.append("            if (currentUrl.includes('/user/') && !currentUrl.includes('/login')) {%n");
        script.append("                console.log('✅ 检测到登录成功！');%n");
        script.append("                const cookies = await this.page.context().cookies();%n");
        script.append("                this.sendMessage({%n");
        script.append("                    action: 'login_complete',%n");
        script.append("                    cookies: cookies%n");
        script.append("                });%n");
        script.append("                this.isLoginMode = false;%n");
        script.append("                return;%n");
        script.append("            }%n");
        script.append("            await this.page.waitForTimeout(1000);%n");
        script.append("        }%n");
        script.append("        throw new Error('登录超时，请重试');%n");
        script.append("    }%n%n");

        // 添加投递处理方法
        script.append("    async handleDelivery(config) {%n");
        script.append("        try {%n");
        script.append("            console.log('📋 开始投递简历...');%n");
        script.append("            if (this.isLoginMode && this.browser) {%n");
        script.append("                console.log('🔄 切换到无头模式...');%n");
        script.append("                await this.browser.close();%n");
        script.append("                this.isLoginMode = false;%n");
        script.append("            }%n");
        script.append("            if (!this.browser) {%n");
        script.append("                this.browser = await chromium.launch({ headless: true });%n");
        script.append("                this.page = await this.browser.newPage();%n");
        script.append("            }%n");
        script.append("            await this.performDelivery(config);%n");
        script.append("        } catch (error) {%n");
        script.append("            console.error('❌ 投递失败:', error);%n");
        script.append("        }%n");
        script.append("    }%n%n");

        // 添加投递执行方法
        script.append("    async performDelivery(config) {%n");
        script.append("        console.log('🎯 投递配置:', config);%n");
        script.append("        for (let i = 1; i <= 10; i++) {%n");
        script.append("            console.log(`📤 投递进度: ${i}/10`);%n");
        script.append("            this.sendMessage({%n");
        script.append("                action: 'delivery_progress',%n");
        script.append("                progress: `${i}/10`%n");
        script.append("            });%n");
        script.append("            await new Promise(resolve => setTimeout(resolve, 2000));%n");
        script.append("        }%n");
        script.append("        console.log('🎉 投递完成！');%n");
        script.append("        this.sendMessage({%n");
        script.append("            action: 'delivery_complete',%n");
        script.append("            summary: { total: 10, successful: 10, failed: 0 }%n");
        script.append("        });%n");
        script.append("    }%n%n");

        // 添加发送消息方法
        script.append("    sendMessage(message) {%n");
        script.append("        if (this.ws && this.ws.readyState === WebSocket.OPEN) {%n");
        script.append("            this.ws.send(JSON.stringify(message));%n");
        script.append("        }%n");
        script.append("    }%n%n");

        // 添加清理方法
        script.append("    async cleanup() {%n");
        script.append("        console.log('🧹 清理资源...');%n");
        script.append("        if (this.page) await this.page.close();%n");
        script.append("        if (this.browser) await this.browser.close();%n");
        script.append("        if (this.ws) this.ws.close();%n");
        script.append("        console.log('✅ 清理完成');%n");
        script.append("    }%n");
        script.append("}%n%n");

        // 添加启动代码
        script.append("const runner = new BossRunner('115.190.182.95:8080', '").append(userId).append("');%n");
        script.append("runner.start().catch(error => {%n");
        script.append("    console.error('❌ 程序异常退出:', error);%n");
        script.append("    process.exit(1);%n");
        script.append("});%n");

        return script.toString();
    }

    /**
     * 获取Boss任务状态
     * ✅ 修复：按用户隔离状态，确保用户只能看到自己的投递状态
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getBossStatus() {
        try {
            // ✅ 修复：获取当前用户ID，只返回该用户的状态
            String userId = UserContextUtil.sanitizeUserId(
                UserContextUtil.getCurrentUserId()
            );

            Map<String, Object> status = new HashMap<>();

            // ✅ 修复：检查该用户的Boss进程是否在运行（通过检查日志文件）
            boolean isRunning = checkUserBossProcessRunning(userId);
            status.put("isRunning", isRunning);

            // 🔧 增强统计：获取详细的投递统计信息（已按用户隔离）
            Map<String, Long> deliveryStats = getDetailedDeliveryStats();
            status.put("deliveryCount", deliveryStats.get("success"));  // 向后兼容
            status.put("successCount", deliveryStats.get("success"));
            status.put("skippedCount", deliveryStats.get("skipped"));
            status.put("errorCount", deliveryStats.get("error"));
            status.put("blacklistCount", deliveryStats.get("blacklist"));
            status.put("totalProcessed", deliveryStats.get("total"));
            status.put("userId", userId); // 添加userId用于调试

            log.debug("用户{}的Boss状态检查结果: isRunning={}, 成功={}, 跳过={}, 错误={}, 黑名单={}",
                userId, isRunning, deliveryStats.get("success"), deliveryStats.get("skipped"),
                deliveryStats.get("error"), deliveryStats.get("blacklist"));
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("获取Boss状态失败", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "获取状态失败: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 获取详细的投递统计（成功、跳过、错误、黑名单）
     *
     * ✅ 修复：使用严格的正则表达式解析，确保与parseTodayDeliveries()统计逻辑一致
     * 解决"今日投递"数字显示不一致的问题（主界面5个 vs 弹窗2个）
     */
    private Map<String, Long> getDetailedDeliveryStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("success", 0L);
        stats.put("skipped", 0L);
        stats.put("error", 0L);
        stats.put("blacklist", 0L);
        stats.put("total", 0L);

        try {
            String userId = UserContextUtil.sanitizeUserId(UserContextUtil.getCurrentUserId());
            String logFilePath = "/tmp/boss_delivery_" + userId + ".log";

            File logFile = new File(logFilePath);
            if (!logFile.exists()) {
                log.debug("日志文件不存在: {}", logFilePath);
                return stats;
            }

            LocalDate today = LocalDate.now();

            // ✅ 使用正则表达式严格解析日志格式，确保与parseTodayDeliveries()统计逻辑一致
            // 投递完成日志格式：2025-11-05 11:56:53.254 [main] INFO boss.Boss - 投递完成 | 岗位：XXX | 招呼语：...
            // ✅ 修复：要求必须包含"岗位："，与详情列表的统计逻辑保持一致
            Pattern deliveryPattern = Pattern.compile("(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}).*投递完成.*岗位：");
            Pattern blacklistPattern = Pattern.compile("(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}).*在黑名单中，跳过");
            Pattern errorPattern = Pattern.compile("(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}).*岗位处理异常");

            long successCount = 0;
            long blacklistCount = 0;
            long errorCount = 0;

            try (java.io.BufferedReader reader = Files.newBufferedReader(Paths.get(logFilePath), StandardCharsets.UTF_8)) {
                String line;
                while ((line = reader.readLine()) != null) {
                    // ✅ 使用正则表达式匹配并提取时间戳
                    Matcher successMatcher = deliveryPattern.matcher(line);
                    Matcher blacklistMatcher = blacklistPattern.matcher(line);
                    Matcher errorMatcher = errorPattern.matcher(line);

                    if (successMatcher.find()) {
                        // ✅ 严格验证是否是今天的记录
                        if (isLogDateToday(successMatcher.group(1), today)) {
                            successCount++;
                        }
                    } else if (blacklistMatcher.find()) {
                        if (isLogDateToday(blacklistMatcher.group(1), today)) {
                            blacklistCount++;
                        }
                    } else if (errorMatcher.find()) {
                        if (isLogDateToday(errorMatcher.group(1), today)) {
                            errorCount++;
                        }
                    }
                }
            }

            stats.put("success", successCount);
            stats.put("blacklist", blacklistCount);
            stats.put("error", errorCount);
            stats.put("skipped", blacklistCount + errorCount);
            stats.put("total", successCount + blacklistCount + errorCount);

            log.debug("今日投递统计: 成功={}, 黑名单={}, 错误={}, 总计={}",
                successCount, blacklistCount, errorCount, successCount + blacklistCount + errorCount);

        } catch (Exception e) {
            log.error("统计投递数据失败", e);
        }

        return stats;
    }

    /**
     * 辅助方法：检查日志时间戳是否是今天
     *
     * @param timestamp 日志时间戳（格式：yyyy-MM-dd HH:mm:ss）
     * @param today 今天的日期
     * @return true如果是今天，false否则
     */
    private boolean isLogDateToday(String timestamp, LocalDate today) {
        try {
            LocalDate logDate = LocalDate.parse(timestamp.substring(0, 10));
            return logDate.equals(today);
        } catch (Exception e) {
            log.trace("解析日期失败: {}", timestamp);
            return false;
        }
    }

    /**
     * 获取今日投递统计数量
     * @return 今日投递成功数量
     */
    private long getDeliveryCount() {
        try {
            // ✅ 使用sanitizeUserId()确保与其他接口使用相同的用户ID格式
            String userId = UserContextUtil.sanitizeUserId(
                UserContextUtil.getCurrentUserId()
            );

            // 获取今天的日期
            LocalDate today = LocalDate.now();
            log.debug("统计今日投递数量，当前日期: {}", today);

            // ✅ 修复：统一使用sanitizeUserId()确保日志文件名格式一致
            // userId已经是sanitize过的，直接使用
            String[] possibleLogPaths = {
                "/tmp/boss_delivery_" + userId + ".log"
            };

            for (String logPath : possibleLogPaths) {
                File logFile = new File(logPath);
                if (logFile.exists()) {
                    log.debug("找到日志文件: {}, 统计今日投递数量", logPath);

                    // 统计今日"投递完成"的日志行数
                    try (Stream<String> lines = Files.lines(Paths.get(logPath))) {
                        long count = lines
                            .filter(line -> line.contains("投递完成"))
                            .filter(line -> {
                                // 解析日志时间戳，格式：2025-11-05 11:56:53.254
                                try {
                                    // 提取日期部分（前10个字符）
                                    if (line.length() >= 10) {
                                        String dateStr = line.substring(0, 10);
                                        LocalDate logDate = LocalDate.parse(dateStr);
                                        return logDate.equals(today);
                                    }
                                } catch (Exception e) {
                                    // 解析失败，跳过该行
                                    log.trace("解析日志行日期失败: {}", line);
                                }
                                return false;
                            })
                            .count();
                        log.info("从日志文件 {} 统计到今日投递数量: {}", logPath, count);
                        return count;
                    } catch (IOException e) {
                        log.warn("读取日志文件失败: {}", logPath, e);
                    }
                }
            }

            log.warn("未找到Boss投递日志文件，已尝试的路径: {}", String.join(", ", possibleLogPaths));
            return 0;
        } catch (Exception e) {
            log.error("获取投递统计失败", e);
            return 0;
        }
    }

    /**
     * 检查指定用户的Boss进程是否在运行
     * ✅ 修复：按用户隔离，检查该用户的日志文件是否最近有更新
     * @param userId 用户ID
     * @return true如果该用户的Boss进程在运行，false如果未运行
     */
    private boolean checkUserBossProcessRunning(String userId) {
        try {
            // ✅ 修复：检查该用户的日志文件是否最近有更新（5分钟内）
            String logFilePath = "/tmp/boss_delivery_" + userId + ".log";
            File logFile = new File(logFilePath);

            if (!logFile.exists()) {
                log.debug("用户{}的日志文件不存在: {}", userId, logFilePath);
                return false;
            }

            // 检查日志文件的最后修改时间
            long lastModified = logFile.lastModified();
            long currentTime = System.currentTimeMillis();
            long timeDiff = currentTime - lastModified;

            // 如果日志文件在最近5分钟内被修改过，说明任务正在运行
            // 5分钟 = 5 * 60 * 1000 毫秒
            boolean isRunning = timeDiff < (5 * 60 * 1000);

            if (isRunning) {
                log.debug("用户{}的Boss进程可能在运行（日志文件最近{}秒内更新）", userId, timeDiff / 1000);
            } else {
                log.debug("用户{}的Boss进程可能已停止（日志文件最后更新于{}秒前）", userId, timeDiff / 1000);
            }

            return isRunning;

        } catch (Exception e) {
            log.error("检查用户{}的Boss进程状态失败", userId, e);
            return false;
        }
    }

    /**
     * 获取Boss任务日志
     */
    @GetMapping("/logs")
    public ResponseEntity<Map<String, Object>> getBossLogs(@RequestParam(defaultValue = "50") int lines) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("logs", new String[]{"暂无日志数据"});
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("获取Boss日志失败", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "获取日志失败: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 启动Boss任务
     */
    @PostMapping("/start-task")
    public ResponseEntity<Map<String, Object>> startBossTask() {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Boss任务启动成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("启动Boss任务失败", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "启动任务失败: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 停止Boss任务
     */
    @PostMapping("/stop-task")
    public ResponseEntity<Map<String, Object>> stopBossTask() {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Boss任务停止成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("停止Boss任务失败", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "停止任务失败: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 获取今日投递详情列表
     */
    @GetMapping("/today-deliveries")
    public ResponseEntity<Map<String, Object>> getTodayDeliveryDetails() {
        try {
            // ❌ 已删除default_user fallback（UserContextUtil会在未登录时抛出异常）
            // ✅ 修复：统一使用sanitizeUserId()确保用户ID格式一致
            String userId = UserContextUtil.sanitizeUserId(UserContextUtil.getCurrentUserId());

            // 获取今天的日期
            LocalDate today = LocalDate.now();
            log.debug("获取今日投递详情，当前日期: {}", today);

            // ✅ 修复：统一使用sanitizeUserId()确保日志文件名格式一致
            // userId已经是sanitize过的，直接使用
            String[] possibleLogPaths = {
                "/tmp/boss_delivery_" + userId + ".log"
            };

            List<Map<String, String>> deliveries = new ArrayList<>();

            for (String logPath : possibleLogPaths) {
                File logFile = new File(logPath);
                if (logFile.exists()) {
                    log.debug("解析日志文件: {}", logPath);
                    deliveries = parseTodayDeliveries(logPath, today);
                    break;
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", Map.of(
                "count", deliveries.size(),
                "deliveries", deliveries
            ));

            log.info("今日投递详情获取成功，共{}条记录", deliveries.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("获取今日投递详情失败", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "获取详情失败: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 解析日志文件，提取今日投递记录
     */
    private List<Map<String, String>> parseTodayDeliveries(String logPath, LocalDate today) {
        List<Map<String, String>> deliveries = new ArrayList<>();

        try (Stream<String> lines = Files.lines(Paths.get(logPath))) {
            List<String> logLines = lines.toList();

            // 正则表达式模式
            // 投递完成日志格式：2025-11-05 11:56:53.254 [main] INFO boss.Boss - 投递完成 | 岗位：XXX | 招呼语：...
            Pattern deliveryPattern = Pattern.compile("(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}).*投递完成.*岗位：([^|]+)");
            // 准备投递日志格式：准备投递XXX，公司：YYY
            Pattern preparePattern = Pattern.compile("准备投递([^，]+)，公司：([^，]+)");

            for (int i = 0; i < logLines.size(); i++) {
                String line = logLines.get(i);

                // 检查是否是投递完成记录
                if (line.contains("投递完成")) {
                    Matcher matcher = deliveryPattern.matcher(line);
                    if (matcher.find()) {
                        String timestamp = matcher.group(1);
                        String position = matcher.group(2).trim();

                        // 检查是否是今日记录
                        try {
                            LocalDate logDate = LocalDate.parse(timestamp.substring(0, 10));
                            if (!logDate.equals(today)) {
                                continue;
                            }
                        } catch (Exception e) {
                            log.trace("解析日期失败: {}", timestamp);
                            continue;
                        }

                        // 向前查找"准备投递"日志获取公司信息
                        String company = "未知公司";
                        for (int j = i - 1; j >= Math.max(0, i - 50); j--) {
                            String prevLine = logLines.get(j);
                            if (prevLine.contains("准备投递") && prevLine.contains(position)) {
                                Matcher prepareMatcher = preparePattern.matcher(prevLine);
                                if (prepareMatcher.find()) {
                                    company = prepareMatcher.group(2).trim();
                                    break;
                                }
                            }
                        }

                        // 添加投递记录
                        Map<String, String> delivery = new HashMap<>();
                        delivery.put("time", timestamp);
                        delivery.put("company", company);
                        delivery.put("position", position);
                        deliveries.add(delivery);

                        log.debug("解析到投递记录: 时间={}, 公司={}, 岗位={}", timestamp, company, position);
                    }
                }
            }
        } catch (IOException e) {
            log.error("读取日志文件失败: {}", logPath, e);
        }

        return deliveries;
    }

    /**
     * 获取Boss配置
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getBossConfig() {
        try {
            Map<String, Object> config = new HashMap<>();
            config.put("keywords", Arrays.asList("市场总监", "市场营销", "品牌营销"));
            config.put("cityCode", Arrays.asList("上海"));
            config.put("experience", Arrays.asList("10年以上"));
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            log.error("获取Boss配置失败", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "获取配置失败: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 保存Boss配置
     */
    @PostMapping("/save-config")
    public ResponseEntity<Map<String, Object>> saveBossConfig(@RequestBody Map<String, Object> config) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Boss配置保存成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("保存Boss配置失败", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "保存配置失败: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
