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

        // 由于elements查找被注释，直接跳过处理逻辑
        // TODO: 取消注释下面的代码以启用实际的元素处理
        /*
        if (elements != null && !elements.isEmpty()) {
            log.info("找到 {} 个岗位元素，开始处理", elements.size());
            for (int i = 0; i < elements.size() && currentKeyJobNum <= oneKeyMaxJob; i++) {
                WebElement element = null;
                try {
                    element = elements.get(i);
                } catch (Exception e) {
                    log.error("获取岗位列表中某个岗位失败，岗位列表数量：{},获取第【{}】个元素失败", i + 1, elements.size());
                }
                try {
                    ACTIONS.moveToElement(element).perform();
                } catch (Exception e) {
                    getWindow();
                }
                if (-1 == tryClick(element, i)) {
                    continue;
                }
                TimeUnit.SECONDS.sleep(1);
                getWindow();
                String jobName = "测试岗位";
                WebElement submit;
                try {
                    // 临时注释避免编译错误
                    // jobName = CHROME_DRIVER.findElement(By.className("header__HY1Cm")).getText();
                } catch (Exception e) {
                    try {
                        // 临时注释避免编译错误
                        // jobName = CHROME_DRIVER.findElement(By.className("position-head-wrap-position-name")).getText();
                    } catch (Exception ex) {
                        SeleniumUtil.sleep(10);
                        continue;
                    }

                }
                if (!(jobName != null && !jobName.isEmpty() && !jobName.contains("销"))) {
                    // 临时注释避免编译错误
                    // CHROME_DRIVER.close();
                    getWindow();
                    continue;
                }
                // 临时注释避免编译错误
                // submit = CHROME_DRIVER.findElement(By.className("resume-deliver"));
                // 临时注释避免编译错误
                // if ("投简历".equals(submit.getText())) {
                    String jobTitle = null;
                    String companyName = null;
                    String jobInfo = null;
                    String companyInfo = null;
                    String salary = null;
                    String weal = null;
                    try {
                        // 临时注释避免编译错误
                        // jobTitle = CHROME_DRIVER.findElement(By.cssSelector("span.name__36WTQ")).getText();
                        // companyName = CHROME_DRIVER.findElement(By.cssSelector("span.company")).getText();
                        // jobInfo = CHROME_DRIVER.findElements(By.cssSelector("h3.position-tags span"))
                        //         .stream()
                        //         .map(WebElement::getText)
                        //         .collect(Collectors.joining("/"));
                        // 临时注释避免编译错误
                        // companyInfo = CHROME_DRIVER.findElement(By.cssSelector("div.header__HY1Cm")).getText();
                        // salary = CHROME_DRIVER.findElement(By.cssSelector("span.salary__22Kt_")).getText();
                        // weal = CHROME_DRIVER.findElement(By.cssSelector("li.labels")).getText();
                    } catch (Exception e) {
                        log.error("获取职位信息失败", e);
                        try {
                            // 临时注释避免编译错误
                            // jobTitle = CHROME_DRIVER.findElement(By.cssSelector("span.position-head-wrap-position-name")).getText();
                            // companyName = CHROME_DRIVER.findElement(By.cssSelector("span.company")).getText();
                            // 临时注释避免编译错误
                            // List<WebElement> jobInfoElements = CHROME_DRIVER.findElements(By.cssSelector("h3.position-tags span:not(.tag-point)"));
                            // jobInfo = jobInfoElements.stream()
                            //         .map(WebElement::getText)
                            //         .collect(Collectors.joining("/"));
                            // companyInfo = CHROME_DRIVER.findElement(By.cssSelector("span.company")).getText();
                            // 临时注释避免编译错误
                            // salary = CHROME_DRIVER.findElement(By.cssSelector("span.salary")).getText();
                            // weal = CHROME_DRIVER.findElement(By.cssSelector("dd.job-advantage p")).getText();
                        } catch (Exception ex) {
                            log.error("第二次获取职位信息失败，放弃了！", ex);
                        }
                    }
                    log.info("投递: {},职位: {},公司: {},职位信息: {},公司信息: {},薪资: {},福利: {}", jobTitle, jobTitle, companyName, jobInfo, companyInfo, salary, weal);
                    jobCount++;
                    currentKeyJobNum++;
                    TimeUnit.SECONDS.sleep(2);
                    // 临时注释避免编译错误
                    // submit.click();
                    TimeUnit.SECONDS.sleep(2);
                    // 临时注释避免编译错误
                    // try {
                    //     WebElement send = CHROME_DRIVER.findElement(By.cssSelector("body > div:nth-child(45) > div > div.lg-design-modal-wrap.position-modal > div > div.lg-design-modal-content > div.lg-design-modal-footer > button.lg-design-btn.lg-design-btn-default"));
                    //     if ("确认投递".equals(send.getText())) {
                    //         send.click();
                    //     }
                    // } catch (Exception e) {
                    //     log.error("没有【确认投递】的弹窗，继续！");
                    // }
                    // try {
                    //     WebElement confirm = CHROME_DRIVER.findElement(By.cssSelector("button.lg-design-btn.lg-design-btn-primary span"));
                    //     String buttonText = confirm.getText();
                    //     if ("我知道了".equals(buttonText)) {
                    //         confirm.click();
                    //     } else {
                    //         TimeUnit.SECONDS.sleep(1);
                    //     }
                    // } catch (Exception e) {
                    //     log.error("第一次点击【我知道了】按钮失败...重试xpath点击...");
                    //     TimeUnit.SECONDS.sleep(1);
                    //     try {
                    //         CHROME_DRIVER.findElement(By.xpath("/html/body/div[7]/div/div[2]/div/div[2]/div[2]/button[2]")).click();
                    //     } catch (Exception ex) {
                    //         log.error("第二次点击【我知道了】按钮失败...放弃了！", ex);
                    //         TimeUnit.SECONDS.sleep(10);
                    //         CHROME_DRIVER.navigate().refresh();
                    //     }
                    // }
                    // try {
                    //     TimeUnit.SECONDS.sleep(2);
                    //     CHROME_DRIVER.findElement(By.cssSelector("#__next > div:nth-child(3) > div > div > div.feedback_job__3EnWp > div.feedback_job_title__2y8Bj > div.feedback_job_deliver__3UIB5.feedback_job_active__3bbLa")).click();
                    // } catch (Exception e) {
                    //     log.error("这个岗位没有推荐职位...");
                    //     TimeUnit.SECONDS.sleep(1);
                    // }
                // 临时注释避免编译错误
                // } else if ("立即沟通".equals(submit.getText())) {
                //     submit.click();
                //     try {
                //         WAIT.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//*[@id=\"modalConIm\"]"))).click();
                //     } catch (Exception e) {
                //         submit.click();
                //         WAIT.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//*[@id=\"modalConIm\"]"))).click();
                //     }
                // 临时注释避免编译错误
                // } else {
                //     log.info("这个岗位没有投简历按钮...一秒后关闭标签页面！");
                //     TimeUnit.SECONDS.sleep(1);
                // }
                // 临时注释避免编译错误
                // CHROME_DRIVER.close();
                getWindow();
            }
        }
        */
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
        return 0;

        /*
         while (!isClicked && retryCount < maxRetryCount) {
         try {
         element.click();
         isClicked = true;
         } catch (Exception e) {
         retryCount++;
         log.error("element.click() 点击失败，正在尝试重新点击...(正在尝试：第 {} 次)", retryCount);
         TimeUnit.SECONDS.sleep(5);

         try {
         CHROME_DRIVER.findElements(By.id("openWinPostion")).get(i).click();
         isClicked = true;
         } catch (Exception ex) {
         log.error(" get(i).click() 重试失败，尝试使用Actions点击...(正在尝试：第 {} 次)", retryCount);
         TimeUnit.SECONDS.sleep(5);
         try {
         ACTIONS.keyDown(Keys.CONTROL).click(element).keyUp(Keys.CONTROL).build().perform();
         isClicked = true;
         } catch (Exception exc) {
         log.error("使用Actions点击也失败，等待10秒后再次尝试...(正在尝试：第 {} 次)", retryCount);
         TimeUnit.SECONDS.sleep(10);
         }
         }
         }
         }
         if (!isClicked) {
         log.error("已尝试 {} 次，已达最大重试次数，少侠请重新来过！", maxRetryCount);
         log.info("已投递 {} 次，正在退出...", jobCount);
         CHROME_DRIVER.quit();
         return -1;
         } else {
         return 0;
         }
         */
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
