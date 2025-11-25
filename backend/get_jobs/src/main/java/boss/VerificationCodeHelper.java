package boss;

import java.nio.charset.StandardCharsets;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.microsoft.playwright.Page;

/**
 * 验证码处理辅助类
 * 用于Boss程序与主进程通信，处理验证码截图和用户输入
 */
public class VerificationCodeHelper {
    private static final Logger log = LoggerFactory.getLogger(VerificationCodeHelper.class);

    /**
     * 截图验证码页面并创建验证码请求
     * @param page 页面对象
     * @param userId 用户ID
     * @param jobName 岗位名称
     * @param taskId 任务ID（用于标识投递任务）
     * @return 验证码请求ID，如果失败返回null
     */
    public static String captureAndCreateVerificationRequest(Page page, String userId, String jobName, String taskId) {
        try {
            // 1. 截图验证码页面
            String timestamp = new java.text.SimpleDateFormat("yyyyMMdd_HHmmss").format(new java.util.Date());
            String screenshotPath = System.getProperty("java.io.tmpdir") +
                java.io.File.separator +
                "boss_captcha_" + userId.replaceAll("[^a-zA-Z0-9]", "_") + "_" + timestamp + ".png";

            log.info("📸 开始截图验证码页面: {}", screenshotPath);
            page.screenshot(new com.microsoft.playwright.Page.ScreenshotOptions()
                .setPath(java.nio.file.Paths.get(screenshotPath))
                .setFullPage(true));
            log.info("✅ 验证码截图已保存: {}", screenshotPath);

            // 2. 通过HTTP API创建验证码请求
            String requestId = createVerificationRequestViaAPI(userId, jobName, screenshotPath, taskId);

            if (requestId != null) {
                log.info("✅ 验证码请求已创建: requestId={}, userId={}, jobName={}", requestId, userId, jobName);
                return requestId;
            } else {
                log.error("❌ 创建验证码请求失败");
                return null;
            }
        } catch (Exception e) {
            log.error("截图并创建验证码请求失败", e);
            return null;
        }
    }

    /**
     * 通过HTTP API创建验证码请求
     */
    private static String createVerificationRequestViaAPI(String userId, String jobName, String screenshotPath, String taskId) {
        try {
            // 注意：Boss程序在独立进程中运行，不能直接调用Spring服务
            // 需要通过HTTP API与主进程通信
            // 但是，主进程的API需要认证，Boss程序无法提供JWT Token
            // 所以我们需要一个内部API端点，或者通过文件系统共享数据

            // 方案1：通过文件系统共享数据（更简单可靠）
            // 在Boss程序中写入验证码请求信息到文件
            // 主进程轮询文件系统，发现新请求后创建验证码请求

            // 方案2：创建一个内部API端点，不需要认证（仅限localhost访问）
            // 这个方案需要修改主进程的API

            // 暂时使用方案1：通过文件系统共享
            String requestFile = System.getProperty("java.io.tmpdir") +
                java.io.File.separator +
                "boss_verification_request_" + userId.replaceAll("[^a-zA-Z0-9]", "_") + "_" +
                System.currentTimeMillis() + ".json";

            JSONObject requestData = new JSONObject();
            requestData.put("userId", userId);
            requestData.put("jobName", jobName);
            requestData.put("screenshotPath", screenshotPath);
            requestData.put("taskId", taskId);
            requestData.put("timestamp", System.currentTimeMillis());

            java.nio.file.Files.write(
                java.nio.file.Paths.get(requestFile),
                requestData.toString().getBytes(StandardCharsets.UTF_8)
            );

            log.info("✅ 验证码请求信息已写入文件: {}", requestFile);

            // 返回文件路径作为requestId（主进程会读取并创建真正的requestId）
            return requestFile;
        } catch (Exception e) {
            log.error("创建验证码请求失败", e);
            return null;
        }
    }

    /**
     * 等待用户输入验证码
     * @param userId 用户ID
     * @param taskId 任务ID
     * @param timeoutSeconds 超时时间（秒）
     * @return 验证码，如果超时返回null
     */
    public static String waitForVerificationCode(String userId, String taskId, int timeoutSeconds) {
        log.info("⏳ 等待用户输入验证码: userId={}, taskId={}, timeout={}秒", userId, taskId, timeoutSeconds);

        long startTime = System.currentTimeMillis();
        long timeoutMillis = timeoutSeconds * 1000L;

        while (System.currentTimeMillis() - startTime < timeoutMillis) {
            try {
                // 检查验证码响应文件
                String responseFile = System.getProperty("java.io.tmpdir") +
                    java.io.File.separator +
                    "boss_verification_response_" + userId.replaceAll("[^a-zA-Z0-9]", "_") + "_" + taskId + ".json";

                java.io.File file = new java.io.File(responseFile);
                if (file.exists()) {
                    // 读取验证码
                    String content = new String(
                        java.nio.file.Files.readAllBytes(java.nio.file.Paths.get(responseFile)),
                        StandardCharsets.UTF_8
                    );
                    JSONObject responseData = new JSONObject(content);
                    String code = responseData.optString("code", null);

                    if (code != null && !code.isEmpty()) {
                        // 删除响应文件
                        file.delete();
                        log.info("✅ 获取到验证码: code={}", code);
                        return code;
                    }
                }

                // 等待1秒后重试
                Thread.sleep(1000);
            } catch (Exception e) {
                log.warn("等待验证码时出错: {}", e.getMessage());
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return null;
                }
            }
        }

        log.warn("⏰ 等待验证码超时: userId={}, taskId={}", userId, taskId);
        return null;
    }

    /**
     * 输入验证码到页面
     * @param page 页面对象
     * @param code 验证码
     * @return 是否成功
     */
    public static boolean inputVerificationCode(Page page, String code) {
        try {
            // 查找验证码输入框
            com.microsoft.playwright.Locator codeInput = page.locator(
                "input[name='phoneCode'], input[class*='ipt-sms'], input[placeholder*='验证码'], input[placeholder*='短信验证码']"
            );

            if (codeInput.count() > 0 && codeInput.first().isVisible()) {
                codeInput.first().fill(code);
                log.info("✅ 已输入验证码: {}", code);

                // 查找并点击提交按钮
                com.microsoft.playwright.Locator submitBtn = page.locator(
                    "button[type='submit'], button:has-text('提交'), button:has-text('确认'), button:has-text('验证')"
                );

                if (submitBtn.count() > 0 && submitBtn.first().isVisible()) {
                    submitBtn.first().click();
                    log.info("✅ 已点击提交按钮");

                    // 等待页面响应
                    Thread.sleep(2000);
                    return true;
                } else {
                    log.warn("⚠️ 未找到提交按钮，验证码已输入但未提交");
                    return true; // 验证码已输入，可能页面会自动提交
                }
            } else {
                log.error("❌ 未找到验证码输入框");
                return false;
            }
        } catch (Exception e) {
            log.error("输入验证码失败", e);
            return false;
        }
    }
}

