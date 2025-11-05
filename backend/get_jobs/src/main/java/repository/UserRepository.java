package repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import entity.User;

/**
 * 用户数据访问层
 *
 * @author ZhiTouJianLi Team
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 根据邮箱查找用户（排除已删除）
     */
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.deletedAt IS NULL")
    Optional<User> findByEmail(String email);

    /**
     * 根据邮箱查找用户（包括已删除）
     */
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmailIncludingDeleted(String email);

    /**
     * 检查邮箱是否存在（排除已删除）
     */
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.email = :email AND u.deletedAt IS NULL")
    boolean existsByEmail(String email);

    /**
     * 根据邮箱查找未删除的激活用户
     */
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.deletedAt IS NULL AND u.active = true")
    Optional<User> findActiveByEmail(String email);

    /**
     * 根据邮箱删除用户（物理删除，慎用）
     */
    void deleteByEmail(String email);

    // ==================== 简化统计方法（避免复杂查询）====================

    /**
     * 统计总用户数（使用JPA内置方法）
     */
    default long countTotalUsers() {
        return count();
    }

    /**
     * 统计激活用户数
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.deletedAt IS NULL AND u.active = true")
    long countActiveUsers();

    /**
     * 统计今日新增用户数（使用时间范围而不是DATE函数）
     * ⚠️ 修复：使用命名参数
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.deletedAt IS NULL AND CAST(u.createdAt AS date) = CAST(:startOfDay AS date)")
    long countTodayNewUsers(@org.springframework.data.repository.query.Param("startOfDay") java.time.LocalDateTime startOfDay);

    /**
     * 统计指定时间范围内的新用户数
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.deletedAt IS NULL AND u.createdAt BETWEEN :startTime AND :endTime")
    long countNewUsersBetween(@org.springframework.data.repository.query.Param("startTime") java.time.LocalDateTime startTime,
                              @org.springframework.data.repository.query.Param("endTime") java.time.LocalDateTime endTime);

    /**
     * 按日期分组统计（使用native query）
     */
    @Query(value = "SELECT DATE(created_at) as date, COUNT(*) as count " +
           "FROM users " +
           "WHERE deleted_at IS NULL AND created_at >= ?1 " +
           "GROUP BY DATE(created_at) " +
           "ORDER BY date DESC",
           nativeQuery = true)
    java.util.List<Object[]> countByDateGrouped(java.time.LocalDateTime startDate);
}

