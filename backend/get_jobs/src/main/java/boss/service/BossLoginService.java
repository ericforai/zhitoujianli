package boss.service;

import static boss.Locators.ERROR_PAGE_LOGIN;
import static boss.Locators.LOGIN_BTN;
import static boss.Locators.LOGIN_BTNS;
import static boss.Locators.LOGIN_CANCEL_BTN;
import static boss.Locators.LOGIN_DIALOG;
import static boss.Locators.LOGIN_DIALOG_CLOSE;
import static boss.Locators.LOGIN_DIALOG_MASK;
import static boss.Locators.LOGIN_SCAN_SWITCH;
import static boss.Locators.PAGE_HEADER;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

import lombok.SneakyThrows;
import utils.PlaywrightUtil;

/**
 * Boss登录服务
 * 负责处理所有登录相关逻辑
 *
 * @author ZhiTouJianLi Team
 */
public class BossLoginService {
    private static final Logger log = LoggerFactory.getLogger(BossLoginService.class);

    private final String userId;
    private final String homeUrl;
    private final String cookiePath;
    private final BossBehaviorLogger behaviorLogger;

    public BossLoginService(String userId, String cookiePath, BossBehaviorLogger behaviorLogger) {
        this.userId = userId;
        this.homeUrl = "https://www.zhipin.com";
        this.cookiePath = cookiePath;
        this.behaviorLogger = behaviorLogger;
    }

    /**
     * 主登录流程
     *
     * @param loginOnly 是否只登录模式
     */
    @SneakyThrows
    public void login(boolean loginOnly) {
        log.info("开始Boss直聘登录流程... (loginOnly={})", loginOnly);

        // 检查是否需要登录
        boolean needLogin = !PlaywrightUtil.isCookieValid(cookiePath);

        // ❌ 已删除：Cookie共享机制（2025-11-06修复多租户隔离BUG）
        // 原代码会从default_user复制Cookie，导致多个用户共享同一个Boss登录状态！
        // 这会造成严重后果：用户A的投递会发送到用户B的Boss账号
        // 正确做法：每个用户必须使用自己的Boss账号登录，不能共享Cookie

        // ✅ 恢复原始逻辑：根据是否需要登录来切换模式
        if (needLogin) {
            log.info("Cookie无效，切换到有头模式进行登录...");
            PlaywrightUtil.switchToHeaded();
        } else {
            log.info("Cookie有效，使用无头模式...");
            PlaywrightUtil.switchToHeadless();
        }

        Page page = PlaywrightUtil.getPageObject();
        page.navigate(homeUrl);
        PlaywrightUtil.sleep(1);

        // 检查滑块验证
        waitForSliderVerify(page);

        // 如果Cookie有效，加载Cookie
        if (!needLogin) {
            PlaywrightUtil.loadCookies(cookiePath);
            page.reload();
            PlaywrightUtil.sleep(2);
            waitForSliderVerify(page);

            // 检查是否出现强制登录弹窗（运行时Cookie失效）
            boolean hasLoginDialog = checkLoginDialogPresent(page);
            if (hasLoginDialog) {
                log.warn("⚠️ Cookie文件存在但运行时失效（检测到登录弹窗），需要重新登录");
                needLogin = true;

                // ⚠️ Cookie运行时失效，需要重新登录
                // 如果当前是无头模式，则需要切换到有头模式
                if (PlaywrightUtil.isHeadless()) {
                    log.info("Cookie运行时失效，切换到有头模式进行重新登录...");
                    PlaywrightUtil.switchToHeaded();
                } else {
                    log.info("Cookie运行时失效，当前已是有头模式，直接重新登录");
                }

                // 重新导航到首页并登录
                page.navigate(homeUrl);
                PlaywrightUtil.sleep(1);
                scanLogin();

                // 登录成功后，如果是正常投递模式（非login-only），切换回无头模式提升性能
                if (!loginOnly) {
                    log.info("重新登录成功，切换到无头模式继续投递...");
                    PlaywrightUtil.switchToHeadless();
                } else {
                    log.info("重新登录成功（login-only模式），保持当前模式");
                }

                // 重新加载页面
                page.navigate(homeUrl);
                PlaywrightUtil.sleep(1);
            } else {
                // 启用反检测模式
                PlaywrightUtil.initStealth();
                log.info("Cookie已加载，登录状态正常，继续执行...");

                // ✅ 修复：Cookie有效时也要更新状态文件为success，让前端知道登录成功
                try {
                    String userId = System.getenv("BOSS_USER_ID");
                    String safeUserId = userId != null ? userId.replaceAll("[^a-zA-Z0-9_-]", "_") : "default";
                    String statusFile = System.getProperty("java.io.tmpdir") + java.io.File.separator + "boss_login_status_" + safeUserId + ".txt";
                    java.nio.file.Files.write(java.nio.file.Paths.get(statusFile), "success".getBytes(java.nio.charset.StandardCharsets.UTF_8));
                    log.info("✅ Cookie有效，登录状态已更新为success (用户: {})", safeUserId);
                } catch (Exception e) {
                    log.warn("更新登录状态文件失败: {}", e.getMessage());
                }
            }
        } else {
            // Cookie无效，需要登录
            log.info("需要登录，启动登录流程...");

            // ✅ 恢复：在扫码登录前启用反检测（Nov 7版本的逻辑）
            PlaywrightUtil.initStealth();
            log.info("✅ 已启用反检测模式");

            scanLogin();

            // 登录成功后，如果是正常投递模式，切换到无头模式提升性能
            // login-only模式保持有头模式（虽然即将关闭，但避免不必要的切换）
            if (!loginOnly) {
                log.info("登录成功，切换到无头模式继续投递...");
                PlaywrightUtil.switchToHeadless();
            } else {
                log.info("登录成功（login-only模式），保持有头模式，即将关闭浏览器");
            }
        }
    }

