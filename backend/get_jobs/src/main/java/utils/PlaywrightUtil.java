package utils;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.TimeUnit;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import com.microsoft.playwright.PlaywrightException;
import com.microsoft.playwright.options.Cookie;
import com.microsoft.playwright.options.LoadState;
import com.microsoft.playwright.options.SelectOption;

/**
 * Playwright工具类，提供浏览器自动化相关的功能
 */
public class PlaywrightUtil {
    private static final Logger log = LoggerFactory.getLogger(PlaywrightUtil.class);

    // 线程安全的随机数生成器（修复SpotBugs问题）
    private static final Random RANDOM = new Random();

    /**
     * 设备类型枚举
     */
    public enum DeviceType {
        DESKTOP, // 桌面设备
        MOBILE // 移动设备
    }

    // 默认设备类型
    private static DeviceType defaultDeviceType = DeviceType.DESKTOP;

    // Playwright实例
    private static Playwright PLAYWRIGHT;

    // 浏览器实例
    private static Browser BROWSER;

    // 桌面浏览器上下文
    private static BrowserContext DESKTOP_CONTEXT;

    // 当前头模式状态
    private static boolean HEADLESS_MODE = true;

    // 是否已初始化
    private static boolean INITIALIZED = false;

    // 移动设备浏览器上下文
    private static BrowserContext MOBILE_CONTEXT;

    // 桌面浏览器页面
    private static Page DESKTOP_PAGE;

    // 移动设备浏览器页面
    private static Page MOBILE_PAGE;

    // 默认超时时间（毫秒）
    private static final int DEFAULT_TIMEOUT = 30000;

    // 默认等待时间（毫秒）
    private static final int DEFAULT_WAIT_TIME = 10000;

    // 随机延迟范围（毫秒）
    private static final int MIN_RANDOM_DELAY = 2000;
    private static final int MAX_RANDOM_DELAY = 5000;

    // 人类行为模拟延迟范围（毫秒）
    private static final int MIN_HUMAN_DELAY = 500;
    private static final int MAX_HUMAN_DELAY = 2000;

