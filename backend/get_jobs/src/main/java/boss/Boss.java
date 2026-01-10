package boss;

import static boss.Locators.DIALOG_CON;
import static boss.Locators.LOGIN_BTN;
import static boss.Locators.LOGIN_SCAN_SWITCH;
import static boss.Locators.RECRUITER_INFO;
import static utils.Bot.sendMessageByTime;
import static utils.JobUtils.formatDuration;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Scanner;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

import ai.AiConfig;
import ai.AiFilter;
import ai.AiService;
import lombok.SneakyThrows;
import utils.Job;
import utils.JobUtils;
import utils.PlaywrightUtil;

/**
 * @author loks666
 * 项目链接: <a href=
 * "https://github.com/ericforai/zhitoujianli">https://github.com/ericforai/zhitoujianli</a>
 * Boss直聘自动投递
 */
public class Boss {
    static {
        // 在类加载时就设置日志文件名，确保Logger初始化时能获取到正确的属性
        System.setProperty("log.name", "boss");
    }

    private static final Logger log = LoggerFactory.getLogger(Boss.class);

    // ========== 实例变量（方案B完全实例化重构） ==========
    private final String userId;
    private final String homeUrl = "https://www.zhipin.com";
    private final String baseUrl = "https://www.zhipin.com/web/geek/job?";
    private final String dataPath;
    private final String cookiePath;
    private final BossConfig config;
    private List<Job> resultList;
    private DeliveryController deliveryController;
    private Date startDate;

    // ========== 服务注入（重构后） ==========
    private final boss.service.BossLoginService loginService;
    private final boss.service.BossJobSearchService searchService;
    private final boss.matcher.BossJobMatcher jobMatcher;
    private final boss.service.BossDeliveryService deliveryService;
    private final boss.service.BossGreetingService greetingService;
    private final boss.service.BossQuotaService quotaService;
    private final boss.service.BossBlacklistService blacklistService;
    private final boss.service.BossBehaviorLogger behaviorLogger;

    /**
     * Boss构造函数（方案B完全实例化）
     *
     * @param userId 用户ID
     */
    public Boss(String userId) {
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("用户ID不能为空");
        }

