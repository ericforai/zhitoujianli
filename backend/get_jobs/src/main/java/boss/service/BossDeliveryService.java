package boss.service;

import java.io.File;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

import boss.BossConfig;
import boss.VerificationCodeHelper;
import boss.VerificationCodeRequiredException;
import lombok.SneakyThrows;
import utils.Job;
import utils.PlaywrightUtil;

/**
 * Boss投递服务
 * 负责处理简历投递的核心流程
 *
 * @author ZhiTouJianLi Team
 */
public class BossDeliveryService {
    private static final Logger log = LoggerFactory.getLogger(BossDeliveryService.class);

    private final BossConfig config;
    private final String userId;
    private final BossGreetingService greetingService;
    private final BossBlacklistService blacklistService;
    private final BossBehaviorLogger behaviorLogger;
    private final BossLoginService loginService;

    public BossDeliveryService(BossConfig config, String userId,
                                BossGreetingService greetingService,
                                BossBlacklistService blacklistService,
                                BossBehaviorLogger behaviorLogger,
                                BossLoginService loginService) {
        this.config = config;
        this.userId = userId;
        this.greetingService = greetingService;
        this.blacklistService = blacklistService;
        this.behaviorLogger = behaviorLogger;
        this.loginService = loginService;
    }

    /**
     * 简历投递主流程
     *
     * @param page 页面对象
     * @param keyword 搜索关键词
     * @param job 岗位信息
     * @return true=投递成功, false=投递失败
     */
    @SneakyThrows
    public boolean resumeSubmission(Page page, String keyword, Job job) {
        // ✅ 修复：在投递流程开始时再次检查黑名单（双重保险）
        String companyName = job.getCompanyName();
        if (blacklistService.isCompanyBlacklisted(companyName)) {
            log.warn("🚫 【黑名单拦截】公司【{}】在黑名单中，跳过投递并停止生成打招呼语。岗位：{}",
                companyName, job.getJobName());
            return false;
        }

        // 随机延迟，模拟人类思考时间
        PlaywrightUtil.randomSleepMillis(3000, 6000);

        // 1. 查找"查看更多信息"按钮（必须存在且新开页）
        Locator moreInfoBtn = page.locator("a.more-job-btn");
        if (moreInfoBtn.count() == 0) {
            log.warn("未找到\"查看更多信息\"按钮，跳过...");
            return false;
        }
        // 强制用js新开tab
        String href = moreInfoBtn.first().getAttribute("href");
        if (href == null || !href.startsWith("/job_detail/")) {
            log.warn("未获取到岗位详情链接，跳过...");
            return false;
        }
        String detailUrl = "https://www.zhipin.com" + href;

        // 2. 新开详情页，添加异常处理
        Page detailPage = null;
        String fullJobDescription = null; // 🔧 在方法开始处声明，确保作用域覆盖整个方法
        try {
            detailPage = page.context().newPage();

            // 使用标准导航方法，添加超时设置
            detailPage.navigate(detailUrl);

            // 导航后模拟人类行为
            PlaywrightUtil.randomSleepMillis(2000, 4000);
            PlaywrightUtil.simulateHumanBehavior();
        } catch (Exception e) {
            log.error("创建详情页失败：{}", e.getMessage());
            // 记录用户行为：投递失败
            Map<String, Object> extraData = new HashMap<>();
            extraData.put("jobName", job.getJobName());
            extraData.put("companyName", job.getCompanyName());
            extraData.put("reason", "创建详情页失败: " + e.getMessage());
            behaviorLogger.logBehavior("JOB_DELIVERY_FAILED", "FAILED",
                String.format("投递失败: %s - 创建详情页失败", job.getJobName()),
                extraData);
            if (detailPage != null) {
                try {
                    detailPage.close();
                } catch (Exception ex) {
                    // 忽略关闭异常 - 页面可能已经被关闭或出现其他非关键错误
                    log.debug("关闭详情页面时出现异常，已忽略: {}", ex.getMessage());
                }
            }
            return false;
        }

        // 3. 查找"立即沟通"按钮，增加异常处理
        try {
            Locator chatBtn = detailPage.locator("a.btn-startchat, a.op-btn-chat");
            boolean foundChatBtn = false;
            for (int i = 0; i < 5; i++) {
                if (chatBtn.count() > 0 && (chatBtn.first().textContent().contains("立即沟通"))) {
                    foundChatBtn = true;
                    break;
                }
                // 随机延迟等待按钮出现
                PlaywrightUtil.randomSleepMillis(1000, 2000);
            }
            if (!foundChatBtn) {
                log.warn("未找到立即沟通按钮，跳过岗位: {}", job.getJobName());
                // 记录用户行为：投递失败
                Map<String, Object> extraData = new HashMap<>();
                extraData.put("jobName", job.getJobName());
                extraData.put("companyName", job.getCompanyName());
                extraData.put("reason", "未找到立即沟通按钮");
                behaviorLogger.logBehavior("JOB_DELIVERY_FAILED", "FAILED",
                    String.format("投递失败: %s - 未找到立即沟通按钮", job.getJobName()),
                    extraData);
                detailPage.close();
                return false;
            }
            // 模拟人类行为后点击
            PlaywrightUtil.simulateMouseMove();

            // 🔧 关键修复：在点击"立即沟通"按钮之前先抓取JD
            // 因为点击按钮后页面会跳转到聊天页面，详情页内容将不可见
            log.info("【完整JD】在点击'立即沟通'按钮之前先抓取JD（避免页面跳转后内容不可见）");
            fullJobDescription = greetingService.extractFullJobDescription(detailPage);
            log.info("【完整JD】岗位: {}, JD长度: {}字", job.getJobName(), fullJobDescription != null ? fullJobDescription.length() : 0);

            // 使用安全点击方法，自动处理登录弹窗
            if (!safeClick(detailPage, chatBtn.first(), "点击立即沟通按钮")) {
                log.warn("点击立即沟通按钮失败，跳过岗位: {}", job.getJobName());
                // 记录用户行为：投递失败
                Map<String, Object> extraData = new HashMap<>();
                extraData.put("jobName", job.getJobName());
                extraData.put("companyName", job.getCompanyName());
                extraData.put("reason", "点击立即沟通按钮失败");
                behaviorLogger.logBehavior("JOB_DELIVERY_FAILED", "FAILED",
                    String.format("投递失败: %s - 点击立即沟通按钮失败", job.getJobName()),
                    extraData);
                detailPage.close();
                return false;
            }

            PlaywrightUtil.randomSleepMillis(2000, 4000);
        } catch (Exception e) {
            log.error("点击立即沟通按钮失败：{}", e.getMessage());
            try {
                detailPage.close();
            } catch (Exception ex) {
                // 忽略关闭异常 - 页面可能已经被关闭或出现其他非关键错误
                log.debug("关闭详情页面时出现异常，已忽略: {}", ex.getMessage());
            }
            return false;
        }

        // 5. 等待聊天对话框出现
        log.info("等待聊天对话框加载...");
        log.info("当前页面URL: {}", detailPage.url());
        boolean dialogReady = false;
        for (int i = 0; i < 30; i++) {  // 增加等待次数到30次
            // ✅ 新增：每5次循环输出一次进度日志
            if (i % 5 == 0 && i > 0) {
                log.info("等待聊天对话框加载中... (第{}/30次检查)", i);
            }

            // 检查多种可能的聊天对话框选择器
            String[] dialogSelectors = {
                ".dialog-container",
                ".chat-dialog",
                ".im-dialog",
                ".chat-container",
                ".message-container",
                ".conversation-container",
                "[class*='dialog']",
                "[class*='chat']",
                "[class*='message']",
                "[class*='conversation']",
                // Boss直聘特定的选择器
                ".dialog-wrap",
                ".chat-wrap",
                ".im-wrap",
                "#chat-input",
                ".chat-input-area",
                ".dialog-content",
                ".chat-content",
                // ✅ 新增：更多可能的Boss直聘选择器
                ".dialog-box",
                ".chat-box",
                ".im-box",
                ".message-box",
                "[id*='dialog']",
                "[id*='chat']",
                "[id*='message']",
                "[id*='im']",
                ".dialog-panel",
                ".chat-panel",
                ".message-panel",
                "[role='dialog']",
                "[role='textbox']",
                "div[contenteditable='true']",  // 直接查找可编辑的输入框
                "textarea.input-area",
                ".editor-container",
                ".input-container"
            };

            for (String selector : dialogSelectors) {
                try {
                    Locator dialog = detailPage.locator(selector);
                    if (dialog.count() > 0 && dialog.first().isVisible()) {
                        log.info("找到聊天对话框: {}", selector);
                        dialogReady = true;
                        break;
                    }
                } catch (Exception e) {
                    // 忽略单个选择器的错误
                    continue;
                }
            }

            if (dialogReady) break;

            // 检查是否页面跳转到了聊天页面
            String currentUrl = detailPage.url();
            if (currentUrl.contains("/chat/") || currentUrl.contains("/im/") || currentUrl.contains("/message/")) {
                log.info("页面已跳转到聊天页面: {}", currentUrl);
                dialogReady = true;
                break;
            }

            // 随机延迟等待对话框出现
            PlaywrightUtil.randomSleepMillis(1000, 2000);
        }

        if (!dialogReady) {
            log.warn("聊天对话框未出现（已检查30次，约60秒），尝试备用方案: {}", job.getJobName());

            // ✅ 新增：调试信息 - 输出页面结构用于诊断
            try {
                String pageStructure = detailPage.evaluate("""
                    () => {
                        const result = {
                            url: window.location.href,
                            title: document.title,
                            bodyClasses: document.body.className,
                            visibleDialogs: [],
                            visibleInputs: [],
                            allDialogs: []
                        };

                        // 查找所有可能的对话框
                        const dialogSelectors = [
                            '.dialog-container', '.chat-dialog', '.im-dialog',
                            '.chat-container', '.message-container', '[class*="dialog"]',
                            '[class*="chat"]', '[class*="message"]', '.dialog-wrap',
                            '.chat-wrap', '.im-wrap', '#chat-input', '.chat-input-area'
                        ];

                        dialogSelectors.forEach(selector => {
                            try {
                                const elements = document.querySelectorAll(selector);
                                elements.forEach(el => {
                                    if (el.offsetParent !== null) {
                                        result.visibleDialogs.push({
                                            selector: selector,
                                            className: el.className,
                                            id: el.id,
                                            visible: true
                                        });
                                    }
                                    result.allDialogs.push({
                                        selector: selector,
                                        className: el.className,
                                        id: el.id
                                    });
                                });
                            } catch (e) {}
                        });

                        // 查找所有可能的输入框
                        const inputSelectors = [
                            '[contenteditable="true"]', 'textarea', 'input[type="text"]',
                            '.dialog-input', '.chat-input', '.input-area'
                        ];

                        inputSelectors.forEach(selector => {
                            try {
                                const elements = document.querySelectorAll(selector);
                                elements.forEach(el => {
                                    if (el.offsetParent !== null) {
                                        result.visibleInputs.push({
                                            selector: selector,
                                            className: el.className,
                                            id: el.id,
                                            placeholder: el.placeholder || '',
                                            visible: true
                                        });
                                    }
                                });
                            } catch (e) {}
                        });

                        return JSON.stringify(result, null, 2);
                    }
                """).toString();
                log.info("📋 页面结构诊断信息: {}", pageStructure);
            } catch (Exception e) {
                log.warn("获取页面结构信息失败: {}", e.getMessage());
            }

            // ✅ 新增：在尝试备用方案前先截图
            captureDebugScreenshot(detailPage, job);

            // 尝试备用方案：使用JavaScript直接发送消息
            // ✅ 修复：tryAlternativeMessageSending() 内部已经调用了 verifyMessageSent() 进行验证
            // 如果返回 true，说明已经验证成功，直接信任结果，不再进行二次验证
            boolean alternativeSuccess = tryAlternativeMessageSending(detailPage, job, keyword);
            if (alternativeSuccess) {
                // ✅ 修复：备用方案内部已经验证过，直接信任结果
                log.info("✅ 备用方案执行并验证成功，投递完成: {}", job.getJobName());
                detailPage.close();
                return true;
            } else {
                log.warn("❌ 备用方案执行失败: {}", job.getJobName());
                // ✅ 新增：验证失败时再次截图
                captureDebugScreenshot(detailPage, job);
                detailPage.close();
                return false;
            }
        }

        // 6. 等待聊天输入框（更新选择器）
        log.info("等待聊天输入框加载...");

        // 优先策略: 在已找到的对话框容器内查找输入框
        String[] dialogInputSelectors = {
            ".dialog-container [contenteditable='true']",
            ".dialog-container [contenteditable]",
            ".dialog-container .editor",
            ".dialog-container .editor-content",
            ".dialog-container .input-area",
            ".dialog-container .message-input",
            ".dialog-container .chat-input",
            ".dialog-container textarea",
            ".dialog-container input[type='text']",
            ".dialog-container div[role='textbox']",
            ".dialog-container .dialog-input",
            ".dialog-container .chat-textarea",
            ".dialog-container .im-input",
            ".dialog-container .msg-input"
        };

        // 全局选择器（备用策略）- 更新为最新的Boss直聘选择器
        String[] inputSelectors = {
            // Boss直聘最新选择器（优先级最高）- 2024年10月更新
            "div.dialog-input[contenteditable='true']",
            "div[contenteditable='true'][role='textbox']",
            "div.dialog-input",
            "div[data-testid='chat-input']",
            "div[class*='dialog-input']",
            "div[class*='chat-input']",

            // 通用选择器
            "div#chat-input.chat-input[contenteditable='true']",
            "textarea.input-area",
            "div[contenteditable='true']",
            "[class*='input'][contenteditable='true']",
            "textarea[placeholder*='输入']",
            "input[placeholder*='输入']",
            ".chat-input",
            ".input-area",
            ".message-input",
            ".conversation-input",
            "[class*='chat-input']",
            "[class*='input-area']",
            "[class*='message-input']",
            "[class*='conversation-input']",

            // Boss直聘特定的选择器
            ".dialog-input",
            ".chat-textarea",
            ".im-input",
            ".msg-input",
            "#message-input",
            "#chat-textarea",

            // 更宽松的选择器
            "input[type='text']",
            "input[type='textarea']",
            "textarea",
            "[contenteditable='true']",
            "[contenteditable]",
            "[class*='input']",
            "[class*='chat']",
            "[class*='message']",
            "[class*='text']"
        };

        Locator inputLocator = null;
        boolean inputReady = false;

        for (int i = 0; i < 20; i++) {  // 优化：减少到20次，总时长约30秒
            // 🔍 验证码检测：在每次循环开始时检查是否存在验证码
            try {
                // 检测验证码输入框
                Locator smsCodeInput = detailPage.locator("input[name='phoneCode'], input[class*='ipt-sms'], input[placeholder*='验证码'], input[placeholder*='短信验证码']");
                if (smsCodeInput.count() > 0 && smsCodeInput.first().isVisible()) {
                    log.error("❌ 检测到验证码验证！Boss直聘要求人工验证。岗位: {}", job.getJobName());
                    log.info("📸 开始处理验证码：截图并等待用户输入...");

                    // ✅ 生成任务ID（使用时间戳+岗位名称）
                    String taskId = "task_" + System.currentTimeMillis() + "_" +
                        job.getJobName().replaceAll("[^a-zA-Z0-9]", "_");

                    // ✅ 截图并创建验证码请求
                    String requestFile = VerificationCodeHelper.captureAndCreateVerificationRequest(
                        detailPage, userId, job.getJobName(), taskId);

                    if (requestFile != null) {
                        // ✅ 输出特殊标记，让BossExecutionService检测到
                        System.out.println("🔐 VERIFICATION_CODE_REQUIRED: " + requestFile);
                        System.out.flush();

                        // ✅ 发送通知给用户
                        behaviorLogger.sendVerificationCodeNotification(job.getJobName());

                        // ✅ 等待用户输入验证码（最多5分钟）
                        log.info("⏳ 等待用户输入验证码，最多等待5分钟...");
                        String verificationCode = VerificationCodeHelper.waitForVerificationCode(
                            userId, taskId, 300); // 5分钟超时

                        if (verificationCode != null && !verificationCode.isEmpty()) {
                            log.info("✅ 获取到验证码，开始输入...");

                            // ✅ 输入验证码
                            boolean inputSuccess = VerificationCodeHelper.inputVerificationCode(
                                detailPage, verificationCode);

                            if (inputSuccess) {
                                log.info("✅ 验证码已输入，等待验证结果...");
                                // 等待页面响应（验证成功或失败）
                                Thread.sleep(3000);

                                // 检查是否验证成功（页面是否跳转或验证码输入框消失）
                                Locator codeInputAfter = detailPage.locator(
                                    "input[name='phoneCode'], input[class*='ipt-sms'], input[placeholder*='验证码']");
                                if (codeInputAfter.count() == 0 || !codeInputAfter.first().isVisible()) {
                                    log.info("✅ 验证码验证成功，继续投递流程");
                                    // 验证成功，继续投递流程
                                    break; // 跳出验证码检测循环，继续查找输入框
                                } else {
                                    log.error("❌ 验证码验证失败，验证码输入框仍然存在");
                                    detailPage.close();
                                    throw new VerificationCodeRequiredException(
                                        job.getJobName(), "验证码验证失败");
                                }
                            } else {
                                log.error("❌ 输入验证码失败");
                                detailPage.close();
                                throw new VerificationCodeRequiredException(
                                    job.getJobName(), "输入验证码失败");
                            }
                        } else {
                            log.error("❌ 等待验证码超时，停止投递");
                            detailPage.close();
                            throw new VerificationCodeRequiredException(
                                job.getJobName(), "等待验证码超时");
                        }
                    } else {
                        log.error("❌ 创建验证码请求失败");
                        detailPage.close();
                        throw new VerificationCodeRequiredException(
                            job.getJobName(), "创建验证码请求失败");
                    }
                }

                // 检测页面标题或URL是否包含验证相关关键词
                String pageTitle = detailPage.title();
                String currentUrl = detailPage.url();
                if ((pageTitle != null && (pageTitle.contains("验证") || pageTitle.contains("安全"))) ||
                    (currentUrl != null && (currentUrl.contains("verify") || currentUrl.contains("captcha") || currentUrl.contains("security")))) {
                    log.error("❌ 页面跳转到验证页面！URL: {}, 标题: {}, 岗位: {}", currentUrl, pageTitle, job.getJobName());
                    log.info("📸 开始处理验证码：截图并等待用户输入...");

                    // ✅ 生成任务ID
                    String taskId = "task_" + System.currentTimeMillis() + "_" +
                        job.getJobName().replaceAll("[^a-zA-Z0-9]", "_");

                    // ✅ 截图并创建验证码请求
                    String requestFile = VerificationCodeHelper.captureAndCreateVerificationRequest(
                        detailPage, userId, job.getJobName(), taskId);

                    if (requestFile != null) {
                        // ✅ 输出特殊标记
                        System.out.println("🔐 VERIFICATION_CODE_REQUIRED: " + requestFile);
                        System.out.flush();

                        // ✅ 发送通知给用户
                        behaviorLogger.sendVerificationCodeNotification(job.getJobName());

                        // ✅ 等待用户输入验证码（最多5分钟）
                        log.info("⏳ 等待用户输入验证码，最多等待5分钟...");
                        String verificationCode = VerificationCodeHelper.waitForVerificationCode(
                            userId, taskId, 300);

                        if (verificationCode != null && !verificationCode.isEmpty()) {
                            log.info("✅ 获取到验证码，开始输入...");
                            boolean inputSuccess = VerificationCodeHelper.inputVerificationCode(
                                detailPage, verificationCode);

                            if (inputSuccess) {
                                log.info("✅ 验证码已输入，等待验证结果...");
                                Thread.sleep(3000);
                                // 继续投递流程
                                break;
                            } else {
                                log.error("❌ 输入验证码失败");
                                detailPage.close();
                                throw new VerificationCodeRequiredException(
                                    job.getJobName(), "输入验证码失败");
                            }
                        } else {
                            log.error("❌ 等待验证码超时");
                            detailPage.close();
                            throw new VerificationCodeRequiredException(
                                job.getJobName(), "等待验证码超时");
                        }
                    } else {
                        log.error("❌ 创建验证码请求失败");
                        detailPage.close();
                        throw new VerificationCodeRequiredException(
                            job.getJobName(), "创建验证码请求失败");
                    }
                }
            } catch (VerificationCodeRequiredException e) {
                // ✅ 重新抛出验证码异常，让上层处理
                throw e;
            } catch (Exception e) {
                // 验证码检测失败不影响后续流程（其他异常忽略）
                log.debug("验证码检测异常（可忽略）: {}", e.getMessage());
            }

            // 第一阶段: 在对话框容器内查找（优先策略）
            for (String selector : dialogInputSelectors) {
                Locator testLocator = detailPage.locator(selector);
                if (testLocator.count() > 0) {
                    // 检查每个匹配的元素
                    for (int j = 0; j < testLocator.count(); j++) {
                        try {
                            if (testLocator.nth(j).isVisible() && testLocator.nth(j).isEnabled()) {
                                // 进一步检查是否是可编辑的输入框
                                String elementType = testLocator.nth(j).evaluate("el => el.tagName.toLowerCase()").toString();
                                String contentEditable = testLocator.nth(j).evaluate("el => el.contentEditable").toString();
                                String inputType = testLocator.nth(j).evaluate("el => el.type || ''").toString();

                                // 检查是否是搜索框（排除）
                                String className = testLocator.nth(j).evaluate("el => el.className || ''").toString();
                                String name = testLocator.nth(j).evaluate("el => el.name || ''").toString();
                                String placeholder = testLocator.nth(j).evaluate("el => el.placeholder || ''").toString();

                                // 排除搜索框、验证码框和其他非聊天输入框
                                if (className.contains("ipt-search") || className.contains("search") ||
                                    className.contains("ipt-sms") ||  // 短信验证码框
                                    name.equals("query") || name.equals("phoneCode") ||  // query是搜索框，phoneCode是验证码框
                                    placeholder.contains("搜索") || placeholder.contains("验证码")) {
                                    log.debug("跳过非聊天输入框: {}, class={}, name={}, placeholder={}",
                                        selector, className, name, placeholder);
                                    continue;
                                }

                                // 如果是input、textarea或contenteditable元素，认为是输入框
                                if ("input".equals(elementType) || "textarea".equals(elementType) ||
                                    "true".equals(contentEditable) || !inputType.isEmpty()) {
                                    log.info("✅ 在对话框容器内找到聊天输入框: {} (第{}个元素, 类型: {}, 可编辑: {}, class: {})",
                                        selector, j, elementType, contentEditable, className);
                                    inputLocator = testLocator.nth(j);
                                    inputReady = true;
                                    break;
                                }
                            }
                        } catch (Exception e) {
                            // 忽略单个元素的检查错误
                            continue;
                        }
                    }
                    if (inputReady) break;
                }
            }

            if (inputReady) break;

            // 第二阶段: 使用全局选择器（备用策略）
            if (i > 5) {  // 5秒后尝试全局查找
                log.debug("对话框内未找到输入框，尝试全局查找...");
                for (String selector : inputSelectors) {
                    Locator testLocator = detailPage.locator(selector);
                    if (testLocator.count() > 0) {
                        // 检查每个匹配的元素
                        for (int j = 0; j < testLocator.count(); j++) {
                            try {
                                if (testLocator.nth(j).isVisible() && testLocator.nth(j).isEnabled()) {
                                    // 进一步检查是否是可编辑的输入框
                                    String elementType = testLocator.nth(j).evaluate("el => el.tagName.toLowerCase()").toString();
                                    String contentEditable = testLocator.nth(j).evaluate("el => el.contentEditable").toString();
                                    String inputType = testLocator.nth(j).evaluate("el => el.type || ''").toString();

                                    // 检查是否是搜索框（排除）
                                    String className = testLocator.nth(j).evaluate("el => el.className || ''").toString();
                                    String name = testLocator.nth(j).evaluate("el => el.name || ''").toString();
                                    String placeholder = testLocator.nth(j).evaluate("el => el.placeholder || ''").toString();

                                    // 排除搜索框、验证码框和其他非聊天输入框
                                    if (className.contains("ipt-search") || className.contains("search") ||
                                        className.contains("ipt-sms") ||  // 短信验证码框
                                        name.equals("query") || name.equals("phoneCode") ||  // query是搜索框，phoneCode是验证码框
                                        placeholder.contains("搜索") || placeholder.contains("验证码")) {
                                        log.debug("跳过非聊天输入框: {}, class={}, name={}, placeholder={}",
                                            selector, className, name, placeholder);
                                        continue;
                                    }

                                    // 如果是input、textarea或contenteditable元素，认为是输入框
                                    if ("input".equals(elementType) || "textarea".equals(elementType) ||
                                        "true".equals(contentEditable) || !inputType.isEmpty()) {
                                        log.info("✅ 全局查找找到聊天输入框: {} (第{}个元素, 类型: {}, 可编辑: {}, class: {})",
                                            selector, j, elementType, contentEditable, className);
                                        inputLocator = testLocator.nth(j);
                                        inputReady = true;
                                        break;
                                    }
                                }
                            } catch (Exception e) {
                                // 忽略单个元素的检查错误
                                continue;
                            }
                        }
                        if (inputReady) break;
                    }
                }
            }

            if (inputReady) break;

            // 优化延迟策略：前5次快速检查，后续正常延迟
            if (i < 5) {
                PlaywrightUtil.randomSleepMillis(500, 1000);  // 前5次快速检查
            } else {
                PlaywrightUtil.randomSleepMillis(1000, 1500);  // 后15次正常延迟
            }
        }

        if (!inputReady) {
            log.warn("聊天输入框未出现，尝试备用方案: {}", job.getJobName());

            // 调试信息：输出当前页面的HTML结构
            try {
                String pageTitle = detailPage.title();
                String currentUrl = detailPage.url();
                log.warn("调试信息 - 页面标题: {}, URL: {}", pageTitle, currentUrl);

                // 🔍 增强调试：输出对话框内部的所有可能元素
                Locator dialogContainer = detailPage.locator(".dialog-container");
                if (dialogContainer.count() > 0) {
                    log.warn("🔍 对话框容器存在，查找内部元素:");

                    String[] dialogDebugSelectors = {
                        ".dialog-container [contenteditable]",
                        ".dialog-container textarea",
                        ".dialog-container input",
                        ".dialog-container [role='textbox']",
                        ".dialog-container .editor",
                        ".dialog-container .editor-content",
                        ".dialog-container .input-area",
                        ".dialog-container .message-input",
                        ".dialog-container .chat-input",
                        ".dialog-container .dialog-input",
                        ".dialog-container .chat-textarea",
                        ".dialog-container .im-input",
                        ".dialog-container .msg-input"
                    };

                    for (String selector : dialogDebugSelectors) {
                        int count = detailPage.locator(selector).count();
                        if (count > 0) {
                            log.warn("  🔍 找到 {} 个元素: {}", count, selector);
                            // 输出第一个元素的详细信息
                            try {
                                Locator first = detailPage.locator(selector).first();
                                String outerHTML = (String) first.evaluate("el => el.outerHTML");
                                String tagName = (String) first.evaluate("el => el.tagName");
                                String className = (String) first.evaluate("el => el.className || ''");
                                String id = (String) first.evaluate("el => el.id || ''");
                                boolean visible = first.isVisible();
                                log.warn("    📋 第一个元素: {} class='{}' id='{}' visible={}", tagName, className, id, visible);
                                log.warn("    📄 HTML片段: {}", outerHTML.substring(0, Math.min(200, outerHTML.length())));
                            } catch (Exception e) {
                                log.warn("    ❌ 获取元素详情失败: {}", e.getMessage());
                            }
                        }
                    }
                } else {
                    log.warn("❌ 对话框容器(.dialog-container)不存在");
                }

                // 输出页面中所有可能的输入相关元素
                String[] debugSelectors = {
                    "input", "textarea", "[contenteditable]",
                    "[class*='input']", "[class*='chat']", "[class*='dialog']",
                    "[id*='input']", "[id*='chat']", "[id*='dialog']"
                };

                for (String selector : debugSelectors) {
                    Locator elements = detailPage.locator(selector);
                    if (elements.count() > 0) {
                        log.warn("调试信息 - 找到{}个元素: {}", elements.count(), selector);
                    }
                }

                // 截图诊断当前页面状态
                captureDebugScreenshot(detailPage, job);

                // 增强调试信息：输出所有input元素的详细属性
                log.warn("调试：列出所有input元素属性");
                Locator allInputs = detailPage.locator("input, textarea, [contenteditable]");
                for (int idx = 0; idx < Math.min(allInputs.count(), 10); idx++) {
                    try {
                        Locator element = allInputs.nth(idx);
                        String tagName = (String) element.evaluate("el => el.tagName");
                        String className = (String) element.evaluate("el => el.className || ''");
                        String id = (String) element.evaluate("el => el.id || ''");
                        boolean visible = element.isVisible();
                        log.warn("  [{}] {} class='{}' id='{}' visible={}", idx, tagName, className, id, visible);
                    } catch (Exception e) {
                        // 忽略单个元素错误 - 元素可能不存在或无法访问
                        log.debug("获取元素信息时出现异常，已忽略: {}", e.getMessage());
                    }
                }

                // 尝试备用方案：使用JavaScript直接发送消息
                if (tryAlternativeMessageSending(detailPage, job, keyword)) {
                    log.info("✅ 备用方案成功，投递完成: {}", job.getJobName());
                    detailPage.close();
                    return true;
                }

            } catch (Exception e) {
                log.warn("获取调试信息失败: {}", e.getMessage());
            }

            log.warn("所有方案都失败，跳过: {}", job.getJobName());
            detailPage.close();
            return false;
        }

        // 7. 生成打招呼语（智能AI生成 或 默认）
        String message = greetingService.generateGreetingMessage(keyword, job, fullJobDescription);
        if (message == null || message.trim().isEmpty()) {
            log.warn("打招呼语为空，跳过: {}", job.getJobName());
            detailPage.close();
            return false;
        }

        // 7. 输入打招呼语
        Locator input = inputLocator.first();

        // 模拟人类行为：先点击获得焦点
        PlaywrightUtil.simulateMouseMove();
        input.click();

        // 随机延迟，模拟人类思考时间
        PlaywrightUtil.randomSleepMillis(1000, 3000);

        // 使用已经找到的input元素进行输入，而不是重新查找
        try {
            // 先聚焦到元素
            input.focus();
            PlaywrightUtil.randomSleepMillis(500, 1000);

            // 清空现有内容
            input.clear();
            PlaywrightUtil.randomSleepMillis(200, 500);

            // 直接输入文本
            input.fill(message);
            log.info("已成功输入打招呼语: {}", message);
        } catch (Exception e) {
            log.error("输入打招呼语失败: {}", e.getMessage());
            // 备用方案：使用人类化输入
            try {
                if (input.evaluate("el => el.tagName.toLowerCase()") instanceof String tag && tag.equals("textarea")) {
                    PlaywrightUtil.typeHumanLike("textarea.input-area", message, 100, 300);
                } else {
                    PlaywrightUtil.typeHumanLike("div#chat-input.chat-input", message, 100, 300);
                }
            } catch (Exception e2) {
                log.error("备用输入方法也失败: {}", e2.getMessage());
                // 如果输入失败，关闭页面并返回
                try {
                    detailPage.close();
                } catch (Exception ex) {
                    // 忽略关闭异常 - 页面可能已经被关闭或出现其他非关键错误
                    log.debug("关闭详情页面时出现异常，已忽略: {}", ex.getMessage());
                }
                return false;
            }
        }

        // 7. 发送图片简历（可选）
        boolean imgResume = false;
        if (config.getSendImgResume() != null && config.getSendImgResume()) {
            try {
                URL resourceUrl = BossDeliveryService.class.getResource("/resume.jpg");
                if (resourceUrl != null) {
                    File imageFile = new File(resourceUrl.toURI());
                    Locator fileInput = detailPage.locator("//div[@aria-label='发送图片']//input[@type='file']");
                    if (fileInput.count() > 0) {
                        fileInput.setInputFiles(imageFile.toPath());
                        imgResume = true;
                    }
                }
            } catch (Exception e) {
                log.error("发送图片简历失败: {}", e.getMessage());
            }
        }

        // 8. 点击发送按钮（div.send-message 或 button.btn-send）
        Locator sendBtn = detailPage.locator("div.send-message, button[type='send'].btn-send, button.btn-send");
        boolean sendSuccess = false;
        if (sendBtn.count() > 0) {
            // 模拟人类行为后发送
            PlaywrightUtil.simulateMouseMove();
            sendBtn.first().click();

            // 发送后随机延迟，等待消息发送完成
            PlaywrightUtil.randomSleepMillis(2000, 4000);

            // ✅ 修复：验证消息是否真正发送成功（在关闭页面之前验证）
            log.info("🔍 开始验证消息是否真正发送成功: {}", job.getJobName());
            boolean messageVerified = verifyMessageSent(detailPage);

            if (messageVerified) {
                log.info("✅ 消息验证成功，投递真正完成: {}", job.getJobName());
                sendSuccess = true;
            } else {
                log.warn("❌ 消息验证失败，投递可能未成功: {}", job.getJobName());
                sendSuccess = false;
            }
        } else {
            log.warn("未找到发送按钮，自动跳过！岗位：{}", job.getJobName());
        }

        // ✅ 修复：只有在验证成功时才记录"投递完成"
        if (sendSuccess) {
            log.info("投递完成 | 岗位：{} | 招呼语：{} | 图片简历：{}", job.getJobName(), message, imgResume ? "已发送" : "未发送");
        } else {
            log.warn("投递失败 | 岗位：{} | 原因：消息验证失败或未找到发送按钮", job.getJobName());
        }

        // 9. 关闭详情页，回到主页面，增加异常处理
        try {
            detailPage.close();

            // 关闭后随机延迟，模拟人类操作间隔
            PlaywrightUtil.randomSleepMillis(3000, 6000);

            // 10. 成功投递加入结果
            // ✅ 修复：只有在真正验证成功时才返回true
            if (sendSuccess) {
                // 记录用户行为：投递成功
                Map<String, Object> extraData = new HashMap<>();
                extraData.put("jobName", job.getJobName());
                extraData.put("companyName", job.getCompanyName());
                extraData.put("hasGreeting", message != null && !message.isEmpty());
                extraData.put("hasResume", imgResume);
                behaviorLogger.logBehavior("JOB_DELIVERY_SUCCESS", "SUCCESS",
                    String.format("投递成功: %s - %s", job.getCompanyName(), job.getJobName()),
                    extraData);
                return true; // ✅ 投递成功，返回true
            } else {
                // 记录用户行为：投递失败
                Map<String, Object> extraData = new HashMap<>();
                extraData.put("jobName", job.getJobName());
                extraData.put("companyName", job.getCompanyName());
                extraData.put("reason", sendBtn.count() == 0 ? "未找到发送按钮" : "消息验证失败");
                behaviorLogger.logBehavior("JOB_DELIVERY_FAILED", "FAILED",
                    String.format("投递失败: %s - %s", job.getJobName(),
                        sendBtn.count() == 0 ? "未找到发送按钮" : "消息验证失败"),
                    extraData);
                return false; // ✅ 投递失败，返回false
            }
        } catch (Exception e) {
            log.error("关闭详情页异常：{}", e.getMessage());
            return false; // ✅ 异常情况，返回false
        }
    }