    /**
     * 初始化Playwright及浏览器实例
     * @param headless 是否使用无头模式
     */
    public static void init(boolean headless) {
        HEADLESS_MODE = headless;

        // 如果已经初始化且头模式相同，直接返回
        if (INITIALIZED && (BROWSER == null || BROWSER.isConnected())) {
            log.info("Playwright已初始化，当前头模式: {}", HEADLESS_MODE ? "无头" : "有头");
            return;
        }

        // 清理现有实例
        cleanup();

        // 启动Playwright
        PLAYWRIGHT = Playwright.create();

        // 尝试使用系统Chrome路径
        String chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
        java.io.File chromeFile = new java.io.File(chromePath);

        BrowserType.LaunchOptions options = new BrowserType.LaunchOptions()
                .setHeadless(HEADLESS_MODE) // 动态头模式
                .setSlowMo(100) // 增加操作延迟，模拟人类行为
                .setArgs(Arrays.asList(
                    "--disable-blink-features=AutomationControlled",
                    "--disable-dev-shm-usage",
                    "--no-sandbox",
                    "--disable-gpu",
                    "--disable-web-security",
                    "--disable-features=VizDisplayCompositor",
                    "--disable-extensions",
                    "--disable-plugins",
                    "--disable-images",
                    "--disable-javascript",
                    "--disable-default-apps",
                    "--disable-background-timer-throttling",
                    "--disable-backgrounding-occluded-windows",
                    "--disable-renderer-backgrounding"
                ));

        // 如果有头模式，添加显示相关参数
        if (!HEADLESS_MODE) {
            options.setArgs(Arrays.asList(
                "--disable-blink-features=AutomationControlled",
                "--disable-web-security",
                "--disable-features=VizDisplayCompositor",
                "--no-first-run",
                "--no-default-browser-check"
            ));
        }

        if (chromeFile.exists()) {
            options.setExecutablePath(java.nio.file.Paths.get(chromePath));
            log.info("使用系统Chrome浏览器: {}, 头模式: {}", chromePath, HEADLESS_MODE ? "无头" : "有头");
        } else {
            log.info("系统Chrome不存在，使用Playwright默认浏览器, 头模式: {}", HEADLESS_MODE ? "无头" : "有头");
        }

        // 创建浏览器实例
        BROWSER = PLAYWRIGHT.chromium().launch(options);

        // 创建桌面浏览器上下文
        DESKTOP_CONTEXT = BROWSER.newContext(new Browser.NewContextOptions()
                .setViewportSize(1920, 1080)
                .setUserAgent(
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
                .setDeviceScaleFactor(1.0)
                .setHasTouch(false)
                .setIsMobile(false)
                .setLocale("zh-CN")
                .setTimezoneId("Asia/Shanghai")
                .setGeolocation(39.9042, 116.4074) // 北京坐标
                .setPermissions(Arrays.asList("geolocation")));

        // 创建移动设备浏览器上下文
        MOBILE_CONTEXT = BROWSER.newContext(new Browser.NewContextOptions()
                .setViewportSize(375, 812)
                .setDeviceScaleFactor(3.0)
                .setIsMobile(true)
                .setHasTouch(true)
                .setUserAgent(
                        "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"));

        // 创建桌面页面
        DESKTOP_PAGE = DESKTOP_CONTEXT.newPage();
        DESKTOP_PAGE.setDefaultTimeout(DEFAULT_TIMEOUT);

        INITIALIZED = true;
        log.info("Playwright初始化完成，头模式: {}", HEADLESS_MODE ? "无头" : "有头");
    }

    /**
     * 初始化Playwright及浏览器实例（使用默认无头模式）
     */
    public static void init() {
        init(true); // 默认使用无头模式
    }

    /**
     * 切换头模式
     * @param headless 是否使用无头模式
     */
    public static void switchHeadlessMode(boolean headless) {
        if (HEADLESS_MODE == headless) {
            log.info("头模式未改变: {}", headless ? "无头" : "有头");
            return;
        }

        log.info("切换头模式: {} -> {}", HEADLESS_MODE ? "无头" : "有头", headless ? "无头" : "有头");
        init(headless);
    }

    /**
     * 切换到无头模式
     */
    public static void switchToHeadless() {
        switchHeadlessMode(true);
    }

    /**
     * 切换到有头模式
     */
    public static void switchToHeaded() {
        switchHeadlessMode(false);
    }

    /**
     * 获取当前头模式状态
     */
    public static boolean isHeadless() {
        return HEADLESS_MODE;
    }

    /**
     * 清理Playwright资源
     */
    public static void cleanup() {
        try {
            if (DESKTOP_PAGE != null) {
                DESKTOP_PAGE.close();
                DESKTOP_PAGE = null;
            }
            if (DESKTOP_CONTEXT != null) {
                DESKTOP_CONTEXT.close();
                DESKTOP_CONTEXT = null;
            }
            if (MOBILE_CONTEXT != null) {
                MOBILE_CONTEXT.close();
                MOBILE_CONTEXT = null;
            }
            if (BROWSER != null) {
                BROWSER.close();
                BROWSER = null;
            }
            if (PLAYWRIGHT != null) {
                PLAYWRIGHT.close();
                PLAYWRIGHT = null;
            }
            INITIALIZED = false;
            log.info("Playwright资源已清理");
        } catch (Exception e) {
            log.error("清理Playwright资源时出错", e);
        }
    }

//        // 启用JavaScript捕获控制台日志（用于调试）
//        DESKTOP_PAGE.onConsoleMessage(message -> {
//            if (message.type().equals("error")) {
//                log.error("Browser console error: {}", message.text());
//            }
//        });

    /**
     * 设置默认设备类型
     *
     * @param deviceType 设备类型
     */
    public static void setDefaultDeviceType(DeviceType deviceType) {
        defaultDeviceType = deviceType;
        log.info("已设置默认设备类型为: {}", deviceType);
    }

    /**
     * 获取当前页面（基于当前设备类型）
     *
     * @param deviceType 设备类型
     * @return 对应的Page对象
     */
    private static Page getPage(DeviceType deviceType) {
        return deviceType == DeviceType.DESKTOP ? DESKTOP_PAGE : MOBILE_PAGE;
    }

    /**
     * 获取当前上下文（基于当前设备类型）
     *
     * @param deviceType 设备类型
     * @return 对应的BrowserContext对象
     */
    private static BrowserContext getContext(DeviceType deviceType) {
        return deviceType == DeviceType.DESKTOP ? DESKTOP_CONTEXT : MOBILE_CONTEXT;
    }

    /**
     * 关闭Playwright及浏览器实例，增加异常处理
     */
    public static void close() {
        try {
            if (DESKTOP_PAGE != null) {
                DESKTOP_PAGE.close();
                DESKTOP_PAGE = null;
            }
            if (MOBILE_PAGE != null) {
                MOBILE_PAGE.close();
                MOBILE_PAGE = null;
            }
            if (DESKTOP_CONTEXT != null) {
                DESKTOP_CONTEXT.close();
                DESKTOP_CONTEXT = null;
            }
            if (MOBILE_CONTEXT != null) {
                MOBILE_CONTEXT.close();
                MOBILE_CONTEXT = null;
            }
            if (BROWSER != null) {
                BROWSER.close();
                BROWSER = null;
            }
            if (PLAYWRIGHT != null) {
                PLAYWRIGHT.close();
                PLAYWRIGHT = null;
            }

            log.info("Playwright及浏览器实例已成功关闭");
        } catch (Exception e) {
            log.error("关闭Playwright实例时发生异常：{}", e.getMessage());
        }
    }

    /**
     * 导航到指定URL
     *
     * @param url        目标URL
     * @param deviceType 设备类型
     */
    public static void navigate(String url, DeviceType deviceType) {
        getPage(deviceType).navigate(url);
        log.info("已导航到URL: {} (设备类型: {})", url, deviceType);
    }

    /**
     * 使用默认设备类型导航到指定URL
     *
     * @param url 目标URL
     */
    public static void navigate(String url) {
        navigate(url, defaultDeviceType);
    }

    /**
     * 移动设备导航到指定URL (兼容旧代码)
     *
     * @param url 目标URL
     */
    public static void mobileNavigate(String url) {
        navigate(url, DeviceType.MOBILE);
    }

    /**
     * 等待指定时间（秒）
     *
     * @param seconds 等待的秒数
     */
    public static void sleep(int seconds) {
        try {
            TimeUnit.SECONDS.sleep(seconds);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Sleep被中断", e);
        }
    }

    /**
     * 随机延迟等待（模拟人类行为）
     *
     * @param minSeconds 最小等待秒数
     * @param maxSeconds 最大等待秒数
     */
    public static void randomSleep(int minSeconds, int maxSeconds) {
        int delay = RANDOM.nextInt(maxSeconds - minSeconds + 1) + minSeconds;
        sleep(delay);
    }

    /**
     * 默认随机延迟（2-5秒）
     */
    public static void randomSleep() {
        randomSleep(2, 5);
    }

    /**
     * 随机毫秒延迟
     *
     * @param minMillis 最小毫秒数
     * @param maxMillis 最大毫秒数
     */
    public static void randomSleepMillis(int minMillis, int maxMillis) {
        int delay = RANDOM.nextInt(maxMillis - minMillis + 1) + minMillis;
        sleepMillis(delay);
    }

    /**
     * 等待指定时间（毫秒）
     *
     * @param millis 等待的毫秒数
     */
    public static void sleepMillis(int millis) {
        try {
            TimeUnit.MILLISECONDS.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Sleep被中断", e);
        }
    }

    /**
     * 兼容SeleniumUtil的sleepByMilliSeconds方法
     *
     * @param milliSeconds 等待的毫秒数
     */
    public static void sleepByMilliSeconds(int milliSeconds) {
        sleepMillis(milliSeconds);
    }

    /**
     * 查找元素
     *
     * @param selector   元素选择器
     * @param deviceType 设备类型
     * @return 元素对象，如果未找到则返回null
     */
    public static Locator findElement(String selector, DeviceType deviceType) {
        return getPage(deviceType).locator(selector);
    }

    /**
     * 使用默认设备类型查找元素
     *
     * @param selector 元素选择器
     * @return 元素对象，如果未找到则返回null
     */
    public static Locator findElement(String selector) {
        return findElement(selector, defaultDeviceType);
    }

    /**
     * 查找元素并等待直到可见
     *
     * @param selector   元素选择器
     * @param timeout    超时时间（毫秒）
     * @param deviceType 设备类型
     * @return 元素对象，如果未找到则返回null
     */
    public static Locator waitForElement(String selector, int timeout, DeviceType deviceType) {
        Locator locator = getPage(deviceType).locator(selector);
        locator.waitFor(new Locator.WaitForOptions().setTimeout(timeout));
        return locator;
    }

    /**
     * 使用默认设备类型查找元素并等待直到可见
     *
     * @param selector 元素选择器
     * @param timeout  超时时间（毫秒）
     * @return 元素对象，如果未找到则返回null
     */
    public static Locator waitForElement(String selector, int timeout) {
        return waitForElement(selector, timeout, defaultDeviceType);
    }

    /**
     * 使用默认超时时间和默认设备类型等待元素
     *
     * @param selector 元素选择器
     * @return 元素对象，如果未找到则返回null
     */
    public static Locator waitForElement(String selector) {
        return waitForElement(selector, DEFAULT_WAIT_TIME, defaultDeviceType);
    }

    /**
     * 点击元素
     *
     * @param selector   元素选择器
     * @param deviceType 设备类型
     */
    public static void click(String selector, DeviceType deviceType) {
        try {
            // 先模拟鼠标移动到元素上
            simulateMouseMove(deviceType);

            // 随机延迟
            randomSleepMillis(MIN_HUMAN_DELAY, MAX_HUMAN_DELAY);

            getPage(deviceType).locator(selector).click();
            log.info("已点击元素: {} (设备类型: {})", selector, deviceType);

            // 点击后随机延迟
            randomSleepMillis(MIN_HUMAN_DELAY, MAX_HUMAN_DELAY);
        } catch (PlaywrightException e) {
            log.error("点击元素失败: {} (设备类型: {})", selector, deviceType, e);
        }
    }

    /**
     * 使用默认设备类型点击元素
     *
     * @param selector 元素选择器
     */
    public static void click(String selector) {
        click(selector, defaultDeviceType);
    }

    /**
     * 填写表单字段
     *
     * @param selector   元素选择器
     * @param text       要输入的文本
     * @param deviceType 设备类型
     */
    public static void fill(String selector, String text, DeviceType deviceType) {
        try {
            // 先点击元素获得焦点
            getPage(deviceType).locator(selector).click();

            // 随机延迟
            randomSleepMillis(MIN_HUMAN_DELAY, MAX_HUMAN_DELAY);

            // 清空现有内容
            getPage(deviceType).locator(selector).fill("");

            // 模拟人类输入
            typeHumanLike(selector, text, 50, 200, deviceType);

            log.info("已在元素{}中输入文本 (设备类型: {})", selector, deviceType);
        } catch (PlaywrightException e) {
            log.error("填写表单失败: {} (设备类型: {})", selector, deviceType, e);
        }
    }

    /**
     * 使用默认设备类型填写表单字段
     *
     * @param selector 元素选择器
     * @param text     要输入的文本
     */
    public static void fill(String selector, String text) {
        fill(selector, text, defaultDeviceType);
    }

    /**
     * 模拟人类输入文本（逐字输入）
     *
     * @param selector   元素选择器
     * @param text       要输入的文本
     * @param minDelay   字符间最小延迟（毫秒）
     * @param maxDelay   字符间最大延迟（毫秒）
     * @param deviceType 设备类型
     */
    public static void typeHumanLike(String selector, String text, int minDelay, int maxDelay, DeviceType deviceType) {
        try {
            Locator locator = getPage(deviceType).locator(selector);

            // 等待元素可见并可点击
            locator.waitFor(new Locator.WaitForOptions().setTimeout(10000));

            // 先聚焦到元素
            locator.focus();
            PlaywrightUtil.randomSleepMillis(500, 1000);

            // 清空现有内容
            locator.clear();
            PlaywrightUtil.randomSleepMillis(200, 500);

            for (char c : text.toCharArray()) {
                // 计算本次字符输入的延迟时间
                int delay = RANDOM.nextInt(maxDelay - minDelay + 1) + minDelay;

                // 输入单个字符
                locator.pressSequentially(String.valueOf(c),
                        new Locator.PressSequentiallyOptions().setDelay(delay));
            }
            log.info("已模拟人类在元素{}中输入文本 (设备类型: {})", selector, deviceType);
        } catch (PlaywrightException e) {
            log.error("模拟人类输入失败: {} (设备类型: {})", selector, deviceType, e);
            // 尝试备用输入方法
            try {
                Locator locator = getPage(deviceType).locator(selector);
                locator.fill(text);
                log.info("使用备用方法在元素{}中输入文本成功 (设备类型: {})", selector, deviceType);
            } catch (PlaywrightException e2) {
                log.error("备用输入方法也失败: {} (设备类型: {})", selector, deviceType, e2);
            }
        }
    }

    /**
     * 使用默认设备类型模拟人类输入文本
     *
     * @param selector 元素选择器
     * @param text     要输入的文本
     * @param minDelay 字符间最小延迟（毫秒）
     * @param maxDelay 字符间最大延迟（毫秒）
     */
    public static void typeHumanLike(String selector, String text, int minDelay, int maxDelay) {
        typeHumanLike(selector, text, minDelay, maxDelay, defaultDeviceType);
    }

    /**
     * 获取元素文本
     *
     * @param selector   元素选择器
     * @param deviceType 设备类型
     * @return 元素文本内容
     */
    public static String getText(String selector, DeviceType deviceType) {
        try {
            return getPage(deviceType).locator(selector).textContent();
        } catch (PlaywrightException e) {
            log.error("获取元素文本失败: {} (设备类型: {})", selector, deviceType, e);
            return "";
        }
    }

    /**
     * 使用默认设备类型获取元素文本
     *
     * @param selector 元素选择器
     * @return 元素文本内容
     */
    public static String getText(String selector) {
        return getText(selector, defaultDeviceType);
    }

    /**
     * 获取元素属性值
     *
     * @param selector      元素选择器
     * @param attributeName 属性名
     * @param deviceType    设备类型
     * @return 属性值
     */
    public static String getAttribute(String selector, String attributeName, DeviceType deviceType) {
        try {
            return getPage(deviceType).locator(selector).getAttribute(attributeName);
        } catch (PlaywrightException e) {
            log.error("获取元素属性失败: {}[{}] (设备类型: {})", selector, attributeName, deviceType, e);
            return "";
        }
    }

    /**
     * 使用默认设备类型获取元素属性值
     *
     * @param selector      元素选择器
     * @param attributeName 属性名
     * @return 属性值
     */
    public static String getAttribute(String selector, String attributeName) {
        return getAttribute(selector, attributeName, defaultDeviceType);
    }

    /**
     * 截取页面截图并保存
     *
     * @param path       保存路径
     * @param deviceType 设备类型
     */
    public static void screenshot(String path, DeviceType deviceType) {
        try {
            getPage(deviceType).screenshot(new Page.ScreenshotOptions().setPath(Paths.get(path)));
            log.info("已保存截图到: {} (设备类型: {})", path, deviceType);
        } catch (PlaywrightException e) {
            log.error("截图失败 (设备类型: {})", deviceType, e);
        }
    }

    /**
     * 使用默认设备类型截取页面截图并保存
     *
     * @param path 保存路径
     */
    public static void screenshot(String path) {
        screenshot(path, defaultDeviceType);
    }

    /**
     * 截取特定元素的截图
     *
     * @param selector   元素选择器
     * @param path       保存路径
     * @param deviceType 设备类型
     */
    public static void screenshotElement(String selector, String path, DeviceType deviceType) {
        try {
            getPage(deviceType).locator(selector).screenshot(new Locator.ScreenshotOptions().setPath(Paths.get(path)));
            log.info("已保存元素截图到: {} (设备类型: {})", path, deviceType);
        } catch (PlaywrightException e) {
            log.error("元素截图失败: {} (设备类型: {})", selector, deviceType, e);
        }
    }

    /**
     * 使用默认设备类型截取特定元素的截图
     *
     * @param selector 元素选择器
     * @param path     保存路径
     */
    public static void screenshotElement(String selector, String path) {
        screenshotElement(selector, path, defaultDeviceType);
    }

    /**
     * 保存Cookie到文件
     *
     * @param path       保存路径
     * @param deviceType 设备类型
     */
    public static void saveCookies(String path, DeviceType deviceType) {
        try {
            List<Cookie> cookies = getContext(deviceType).cookies();
            JSONArray jsonArray = new JSONArray();

            for (Cookie cookie : cookies) {
                JSONObject jsonObject = new JSONObject();
                jsonObject.put("name", cookie.name);
                jsonObject.put("value", cookie.value);
                jsonObject.put("domain", cookie.domain);
                jsonObject.put("path", cookie.path);
                if (cookie.expires != null) {
                    jsonObject.put("expires", cookie.expires);
                }
                jsonObject.put("secure", cookie.secure);
                jsonObject.put("httpOnly", cookie.httpOnly);
                jsonArray.put(jsonObject);
            }

            try (FileWriter file = new FileWriter(path, StandardCharsets.UTF_8)) {
                file.write(jsonArray.toString(4));
                log.info("Cookie已保存到文件: {} (设备类型: {})", path, deviceType);
            }
        } catch (IOException e) {
            log.error("保存Cookie失败 (设备类型: {})", deviceType, e);
        }
    }

    /**
     * 使用默认设备类型保存Cookie到文件
     *
     * @param path 保存路径
     */
    public static void saveCookies(String path) {
        saveCookies(path, defaultDeviceType);
    }

    /**
     * 从文件加载Cookie
     *
     * @param path       Cookie文件路径
     * @param deviceType 设备类型
     */
    public static void loadCookies(String path, DeviceType deviceType) {
        try {
            String jsonText = new String(Files.readAllBytes(Paths.get(path)), StandardCharsets.UTF_8);
            JSONArray jsonArray = new JSONArray(jsonText);

            List<com.microsoft.playwright.options.Cookie> cookies = new ArrayList<>();
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject jsonObject = jsonArray.getJSONObject(i);

                com.microsoft.playwright.options.Cookie cookie = new com.microsoft.playwright.options.Cookie(
                        jsonObject.getString("name"),
                        jsonObject.getString("value"));

                if (!jsonObject.isNull("domain")) {
                    cookie.domain = jsonObject.getString("domain");
                }

                if (!jsonObject.isNull("path")) {
                    cookie.path = jsonObject.getString("path");
                }

                if (!jsonObject.isNull("expires")) {
                    cookie.expires = jsonObject.getDouble("expires");
                }

                if (!jsonObject.isNull("secure")) {
                    cookie.secure = jsonObject.getBoolean("secure");
                }

                if (!jsonObject.isNull("httpOnly")) {
                    cookie.httpOnly = jsonObject.getBoolean("httpOnly");
                }

                cookies.add(cookie);
            }

            getContext(deviceType).addCookies(cookies);
            log.info("已从文件加载Cookie: {} (设备类型: {})", path, deviceType);
        } catch (IOException e) {
            log.error("加载Cookie失败 (设备类型: {})", deviceType, e);
        }
    }