    /**
     * 等待滑块验证
     *
     * @param page 页面对象
     */
    private void waitForSliderVerify(Page page) {
        String SLIDER_URL = "https://www.zhipin.com/web/user/safe/verify-slider";
        // 最多等待5分钟（防呆，防止死循环）
        long start = System.currentTimeMillis();
        while (true) {
            String url = page.url();
            if (url != null && url.startsWith(SLIDER_URL)) {
                System.out.println("%n【滑块验证】自动跳过滑块验证，等待5秒后继续…");
                try {
                    Thread.sleep(5000); // 等待5秒自动继续
                } catch (Exception e) {
                    log.error("等待滑块验证异常: {}", e.getMessage());
                }
                PlaywrightUtil.sleep(1);
                // 验证通过后页面url会变，循环再检测一次
                continue;
            }
            if ((System.currentTimeMillis() - start) > 5 * 60 * 1000) {
                throw new RuntimeException("滑块验证超时！");
            }
            break;
        }
    }

    /**
     * 检查是否需要登录
     *
     * @return true=需要登录, false=已登录
     */
    public boolean isLoginRequired() {
        try {
            Page page = PlaywrightUtil.getPageObject();
            Locator buttonLocator = page.locator(LOGIN_BTNS);
            if (buttonLocator.count() > 0 && buttonLocator.textContent().contains("登录")) {
                return true;
            }
        } catch (Exception e) {
            try {
                Page page = PlaywrightUtil.getPageObject();
                page.locator(PAGE_HEADER).waitFor();
                Locator errorLoginLocator = page.locator(ERROR_PAGE_LOGIN);
                if (errorLoginLocator.count() > 0) {
                    errorLoginLocator.click();
                }
                return true;
            } catch (Exception ex) {
                log.info("没有出现403访问异常");
            }
            log.info("cookie有效，已登录...");
            return false;
        }
        return false;
    }

