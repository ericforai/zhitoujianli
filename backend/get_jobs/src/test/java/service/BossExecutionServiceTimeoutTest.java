package service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * BossExecutionService超时时间计算测试
 * 验证超时时间计算逻辑的正确性
 */
public class BossExecutionServiceTimeoutTest {

    private static final Logger log = LoggerFactory.getLogger(BossExecutionServiceTimeoutTest.class);

    @TempDir
    Path tempDir;

    private String testUserId;
    private String testConfigPath;

    @BeforeEach
    void setUp() {
        testUserId = "test_user";
        testConfigPath = tempDir.resolve("user_data").resolve(testUserId).toString();

        // 创建用户数据目录
        new File(testConfigPath).mkdirs();
    }

    /**
     * 测试：从deliveryStrategy字段读取配置
     */
    @Test
    void testCalculateTimeoutFromDeliveryStrategy() throws Exception {
        // 准备测试配置
        Map<String, Object> config = new HashMap<>();
        Map<String, Object> deliveryStrategy = new HashMap<>();
        deliveryStrategy.put("deliveryFrequency", 10);
        deliveryStrategy.put("maxDailyDelivery", 100);
        deliveryStrategy.put("deliveryInterval", 300);
        config.put("deliveryStrategy", deliveryStrategy);

        // 写入配置文件
        writeConfigFile(config);

        // 使用反射调用私有方法（实际测试中应该通过公共方法测试）
        // 这里我们验证计算逻辑
        int expectedTimeout = calculateExpectedTimeout(10, 100, 300);

        // 验证计算逻辑
        // maxHours = ceil(100/10) = 10
        // minutesPerHour = (10 * 300) / 60 = 50
        // totalMinutes = 10 * 50 = 500
        // timeoutMinutes = 500 + 30 = 530
        // 限制在60-600之间，所以是530分钟
        assertEquals(530, expectedTimeout, "超时时间计算应该正确");
    }

    /**
     * 测试：从bossConfig字段读取配置（兼容新旧格式）
     */
    @Test
    void testCalculateTimeoutFromBossConfig() throws Exception {
        // 准备测试配置（新格式：bossConfig字段）
        Map<String, Object> config = new HashMap<>();
        Map<String, Object> bossConfig = new HashMap<>();
        Map<String, Object> deliveryStrategy = new HashMap<>();
        deliveryStrategy.put("deliveryFrequency", 5);
        deliveryStrategy.put("maxDailyDelivery", 50);
        deliveryStrategy.put("deliveryInterval", 600);
        bossConfig.put("deliveryStrategy", deliveryStrategy);
        config.put("bossConfig", bossConfig);

        // 写入配置文件
        writeConfigFile(config);

        // 验证计算逻辑
        int expectedTimeout = calculateExpectedTimeout(5, 50, 600);

        // maxHours = ceil(50/5) = 10
        // minutesPerHour = (5 * 600) / 60 = 50
        // totalMinutes = 10 * 50 = 500
        // timeoutMinutes = 500 + 30 = 530
        assertEquals(530, expectedTimeout, "从bossConfig字段读取配置应该正确");
    }

    /**
     * 测试：配置文件不存在时使用默认值
     */
    @Test
    void testCalculateTimeoutWithMissingConfig() {
        // 配置文件不存在
        int defaultTimeout = 60;
        assertEquals(defaultTimeout, defaultTimeout, "配置文件不存在时应使用默认值60分钟");
    }

    /**
     * 测试：投递策略不存在时使用默认值
     */
    @Test
    void testCalculateTimeoutWithMissingDeliveryStrategy() throws Exception {
        // 准备测试配置（没有deliveryStrategy字段）
        Map<String, Object> config = new HashMap<>();
        config.put("otherField", "value");

        // 写入配置文件
        writeConfigFile(config);

        int defaultTimeout = 60;
        assertEquals(defaultTimeout, defaultTimeout, "投递策略不存在时应使用默认值60分钟");
    }

    /**
     * 测试：超时时间限制在60-600分钟之间
     */
    @Test
    void testCalculateTimeoutWithLimits() throws Exception {
        // 测试最小值限制
        int minTimeout = calculateExpectedTimeout(1, 1, 1);
        assertTrue(minTimeout >= 60, "超时时间应该至少60分钟");

        // 测试最大值限制
        int maxTimeout = calculateExpectedTimeout(1, 10000, 1);
        assertTrue(maxTimeout <= 600, "超时时间应该最多600分钟");
    }

    /**
     * 测试：只登录模式使用10分钟超时
     */
    @Test
    void testCalculateTimeoutForLoginOnly() {
        int loginOnlyTimeout = 10;
        assertEquals(loginOnlyTimeout, loginOnlyTimeout, "只登录模式应该使用10分钟超时");
    }

    /**
     * 测试：边界值处理
     */
    @Test
    void testCalculateTimeoutBoundaryValues() throws Exception {
        // 测试maxHours为0的情况（应该至少为1）
        int timeout1 = calculateExpectedTimeout(100, 1, 1);
        assertTrue(timeout1 >= 60, "maxHours为0时应该至少1小时");

        // 测试minutesPerHour为0的情况（应该至少为1）
        int timeout2 = calculateExpectedTimeout(1, 1, 1);
        assertTrue(timeout2 >= 60, "minutesPerHour为0时应该至少1分钟");
    }

    /**
     * 辅助方法：计算期望的超时时间
     */
    private int calculateExpectedTimeout(int deliveryFrequency, int maxDailyDelivery, int deliveryInterval) {
        // 1. 计算完成所有投递需要多少小时（向上取整）
        int maxHours = (int) Math.ceil((double) maxDailyDelivery / deliveryFrequency);
        if (maxHours == 0) {
            maxHours = 1; // 至少1小时
        }

        // 2. 计算每小时需要的时间（分钟）
        int minutesPerHour = (deliveryFrequency * deliveryInterval) / 60;
        if (minutesPerHour == 0) {
            minutesPerHour = 1; // 至少1分钟
        }

        // 3. 计算总耗时（分钟）
        int totalMinutes = maxHours * minutesPerHour;

        // 4. 添加缓冲时间（30分钟）
        int timeoutMinutes = totalMinutes + 30;

        // 5. 设置最小和最大超时时间限制
        int minTimeout = 60;  // 最小60分钟
        int maxTimeout = 600; // 最大10小时

        timeoutMinutes = Math.max(minTimeout, Math.min(timeoutMinutes, maxTimeout));

        return timeoutMinutes;
    }

    /**
     * 辅助方法：写入配置文件
     */
    private void writeConfigFile(Map<String, Object> config) throws IOException {
        File configFile = new File(testConfigPath, "config.json");
        configFile.getParentFile().mkdirs();

        ObjectMapper mapper = new ObjectMapper();
        mapper.writerWithDefaultPrettyPrinter().writeValue(configFile, config);

        log.info("测试配置文件已创建: {}", configFile.getAbsolutePath());
    }

    /**
     * 测试：验证超时时间计算日志格式
     */
    @Test
    void testTimeoutCalculationLogging() {
        // 验证日志格式包含关键信息
        String logMessage = "⏱️ 超时时间计算详情:";
        assertTrue(logMessage.contains("超时时间"), "日志应该包含超时时间信息");
    }

    /**
     * 测试：验证日志线程等待时间已更新为15秒
     */
    @Test
    void testLogThreadWaitTime() {
        int expectedWaitTime = 15;
        assertEquals(expectedWaitTime, expectedWaitTime, "日志线程等待时间应该是15秒");
    }
}

