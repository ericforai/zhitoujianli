package boss.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.microsoft.playwright.Locator;

/**
 * Boss工具类
 * 提供通用的静态工具方法
 *
 * @author ZhiTouJianLi Team
 */
public class BossUtils {
    private static final Logger log = LoggerFactory.getLogger(BossUtils.class);

    /**
     * 解码薪资（处理Boss直聘的特殊字体编码）
     *
     * @param text 原始薪资文本
     * @return 解码后的薪资文本
     */
    public static String decodeSalary(String text) {
        Map<Character, Character> fontMap = new HashMap<>();
        // Boss直聘的特殊字体编码字符（从Boss.java复制）
        // 注意：这些是特殊的Unicode字符，用于Boss直聘的字体反爬虫
        fontMap.put('\uE000', '0');  // 特殊字体字符0
        fontMap.put('\uE001', '1');  // 特殊字体字符1
        fontMap.put('\uE002', '2');  // 特殊字体字符2
        fontMap.put('\uE003', '3');  // 特殊字体字符3
        fontMap.put('\uE004', '4');  // 特殊字体字符4
        fontMap.put('\uE005', '5');  // 特殊字体字符5
        fontMap.put('\uE006', '6');  // 特殊字体字符6
        fontMap.put('\uE007', '7');  // 特殊字体字符7
        fontMap.put('\uE008', '8');  // 特殊字体字符8
        fontMap.put('\uE009', '9');  // 特殊字体字符9
        StringBuilder result = new StringBuilder();
        for (char c : text.toCharArray()) {
            result.append(fontMap.getOrDefault(c, c));
        }
        return result.toString();
    }

    /**
     * 判断字符是否是中文字符
     *
     * @param c 字符
     * @return 是否是中文字符
     */
    public static boolean isChineseChar(char c) {
        return c >= 0x4E00 && c <= 0x9FA5;
    }

    /**
     * 安全获取单个文本内容
     *
     * @param root 根定位器
     * @param selector 选择器
     * @return 文本内容，如果获取失败返回空字符串
     */
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

    /**
     * 安全获取多个文本内容
     *
     * @param root 根定位器
     * @param selector 选择器
     * @return 文本内容列表，如果获取失败返回空列表
     */
    public static List<String> safeAllText(Locator root, String selector) {
        try {
            return root.locator(selector).allInnerTexts();
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    /**
     * Boss姓名+活跃状态拆分
     *
     * @param raw 原始文本
     * @return [姓名, 活跃状态]
     */
    public static String[] splitBossName(String raw) {
        String[] bossParts = raw.trim().split("\\s+");
        String bossName = bossParts[0];
        String bossActive = bossParts.length > 1 ? String.join(" ", Arrays.copyOfRange(bossParts, 1, bossParts.length)) : "";
        return new String[]{bossName, bossActive};
    }

    /**
     * Boss公司+职位拆分
     *
     * @param raw 原始文本
     * @return [公司名, 职位]
     */
    public static String[] splitBossTitle(String raw) {
        String[] parts = raw.trim().split(" · ");
        String company = parts[0];
        String job = parts.length > 1 ? parts[1] : "";
        return new String[]{company, job};
    }

    /**
     * 验证字符串是否有效
     *
     * @param str 字符串
     * @return 是否有效
     */
    public static boolean isValidString(String str) {
        return str != null && !str.isEmpty();
    }

    /**
     * 去掉年终奖信息，如 "·15薪"、"·13薪"
     *
     * @param salary 薪资文本
     * @return 清理后的薪资文本
     */
    public static String removeYearBonusText(String salary) {
        if (salary.contains("薪")) {
            // 使用正则去除 "·任意数字薪"
            return salary.replaceAll("·\\d+薪", "");
        }
        return salary;
    }

    /**
     * 判断是否是按天计薪，如发现 "元/天" 则认为是日薪
     *
     * @param salary 薪资文本
     * @return "day" 或 "mouth"
     */
    public static String detectJobType(String salary) {
        if (salary.contains("元/天")) {
            return "day";
        }
        return "mouth";
    }

    /**
     * 如果是日薪，则去除 "元/天"
     *
     * @param salary 薪资文本
     * @return 清理后的薪资文本
     */
    public static String removeDayUnitIfNeeded(String salary) {
        if (salary.contains("元/天")) {
            return salary.replaceAll("元/天", "");
        }
        return salary;
    }

    /**
     * 获取最低薪资
     *
     * @param expectedSalary 期望薪资列表
     * @return 最低薪资
     */
    public static Integer getMinimumSalary(List<Integer> expectedSalary) {
        return expectedSalary != null && !expectedSalary.isEmpty() ? expectedSalary.get(0) : null;
    }

    /**
     * 获取最高薪资
     *
     * @param expectedSalary 期望薪资列表
     * @return 最高薪资
     */
    public static Integer getMaximumSalary(List<Integer> expectedSalary) {
        return expectedSalary != null && expectedSalary.size() > 1 ? expectedSalary.get(1) : null;
    }

    /**
     * 判断薪资格式是否符合预期
     *
     * @param salaryText 薪资文本
     * @return 是否符合格式
     */
    public static boolean isSalaryInExpectedFormat(String salaryText) {
        return salaryText.contains("K") || salaryText.contains("k") || salaryText.contains("元/天");
    }

    /**
     * 清理薪资文本
     *
     * @param salaryText 薪资文本
     * @return 清理后的薪资文本
     */
    public static String cleanSalaryText(String salaryText) {
        salaryText = salaryText.replace("K", "").replace("k", "");
        int dotIndex = salaryText.indexOf('·');
        if (dotIndex != -1) {
            salaryText = salaryText.substring(0, dotIndex);
        }
        return salaryText;
    }

    /**
     * 解析薪资范围
     *
     * @param salaryText 薪资文本
     * @return 薪资范围数组 [最低, 最高]
     */
    public static Integer[] parseSalaryRange(String salaryText) {
        try {
            return Arrays.stream(salaryText.split("-"))
                    .map(s -> s.replaceAll("[^0-9]", "")) // 去除非数字字符
                    .map(Integer::parseInt) // 转换为Integer
                    .toArray(Integer[]::new); // 转换为Integer数组
        } catch (Exception e) {
            log.error("薪资解析异常！{}", e.getMessage(), e);
        }
        return new Integer[0];
    }

    /**
     * 判断薪资是否超出范围
     *
     * @param jobSalary 岗位薪资 [最低, 最高]
     * @param miniSalary 期望最低薪资
     * @param maxSalary 期望最高薪资
     * @param jobType 工作类型 ("day" 或 "mouth")
     * @return true=超出范围, false=在范围内
     */
    public static boolean isSalaryOutOfRange(Integer[] jobSalary, Integer miniSalary, Integer maxSalary,
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

    /**
     * 是否存在有效的期望薪资范围
     *
     * @param expectedSalary 期望薪资列表
     * @return 是否存在有效范围
     */
    public static boolean hasExpectedSalary(List<Integer> expectedSalary) {
        return expectedSalary != null && !expectedSalary.isEmpty();
    }
}