    /**
     * 使用默认设备类型从文件加载Cookie
     *
     * @param path Cookie文件路径
     */
    public static void loadCookies(String path) {
        loadCookies(path, defaultDeviceType);
    }

    /**
     * 执行JavaScript代码
     *
     * @param script     JavaScript代码
     * @param deviceType 设备类型
     */
    public static void evaluate(String script, DeviceType deviceType) {
        try {
            getPage(deviceType).evaluate(script);
        } catch (PlaywrightException e) {
            log.error("执行JavaScript失败 (设备类型: {})", deviceType, e);
        }
    }

    /**
     * 使用默认设备类型执行JavaScript代码
     *
     * @param script JavaScript代码
     */
    public static void evaluate(String script) {
        evaluate(script, defaultDeviceType);
    }

    /**
     * 等待页面加载完成
     *
     * @param deviceType 设备类型
     */
    public static void waitForPageLoad(DeviceType deviceType) {
        getPage(deviceType).waitForLoadState(LoadState.DOMCONTENTLOADED);
        getPage(deviceType).waitForLoadState(LoadState.NETWORKIDLE);
    }

    /**
     * 检查元素是否可见
     *
     * @param selector   元素选择器
     * @param deviceType 设备类型
     * @return 是否可见
     */
    public static boolean elementIsVisible(String selector, DeviceType deviceType) {
        try {
            return getPage(deviceType).locator(selector).isVisible();
        } catch (PlaywrightException e) {
            return false;
        }
    }

