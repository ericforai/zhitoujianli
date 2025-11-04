package service;

import entity.LoginLog;
import entity.User;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repository.LoginLogRepository;
import repository.UserRepository;
import util.RequestUtil;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 登录日志服务
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Slf4j
@Service
public class LoginLogService {

    @Autowired
    private LoginLogRepository loginLogRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 记录成功登录日志
     *
     * @param user 用户对象
     * @param request HTTP请求
     */
    @Transactional
    public void recordSuccessLogin(User user, HttpServletRequest request) {
        try {
            String ipAddress = RequestUtil.getClientIp(request);
            String userAgent = request.getHeader("User-Agent");

            LoginLog loginLog = LoginLog.builder()
                    .userId(user.getUserId())
                    .email(user.getEmail())
                    .loginType(LoginLog.LoginType.EMAIL.name())
                    .loginStatus(LoginLog.LoginStatus.SUCCESS.name())
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .deviceInfo(extractDeviceInfo(userAgent))
                    .createdAt(LocalDateTime.now())
                    .build();

            loginLogRepository.save(loginLog);

            // 更新用户最后登录信息
            user.updateLastLogin(ipAddress);
            userRepository.save(user);

            log.debug("✅ 记录成功登录日志: userId={}, email={}, ip={}",
                     user.getUserId(), user.getEmail(), ipAddress);

        } catch (Exception e) {
            log.error("❌ 记录登录日志失败: userId={}", user != null ? user.getUserId() : "unknown", e);
        }
    }

    /**
     * 记录管理员登录日志（成功）
     */
    @Transactional
    public void recordAdminLogin(entity.AdminUser admin, HttpServletRequest request) {
        try {
            String ipAddress = RequestUtil.getClientIp(request);
            String userAgent = request.getHeader("User-Agent");

            // 使用管理员的username作为email（因为管理员用username登录）
            // 如果username是邮箱格式则直接使用，否则添加@admin后缀
            String adminEmail = admin.getUsername();
            if (!adminEmail.contains("@")) {
                adminEmail = adminEmail + "@admin";
            }

            LoginLog loginLog = LoginLog.builder()
                    .email(adminEmail)  // 管理员邮箱
                    .loginType("ADMIN")
                    .loginStatus(LoginLog.LoginStatus.SUCCESS.name())
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .deviceInfo(extractDeviceInfo(userAgent))
                    .createdAt(LocalDateTime.now())
                    .build();

            loginLogRepository.save(loginLog);

            // 更新管理员最后登录时间
            admin.setLastLoginAt(LocalDateTime.now());

            log.debug("✅ 记录管理员登录日志: email={}, ip={}",
                     adminEmail, ipAddress);

        } catch (Exception e) {
            log.error("❌ 记录管理员登录日志失败: username={}",
                     admin != null ? admin.getUsername() : "unknown", e);
        }
    }

    /**
     * 记录失败登录日志
     *
     * @param email 邮箱地址或用户名
     * @param request HTTP请求
     * @param failureReason 失败原因
     */
    @Transactional
    public void recordFailedLogin(String email, HttpServletRequest request, String failureReason) {
        try {
            String ipAddress = RequestUtil.getClientIp(request);
            String userAgent = request.getHeader("User-Agent");

            LoginLog loginLog = LoginLog.builder()
                    .email(email)
                    .loginType(LoginLog.LoginType.EMAIL.name())
                    .loginStatus(LoginLog.LoginStatus.FAILED.name())
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .deviceInfo(extractDeviceInfo(userAgent))
                    .failureReason(failureReason)
                    .createdAt(LocalDateTime.now())
                    .build();

            loginLogRepository.save(loginLog);

            log.debug("⚠️ 记录失败登录日志: email={}, ip={}, reason={}",
                     email, ipAddress, failureReason);

        } catch (Exception e) {
            log.error("❌ 记录失败登录日志失败: email={}", email, e);
        }
    }