    /**
     * 尝试备用方案发送消息
     *
     * @param page 页面对象
     * @param job 岗位信息
     * @param keyword 搜索关键词
     * @return 是否发送成功
     */
    public boolean tryAlternativeMessageSending(Page page, Job job, String keyword) {
        try {
            log.info("尝试备用方案发送消息: {}", job.getJobName());

            // 获取打招呼语
            String fullJobDescription = greetingService.extractFullJobDescription(page);
            String message = greetingService.generateGreetingMessage(keyword, job, fullJobDescription);

            if (message == null || message.trim().isEmpty()) {
                log.warn("备用方案：打招呼语为空");
                return false;
            }

            // 转义消息内容，防止JavaScript语法错误
            String escapedMessage = message.replace("\\", "\\\\")
                                          .replace("\"", "\\\"")
                                          .replace("\n", "\\n")
                                          .replace("\r", "\\r")
                                          .replace("\t", "\\t");

            // 尝试使用JavaScript直接操作页面
            String script = String.format("""
                (function() {
                    const debugLog = [];
                    const log = (msg) => {
                        debugLog.push(msg);
                        console.log('[备用方案] ' + msg);
                    };

                    try {
                        log('开始执行备用方案...');
                        log('当前URL: ' + window.location.href);
                        log('页面标题: ' + document.title);

                        // 查找所有可能的输入元素 - 2024年10月更新
                        const inputSelectors = [
                            'div.dialog-input[contenteditable="true"]',
                            'div[contenteditable="true"][role="textbox"]',
                            'div.dialog-input',
                            'div[data-testid="chat-input"]',
                            'div[class*="dialog-input"]',
                            'div[class*="chat-input"]',
                            'div#chat-input.chat-input[contenteditable="true"]',
                            'textarea.input-area',
                            'div[contenteditable="true"]',
                            '[class*="input"][contenteditable="true"]',
                            'textarea[placeholder*="输入"]',
                            'input[placeholder*="输入"]',
                            '.chat-input',
                            '.input-area',
                            '.message-input',
                            '[class*="chat-input"]',
                            '[class*="input-area"]',
                            'input[type="text"]',
                            'textarea',
                            '[contenteditable="true"]',
                            '[contenteditable]'
                        ];

                        log('尝试查找输入框，共' + inputSelectors.length + '个选择器...');

                        let inputElement = null;
                        let foundSelector = null;

                        // 尝试找到输入框
                        for (const selector of inputSelectors) {
                            try {
                                const elements = document.querySelectorAll(selector);
                                log('选择器 "' + selector + '" 找到 ' + elements.length + ' 个元素');

                                for (let i = 0; i < elements.length; i++) {
                                    const el = elements[i];
                                    const isVisible = el.offsetParent !== null;
                                    const className = el.className || '';
                                    const id = el.id || '';
                                    const placeholder = el.placeholder || '';

                                    log('  元素[' + i + ']: visible=' + isVisible + ', class=' + className.substring(0, 50) + ', id=' + id + ', placeholder=' + placeholder);

                                    // 排除搜索框、验证码框等非聊天输入框
                                    if (className.includes('ipt-search') || className.includes('search') ||
                                        className.includes('ipt-sms') || placeholder.includes('搜索') ||
                                        placeholder.includes('验证码')) {
                                        log('  跳过非聊天输入框');
                                        continue;
                                    }

                                    if (isVisible) {
                                        inputElement = el;
                                        foundSelector = selector;
                                        log('✅ 找到输入框: ' + selector);
                                        break;
                                    }
                                }
                                if (inputElement) break;
                            } catch (e) {
                                log('选择器 "' + selector + '" 执行失败: ' + e.message);
                            }
                        }

                        if (!inputElement) {
                            log('❌ 未找到输入框');
                            return {success: false, message: '未找到输入框', debugLog: debugLog};
                        }

                        // 清空输入框并输入消息
                        log('开始输入消息...');
                        inputElement.focus();
                        log('输入框已聚焦');

                        // 清空输入框
                        if (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT') {
                            inputElement.value = '';
                        } else {
                            inputElement.textContent = '';
                            inputElement.innerText = '';
                        }
                        log('输入框已清空');

                        // 输入消息
                        const message = "%s";
                        if (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT') {
                            inputElement.value = message;
                        } else {
                            inputElement.textContent = message;
                            inputElement.innerText = message;
                        }
                        log('消息已输入，长度: ' + message.length);

                        // 触发输入事件
                        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
                        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
                        const keydownEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13 });
                        const keyupEvent = new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13 });

                        inputElement.dispatchEvent(inputEvent);
                        inputElement.dispatchEvent(changeEvent);
                        log('已触发input和change事件');

                        // 等待一下，让输入框内容更新（同步等待）
                        const startTime = Date.now();
                        while (Date.now() - startTime < 500) {
                            // 同步等待500ms
                        }

                        // 验证输入框内容
                        const currentValue = inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT'
                            ? inputElement.value
                            : (inputElement.textContent || inputElement.innerText);
                        log('输入框当前内容长度: ' + (currentValue ? currentValue.length : 0));

                        if (!currentValue || currentValue.trim().length === 0) {
                            log('⚠️ 警告：输入框内容为空，可能输入失败');
                        }

                        // 尝试找到发送按钮并点击
                        log('开始查找发送按钮...');
                        const sendSelectors = [
                            'button[type="submit"]',
                            'button[type="send"]',
                            '.send-btn',
                            '.submit-btn',
                            '[class*="send"]',
                            '[class*="submit"]',
                            'button:has-text("发送")',
                            '[aria-label*="发送"]',
                            '[title*="发送"]'
                        ];

                        let sendButton = null;
                        let foundButtonSelector = null;
                        for (const selector of sendSelectors) {
                            try {
                                const buttons = document.querySelectorAll(selector);
                                log('选择器 "' + selector + '" 找到 ' + buttons.length + ' 个按钮');

                                for (let i = 0; i < buttons.length; i++) {
                                    const btn = buttons[i];
                                    const isVisible = btn.offsetParent !== null;
                                    const isDisabled = btn.disabled === true;
                                    const btnText = (btn.textContent || btn.innerText || '').trim();

                                    log('  按钮[' + i + ']: visible=' + isVisible + ', disabled=' + isDisabled + ', text=' + btnText);

                                    if (isVisible && !isDisabled) {
                                        if (btnText.includes('发送') || btnText.includes('提交') || btnText.includes('确定') ||
                                            selector.includes('send') || selector.includes('submit')) {
                                            sendButton = btn;
                                            foundButtonSelector = selector;
                                            log('✅ 找到发送按钮: ' + selector + ', 文本: ' + btnText);
                                            break;
                                        }
                                    }
                                }
                                if (sendButton) break;
                            } catch (e) {
                                log('选择器 "' + selector + '" 执行失败: ' + e.message);
                            }
                        }

                        if (sendButton) {
                            log('点击发送按钮...');
                            sendButton.click();
                            log('✅ 点击发送按钮成功');
                            return {success: true, message: '点击发送按钮成功', debugLog: debugLog};
                        } else {
                            log('未找到发送按钮，尝试按回车键发送...');
                            // 尝试按回车键发送
                            const keydownEvent = new KeyboardEvent('keydown', {
                                key: 'Enter',
                                code: 'Enter',
                                keyCode: 13,
                                bubbles: true,
                                cancelable: true
                            });
                            const keyupEvent = new KeyboardEvent('keyup', {
                                key: 'Enter',
                                code: 'Enter',
                                keyCode: 13,
                                bubbles: true,
                                cancelable: true
                            });
                            inputElement.dispatchEvent(keydownEvent);
                            inputElement.dispatchEvent(keyupEvent);
                            log('✅ 已触发回车键事件');
                            return {success: true, message: '尝试回车键发送', debugLog: debugLog};
                        }
                    } catch (error) {
                        log('❌ 备用方案执行错误: ' + error.message);
                        log('错误堆栈: ' + (error.stack || '无'));
                        return {success: false, message: error.message, debugLog: debugLog, error: error.toString()};
                    }
                })()
                """, escapedMessage, escapedMessage);

            // 执行JavaScript
            Object result = page.evaluate(script);
            log.info("备用方案执行结果: {}", result);

            // ✅ 新增：输出JavaScript的详细调试日志
            if (result instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> resultMap = (Map<String, Object>) result;
                if (resultMap.containsKey("debugLog")) {
                    @SuppressWarnings("unchecked")
                    java.util.List<String> debugLog = (java.util.List<String>) resultMap.get("debugLog");
                    if (debugLog != null && !debugLog.isEmpty()) {
                        log.info("📋 备用方案调试日志:");
                        for (String logMsg : debugLog) {
                            log.info("  {}", logMsg);
                        }
                    }
                }
            }

            // ✅ 新增：输出JavaScript执行后的页面状态
            try {
                String afterScriptState = page.evaluate("""
                    () => {
                        const result = {
                            foundInput: false,
                            inputValue: '',
                            foundButton: false,
                            buttonText: '',
                            pageUrl: window.location.href
                        };

                        // 检查输入框状态
                        const inputs = document.querySelectorAll(
                            '[contenteditable="true"], textarea, input[type="text"], .dialog-input'
                        );
                        for (const input of inputs) {
                            if (input.offsetParent !== null) {
                                result.foundInput = true;
                                result.inputValue = (input.textContent || input.value || '').substring(0, 100);
                                break;
                            }
                        }

                        // 检查发送按钮状态
                        const buttons = document.querySelectorAll('button, [role="button"]');
                        for (const btn of buttons) {
                            const text = (btn.textContent || '').trim();
                            if ((text.includes('发送') || text.includes('提交')) && btn.offsetParent !== null) {
                                result.foundButton = true;
                                result.buttonText = text;
                                break;
                            }
                        }

                        return JSON.stringify(result, null, 2);
                    }
                """).toString();
                log.info("📋 备用方案执行后的页面状态: {}", afterScriptState);
            } catch (Exception e) {
                log.warn("获取执行后状态失败: {}", e.getMessage());
            }

            // 等待消息发送完成并验证
            PlaywrightUtil.sleep(3);

            // ✅ 修复：验证消息是否真正发送成功（使用更严格的验证逻辑）
            boolean messageSent = verifyMessageSent(page);
            if (messageSent) {
                log.info("✅ 备用方案验证成功，消息已发送: {}", job.getJobName());
                return true;
            } else {
                log.warn("❌ 备用方案验证失败，消息未发送: {}", job.getJobName());
                return false;
            }

        } catch (Exception e) {
            log.error("备用方案发送消息失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 验证消息是否真正发送成功
     * ✅ 修复：添加更严格的验证逻辑，确保消息真正发送成功
     *
     * @param page 页面对象
     * @return 是否发送成功
     */
    public boolean verifyMessageSent(Page page) {
        try {
            log.info("🔍 开始验证消息是否真正发送成功...");

            // 等待页面更新
            PlaywrightUtil.sleep(2);

            // 1. 检查是否有错误提示（优先级最高）
            String[] errorSelectors = {
                ".error-message",
                ".send-failed",
                "[class*='error']",
                "[class*='fail']",
                ".toast-error",
                "[class*='toast'][class*='error']"
            };

            for (String selector : errorSelectors) {
                Locator element = page.locator(selector);
                if (element.count() > 0 && element.first().isVisible()) {
                    String errorText = element.first().textContent();
                    log.warn("❌ 发现发送错误提示: {} - {}", selector, errorText);
                    return false;
                }
            }

            // 2. 检查输入框是否已清空（消息已发送后，输入框应该被清空）
            String[] inputSelectors = {
                "div.dialog-input[contenteditable='true']",
                "div[contenteditable='true'][role='textbox']",
                "div.dialog-input",
                "div[data-testid='chat-input']",
                "textarea.input-area",
                "div[contenteditable='true']"
            };

            boolean inputCleared = false;
            for (String selector : inputSelectors) {
                Locator inputElement = page.locator(selector);
                if (inputElement.count() > 0 && inputElement.first().isVisible()) {
                    try {
                        String inputValue = inputElement.first().textContent();
                        String inputValueAttr = inputElement.first().evaluate("el => el.value || el.textContent || ''").toString();
                        if ((inputValue == null || inputValue.trim().isEmpty()) &&
                            (inputValueAttr == null || inputValueAttr.trim().isEmpty())) {
                            log.info("✅ 输入框已清空，消息可能已发送");
                            inputCleared = true;
                            break;
                        } else {
                            log.warn("⚠️ 输入框仍有内容: {}", inputValueAttr.length() > 50 ? inputValueAttr.substring(0, 50) + "..." : inputValueAttr);
                        }
                    } catch (Exception e) {
                        log.debug("检查输入框内容时出现异常: {}", e.getMessage());
                    }
                }
            }

            // 3. 检查聊天消息列表中的最后一条消息（最严格的验证）
            // 尝试查找聊天消息列表，检查最后一条消息是否是我们发送的
            String[] messageListSelectors = {
                ".chat-message-list .message-item:last-child",
                ".message-list .message-item:last-child",
                ".chat-container .message:last-child",
                ".dialog-content .message:last-child",
                "[class*='message-list'] [class*='message']:last-child",
                ".chat-message:last-child",
                ".message-item:last-child"
            };

            boolean foundMessageInList = false;
            for (String selector : messageListSelectors) {
                Locator messageElement = page.locator(selector);
                if (messageElement.count() > 0 && messageElement.first().isVisible()) {
                    try {
                        String messageText = messageElement.first().textContent();
                        if (messageText != null && !messageText.trim().isEmpty()) {
                            log.info("✅ 找到聊天消息列表中的最后一条消息: {}",
                                messageText.length() > 50 ? messageText.substring(0, 50) + "..." : messageText);
                            foundMessageInList = true;
                            break;
                        }
                    } catch (Exception e) {
                        log.debug("检查消息列表时出现异常: {}", e.getMessage());
                    }
                }
            }

            // 4. 检查是否有成功发送的提示（辅助验证）
            String[] successSelectors = {
                ".message-sent",
                ".sent-success",
                "[class*='sent'][class*='success']"
            };

            boolean foundSuccessIndicator = false;
            for (String selector : successSelectors) {
                Locator element = page.locator(selector);
                if (element.count() > 0 && element.first().isVisible()) {
                    log.info("✅ 找到发送成功标识: {}", selector);
                    foundSuccessIndicator = true;
                    break;
                }
            }

            // 5. 检查页面URL是否跳转到聊天页面（辅助验证）
            String currentUrl = page.url();
            boolean isChatPage = currentUrl.contains("/chat/") || currentUrl.contains("/im/") || currentUrl.contains("/message/");
            if (isChatPage) {
                log.info("✅ 页面已跳转到聊天页面: {}", currentUrl);
            }

            // ✅ 修复：严格的验证逻辑 - 必须满足以下条件之一才认为成功：
            // 1. 找到明确的成功标识，或者
            // 2. 输入框已清空 AND 找到消息列表中的消息，或者
            // 3. 输入框已清空 AND 页面已跳转到聊天页面
            // 不再默认返回 true，避免误判

            if (foundSuccessIndicator) {
                log.info("✅ 验证通过：找到明确的成功标识");
                return true;
            }

            if (inputCleared && foundMessageInList) {
                log.info("✅ 验证通过：输入框已清空且找到消息列表中的消息");
                return true;
            }

            if (inputCleared && isChatPage) {
                log.info("✅ 验证通过：输入框已清空且页面已跳转到聊天页面");
                return true;
            }

            // ❌ 如果所有验证都失败，返回 false（不再默认返回 true）
            log.warn("❌ 验证失败：无法确认消息是否真正发送成功");
            log.warn("   输入框清空: {}, 消息列表: {}, 成功标识: {}, 聊天页面: {}",
                inputCleared, foundMessageInList, foundSuccessIndicator, isChatPage);

            // ✅ 新增：验证失败时输出详细的页面诊断信息
            try {
                String diagnosticInfo = page.evaluate("""
                    () => {
                        const result = {
                            url: window.location.href,
                            title: document.title,
                            inputs: [],
                            messages: [],
                            buttons: []
                        };

                        // 查找所有输入框
                        const allInputs = document.querySelectorAll(
                            '[contenteditable="true"], textarea, input[type="text"], .dialog-input, .chat-input'
                        );
                        allInputs.forEach((el, idx) => {
                            if (idx < 5) { // 只记录前5个
                                result.inputs.push({
                                    tag: el.tagName,
                                    className: el.className,
                                    id: el.id,
                                    visible: el.offsetParent !== null,
                                    value: el.textContent || el.value || '',
                                    placeholder: el.placeholder || ''
                                });
                            }
                        });

                        // 查找所有消息元素
                        const allMessages = document.querySelectorAll(
                            '.message-item, .chat-message, [class*="message"]'
                        );
                        allMessages.forEach((el, idx) => {
                            if (idx < 5) { // 只记录前5个
                                result.messages.push({
                                    className: el.className,
                                    text: (el.textContent || '').substring(0, 100)
                                });
                            }
                        });

                        // 查找所有按钮
                        const allButtons = document.querySelectorAll('button, [role="button"]');
                        allButtons.forEach((el, idx) => {
                            if (idx < 10) { // 只记录前10个
                                const text = (el.textContent || '').trim();
                                if (text.includes('发送') || text.includes('提交') || text.includes('确定')) {
                                    result.buttons.push({
                                        text: text,
                                        className: el.className,
                                        disabled: el.disabled,
                                        visible: el.offsetParent !== null
                                    });
                                }
                            }
                        });

                        return JSON.stringify(result, null, 2);
                    }
                """).toString();
                log.info("📋 验证失败时的页面诊断信息: {}", diagnosticInfo);
            } catch (Exception e) {
                log.warn("获取诊断信息失败: {}", e.getMessage());
            }

            return false;

        } catch (Exception e) {
            log.error("❌ 验证消息发送状态失败: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * 安全的点击操作，会自动处理登录弹窗
     *
     * @param page 页面对象
     * @param locator 要点击的元素定位器
     * @param description 操作描述（用于日志）
     * @return 是否点击成功
     */
    public boolean safeClick(Page page, Locator locator, String description) {
        try {
            // 点击前检查并处理登录弹窗
            if (loginService.checkAndCloseLoginDialog(page)) {
                log.info("{}前检测到登录弹窗，已关闭", description);
                PlaywrightUtil.sleep(1);
            }

            // 执行点击
            locator.click();
            log.info("{}成功", description);

            // 点击后再次检查登录弹窗
            if (loginService.checkAndCloseLoginDialog(page)) {
                log.info("{}后检测到登录弹窗，已关闭", description);
            }

            return true;
        } catch (Exception e) {
            log.error("{}失败: {}", description, e.getMessage());
            return false;
        }
    }

    /**
     * 截图诊断聊天页面
     *
     * @param page 页面对象
     * @param job 岗位信息
     */
    public void captureDebugScreenshot(Page page, Job job) {
        try {
            String timestamp = new java.text.SimpleDateFormat("yyyyMMdd_HHmmss").format(new java.util.Date());
            String safeJobName = job.getJobName().replaceAll("[^a-zA-Z0-9]", "_");
            String filename = String.format("/tmp/boss_debug_%s_%s_%s.png",
                userId, safeJobName, timestamp);

            page.screenshot(new Page.ScreenshotOptions()
                .setPath(java.nio.file.Paths.get(filename))
                .setFullPage(true));

            log.info("📸 已截图保存: {}", filename);
            log.info("📸 截图URL: file://{}", filename);
        } catch (Exception e) {
            log.warn("截图失败: {}", e.getMessage());
        }
    }
}

