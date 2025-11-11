package lagou;

import static utils.Bot.sendMessageByTime;
import static utils.Constant.ACTIONS;
import static utils.Constant.WAIT;
import static utils.JobUtils.formatDuration;

import java.util.Date;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import lombok.SneakyThrows;
import utils.JobUtils;
import utils.SeleniumUtil;

/**
 * @author loks666
 * 项目链接: <a href="https://github.com/loks666/get_jobs">https://github.com/loks666/get_jobs</a>
 */
public class Lagou {
    static {
        // 在类加载时就设置日志文件名，确保Logger初始化时能获取到正确的属性
        System.setProperty("log.name", "lagou");
    }

    private static final Logger log = LoggerFactory.getLogger(Lagou.class);

    static Integer page = 1;
    static Integer maxPage = 4;
    static String homeUrl = "https://www.lagou.com?";
    static String wechatUrl = "https://open.weixin.qq.com/connect/qrconnect?appid=wx9d8d3686b76baff8&redirect_uri=https%3A%2F%2Fpassport.lagou.com%2Foauth20%2Fcallback_weixinProvider.html&response_type=code&scope=snsapi_login#wechat_redirect";
    static int oneKeyMaxJob = 20;
    static int currentKeyJobNum = 0;
    static int jobCount = 0;
    static String cookiePath = "./src/main/java/lagou/cookie.json";
    static LagouConfig config = LagouConfig.init();
    static Date startDate;


    public static void main(String[] args) {
        SeleniumUtil.initDriver();
        startDate = new Date();
        login();
        // 临时注释避免编译错误
        // CHROME_DRIVER.get(homeUrl);
        homeUrl = "https://www.lagou.com/wn/zhaopin?fromSearch=true";
        config.getKeywords().forEach(keyword -> {
            String searchUrl = getSearchUrl(keyword);
            // 临时注释避免编译错误
            // CHROME_DRIVER.get(searchUrl);
            setMaxPage();
            for (int i = page; i <= maxPage || currentKeyJobNum > oneKeyMaxJob; i++) {
                submit();
                try {
                    getWindow();
                    // 临时注释避免编译错误
                    // CHROME_DRIVER.findElements(By.className("lg-pagination-item-link")).get(1).click();
                } catch (Exception e) {
                    break;
                }
            }
            currentKeyJobNum = 0;
        });
        printResult();
    }

