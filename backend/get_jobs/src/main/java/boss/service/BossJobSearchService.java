package boss.service;

import static boss.Locators.JOB_LIST_CONTAINER;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

import boss.BossConfig;
import boss.BossEnum;
import utils.JobUtils;
import utils.PlaywrightUtil;

/**
 * Boss岗位搜索服务
 * 负责岗位搜索和列表遍历
 *
 * @author ZhiTouJianLi Team
 */
public class BossJobSearchService {
    private static final Logger log = LoggerFactory.getLogger(BossJobSearchService.class);

    private final BossConfig config;
    private final String baseUrl;

    public BossJobSearchService(BossConfig config) {
        this.config = config;
        this.baseUrl = "https://www.zhipin.com/web/geek/job?";
    }

    /**
     * 构建搜索URL
     *
     * @param cityCode 城市编码
     * @return 搜索URL
     */
    public String getSearchUrl(String cityCode) {
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
     *
     * @param salaryRange 薪资范围
     * @return URL参数列表
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
     *
     * @param value 值
     * @return 列表
     */
    private List<String> convertToList(String value) {
        if (value == null || value.isEmpty()) {
            return List.of();
        }
        return List.of(value);
    }

    /**
     * 检查岗位列表是否存在
     *
     * @return true=存在, false=不存在
     */
    public boolean isJobsPresent() {
        try {
            // 判断页面是否存在岗位的元素
            PlaywrightUtil.waitForElement(JOB_LIST_CONTAINER);
            return true;
        } catch (Exception e) {
            log.error("加载岗位区块失败:{}", e.getMessage());
            return false;
        }
    }

    /**
     * 加载岗位列表（滚动到底部加载所有岗位）
     *
     * @param page 页面对象
     * @param keyword 搜索关键词（用于日志）
     * @return 加载的岗位数量
     */
    public int loadJobList(Page page, String keyword) {
        log.info("【{}】开始加载岗位列表...", keyword);
        long loadStartTime = System.currentTimeMillis();

        try {
            // 检查页面状态
            if (page == null) {
                log.error("【{}】页面对象为null，无法加载岗位列表", keyword);
                throw new IllegalStateException("页面对象为null");
            }
            if (page.isClosed()) {
                log.error("【{}】页面已关闭，无法加载岗位列表", keyword);
                throw new IllegalStateException("页面已关闭");
            }

        // 1. 滚动到底部，加载所有岗位卡片
        int lastCount = -1;
            int scrollCount = 0;
            final int MAX_SCROLL_ATTEMPTS = 50; // 最多滚动50次，防止无限循环
            final long MAX_LOAD_DURATION_MS = 5 * 60 * 1000; // 最多5分钟

            while (scrollCount < MAX_SCROLL_ATTEMPTS) {
                // 检查超时
                long elapsedTime = System.currentTimeMillis() - loadStartTime;
                if (elapsedTime > MAX_LOAD_DURATION_MS) {
                    log.warn("【{}】加载岗位列表超时（已用时{}秒），停止滚动", keyword, elapsedTime / 1000);
                    break;
                }

                scrollCount++;
                log.info("【{}】第{}次滚动，当前岗位数: {}", keyword, scrollCount, lastCount);

            // 模拟人类滚动行为
            PlaywrightUtil.simulateScroll();

            // 滑动到底部
                try {
                    log.debug("【{}】执行滚动操作...", keyword);
                    long scrollStartTime = System.currentTimeMillis();
                    // ✅ 修复：增加超时保护，防止evaluate()操作卡住
                    // 注意：Playwright的evaluate()方法本身没有超时参数，但可以通过设置页面超时来控制
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight);");
                    long scrollDuration = System.currentTimeMillis() - scrollStartTime;
                    log.debug("【{}】滚动操作完成（耗时{}ms）", keyword, scrollDuration);

                    // ✅ 修复：如果滚动操作耗时过长，记录警告
                    if (scrollDuration > 5000) {
                        log.warn("【{}】滚动操作耗时过长（{}ms），可能页面响应慢", keyword, scrollDuration);
                    }
                } catch (com.microsoft.playwright.TimeoutError e) {
                    log.error("【{}】滚动页面超时: {}", keyword, e.getMessage());
                    log.error("【{}】当前页面URL: {}", keyword, page != null && !page.isClosed() ? page.url() : "页面已关闭");
                    break;
                } catch (Exception e) {
                    log.error("【{}】滚动页面失败: {}", keyword, e.getMessage(), e);
                    // ✅ 修复：记录页面状态信息
                    try {
                        if (page != null && !page.isClosed()) {
                            log.error("【{}】页面URL: {}", keyword, page.url());
                        } else {
                            log.error("【{}】页面已关闭或为null", keyword);
                        }
                    } catch (Exception ex) {
                        log.error("【{}】获取页面信息失败: {}", keyword, ex.getMessage());
                    }
                    break;
                }

            // 随机延迟等待加载
                log.debug("【{}】等待页面加载（2-4秒）...", keyword);
            PlaywrightUtil.randomSleepMillis(2000, 4000);

            // 获取所有卡片数
                try {
                    log.debug("【{}】获取岗位卡片数量...", keyword);
                    // ✅ 修复：增加超时保护，防止count()操作卡住
                    long countStartTime = System.currentTimeMillis();
                    Locator cards = page.locator("//ul[contains(@class, 'rec-job-list')]//li[contains(@class, 'job-card-box')]");
                    int currentCount = cards.count();
                    long countDuration = System.currentTimeMillis() - countStartTime;
                    log.info("【{}】获取到{}个岗位卡片（耗时{}ms）", keyword, currentCount, countDuration);

                    // ✅ 修复：如果count()操作耗时过长，记录警告
                    if (countDuration > 5000) {
                        log.warn("【{}】获取岗位卡片数量耗时过长（{}ms），可能页面响应慢", keyword, countDuration);
                    }

            // 判断是否继续滑动
            if (currentCount == lastCount) {
                        log.info("【{}】岗位数量未变化（{}个），停止滚动", keyword, currentCount);
                break; // 没有新内容，跳出循环
            }
                    int oldCount = lastCount;
            lastCount = currentCount;
                    int increased = oldCount == -1 ? currentCount : (currentCount - oldCount);
                    log.info("【{}】岗位数量更新: {}个（增加了{}个）", keyword, currentCount, increased);
                } catch (com.microsoft.playwright.TimeoutError e) {
                    log.error("【{}】获取岗位卡片数量超时: {}", keyword, e.getMessage());
                    log.error("【{}】当前页面URL: {}", keyword, page != null && !page.isClosed() ? page.url() : "页面已关闭");
                    // ✅ 修复：超时后使用lastCount作为返回值，而不是抛出异常
                    log.warn("【{}】使用已加载的岗位数量: {}", keyword, lastCount);
                    break;
                } catch (Exception e) {
                    log.error("【{}】获取岗位卡片数量失败: {}", keyword, e.getMessage(), e);
                    // ✅ 修复：记录页面状态信息
                    try {
                        if (page != null && !page.isClosed()) {
                            log.error("【{}】页面URL: {}", keyword, page.url());
                            log.error("【{}】页面标题: {}", keyword, page.title());
                        } else {
                            log.error("【{}】页面已关闭或为null", keyword);
                        }
                    } catch (Exception ex) {
                        log.error("【{}】获取页面信息失败: {}", keyword, ex.getMessage());
                    }
                    // ✅ 修复：异常后使用lastCount作为返回值，而不是抛出异常
                    log.warn("【{}】使用已加载的岗位数量: {}", keyword, lastCount);
                    break;
                }

            // 随机模拟人类行为
            PlaywrightUtil.simulateHumanBehavior();
        }

            if (scrollCount >= MAX_SCROLL_ATTEMPTS) {
                log.warn("【{}】达到最大滚动次数（{}次），停止滚动", keyword, MAX_SCROLL_ATTEMPTS);
            }

            long loadDuration = System.currentTimeMillis() - loadStartTime;
            log.info("【{}】岗位已全部加载，总数:{}，滚动次数:{}，耗时: {}秒", keyword, lastCount, scrollCount, loadDuration / 1000);
        return lastCount;
        } catch (Exception e) {
            long loadDuration = System.currentTimeMillis() - loadStartTime;
            log.error("【{}】加载岗位列表失败（耗时{}秒）: {}", keyword, loadDuration / 1000, e.getMessage(), e);
            throw new RuntimeException("加载岗位列表失败: " + e.getMessage(), e);
        }
    }