    /**
     * 根据用户ID查询登录日志
     */
    public Page<LoginLog> getUserLoginLogs(Long userId, Pageable pageable) {
        return loginLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    /**
     * 根据邮箱查询登录日志
     */
    public Page<LoginLog> getLoginLogsByEmail(String email, Pageable pageable) {
        return loginLogRepository.findByEmailOrderByCreatedAtDesc(email, pageable);
    }

    /**
     * 根据时间范围查询登录日志
     */
    public Page<LoginLog> getLoginLogsByTimeRange(LocalDateTime startTime,
                                                  LocalDateTime endTime,
                                                  Pageable pageable) {
        return loginLogRepository.findByCreatedAtBetween(startTime, endTime, pageable);
    }

    /**
     * 根据登录状态查询日志
     */
    public Page<LoginLog> getLoginLogsByStatus(String loginStatus, Pageable pageable) {
        return loginLogRepository.findByLoginStatusOrderByCreatedAtDesc(loginStatus, pageable);
    }

    /**
     * 统计今日登录次数
     */
    public long countTodayLogins() {
        return loginLogRepository.countTodayLogins();
    }

    /**
     * 统计今日成功登录次数
     */
    public long countTodaySuccessfulLogins() {
        return loginLogRepository.countTodaySuccessfulLogins();
    }

    /**
     * 统计指定时间范围内的登录次数
     */
    public long countLoginsBetween(LocalDateTime startTime, LocalDateTime endTime) {
        return loginLogRepository.countByCreatedAtBetween(startTime, endTime);
    }

    /**
     * 统计指定时间范围内的成功登录次数
     */
    public long countSuccessfulLoginsBetween(LocalDateTime startTime, LocalDateTime endTime) {
        return loginLogRepository.countSuccessfulByCreatedAtBetween(startTime, endTime);
    }

    /**
     * 统计指定时间范围内的失败登录次数
     */
    public long countFailedLoginsBetween(LocalDateTime startTime, LocalDateTime endTime) {
        return loginLogRepository.countFailedByCreatedAtBetween(startTime, endTime);
    }

    /**
     * 获取用户最后一次登录时间
     */
    public LocalDateTime getLastLoginTime(Long userId) {
        return loginLogRepository.findLastLoginTimeByUserId(userId);
    }

    /**
     * 获取邮箱最后一次成功登录时间
     */
    public LocalDateTime getLastLoginTimeByEmail(String email) {
        return loginLogRepository.findLastLoginTimeByEmail(email);
    }

    /**
     * 清理过期日志（保留最近N个月）
     *
     * @param monthsToKeep 保留月数
     */
    @Transactional
    public int cleanupOldLogs(int monthsToKeep) {
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusMonths(monthsToKeep);
            int deletedCount = loginLogRepository.deleteByCreatedAtBefore(cutoffDate);
            log.info("✅ 清理过期登录日志完成，保留最近{}个月，删除了{}条记录", monthsToKeep, deletedCount);
            return deletedCount;
        } catch (Exception e) {
            log.error("❌ 清理过期登录日志失败", e);
            throw e; // 重新抛出异常以便上层处理
        }
    }

    /**
     * 获取登录统计信息
     */
    public Map<String, Object> getLoginStatistics(LocalDateTime startTime, LocalDateTime endTime) {
        Map<String, Object> stats = new HashMap<>();

        long total = loginLogRepository.countByCreatedAtBetween(startTime, endTime);
        long successful = loginLogRepository.countSuccessfulByCreatedAtBetween(startTime, endTime);
        long failed = loginLogRepository.countFailedByCreatedAtBetween(startTime, endTime);

        stats.put("total", total);
        stats.put("successful", successful);
        stats.put("failed", failed);
        stats.put("successRate", total > 0 ? (double) successful / total * 100 : 0);

        return stats;
    }

    /**
     * 按日期分组统计登录次数（最近N天）
     */
    public List<Object[]> getLoginStatsByDate(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return loginLogRepository.countByDateGrouped(startDate);
    }

    /**
     * 从User-Agent中提取设备信息
     */
    private String extractDeviceInfo(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return "Unknown";
        }

        String deviceInfo = "Desktop";
        userAgent = userAgent.toLowerCase();

        // 检测移动设备
        if (userAgent.contains("mobile") || userAgent.contains("android") ||
            userAgent.contains("iphone") || userAgent.contains("ipad")) {
            deviceInfo = "Mobile";
        }

        // 检测操作系统
        if (userAgent.contains("windows")) {
            deviceInfo += " Windows";
        } else if (userAgent.contains("mac")) {
            deviceInfo += " macOS";
        } else if (userAgent.contains("linux")) {
            deviceInfo += " Linux";
        } else if (userAgent.contains("android")) {
            deviceInfo += " Android";
        } else if (userAgent.contains("ios") || userAgent.contains("iphone")) {
            deviceInfo += " iOS";
        }

        return deviceInfo;
    }
}