    /**
     * 使用默认设备类型检查元素是否可见
     *
     * @param selector 元素选择器
     * @return 是否可见
     */
    public static boolean elementIsVisible(String selector) {
        return elementIsVisible(selector, defaultDeviceType);
    }

    /**
     * 选择下拉列表选项（通过文本）
     *
     * @param selector   选择器
     * @param optionText 选项文本
     * @param deviceType 设备类型
     */
    public static void selectByText(String selector, String optionText, DeviceType deviceType) {
        getPage(deviceType).locator(selector).selectOption(new SelectOption().setLabel(optionText));
    }

    /**
     * 使用默认设备类型选择下拉列表选项（通过文本）
     *
     * @param selector   选择器
     * @param optionText 选项文本
     */
    public static void selectByText(String selector, String optionText) {
        selectByText(selector, optionText, defaultDeviceType);
    }

    /**
     * 选择下拉列表选项（通过值）
     *
     * @param selector   选择器
     * @param value      选项值
     * @param deviceType 设备类型
     */
    public static void selectByValue(String selector, String value, DeviceType deviceType) {
        getPage(deviceType).locator(selector).selectOption(new SelectOption().setValue(value));
    }

    /**
     * 使用默认设备类型选择下拉列表选项（通过值）
     *
     * @param selector 选择器
     * @param value    选项值
     */
    public static void selectByValue(String selector, String value) {
        selectByValue(selector, value, defaultDeviceType);
    }

