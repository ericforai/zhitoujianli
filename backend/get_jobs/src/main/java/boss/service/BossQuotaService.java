package boss.service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import service.QuotaService;
import util.SpringContextUtil;

/**
 * Boss配额管理服务
 * 负责配额检查和消费
 *
 * @author ZhiTouJianLi Team
 */
public class BossQuotaService {
    private static final Logger log = LoggerFactory.getLogger(BossQuotaService.class);

    private final String userId;

    public BossQuotaService(String userId) {
        this.userId = userId;
    }

    /**
     * 投递前检查配额
     * 检查daily_job_application配额是否足够
     *
     * 由于Boss在独立进程中运行，无法使用Spring Bean，因此通过JDBC直接查询数据库
     *
     * @return true表示配额足够，可以投递；false表示配额不足，需要停止投递
     */
    public boolean checkQuotaBeforeDelivery() {
        try {
            log.info("🔍 开始配额检查: userId={}, quotaKey=daily_job_application", this.userId);

            // 优先尝试通过SpringContextUtil获取QuotaService（如果Boss在Spring环境中运行）
            // 注意：在隔离JVM进程中，SpringContextUtil可能无法加载（缺少Spring依赖）
            // 使用try-catch捕获NoClassDefFoundError，避免崩溃
            try {
                if (SpringContextUtil.isInitialized()) {
                    log.info("📊 使用SpringContext获取QuotaService");
                    QuotaService quotaService = SpringContextUtil.getBean(QuotaService.class);
                    if (quotaService != null) {
                        boolean canUse = quotaService.checkQuotaLimit(this.userId, "daily_job_application", 1L);
                        if (!canUse) {
                            log.warn("⚠️ 配额检查失败: userId={}, quotaKey=daily_job_application, 配额不足", this.userId);
                            return false;
                        }
                        log.info("✅ 配额检查通过: userId={}, quotaKey=daily_job_application", this.userId);
                        return true;
                    }
                }
            } catch (NoClassDefFoundError e) {
                // 在隔离JVM进程中，Spring依赖可能不存在，直接使用JDBC方式
                log.info("📊 SpringContext不可用（隔离环境），使用JDBC查询配额: userId={}", this.userId);
            }

            // 如果SpringContext未初始化或不可用，通过JDBC直接查询数据库
            log.info("📊 使用JDBC查询配额: userId={}", this.userId);
            return checkQuotaByJDBC();

        } catch (Exception e) {
            log.error("❌ 配额检查异常: userId={}, quotaKey=daily_job_application", this.userId, e);
            // ⚠️ 异常时返回false，阻止投递，确保配额检查的严格性
            log.error("❌ 配额检查失败，停止投递以确保配额限制生效");
            return false;
        }
    }

    /**
     * 通过JDBC直接查询数据库检查配额
     *
     * @return true表示配额足够，可以投递；false表示配额不足
     */
    private boolean checkQuotaByJDBC() {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
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
                log.error("❌ 配额定义不存在: quotaKey={}，停止投递以确保配额限制生效", quotaKey);
                return false; // 配额定义不存在，应该阻止投递
            }
            Long quotaId = rs.getLong("id");
            rs.close();
            stmt.close();

            // 2. 查询用户套餐类型
            // ✅ 修复：status字段是smallint类型（枚举ordinal），ACTIVE=0
            // ✅ 修复：plan_type字段是smallint类型（枚举ordinal），需要转换为字符串
            // ✅ 修复：expires_at字段在数据库中可能是end_date
            stmt = conn.prepareStatement(
                "SELECT plan_type FROM user_plans WHERE user_id = ? AND status = 0 AND (end_date IS NULL OR end_date > CURRENT_DATE)");
            stmt.setString(1, this.userId);
            rs = stmt.executeQuery();

            Integer planTypeOrdinal = null;
            if (rs.next()) {
                planTypeOrdinal = rs.getInt("plan_type");
            }
            rs.close();
            stmt.close();

