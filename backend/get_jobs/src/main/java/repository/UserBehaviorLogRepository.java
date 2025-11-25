package repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import entity.UserBehaviorLog;

/**
 * 用户行为日志数据访问层
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */
@Repository
public interface UserBehaviorLogRepository extends JpaRepository<UserBehaviorLog, Long> {

    /**
     * 根据用户ID查询行为日志（分页）
     */
    Page<UserBehaviorLog> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    /**
     * 根据行为类型查询（分页）
     */
    Page<UserBehaviorLog> findByBehaviorTypeOrderByCreatedAtDesc(
            UserBehaviorLog.BehaviorType behaviorType, Pageable pageable);

    /**
     * 根据用户ID和行为类型查询
     */
    List<UserBehaviorLog> findByUserIdAndBehaviorTypeOrderByCreatedAtDesc(
            String userId, UserBehaviorLog.BehaviorType behaviorType);

    /**
     * 根据时间范围查询
     */
    @Query("SELECT b FROM UserBehaviorLog b WHERE b.createdAt BETWEEN :startTime AND :endTime ORDER BY b.createdAt DESC")
    Page<UserBehaviorLog> findByTimeRange(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable);

    /**
     * 统计用户某种行为的次数
     */
    long countByUserIdAndBehaviorType(String userId, UserBehaviorLog.BehaviorType behaviorType);

    /**
     * 统计用户某种行为成功的次数
     */
    long countByUserIdAndBehaviorTypeAndStatus(
            String userId,
            UserBehaviorLog.BehaviorType behaviorType,
            UserBehaviorLog.BehaviorStatus status);

    /**
     * 查询最近的行为日志
     */
    @Query("SELECT b FROM UserBehaviorLog b ORDER BY b.createdAt DESC")
    Page<UserBehaviorLog> findRecentLogs(Pageable pageable);

    /**
     * 根据用户ID和时间范围查询
     */
    @Query("SELECT b FROM UserBehaviorLog b WHERE b.userId = :userId AND b.createdAt BETWEEN :startTime AND :endTime ORDER BY b.createdAt DESC")
    List<UserBehaviorLog> findByUserIdAndTimeRange(
            @Param("userId") String userId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
}