    /**
     * 获取当前页面标题
     *
     * @param deviceType 设备类型
     * @return 页面标题
     */
    public static String getTitle(DeviceType deviceType) {
        return getPage(deviceType).title();
    }

    /**
     * 使用默认设备类型获取当前页面标题
     *
     * @return 页面标题
     */
    public static String getTitle() {
        return getTitle(defaultDeviceType);
    }

    /**
     * 获取当前页面URL
     *
     * @param deviceType 设备类型
     * @return 页面URL
     */
    public static String getUrl(DeviceType deviceType) {
        return getPage(deviceType).url();
    }

    /**
     * 使用默认设备类型获取当前页面URL
     *
     * @return 页面URL
     */
    public static String getUrl() {
        return getUrl(defaultDeviceType);
    }

    /**
     * 初始化Stealth模式（使浏览器更难被检测为自动化工具）
     * 增强版本，集成SeleniumUtil的反检测功能
     *
     * @param deviceType 设备类型
     */
    public static void initStealth(DeviceType deviceType) {
        // 获取当前页面，不重新创建上下文和页面
        Page page = getPage(deviceType);

        // 为现有上下文设置额外的HTTP头
        BrowserContext context = getContext(deviceType);
        if (deviceType == DeviceType.DESKTOP) {
            context.setExtraHTTPHeaders(Map.of(
                    "sec-ch-ua", "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
                    "sec-ch-ua-mobile", "?0",
                    "sec-ch-ua-platform", "\"macOS\"",
                    "accept-language", "zh-CN,zh;q=0.9",
                    "referer", "https://www.zhipin.com/",
                    "sec-fetch-dest", "document",
                    "sec-fetch-mode", "navigate",
                    "sec-fetch-site", "same-origin"));
        } else {
            context.setExtraHTTPHeaders(Map.of(
                    "sec-ch-ua", "\"Chromium\";v=\"135\", \"Not A(Brand\";v=\"99\"",
                    "sec-ch-ua-mobile", "?1",
                    "sec-ch-ua-platform", "\"iOS\"",
                    "accept-language", "zh-CN,zh;q=0.9",
                    "sec-fetch-dest", "document",
                    "sec-fetch-mode", "navigate",
                    "sec-fetch-site", "same-origin"));
        }

        // 注入反检测脚本（从SeleniumUtil移植）
        String stealthScript = """
                // 移除webdriver标识
                Object.defineProperty(navigator, 'webdriver', {get: () => undefined});

                // 删除Chrome自动化标识
                delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
                delete window.cdc_adoQpoasnfa76pfcZLmcfl_JSON;
                delete window.cdc_adoQpoasnfa76pfcZLmcfl_Object;
                delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
                delete window.cdc_adoQpoasnfa76pfcZLmcfl_Proxy;
                delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
                delete window.cdc_adoQpoasnfa76pfcZLmcfl_Window;

                // 模拟Chrome运行时
                window.navigator.chrome = {
                    runtime: {},
                    loadTimes: function() {},
                    csi: function() {},
                    app: {}
                };

                // 设置语言
                Object.defineProperty(navigator, 'languages', {get: () => ['zh-CN', 'zh', 'en']});

                // 设置插件
                Object.defineProperty(navigator, 'plugins', {get: () => [
                    {name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer'},
                    {name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai'},
                    {name: 'Native Client', filename: 'internal-nacl-plugin'}
                ]});

                // 设置权限
                Object.defineProperty(navigator, 'permissions', {get: () => ({
                    query: function() { return Promise.resolve({state: 'granted'}); }
                })});

                // 模拟媒体设备
                Object.defineProperty(navigator, 'mediaDevices', {get: () => ({
                    enumerateDevices: function() { return Promise.resolve([]); },
                    getUserMedia: function() { return Promise.reject(new Error('Not supported')); }
                })});

                // 设置屏幕信息
                Object.defineProperty(screen, 'availHeight', {get: () => 1055});
                Object.defineProperty(screen, 'availWidth', {get: () => 1920});
                Object.defineProperty(screen, 'colorDepth', {get: () => 24});
                Object.defineProperty(screen, 'pixelDepth', {get: () => 24});

                // 设置时区
                Object.defineProperty(Intl, 'DateTimeFormat', {get: () => function() {
                    return {
                        resolvedOptions: function() {
                            return {timeZone: 'Asia/Shanghai'};
                        }
                    };
                }});

                // 覆盖Date对象
                const originalDate = Date;
                Date = class extends originalDate {
                    getTimezoneOffset() {
                        return -480; // 中国时区
                    }
                };

                // 设置Canvas指纹
                const getContext = HTMLCanvasElement.prototype.getContext;
                HTMLCanvasElement.prototype.getContext = function(type) {
                    if (type === '2d') {
                        const context = getContext.apply(this, arguments);
                        const originalFillText = context.fillText;
                        context.fillText = function() {
                            // 添加随机噪声
                            const args = Array.from(arguments);
                            if (args.length >= 3) {
                                args[1] += Math.random() * 0.1;
                                args[2] += Math.random() * 0.1;
                            }
                            return originalFillText.apply(this, args);
                        };
                        return context;
                    }
                    return getContext.apply(this, arguments);
                };

                // 设置WebGL指纹
                const getParameter = WebGLRenderingContext.prototype.getParameter;
                WebGLRenderingContext.prototype.getParameter = function(parameter) {
                    if (parameter === 37445) { // UNMASKED_VENDOR_WEBGL
                        return 'Intel Inc.';
                    }
                    if (parameter === 37446) { // UNMASKED_RENDERER_WEBGL
                        return 'Intel Iris OpenGL Engine';
                    }
                    return getParameter.apply(this, arguments);
                };

                // 覆盖console方法
                const originalLog = console.log;
                console.log = function() {
                    // 静默处理，避免暴露自动化痕迹
                };

                // 设置内存信息
                Object.defineProperty(navigator, 'deviceMemory', {get: () => 8});

                // 设置硬件并发
                Object.defineProperty(navigator, 'hardwareConcurrency', {get: () => 8});

                // 设置连接信息
                Object.defineProperty(navigator, 'connection', {get: () => ({
                    effectiveType: '4g',
                    rtt: 50,
                    downlink: 10
                })});
                """;

        page.addInitScript(stealthScript);

        // 如果有stealth.min.js文件，也尝试加载
        try {
            String stealthJs = new String(
                    Files.readAllBytes(Paths.get("src/main/resources/stealth.min.js")), StandardCharsets.UTF_8);
            page.addInitScript(stealthJs);
            log.info("已加载stealth.min.js文件");
        } catch (IOException e) {
            log.info("未找到stealth.min.js文件，使用内置反检测脚本");
        }
        log.info("已启用增强Stealth模式 (设备类型: {})", deviceType);
    }

