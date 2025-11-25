package boss;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

import lombok.extern.slf4j.Slf4j;

/**
 * 投递控制器
 * 负责控制投递频率、每日限额、投递间隔等
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-04
 */
@Slf4j
public class DeliveryController {

    private final BossConfig.DeliveryStrategy strategy;

    // 每日投递计数器
    private final AtomicInteger dailyDeliveryCount;
    private LocalDate currentDate = LocalDate.now();

    // 投递频率控制（每小时）
    private final AtomicInteger hourlyDeliveryCount = new AtomicInteger(0);
    private long lastHourResetTime = System.currentTimeMillis();

    // 投递间隔控制
    private final AtomicLong lastDeliveryTime = new AtomicLong(0);

    /**
     * 构造函数
     */
    public DeliveryController(BossConfig.DeliveryStrategy strategy) {
        this.strategy = strategy != null ? strategy : new BossConfig.DeliveryStrategy();

        // 🔥 修复：初始化时从日志文件读取今日已投递数量，防止重启后计数器重置导致超限
        int todayDeliveryCount = loadTodayDeliveryCountFromLog();
        this.dailyDeliveryCount = new AtomicInteger(todayDeliveryCount);

        log.info("📊 投递控制器初始化: 启用={}, 频率={}/小时, 每日限额={}, 间隔={}秒, 今日已投递={}",
            this.strategy.getEnableAutoDelivery(),
            this.strategy.getDeliveryFrequency(),
            this.strategy.getMaxDailyDelivery(),
            this.strategy.getDeliveryInterval(),
            todayDeliveryCount);
    }

    /**
     * 检查是否可以投递
     *
     * @param matchScore 匹配度分数（0.0-1.0）
     * @return true=可以投递, false=不可投递
     */
    public boolean canDeliver(double matchScore) {
        // 1. 检查是否启用自动投递
        if (strategy.getEnableAutoDelivery() != null && !strategy.getEnableAutoDelivery()) {
            log.debug("⏸️ 自动投递未启用");
            return true; // 手动模式，允许投递
        }

        // 2. 检查匹配度阈值
        if (!checkMatchThreshold(matchScore)) {
            return false;
        }

        // 3. 检查投递时间范围
        if (!checkTimeRange()) {
            return false;
        }

        // 4. 检查每日限额
        if (!checkDailyLimit()) {
            return false;
        }

        // 5. 检查投递频率（每小时）
        if (!checkHourlyFrequency()) {
            return false;
        }

        // 6. 检查投递间隔
        if (!checkDeliveryInterval()) {
            return false;
        }

        return true;
    }

    /**
     * 记录一次投递
     */
    public void recordDelivery() {
        // 检查是否需要重置每日计数器
        LocalDate today = LocalDate.now();
        if (!today.equals(currentDate)) {
            log.info("📅 日期变更: {} -> {}, 重置每日计数器", currentDate, today);
            dailyDeliveryCount.set(0);
            currentDate = today;
        }

        // 检查是否需要重置每小时计数器
        long now = System.currentTimeMillis();
        if (now - lastHourResetTime > 3600_000) { // 1小时 = 3600秒 = 3600000毫秒
            log.info("⏰ 小时重置: 清空频率计数器");
            hourlyDeliveryCount.set(0);
            lastHourResetTime = now;
        }

        // 增加计数
        int dailyCount = dailyDeliveryCount.incrementAndGet();
        int hourlyCount = hourlyDeliveryCount.incrementAndGet();
        lastDeliveryTime.set(now);

        log.info("📈 投递统计: 今日={}/{}, 本小时={}/{}",
            dailyCount, strategy.getMaxDailyDelivery(),
            hourlyCount, strategy.getDeliveryFrequency());
    }

    /**
     * 获取建议的等待时间（毫秒）
     */
    public long getRecommendedWaitTime() {
        // 基于投递间隔计算
        Integer interval = strategy.getDeliveryInterval();
        if (interval == null || interval <= 0) {
            interval = 300; // 默认5分钟
        }

        // 添加随机波动（±20%）避免被检测为机器人
        double randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 ~ 1.2
        long waitTime = (long) (interval * 1000 * randomFactor);

        log.debug("⏱️ 建议等待时间: {}秒 (原始={}秒, 随机因子={})",
            waitTime / 1000, interval, String.format("%.2f", randomFactor));

        return waitTime;
    }

