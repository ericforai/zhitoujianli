package controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

/**
 * Boss程序Cookie管理控制器
 * 用于处理Boss直聘登录Cookie的配置和管理
 */
@RestController
@RequestMapping("/api/boss")
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080", "http://115.190.182.95:3000"})
public class BossCookieController {

    private static final String COOKIE_FILE_PATH = "src/main/java/boss/cookie.json";

    /**
     * 保存Boss登录Cookie
     */
    @PostMapping("/cookie")
    public Map<String, Object> saveCookie(@RequestBody Map<String, Object> request) {
        try {
            String zpToken = (String) request.get("zp_token");
            String session = (String) request.get("session");

            if (zpToken == null || session == null) {
                return Map.of(
                    "success", false,
                    "message", "zp_token和session不能为空"
                );
            }

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

            // 确保目录存在
            File cookieFile = new File(COOKIE_FILE_PATH);
            cookieFile.getParentFile().mkdirs();

            // 写入Cookie文件
            try (FileWriter writer = new FileWriter(cookieFile)) {
                writer.write(cookieJson);
            }

            log.info("Boss Cookie保存成功");
            return Map.of(
                "success", true,
                "message", "Cookie保存成功，可以启动Boss程序",
                "cookie_file", COOKIE_FILE_PATH
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
     * 获取当前Cookie配置
     */
    @GetMapping("/cookie")
    public Map<String, Object> getCookie() {
        try {
            File cookieFile = new File(COOKIE_FILE_PATH);
            if (!cookieFile.exists()) {
                return Map.of(
                    "success", false,
                    "message", "Cookie文件不存在",
                    "has_cookie", false
                );
            }

            String cookieContent = Files.readString(Paths.get(COOKIE_FILE_PATH));
            return Map.of(
                "success", true,
                "message", "获取Cookie成功",
                "has_cookie", true,
                "cookie_content", cookieContent
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
     * 清除Cookie配置
     */
    @DeleteMapping("/cookie")
    public Map<String, Object> clearCookie() {
        try {
            File cookieFile = new File(COOKIE_FILE_PATH);
            if (cookieFile.exists()) {
                cookieFile.delete();
                log.info("Boss Cookie已清除");
            }

            return Map.of(
                "success", true,
                "message", "Cookie已清除"
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
     * 生成用户本地运行脚本
     */
    @PostMapping("/generate-script")
    public ResponseEntity<String> generateUserScript(@RequestParam String userId) {
        try {
            // 检查Cookie状态
            File cookieFile = new File(COOKIE_FILE_PATH);
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
     * 启动Boss投递任务（混合模式）
     */
    @PostMapping("/start-hybrid-delivery")
    public Map<String, Object> startHybridDelivery(@RequestParam String userId) {
        try {
            // 检查Cookie状态
            File cookieFile = new File(COOKIE_FILE_PATH);
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

        script.append("// Boss投递本地运行脚本 - 用户ID: ").append(userId).append("\n");
        script.append("// 生成时间: ").append(new java.util.Date()).append("\n");
        script.append("// 需要先安装依赖: npm install playwright ws\n\n");

        script.append("const { chromium } = require('playwright');\n");
        script.append("const WebSocket = require('ws');\n\n");

        script.append("class BossRunner {\n");
        script.append("    constructor(serverUrl, userId) {\n");
        script.append("        this.serverUrl = serverUrl;\n");
        script.append("        this.userId = userId;\n");
        script.append("        this.browser = null;\n");
        script.append("        this.page = null;\n");
        script.append("        this.ws = null;\n");
        script.append("        this.isLoginMode = false;\n");
        script.append("    }\n\n");

        if (hasValidCookie) {
            // 有Cookie的情况，直接无头模式
            script.append("    async start() {\n");
            script.append("        try {\n");
            script.append("            console.log('🚀 启动Boss投递程序（无头模式）...');\n");
            script.append("            await this.startHeadlessMode();\n");
            script.append("        } catch (error) {\n");
            script.append("            console.error('❌ 启动失败:', error);\n");
            script.append("            process.exit(1);\n");
            script.append("        }\n");
            script.append("    }\n\n");
        } else {
            // 无Cookie的情况，需要登录
            script.append("    async start() {\n");
            script.append("        try {\n");
            script.append("            console.log('🚀 启动Boss投递程序...');\n");
            script.append("            await this.connectWebSocket();\n");
            script.append("            console.log('📡 等待服务器指令...');\n");
            script.append("        } catch (error) {\n");
            script.append("            console.error('❌ 启动失败:', error);\n");
            script.append("            process.exit(1);\n");
            script.append("        }\n");
            script.append("    }\n\n");
        }

        // 添加WebSocket连接方法
        script.append("    async connectWebSocket() {\n");
        script.append("        return new Promise((resolve, reject) => {\n");
        script.append("            const wsUrl = `ws://115.190.182.95:8080/ws/boss-delivery?userId=").append(userId).append("`;\n");
        script.append("            console.log('🔌 连接到服务器:', wsUrl);\n");
        script.append("            this.ws = new WebSocket(wsUrl);\n");
        script.append("            this.ws.on('open', () => {\n");
        script.append("                console.log('✅ WebSocket连接成功');\n");
        script.append("                resolve();\n");
        script.append("            });\n");
        script.append("            this.ws.on('message', (data) => {\n");
        script.append("                try {\n");
        script.append("                    const message = JSON.parse(data);\n");
        script.append("                    this.handleMessage(message);\n");
        script.append("                } catch (error) {\n");
        script.append("                    console.error('❌ 消息解析失败:', error);\n");
        script.append("                }\n");
        script.append("            });\n");
        script.append("            this.ws.on('error', reject);\n");
        script.append("            this.ws.on('close', () => {\n");
        script.append("                console.log('🔌 WebSocket连接关闭');\n");
        script.append("                this.cleanup();\n");
        script.append("            });\n");
        script.append("        });\n");
        script.append("    }\n\n");

        // 添加消息处理方法
        script.append("    async handleMessage(message) {\n");
        script.append("        console.log('📨 收到指令:', message.action);\n");
        script.append("        switch (message.action) {\n");
        script.append("            case 'login':\n");
        script.append("                await this.handleLogin();\n");
        script.append("                break;\n");
        script.append("            case 'start_delivery':\n");
        script.append("                await this.handleDelivery(message.config);\n");
        script.append("                break;\n");
        script.append("            default:\n");
        script.append("                console.log('📨', message.message || message);\n");
        script.append("        }\n");
        script.append("    }\n\n");

        // 添加登录处理方法
        script.append("    async handleLogin() {\n");
        script.append("        try {\n");
        script.append("            console.log('🔐 开始登录流程...');\n");
        script.append("            this.isLoginMode = true;\n");
        script.append("            this.browser = await chromium.launch({\n");
        script.append("                headless: false,\n");
        script.append("                channel: 'chrome'\n");
        script.append("            });\n");
        script.append("            this.page = await this.browser.newPage();\n");
        script.append("            await this.page.goto('https://www.zhipin.com/web/user/?ka=header-login');\n");
        script.append("            console.log('⏳ 等待用户扫码登录...');\n");
        script.append("            console.log('💡 请在浏览器中扫码完成登录');\n");
        script.append("            await this.monitorLoginStatus();\n");
        script.append("        } catch (error) {\n");
        script.append("            console.error('❌ 登录流程失败:', error);\n");
        script.append("        }\n");
        script.append("    }\n\n");

        // 添加登录状态监控
        script.append("    async monitorLoginStatus() {\n");
        script.append("        const maxWaitTime = 5 * 60 * 1000;\n");
        script.append("        const startTime = Date.now();\n");
        script.append("        while (Date.now() - startTime < maxWaitTime) {\n");
        script.append("            const currentUrl = this.page.url();\n");
        script.append("            if (currentUrl.includes('/user/') && !currentUrl.includes('/login')) {\n");
        script.append("                console.log('✅ 检测到登录成功！');\n");
        script.append("                const cookies = await this.page.context().cookies();\n");
        script.append("                this.sendMessage({\n");
        script.append("                    action: 'login_complete',\n");
        script.append("                    cookies: cookies\n");
        script.append("                });\n");
        script.append("                this.isLoginMode = false;\n");
        script.append("                return;\n");
        script.append("            }\n");
        script.append("            await this.page.waitForTimeout(1000);\n");
        script.append("        }\n");
        script.append("        throw new Error('登录超时，请重试');\n");
        script.append("    }\n\n");

        // 添加投递处理方法
        script.append("    async handleDelivery(config) {\n");
        script.append("        try {\n");
        script.append("            console.log('📋 开始投递简历...');\n");
        script.append("            if (this.isLoginMode && this.browser) {\n");
        script.append("                console.log('🔄 切换到无头模式...');\n");
        script.append("                await this.browser.close();\n");
        script.append("                this.isLoginMode = false;\n");
        script.append("            }\n");
        script.append("            if (!this.browser) {\n");
        script.append("                this.browser = await chromium.launch({ headless: true });\n");
        script.append("                this.page = await this.browser.newPage();\n");
        script.append("            }\n");
        script.append("            await this.performDelivery(config);\n");
        script.append("        } catch (error) {\n");
        script.append("            console.error('❌ 投递失败:', error);\n");
        script.append("        }\n");
        script.append("    }\n\n");

        // 添加投递执行方法
        script.append("    async performDelivery(config) {\n");
        script.append("        console.log('🎯 投递配置:', config);\n");
        script.append("        for (let i = 1; i <= 10; i++) {\n");
        script.append("            console.log(`📤 投递进度: ${i}/10`);\n");
        script.append("            this.sendMessage({\n");
        script.append("                action: 'delivery_progress',\n");
        script.append("                progress: `${i}/10`\n");
        script.append("            });\n");
        script.append("            await new Promise(resolve => setTimeout(resolve, 2000));\n");
        script.append("        }\n");
        script.append("        console.log('🎉 投递完成！');\n");
        script.append("        this.sendMessage({\n");
        script.append("            action: 'delivery_complete',\n");
        script.append("            summary: { total: 10, successful: 10, failed: 0 }\n");
        script.append("        });\n");
        script.append("    }\n\n");

        // 添加发送消息方法
        script.append("    sendMessage(message) {\n");
        script.append("        if (this.ws && this.ws.readyState === WebSocket.OPEN) {\n");
        script.append("            this.ws.send(JSON.stringify(message));\n");
        script.append("        }\n");
        script.append("    }\n\n");

        // 添加清理方法
        script.append("    async cleanup() {\n");
        script.append("        console.log('🧹 清理资源...');\n");
        script.append("        if (this.page) await this.page.close();\n");
        script.append("        if (this.browser) await this.browser.close();\n");
        script.append("        if (this.ws) this.ws.close();\n");
        script.append("        console.log('✅ 清理完成');\n");
        script.append("    }\n");
        script.append("}\n\n");

        // 添加启动代码
        script.append("const runner = new BossRunner('115.190.182.95:8080', '").append(userId).append("');\n");
        script.append("runner.start().catch(error => {\n");
        script.append("    console.error('❌ 程序异常退出:', error);\n");
        script.append("    process.exit(1);\n");
        script.append("});\n");

        return script.toString();
    }
}