    /**
     * 使用默认设备类型初始化Stealth模式
     */
    public static void initStealth() {
        initStealth(defaultDeviceType);
    }

    /**
     * 设置默认请求头（从SeleniumUtil移植）
     *
     * @param deviceType 设备类型
     */
    public static void setDefaultHeaders(DeviceType deviceType) {
        BrowserContext context = getContext(deviceType);

        Map<String, String> headers = Map.of(
                "sec-ch-ua", "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
                "sec-ch-ua-mobile", deviceType == DeviceType.MOBILE ? "?1" : "?0",
                "sec-ch-ua-platform", deviceType == DeviceType.MOBILE ? "\"iOS\"" : "\"macOS\"",
                "user-agent", deviceType == DeviceType.MOBILE ?
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1" :
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
                "accept-language", "zh-CN,zh;q=0.9",
                "referer", "https://www.zhipin.com/"
        );

        context.setExtraHTTPHeaders(headers);
        log.info("已设置默认请求头 (设备类型: {})", deviceType);
    }

    /**
     * 使用默认设备类型设置默认请求头
     */
    public static void setDefaultHeaders() {
        setDefaultHeaders(defaultDeviceType);
    }

    /**
     * 获取当前设备类型的Page对象
     *
     * @param deviceType 设备类型
     * @return 对应的Page对象
     */
    public static Page getPageObject(DeviceType deviceType) {
        return deviceType == DeviceType.DESKTOP ? DESKTOP_PAGE : MOBILE_PAGE;
    }