    /**
     * 检查匹配度阈值
     */
    private boolean checkMatchThreshold(double matchScore) {
        Double threshold = strategy.getMatchThreshold();
        if (threshold == null) {
            threshold = 0.7; // 默认阈值70%
        }

        if (matchScore < threshold) {
            log.info("❌ 匹配度不足: {}% < {}% (阈值)",
                String.format("%.1f", matchScore * 100),
                String.format("%.1f", threshold * 100));
            return false;
        }

        log.debug("✅ 匹配度合格: {}% >= {}%",
            String.format("%.1f", matchScore * 100),
            String.format("%.1f", threshold * 100));
        return true;
    }

    /**
     * 检查投递时间范围
     */
    private boolean checkTimeRange() {
        BossConfig.TimeRange timeRange = strategy.getDeliveryTimeRange();
        if (timeRange == null) {
            return true; // 未设置时间范围，允许全天投递
        }

        String startTime = timeRange.getStartTime();
        String endTime = timeRange.getEndTime();

        // 如果是默认值（00:00 - 00:00 或 00:00 - 23:59），允许全天投递
        if (("00:00".equals(startTime) && "00:00".equals(endTime)) ||
            ("00:00".equals(startTime) && "23:59".equals(endTime))) {
            return true;
        }

        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
            LocalTime now = LocalTime.now();
            LocalTime start = LocalTime.parse(startTime, formatter);
            LocalTime end = LocalTime.parse(endTime, formatter);

            boolean inRange = now.isAfter(start) && now.isBefore(end);
            if (!inRange) {
                log.info("⏰ 当前时间 {} 不在投递范围内 ({} - {})", now, startTime, endTime);
                return false;
            }

            log.debug("✅ 时间范围检查通过: {} 在 {} - {} 之间", now, startTime, endTime);
            return true;

        } catch (Exception e) {
            log.warn("⚠️ 时间范围解析失败: {}, 允许投递", e.getMessage());
            return true;
        }
    }

    /**
     * 检查每日限额
     */
    private boolean checkDailyLimit() {
        // 检查日期是否变更
        LocalDate today = LocalDate.now();
        if (!today.equals(currentDate)) {
            log.info("📅 日期变更，重置计数器: {} -> {}", currentDate, today);
            dailyDeliveryCount.set(0);
            currentDate = today;
        }

        int currentCount = dailyDeliveryCount.get();
        Integer maxDaily = strategy.getMaxDailyDelivery();
        if (maxDaily == null) {
            maxDaily = 100; // 默认每日100次
        }

        if (currentCount >= maxDaily) {
            log.warn("🚫 已达每日投递限额: {}/{}", currentCount, maxDaily);
            return false;
        }

        log.debug("✅ 每日限额检查通过: {}/{}", currentCount, maxDaily);
        return true;
    }

    /**
     * 检查投递频率（每小时）
     */
    private boolean checkHourlyFrequency() {
        // 检查是否需要重置计数器（每小时）
        long now = System.currentTimeMillis();
        if (now - lastHourResetTime > 3600_000) {
            log.info("⏰ 小时重置，清空频率计数器");
            hourlyDeliveryCount.set(0);
            lastHourResetTime = now;
        }

        int currentCount = hourlyDeliveryCount.get();
        Integer frequency = strategy.getDeliveryFrequency();
        if (frequency == null) {
            frequency = 10; // 默认每小时10次
        }

        if (currentCount >= frequency) {
            log.warn("🚫 已达小时投递频率限制: {}/{}", currentCount, frequency);
            return false;
        }

        log.debug("✅ 投递频率检查通过: {}/{} (本小时)", currentCount, frequency);
        return true;
    }

    /**
     * 检查投递间隔
     */
    private boolean checkDeliveryInterval() {
        long lastTime = lastDeliveryTime.get();
        if (lastTime == 0) {
            log.debug("✅ 首次投递，无需检查间隔");
            return true; // 首次投递
        }

        long now = System.currentTimeMillis();
        long elapsedSeconds = (now - lastTime) / 1000;

        Integer interval = strategy.getDeliveryInterval();
        if (interval == null) {
            interval = 300; // 默认5分钟
        }

        if (elapsedSeconds < interval) {
            long remainingSeconds = interval - elapsedSeconds;
            log.info("⏳ 投递间隔不足: 已等待{}秒, 还需等待{}秒", elapsedSeconds, remainingSeconds);
            return false;
        }

        log.debug("✅ 投递间隔检查通过: 已等待{}秒 >= {}秒", elapsedSeconds, interval);
        return true;
    }

    /**
     * 获取当前统计信息
     */
    public String getStatistics() {
        return String.format("投递统计 [今日: %d/%d, 本小时: %d/%d]",
            dailyDeliveryCount.get(), strategy.getMaxDailyDelivery(),
            hourlyDeliveryCount.get(), strategy.getDeliveryFrequency());
    }

    /**
     * 从数据库加载今日已投递数量（配额使用量）
     *
     * ✅ 修复：使用数据库配额作为唯一数据源，确保数据一致性
     * 不再从日志文件统计，避免历史数据或失败投递的干扰
     *
     * @return 今日已投递数量（从数据库配额使用量获取）
     */
    private int loadTodayDeliveryCountFromLog() {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            // ✅ 修复：在Boss隔离环境中，从环境变量获取用户ID（避免依赖Spring Security）
            String userId;
            try {
                // 优先尝试从环境变量获取（Boss隔离进程）
                userId = System.getProperty("boss.user.id");
                if (userId == null || userId.isEmpty()) {
                    userId = System.getenv("BOSS_USER_ID");
                }
                // 如果环境变量也没有，再尝试从Spring Security获取
                if (userId == null || userId.isEmpty()) {
                    userId = util.UserContextUtil.getCurrentUserId();
                }
            } catch (NoClassDefFoundError e) {
                // Boss隔离环境中没有Spring Security，使用环境变量
                log.debug("Spring Security不可用（隔离环境），使用环境变量获取用户ID");
                userId = System.getProperty("boss.user.id");
                if (userId == null || userId.isEmpty()) {
                    userId = System.getenv("BOSS_USER_ID");
                }
            } catch (Exception e) {
                // 其他异常，使用默认值
                log.warn("获取用户ID失败: {}", e.getMessage());
                userId = System.getProperty("boss.user.id");
                if (userId == null || userId.isEmpty()) {
                    userId = System.getenv("BOSS_USER_ID");
                }
            }

            if (userId == null || userId.isEmpty()) {
                // ❌ 不再使用default_user fallback（多租户隔离要求）
                log.error("❌ 未提供用户ID（boss.user.id或BOSS_USER_ID），无法查询配额使用量");
                return 0; // 返回0表示未找到投递记录
            }

            // 从环境变量或系统属性获取数据库连接信息
            String dbUrl = System.getProperty("DATABASE_URL", System.getenv("DATABASE_URL"));
            if (dbUrl == null || dbUrl.isEmpty()) {
                dbUrl = "jdbc:postgresql://localhost:5432/zhitoujianli";
            }
            String dbUser = System.getProperty("DB_USERNAME", System.getenv("DB_USERNAME"));
            if (dbUser == null || dbUser.isEmpty()) {
                dbUser = "zhitoujianli";
            }
            String dbPassword = System.getProperty("DB_PASSWORD", System.getenv("DB_PASSWORD"));
            if (dbPassword == null || dbPassword.isEmpty()) {
                dbPassword = "zhitoujianli123";
            }

            // 建立数据库连接
            conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);

            // 1. 查询配额定义ID
            String quotaKey = "daily_job_application";
            stmt = conn.prepareStatement(
                "SELECT id FROM quota_definitions WHERE quota_key = ? AND is_active = true");
            stmt.setString(1, quotaKey);
            rs = stmt.executeQuery();

            if (!rs.next()) {
                log.warn("⚠️ 配额定义不存在: quotaKey={}，今日投递数量初始化为0", quotaKey);
                return 0;
            }
            Long quotaId = rs.getLong("id");
            rs.close();
            stmt.close();

            // 2. 查询今日配额使用量
            LocalDate today = LocalDate.now();
            stmt = conn.prepareStatement(
                "SELECT used_amount FROM user_quota_usage WHERE user_id = ? AND quota_id = ? AND reset_date = ?");
            stmt.setString(1, userId);
            stmt.setLong(2, quotaId);
            stmt.setObject(3, today);
            rs = stmt.executeQuery();

            int usedAmount = 0;
            if (rs.next()) {
                usedAmount = (int) rs.getLong("used_amount");
            }
            rs.close();
            stmt.close();

            log.info("✅ 从数据库加载今日已投递数量: {} (用户: {}, 配额: {})", usedAmount, userId, quotaKey);
            return usedAmount;

        } catch (Exception e) {
            log.error("❌ 从数据库加载今日投递数量失败，返回0", e);
            return 0;
        } finally {
            // 关闭数据库连接
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            } catch (Exception e) {
                log.error("关闭数据库连接失败", e);
            }
        }
    }

    /**
     * 重置所有计数器（用于测试）
     */
    public void resetAll() {
        dailyDeliveryCount.set(0);
        hourlyDeliveryCount.set(0);
        lastDeliveryTime.set(0);
        currentDate = LocalDate.now();
        lastHourResetTime = System.currentTimeMillis();
        log.info("🔄 所有计数器已重置");
    }
}