    /**
     * 二维码扫码登录
     */
    @SneakyThrows
    public void scanLogin() {
        // 访问登录页面
        Page page = PlaywrightUtil.getPageObject();
        page.navigate(this.homeUrl + "/web/user/?ka=header-login");
        PlaywrightUtil.sleep(1);

        // 1. 如果已经登录，则直接返回
        try {
            Locator loginBtnLocator = page.locator(LOGIN_BTN);
            if (loginBtnLocator.count() > 0 && !Objects.equals(loginBtnLocator.textContent(), "登录")) {
                log.info("已经登录，直接开始投递...");
                return;
            }
        } catch (Exception ignored) {
        }

        log.info("等待登录...");

        // 2. 定位二维码登录的切换按钮
        try {
            Locator scanButton = page.locator(LOGIN_SCAN_SWITCH);
            scanButton.click();

            // ===== 新增：等待二维码加载并截图 =====
            log.info("等待二维码加载...");
            PlaywrightUtil.sleep(3); // 等待3秒让二维码渲染完成

            try {
                // 尝试多种选择器定位二维码元素
                String[] qrcodeSelectors = {
                    ".login-qrcode",  // CSS选择器
                    "canvas",         // Boss直聘二维码使用canvas元素
                    ".qrcode-img",    // 可能的类名
                    "#qrcode",        // ID选择器
                    "//div[contains(@class, 'qrcode')]",  // 包含qrcode的div
                    "//canvas[@width]" // 带width属性的canvas
                };

                Locator qrcodeElement = null;
                String successSelector = null;

                for (String selector : qrcodeSelectors) {
                    try {
                        Locator temp = page.locator(selector);
                        if (temp.count() > 0 && temp.first().isVisible()) {
                            qrcodeElement = temp.first();
                            successSelector = selector;
                            log.info("✅ 找到二维码元素，选择器: {}", selector);
                            break;
                        }
                    } catch (Exception e) {
                        // 忽略，尝试下一个选择器
                    }
                }

                if (qrcodeElement != null) {
                    // ✅ 修复：按用户隔离二维码文件和状态文件
                    String userId = System.getenv("BOSS_USER_ID");
                    String safeUserId = userId != null ? userId.replaceAll("[^a-zA-Z0-9_-]", "_") : "default";
                    String qrcodePath = System.getProperty("java.io.tmpdir") + File.separator + "boss_qrcode_" + safeUserId + ".png";
                    qrcodeElement.screenshot(new Locator.ScreenshotOptions().setPath(Paths.get(qrcodePath)));
                    log.info("✅ 二维码截图已保存: {} (使用选择器: {}, 用户: {})", qrcodePath, successSelector, safeUserId);

                    // 更新登录状态文件为waiting
                    String statusFile = System.getProperty("java.io.tmpdir") + File.separator + "boss_login_status_" + safeUserId + ".txt";
                    Files.write(Paths.get(statusFile), "waiting".getBytes(StandardCharsets.UTF_8));
                    log.info("✅ 登录状态已更新为waiting (用户: {})", safeUserId);
                } else {
                    log.warn("⚠️ 尝试了所有选择器都未找到二维码元素");
                    // 作为备选方案，截取整个页面，然后裁剪中心区域
                    log.info("🔄 备选方案：截取整个登录页面并裁剪二维码区域");
                    // ✅ 修复：按用户隔离二维码文件和状态文件
                    String userId = System.getenv("BOSS_USER_ID");
                    String safeUserId = userId != null ? userId.replaceAll("[^a-zA-Z0-9_-]", "_") : "default";
                    String fullPagePath = System.getProperty("java.io.tmpdir") + File.separator + "boss_qrcode_full_" + safeUserId + ".png";
                    String qrcodePath = System.getProperty("java.io.tmpdir") + File.separator + "boss_qrcode_" + safeUserId + ".png";

                    // 截取整个页面
                    page.screenshot(new Page.ScreenshotOptions().setPath(Paths.get(fullPagePath)));

                    // ✅ 裁剪中心区域（二维码通常在页面中央）
                    // 使用Playwright的clip功能截取中心区域
                    try {
                        // 获取页面尺寸
                        int pageWidth = 1920;
                        int pageHeight = 1080;

                        // 计算中心区域：宽高各取40%，居中显示
                        int cropWidth = (int)(pageWidth * 0.4);  // 768px
                        int cropHeight = (int)(pageHeight * 0.4); // 432px
                        int cropX = (pageWidth - cropWidth) / 2;
                        int cropY = (pageHeight - cropHeight) / 2;

                        page.screenshot(new Page.ScreenshotOptions()
                            .setPath(Paths.get(qrcodePath))
                            .setClip(cropX, cropY, cropWidth, cropHeight));

                        log.info("✅ 已裁剪二维码中心区域: {}x{} from ({}, {})", cropWidth, cropHeight, cropX, cropY);
                    } catch (Exception e) {
                        log.warn("裁剪失败，使用完整页面: {}", e.getMessage());
                        // 如果裁剪失败，使用完整页面
                        Files.copy(Paths.get(fullPagePath), Paths.get(qrcodePath),
                            java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                    }

                    Files.write(Paths.get(System.getProperty("java.io.tmpdir") + File.separator + "boss_login_status_" + safeUserId + ".txt"), "waiting".getBytes(StandardCharsets.UTF_8));
                    log.info("✅ 二维码截图已保存 (用户: {})", safeUserId);
                }
            } catch (Exception screenshotEx) {
                log.error("二维码截图失败", screenshotEx);
            }
            // ===== 新增部分结束 =====

            // 3. 登录逻辑
            boolean login = false;

            // 4. 记录开始时间，用于判断15分钟超时
            long startTime = System.currentTimeMillis();
            final long TIMEOUT = 15 * 60 * 1000; // 从10分钟改为15分钟

            // ✅ 修复：跟踪Cookie数量变化（用于检测手机端扫码后的进度）
            // 使用外部变量记录上次的Cookie数量，避免每次循环重新初始化
            final int[] previousCookieCountRef = new int[]{0}; // 初始值为0，第一次检测时会被更新

            while (!login) {
                // 判断是否超时
                long elapsed = System.currentTimeMillis() - startTime;
                if (elapsed >= TIMEOUT) {
                    log.error("超过15分钟未完成登录，程序退出...");
                    // ✅ 修复：按用户隔离状态文件
                    try {
                        String userId = System.getenv("BOSS_USER_ID");
                        String safeUserId = userId != null ? userId.replaceAll("[^a-zA-Z0-9_-]", "_") : "default";
                        Files.write(Paths.get(System.getProperty("java.io.tmpdir") + File.separator + "boss_login_status_" + safeUserId + ".txt"), "failed".getBytes(StandardCharsets.UTF_8));
                        log.info("✅ 登录状态已更新为failed (用户: {})", safeUserId);
                    } catch (Exception e) {
                        log.error("更新登录状态失败", e);
                    }
                    throw new RuntimeException("等待登录超时（15分钟），请重新启动程序");
                }

                try {
                    // ===== 改进：多种方式检测登录成功 =====
                    String currentUrl = page.url();

                    // 获取所有Cookie用于调试
                    List<com.microsoft.playwright.options.Cookie> cookies = page.context().cookies();

                    // 每10次循环输出一次详细信息（避免日志过多）
                    long elapsedSeconds = (System.currentTimeMillis() - startTime) / 1000;
                    if (elapsedSeconds % 10 == 0) {
                        // ✅ 改进：跟踪Cookie数量变化（用于检测手机端扫码后的进度）
                        int currentCookieCount = cookies.size();
                        String cookieChangeHint = "";

                        // 检测Cookie数量变化（手机端扫码后Cookie数量可能会增加）
                        if (previousCookieCountRef[0] > 0 && currentCookieCount > previousCookieCountRef[0]) {
                            cookieChangeHint = String.format("（⚠️ Cookie数量从%d个增加到%d个，可能正在登录中...）",
                                previousCookieCountRef[0], currentCookieCount);
                        }

                        log.info("🔍 登录检测 - URL: {}, Cookie数量: {}, 已等待: {}秒{}",
                            currentUrl, currentCookieCount, elapsedSeconds, cookieChangeHint);

                        // 更新Cookie数量记录（只在第一次或数量变化时更新）
                        if (previousCookieCountRef[0] == 0 || currentCookieCount != previousCookieCountRef[0]) {
                            previousCookieCountRef[0] = currentCookieCount;
                        }

                        // 输出所有Cookie名称（诊断模式）
                        if (elapsedSeconds % 30 == 0) {
                            log.info("📋 当前所有Cookie:");
                            cookies.forEach(c -> log.info("   🍪 {} = {} (domain: {})",
                                c.name, c.value.substring(0, Math.min(15, c.value.length())) + "...", c.domain));
                        }

                        // 检查关键Cookie
                        boolean hasWt2 = cookies.stream().anyMatch(c -> c.name.equals("wt2"));
                        boolean hasGeekToken = cookies.stream().anyMatch(c -> c.name.equals("geek_zp_token"));
                        if (hasWt2 || hasGeekToken) {
                            log.info("   ✅ 发现关键Cookie: wt2={}, geek_zp_token={}", hasWt2, hasGeekToken);
                        } else {
                            log.warn("   ❌ 未发现登录Cookie (wt2/geek_zp_token)");
                            // ✅ 新增：手机端扫码提示
                            if (elapsedSeconds >= 20 && elapsedSeconds % 20 == 0) {
                                log.info("   💡 提示：如果您已在手机上扫码并确认登录，请稍等片刻，系统正在检测Cookie...");
                                log.info("   💡 系统会在20秒后自动刷新页面以同步Cookie");
                            }
                        }
                    }

                    // 方式1: 检测URL变化（扫码成功后会跳转离开登录页）
                    if (!currentUrl.contains("/web/user/?ka=header-login") &&
                        currentUrl.contains("zhipin.com")) {
                        login = true;
                        log.info("✅ 方式1成功：检测到URL跳转，登录成功！URL: {}", currentUrl);
                    }

                    // 方式2: 检测多个可能的成功标志元素
                    if (!login) {
                        String[] successSelectors = {
                            "div.job-list-container",      // 职位列表容器
                            ".user-avatar",                // 用户头像
                            ".nav-figure",                 // 导航栏头像
                            "a[ka='header-home-logo']",   // 首页logo（登录后出现）
                            "a[href*='/web/user/safe']",  // 用户中心链接
                            ".menu-user",                  // 用户菜单
                            "[class*='user-name']"        // 用户名元素
                        };

                        for (String selector : successSelectors) {
                            try {
                                Locator element = page.locator(selector);
                                if (element.count() > 0 && element.first().isVisible()) {
                                    login = true;
                                    log.info("✅ 方式2成功：检测到登录成功标志元素: {}", selector);
                                    break;
                                }
                            } catch (Exception ignored) {
                                // 继续尝试下一个选择器
                            }
                        }
                    }

                    // 方式3: 检测关键Cookie存在（扫码确认后会立即设置wt2等Cookie）
                    if (!login) {
                        boolean hasWt2 = cookies.stream().anyMatch(c -> c.name.equals("wt2") && c.value.length() > 10);
                        boolean hasGeekToken = cookies.stream().anyMatch(c -> c.name.equals("geek_zp_token") && c.value.length() > 10);
                        boolean hasUabCollina = cookies.stream().anyMatch(c -> c.name.equals("_uab_collina") && c.value.length() > 10);

                        // 只要有wt2 Cookie就认为登录成功（这是Boss直聘最关键的登录凭证）
                        if (hasWt2) {
                            login = true;
                            log.info("✅ 方式3成功：检测到关键Session Cookie (wt2)，登录成功！");
                            log.info("   🍪 Cookie详情 - wt2: ✓, geek_zp_token: {}, _uab_collina: {}, 总数: {}",
                                hasGeekToken ? "✓" : "✗", hasUabCollina ? "✓" : "✗", cookies.size());
                        } else {
                            // ✅ 修复：改进刷新策略 - 手机端扫码后，Cookie同步可能需要更长时间
                            // 1. 等待至少90秒后才考虑刷新（给用户充足时间扫码确认）
                            // 2. 每隔90秒刷新一次（避免二维码频繁失效）
                            // 3. 刷新后等待更长时间（5秒）让页面完全加载
                            // 4. 刷新后重新截图二维码（如果还在登录页）
                            // 5. 检测Cookie数量变化时立即刷新
                            long elapsedSecondsForRefresh = (System.currentTimeMillis() - startTime) / 1000;
                            int currentCookieCount = cookies.size();

                            // 检测Cookie数量是否增加（说明扫码有进展）
                            boolean cookieCountIncreased = previousCookieCountRef[0] > 0 && currentCookieCount > previousCookieCountRef[0];

                            // 条件：(1)Cookie增加立即刷新 或 (2)每90秒定时刷新（给用户充足时间）
                            boolean shouldRefresh = cookieCountIncreased ||
                                (elapsedSecondsForRefresh >= 90 && elapsedSecondsForRefresh % 90 == 0);

                            if (shouldRefresh && currentCookieCount <= 15) {
                                if (cookieCountIncreased) {
                                    log.info("🔔 检测到Cookie数量增加（{}→{}个），立即刷新页面同步登录状态...",
                                        previousCookieCountRef[0], currentCookieCount);
                                } else {
                                    log.warn("⚠️ Cookie数量未增加（{}个），已等待{}秒，尝试刷新页面触发Cookie设置...",
                                        currentCookieCount, elapsedSecondsForRefresh);
                                }

                                try {
                                    // 刷新前保存当前URL
                                    String urlBeforeRefresh = page.url();

                                    // 执行刷新
                                    page.reload();
                                    log.info("🔄 页面已刷新，等待页面加载...");

                                    // 等待页面完全加载（手机端扫码后可能需要更长时间）
                                    PlaywrightUtil.sleep(5);

                                    // 刷新后检查是否还在登录页
                                    String urlAfterRefresh = page.url();
                                    boolean stillOnLoginPage = urlAfterRefresh.contains("/web/user/?ka=header-login");

                                    if (stillOnLoginPage) {
                                        // ✅ 修复：刷新后检查Cookie，如果已有wt2 Cookie说明已登录成功，不应该重置状态
                                        List<com.microsoft.playwright.options.Cookie> cookiesAfterRefresh = page.context().cookies();
                                        boolean hasWt2AfterRefresh = cookiesAfterRefresh.stream().anyMatch(c -> c.name.equals("wt2") && c.value.length() > 10);

                                        if (hasWt2AfterRefresh) {
                                            log.info("✅ 刷新后检测到wt2 Cookie，说明已登录成功，跳过重新截图和状态重置");
                                            // 直接设置login=true，让后续逻辑处理登录成功
                                            login = true;
                                        } else {
                                            log.info("⚠️ 刷新后仍在登录页且无wt2 Cookie，重新截图二维码...");

                                            // 重新截图二维码（用户可能需要在手机上重新扫码或确认）
                                            try {
                                                String userId = System.getenv("BOSS_USER_ID");
                                                String safeUserId = userId != null ? userId.replaceAll("[^a-zA-Z0-9_-]", "_") : "default";
                                                String qrcodePath = System.getProperty("java.io.tmpdir") + File.separator + "boss_qrcode_" + safeUserId + ".png";

                                                // 等待二维码重新加载
                                                PlaywrightUtil.sleep(2);

                                                // 尝试重新截图二维码
                                                String[] qrcodeSelectors = {
                                                    ".login-qrcode",
                                                    "canvas",
                                                    ".qrcode-img",
                                                    "#qrcode"
                                                };

                                                boolean qrScreenshotSuccess = false;
                                                for (String selector : qrcodeSelectors) {
                                                    try {
                                                        Locator qrElement = page.locator(selector);
                                                        if (qrElement.count() > 0 && qrElement.first().isVisible()) {
                                                            qrElement.first().screenshot(new Locator.ScreenshotOptions().setPath(Paths.get(qrcodePath)));
                                                            log.info("✅ 已重新截图二维码: {}", qrcodePath);
                                                            qrScreenshotSuccess = true;
                                                            break;
                                                        }
                                                    } catch (Exception e) {
                                                        // 继续尝试下一个选择器
                                                    }
                                                }

                                                if (!qrScreenshotSuccess) {
                                                    // 如果找不到二维码元素，截取整个页面中心区域
                                                    // ✅ 修复：setClip直接接受4个参数，不需要创建Clip对象
                                                    page.screenshot(new Page.ScreenshotOptions()
                                                        .setPath(Paths.get(qrcodePath))
                                                        .setClip(576, 324, 768, 432));
                                                    log.info("✅ 已重新截图二维码（整页裁剪）: {}", qrcodePath);
                                                }

                                                // ✅ 修复：只有在确认没有登录Cookie时才更新状态为waiting
                                                // 不要覆盖已经成功的状态
                                                String statusFile = System.getProperty("java.io.tmpdir") + File.separator + "boss_login_status_" + safeUserId + ".txt";
                                                if (Files.exists(Paths.get(statusFile))) {
                                                    String currentStatus = new String(Files.readAllBytes(Paths.get(statusFile))).trim();
                                                    if (!"success".equals(currentStatus)) {
                                                        // 只有当前状态不是success时才更新为waiting
                                                        Files.write(Paths.get(statusFile), "waiting".getBytes(StandardCharsets.UTF_8));
                                                        log.info("✅ 状态已更新为waiting（当前状态: {}）", currentStatus);
                                                    } else {
                                                        log.info("✅ 当前状态已是success，不重置为waiting");
                                                    }
                                                } else {
                                                    Files.write(Paths.get(statusFile), "waiting".getBytes(StandardCharsets.UTF_8));
                                                }

                                            } catch (Exception e) {
                                                log.warn("重新截图二维码失败: {}", e.getMessage());
                                            }
                                        }
                                    } else {
                                        log.info("✅ 刷新后URL已变化: {} -> {}，可能已登录成功，继续检测Cookie...",
                                            urlBeforeRefresh, urlAfterRefresh);
                                    }
                                } catch (Exception e) {
                                    log.error("刷新页面时出错: {}", e.getMessage());
                                    // 不要因为刷新失败而中断检测流程
                                }
                            }
                        }
                    }

                    // ❌ 已删除方式4：二维码消失检测（误判率太高）
                    // 原逻辑：如果找不到二维码元素就认为登录成功
                    // 问题：找不到可能是选择器错误、页面未加载完，不能作为登录成功的依据
                    // 只依赖真正可靠的标志：wt2 Cookie、URL跳转、登录后元素
                    // ===== 改进部分结束 =====

                    if (login) {
                        log.info("用户已登录！");
                        // 登录成功，保存Cookie
                        PlaywrightUtil.saveCookies(cookiePath);

                        // ===== 新增：更新登录状态为success =====
                        try {
                            // ✅ 修复：按用户隔离状态文件
                            String userId = System.getenv("BOSS_USER_ID");
                            String safeUserId = userId != null ? userId.replaceAll("[^a-zA-Z0-9_-]", "_") : "default";
                            Files.write(Paths.get(System.getProperty("java.io.tmpdir") + File.separator + "boss_login_status_" + safeUserId + ".txt"), "success".getBytes(StandardCharsets.UTF_8));
                            log.info("✅ 登录状态已更新为success (用户: {})", safeUserId);

                            // 记录用户行为：二维码扫码成功
                            if (this.userId != null && !this.userId.isEmpty() && behaviorLogger != null) {
                                behaviorLogger.logBehavior("QRCODE_SCAN_SUCCESS", "SUCCESS", "BOSS直聘二维码扫码成功", null);
                            }
                        } catch (Exception e) {
                            log.error("更新登录状态失败", e);
                        }
                        // ===== 新增部分结束 =====

                        break;
                    }
                } catch (Exception e) {
                    log.error("检测元素时异常: {}", e.getMessage());
                }
                // 每2秒检查一次
                Thread.sleep(2000);
            }

        } catch (Exception e) {
            log.error("未找到二维码登录按钮，登录失败", e);
        }
    }

    /**
     * 检查页面是否存在登录弹窗
     *
     * @param page 页面对象
     * @return 是否存在登录弹窗
     */
    public boolean checkLoginDialogPresent(Page page) {
        try {
            // 检查是否存在登录弹窗遮罩
            Locator loginMask = page.locator(LOGIN_DIALOG_MASK);
            if (loginMask.count() > 0 && loginMask.first().isVisible()) {
                log.info("检测到登录弹窗存在");
                return true;
            }

            // 检查是否存在登录对话框
            Locator loginDialog = page.locator(LOGIN_DIALOG);
            if (loginDialog.count() > 0 && loginDialog.first().isVisible()) {
                log.info("检测到登录对话框存在");
                return true;
            }

            return false;
        } catch (Exception e) {
            log.debug("检查登录弹窗失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 检查并关闭登录弹窗
     *
     * @param page 页面对象
     * @return 是否关闭了弹窗
     */
    public boolean checkAndCloseLoginDialog(Page page) {
        try {
            // 检查是否存在登录弹窗遮罩
            Locator loginMask = page.locator(LOGIN_DIALOG_MASK);
            if (loginMask.count() > 0 && loginMask.first().isVisible()) {
                log.info("检测到登录弹窗，尝试关闭...");

                // 尝试点击关闭按钮
                Locator closeBtn = page.locator(LOGIN_DIALOG_CLOSE);
                if (closeBtn.count() > 0 && closeBtn.first().isVisible()) {
                    log.info("找到关闭按钮，点击关闭登录弹窗");
                    closeBtn.first().click();
                    PlaywrightUtil.sleep(1);
                    return true;
                }

                // 尝试点击取消按钮
                Locator cancelBtn = page.locator(LOGIN_CANCEL_BTN);
                if (cancelBtn.count() > 0 && cancelBtn.first().isVisible()) {
                    log.info("找到取消按钮，点击关闭登录弹窗");
                    cancelBtn.first().click();
                    PlaywrightUtil.sleep(1);
                    return true;
                }

                // 尝试点击遮罩层关闭
                log.info("尝试点击遮罩层关闭登录弹窗");
                loginMask.first().click();
                PlaywrightUtil.sleep(1);

                // 再次检查是否关闭成功
                if (loginMask.count() == 0 || !loginMask.first().isVisible()) {
                    log.info("登录弹窗已关闭");
                    return true;
                }

                // 尝试使用JavaScript强制移除弹窗
                log.info("尝试使用JavaScript强制移除登录弹窗");
                page.evaluate("() => { " +
                    "const mask = document.querySelector('.boss-login-dialog-mask'); " +
                    "const dialog = document.querySelector('.boss-login-dialog'); " +
                    "if (mask) mask.remove(); " +
                    "if (dialog) dialog.remove(); " +
                "}");
                PlaywrightUtil.sleep(1);

                log.info("已强制移除登录弹窗元素");
                return true;
            }
            return false;
        } catch (Exception e) {
            log.warn("关闭登录弹窗失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 等待并处理登录弹窗
     *
     * @param page 页面对象
     * @param maxWaitSeconds 最大等待时间（秒）
     * @return 是否成功处理了弹窗
     */
    public boolean waitAndHandleLoginDialog(Page page, int maxWaitSeconds) {
        int waitTime = 0;
        while (waitTime < maxWaitSeconds) {
            if (checkAndCloseLoginDialog(page)) {
                return true;
            }
            PlaywrightUtil.sleep(1);
            waitTime++;
        }
        return false;
    }
}