    /**
     * 使用默认设备类型获取Page对象
     *
     * @return 对应的Page对象
     */
    public static Page getPageObject() {
        return getPageObject(defaultDeviceType);
    }

    /**
     * 设置自定义Cookie
     *
     * @param name       Cookie名称
     * @param value      Cookie值
     * @param domain     Cookie域
     * @param path       Cookie路径
     * @param expires    过期时间（可选）
     * @param secure     是否安全（可选）
     * @param httpOnly   是否仅HTTP（可选）
     * @param deviceType 设备类型
     */
    public static void setCookie(String name, String value, String domain, String path,
                                 Double expires, Boolean secure, Boolean httpOnly, DeviceType deviceType) {
        com.microsoft.playwright.options.Cookie cookie = new com.microsoft.playwright.options.Cookie(name, value);
        cookie.domain = domain;
        cookie.path = path;

        if (expires != null) {
            cookie.expires = expires;
        }

        if (secure != null) {
            cookie.secure = secure;
        }

        if (httpOnly != null) {
            cookie.httpOnly = httpOnly;
        }

        List<com.microsoft.playwright.options.Cookie> cookies = new ArrayList<>();
        cookies.add(cookie);

        getContext(deviceType).addCookies(cookies);
        log.info("已设置Cookie: {} (设备类型: {})", name, deviceType);
    }

    /**
     * 使用默认设备类型设置自定义Cookie
     *
     * @param name     Cookie名称
     * @param value    Cookie值
     * @param domain   Cookie域
     * @param path     Cookie路径
     * @param expires  过期时间（可选）
     * @param secure   是否安全（可选）
     * @param httpOnly 是否仅HTTP（可选）
     */
    public static void setCookie(String name, String value, String domain, String path,
                                 Double expires, Boolean secure, Boolean httpOnly) {
        setCookie(name, value, domain, path, expires, secure, httpOnly, defaultDeviceType);
    }

    /**
     * 简化的设置Cookie方法
     *
     * @param name       Cookie名称
     * @param value      Cookie值
     * @param domain     Cookie域
     * @param path       Cookie路径
     * @param deviceType 设备类型
     */
    public static void setCookie(String name, String value, String domain, String path, DeviceType deviceType) {
        setCookie(name, value, domain, path, null, null, null, deviceType);
    }

    /**
     * 使用默认设备类型的简化设置Cookie方法
     *
     * @param name   Cookie名称
     * @param value  Cookie值
     * @param domain Cookie域
     * @param path   Cookie路径
     */
    public static void setCookie(String name, String value, String domain, String path) {
        setCookie(name, value, domain, path, null, null, null, defaultDeviceType);
    }

