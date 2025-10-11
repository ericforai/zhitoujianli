package repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import entity.UserAuditLog;
import entity.UserAuditLog.ActionResult;
import entity.UserAuditLog.ActionType;

/**
 * 用户审计日志数据访问层
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */
@Repository
public interface UserAuditLogRepository extends JpaRepository<UserAuditLog, Long> {

    /**
     * 根据用户ID查询审计日志
     */
    Page<UserAuditLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * 根据用户邮箱查询审计日志
     */
    Page<UserAuditLog> findByUserEmailOrderByCreatedAtDesc(String userEmail, Pageable pageable);

    /**
     * 根据操作类型查询审计日志
     */
    Page<UserAuditLog> findByActionTypeOrderByCreatedAtDesc(ActionType actionType, Pageable pageable);

    /**
     * 根据IP地址查询审计日志
     */
    List<UserAuditLog> findByIpAddressOrderByCreatedAtDesc(String ipAddress);

    /**
     * 查询指定时间范围内的审计日志
     */
    @Query("SELECT a FROM UserAuditLog a WHERE a.createdAt BETWEEN :startTime AND :endTime ORDER BY a.createdAt DESC")
    List<UserAuditLog> findByCreatedAtBetween(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 查询失败的登录尝试
     */
    @Query("SELECT a FROM UserAuditLog a WHERE a.actionType = :actionType AND a.result = :result AND a.createdAt > :since ORDER BY a.createdAt DESC")
    List<UserAuditLog> findFailedAttempts(ActionType actionType, ActionResult result, LocalDateTime since);

    /**
     * 统计指定用户的登录失败次数（最近N分钟）
     */
    @Query("SELECT COUNT(a) FROM UserAuditLog a WHERE a.userEmail = :email AND a.actionType = 'FAILED_LOGIN_ATTEMPT' AND a.createdAt > :since")
    long countFailedLoginAttempts(String email, LocalDateTime since);

    /**
     * 统计指定IP的登录失败次数（最近N分钟）
     */
    @Query("SELECT COUNT(a) FROM UserAuditLog a WHERE a.ipAddress = :ipAddress AND a.actionType = 'FAILED_LOGIN_ATTEMPT' AND a.createdAt > :since")
    long countFailedLoginAttemptsByIp(String ipAddress, LocalDateTime since);

    /**
     * 删除N天前的日志（数据清理）
     */
    @Query("DELETE FROM UserAuditLog a WHERE a.createdAt < :before")
    void deleteOldLogs(LocalDateTime before);
}