            if (planTypeOrdinal == null) {
                log.warn("⚠️ 用户没有有效套餐: userId={}，自动创建默认免费套餐", this.userId);
                // ✅ 修复：自动为用户创建默认免费套餐
                try {
                    // 先检查是否已存在（可能状态不是ACTIVE）
                    stmt = conn.prepareStatement(
                        "SELECT plan_type FROM user_plans WHERE user_id = ?");
                    stmt.setString(1, this.userId);
                    rs = stmt.executeQuery();
                    boolean userPlanExists = rs.next();
                    if (userPlanExists) {
                        // 如果存在但状态不是ACTIVE，更新为ACTIVE
                        rs.close();
                        stmt.close();
                        stmt = conn.prepareStatement(
                            "UPDATE user_plans SET plan_type = 0, status = 0, start_date = CURRENT_DATE, end_date = NULL, updated_at = CURRENT_TIMESTAMP " +
                            "WHERE user_id = ?");
                        stmt.setString(1, this.userId);
                        int updated = stmt.executeUpdate();
                        stmt.close();
                        if (updated > 0) {
                            log.info("✅ 已更新用户套餐为默认免费套餐: userId={}", this.userId);
                            planTypeOrdinal = 0; // FREE套餐
                        }
                    } else {
                        rs.close();
                        stmt.close();
                        // 如果不存在，创建新记录
                        stmt = conn.prepareStatement(
                            "INSERT INTO user_plans (user_id, plan_type, status, start_date, end_date, auto_renewal, purchase_price, created_at, updated_at) " +
                            "VALUES (?, 0, 0, CURRENT_DATE, NULL, false, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
                        stmt.setString(1, this.userId);
                        int rowsAffected = stmt.executeUpdate();
                        stmt.close();
                        
                        if (rowsAffected > 0) {
                            log.info("✅ 已为用户创建默认免费套餐: userId={}", this.userId);
                            planTypeOrdinal = 0; // FREE套餐
                        }
                    }
                    
                    // 如果还是null，再次查询确认
                    if (planTypeOrdinal == null) {
                        stmt = conn.prepareStatement(
                            "SELECT plan_type FROM user_plans WHERE user_id = ? AND status = 0 AND (end_date IS NULL OR end_date > CURRENT_DATE)");
                        stmt.setString(1, this.userId);
                        rs = stmt.executeQuery();
                        if (rs.next()) {
                            planTypeOrdinal = rs.getInt("plan_type");
                            log.info("✅ 查询到用户套餐: userId={}, planType={}", this.userId, planTypeOrdinal);
                        }
                        rs.close();
                        stmt.close();
                    }
                    
                    if (planTypeOrdinal == null) {
                        log.error("❌ 创建默认套餐失败: userId={}，停止投递", this.userId);
                        return false;
                    }
                } catch (Exception e) {
                    log.error("❌ 创建默认套餐异常: userId={}", this.userId, e);
                    return false;
                }
            }

            // 将ordinal转换为PlanType枚举名称
            // PlanType.FREE=0, PlanType.BASIC=1, PlanType.PROFESSIONAL=2
            String planType;
            switch (planTypeOrdinal) {
                case 0:
                    planType = "FREE";
                    break;
                case 1:
                    planType = "BASIC";
                    break;
                case 2:
                    planType = "PROFESSIONAL";
                    break;
                default:
                    log.error("❌ 未知的套餐类型: ordinal={}, userId={}", planTypeOrdinal, this.userId);
                    return false;
            }
            log.info("✅ 用户套餐类型: userId={}, planType={} (ordinal={})", this.userId, planType, planTypeOrdinal);

            // 3. 查询套餐配额配置
            // ✅ 修复：effective_limit不是数据库字段，需要使用quota_limit和is_unlimited
            stmt = conn.prepareStatement(
                "SELECT quota_limit, is_unlimited FROM plan_quota_configs WHERE plan_type = ? AND quota_id = ? AND is_enabled = true");
            stmt.setString(1, planType);
            stmt.setLong(2, quotaId);
            rs = stmt.executeQuery();

            long limit;
            boolean isUnlimited = false;
            
            if (!rs.next()) {
                log.warn("⚠️ 套餐配额配置不存在: planType={}, quotaId={}，使用默认配额", planType, quotaId);
                // ✅ 修复：如果套餐配额配置不存在，使用默认值（临时方案）
                if ("FREE".equals(planType)) {
                    limit = 5L; // FREE套餐默认每日投递5次
                } else if ("BASIC".equals(planType)) {
                    limit = 30L; // BASIC套餐默认每日投递30次
                } else if ("PROFESSIONAL".equals(planType)) {
                    limit = 100L; // PROFESSIONAL套餐默认每日投递100次
                } else {
                    log.error("❌ 套餐配额配置不存在且无默认值: planType={}, quotaId={}，停止投递", planType, quotaId);
                    rs.close();
                    stmt.close();
                    return false;
                }
                log.info("✅ 使用{}套餐默认配额: daily_job_application={}次", planType, limit);
                rs.close();
                stmt.close();
            } else {
                isUnlimited = rs.getBoolean("is_unlimited");
                if (isUnlimited) {
                    log.debug("✅ 无限配额: userId={}, planType={}", this.userId, planType);
                    rs.close();
                    stmt.close();
                    return true;
                }

                // ✅ 修复：计算effective_limit（如果is_unlimited为true返回Long.MAX_VALUE，否则返回quota_limit）
                Long quotaLimit = rs.getLong("quota_limit");
                limit = (quotaLimit != null && quotaLimit > 0) ? quotaLimit : 0L;
                rs.close();
                stmt.close();
            }

            log.info("📋 套餐配额配置: userId={}, planType={}, quotaKey={}, quotaId={}, quotaLimit={}",
                this.userId, planType, quotaKey, quotaId, limit);

            // 4. 查询当前使用量
            LocalDate today = LocalDate.now();
            stmt = conn.prepareStatement(
                "SELECT used_amount, reset_date, created_at, updated_at FROM user_quota_usage WHERE user_id = ? AND quota_id = ? AND reset_date = ?");
            stmt.setString(1, this.userId);
            stmt.setLong(2, quotaId);
            stmt.setObject(3, today);
            rs = stmt.executeQuery();

            long usedAmount = 0L;
            String resetDateStr = today.toString();
            String lastUpdatedStr = "N/A";
            if (rs.next()) {
                usedAmount = rs.getLong("used_amount");
                resetDateStr = rs.getObject("reset_date") != null ? rs.getObject("reset_date").toString() : today.toString();
                lastUpdatedStr = rs.getTimestamp("updated_at") != null ? rs.getTimestamp("updated_at").toString() : "N/A";
                log.debug("📊 配额使用记录: userId={}, quotaKey={}, usedAmount={}, resetDate={}, lastUpdated={}",
                    this.userId, quotaKey, usedAmount, resetDateStr, lastUpdatedStr);
            } else {
                log.info("📊 配额使用记录不存在（今日首次使用）: userId={}, quotaKey={}, resetDate={}, 将使用0作为初始值",
                    this.userId, quotaKey, today);
            }
            rs.close();
            stmt.close();

            // 5. 检查配额是否足够
            boolean canUse = (usedAmount + 1L) <= limit;
            long remaining = limit - usedAmount;

            log.info("📊 配额检查详情: userId={}, quotaKey={}, planType={}, used={}, limit={}, remaining={}, request=1, canUse={}",
                this.userId, quotaKey, planType, usedAmount, limit, remaining, canUse);

            if (!canUse) {
                log.warn("⚠️ 配额不足，停止投递: userId={}, quotaKey={}, planType={}, used={}, limit={}, remaining={}, request=1",
                    this.userId, quotaKey, planType, usedAmount, limit, remaining);
                return false;
            }

            log.info("✅ 配额检查通过: userId={}, quotaKey={}, planType={}, used={}, limit={}, remaining={}, request=1",
                this.userId, quotaKey, planType, usedAmount, limit, remaining);

            return true;

        } catch (Exception e) {
            log.error("❌ JDBC配额检查异常: userId={}, quotaKey=daily_job_application", this.userId, e);
            // ⚠️ 异常时返回false，阻止投递，确保配额检查的严格性
            // 如果数据库连接失败，应该修复数据库问题，而不是绕过配额检查
            log.error("❌ 配额检查失败，停止投递以确保配额限制生效");
            return false;
        } finally {
            // 关闭资源
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
     * 投递成功后消费配额
     * 消费daily_job_application配额
     *
     * 由于Boss在独立进程中运行，无法使用Spring Bean，因此通过JDBC直接更新数据库
     */
    public void consumeQuotaAfterDelivery() {
        try {
            // 优先尝试通过SpringContextUtil获取QuotaService（如果Boss在Spring环境中运行）
            // 注意：在隔离JVM进程中，SpringContextUtil可能无法加载（缺少Spring依赖）
            // 使用try-catch捕获NoClassDefFoundError，避免崩溃
            try {
                if (SpringContextUtil.isInitialized()) {
                    QuotaService quotaService = SpringContextUtil.getBean(QuotaService.class);
                    if (quotaService != null) {
                        try {
                            quotaService.consumeQuota(this.userId, "daily_job_application", 1L);
                            log.debug("✅ 配额消费成功: userId={}, quotaKey=daily_job_application, amount=1", this.userId);
                            return;
                        } catch (QuotaService.QuotaExceededException e) {
                            log.warn("⚠️ 配额消费失败（配额不足）: userId={}, quotaKey=daily_job_application, message={}",
                                this.userId, e.getMessage());
                            return;
                        }
                    }
                }
            } catch (NoClassDefFoundError e) {
                // 在隔离JVM进程中，Spring依赖可能不存在，直接使用JDBC方式
                log.debug("📊 SpringContext不可用（隔离环境），使用JDBC消费配额: userId={}", this.userId);
            }

            // 如果SpringContext未初始化或不可用，通过JDBC直接更新数据库
            consumeQuotaByJDBC();

        } catch (Exception e) {
            log.error("❌ 配额消费异常: userId={}, quotaKey=daily_job_application", this.userId, e);
        }
    }

    /**
     * 通过JDBC直接更新数据库消费配额
     */
    private void consumeQuotaByJDBC() {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
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
            conn.setAutoCommit(false); // 开启事务

            // 1. 查询配额定义ID
            String quotaKey = "daily_job_application";
            stmt = conn.prepareStatement(
                "SELECT id FROM quota_definitions WHERE quota_key = ? AND is_active = true");
            stmt.setString(1, quotaKey);
            rs = stmt.executeQuery();

            if (!rs.next()) {
                log.warn("⚠️ 配额定义不存在: quotaKey={}，无法消费配额", quotaKey);
                conn.rollback();
                return;
            }
            Long quotaId = rs.getLong("id");
            rs.close();
            stmt.close();

            // 2. 查询或创建使用记录
            LocalDate today = LocalDate.now();
            stmt = conn.prepareStatement(
                "SELECT id, used_amount FROM user_quota_usage WHERE user_id = ? AND quota_id = ? AND reset_date = ? FOR UPDATE");
            stmt.setString(1, this.userId);
            stmt.setLong(2, quotaId);
            stmt.setObject(3, today);
            rs = stmt.executeQuery();

            if (rs.next()) {
                // 更新现有记录
                Long usageId = rs.getLong("id");
                long currentUsed = rs.getLong("used_amount");
                rs.close();
                stmt.close();

                stmt = conn.prepareStatement(
                    "UPDATE user_quota_usage SET used_amount = used_amount + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
                stmt.setLong(1, usageId);
                int updated = stmt.executeUpdate();
                stmt.close();

                if (updated > 0) {
                    conn.commit();
                    log.info("✅ 配额消费成功: userId={}, quotaKey={}, used={} -> {}",
                        this.userId, quotaKey, currentUsed, currentUsed + 1);
                } else {
                    conn.rollback();
                    log.warn("⚠️ 配额消费失败: 更新记录失败");
                }
            } else {
                // 创建新记录
                rs.close();
                stmt.close();

                stmt = conn.prepareStatement(
                    "INSERT INTO user_quota_usage (user_id, quota_id, used_amount, reset_date, created_at, updated_at) " +
                    "VALUES (?, ?, 1, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
                stmt.setString(1, this.userId);
                stmt.setLong(2, quotaId);
                stmt.setObject(3, today);
                int inserted = stmt.executeUpdate();
                stmt.close();

                if (inserted > 0) {
                    conn.commit();
                    log.info("✅ 配额消费成功（新建记录）: userId={}, quotaKey={}, used=1", this.userId, quotaKey);
                } else {
                    conn.rollback();
                    log.warn("⚠️ 配额消费失败: 创建记录失败");
                }
            }

        } catch (Exception e) {
            log.error("❌ JDBC配额消费异常: userId={}, quotaKey=daily_job_application", this.userId, e);
            try {
                if (conn != null) conn.rollback();
            } catch (Exception ex) {
                log.error("回滚事务失败", ex);
            }
        } finally {
            // 关闭资源
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
                if (conn != null) {
                    conn.setAutoCommit(true);
                    conn.close();
                }
            } catch (Exception e) {
                log.error("关闭数据库连接失败", e);
            }
        }
    }
}



