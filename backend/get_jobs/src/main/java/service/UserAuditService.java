package service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import entity.User;
import entity.UserAuditLog;
import entity.UserAuditLog.ActionResult;
import entity.UserAuditLog.ActionType;
import lombok.extern.slf4j.Slf4j;
import repository.UserAuditLogRepository;

/**
 * 用户审计服务
 * 提供审计日志的记录和查询功能
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */
@Slf4j
@Service
public class UserAuditService {

    @Autowired
    private UserAuditLogRepository auditLogRepository;

    /**
     * 记录审计日志（异步）
     */
    @Async
    @Transactional
    public void logAction(Long userId, String userEmail, ActionType actionType, ActionResult result,
                         String description, String ipAddress, String userAgent, String requestPath) {
        try {
            UserAuditLog auditLog = UserAuditLog.builder()
                    .userId(userId)
                    .userEmail(userEmail)
                    .actionType(actionType)
                    .result(result)
                    .description(description)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .requestPath(requestPath)
                    .build();

            auditLogRepository.save(auditLog);

            log.debug("✅ 审计日志记录成功: userId={}, action={}, result={}",
                     userId, actionType, result);
        } catch (Exception e) {
            // 审计日志失败不应该影响主业务
            log.error("❌ 审计日志记录失败: userId={}, action={}", userId, actionType, e);
        }
    }

    /**
     * 记录成功的操作
     */
    @Async
    @Transactional
    public void logSuccess(Long userId, String userEmail, ActionType actionType,
                          String description, String ipAddress, String userAgent, String requestPath) {
        logAction(userId, userEmail, actionType, ActionResult.SUCCESS,
                 description, ipAddress, userAgent, requestPath);
    }

    /**
     * 记录失败的操作
     */
    @Async
    @Transactional
    public void logFailure(Long userId, String userEmail, ActionType actionType,
                          String failureReason, String ipAddress, String userAgent, String requestPath) {
        UserAuditLog auditLog = UserAuditLog.builder()
                .userId(userId)
                .userEmail(userEmail)
                .actionType(actionType)
                .result(ActionResult.FAILURE)
                .description(actionType.getDescription() + "失败")
                .failureReason(failureReason)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .requestPath(requestPath)
                .build();

        auditLogRepository.save(auditLog);

        log.warn("⚠️ 审计日志（失败）: userId={}, action={}, reason={}",
                userId, actionType, failureReason);
    }

    /**
     * 记录用户注册
     */
    public void logRegister(User user, String ipAddress, String userAgent) {
        logSuccess(user.getUserId(), user.getEmail(), ActionType.REGISTER,
                  "用户注册成功: " + user.getEmail(), ipAddress, userAgent, "/api/auth/register");
    }

    /**
     * 记录用户登录
     */
    public void logLogin(User user, String ipAddress, String userAgent) {
        logSuccess(user.getUserId(), user.getEmail(), ActionType.LOGIN,
                  "用户登录成功: " + user.getEmail(), ipAddress, userAgent, "/api/auth/login");
    }

    /**
     * 记录登录失败
     */
    public void logLoginFailure(String email, String reason, String ipAddress, String userAgent) {
        logFailure(null, email, ActionType.FAILED_LOGIN_ATTEMPT,
                  reason, ipAddress, userAgent, "/api/auth/login");
    }

    /**
     * 记录用户登出
     */
    public void logLogout(User user, String ipAddress, String userAgent) {
        logSuccess(user.getUserId(), user.getEmail(), ActionType.LOGOUT,
                  "用户登出: " + user.getEmail(), ipAddress, userAgent, "/api/auth/logout");
    }

    /**
     * 记录用户登出（仅userId版本）
     */
    public void logLogout(Long userId, String reason) {
        logSuccess(userId, "unknown", ActionType.LOGOUT,
                  reason, "unknown", "unknown", "/api/auth/logout");
    }

    /**
     * 记录密码重置
     */
    public void logPasswordReset(User user, String ipAddress, String userAgent) {
        logSuccess(user.getUserId(), user.getEmail(), ActionType.PASSWORD_RESET,
                  "密码重置成功", ipAddress, userAgent, "/api/auth/password-reset");
    }

    /**
     * 记录账户删除
     */
    public void logAccountDelete(User user, String reason, String ipAddress, String userAgent) {
        UserAuditLog auditLog = UserAuditLog.builder()
                .userId(user.getUserId())
                .userEmail(user.getEmail())
                .actionType(ActionType.ACCOUNT_DELETE)
                .result(ActionResult.SUCCESS)
                .description("账户删除: " + reason)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .requestPath("/api/user/delete")
                .build();

        auditLogRepository.save(auditLog);
    }

    /**
     * 查询用户的审计日志
     */
    public Page<UserAuditLog> getUserAuditLogs(Long userId, int page, int size) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    /**
     * 查询指定邮箱的审计日志
     */
    public Page<UserAuditLog> getUserAuditLogsByEmail(String email, int page, int size) {
        return auditLogRepository.findByUserEmailOrderByCreatedAtDesc(email, PageRequest.of(page, size));
    }

    /**
     * 检查是否存在可疑活动（频繁失败登录）
     * 🔧 开发环境：自动禁用登录限制（localhost 或环境变量 DISABLE_LOGIN_LIMIT=true）
     */
    public boolean checkSuspiciousActivity(String email, String ipAddress) {
        // 🔧 开发环境：检查环境变量，如果设置了 DISABLE_LOGIN_LIMIT=true，则禁用限制
        String disableLimit = System.getenv("DISABLE_LOGIN_LIMIT");
        if ("true".equalsIgnoreCase(disableLimit)) {
            log.debug("🔓 开发环境：登录限制已禁用（环境变量）");
            return false;
        }

        // 🔧 开发环境：如果是 localhost 或 127.0.0.1，自动禁用限制
        if (ipAddress != null && (ipAddress.equals("127.0.0.1") || ipAddress.equals("localhost") || 
            ipAddress.startsWith("192.168.") || ipAddress.startsWith("10.") || ipAddress.startsWith("172."))) {
            log.debug("🔓 开发环境：登录限制已禁用（本地IP: {}）", ipAddress);
            return false;
        }

        LocalDateTime fifteenMinutesAgo = LocalDateTime.now().minusMinutes(15);

        // 检查邮箱的失败次数
        long failedByEmail = auditLogRepository.countFailedLoginAttempts(email, fifteenMinutesAgo);

        // 检查IP的失败次数
        long failedByIp = auditLogRepository.countFailedLoginAttemptsByIp(ipAddress, fifteenMinutesAgo);

        if (failedByEmail >= 5 || failedByIp >= 10) {
            log.warn("🚨 检测到可疑活动: email={}, ip={}, failedByEmail={}, failedByIp={}",
                    email, ipAddress, failedByEmail, failedByIp);
            return true;
        }

        return false;
    }

    /**
     * 查询最近的失败登录尝试
     */
    public List<UserAuditLog> getRecentFailedLoginAttempts(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return auditLogRepository.findFailedAttempts(
                ActionType.FAILED_LOGIN_ATTEMPT, ActionResult.FAILURE, since);
    }

    /**
     * 清理旧日志（定期执行）
     */
    @Transactional
    public void cleanupOldLogs(int daysToKeep) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
        try {
            auditLogRepository.deleteOldLogs(cutoffDate);
            log.info("✅ 清理{}天前的审计日志", daysToKeep);
        } catch (Exception e) {
            log.error("❌ 清理审计日志失败", e);
        }
    }
}

