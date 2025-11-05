package service;

import entity.UserPlan;
import enums.PlanType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import repository.LoginLogRepository;
import repository.UserPlanRepository;
import repository.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 统计服务
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Slf4j
@Service
public class StatisticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPlanRepository userPlanRepository;

    @Autowired
    private LoginLogRepository loginLogRepository;

    /**
     * 获取用户统计数据
     */
    public Map<String, Object> getUserStatistics() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userRepository.countTotalUsers();
        long activeUsers = userRepository.countActiveUsers();

        // 获取今天的开始时间（00:00:00）
        LocalDateTime startOfToday = LocalDateTime.now().toLocalDate().atStartOfDay();
        long todayNewUsers = userRepository.countTodayNewUsers(startOfToday);

        LocalDateTime weekStart = LocalDateTime.now().minusDays(7);
        long weekNewUsers = userRepository.countNewUsersBetween(weekStart, LocalDateTime.now());

        LocalDateTime monthStart = LocalDateTime.now().minusDays(30);
        long monthNewUsers = userRepository.countNewUsersBetween(monthStart, LocalDateTime.now());

        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("inactiveUsers", totalUsers - activeUsers);
        stats.put("todayNewUsers", todayNewUsers);
        stats.put("weekNewUsers", weekNewUsers);
        stats.put("monthNewUsers", monthNewUsers);

        return stats;
    }

    /**
     * 获取套餐分布统计
     */
    public Map<String, Object> getPlanDistribution() {
        Map<String, Object> stats = new HashMap<>();

        // 统计各套餐类型的活跃用户数
        List<Object[]> planCounts = userPlanRepository.countByPlanTypeAndStatus(
            UserPlan.PlanStatus.ACTIVE);

        Map<String, Long> distribution = new HashMap<>();

        // 初始化所有套餐类型为0
        for (PlanType planType : PlanType.values()) {
            distribution.put(planType.name(), 0L);
        }

        // 填充统计数据
        for (Object[] row : planCounts) {
            PlanType planType = (PlanType) row[0];
            Long count = (Long) row[1];
            distribution.put(planType.name(), count);
        }

        // 计算总数
        long total = distribution.values().stream().mapToLong(Long::longValue).sum();

        stats.put("distribution", distribution);
        stats.put("total", total);

        // 计算百分比
        Map<String, Double> percentages = new HashMap<>();
        for (Map.Entry<String, Long> entry : distribution.entrySet()) {
            if (total > 0) {
                percentages.put(entry.getKey(), (double) entry.getValue() / total * 100);
            } else {
                percentages.put(entry.getKey(), 0.0);
            }
        }
        stats.put("percentages", percentages);

        return stats;
    }

    /**
     * 获取登录统计
     */
    public Map<String, Object> getLoginStatistics() {
        Map<String, Object> stats = new HashMap<>();

        long todayLogins = loginLogRepository.countTodayLogins();
        long todaySuccessfulLogins = loginLogRepository.countTodaySuccessfulLogins();
        long todayFailedLogins = todayLogins - todaySuccessfulLogins;

        LocalDateTime weekStart = LocalDateTime.now().minusDays(7).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime now = LocalDateTime.now();

        long weekLogins = loginLogRepository.countByCreatedAtBetween(weekStart, now);
        long weekSuccessfulLogins = loginLogRepository.countSuccessfulByCreatedAtBetween(weekStart, now);
        long weekFailedLogins = loginLogRepository.countFailedByCreatedAtBetween(weekStart, now);

        LocalDateTime monthStart = LocalDateTime.now().minusDays(30).withHour(0).withMinute(0).withSecond(0);
        long monthLogins = loginLogRepository.countByCreatedAtBetween(monthStart, now);
        long monthSuccessfulLogins = loginLogRepository.countSuccessfulByCreatedAtBetween(monthStart, now);
        long monthFailedLogins = loginLogRepository.countFailedByCreatedAtBetween(monthStart, now);

        stats.put("today", Map.of(
            "total", todayLogins,
            "successful", todaySuccessfulLogins,
            "failed", todayFailedLogins,
            "successRate", todayLogins > 0 ? (double) todaySuccessfulLogins / todayLogins * 100 : 0
        ));

        stats.put("week", Map.of(
            "total", weekLogins,
            "successful", weekSuccessfulLogins,
            "failed", weekFailedLogins,
            "successRate", weekLogins > 0 ? (double) weekSuccessfulLogins / weekLogins * 100 : 0
        ));

        stats.put("month", Map.of(
            "total", monthLogins,
            "successful", monthSuccessfulLogins,
            "failed", monthFailedLogins,
            "successRate", monthLogins > 0 ? (double) monthSuccessfulLogins / monthLogins * 100 : 0
        ));

        return stats;
    }

    /**
     * 获取登录趋势（最近N天）
     */
    public List<Map<String, Object>> getLoginTrend(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Object[]> results = loginLogRepository.countByDateGrouped(startDate);

        return results.stream().map(row -> {
            Map<String, Object> item = new HashMap<>();
            item.put("date", row[0].toString());
            item.put("total", row[1]);
            item.put("successful", row[2]);
            item.put("failed", row[3]);
            return item;
        }).collect(Collectors.toList());
    }

    /**
     * 获取用户注册趋势（最近N天）
     */
    public List<Map<String, Object>> getUserRegistrationTrend(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Object[]> results = userRepository.countByDateGrouped(startDate);

        return results.stream().map(row -> {
            Map<String, Object> item = new HashMap<>();
            item.put("date", row[0].toString());
            item.put("count", row[1]);
            return item;
        }).collect(Collectors.toList());
    }

    /**
     * 获取仪表板总览数据
     */
    public Map<String, Object> getDashboardOverview() {
        Map<String, Object> dashboard = new HashMap<>();

        // 获取基础统计数据
        Map<String, Object> userStats = getUserStatistics();
        Map<String, Object> loginStats = getLoginStatistics();
        Map<String, Object> planStats = getPlanDistribution();

        // 展平数据结构，直接返回前端期望的字段
        dashboard.put("totalUsers", userStats.get("totalUsers"));
        dashboard.put("activeUsers", userStats.get("activeUsers"));
        dashboard.put("todayNewUsers", userStats.get("todayNewUsers"));
        dashboard.put("weekNewUsers", userStats.get("weekNewUsers"));
        dashboard.put("monthNewUsers", userStats.get("monthNewUsers"));

        // 登录统计：从 logins.today 中提取
        @SuppressWarnings("unchecked")
        Map<String, Object> todayLoginStats = (Map<String, Object>) loginStats.get("today");
        if (todayLoginStats != null) {
            dashboard.put("todayLogins", todayLoginStats.get("total"));
            dashboard.put("todaySuccessfulLogins", todayLoginStats.get("successful"));
            dashboard.put("todayFailedLogins", todayLoginStats.get("failed"));
        } else {
            dashboard.put("todayLogins", 0L);
            dashboard.put("todaySuccessfulLogins", 0L);
            dashboard.put("todayFailedLogins", 0L);
        }

        // 总登录次数：统计所有时间的登录
        long totalLogins = loginLogRepository.count();
        dashboard.put("totalLogins", totalLogins);

        // 保留详细统计（可选，供前端深度分析使用）
        dashboard.put("detailedUsers", userStats);
        dashboard.put("detailedLogins", loginStats);
        dashboard.put("planDistribution", planStats);

        // 趋势数据（最近7天）
        dashboard.put("loginTrend", getLoginTrend(7));
        dashboard.put("userTrend", getUserRegistrationTrend(7));

        return dashboard;
    }

    /**
     * 获取配额使用统计（如果系统有配额功能）
     */
    public Map<String, Object> getQuotaUsageStatistics() {
        // TODO: 集成QuotaService获取配额使用统计
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalQuotaUsed", 0);
        stats.put("averageQuotaUsage", 0);
        return stats;
    }
}

