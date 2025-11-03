package repository;

import entity.LoginLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 登录日志数据访问层
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Repository
public interface LoginLogRepository extends JpaRepository<LoginLog, Long> {

    /**
     * 根据用户ID查询登录日志
     */
    Page<LoginLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * 根据邮箱查询登录日志
     */
    Page<LoginLog> findByEmailOrderByCreatedAtDesc(String email, Pageable pageable);

    /**
     * 根据登录状态查询日志
     */
    Page<LoginLog> findByLoginStatusOrderByCreatedAtDesc(String loginStatus, Pageable pageable);

    /**
     * 根据时间范围查询登录日志
     */
    @Query("SELECT l FROM LoginLog l WHERE l.createdAt BETWEEN :startTime AND :endTime ORDER BY l.createdAt DESC")
    Page<LoginLog> findByCreatedAtBetween(@Param("startTime") LocalDateTime startTime,
                                          @Param("endTime") LocalDateTime endTime,
                                          Pageable pageable);

    /**
     * 根据用户ID和时间范围查询
     */
    @Query("SELECT l FROM LoginLog l WHERE l.userId = :userId AND l.createdAt BETWEEN :startTime AND :endTime ORDER BY l.createdAt DESC")
    Page<LoginLog> findByUserIdAndCreatedAtBetween(@Param("userId") Long userId,
                                                   @Param("startTime") LocalDateTime startTime,
                                                   @Param("endTime") LocalDateTime endTime,
                                                   Pageable pageable);

    /**
     * 统计用户登录次数（成功）
     */
    @Query("SELECT COUNT(l) FROM LoginLog l WHERE l.userId = :userId AND l.loginStatus = 'SUCCESS'")
    long countSuccessfulLoginsByUserId(@Param("userId") Long userId);

    /**
     * 统计用户登录次数（失败）
     */
    @Query("SELECT COUNT(l) FROM LoginLog l WHERE l.userId = :userId AND l.loginStatus = 'FAILED'")
    long countFailedLoginsByUserId(@Param("userId") Long userId);

    /**
     * 统计指定时间范围内的登录次数
     */
    @Query("SELECT COUNT(l) FROM LoginLog l WHERE l.createdAt BETWEEN :startTime AND :endTime")
    long countByCreatedAtBetween(@Param("startTime") LocalDateTime startTime,
                                  @Param("endTime") LocalDateTime endTime);

    /**
     * 统计指定时间范围内的成功登录次数
     */
    @Query("SELECT COUNT(l) FROM LoginLog l WHERE l.createdAt BETWEEN :startTime AND :endTime AND l.loginStatus = 'SUCCESS'")
    long countSuccessfulByCreatedAtBetween(@Param("startTime") LocalDateTime startTime,
                                           @Param("endTime") LocalDateTime endTime);

    /**
     * 统计指定时间范围内的失败登录次数
     */
    @Query("SELECT COUNT(l) FROM LoginLog l WHERE l.createdAt BETWEEN :startTime AND :endTime AND l.loginStatus = 'FAILED'")
    long countFailedByCreatedAtBetween(@Param("startTime") LocalDateTime startTime,
                                       @Param("endTime") LocalDateTime endTime);

    /**
     * 获取用户最后一次登录时间
     */
    @Query("SELECT MAX(l.createdAt) FROM LoginLog l WHERE l.userId = :userId AND l.loginStatus = 'SUCCESS'")
    LocalDateTime findLastLoginTimeByUserId(@Param("userId") Long userId);

    /**
     * 根据邮箱获取最后一次成功登录时间
     */
    @Query("SELECT MAX(l.createdAt) FROM LoginLog l WHERE l.email = :email AND l.loginStatus = 'SUCCESS'")
    LocalDateTime findLastLoginTimeByEmail(@Param("email") String email);

    /**
     * 删除指定时间之前的日志（清理过期日志）
     */
    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM LoginLog l WHERE l.createdAt < :beforeTime")
    int deleteByCreatedAtBefore(@Param("beforeTime") LocalDateTime beforeTime);

    /**
     * 统计今日登录次数
     */
    @Query("SELECT COUNT(l) FROM LoginLog l WHERE CAST(l.createdAt AS date) = CURRENT_DATE")
    long countTodayLogins();

    /**
     * 统计今日成功登录次数
     */
    @Query("SELECT COUNT(l) FROM LoginLog l WHERE CAST(l.createdAt AS date) = CURRENT_DATE AND l.loginStatus = 'SUCCESS'")
    long countTodaySuccessfulLogins();

    /**
     * 按日期分组统计登录次数（最近N天）
     * 使用标准SQL CAST语法避免 :: 被识别为参数占位符
     */
    @Query(value = "SELECT CAST(DATE(created_at) AS date) as login_date, CAST(COUNT(*) AS bigint) as count, " +
            "CAST(SUM(CASE WHEN login_status = 'SUCCESS' THEN 1 ELSE 0 END) AS bigint) as success_count, " +
            "CAST(SUM(CASE WHEN login_status = 'FAILED' THEN 1 ELSE 0 END) AS bigint) as failed_count " +
            "FROM login_logs WHERE created_at >= :startDate " +
            "GROUP BY DATE(created_at) ORDER BY DATE(created_at) DESC",
            nativeQuery = true)
    List<Object[]> countByDateGrouped(@Param("startDate") LocalDateTime startDate);
}