    /**
     * 检查Cookie文件是否有效（增强版）
     *
     * @param cookiePath Cookie文件路径
     * @return 文件是否存在且内容有效
     */
    public static boolean isCookieValid(String cookiePath) {
        try {
            Path path = Paths.get(cookiePath);
            if (!Files.exists(path)) {
                return false;
            }

            // 检查文件内容是否有效（不是空的JSON数组）
            String content = Files.readString(path).trim();
            if (content.isEmpty() || content.equals("[]") || content.equals("{}")) {
                log.info("Cookie文件内容无效: {}", content);
                return false;
            }

            // 检查Cookie是否过期（增强验证）
            try {
                JSONArray cookieArray = new JSONArray(content);
                long currentTime = System.currentTimeMillis() / 1000; // 转换为秒
                boolean hasValidCookie = false;

                for (int i = 0; i < cookieArray.length(); i++) {
                    JSONObject cookie = cookieArray.getJSONObject(i);
                    double expires = cookie.optDouble("expires", -1);

                    // 如果expires为-1表示会话Cookie，始终有效
                    // 如果expires > 当前时间，表示Cookie未过期
                    if (expires == -1 || expires > currentTime) {
                        hasValidCookie = true;
                        break;
                    }
                }

                if (!hasValidCookie) {
                    log.info("所有Cookie已过期，文件: {}", cookiePath);
                    return false;
                }

                log.debug("Cookie文件有效，包含未过期的Cookie: {}", cookiePath);
                return true;

            } catch (Exception jsonException) {
                log.warn("解析Cookie JSON失败，但文件存在，假设有效: {}", jsonException.getMessage());
                return true; // 如果JSON解析失败，但文件存在，假设有效
            }

        } catch (Exception e) {
            log.error("检查Cookie文件有效性失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 带错误消息的元素查找（从SeleniumUtil移植）
     *
     * @param selector    元素选择器
     * @param message     错误消息
     * @param deviceType  设备类型
     * @return 元素对象的Optional包装
     */
    public static Optional<Locator> findElementWithMessage(String selector, String message, DeviceType deviceType) {
        try {
            Locator locator = getPage(deviceType).locator(selector);
            // 检查元素是否存在
            if (locator.count() > 0) {
                return Optional.of(locator);
            } else {
                log.error(message);
                return Optional.empty();
            }
        } catch (Exception e) {
            log.error(message + ": " + e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * 使用默认设备类型的带错误消息的元素查找
     *
     * @param selector 元素选择器
     * @param message  错误消息
     * @return 元素对象的Optional包装
     */
    public static Optional<Locator> findElementWithMessage(String selector, String message) {
        return findElementWithMessage(selector, message, defaultDeviceType);
    }

    /**
     * 模拟鼠标移动（随机移动）
     *
     * @param deviceType 设备类型
     */
    public static void simulateMouseMove(DeviceType deviceType) {
        try {
            Page page = getPage(deviceType);

            // 随机移动鼠标到页面不同位置
            int x = RANDOM.nextInt(800) + 100; // 100-900
            int y = RANDOM.nextInt(600) + 100; // 100-700

            page.mouse().move(x, y);

            // 随机延迟
            randomSleepMillis(100, 300);
        } catch (Exception e) {
            log.debug("鼠标移动模拟失败: {}", e.getMessage());
        }
    }

    /**
     * 使用默认设备类型模拟鼠标移动
     */
    public static void simulateMouseMove() {
        simulateMouseMove(defaultDeviceType);
    }

    /**
     * 模拟人类滚动行为
     *
     * @param deviceType 设备类型
     */
    public static void simulateScroll(DeviceType deviceType) {
        try {
            Page page = getPage(deviceType);

            // 随机滚动距离
            int scrollDistance = RANDOM.nextInt(300) + 100; // 100-400像素

            // 随机滚动方向
            if (RANDOM.nextBoolean()) {
                page.mouse().wheel(0, scrollDistance); // 向下滚动
            } else {
                page.mouse().wheel(0, -scrollDistance); // 向上滚动
            }

            // 滚动后随机延迟
            randomSleepMillis(200, 800);
        } catch (Exception e) {
            log.debug("滚动模拟失败: {}", e.getMessage());
        }
    }

    /**
     * 使用默认设备类型模拟滚动
     */
    public static void simulateScroll() {
        simulateScroll(defaultDeviceType);
    }

    /**
     * 模拟人类键盘行为（随机按键）
     *
     * @param deviceType 设备类型
     */
    public static void simulateKeyboardActivity(DeviceType deviceType) {
        try {
            Page page = getPage(deviceType);

            // 随机按一些无害的键
            String[] keys = {"Tab", "ArrowDown", "ArrowUp", "Home", "End"};
            String randomKey = keys[RANDOM.nextInt(keys.length)];

            page.keyboard().press(randomKey);

            // 按键后随机延迟
            randomSleepMillis(100, 400);
        } catch (Exception e) {
            log.debug("键盘活动模拟失败: {}", e.getMessage());
        }
    }

    /**
     * 使用默认设备类型模拟键盘活动
     */
    public static void simulateKeyboardActivity() {
        simulateKeyboardActivity(defaultDeviceType);
    }

    /**
     * 综合人类行为模拟（鼠标移动 + 滚动 + 键盘活动）
     *
     * @param deviceType 设备类型
     */
    public static void simulateHumanBehavior(DeviceType deviceType) {
        // 随机选择要执行的行为
        int behaviorCount = RANDOM.nextInt(3) + 1; // 1-3个行为

        for (int i = 0; i < behaviorCount; i++) {
            int behavior = RANDOM.nextInt(3);

            switch (behavior) {
                case 0:
                    simulateMouseMove(deviceType);
                    break;
                case 1:
                    simulateScroll(deviceType);
                    break;
                case 2:
                    simulateKeyboardActivity(deviceType);
                    break;
            }

            // 行为间随机延迟
            randomSleepMillis(300, 1000);
        }
    }

    /**
     * 使用默认设备类型综合人类行为模拟
     */
    public static void simulateHumanBehavior() {
        simulateHumanBehavior(defaultDeviceType);
    }

    /**
     * 增强的页面导航（带人类行为模拟）
     *
     * @param url        目标URL
     * @param deviceType 设备类型
     */
    public static void navigateWithHumanBehavior(String url, DeviceType deviceType) {
        // 导航前模拟人类行为
        simulateHumanBehavior(deviceType);

        // 执行导航
        navigate(url, deviceType);

        // 导航后等待页面加载（使用更宽松的超时时间）
        try {
            getPage(deviceType).waitForLoadState(LoadState.DOMCONTENTLOADED, new Page.WaitForLoadStateOptions().setTimeout(10000));
        } catch (Exception e) {
            log.warn("页面加载超时，继续执行: {}", e.getMessage());
        }

        // 导航后模拟人类行为
        randomSleepMillis(2000, 5000);
        simulateHumanBehavior(deviceType);
    }

    /**
     * 使用默认设备类型增强页面导航
     *
     * @param url 目标URL
     */
    public static void navigateWithHumanBehavior(String url) {
        navigateWithHumanBehavior(url, defaultDeviceType);
    }

    /**
     * 获取浏览器可执行文件路径
     */
    private static String getBrowserExecutablePath() {
        String browsersPath = System.getProperty("user.home") + "/.cache/ms-playwright/chromium_1161";
        // 检查macOS路径
        String macPath = browsersPath + "/chrome-mac/Chromium.app/Contents/MacOS/Chromium";
        if (Files.exists(Paths.get(macPath))) {
            log.info("找到浏览器: {}", macPath);
            return macPath;
        }
        // 检查Linux路径
        String linuxPath = browsersPath + "/chrome-linux/chrome";
        if (Files.exists(Paths.get(linuxPath))) {
            log.info("找到浏览器: {}", linuxPath);
            return linuxPath;
        }
        // 检查Windows路径
        String windowsPath = browsersPath + "/chrome-win/chrome.exe";
        if (Files.exists(Paths.get(windowsPath))) {
            log.info("找到浏览器: {}", windowsPath);
            return windowsPath;
        }

        // 如果都不存在，返回null让Playwright使用默认路径
        log.warn("未找到已安装的浏览器，可能触发下载");
        return null;
    }
}