        this.userId = userId;
        String safeUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "_");

        // 初始化路径
        this.dataPath = buildDataPath(safeUserId);
        this.cookiePath = buildCookiePath(safeUserId);

        // 加载配置
        this.config = BossConfig.loadForUser(userId);

        // 初始化集合
        this.resultList = new ArrayList<>();

        // 初始化服务
        this.behaviorLogger = new boss.service.BossBehaviorLogger(userId);
        this.blacklistService = new boss.service.BossBlacklistService(userId, this.dataPath);
        this.blacklistService.loadData(); // 加载黑名单数据

        this.quotaService = new boss.service.BossQuotaService(userId);
        this.greetingService = new boss.service.BossGreetingService(this.config, userId);
        this.jobMatcher = new boss.matcher.BossJobMatcher(this.config);
        this.searchService = new boss.service.BossJobSearchService(this.config);
        this.loginService = new boss.service.BossLoginService(userId, this.cookiePath, this.behaviorLogger);
        this.deliveryService = new boss.service.BossDeliveryService(
            this.config, userId, this.greetingService, this.blacklistService, this.behaviorLogger, this.loginService);

        // 初始化控制器
        if (this.config != null && this.config.getDeliveryStrategy() != null) {
            this.deliveryController = new DeliveryController(this.config.getDeliveryStrategy());
        } else {
            this.deliveryController = new DeliveryController(new BossConfig.DeliveryStrategy());
        }

        log.info("✅ Boss实例已创建: userId={}, dataPath={}, cookiePath={}",
            userId, this.dataPath, this.cookiePath);
    }

    /**
     * 构建数据文件路径（用户隔离）
     *
     * @param safeUserId 安全的用户ID
     * @return 数据文件路径
     */
    private static String buildDataPath(String safeUserId) {
        String userDataBaseDir = System.getenv("USER_DATA_DIR");
        if (userDataBaseDir == null || userDataBaseDir.isEmpty()) {
            userDataBaseDir = System.getProperty("user.dir") + File.separator + "user_data";
        }
        return userDataBaseDir + File.separator + safeUserId + File.separator + "blacklist.json";
    }

    /**
     * 构建Cookie文件路径（用户隔离）
     *
     * @param safeUserId 安全的用户ID
     * @return Cookie文件路径
     */
    private static String buildCookiePath(String safeUserId) {
        return System.getProperty("java.io.tmpdir") + File.separator + "boss_cookies_" + safeUserId + ".json";
    }

    public static void main(String[] args) {
        // 获取用户ID
        String userId = System.getenv("BOSS_USER_ID");
        if (userId == null || userId.isEmpty()) {
            userId = System.getProperty("boss.user.id");
        }

        if (userId == null || userId.isEmpty()) {
            log.error("❌ 多租户模式必须提供用户ID");
            throw new IllegalArgumentException("缺少用户ID（环境变量BOSS_USER_ID或系统属性boss.user.id）");
        }

        // 清理用户ID
        String safeUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "_");

        // 解析参数
        boolean loginOnly = args.length > 0 && "login-only".equals(args[0]);

        log.info("Boss程序启动: userId={}, 模式={}", safeUserId,
            loginOnly ? "只登录（二维码登录）" : "完整投递");

        // 创建实例并执行
        Boss boss = new Boss(userId);
        boss.execute(loginOnly);
    }

    /**
     * 执行Boss任务
     *
     * @param loginOnly 是否只登录模式
     */
    public void execute(boolean loginOnly) {
        log.info("开始执行Boss任务: userId={}, loginOnly={}", this.userId, loginOnly);

        try {
            // ✅ 恢复原始逻辑：先init()无参数，让login()内部决定是否切换模式
            log.info("初始化Playwright环境...");
            PlaywrightUtil.init();
            log.info("Playwright初始化成功");

            // 登录
            this.startDate = new Date();
            loginService.login(loginOnly);

            // 执行投递（如果不是只登录模式）
            if (!loginOnly) {
                log.info("开始执行自动投递任务...");

                // 记录用户行为：启动投递
                Map<String, Object> extraData = new HashMap<>();
                extraData.put("cities", this.config.getCities());
                extraData.put("keywords", this.config.getKeywords());
                behaviorLogger.logBehavior("JOB_DELIVERY_START", "PENDING", "启动投递任务", extraData);

                this.config.getCities().forEach(this::postJobByCity);
            } else {
                log.info("✅ 「只登录」模式完成，不执行投递任务");
                log.info("✅ Boss Cookie已保存，后续可直接启动投递任务");
                PlaywrightUtil.close();
                return;
            }

            // 打印结果
            log.info(this.resultList.isEmpty() ? "未发起新的聊天..." : "新发起聊天公司如下:%n{}",
                    this.resultList.stream().map(Object::toString).collect(Collectors.joining("%n")));
            if (this.config.getDebugger() == null || !this.config.getDebugger()) {
                printResult();
            }
        } catch (Exception e) {
            log.error("Boss任务执行失败: {}", e.getMessage(), e);
            PlaywrightUtil.close();
            throw e;
        }
    }

    private void printResult() {
        String message = String.format("%nBoss投递完成，共发起%d个聊天，用时%s", this.resultList.size(),
                formatDuration(this.startDate, new Date()));
        log.info(message);
        sendMessageByTime(message);
        blacklistService.saveData();
        this.resultList.clear();
        if (this.config.getDebugger() == null || !this.config.getDebugger()) {
            PlaywrightUtil.close();
        }

        // 确保所有日志都被刷新到文件
        try {
            Thread.sleep(1000); // 等待1秒确保日志写入完成
            // 强制刷新日志 - 使用正确的方法
            ch.qos.logback.classic.LoggerContext loggerContext = (ch.qos.logback.classic.LoggerContext) org.slf4j.LoggerFactory.getILoggerFactory();
            loggerContext.stop();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void postJobByCity(String cityCode) {
        String searchUrl = searchService.getSearchUrl(cityCode);
        // ✅ 使用标签，允许在配额用完时跳出所有投递循环
        keywordLoop: for (String keyword : this.config.getKeywords()) {
            int postCount = 0;
            // 使用 URLEncoder 对关键词进行编码
            String encodedKeyword = URLEncoder.encode(keyword, StandardCharsets.UTF_8);

            String url = searchUrl + "&query=" + encodedKeyword;
            log.info("投递地址:{}", searchUrl + "&query=" + keyword);
            com.microsoft.playwright.Page page = PlaywrightUtil.getPageObject();

            // 使用搜索服务导航到搜索页面
            searchService.navigateToSearchPage(page, searchUrl, keyword);
            searchService.scrollToTop(page);

            // ✅ 优化：改为"滚动一次，投递一次"模式，而不是先滚动完所有岗位再投递
            log.info("【{}】开始边滚动边投递模式...", keyword);

            // 初始化滚动相关变量
            int lastCount = 0;
            int processedCount = 0; // 已处理的岗位数量
            int scrollCount = 0;
            final int MAX_SCROLL_ATTEMPTS = 50; // 最多滚动50次
            final long MAX_LOAD_DURATION_MS = 5 * 60 * 1000; // 最多5分钟
            long loadStartTime = System.currentTimeMillis();

            // 全局超时保护：如果超过30分钟没有进展，停止投递
            long keywordLoopStartTime = System.currentTimeMillis();
            final long MAX_LOOP_DURATION_MS = 30 * 60 * 1000; // 30分钟
            long lastProgressTime = keywordLoopStartTime;

            // 统计计数器
            int skipCount = 0;
            int failCount = 0;

            // ✅ 优化：边滚动边投递的循环
            while (scrollCount < MAX_SCROLL_ATTEMPTS) {
                // 检查超时
                long loadElapsedTime = System.currentTimeMillis() - loadStartTime;
                if (loadElapsedTime > MAX_LOAD_DURATION_MS) {
                    log.warn("【{}】加载岗位列表超时（已用时{}秒），停止滚动", keyword, loadElapsedTime / 1000);
                    break;
                }

                // 1. 滚动加载更多岗位
                scrollCount++;
                log.info("【{}】第{}次滚动，当前已处理{}个岗位", keyword, scrollCount, processedCount);

                try {
                    // 模拟人类滚动行为
                    PlaywrightUtil.simulateScroll();

                    // 滑动到底部
                    log.debug("【{}】执行滚动操作...", keyword);
                    long scrollStartTime = System.currentTimeMillis();
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight);");
                    long scrollDuration = System.currentTimeMillis() - scrollStartTime;
                    log.debug("【{}】滚动操作完成（耗时{}ms）", keyword, scrollDuration);

                    // 随机延迟等待加载
                    log.debug("【{}】等待页面加载（2-4秒）...", keyword);
                    PlaywrightUtil.randomSleepMillis(2000, 4000);

                    // 获取当前岗位数量
                    Locator cards = searchService.getJobCards(page);
                    int currentCount = cards.count();
                    log.info("【{}】当前岗位总数: {}个（已处理: {}个）", keyword, currentCount, processedCount);

                    // 判断是否有新岗位
                    if (currentCount == lastCount) {
                        log.info("【{}】岗位数量未变化（{}个），停止滚动", keyword, currentCount);
                        // 处理剩余的岗位
                        if (processedCount < currentCount) {
                            log.info("【{}】开始处理剩余{}个岗位", keyword, currentCount - processedCount);
                        } else {
                            break; // 没有新内容，跳出循环
                        }
                    } else {
                        int newJobs = currentCount - lastCount;
                        log.info("【{}】新增{}个岗位，开始处理新岗位", keyword, newJobs);
                    }
                    lastCount = currentCount;
                } catch (Exception e) {
                    log.error("【{}】滚动加载岗位失败: {}", keyword, e.getMessage(), e);
                    break;
                }

                // 2. 处理新加载的岗位
                // ✅ 修复：在获取卡片前检查页面状态，防止 TargetClosedError
                try {
                    if (page == null || page.isClosed()) {
                        log.error("【{}】页面已关闭或为null，无法获取岗位卡片", keyword);
                        break keywordLoop;
                    }
                } catch (Exception e) {
                    log.error("【{}】检查页面状态时发生异常: {}，停止处理", keyword, e.getMessage());
                    break keywordLoop;
                }

                Locator cards;
                int currentCount;
                try {
                    cards = searchService.getJobCards(page);
                    currentCount = cards.count();
                } catch (com.microsoft.playwright.PlaywrightException e) {
                    // 检查是否是页面关闭相关的错误（包括 TargetClosedError）
                    String errorMsg = e.getMessage() != null ? e.getMessage() : "";
                    String errorClass = e.getClass().getName();
                    if (errorClass.contains("TargetClosed") || errorMsg.contains("closed") || errorMsg.contains("Target")) {
                        log.error("【{}】页面/浏览器已关闭（PlaywrightException: {}），停止处理岗位: {}", keyword, errorClass, errorMsg);
                        break keywordLoop;
                    }
                    log.error("【{}】获取岗位卡片时发生Playwright异常: {}，停止处理", keyword, errorMsg);
                    break keywordLoop;
                } catch (Exception e) {
                    // 检查是否是页面关闭相关的错误（包括 TargetClosedError）
                    String errorMsg = e.getMessage() != null ? e.getMessage() : "";
                    String errorClass = e.getClass().getName();
                    if (errorClass.contains("TargetClosed") || errorMsg.contains("closed") || errorMsg.contains("Target")) {
                        log.error("【{}】页面/浏览器已关闭（Exception: {}），停止处理岗位: {}", keyword, errorClass, errorMsg);
                        break keywordLoop;
                    }
                    log.error("【{}】获取岗位卡片时发生异常: {}，停止处理", keyword, errorMsg);
                    break keywordLoop;
                }

                // 处理从 processedCount 到 currentCount 的岗位
                for (int i = processedCount; i < currentCount; i++) {
                    try {
                        // 每10个岗位记录一次进度
                        if ((i + 1) % 10 == 0) {
                            log.info("【{}】进度报告：已处理{}/{}个岗位，已用时{}秒，成功={}, 跳过={}, 失败={}",
                                keyword, i + 1, currentCount, (System.currentTimeMillis() - keywordLoopStartTime) / 1000,
                                postCount, skipCount, failCount);
                        }

                        // 检查全局超时
                        long currentTime = System.currentTimeMillis();
                        long elapsedTime = currentTime - keywordLoopStartTime;
                        if (elapsedTime > MAX_LOOP_DURATION_MS) {
                            log.warn("【{}】关键词循环超时（已运行{}分钟），停止处理剩余岗位", keyword, elapsedTime / 60000);
                            break keywordLoop;
                        }

                        // 检查是否有进展（如果超过5分钟没有进展，记录警告）
                        long timeSinceLastProgress = currentTime - lastProgressTime;
                        if (timeSinceLastProgress > 5 * 60 * 1000) { // 5分钟
                            log.warn("【{}】第{}个岗位：已超过5分钟没有进展，可能卡住。最后进展时间: {}ms前",
                                keyword, i + 1, timeSinceLastProgress);
                        }

                        log.info("【{}】正在处理第{}个岗位（共{}个，已用时{}秒）", keyword, i + 1, currentCount, elapsedTime / 1000);

                        // ✅ 修复：在重新获取卡片前检查页面状态，防止 TargetClosedError
                        try {
                            if (page == null || page.isClosed()) {
                                log.error("【{}】第{}个岗位：页面已关闭或为null，跳过并停止处理", keyword, i + 1);
                                break keywordLoop;
                            }
                        } catch (Exception e) {
                            log.error("【{}】第{}个岗位：检查页面状态时发生异常: {}，跳过并停止处理", keyword, i + 1, e.getMessage());
                            break keywordLoop;
                        }

                        // 重新获取卡片，避免元素过期
                        int actualCount;
                        try {
                            cards = searchService.getJobCards(page);
                            actualCount = cards.count();
                        } catch (com.microsoft.playwright.PlaywrightException e) {
                            // 检查是否是页面关闭相关的错误（包括 TargetClosedError）
                            String errorMsg = e.getMessage() != null ? e.getMessage() : "";
                            String errorClass = e.getClass().getName();
                            if (errorClass.contains("TargetClosed") || errorMsg.contains("closed") || errorMsg.contains("Target")) {
                                log.error("【{}】第{}个岗位：页面/浏览器已关闭（PlaywrightException: {}），停止处理: {}", keyword, i + 1, errorClass, errorMsg);
                                break keywordLoop;
                            }
                            log.error("【{}】第{}个岗位：获取岗位卡片时发生Playwright异常: {}，跳过", keyword, i + 1, errorMsg);
                            skipCount++;
                            continue;
                        } catch (Exception e) {
                            // 检查是否是页面关闭相关的错误（包括 TargetClosedError）
                            String errorMsg = e.getMessage() != null ? e.getMessage() : "";
                            String errorClass = e.getClass().getName();
                            if (errorClass.contains("TargetClosed") || errorMsg.contains("closed") || errorMsg.contains("Target")) {
                                log.error("【{}】第{}个岗位：页面/浏览器已关闭（Exception: {}），停止处理: {}", keyword, i + 1, errorClass, errorMsg);
                                break keywordLoop;
                            }
                            log.error("【{}】第{}个岗位：获取岗位卡片时发生异常: {}，跳过", keyword, i + 1, errorMsg);
                            skipCount++;
                            continue;
                        }

                        if (i >= actualCount) {
                            log.warn("【{}】第{}个岗位不存在（实际只有{}个），跳过", keyword, i + 1, actualCount);
                            skipCount++;
                            // ✅ 修复：如果岗位数量减少，更新processedCount并继续
                            if (actualCount < processedCount) {
                                processedCount = actualCount;
                            }
                            continue;
                        }

                        // 模拟人类行为后再点击
                        PlaywrightUtil.simulateMouseMove();

                        // 使用安全点击方法，自动处理登录弹窗
                        if (!deliveryService.safeClick(page, cards.nth(i), "点击岗位卡片")) {
                            log.warn("【{}】第{}个岗位：点击失败，跳过", keyword, i + 1);
                            skipCount++;
                            continue;
                        }

                        log.info("【{}】第{}个岗位：已点击，等待页面加载", keyword, i + 1);

                        // 检查页面状态
                        try {
                            if (page == null || page.isClosed()) {
                                log.error("【{}】第{}个岗位：页面对象无效（null或已关闭），跳过此岗位", keyword, i + 1);
                                skipCount++;
                                continue;
                            }
                            log.debug("【{}】第{}个岗位：页面状态正常，URL={}", keyword, i + 1, page.url());
                        } catch (Exception e) {
                            log.error("【{}】第{}个岗位：检查页面状态时异常: {}，跳过此岗位", keyword, i + 1, e.getMessage());
                            skipCount++;
                            continue;
                        }

                        // 随机延迟等待页面加载
                        PlaywrightUtil.randomSleepMillis(2000, 4000);

                        // 更新最后进展时间
                        lastProgressTime = System.currentTimeMillis();

                        // 等待详情内容加载，增加超时处理
                        long waitStartTime = System.currentTimeMillis();
                        try {
                            log.debug("【{}】第{}个岗位：开始等待详情页面加载（超时8秒）...", keyword, i + 1);
                            page.waitForSelector("div[class*='job-detail-box']", new Page.WaitForSelectorOptions().setTimeout(8000));
                            long waitDuration = System.currentTimeMillis() - waitStartTime;
                            log.info("【{}】第{}个岗位：详情页面加载完成（耗时{}ms）", keyword, i + 1, waitDuration);
                            // 更新最后进展时间
                            lastProgressTime = System.currentTimeMillis();
                        } catch (com.microsoft.playwright.TimeoutError e) {
                            long waitDuration = System.currentTimeMillis() - waitStartTime;
                            // 增强：记录页面状态信息
                            try {
                                String currentUrl = page.url();
                                String pageTitle = page.title();
                                log.error("【{}】第{}个岗位：等待详情页面超时（耗时{}ms，超时8秒）", keyword, i + 1, waitDuration);
                                log.error("  页面URL: {}", currentUrl);
                                log.error("  页面标题: {}", pageTitle);
                                log.error("  错误信息: {}", e.getMessage());
                            } catch (Exception ex) {
                                log.error("  获取页面信息失败: {}", ex.getMessage());
                            }
                            skipCount++;
                            continue;
                        } catch (com.microsoft.playwright.PlaywrightException e) {
                            long waitDuration = System.currentTimeMillis() - waitStartTime;
                            // 增强：记录页面状态信息
                            try {
                                String currentUrl = page.url();
                                String pageTitle = page.title();
                                log.error("【{}】第{}个岗位：等待详情页面时Playwright异常（耗时{}ms）", keyword, i + 1, waitDuration);
                                log.error("  页面URL: {}", currentUrl);
                                log.error("  页面标题: {}", pageTitle);
                                log.error("  错误信息: {}", e.getMessage());
                            } catch (Exception ex) {
                                log.error("  获取页面信息失败: {}", ex.getMessage());
                            }
                            skipCount++;
                            continue;
                        } catch (Exception e) {
                            long waitDuration = System.currentTimeMillis() - waitStartTime;
                            // 增强：记录页面状态信息
                            try {
                                String currentUrl = page.url();
                                String pageTitle = page.title();
                                log.error("【{}】第{}个岗位：等待详情页面时发生未知异常（耗时{}ms）", keyword, i + 1, waitDuration);
                                log.error("  页面URL: {}", currentUrl);
                                log.error("  页面标题: {}", pageTitle);
                                log.error("  错误信息: {}", e.getMessage());
                            } catch (Exception ex) {
                                log.error("  获取页面信息失败: {}", ex.getMessage());
                            }
                            skipCount++;
                            continue;
                        }

                        Locator detailBox = page.locator("div[class*='job-detail-box']");

                        // 岗位名称
                        String jobName = boss.util.BossUtils.safeText(detailBox, "span[class*='job-name']");
                        if (jobName.isEmpty()) {
                            log.warn("【{}】第{}个岗位：无法获取岗位名称，跳过", keyword, i + 1);
                            skipCount++;
                            continue;
                        }

                        // 🔧 【优先级1】二次关键词匹配检查：确保岗位名称包含用户设置的关键词之一
                        // 注意：必须在黑名单检查之前，否则"销售总监"会被黑名单直接过滤掉
                        // ✅ 改进：使用更严格的匹配规则，避免误匹配（如"市场"匹配到"市场品牌区域总厨"）
                        boolean keywordMatched = false;
                        String matchedKeyword = null;
                        double matchScore = 0.0;
                        int matchedScheme = 0;

                        for (String userKeyword : this.config.getKeywords()) {
                            boss.matcher.BossJobMatcher.MatchingResult result = jobMatcher.isKeywordMatchedWithScore(jobName, userKeyword);
                            if (result.isMatched()) {
                                keywordMatched = true;
                                matchedKeyword = userKeyword;
                                matchScore = result.getScore();
                                matchedScheme = result.getMatchedScheme();
                                break;
                            }
                        }
                        if (!keywordMatched) {
                            log.info("【{}】第{}个岗位：{}不包含任何用户设置的关键词，跳过（Boss搜索匹配不准确）", keyword, i + 1, jobName);
                            // ✅ 添加详细DEBUG日志，显示所有关键词的匹配尝试
                            log.debug("【{}】第{}个岗位：尝试匹配的关键词列表: {}", keyword, i + 1, this.config.getKeywords());
                            skipCount++;
                            continue;
                        }
                        log.info("【{}】第{}个岗位：关键词匹配成功，岗位='{}', 匹配关键词='{}', 匹配度={}%, 匹配方案=方案{}",
                            keyword, i + 1, jobName, matchedKeyword, String.format("%.1f", matchScore * 100), matchedScheme);

                        // 🔧 【优先级2】黑名单检查
                        if (blacklistService.isJobBlacklisted(jobName)) {
                            log.info("【{}】第{}个岗位：{}在黑名单中，跳过", keyword, i + 1, jobName);
                            skipCount++;
                            continue;
                        }

                        // 薪资(原始)
                        String jobSalaryRaw = boss.util.BossUtils.safeText(detailBox, "span.job-salary");
                        String jobSalary = boss.util.BossUtils.decodeSalary(jobSalaryRaw);

                        // 城市/经验/学历
                        List<String> tags = boss.util.BossUtils.safeAllText(detailBox, "ul[class*='tag-list'] > li");

                        // 岗位描述
                        String jobDesc = boss.util.BossUtils.safeText(detailBox, "p.desc");

                        // Boss姓名、活跃
                        String bossNameRaw = boss.util.BossUtils.safeText(detailBox, "h2[class*='name']");
                        String[] bossInfo = boss.util.BossUtils.splitBossName(bossNameRaw);
                        String bossName = bossInfo[0];
                        String bossActive = bossInfo[1];

                        // 🔧 修复空指针：检查deadStatus是否为null
                        if (config.getDeadStatus() != null &&
                            config.getDeadStatus().stream().anyMatch(bossActive::contains)) {
                            log.info("【{}】第{}个岗位：{}Boss状态异常，跳过", keyword, i + 1, jobName);
                            skipCount++;
                            continue;
                        }

                        // Boss公司/职位
                        String bossTitleRaw = boss.util.BossUtils.safeText(detailBox, "div[class*='boss-info-attr']");
                        String[] bossTitleInfo = boss.util.BossUtils.splitBossTitle(bossTitleRaw);
                        String bossCompany = bossTitleInfo[0];
                        // ✅ 修复：使用优化的双向匹配方法检查黑名单
                        if (blacklistService.isCompanyBlacklisted(bossCompany)) {
                            log.info("🚫 【{}】第{}个岗位：{}公司【{}】在黑名单中，跳过", keyword, i + 1, jobName, bossCompany);
                            skipCount++;
                            continue;
                        }
                        // 招聘者职位黑名单已删除（前端不支持此功能）

                        // 创建Job对象
                        Job job = new Job();
                        job.setJobName(jobName);
                        job.setSalary(jobSalary);
                        job.setJobArea(String.join(", ", tags));
                        job.setCompanyName(bossCompany);
                        job.setRecruiter(bossName);
                        job.setJobInfo(jobDesc);

                        log.info("【{}】第{}个岗位：准备投递{}，公司：{}，Boss：{}", keyword, i + 1, jobName, bossCompany, bossName);

                        // ✅ 投递策略检查（频率限制、每日限额、投递间隔等）
                        if (deliveryController != null) {
                            // 使用真实计算的匹配度分数
                            if (!this.deliveryController.canDeliver(matchScore)) {
                                log.warn("【{}】第{}个岗位：投递策略限制，匹配度={}%，跳过 - {}",
                                    keyword, i + 1, String.format("%.1f", matchScore * 100), deliveryController.getStatistics());
                                skipCount++;
                                continue;
                            }
                        }

                        // ✅ 配额检查：每次投递前检查daily_job_application配额
                        if (!quotaService.checkQuotaBeforeDelivery()) {
                            log.warn("【{}】第{}个岗位：配额不足，停止投递。用户：{}，配额：daily_job_application",
                                keyword, i + 1, this.userId);
                            log.info("⏹️ 配额已用完，停止本次投递任务。请明天再试或升级套餐。");
                            break keywordLoop; // ✅ 跳出所有投递循环（关键词循环+岗位循环），彻底停止投递
                        }

                        // 执行投递
                        log.info("🚀 开始投递岗位: {} - {}", job.getCompanyName(), job.getJobName());
                        boolean deliverySuccess = deliveryService.resumeSubmission(page, keyword, job);

                        // ✅ 修复：只在真正验证成功时消费配额和更新计数
                        if (deliverySuccess) {
                            log.info("✅ 投递验证成功，开始消费配额: {} - {}", job.getCompanyName(), job.getJobName());
                            postCount++;
                            try {
                                // ✅ 消费配额：投递成功后消费配额（添加异常处理）
                                quotaService.consumeQuotaAfterDelivery();
                                log.info("✅ 配额消费成功: userId={}, quotaKey=daily_job_application, 岗位={}",
                                    this.userId, job.getJobName());
                            } catch (Exception e) {
                                // ✅ 修复：配额消费失败时记录错误，但不影响投递流程
                                log.error("❌ 配额消费失败: userId={}, quotaKey=daily_job_application, 岗位={}, error={}",
                                    this.userId, job.getJobName(), e.getMessage());
                                // 注意：即使配额消费失败，投递已经成功，所以仍然记录投递
                            }

                            // ✅ 记录投递（更新计数器）
                            if (deliveryController != null) {
                                this.deliveryController.recordDelivery();
                            }

                            // ✅ 修复：只有在真正成功时才记录"投递完成"
                            log.info("【{}】第{}个岗位：投递完成！{}", keyword, i + 1,
                                deliveryController != null ? deliveryController.getStatistics() : "");
                        } else {
                            // ✅ 修复：投递失败时明确记录，不消费配额
                            log.warn("❌ 【{}】第{}个岗位：投递失败，不消费配额 - {} - {}",
                                keyword, i + 1, job.getCompanyName(), job.getJobName());
                            failCount++;
                        }

                        // 更新最后进展时间（投递完成）
                        lastProgressTime = System.currentTimeMillis();

                        // ✅ 应用投递间隔
                        if (deliveryController != null && i < postCount - 1) {
                            long waitTime = deliveryController.getRecommendedWaitTime();
                            log.info("⏳ 投递间隔等待: {}秒", waitTime / 1000);
                            Thread.sleep(waitTime);
                            // 更新最后进展时间（等待完成）
                            lastProgressTime = System.currentTimeMillis();
                        }

                    } catch (VerificationCodeRequiredException e) {
                        // ✅ 验证码异常：停止整个投递任务
                        log.error("⏹️ 检测到验证码验证，停止所有投递任务。岗位: {}, 原因: {}", e.getJobName(), e.getReason());
                        log.error("💡 请手动登录Boss直聘完成验证后，重新启动投递任务");

                        // 发送通知
                        behaviorLogger.sendVerificationCodeNotification(e.getJobName());

                        // ✅ 跳出所有循环，停止整个投递任务
                        break keywordLoop;
                    } catch (Exception e) {
                        log.error("【{}】第{}个岗位处理异常：{}", keyword, i + 1, e.getMessage(), e);
                        // 更新最后进展时间（即使异常也更新，表示有进展）
                        lastProgressTime = System.currentTimeMillis();
                        failCount++;
                        // 继续处理下一个岗位
                        continue;
                    }
                }

                // 更新已处理数量
                processedCount = currentCount;

                // 随机模拟人类行为
                PlaywrightUtil.simulateHumanBehavior();
            }

            long keywordLoopDuration = System.currentTimeMillis() - keywordLoopStartTime;
            log.info("【{}】岗位循环结束！", keyword);
            log.info("【{}】统计信息：总岗位数={}, 已处理={}, 已投递={}, 跳过={}, 失败={}",
                keyword, lastCount, processedCount, postCount, skipCount, failCount);
            log.info("【{}】岗位已投递完毕！已投递岗位数量:{}，总耗时: {}秒", keyword, postCount, keywordLoopDuration / 1000);
        }
    }

    public static String decodeSalary(String text) {
        Map<Character, Character> fontMap = new HashMap<>();
        fontMap.put('', '0');
        fontMap.put('', '1');
        fontMap.put('', '2');
        fontMap.put('', '3');
        fontMap.put('', '4');
        fontMap.put('', '5');
        fontMap.put('', '6');
        fontMap.put('', '7');
        fontMap.put('', '8');
        fontMap.put('', '9');
        StringBuilder result = new StringBuilder();
        for (char c : text.toCharArray()) {
            result.append(fontMap.getOrDefault(c, c));
        }
        return result.toString();
    }

    /**
     * 检查关键词是否匹配（保留原方法用于向后兼容，内部调用新方法）
     *
     * @param jobName 岗位名称
     * @param userKeyword 用户设置的关键词
     * @return 是否匹配
     */
    private boolean isKeywordMatched(String jobName, String userKeyword) {
        return jobMatcher.isKeywordMatchedWithScore(jobName, userKeyword).isMatched();
    }

    /**
     * 判断字符是否是中文字符
     *
     * @param c 字符
     * @return 是否是中文字符
     */
    private boolean isChineseChar(char c) {
        return c >= 0x4E00 && c <= 0x9FA5;
    }

    // 安全获取单个文本内容
    public static String safeText(Locator root, String selector) {
        Locator node = root.locator(selector);
        try {
            if (node.count() > 0 && node.innerText() != null) {
                return node.innerText().trim();
            }
        } catch (Exception e) {
            // ignore
        }
        return "";
    }

    // 安全获取多个文本内容
    public static List<String> safeAllText(Locator root, String selector) {
        try {
            return root.locator(selector).allInnerTexts();
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    // Boss姓名+活跃状态拆分
    public static String[] splitBossName(String raw) {
        String[] bossParts = raw.trim().split("\\s+");
        String bossName = bossParts[0];
        String bossActive = bossParts.length > 1 ? String.join(" ", Arrays.copyOfRange(bossParts, 1, bossParts.length)) : "";
        return new String[]{bossName, bossActive};
    }

    // Boss公司+职位拆分
    public static String[] splitBossTitle(String raw) {
        String[] parts = raw.trim().split(" · ");
        String company = parts[0];
        String job = parts.length > 1 ? parts[1] : "";
        return new String[]{company, job};
    }


    /**
     * 将salaryRange对象转换为URL参数格式
     * 前端格式: {minSalary: 30, maxSalary: 50, unit: "K", code: "405"}
     * URL参数格式: ["405"] (Boss API编码)
     */
    private List<String> convertSalaryRange(Map<String, Object> salaryRange) {
        if (salaryRange == null || salaryRange.isEmpty()) {
            return List.of(); // 返回空列表，让Boss使用默认
        }

        // 优先使用已转换的code（在init()中生成）
        if (salaryRange.containsKey("code")) {
            return List.of((String) salaryRange.get("code"));
        }

        // 如果没有code，尝试构建并转换
        Object minObj = salaryRange.get("minSalary");
        Object maxObj = salaryRange.get("maxSalary");

        if (minObj != null && maxObj != null) {
            String salaryStr = minObj + "K-" + maxObj + "K";
            try {
                String code = BossEnum.Salary.forValue(salaryStr).getCode();
                return List.of(code);
            } catch (Exception e) {
                log.warn("薪资范围转换失败: {}, 使用默认值", salaryStr);
                return List.of();
            }
        }

        return List.of();
    }

    /**
     * 将单个字符串转换为列表（已转换为编码）
     * 用于experienceRequirement, educationRequirement等字段
     * 注意：这些字段在init()中已经被转换为Boss API编码
     */
    private List<String> convertToList(String value) {
        if (value == null || value.isEmpty()) {
            return List.of();
        }
        return List.of(value);
    }




    private String customJsonFormat(Map<String, Set<String>> data) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\n");
        for (Map.Entry<String, Set<String>> entry : data.entrySet()) {
            sb.append("    \"").append(entry.getKey()).append("\": [\n");
            sb.append(entry.getValue().stream().map(s -> "        \"" + s + "\"").collect(Collectors.joining(",\n")));

            sb.append("\n    ],\n");
        }
        sb.delete(sb.length() - 2, sb.length());
        sb.append("\n}");
        return sb.toString();
    }

    /**
     * 从config.json的blacklistConfig读取黑名单（新方案）
     * 注意：此方法已不再使用，黑名单加载已迁移到BossBlacklistService
     *
     * @return true=成功加载, false=未找到配置
     * @Deprecated 已迁移到BossBlacklistService，保留仅用于向后兼容
     */
    @Deprecated
    private boolean loadBlacklistFromConfig() {
        try {
            String userId = System.getenv("BOSS_USER_ID");
            if (userId == null || userId.isEmpty()) {
                return false;
            }

            // ✅ 使用环境变量USER_DATA_DIR，兼容本地开发和生产环境
            String userDataBaseDir = System.getenv("USER_DATA_DIR");
            if (userDataBaseDir == null || userDataBaseDir.isEmpty()) {
                userDataBaseDir = System.getProperty("user.dir") + "/user_data";
            }
            String configPath = userDataBaseDir + "/" + userId + "/config.json";
            File configFile = new File(configPath);
            log.info("🔍 尝试加载黑名单配置文件: {}", configFile.getAbsolutePath());
            if (!configFile.exists()) {
                log.warn("⚠️ 用户配置文件不存在: {}", configFile.getAbsolutePath());
                return false;
            }
            log.info("✅ 找到配置文件，大小: {} bytes", configFile.length());

            ObjectMapper mapper = new ObjectMapper();
            @SuppressWarnings("unchecked")
            Map<String, Object> userConfig = mapper.readValue(configFile, Map.class);
            log.info("📄 成功解析JSON，顶层字段数: {}", userConfig.keySet().size());

            @SuppressWarnings("unchecked")
            Map<String, Object> blacklistConfig = (Map<String, Object>) userConfig.get("blacklistConfig");
            if (blacklistConfig == null) {
                log.warn("⚠️ 配置中没有blacklistConfig字段，顶层字段：{}", userConfig.keySet());
                return false;
            }
            log.info("📋 blacklistConfig字段数: {}", blacklistConfig.keySet().size());

            // 检查是否启用黑名单过滤
            Boolean enabled = (Boolean) blacklistConfig.get("enableBlacklistFilter");
            log.info("📝 黑名单过滤开关: enableBlacklistFilter={}", enabled);
            if (enabled == null || !enabled) {
                log.info("⚠️ 黑名单过滤已禁用");
                // 已迁移到BossBlacklistService，不再直接操作字段
                return true;
            }

            // 读取黑名单（字段名与前端统一）
            log.info("📝 读取公司黑名单: companyBlacklist={}", blacklistConfig.get("companyBlacklist"));
            log.info("📝 读取职位黑名单: positionBlacklist={}", blacklistConfig.get("positionBlacklist"));

            // 已迁移到BossBlacklistService，不再直接操作字段
            List<String> companyBlacklist = getListFromConfig(blacklistConfig, "companyBlacklist");
            List<String> positionBlacklist = getListFromConfig(blacklistConfig, "positionBlacklist");

            log.info("📋 黑名单配置加载成功:");
            log.info("  - 公司黑名单: {} 个", companyBlacklist.size());
            log.info("  - 职位黑名单: {} 个", positionBlacklist.size());

            return true;

        } catch (Exception e) {
            log.error("从config.json加载黑名单失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 从配置Map中安全获取List
     */
    @SuppressWarnings("unchecked")
    private List<String> getListFromConfig(Map<String, Object> config, String key) {
        Object value = config.get(key);
        if (value instanceof List) {
            return (List<String>) value;
        }
        return new ArrayList<>();
    }

    /**
     * @Deprecated 已迁移到 BossBlacklistService.parseJson()
     */

    /**
     * 检查公司是否在黑名单中（双向匹配优化版）
     * 支持：黑名单项包含公司名 或 公司名包含黑名单项
     *
     * @param companyName 公司名称
     * @return true=在黑名单中，false=不在黑名单中
     * @Deprecated 已迁移到 BossBlacklistService.isCompanyBlacklisted()
     */
    /**
     * @Deprecated 已迁移到 BossBlacklistService.isCompanyBlacklisted()
     * 这个方法保留作为向后兼容，实际调用已替换为 blacklistService.isCompanyBlacklisted()
     */

    /**
     * @Deprecated 已迁移到 BossDeliveryService.resumeSubmission()
     */
    @Deprecated
    @SneakyThrows
    private boolean resumeSubmission(com.microsoft.playwright.Page page, String keyword, Job job) {
        // ✅ 修复：在投递流程开始时再次检查黑名单（双重保险）
        String companyName = job.getCompanyName();
        if (blacklistService.isCompanyBlacklisted(companyName)) {
            log.warn("🚫 【黑名单拦截】公司【{}】在黑名单中，跳过投递并停止生成打招呼语。岗位：{}",
                companyName, job.getJobName());
            return false;
        }

        // 随机延迟，模拟人类思考时间
        PlaywrightUtil.randomSleepMillis(3000, 6000);

        // 1. 查找“查看更多信息”按钮（必须存在且新开页）
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
        com.microsoft.playwright.Page detailPage = null;
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
            if (!deliveryService.safeClick(detailPage, chatBtn.first(), "点击立即沟通按钮")) {
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
        // ✅ 风控优化：减少循环次数，增加延迟时间，避免高频轮询被检测
        log.info("等待聊天对话框加载...");
        log.info("当前页面URL: {}", detailPage.url());
        boolean dialogReady = false;
        for (int i = 0; i < 12; i++) {  // ✅ 风控优化：从30次减少到12次，每次延迟更长
            // ✅ 新增：每3次循环输出一次进度日志
            if (i % 3 == 0 && i > 0) {
                log.info("等待聊天对话框加载中... (第{}/12次检查)", i);
            }

            // ✅ 风控优化：精简选择器列表，只保留最常用的，减少DOM操作次数
            String[] dialogSelectors = {
                ".dialog-container",
                ".chat-dialog",
                ".chat-container",
                ".dialog-wrap",
                ".chat-wrap",
                "#chat-input",
                ".chat-input-area",
                "div[contenteditable='true']",
                "textarea.input-area"
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

            // ✅ 风控优化：增加延迟时间范围，从1-2秒增加到3-6秒，模拟人类等待行为
            PlaywrightUtil.randomSleepMillis(3000, 6000);

            // ✅ 风控优化：每次循环都执行一些人类行为模拟
            PlaywrightUtil.simulateHumanBehavior();
        }

        if (!dialogReady) {
            log.warn("聊天对话框未出现，尝试备用方案: {}", job.getJobName());

            // 尝试备用方案：使用JavaScript直接发送消息
            // ✅ 修复：tryAlternativeMessageSending() 内部已经调用了 verifyMessageSent() 进行验证
            // 如果返回 true，说明已经验证成功，直接信任结果，不再进行二次验证
            boolean alternativeSuccess = deliveryService.tryAlternativeMessageSending(detailPage, job, keyword);
            if (alternativeSuccess) {
                // ✅ 修复：备用方案内部已经验证过，直接信任结果
                log.info("✅ 备用方案执行并验证成功，投递完成: {}", job.getJobName());

                // ✅ 修复：备用方案成功时也添加到结果列表（在主流程中会处理配额消费）
                // 注意：resultList 的添加和配额消费在主流程中统一处理，这里只返回 true
                detailPage.close();
                return true;
            } else {
                log.warn("❌ 备用方案执行失败: {}", job.getJobName());
                detailPage.close();
                return false;
            }
        }

        // 6. 等待聊天输入框（更新选择器）
        // ✅ 风控优化：减少循环次数和选择器数量
        log.info("等待聊天输入框加载...");

        // ✅ 风控优化：精简选择器列表，只保留最常用的
        String[] dialogInputSelectors = {
            ".dialog-container [contenteditable='true']",
            ".dialog-container .editor",
            ".dialog-container .input-area",
            ".dialog-container .chat-input",
            ".dialog-container textarea",
            ".dialog-container .dialog-input"
        };

        // ✅ 风控优化：精简全局选择器列表
        String[] inputSelectors = {
            // Boss直聘最新选择器（优先级最高）
            "div.dialog-input[contenteditable='true']",
            "div[contenteditable='true'][role='textbox']",
            "div.dialog-input",
            "div[class*='dialog-input']",
            "div#chat-input.chat-input[contenteditable='true']",
            "textarea.input-area",
            "div[contenteditable='true']",
            ".chat-input",
            ".input-area",
            ".dialog-input",
            "textarea"
        };

        Locator inputLocator = null;
        boolean inputReady = false;

        // ✅ 风控优化：从20次减少到10次，增加延迟时间
        for (int i = 0; i < 10; i++) {
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
                deliveryService.captureDebugScreenshot(detailPage, job);

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
                // 注意：这里需要keyword参数，但原方法没有，使用默认值
                boolean alternativeSuccess = deliveryService.tryAlternativeMessageSending(detailPage, job, keyword);
                if (alternativeSuccess) {
                    log.info("✅ 备用方案成功，投递完成: {}", job.getJobName());
                    // ✅ 修复：备用方案成功时也添加到结果列表（在主流程中会处理配额消费）
                    // 注意：resultList 的添加和配额消费在主流程中统一处理，这里只返回 true
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

        // ✅ 修复：在使用 inputLocator 前添加 null 检查，防止 NullPointerException
        if (inputLocator == null || !inputReady) {
            log.error("❌ 聊天输入框未找到（inputLocator为null或inputReady为false），无法输入打招呼语: {}", job.getJobName());
            detailPage.close();
            return false;
        }

        // 7. 输入打招呼语
        // ✅ 风控优化：使用更真实的输入方式
        Locator input = inputLocator.first();

        // ✅ 风控优化：模拟人类行为：先移动鼠标到输入框附近
        PlaywrightUtil.simulateMouseMove();
        PlaywrightUtil.randomSleepMillis(500, 1200);

        // 点击获得焦点
        input.click();

        // ✅ 风控优化：增加思考时间，模拟人类阅读和思考
        PlaywrightUtil.randomSleepMillis(2000, 5000);

        // 使用已经找到的input元素进行输入，而不是重新查找
        try {
            // 先聚焦到元素
            input.focus();
            PlaywrightUtil.randomSleepMillis(800, 1500);

            // 清空现有内容
            input.clear();
            PlaywrightUtil.randomSleepMillis(400, 800);

            // ✅ 风控优化：使用逐字符输入，模拟真实打字
            java.util.Random random = new java.util.Random();
            int charCount = 0;
            for (char c : message.toCharArray()) {
                // 基础延迟：80-200ms
                int baseDelay = 80 + random.nextInt(120);

                // 标点符号打字稍慢
                if (!Character.isLetterOrDigit(c)) {
                    baseDelay = (int) (baseDelay * 1.4);
                }

                // 空格后有时会稍微停顿
                if (c == ' ' && random.nextInt(3) == 0) {
                    PlaywrightUtil.randomSleepMillis(100, 400);
                }

                // 输入单个字符
                input.pressSequentially(String.valueOf(c),
                    new com.microsoft.playwright.Locator.PressSequentiallyOptions().setDelay(baseDelay));

                charCount++;

                // 每输入15-25个字符，随机停顿一下（模拟思考或检查）
                if (charCount % (random.nextInt(11) + 15) == 0) {
                    PlaywrightUtil.randomSleepMillis(400, 1200);
                }
            }

            // 输入完成后的检查停顿
            PlaywrightUtil.randomSleepMillis(800, 2000);

            log.info("已成功输入打招呼语（逐字输入）: {}", message);
        } catch (Exception e) {
            log.error("逐字输入打招呼语失败，尝试备用方法: {}", e.getMessage());
            // 备用方案：使用fill（不推荐，但作为fallback）
            try {
                input.fill(message);
                log.info("使用fill方法输入打招呼语: {}", message);
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
                URL resourceUrl = Boss.class.getResource("/resume.jpg");
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
        // ✅ 风控优化：点击发送按钮前增加更多人类行为
        Locator sendBtn = detailPage.locator("div.send-message, button[type='send'].btn-send, button.btn-send");
        boolean sendSuccess = false;
        if (sendBtn.count() > 0) {
            // ✅ 风控优化：发送前模拟检查消息内容（真实用户会检查一下）
            PlaywrightUtil.randomSleepMillis(1500, 3500);

            // 模拟人类行为：移动鼠标到发送按钮
            PlaywrightUtil.simulateMouseMove();
            PlaywrightUtil.randomSleepMillis(500, 1200);

            // 点击发送
            sendBtn.first().click();

            // ✅ 风控优化：发送后增加等待时间，从2-4秒增加到4-8秒
            PlaywrightUtil.randomSleepMillis(4000, 8000);

            // ✅ 修复：验证消息是否真正发送成功（在关闭页面之前验证）
            log.info("🔍 开始验证消息是否真正发送成功: {}", job.getJobName());
            boolean messageVerified = deliveryService.verifyMessageSent(detailPage);

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

            // ✅ 风控优化：关闭后增加更长的随机延迟，从3-6秒增加到5-12秒
            // 模拟真实用户在投递后会稍作休息或浏览其他内容
            PlaywrightUtil.randomSleepMillis(5000, 12000);

            // ✅ 风控优化：投递后执行一些随机人类行为
            PlaywrightUtil.simulateHumanBehavior();

            // 10. 成功投递加入结果
            // ✅ 修复：只有在真正验证成功时才添加到结果列表和消费配额
            if (sendSuccess) {
                this.resultList.add(job);

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
     * 通过HTTP API记录用户行为（供后台任务调用）
     * @Deprecated 已迁移到 BossBehaviorLogger.logBehavior()
     */

    /**
     * 发送验证码通知
     * 当检测到验证码时，通知用户需要手动处理
     * @Deprecated 已迁移到 BossBehaviorLogger.sendVerificationCodeNotification()
     */

    public static boolean isValidString(String str) {
        return str != null && !str.isEmpty();
    }

    public static Boolean sendResume(String company) {
        log.warn("sendResume方法已废弃，请直接在主逻辑中使用playwright实现文件上传");
        return false;
    }

    /**
     * 检查岗位薪资是否符合预期
     *
     * @return boolean
     * true 不符合预期
     * false 符合预期
     * 期望的最低薪资如果比岗位最高薪资还小，则不符合（薪资给的太少）
     * 期望的最高薪资如果比岗位最低薪资还小，则不符合(要求太高满足不了)
     * @Deprecated 已迁移到 BossJobMatcher.isSalaryNotExpected()
     */

    /**
     * 是否存在有效的期望薪资范围
     */
    private static boolean hasExpectedSalary(List<Integer> expectedSalary) {
        return expectedSalary != null && !expectedSalary.isEmpty();
    }

    /**
     * 去掉年终奖信息，如 "·15薪"、"·13薪"。
     */
    private static String removeYearBonusText(String salary) {
        if (salary.contains("薪")) {
            // 使用正则去除 "·任意数字薪"
            return salary.replaceAll("·\\d+薪", "");
        }
        return salary;
    }

    /**
     * 判断是否是按天计薪，如发现 "元/天" 则认为是日薪
     */
    private static String detectJobType(String salary) {
        if (salary.contains("元/天")) {
            return "day";
        }
        return "mouth";
    }

    /**
     * 如果是日薪，则去除 "元/天"
     */
    private static String removeDayUnitIfNeeded(String salary) {
        if (salary.contains("元/天")) {
            return salary.replaceAll("元/天", "");
        }
        return salary;
    }

    private static Integer getMinimumSalary(List<Integer> expectedSalary) {
        return expectedSalary != null && !expectedSalary.isEmpty() ? expectedSalary.get(0) : null;
    }

    private static Integer getMaximumSalary(List<Integer> expectedSalary) {
        return expectedSalary != null && expectedSalary.size() > 1 ? expectedSalary.get(1) : null;
    }

    private static boolean isSalaryInExpectedFormat(String salaryText) {
        return salaryText.contains("K") || salaryText.contains("k") || salaryText.contains("元/天");
    }

    private static String cleanSalaryText(String salaryText) {
        salaryText = salaryText.replace("K", "").replace("k", "");
        int dotIndex = salaryText.indexOf('·');
        if (dotIndex != -1) {
            salaryText = salaryText.substring(0, dotIndex);
        }
        return salaryText;
    }

    private static boolean isSalaryOutOfRange(Integer[] jobSalary, Integer miniSalary, Integer maxSalary,
                                              String jobType) {
        if (jobSalary == null) {
            return true;
        }
        if (miniSalary == null) {
            return false;
        }
        if (Objects.equals("day", jobType)) {
            // 期望薪资转为平均每日的工资
            maxSalary = BigDecimal.valueOf(maxSalary).multiply(BigDecimal.valueOf(1000))
                    .divide(BigDecimal.valueOf(21.75), 0, RoundingMode.HALF_UP).intValue();
            miniSalary = BigDecimal.valueOf(miniSalary).multiply(BigDecimal.valueOf(1000))
                    .divide(BigDecimal.valueOf(21.75), 0, RoundingMode.HALF_UP).intValue();
        }
        // 如果职位薪资下限低于期望的最低薪资，返回不符合
        if (jobSalary[1] < miniSalary) {
            return true;
        }
        // 如果职位薪资上限高于期望的最高薪资，返回不符合
        return maxSalary != null && jobSalary[0] > maxSalary;
    }

    private static void randomWait() {
        PlaywrightUtil.sleep(JobUtils.getRandomNumberInRange(3, 20));
    }

    private static void simulateWait() {
        com.microsoft.playwright.Page page = PlaywrightUtil.getPageObject();
        for (int i = 0; i < 3; i++) {
            page.keyboard().press(" ");
            PlaywrightUtil.sleep(1);
        }
        page.keyboard().press("Control+Home");
        PlaywrightUtil.sleep(1);
    }

    /**
     * @Deprecated 已迁移到 BossJobMatcher.isDeadHR()
     */

    public static boolean containsDeadStatus(String activeTimeText, List<String> deadStatus) {
        for (String status : deadStatus) {
            if (activeTimeText.contains(status)) {
                return true;// 一旦找到包含的值，立即返回 true
            }
        }
        return false;// 如果没有找到，返回 false
    }

    private String getCompanyAndHR(com.microsoft.playwright.Page page) {
        Locator recruiterLocator = page.locator(RECRUITER_INFO);
        if (recruiterLocator.count() > 0) {
            return recruiterLocator.textContent().replaceAll("%n", "");
        }
        return "未知公司和HR";
    }

    private void closeWindow(ArrayList<String> tabs) {
        log.warn("closeWindow方法已废弃，请使用playwright的page.close()方法");
        // 该方法已废弃，在playwright中直接使用page.close()
    }

    private AiFilter checkJob(String keyword, String jobName, String jd) {
        AiConfig aiConfig = AiConfig.init();
        String requestMessage = String.format(aiConfig.getPrompt(), aiConfig.getIntroduce(), jd, aiConfig.getGreetingStyle());
        String result = AiService.sendRequest(requestMessage);
        return result.contains("false") ? new AiFilter(false) : new AiFilter(true, result);
    }

    /**
     * 生成打招呼语消息
     * 优先使用智能AI生成，失败时回退到默认招呼语
     * @Deprecated 已迁移到 BossGreetingService.generateGreetingMessage()
     */

    /**
     * 抓取完整岗位描述（详情页）
     * 包括：职位详情、岗位职责、任职要求等所有文本
     * @Deprecated 已迁移到 BossGreetingService.extractFullJobDescription()
     */

    private static Integer[] parseSalaryRange(String salaryText) {
        try {
            return Arrays.stream(salaryText.split("-")).map(s -> s.replaceAll("[^0-9]", "")) // 去除非数字字符
                    .map(Integer::parseInt) // 转换为Integer
                    .toArray(Integer[]::new); // 转换为Integer数组
        } catch (Exception e) {
            log.error("薪资解析异常！{}", e.getMessage(), e);
        }
        return new Integer[0];
    }

    private boolean isLimit(com.microsoft.playwright.Page page) {
        try {
            PlaywrightUtil.sleep(1);
            Locator dialogLocator = page.locator(DIALOG_CON);
            if (dialogLocator.count() > 0) {
                String text = dialogLocator.textContent();
                return text.contains("已达上限");
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 检查页面是否存在登录弹窗
     * @param page 页面对象
     * @return 是否存在登录弹窗
     */
    /**
     * @Deprecated 已迁移到 BossLoginService.checkLoginDialogPresent()
     */

    /**
     * 检查并关闭登录弹窗
     * @param page 页面对象
     * @return 是否关闭了弹窗
     */
    /**
     * @Deprecated 已迁移到 BossLoginService.checkAndCloseLoginDialog()
     */

    /**
     * 等待并处理登录弹窗
     * @param page 页面对象
     * @param maxWaitSeconds 最大等待时间（秒）
     * @return 是否成功处理了弹窗
     */
    /**
     * @Deprecated 已迁移到 BossLoginService.waitAndHandleLoginDialog()
     */

    /**
     * 安全的点击操作，会自动处理登录弹窗
     * @param page 页面对象
     * @param locator 要点击的元素定位器
     * @param description 操作描述（用于日志）
     * @return 是否点击成功
     */
    /**
     * @Deprecated 已迁移到 BossDeliveryService.safeClick()
     */

    /**
     * 尝试备用方案发送消息
     * @param page 页面对象
     * @param job 岗位信息
     * @return 是否发送成功
     * @Deprecated 已迁移到 BossDeliveryService.tryAlternativeMessageSending()
     */

    /**
     * 验证消息是否真正发送成功
     * ✅ 修复：添加更严格的验证逻辑，确保消息真正发送成功
     * @param page 页面对象
     * @return 是否发送成功
     * @Deprecated 已迁移到 BossDeliveryService.verifyMessageSent()
     */

    /**
     * 截图诊断聊天页面
     * @param page 页面对象
     * @param job 岗位信息
     * @Deprecated 已迁移到 BossDeliveryService.captureDebugScreenshot()
     */

    /**
     * @Deprecated 已迁移到 BossLoginService.login()
     */
    @Deprecated
    @SneakyThrows
    private void login(boolean loginOnly) {
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

        com.microsoft.playwright.Page page = PlaywrightUtil.getPageObject();
        page.navigate(homeUrl);
        PlaywrightUtil.sleep(1);

        // 检查滑块验证 - 已迁移到BossLoginService，这里保留作为向后兼容
        // waitForSliderVerify(page); // 已迁移

        // 如果Cookie有效，加载Cookie
        if (!needLogin) {
            PlaywrightUtil.loadCookies(cookiePath);
            page.reload();
            PlaywrightUtil.sleep(2);
            // waitForSliderVerify(page); // 已迁移到BossLoginService

            // 检查是否出现强制登录弹窗（运行时Cookie失效）
            boolean hasLoginDialog = loginService.checkLoginDialogPresent(page);
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
                loginService.scanLogin();

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
            }
        } else {
            // Cookie无效，需要登录
            log.info("需要登录，启动登录流程...");

            // ✅ 恢复：在扫码登录前启用反检测（Nov 7版本的逻辑）
            PlaywrightUtil.initStealth();
            log.info("✅ 已启用反检测模式");

            loginService.scanLogin();

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
     * @Deprecated 已迁移到 BossLoginService.waitForSliderVerify()
     */


    /**
     * @Deprecated 已迁移到 BossLoginService.isLoginRequired()
     */

    /**
     * @Deprecated 已迁移到 BossLoginService.scanLogin()
     */
    @Deprecated
    @SneakyThrows
    private void scanLogin() {
        // 访问登录页面
        com.microsoft.playwright.Page page = PlaywrightUtil.getPageObject();
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
                        boolean cookieCountIncreased = false;
                        String cookieChangeHint = "";

                        // 检测Cookie数量变化（手机端扫码后Cookie数量可能会增加）
                        if (previousCookieCountRef[0] > 0 && currentCookieCount > previousCookieCountRef[0]) {
                            cookieCountIncreased = true;
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
                            if (elapsedSeconds >= 30 && elapsedSeconds % 60 == 0) {
                                log.info("   💡 提示：如果您已在手机上扫码并确认登录，请稍等片刻，系统正在检测Cookie...");
                                log.info("   💡 如果长时间未响应，系统会在60秒后自动刷新页面以同步Cookie");
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
                            // 1. 等待至少60秒后才考虑刷新（给手机端用户更多时间确认）
                            // 2. 每隔60秒刷新一次（不要频繁刷新）
                            // 3. 刷新后等待更长时间（5秒）让页面完全加载
                            // 4. 刷新后重新截图二维码（如果还在登录页）
                            if (elapsedSeconds >= 60 && elapsedSeconds % 60 == 0 && cookies.size() <= 10) {
                                log.warn("⚠️ Cookie数量未增加（{}个），已等待{}秒，尝试刷新页面触发Cookie设置（手机端扫码后可能需要刷新才能同步Cookie）...",
                                    cookies.size(), elapsedSeconds);

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
                                        log.info("⚠️ 刷新后仍在登录页，重新截图二维码...");

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

                                            // 更新状态为waiting（可能需要重新扫码）
                                            String statusFile = System.getProperty("java.io.tmpdir") + File.separator + "boss_login_status_" + safeUserId + ".txt";
                                            Files.write(Paths.get(statusFile), "waiting".getBytes(StandardCharsets.UTF_8));

                                        } catch (Exception e) {
                                            log.warn("重新截图二维码失败: {}", e.getMessage());
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
                            if (this.userId != null && !this.userId.isEmpty()) {
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
     * 在指定的毫秒数内等待用户输入回车；若在等待时间内用户按回车则返回 true，否则返回 false。
     *
     * @param scanner 用于读取控制台输入
     * @return 用户是否在指定时间内按回车
     */
    private boolean waitForUserInputOrTimeout(Scanner scanner) {
        long end = System.currentTimeMillis() + 2000;
        while (System.currentTimeMillis() < end) {
            try {
                // 判断输入流中是否有可用字节
                if (System.in.available() > 0) {
                    // 读取一行（用户输入）
                    scanner.nextLine();
                    return true;
                }
            } catch (IOException e) {
                // 读取输入流异常，直接忽略
            }

            // 小睡一下，避免 CPU 空转
            PlaywrightUtil.sleep(1);
        }
        return false;
    }

    /**
     * 转换简历格式，将resume.json的格式转换为SmartGreetingService期望的格式
     *
     * @param resumeData 从resume.json文件读取的原始数据
     * @return 转换后的候选人信息Map
     */
    @SuppressWarnings("unchecked")
    private static Map<String, Object> convertResumeFormat(Map<String, Object> resumeData) {
        Map<String, Object> candidate = new HashMap<>();

        // 提取resume子对象
        Map<String, Object> resume = (Map<String, Object>) resumeData.get("resume");

        // 【新增】如果没有resume子对象，说明是candidate_resume.json格式（扁平化结构）
        if (resume == null) {
            log.debug("【简历转换】检测到扁平化简历格式（candidate_resume.json），直接使用");
            // candidate_resume.json已经是正确的格式，直接返回
            return resumeData;
        }

        // 映射字段：position -> current_title
        String position = (String) resume.get("position");
        candidate.put("current_title", position != null ? position : "未知职位");

        // 映射字段：experience -> years_experience (提取数字)
        String experience = (String) resume.get("experience");
        if (experience != null) {
            // 从"10年以上"中提取数字
            String yearsStr = experience.replaceAll("[^0-9]", "");
            candidate.put("years_experience", yearsStr.isEmpty() ? "10" : yearsStr);
        } else {
            candidate.put("years_experience", "10");
        }

        // 映射字段：skills -> skills (直接复制)
        List<String> skills = (List<String>) resume.get("skills");
        candidate.put("skills", skills != null ? skills : new ArrayList<String>());

        // 映射字段：achievements -> core_strengths (成就作为核心优势)
        List<String> achievements = (List<String>) resume.get("achievements");
        candidate.put("core_strengths", achievements != null ? achievements : new ArrayList<String>());

        // 添加其他可用字段
        String name = (String) resume.get("name");
        if (name != null) {
            candidate.put("name", name);
        }

        String education = (String) resume.get("education");
        if (education != null) {
            candidate.put("education", education);
        }

        String location = (String) resume.get("location");
        if (location != null) {
            candidate.put("location", location);
        }

        log.debug("【简历转换】成功转换简历格式: position={}, experience={}, skills={}, achievements={}",
            position, experience,
            skills != null ? skills.size() : 0,
            achievements != null ? achievements.size() : 0
        );

        return candidate;
    }

    /**
     * 匹配结果内部类
     * 用于返回匹配结果和匹配度分数
     */

    /**
     * 检查关键词是否匹配（支持配置化匹配方案，返回匹配度和匹配方案）
     *
     * @param jobName 岗位名称
     * @param userKeyword 用户设置的关键词
     * @return 匹配结果，包含是否匹配、匹配度分数、匹配成功的方案编号
     * @Deprecated 已迁移到 BossJobMatcher.isKeywordMatchedWithScore()
     */

    /**
     * 投递前检查配额
     * 检查daily_job_application配额是否足够
     *
     * 由于Boss在独立进程中运行，无法使用Spring Bean，因此通过JDBC直接查询数据库
     *
     * @return true表示配额足够，可以投递；false表示配额不足，需要停止投递
     * @Deprecated 已迁移到 BossQuotaService.checkQuotaBeforeDelivery()
     */

    /**
     * 通过JDBC直接查询数据库检查配额
     *
     * @return true表示配额足够，可以投递；false表示配额不足
     * @Deprecated 已迁移到 BossQuotaService.checkQuotaByJDBC()
     */

    /**
     * 投递成功后消费配额
     * 消费daily_job_application配额
     *
     * 由于Boss在独立进程中运行，无法使用Spring Bean，因此通过JDBC直接更新数据库
     * @Deprecated 已迁移到 BossQuotaService.consumeQuotaAfterDelivery()
     */

    /**
     * 通过JDBC直接更新数据库消费配额
     * @Deprecated 已迁移到 BossQuotaService.consumeQuotaByJDBC()
     */

}