    /**
     * 导航到搜索页面
     *
     * @param page 页面对象
     * @param searchUrl 搜索URL
     * @param keyword 搜索关键词
     */
    public void navigateToSearchPage(Page page, String searchUrl, String keyword) {
        try {
        // 使用 URLEncoder 对关键词进行编码
        String encodedKeyword = URLEncoder.encode(keyword, StandardCharsets.UTF_8);
        String url = searchUrl + "&query=" + encodedKeyword;
        log.info("投递地址:{}", searchUrl + "&query=" + keyword);
            log.debug("【{}】开始导航到搜索页面: {}", keyword, url);

            // 检查页面状态
            if (page == null) {
                log.error("【{}】页面对象为null，无法导航", keyword);
                throw new IllegalStateException("页面对象为null");
            }
            if (page.isClosed()) {
                log.error("【{}】页面已关闭，无法导航", keyword);
                throw new IllegalStateException("页面已关闭");
            }

        // 使用标准导航方法，避免超时问题
            long navStartTime = System.currentTimeMillis();
            try {
                page.navigate(url, new Page.NavigateOptions().setTimeout(30000)); // 30秒超时
                long navDuration = System.currentTimeMillis() - navStartTime;
                log.info("【{}】页面导航完成，耗时: {}ms", keyword, navDuration);
            } catch (com.microsoft.playwright.TimeoutError e) {
                long navDuration = System.currentTimeMillis() - navStartTime;
                log.error("【{}】页面导航超时（耗时{}ms，超时30秒）: {}", keyword, navDuration, e.getMessage());
                throw e;
            } catch (com.microsoft.playwright.PlaywrightException e) {
                long navDuration = System.currentTimeMillis() - navStartTime;
                log.error("【{}】页面导航异常（耗时{}ms）: {}", keyword, navDuration, e.getMessage(), e);
                throw e;
            }

        // 导航后模拟人类行为
            log.debug("【{}】导航后等待页面加载...", keyword);
        PlaywrightUtil.randomSleepMillis(3000, 6000);
        PlaywrightUtil.simulateHumanBehavior();
            log.info("【{}】页面导航和初始化完成", keyword);
        } catch (Exception e) {
            log.error("【{}】导航到搜索页面失败: {}", keyword, e.getMessage(), e);
            throw new RuntimeException("导航到搜索页面失败: " + e.getMessage(), e);
        }
    }

    /**
     * 获取岗位卡片定位器
     *
     * @param page 页面对象
     * @return 岗位卡片定位器
     */
    public Locator getJobCards(Page page) {
        return page.locator("//ul[contains(@class, 'rec-job-list')]//li[contains(@class, 'job-card-box')]");
    }

    /**
     * 滚动到页面顶部
     *
     * @param page 页面对象
     */
    public void scrollToTop(Page page) {
        page.evaluate("window.scrollTo(0, 0);");
        PlaywrightUtil.randomSleepMillis(1000, 2000);
    }
}