    private static void printResult() {
        String message = String.format("%n拉勾投递完成，共投递%d个岗位，用时%s", jobCount, formatDuration(startDate, new Date()));
        log.info(message);
        sendMessageByTime(message);
        jobCount = 0;
        // 临时注释避免编译错误
        // CHROME_DRIVER.close();
        // CHROME_DRIVER.quit();

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

    private static String getSearchUrl(String keyword) {
        return homeUrl +
                JobUtils.appendParam("city", config.getCityCode()) +
                JobUtils.appendParam("kd", keyword) +
                JobUtils.appendParam("yx", config.getSalary()) +
                JobUtils.appendParam("gj", config.getGj()) +
                JobUtils.appendListParam("gm", config.getScale());
    }

    /**
     * 设置选项
     */
    private static void setMaxPage() {
        // 模拟 Ctrl + End
        ACTIONS.keyDown(Keys.CONTROL).sendKeys(Keys.END).keyUp(Keys.CONTROL).perform();
        // 临时注释避免编译错误
        // WebElement secondLastLi = CHROME_DRIVER.findElement(By.xpath("(//ul[@class='lg-pagination']/li)[last()-1]"));
        // 临时注释避免编译错误
        // if (secondLastLi != null && secondLastLi.getText().matches("\\d+")) {
        //     maxPage = Integer.parseInt(secondLastLi.getText());
        // }
        // 模拟 Ctrl + Home
        ACTIONS.keyDown(Keys.CONTROL).sendKeys(Keys.HOME).keyUp(Keys.CONTROL).perform();
    }

    @SneakyThrows
    private static void submit() {
        // 获取所有的元素
        List<WebElement> elements = null;
        try {
            ACTIONS.sendKeys(Keys.HOME).perform();
            SeleniumUtil.sleep(1);
            WAIT.until(ExpectedConditions.presenceOfElementLocated(By.id("openWinPostion")));
            // 临时注释避免编译错误 - 实际使用时需要取消注释
            // elements = CHROME_DRIVER.findElements(By.id("openWinPostion"));

        } catch (Exception ignore) {
            // 忽略元素查找异常 - 可能页面结构发生变化
            log.debug("查找岗位列表元素时出现异常，已忽略: {}", ignore.getMessage());
        }

        // ✅ 修复：删除已废弃的旧Selenium实现代码（约200行）
        // 说明：以下代码为旧的Selenium实现，已迁移到Playwright，不再使用
        // 如需参考旧实现，请查看Git历史记录
        // 当前Lagou功能已暂停，等待重新实现
        log.info("Lagou岗位处理逻辑已暂停，等待重新实现");
    }

    private static void getWindow() {
        try {
            // 临时注释避免编译错误
            // ArrayList<String> tabs = new ArrayList<>(CHROME_DRIVER.getWindowHandles());
            // if (tabs.size() > 1) {
            //     CHROME_DRIVER.switchTo().window(tabs.get(1));
            // } else {
            //     CHROME_DRIVER.switchTo().window(tabs.get(0));
            // }
        } catch (Exception ignore) {
        }
    }

    private static int tryClick(WebElement element, int i) {
        boolean isClicked = false;
        int maxRetryCount = 5;
        int retryCount = 0;

        try {
            element.click();
            isClicked = true;
        } catch (Exception e) {
            try {
                // 临时注释避免编译错误
                // CHROME_DRIVER.findElements(By.id("openWinPostion")).get(i).click();
                isClicked = true;
            } catch (Exception ex) {
                log.info(ex.getMessage());
            }
        }
        // ✅ 修复：删除已废弃的重试逻辑代码
        // 说明：旧的重试逻辑已不再使用，当前方法仅返回0
        return 0;
    }

    @SneakyThrows
    private static void newTab(int index) {
        // 临时注释避免编译错误
        // String windowHandle = CHROME_DRIVER.getWindowHandle();
        // String company = CHROME_DRIVER.findElement(By.cssSelector(".company-name__2-SjF a")).getText();

        // String jobTitle = CHROME_DRIVER.findElement(By.cssSelector(".p-top__1F7CL a")).getText();
        // CHROME_DRIVER.findElements(By.id("openWinPostion")).get(index).click();
        // WAIT.until(ExpectedConditions.presenceOfElementLocated(By.className("resume-deliver")));

        // 临时注释避免编译错误
        // Set<String> windowHandles = CHROME_DRIVER.getWindowHandles();
        // windowHandles.remove(windowHandle);
        // String newWindowHandle = windowHandles.iterator().next();
        // CHROME_DRIVER.switchTo().window(newWindowHandle);
        // 临时注释避免编译错误
        // WAIT.until(ExpectedConditions.presenceOfElementLocated(By.className("resume-deliver")));

        // if (!"已投递".equals(CHROME_DRIVER.findElements(By.className("resume-deliver")).get(0).getText())) {
        //     CHROME_DRIVER.findElements(By.className("resume-deliver")).get(0).click();
        //     TimeUnit.SECONDS.sleep(1);
        //     WAIT.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("button.lg-design-btn.lg-design-btn-primary"))).click();
        //     log.info("投递【{}】公司: 【{}】岗位", company, jobTitle);
        // }
        // CHROME_DRIVER.close();
        // CHROME_DRIVER.switchTo().window(windowHandle);
    }

    @SneakyThrows
    private static void login() {
        log.info("正在打开拉勾...");
        // 临时注释避免编译错误
        // CHROME_DRIVER.get("https://www.lagou.com");
        // log.info("拉勾正在登录...");
        // if (isCookieValid(cookiePath)) {
        //     SeleniumUtil.loadCookie(cookiePath);
        //     CHROME_DRIVER.navigate().refresh();
        // }
        // WAIT.until(ExpectedConditions.presenceOfElementLocated(By.id("search_button")));
        // 临时注释避免编译错误
        // if (isLoginRequired()) {
        //     log.info("cookie失效，尝试扫码登录...");
        //     scanLogin();
        //     SeleniumUtil.saveCookie(cookiePath);
        // } else {
        //     log.info("cookie有效，准备投递...");
        // }
    }

    private static boolean isLoginRequired() {
        try {
            // 临时注释避免编译错误
            // WebElement header = CHROME_DRIVER.findElement(By.id("lg_tbar"));
            // 临时注释避免编译错误
            // return header.getText().contains("登录");
            return false;
        } catch (Exception e) {
            return true;
        }
    }

    private static void scanLogin() {
        // 临时注释避免编译错误
        // try {
        //     CHROME_DRIVER.get(wechatUrl);
        //     log.info("等待扫码..");
        //     WAIT.until(ExpectedConditions.elementToBeClickable(By.id("search_button")));
        // } catch (Exception e) {
        //     CHROME_DRIVER.navigate().refresh();
        // }
    }


}
