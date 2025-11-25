package repository;

import entity.ResumeHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 简历优化历史记录Repository
 * ✅ 修复：所有查询都按用户ID过滤，确保数据隔离
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-25
 */
@Repository
public interface ResumeHistoryRepository extends JpaRepository<ResumeHistory, Long> {

    /**
     * 根据用户ID查询历史记录（分页）
     * ✅ 关键方法：确保只返回当前用户的数据
     */
    Page<ResumeHistory> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    /**
     * 根据用户ID查询所有历史记录（不分页）
     */
    List<ResumeHistory> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * 根据用户ID和类型查询历史记录
     */
    List<ResumeHistory> findByUserIdAndTypeOrderByCreatedAtDesc(String userId, String type);

    /**
     * 根据用户ID和ID查询单条记录
     * ✅ 关键方法：确保用户只能访问自己的记录
     */
    ResumeHistory findByUserIdAndId(String userId, Long id);

    /**
     * 统计用户的历史记录数量
     */
    long countByUserId(String userId);

    /**
     * 删除用户的所有历史记录
     */
    void deleteByUserId(String userId);

    /**
     * 根据用户ID和时间范围查询历史记录
     */
    @Query("SELECT r FROM ResumeHistory r WHERE r.userId = :userId " +
           "AND r.createdAt >= :startTime AND r.createdAt <= :endTime " +
           "ORDER BY r.createdAt DESC")
    List<ResumeHistory> findByUserIdAndTimeRange(
        @Param("userId") String userId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
}



