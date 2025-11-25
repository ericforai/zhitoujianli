package boss.matcher;

import static boss.Locators.HR_ACTIVE_TIME;
import static boss.Locators.RECRUITER_INFO;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

import boss.BossConfig;
import boss.util.BossUtils;

/**
 * Boss岗位匹配器
 * 负责岗位匹配和过滤逻辑
 *
 * @author ZhiTouJianLi Team
 */
public class BossJobMatcher {
    private static final Logger log = LoggerFactory.getLogger(BossJobMatcher.class);

    private final BossConfig config;

    public BossJobMatcher(BossConfig config) {
        this.config = config;
    }

    /**
     * 匹配结果内部类
     * 用于返回匹配结果和匹配度分数
     */
    public static class MatchingResult {
        private final boolean matched;
        private final double score;
        private final int matchedScheme; // 匹配成功的方案编号（1-5）

        public MatchingResult(boolean matched, double score, int matchedScheme) {
            this.matched = matched;
            this.score = score;
            this.matchedScheme = matchedScheme;
        }

        public boolean isMatched() {
            return matched;
        }

        public double getScore() {
            return score;
        }

        public int getMatchedScheme() {
            return matchedScheme;
        }
    }

    /**
     * 检查关键词是否匹配（支持配置化匹配方案，返回匹配度和匹配方案）
     *
     * @param jobName 岗位名称
     * @param userKeyword 用户设置的关键词
     * @return 匹配结果，包含是否匹配、匹配度分数、匹配成功的方案编号
     */
    public MatchingResult isKeywordMatchedWithScore(String jobName, String userKeyword) {
        log.debug("【关键词匹配】开始匹配: 岗位='{}', 关键词='{}'", jobName, userKeyword);

        if (jobName == null || userKeyword == null || jobName.isEmpty() || userKeyword.isEmpty()) {
            log.debug("【关键词匹配】参数为空，返回false: jobName={}, userKeyword={}", jobName, userKeyword);
            return new MatchingResult(false, 0.0, 0);
        }

        // 获取匹配策略配置
        BossConfig.DeliveryStrategy strategy = this.config != null ? this.config.getDeliveryStrategy() : null;
        BossConfig.MatchingSchemes schemes = null;
        String matchingMode = "STANDARD";

        if (strategy != null) {
            matchingMode = strategy.getKeywordMatchingMode() != null ? strategy.getKeywordMatchingMode() : "STANDARD";
            schemes = strategy.getMatchingSchemes();
        }

        // 根据匹配模式确定启用的方案
        boolean enableScheme1 = true;
        boolean enableScheme2 = true;
        boolean enableScheme3 = true;
        boolean enableScheme4 = false;
        boolean enableScheme5 = false;

        if (schemes != null) {
            // 自定义模式：使用用户配置
            enableScheme1 = schemes.getEnableScheme1() != null ? schemes.getEnableScheme1() : true;
            enableScheme2 = schemes.getEnableScheme2() != null ? schemes.getEnableScheme2() : true;
            enableScheme3 = schemes.getEnableScheme3() != null ? schemes.getEnableScheme3() : true;
            enableScheme4 = schemes.getEnableScheme4() != null ? schemes.getEnableScheme4() : false;
            enableScheme5 = schemes.getEnableScheme5() != null ? schemes.getEnableScheme5() : false;
        } else {
            // 根据预设模式设置
            switch (matchingMode.toUpperCase()) {
                case "STRICT":
                    // 严格模式：只启用方案1
                    enableScheme1 = true;
                    enableScheme2 = false;
                    enableScheme3 = false;
                    enableScheme4 = false;
                    enableScheme5 = false;
                    break;
                case "FLEXIBLE":
                    // 灵活模式：启用所有方案
                    enableScheme1 = true;
                    enableScheme2 = true;
                    enableScheme3 = true;
                    enableScheme4 = true;
                    enableScheme5 = true;
                    break;
                case "STANDARD":
                default:
                    // 标准模式：启用方案1+2+3（默认）
                    enableScheme1 = true;
                    enableScheme2 = true;
                    enableScheme3 = true;
                    enableScheme4 = false;
                    enableScheme5 = false;
                    break;
            }
        }

        log.debug("【关键词匹配】匹配模式={}, 启用方案: 1={}, 2={}, 3={}, 4={}, 5={}",
            matchingMode, enableScheme1, enableScheme2, enableScheme3, enableScheme4, enableScheme5);

        // 定义职位词列表
        String[] jobTitles = {"总监", "经理", "主管", "负责人", "专员", "助理", "专家", "工程师", "运营", "营销", "推广", "策划"};

        // 首先检查是否包含明显不相关的岗位类型（优先级最高）
        String[] excludeKeywords = {"总厨", "厨师", "服务员", "保安", "保洁", "司机", "快递", "外卖", "收银", "理货", "仓管"};
        for (String exclude : excludeKeywords) {
            if (jobName.contains(exclude)) {
                log.debug("【关键词匹配】发现排除词: 岗位='{}', 排除词='{}'", jobName, exclude);
                // 如果岗位名称包含排除词，需要更严格的匹配
                boolean isMainPart = jobName.startsWith(userKeyword) || jobName.contains(userKeyword + "总监")
                    || jobName.contains(userKeyword + "经理") || jobName.contains(userKeyword + "主管")
                    || jobName.contains(userKeyword + "负责人");

                if (isMainPart) {
                    // 即使包含排除词，但如果关键词是主要部分，仍然匹配
                    log.debug("【关键词匹配】✓ 匹配成功（主要部分匹配，忽略排除词）: 岗位='{}', 关键词='{}', 排除词='{}'", jobName, userKeyword, exclude);
                    return new MatchingResult(true, 1.0, 1); // 主要部分匹配给满分
                }
                log.debug("【关键词匹配】✗ 匹配失败（岗位类型不匹配）: 岗位='{}', 关键词='{}', 排除词='{}'", jobName, userKeyword, exclude);
                return new MatchingResult(false, 0.0, 0);
            }
        }

        // 对于长关键词（≥3字）
        if (userKeyword.length() >= 3) {
            log.debug("【关键词匹配】长关键词（≥3字）匹配: 关键词='{}', 长度={}", userKeyword, userKeyword.length());

            // 方案1：关键词是岗位名称的开头
            if (enableScheme1 && jobName.startsWith(userKeyword)) {
                log.debug("【关键词匹配】✓ 匹配成功（方案1-开头匹配）: 岗位='{}', 关键词='{}'", jobName, userKeyword);
                return new MatchingResult(true, 1.0, 1);
            }

            // 方案2：关键词后面跟着职位相关词汇
            if (enableScheme2) {
                for (String title : jobTitles) {
                    String keywordWithTitle = userKeyword + title;
                    if (jobName.contains(keywordWithTitle)) {
                        log.debug("【关键词匹配】✓ 匹配成功（方案2-职位匹配）: 岗位='{}', 关键词='{}', 职位='{}', 组合='{}'", jobName, userKeyword, title, keywordWithTitle);
                        return new MatchingResult(true, 0.8, 2);
                    }
                }
            }

            // 方案3：完整词匹配（词边界检查）
            if (enableScheme3) {
                int index = jobName.indexOf(userKeyword);
                if (index >= 0) {
                    boolean isWordBoundaryBefore = (index == 0) || !BossUtils.isChineseChar(jobName.charAt(index - 1));
                    int endIndex = index + userKeyword.length();
                    boolean isWordBoundaryAfter = (endIndex >= jobName.length()) || !BossUtils.isChineseChar(jobName.charAt(endIndex));

                    if (isWordBoundaryBefore && isWordBoundaryAfter) {
                        log.debug("【关键词匹配】✓ 匹配成功（方案3-完整词匹配）: 岗位='{}', 关键词='{}'", jobName, userKeyword);
                        return new MatchingResult(true, 0.7, 3);
                    }
                }
            }

            // 方案4：拆分匹配（长关键词）
            if (enableScheme4) {
                for (String title : jobTitles) {
                    if (userKeyword.endsWith(title) && userKeyword.length() > title.length()) {
                        String coreKeyword = userKeyword.substring(0, userKeyword.length() - title.length());
                        if (coreKeyword.length() >= 2) {
                            log.debug("【关键词匹配】尝试方案4（拆分匹配）: 关键词='{}', 核心词='{}', 职位词='{}'", userKeyword, coreKeyword, title);

                            boolean hasCoreKeyword = jobName.contains(coreKeyword);
                            boolean hasTitle = jobName.contains(title);

                            if (hasCoreKeyword && hasTitle) {
                                int coreIndex = jobName.indexOf(coreKeyword);
                                if (coreIndex >= 0) {
                                    boolean isCoreWordBoundaryBefore = (coreIndex == 0) || !BossUtils.isChineseChar(jobName.charAt(coreIndex - 1));
                                    int coreEndIndex = coreIndex + coreKeyword.length();
                                    boolean isCoreWordBoundaryAfter = (coreEndIndex >= jobName.length()) || !BossUtils.isChineseChar(jobName.charAt(coreEndIndex));

                                    if (isCoreWordBoundaryBefore && (isCoreWordBoundaryAfter || jobName.substring(coreEndIndex).contains(title))) {
                                        log.debug("【关键词匹配】✓ 匹配成功（方案4-拆分匹配）: 岗位='{}', 关键词='{}', 核心词='{}', 职位词='{}'",
                                            jobName, userKeyword, coreKeyword, title);
                                        return new MatchingResult(true, 0.6, 4);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else {
            // 对于短关键词（≤2字）
            log.debug("【关键词匹配】短关键词（≤2字）匹配: 关键词='{}', 长度={}", userKeyword, userKeyword.length());

            // 方案1：如果关键词是岗位名称的开头部分，则匹配
            if (enableScheme1 && jobName.startsWith(userKeyword)) {
                log.debug("【关键词匹配】✓ 匹配成功（方案1-开头匹配）: 岗位='{}', 关键词='{}'", jobName, userKeyword);
                return new MatchingResult(true, 1.0, 1);
            }

            // 方案2：如果关键词后面跟着职位相关词汇，则匹配
            if (enableScheme2) {
                for (String title : jobTitles) {
                    String keywordWithTitle = userKeyword + title;
                    if (jobName.contains(keywordWithTitle)) {
                        log.debug("【关键词匹配】✓ 匹配成功（方案2-职位匹配）: 岗位='{}', 关键词='{}', 职位='{}', 组合='{}'", jobName, userKeyword, title, keywordWithTitle);
                        return new MatchingResult(true, 0.8, 2);
                    }
                }
            }

            // 方案3：关键词是完整词（前后都是词边界）
            if (enableScheme3) {
                int index = jobName.indexOf(userKeyword);
                if (index >= 0) {
                    boolean isWordBoundaryBefore = (index == 0) || !BossUtils.isChineseChar(jobName.charAt(index - 1));
                    int endIndex = index + userKeyword.length();
                    boolean isWordBoundaryAfter = (endIndex >= jobName.length()) || !BossUtils.isChineseChar(jobName.charAt(endIndex));

                    if (isWordBoundaryBefore && isWordBoundaryAfter) {
                        log.debug("【关键词匹配】✓ 匹配成功（方案3-完整词匹配）: 岗位='{}', 关键词='{}'", jobName, userKeyword);
                        return new MatchingResult(true, 0.7, 3);
                    }
                }
            }

            // 方案5：短词+职位组合匹配
            if (enableScheme5) {
                for (String title : jobTitles) {
                    String keywordWithTitle = userKeyword + title;
                    if (jobName.contains(keywordWithTitle)) {
                        int kwIndex = jobName.indexOf(userKeyword);
                        if (kwIndex >= 0) {
                            boolean isKwBoundaryBefore = (kwIndex == 0) || !BossUtils.isChineseChar(jobName.charAt(kwIndex - 1));
                            if (isKwBoundaryBefore) {
                                log.debug("【关键词匹配】✓ 匹配成功（方案5-短词+职位组合匹配）: 岗位='{}', 关键词='{}', 职位='{}', 组合='{}'",
                                    jobName, userKeyword, title, keywordWithTitle);
                                return new MatchingResult(true, 0.6, 5);
                            }
                        }
                    }
                }
            }
        }

        log.debug("【关键词匹配】✗ 所有方案都失败，返回false: 岗位='{}', 关键词='{}'", jobName, userKeyword);
        return new MatchingResult(false, 0.0, 0);
    }

    /**
     * 检查岗位薪资是否符合预期
     *
     * @param salary 薪资文本
     * @return true=不符合预期, false=符合预期
     */
    public boolean isSalaryNotExpected(String salary) {
        try {
            // 1. 如果没有期望薪资范围，直接返回 false，表示"薪资并非不符合预期"
            List<Integer> expectedSalary = this.config.getExpectedSalary();
            if (!BossUtils.hasExpectedSalary(expectedSalary)) {
                return false;
            }

            // 2. 清理薪资文本（比如去掉 "·15薪"）
            salary = BossUtils.removeYearBonusText(salary);

            // 3. 如果薪资格式不符合预期（如缺少 "K" / "k"），直接返回 true，表示"薪资不符合预期"
            if (!BossUtils.isSalaryInExpectedFormat(salary)) {
                return true;
            }

            // 4. 进一步清理薪资文本，比如去除 "K"、"k"、"·" 等
            salary = BossUtils.cleanSalaryText(salary);

            // 5. 判断是 "月薪" 还是 "日薪"
            String jobType = BossUtils.detectJobType(salary);
            salary = BossUtils.removeDayUnitIfNeeded(salary); // 如果是按天，则去除 "元/天"

            // 6. 解析薪资范围并检查是否超出预期
            Integer[] jobSalaryRange = BossUtils.parseSalaryRange(salary);
            return BossUtils.isSalaryOutOfRange(jobSalaryRange,
                    BossUtils.getMinimumSalary(expectedSalary),
                    BossUtils.getMaximumSalary(expectedSalary),
                    jobType);

        } catch (Exception e) {
            log.error("岗位薪资获取异常！薪资文本【{}】,异常信息【{}】", salary, e.getMessage(), e);
            // 出错时，您可根据业务需求决定返回 true 或 false
            // 这里假设出错时无法判断，视为不满足预期 => 返回 true
            return true;
        }
    }

    /**
     * 检查HR是否不活跃
     *
     * @param page 页面对象
     * @return true=HR不活跃, false=HR活跃或未配置过滤
     */
    public boolean isDeadHR(Page page) {
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

    /**
     * 检查HR活跃状态是否包含不活跃标识
     *
     * @param activeTimeText HR活跃时间文本
     * @param deadStatus 不活跃状态列表
     * @return true=包含不活跃标识, false=不包含
     */
    public static boolean containsDeadStatus(String activeTimeText, List<String> deadStatus) {
        for (String status : deadStatus) {
            if (activeTimeText.contains(status)) {
                return true;// 一旦找到包含的值，立即返回 true
            }
        }
        return false;// 如果没有找到，返回 false
    }

    /**
     * 获取公司和HR信息
     *
     * @param page 页面对象
     * @return 公司和HR信息文本
     */
    private String getCompanyAndHR(Page page) {
        Locator recruiterLocator = page.locator(RECRUITER_INFO);
        if (recruiterLocator.count() > 0) {
            return recruiterLocator.textContent().replaceAll("%n", "");
        }
        return "未知公司和HR";
    }
}


