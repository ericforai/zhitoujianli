package boss;

import static boss.Locators.CHAT_LIST_ITEM;
import static boss.Locators.COMPANY_NAME_IN_CHAT;
import static boss.Locators.DIALOG_CON;
import static boss.Locators.ERROR_PAGE_LOGIN;
import static boss.Locators.FINISHED_TEXT;
import static boss.Locators.HR_ACTIVE_TIME;
import static boss.Locators.JOB_LIST_CONTAINER;
import static boss.Locators.LAST_MESSAGE;
import static boss.Locators.LOGIN_BTN;
import static boss.Locators.LOGIN_BTNS;
import static boss.Locators.LOGIN_SCAN_SWITCH;
import static boss.Locators.PAGE_HEADER;
import static boss.Locators.RECRUITER_INFO;
import static boss.Locators.SCROLL_LOAD_MORE;
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
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Scanner;
import java.util.Set;
import java.util.stream.Collectors;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

import ai.AiConfig;
import ai.AiFilter;
import ai.AiService;
import ai.SmartGreetingService;
import lombok.SneakyThrows;
import utils.Job;
import utils.JobUtils;
import utils.PlaywrightUtil;

/**
 * @author loks666
 * 项目链接: <a href=
 * "https://github.com/loks666/get_jobs">https://github.com/loks666/get_jobs</a>
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
    private Set<String> blackCompanies;
    private Set<String> blackJobs;
    private List<Job> resultList;
    private DeliveryController deliveryController;
    private Date startDate;

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
        this.blackCompanies = new HashSet<>();
        this.blackJobs = new HashSet<>();

        // 加载数据
        loadData(this.dataPath);

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
        return "/opt/zhitoujianli/backend/user_data" + File.separator + safeUserId + File.separator + "blacklist.json";
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
            login(loginOnly);

            // 执行投递（如果不是只登录模式）
            if (!loginOnly) {
                log.info("开始执行自动投递任务...");
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
        saveData(this.dataPath);
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
        String searchUrl = getSearchUrl(cityCode);
        for (String keyword : this.config.getKeywords()) {
            int postCount = 0;
            // 使用 URLEncoder 对关键词进行编码
            String encodedKeyword = URLEncoder.encode(keyword, StandardCharsets.UTF_8);

            String url = searchUrl + "&query=" + encodedKeyword;
            log.info("投递地址:{}", searchUrl + "&query=" + keyword);
            com.microsoft.playwright.Page page = PlaywrightUtil.getPageObject();

            // 使用标准导航方法，避免超时问题
            page.navigate(url);

            // 导航后模拟人类行为
            PlaywrightUtil.randomSleepMillis(3000, 6000);
            PlaywrightUtil.simulateHumanBehavior();

            // 1. 滚动到底部，加载所有岗位卡片
            int lastCount = -1;
            while (true) {
                // 模拟人类滚动行为
                PlaywrightUtil.simulateScroll();

                // 滑动到底部
                page.evaluate("window.scrollTo(0, document.body.scrollHeight);");

                // 随机延迟等待加载
                PlaywrightUtil.randomSleepMillis(2000, 4000);

                // 获取所有卡片数
                Locator cards = page.locator("//ul[contains(@class, 'rec-job-list')]//li[contains(@class, 'job-card-box')]");
                int currentCount = cards.count();

                // 判断是否继续滑动
                if (currentCount == lastCount) {
                    break; // 没有新内容，跳出循环
                }
                lastCount = currentCount;

                // 随机模拟人类行为
                PlaywrightUtil.simulateHumanBehavior();
            }
            log.info("【{}】岗位已全部加载，总数:{}", keyword, lastCount);

            // 2. 回到页面顶部
            page.evaluate("window.scrollTo(0, 0);");
            PlaywrightUtil.randomSleepMillis(1000, 2000);

            // 3. 逐个遍历所有岗位
            log.info("【{}】开始遍历岗位列表，总计{}个岗位", keyword, lastCount);
            Locator cards = page.locator("//ul[contains(@class, 'rec-job-list')]//li[contains(@class, 'job-card-box')]");
            int count = cards.count();

            // 确保count正确
            if (count != lastCount) {
                log.warn("【{}】列表计数不一致！定位器找到{}个，加载时有{}个", keyword, count, lastCount);
                count = Math.min(count, lastCount);
            }

            for (int i = 0; i < count; i++) {
                try {
                    log.info("【{}】正在处理第{}个岗位（共{}个）", keyword, i + 1, count);

                    // 重新获取卡片，避免元素过期
                    cards = page.locator("//ul[contains(@class, 'rec-job-list')]//li[contains(@class, 'job-card-box')]");

                    if (i >= cards.count()) {
                        log.warn("【{}】第{}个岗位不存在，跳过", keyword, i + 1);
                        continue;
                    }

                    // 模拟人类行为后再点击
                    PlaywrightUtil.simulateMouseMove();

                    // 使用安全点击方法，自动处理登录弹窗
                    if (!safeClick(page, cards.nth(i), "点击岗位卡片")) {
                        log.warn("【{}】第{}个岗位：点击失败，跳过", keyword, i + 1);
                        continue;
                    }

                    log.info("【{}】第{}个岗位：已点击，等待页面加载", keyword, i + 1);

                    // 随机延迟等待页面加载
                    PlaywrightUtil.randomSleepMillis(2000, 4000);

                    // 等待详情内容加载，增加超时处理
                    try {
                        page.waitForSelector("div[class*='job-detail-box']", new Page.WaitForSelectorOptions().setTimeout(8000));
                        log.info("【{}】第{}个岗位：详情页面加载完成", keyword, i + 1);
                    } catch (Exception e) {
                        log.error("【{}】第{}个岗位：等待详情页面超时，跳过此岗位", keyword, i + 1);
                        continue;
                    }

                    Locator detailBox = page.locator("div[class*='job-detail-box']");

                    // 岗位名称
                    String jobName = safeText(detailBox, "span[class*='job-name']");
                    if (jobName.isEmpty()) {
                        log.warn("【{}】第{}个岗位：无法获取岗位名称，跳过", keyword, i + 1);
                        continue;
                    }
                    if (blackJobs.stream().anyMatch(jobName::contains)) {
                        log.info("【{}】第{}个岗位：{}在黑名单中，跳过", keyword, i + 1, jobName);
                        continue;
                    }

                    // 薪资(原始)
                    String jobSalaryRaw = safeText(detailBox, "span.job-salary");
                    String jobSalary = decodeSalary(jobSalaryRaw);

                    // 城市/经验/学历
                    List<String> tags = safeAllText(detailBox, "ul[class*='tag-list'] > li");

                    // 岗位描述
                    String jobDesc = safeText(detailBox, "p.desc");

                    // Boss姓名、活跃
                    String bossNameRaw = safeText(detailBox, "h2[class*='name']");
                    String[] bossInfo = splitBossName(bossNameRaw);
                    String bossName = bossInfo[0];
                    String bossActive = bossInfo[1];

                    // 🔧 修复空指针：检查deadStatus是否为null
                    if (config.getDeadStatus() != null &&
                        config.getDeadStatus().stream().anyMatch(bossActive::contains)) {
                        log.info("【{}】第{}个岗位：{}Boss状态异常，跳过", keyword, i + 1, jobName);
                        continue;
                    }

                    // Boss公司/职位
                    String bossTitleRaw = safeText(detailBox, "div[class*='boss-info-attr']");
                    String[] bossTitleInfo = splitBossTitle(bossTitleRaw);
                    String bossCompany = bossTitleInfo[0];
                    if (blackCompanies.stream().anyMatch(bossCompany::contains)) {
                        log.info("【{}】第{}个岗位：{}公司{}在黑名单中，跳过", keyword, i + 1, jobName, bossCompany);
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
                        // 暂时使用匹配度1.0（未实现AI匹配时的默认值）
                        // TODO: 后续集成AI匹配度评分
                        if (!this.deliveryController.canDeliver(1.0)) {
                            log.warn("【{}】第{}个岗位：投递策略限制，跳过 - {}", keyword, i + 1, deliveryController.getStatistics());
                            continue;
                        }
                    }

                    // 执行投递
                    resumeSubmission(page, keyword, job);
                    postCount++;

                    // ✅ 记录投递（更新计数器）
                    if (deliveryController != null) {
                        this.deliveryController.recordDelivery();
                    }

                    log.info("【{}】第{}个岗位：投递完成！{}", keyword, i + 1,
                        deliveryController != null ? deliveryController.getStatistics() : "");

                    // ✅ 应用投递间隔
                    if (deliveryController != null && i < postCount - 1) {
                        long waitTime = deliveryController.getRecommendedWaitTime();
                        log.info("⏳ 投递间隔等待: {}秒", waitTime / 1000);
                        Thread.sleep(waitTime);
                    }

                } catch (Exception e) {
                    log.error("【{}】第{}个岗位处理异常：{}", keyword, i + 1, e.getMessage(), e);
                    // 继续处理下一个岗位
                    continue;
                }
            }
            log.info("【{}】岗位已投递完毕！已投递岗位数量:{}", keyword, postCount);
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

    private boolean isJobsPresent() {
        try {
            // 判断页面是否存在岗位的元素
            PlaywrightUtil.waitForElement(JOB_LIST_CONTAINER);
            return true;
        } catch (Exception e) {
            log.error("加载岗位区块失败:{}", e.getMessage());
            return false;
        }
    }

    private String getSearchUrl(String cityCode) {
        return this.baseUrl + JobUtils.appendParam("city", cityCode) +
                JobUtils.appendParam("jobType", this.config.getJobType()) +
                JobUtils.appendListParam("salary", convertSalaryRange(this.config.getSalaryRange())) +
                JobUtils.appendListParam("experience", convertToList(config.getExperienceRequirement())) +
                JobUtils.appendListParam("degree", convertToList(config.getEducationRequirement())) +
                JobUtils.appendListParam("scale", config.getCompanySize()) +
                JobUtils.appendListParam("industry", config.getIndustry()) +
                JobUtils.appendListParam("stage", config.getFinancingStage());
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

    private void saveData(String path) {
        try {
            updateListData();
            Map<String, Set<String>> data = new HashMap<>();
            data.put("blackCompanies", blackCompanies);
            data.put("blackJobs", blackJobs);
            String json = customJsonFormat(data);
            Files.write(Paths.get(path), json.getBytes(StandardCharsets.UTF_8));
        } catch (IOException e) {
            log.error("保存【{}】数据失败！", path);
        }
    }

    private void updateListData() {
        com.microsoft.playwright.Page page = PlaywrightUtil.getPageObject();
        page.navigate("https://www.zhipin.com/web/geek/chat");
        PlaywrightUtil.sleep(3);

        boolean shouldBreak = false;
        while (!shouldBreak) {
            try {
                Locator bottomLocator = page.locator(FINISHED_TEXT);
                if (bottomLocator.count() > 0 && "没有更多了".equals(bottomLocator.textContent())) {
                    shouldBreak = true;
                }
            } catch (Exception ignore) {
            }

            Locator items = page.locator(CHAT_LIST_ITEM);
            int itemCount = items.count();

            for (int i = 0; i < itemCount; i++) {
                try {
                    Locator companyElements = page.locator(COMPANY_NAME_IN_CHAT);
                    Locator messageElements = page.locator(LAST_MESSAGE);

                    if (i >= companyElements.count() || i >= messageElements.count()) {
                        break;
                    }

                    String companyName = null;
                    String message = null;
                    int retryCount = 0;

                    while (retryCount < 2) {
                        try {
                            companyName = companyElements.nth(i).textContent();
                            message = messageElements.nth(i).textContent();
                            break;
                        } catch (Exception e) {
                            retryCount++;
                            if (retryCount >= 2) {
                                log.info("尝试获取元素文本2次失败，放弃本次获取");
                                break;
                            }
                            log.info("页面元素已变更，正在重试第{}次获取元素文本...", retryCount);
                            PlaywrightUtil.sleep(1);
                        }
                    }

                    if (companyName != null && message != null) {
                        boolean match = message.contains("不") || message.contains("感谢") || message.contains("但")
                                || message.contains("遗憾") || message.contains("需要本") || message.contains("对不");
                        boolean nomatch = message.contains("不是") || message.contains("不生");
                        if (match && !nomatch) {
                            log.info("黑名单公司：【{}】，信息：【{}】", companyName, message);
                            if (blackCompanies.stream().anyMatch(companyName::contains)) {
                                continue;
                            }
                            companyName = companyName.replaceAll("\\.{3}", "");
                            if (companyName.matches(".*(\\p{IsHan}{2,}|[a-zA-Z]{4,}).*")) {
                                this.blackCompanies.add(companyName);
                            }
                        }
                    }
                } catch (Exception e) {
                    log.error("寻找黑名单公司异常...", e);
                }
            }

            try {
                Locator scrollElement = page.locator(SCROLL_LOAD_MORE);
                if (scrollElement.count() > 0) {
                    scrollElement.scrollIntoViewIfNeeded();
                } else {
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight);");
                }
            } catch (Exception e) {
                log.error("滚动元素出错", e);
                break;
            }
        }
        log.info("黑名单公司数量：{}", blackCompanies.size());
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
     * 加载黑名单数据
     * ⚠️ 优先从config.json的blacklistConfig读取，向后兼容blacklist.json
     */
    private void loadData(String path) {
        try {
            // ✅ 优先从config.json读取黑名单（与前端统一）
            if (loadBlacklistFromConfig()) {
                log.info("✅ 已从config.json加载黑名单配置");
                return;
            }

            // 备用方案：从旧版blacklist.json读取（向后兼容）
            String json = new String(Files.readAllBytes(Paths.get(path)), StandardCharsets.UTF_8);
            parseJson(json);
            log.info("✅ 已从blacklist.json加载黑名单（向后兼容）");
        } catch (IOException e) {
            log.warn("读取黑名单数据失败：{}，使用空黑名单", e.getMessage());
            // 初始化为空集合
            this.blackCompanies = new HashSet<>();
            this.blackJobs = new HashSet<>();
        }
    }

    /**
     * 从config.json的blacklistConfig读取黑名单（新方案）
     *
     * @return true=成功加载, false=未找到配置
     */
    private boolean loadBlacklistFromConfig() {
        try {
            String userId = System.getenv("BOSS_USER_ID");
            if (userId == null || userId.isEmpty()) {
                return false;
            }

            // ✅ 使用绝对路径，统一配置目录到 /opt/zhitoujianli/backend/user_data
            String configPath = "/opt/zhitoujianli/backend/user_data/" + userId + "/config.json";
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
                this.blackCompanies = new HashSet<>();
                this.blackJobs = new HashSet<>();
                return true;
            }

            // 读取黑名单（字段名与前端统一）
            log.info("📝 读取公司黑名单: companyBlacklist={}", blacklistConfig.get("companyBlacklist"));
            log.info("📝 读取职位黑名单: positionBlacklist={}", blacklistConfig.get("positionBlacklist"));

            this.blackCompanies = new HashSet<>(getListFromConfig(blacklistConfig, "companyBlacklist"));
            this.blackJobs = new HashSet<>(getListFromConfig(blacklistConfig, "positionBlacklist"));

            log.info("📋 黑名单配置加载成功:");
            log.info("  - 公司黑名单: {} 个", blackCompanies.size());
            log.info("  - 职位黑名单: {} 个", blackJobs.size());

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

    private void parseJson(String json) {
        JSONObject jsonObject = new JSONObject(json);
        this.blackCompanies = jsonObject.getJSONArray("blackCompanies").toList().stream().map(Object::toString)
                .collect(Collectors.toSet());
        this.blackJobs = jsonObject.getJSONArray("blackJobs").toList().stream().map(Object::toString)
                .collect(Collectors.toSet());
    }

    @SneakyThrows
    private void resumeSubmission(com.microsoft.playwright.Page page, String keyword, Job job) {
        // 随机延迟，模拟人类思考时间
        PlaywrightUtil.randomSleepMillis(3000, 6000);

        // 1. 查找“查看更多信息”按钮（必须存在且新开页）
        Locator moreInfoBtn = page.locator("a.more-job-btn");
        if (moreInfoBtn.count() == 0) {
            log.warn("未找到“查看更多信息”按钮，跳过...");
            return;
        }
        // 强制用js新开tab
        String href = moreInfoBtn.first().getAttribute("href");
        if (href == null || !href.startsWith("/job_detail/")) {
            log.warn("未获取到岗位详情链接，跳过...");
            return;
        }
        String detailUrl = "https://www.zhipin.com" + href;

        // 2. 新开详情页，添加异常处理
        com.microsoft.playwright.Page detailPage = null;
        try {
            detailPage = page.context().newPage();

            // 使用标准导航方法，添加超时设置
            detailPage.navigate(detailUrl);

            // 导航后模拟人类行为
            PlaywrightUtil.randomSleepMillis(2000, 4000);
            PlaywrightUtil.simulateHumanBehavior();
        } catch (Exception e) {
            log.error("创建详情页失败：{}", e.getMessage());
            if (detailPage != null) {
                try {
                    detailPage.close();
                } catch (Exception ex) {
                    // 忽略关闭异常 - 页面可能已经被关闭或出现其他非关键错误
                    log.debug("关闭详情页面时出现异常，已忽略: {}", ex.getMessage());
                }
            }
            return;
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
                detailPage.close();
                return;
            }
            // 模拟人类行为后点击
            PlaywrightUtil.simulateMouseMove();

            // 使用安全点击方法，自动处理登录弹窗
            if (!safeClick(detailPage, chatBtn.first(), "点击立即沟通按钮")) {
                log.warn("点击立即沟通按钮失败，跳过岗位: {}", job.getJobName());
                detailPage.close();
                return;
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
            return;
        }

        // 4. 抓取完整岗位JD（详情页）
        String fullJobDescription = extractFullJobDescription(detailPage);
        log.info("【完整JD】岗位: {}, JD长度: {}字", job.getJobName(), fullJobDescription != null ? fullJobDescription.length() : 0);

        // 5. 等待聊天对话框出现
        log.info("等待聊天对话框加载...");
        log.info("当前页面URL: {}", detailPage.url());
        boolean dialogReady = false;
        for (int i = 0; i < 30; i++) {  // 增加等待次数到30次
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
                ".chat-content"
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
            log.warn("聊天对话框未出现，尝试备用方案: {}", job.getJobName());

                // 尝试备用方案：使用JavaScript直接发送消息
                boolean alternativeSuccess = tryAlternativeMessageSending(detailPage, job);
                if (alternativeSuccess) {
                    // 检查是否真的有消息发送成功（需要进一步验证）
                    log.info("备用方案执行成功，但需要验证是否真正投递: {}", job.getJobName());

                    // 等待一段时间观察页面变化
                    PlaywrightUtil.sleep(2);

                    // 检查是否有成功提示或页面变化
                    String currentUrl = detailPage.url();
                    if (currentUrl.contains("/chat/") || currentUrl.contains("/im/") ||
                        detailPage.locator(".success, .sent, [class*='success'], [class*='sent']").count() > 0) {
                        log.info("✅ 备用方案验证成功，投递完成: {}", job.getJobName());
                        detailPage.close();
                        return;
                    } else {
                        log.warn("⚠️ 备用方案执行但未验证投递成功，可能失败: {}", job.getJobName());
                    }
                } else {
                    log.warn("备用方案执行失败: {}", job.getJobName());
                }

                log.warn("所有方案都失败，跳过投递: {}", job.getJobName());
            detailPage.close();
            return;
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
            "div#chat-input[contenteditable='true']",
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
                if (tryAlternativeMessageSending(detailPage, job)) {
                    log.info("备用方案成功，投递完成: {}", job.getJobName());
                    detailPage.close();
                    return;
                }

            } catch (Exception e) {
                log.warn("获取调试信息失败: {}", e.getMessage());
            }

            log.warn("所有方案都失败，跳过: {}", job.getJobName());
            detailPage.close();
            return;
        }

        // 7. 生成打招呼语（智能AI生成 或 默认）
        String message = generateGreetingMessage(keyword, job, fullJobDescription);
        if (message == null || message.trim().isEmpty()) {
            log.warn("打招呼语为空，跳过: {}", job.getJobName());
            detailPage.close();
            return;
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
                return;
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
        Locator sendBtn = detailPage.locator("div.send-message, button[type='send'].btn-send, button.btn-send");
        boolean sendSuccess = false;
        if (sendBtn.count() > 0) {
            // 模拟人类行为后发送
            PlaywrightUtil.simulateMouseMove();
            sendBtn.first().click();

            // 发送后随机延迟
            PlaywrightUtil.randomSleepMillis(2000, 4000);
            sendSuccess = true;
        } else {
            log.warn("未找到发送按钮，自动跳过！岗位：{}", job.getJobName());
        }

        log.info("投递完成 | 岗位：{} | 招呼语：{} | 图片简历：{}", job.getJobName(), message, imgResume ? "已发送" : "未发送");

        // 9. 关闭详情页，回到主页面，增加异常处理
        try {
            detailPage.close();

            // 关闭后随机延迟，模拟人类操作间隔
            PlaywrightUtil.randomSleepMillis(3000, 6000);

            // 10. 成功投递加入结果
            if (sendSuccess) {
                this.resultList.add(job);
            }
        } catch (Exception e) {
            log.error("关闭详情页异常：{}", e.getMessage());
        }
    }

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
     */
    private boolean isSalaryNotExpected(String salary) {
        try {
            // 1. 如果没有期望薪资范围，直接返回 false，表示"薪资并非不符合预期"
            List<Integer> expectedSalary = this.config.getExpectedSalary();
            if (!hasExpectedSalary(expectedSalary)) {
                return false;
            }

            // 2. 清理薪资文本（比如去掉 "·15薪"）
            salary = removeYearBonusText(salary);

            // 3. 如果薪资格式不符合预期（如缺少 "K" / "k"），直接返回 true，表示"薪资不符合预期"
            if (!isSalaryInExpectedFormat(salary)) {
                return true;
            }

            // 4. 进一步清理薪资文本，比如去除 "K"、"k"、"·" 等
            salary = cleanSalaryText(salary);

            // 5. 判断是 "月薪" 还是 "日薪"
            String jobType = detectJobType(salary);
            salary = removeDayUnitIfNeeded(salary); // 如果是按天，则去除 "元/天"

            // 6. 解析薪资范围并检查是否超出预期
            Integer[] jobSalaryRange = parseSalaryRange(salary);
            return isSalaryOutOfRange(jobSalaryRange,
                    getMinimumSalary(expectedSalary),
                    getMaximumSalary(expectedSalary),
                    jobType);

        } catch (Exception e) {
            log.error("岗位薪资获取异常！薪资文本【{}】,异常信息【{}】", salary, e.getMessage(), e);
            // 出错时，您可根据业务需求决定返回 true 或 false
            // 这里假设出错时无法判断，视为不满足预期 => 返回 true
            return true;
        }
    }

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

    private boolean isDeadHR(com.microsoft.playwright.Page page) {
        if (this.config.getFilterDeadHR() == null || !this.config.getFilterDeadHR()) {
            return false;
        }
        try {
            // 尝试获取 HR 的活跃时间
            Locator activeTimeLocator = page.locator(HR_ACTIVE_TIME);
            if (activeTimeLocator.count() > 0) {
                String activeTimeText = activeTimeLocator.textContent();
                log.info("{}：{}", getCompanyAndHR(page), activeTimeText);
                // 如果 HR 活跃状态符合预期，则返回 true
                // 🔧 修复空指针：如果deadStatus未配置，默认不过滤
                if (config.getDeadStatus() == null || config.getDeadStatus().isEmpty()) {
                    return false; // 未配置deadStatus，不过滤任何HR
                }
                return containsDeadStatus(activeTimeText, config.getDeadStatus());
            }
        } catch (Exception e) {
            log.info("没有找到【{}】的活跃状态, 默认此岗位将会投递...", getCompanyAndHR(page));
        }
        return false;
    }

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
     */
    private String generateGreetingMessage(String keyword, Job job, String fullJobDescription) {
        String defaultGreeting = this.config.getDefaultGreeting();
        String sayHi = (defaultGreeting != null ? defaultGreeting : "").replaceAll("[\\r\\n]", "");

        // 检查是否启用智能打招呼
        if (config.getEnableSmartGreeting() == null || !config.getEnableSmartGreeting()) {
            log.info("【打招呼语】智能打招呼未启用，使用默认招呼语");
            return sayHi;
        }

        // 支持多种用户ID格式和文件名（candidate_resume.json优先）
        // 获取用户ID（优先级：系统属性 > 环境变量）
        String userId = System.getProperty("boss.user.id");
        if (userId == null || userId.isEmpty()) {
            userId = System.getenv("BOSS_USER_ID");
        }
        if (userId == null || userId.isEmpty()) {
            // ❌ 不再使用default_user fallback（多租户隔离要求）
            log.error("【打招呼语】❌ 未提供用户ID（boss.user.id或BOSS_USER_ID），无法生成智能打招呼语");
            log.warn("【打招呼语】降级使用默认招呼语");
            return sayHi; // 直接返回默认打招呼语，不尝试读取简历
        }

        // 修复用户ID转换逻辑：luwenrong123_sina_com -> luwenrong123@sina.com
        // 策略：将最后一个_com替换为.com，将倒数第二个_替换为@
        String emailUserId = userId;
        if (userId.contains("_")) {
            // 先替换域名部分：_com -> .com, _cn -> .cn, _net -> .net等
            emailUserId = userId.replaceAll("_(com|cn|net|org|edu|gov)$", ".$1");
            // 然后替换最后一个_为@（邮箱的@符号）
            int lastUnderscoreIndex = emailUserId.lastIndexOf("_");
            if (lastUnderscoreIndex > 0) {
                emailUserId = emailUserId.substring(0, lastUnderscoreIndex) + "@" + emailUserId.substring(lastUnderscoreIndex + 1);
            }
        }

        // ✅ 使用绝对路径查找简历文件（修复路径查找失败问题）
        // 优先使用环境变量，否则使用默认路径
        String userDataBaseDir = System.getenv("USER_DATA_DIR");
        if (userDataBaseDir == null || userDataBaseDir.isEmpty()) {
            // 备用方案：使用工作目录 + user_data
            String workDir = System.getProperty("user.dir");
            if (workDir != null && new File(workDir + "/user_data").exists()) {
                userDataBaseDir = workDir + "/user_data";
            } else {
                // 最终备用方案：使用生产环境绝对路径
                userDataBaseDir = "/opt/zhitoujianli/backend/user_data";
            }
        }

        log.info("【打招呼语】当前工作目录: {}", System.getProperty("user.dir"));
        log.info("【打招呼语】用户数据目录: {}", userDataBaseDir);

        String[] possiblePaths = {
            userDataBaseDir + "/" + userId + "/candidate_resume.json",  // 原始格式：luwenrong123_sina_com
            userDataBaseDir + "/" + emailUserId + "/candidate_resume.json",  // 邮箱格式：luwenrong123@sina.com
            userDataBaseDir + "/" + userId + "/resume.json",  // 兼容旧格式
            userDataBaseDir + "/" + emailUserId + "/resume.json"  // 邮箱格式旧文件名
        };

        File resumeFile = null;
        String resumePath = null;
        for (String path : possiblePaths) {
            File file = new File(path);
            log.debug("【打招呼语】尝试路径: {} (绝对路径: {}, 存在: {})",
                path, file.getAbsolutePath(), file.exists());
            if (file.exists()) {
                resumeFile = file;
                resumePath = path;
                log.info("【打招呼语】✅ 找到简历文件: {} (绝对路径: {})", path, file.getAbsolutePath());
                break;
            }
        }

        if (resumeFile == null) {
            log.error("【打招呼语】❌ 未找到简历文件，已尝试的路径: {}", String.join(", ", possiblePaths));
            log.error("【打招呼语】绝对路径列表: {}",
                Arrays.stream(possiblePaths)
                    .map(p -> new File(p).getAbsolutePath())
                    .collect(Collectors.joining(", ")));
            log.warn("【打招呼语】降级使用默认招呼语");
            return sayHi;
        }

        try {
            // 直接从文件加载候选人信息
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> resumeData = mapper.readValue(resumeFile, Map.class);
            if (resumeData == null) {
                log.warn("【打招呼语】简历文件为空，使用默认招呼语");
                return sayHi;
            }

            // 转换简历格式以匹配SmartGreetingService的期望格式
            Map<String, Object> candidate = convertResumeFormat(resumeData);

            log.info("【简历信息】职位: {}, 工作年限: {}, 技能数: {}, 核心优势数: {}",
                candidate.get("current_title"),
                candidate.get("years_experience"),
                candidate.get("skills") != null ? ((List<?>)candidate.get("skills")).size() : 0,
                candidate.get("core_strengths") != null ? ((List<?>)candidate.get("core_strengths")).size() : 0
            );

            // 使用完整JD生成智能打招呼语
            String smartGreeting = SmartGreetingService.generateSmartGreeting(
                candidate,
                job.getJobName(),
                fullJobDescription
            );

            if (smartGreeting != null && !smartGreeting.trim().isEmpty()) {
                log.info("【智能打招呼】成功生成，长度: {}字", smartGreeting.length());
                return smartGreeting;
            } else {
                log.warn("【智能打招呼】生成失败或超时，使用默认招呼语");
                return sayHi;
            }

        } catch (Exception e) {
            log.error("【智能打招呼】异常，使用默认招呼语: {}", e.getMessage(), e);
            return sayHi;
        }
    }

    /**
     * 抓取完整岗位描述（详情页）
     * 包括：职位详情、岗位职责、任职要求等所有文本
     */
    private String extractFullJobDescription(com.microsoft.playwright.Page detailPage) {
        try {
            StringBuilder fullJD = new StringBuilder();

            // 等待岗位详情区域加载
            detailPage.waitForSelector("div.job-detail-section", new com.microsoft.playwright.Page.WaitForSelectorOptions().setTimeout(5000));

            // 抓取所有岗位详情文本块
            Locator jobDetailSections = detailPage.locator("div.job-sec-text");
            int sectionCount = jobDetailSections.count();

            log.info("【完整JD】找到{}个详情文本块", sectionCount);

            for (int i = 0; i < sectionCount; i++) {
                String sectionText = jobDetailSections.nth(i).textContent();
                if (sectionText != null && !sectionText.trim().isEmpty()) {
                    fullJD.append(sectionText.trim()).append("%n%n");
                }
            }

            // 如果没有抓到内容，尝试其他选择器
            if (fullJD.length() == 0) {
                log.warn("【完整JD】未找到job-sec-text，尝试备用选择器");

                // 备用选择器1: 职位描述区域
                Locator jobDescArea = detailPage.locator("div.job-detail-content");
                if (jobDescArea.count() > 0) {
                    String desc = jobDescArea.first().textContent();
                    if (desc != null && !desc.trim().isEmpty()) {
                        fullJD.append(desc.trim());
                    }
                }

                // 备用选择器2: 整个详情区域
                if (fullJD.length() == 0) {
                    Locator wholeDetailArea = detailPage.locator("div.job-detail-section");
                    if (wholeDetailArea.count() > 0) {
                        String allText = wholeDetailArea.first().textContent();
                        if (allText != null && !allText.trim().isEmpty()) {
                            fullJD.append(allText.trim());
                        }
                    }
                }
            }

            String result = fullJD.toString().trim();

            if (result.isEmpty()) {
                log.warn("【完整JD】未能抓取到任何岗位描述内容");
                return "";
            }

            log.info("【完整JD】抓取成功，总长度: {}字", result.length());
            return result;

        } catch (Exception e) {
            log.error("【完整JD】抓取失败: {}", e.getMessage());
            return "";
        }
    }

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
    private boolean checkLoginDialogPresent(com.microsoft.playwright.Page page) {
        try {
            // 检查是否存在登录弹窗遮罩
            Locator loginMask = page.locator(Locators.LOGIN_DIALOG_MASK);
            if (loginMask.count() > 0 && loginMask.first().isVisible()) {
                log.info("检测到登录弹窗存在");
                return true;
            }

            // 检查是否存在登录对话框
            Locator loginDialog = page.locator(Locators.LOGIN_DIALOG);
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
     * @param page 页面对象
     * @return 是否关闭了弹窗
     */
    private boolean checkAndCloseLoginDialog(com.microsoft.playwright.Page page) {
        try {
            // 检查是否存在登录弹窗遮罩
            Locator loginMask = page.locator(Locators.LOGIN_DIALOG_MASK);
            if (loginMask.count() > 0 && loginMask.first().isVisible()) {
                log.info("检测到登录弹窗，尝试关闭...");

                // 尝试点击关闭按钮
                Locator closeBtn = page.locator(Locators.LOGIN_DIALOG_CLOSE);
                if (closeBtn.count() > 0 && closeBtn.first().isVisible()) {
                    log.info("找到关闭按钮，点击关闭登录弹窗");
                    closeBtn.first().click();
                    PlaywrightUtil.sleep(1);
                    return true;
                }

                // 尝试点击取消按钮
                Locator cancelBtn = page.locator(Locators.LOGIN_CANCEL_BTN);
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
     * @param page 页面对象
     * @param maxWaitSeconds 最大等待时间（秒）
     * @return 是否成功处理了弹窗
     */
    private boolean waitAndHandleLoginDialog(com.microsoft.playwright.Page page, int maxWaitSeconds) {
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

    /**
     * 安全的点击操作，会自动处理登录弹窗
     * @param page 页面对象
     * @param locator 要点击的元素定位器
     * @param description 操作描述（用于日志）
     * @return 是否点击成功
     */
    private boolean safeClick(com.microsoft.playwright.Page page, Locator locator, String description) {
        try {
            // 点击前检查并处理登录弹窗
            if (checkAndCloseLoginDialog(page)) {
                log.info("{}前检测到登录弹窗，已关闭", description);
                PlaywrightUtil.sleep(1);
            }

            // 执行点击
            locator.click();
            log.info("{}成功", description);

            // 点击后再次检查登录弹窗
            if (checkAndCloseLoginDialog(page)) {
                log.info("{}后检测到登录弹窗，已关闭", description);
            }

            return true;
        } catch (Exception e) {
            log.error("{}失败: {}", description, e.getMessage());
            return false;
        }
    }

    /**
     * 尝试备用方案发送消息
     * @param page 页面对象
     * @param job 岗位信息
     * @return 是否发送成功
     */
    private boolean tryAlternativeMessageSending(com.microsoft.playwright.Page page, Job job) {
        try {
            log.info("尝试备用方案发送消息: {}", job.getJobName());

            // 获取打招呼语
            String fullJobDescription = extractFullJobDescription(page);
            String message = generateGreetingMessage("市场总监", job, fullJobDescription);

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
                    try {
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

                        let inputElement = null;

                        // 尝试找到输入框
                        for (const selector of inputSelectors) {
                            const elements = document.querySelectorAll(selector);
                            for (const el of elements) {
                                if (el.offsetParent !== null) { // 元素可见
                                    inputElement = el;
                                    console.log('找到输入框:', selector);
                                    break;
                                }
                            }
                            if (inputElement) break;
                        }

                        if (!inputElement) {
                            console.log('未找到输入框');
                            return {success: false, message: '未找到输入框'};
                        }

                // 清空输入框并输入消息
                inputElement.focus();
                inputElement.value = '';
                inputElement.textContent = '';

                // 触发输入事件
                const inputEvent = new Event('input', { bubbles: true });
                const changeEvent = new Event('change', { bubbles: true });

                if (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT') {
                    inputElement.value = "%s";
                    inputElement.dispatchEvent(inputEvent);
                    inputElement.dispatchEvent(changeEvent);
                } else {
                    inputElement.textContent = "%s";
                    inputElement.dispatchEvent(inputEvent);
                    inputElement.dispatchEvent(changeEvent);
                }

                        // 尝试找到发送按钮并点击
                        const sendSelectors = [
                            'button[type="submit"]',
                            'button[type="send"]',
                            '.send-btn',
                            '.submit-btn',
                            '[class*="send"]',
                            '[class*="submit"]'
                        ];

                        let sendButton = null;
                        for (const selector of sendSelectors) {
                            const buttons = document.querySelectorAll(selector);
                            for (const btn of buttons) {
                                if (btn.offsetParent !== null && btn.disabled === false) {
                                    const btnText = btn.textContent || btn.innerText || '';
                                    if (btnText.includes('发送') || btnText.includes('提交') || btnText.includes('确定')) {
                                        sendButton = btn;
                                        console.log('找到发送按钮:', selector, btnText);
                                        break;
                                    }
                                }
                            }
                            if (sendButton) break;
                        }

                        if (sendButton) {
                            sendButton.click();
                            console.log('点击发送按钮成功');
                            return {success: true, message: '点击发送按钮成功'};
                        } else {
                            // 尝试按回车键发送
                            const keyEvent = new KeyboardEvent('keydown', {
                                key: 'Enter',
                                code: 'Enter',
                                keyCode: 13,
                                bubbles: true
                            });
                            inputElement.dispatchEvent(keyEvent);
                            console.log('尝试回车键发送');
                            return {success: true, message: '尝试回车键发送'};
                        }
                    } catch (error) {
                        console.error('备用方案执行错误:', error);
                        return {success: false, message: error.message};
                    }
                })()
                """, escapedMessage, escapedMessage);

            // 执行JavaScript
            Object result = page.evaluate(script);
            log.info("备用方案执行结果: {}", result);

            // 等待消息发送完成并验证
            PlaywrightUtil.sleep(3);

            // 验证消息是否真正发送成功
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
     * @param page 页面对象
     * @return 是否发送成功
     */
    private boolean verifyMessageSent(com.microsoft.playwright.Page page) {
        try {
            // 等待页面更新
            PlaywrightUtil.sleep(2);

            // 检查是否有成功发送的提示
            String[] successSelectors = {
                ".message-sent",
                ".sent-success",
                "[class*='sent']",
                "[class*='success']",
                ".chat-message:last-child",
                ".message-item:last-child"
            };

            for (String selector : successSelectors) {
                Locator element = page.locator(selector);
                if (element.count() > 0 && element.first().isVisible()) {
                    log.info("找到发送成功标识: {}", selector);
                    return true;
                }
            }

            // 检查页面URL是否跳转到聊天页面
            String currentUrl = page.url();
            if (currentUrl.contains("/chat/") || currentUrl.contains("/im/") || currentUrl.contains("/message/")) {
                log.info("页面已跳转到聊天页面，消息可能已发送: {}", currentUrl);
                return true;
            }

            // 检查是否有错误提示
            String[] errorSelectors = {
                ".error-message",
                ".send-failed",
                "[class*='error']",
                "[class*='fail']"
            };

            for (String selector : errorSelectors) {
                Locator element = page.locator(selector);
                if (element.count() > 0 && element.first().isVisible()) {
                    String errorText = element.first().textContent();
                    log.warn("发现发送错误提示: {} - {}", selector, errorText);
                    return false;
                }
            }

            // 如果都没有找到明确的成功或失败标识，但备用方案执行成功，则认为是成功的
            log.info("未找到明确的发送状态标识，但备用方案执行成功，认为消息已发送");
            return true;

        } catch (Exception e) {
            log.error("验证消息发送状态失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 截图诊断聊天页面
     * @param page 页面对象
     * @param job 岗位信息
     */
    private void captureDebugScreenshot(com.microsoft.playwright.Page page, Job job) {
        try {
            String timestamp = new java.text.SimpleDateFormat("yyyyMMdd_HHmmss").format(new java.util.Date());
            String filename = String.format(System.getProperty("java.io.tmpdir") + File.separator + "boss_debug_%s_%s.png",
                job.getJobName().replaceAll("[^a-zA-Z0-9]", "_"),
                timestamp);

            page.screenshot(new com.microsoft.playwright.Page.ScreenshotOptions()
                .setPath(java.nio.file.Paths.get(filename))
                .setFullPage(true));

            log.info("📸 已截图保存: {}", filename);
        } catch (Exception e) {
            log.warn("截图失败: {}", e.getMessage());
        }
    }

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

    private void waitForSliderVerify(com.microsoft.playwright.Page page) {
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


    private boolean isLoginRequired() {
        try {
            com.microsoft.playwright.Page page = PlaywrightUtil.getPageObject();
            Locator buttonLocator = page.locator(LOGIN_BTNS);
            if (buttonLocator.count() > 0 && buttonLocator.textContent().contains("登录")) {
                return true;
            }
        } catch (Exception e) {
            try {
                com.microsoft.playwright.Page page = PlaywrightUtil.getPageObject();
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
                        log.info("🔍 登录检测 - URL: {}, Cookie数量: {}, 已等待: {}秒", currentUrl, cookies.size(), elapsedSeconds);

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
                            // ✅ 新增：如果Cookie数量一直是9个，尝试刷新页面（Boss可能需要刷新才能设置Cookie）
                            if (elapsedSeconds > 0 && elapsedSeconds % 30 == 0 && cookies.size() <= 10) {
                                log.warn("⚠️ Cookie数量未增加（{}个），尝试刷新页面触发Cookie设置...", cookies.size());
                                page.reload();
                                PlaywrightUtil.sleep(2);
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

}
