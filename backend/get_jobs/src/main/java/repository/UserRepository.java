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
     * ✅ 修复：使用ORDER BY确保唯一性，即使数据库中有重复记录也能正确处理
     */
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.deletedAt IS NULL ORDER BY u.createdAt DESC")
    java.util.List<User> findByEmailList(String email);

    /**
     * 根据邮箱查找用户（排除已删除）
     * ✅ 修复：如果有多条记录，返回最新的一条
     */
    default Optional<User> findByEmail(String email) {
        java.util.List<User> users = findByEmailList(email);
        if (users.isEmpty()) {
            return Optional.empty();
        } else if (users.size() == 1) {
            return Optional.of(users.get(0));
        } else {
            // ✅ 修复：如果有多条记录，返回最新的一条，并记录警告
            org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(UserRepository.class);
            log.warn("⚠️ 发现重复邮箱记录: {} (共{}条)，返回最新的一条", email, users.size());
            return Optional.of(users.get(0)); // 已按createdAt DESC排序，第一条是最新的
        }
    }

    /**
     * 根据邮箱查找用户（包括已删除）
     * ✅ 修复：使用ORDER BY确保唯一性，即使数据库中有重复记录也能正确处理
     */
    @Query("SELECT u FROM User u WHERE u.email = :email ORDER BY u.createdAt DESC")
    java.util.List<User> findByEmailIncludingDeletedList(String email);

    /**
     * 根据邮箱查找用户（包括已删除）
     * ✅ 修复：如果有多条记录，返回最新的一条
     */
    default Optional<User> findByEmailIncludingDeleted(String email) {
        java.util.List<User> users = findByEmailIncludingDeletedList(email);
        if (users.isEmpty()) {
            return Optional.empty();
        } else if (users.size() == 1) {
            return Optional.of(users.get(0));
        } else {
            // ✅ 修复：如果有多条记录，返回最新的一条，并记录警告
            org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(UserRepository.class);
            log.warn("⚠️ 发现重复邮箱记录（包括已删除）: {} (共{}条)，返回最新的一条", email, users.size());
            return Optional.of(users.get(0)); // 已按createdAt DESC排序，第一条是最新的
        }
    }

    /**
     * 检查邮箱是否存在（排除已删除）
     * ✅ 修复：使用 COUNT 查询返回 long，避免 NonUniqueResultException
     * 即使数据库中有重复记录，COUNT 查询也总是返回单个数值
     */
    default boolean existsByEmail(String email) {
        long count = countByEmailAndNotDeleted(email);
        return count > 0;
    }

    /**
     * 统计指定邮箱的未删除用户数量
     * ✅ 修复：使用 COUNT 查询，总是返回单个数值，避免 NonUniqueResultException
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.email = :email AND u.deletedAt IS NULL")
    long countByEmailAndNotDeleted(String email);

    /**
     * 根据邮箱查找未删除的激活用户
     * ✅ 修复：使用ORDER BY确保唯一性，即使数据库中有重复记录也能正确处理
     */
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.deletedAt IS NULL AND u.active = true ORDER BY u.createdAt DESC")
    java.util.List<User> findActiveByEmailList(String email);

    /**
     * 根据邮箱查找未删除的激活用户
     * ✅ 修复：如果有多条记录，返回最新的一条
     */
    default Optional<User> findActiveByEmail(String email) {
        java.util.List<User> users = findActiveByEmailList(email);
        if (users.isEmpty()) {
            return Optional.empty();
        } else if (users.size() == 1) {
            return Optional.of(users.get(0));
        } else {
            // ✅ 修复：如果有多条记录，返回最新的一条，并记录警告
            org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(UserRepository.class);
            log.warn("⚠️ 发现重复激活用户记录: {} (共{}条)，返回最新的一条", email, users.size());
            return Optional.of(users.get(0)); // 已按createdAt DESC排序，第一条是最新的
        }
    }

    /**
     * 根据邮箱删除用户（物理删除，慎用）
     */
    void deleteByEmail(String email);

    // ==================== 简化统计方法（避免复杂查询）====================

    /**
     * 统计总用户数（排除已删除的用户）
     * 🔧 修复：只统计未删除的用户
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.deletedAt IS NULL")
    long countTotalUsers();

    /**
     * 统计激活用户数
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.deletedAt IS NULL AND u.active = true")
    long countActiveUsers();

    /**
     * 统计今日新增用户数（使用时间范围而不是DATE函数）
     * ⚠️ 修复：使用命名参数
     * 🔧 修复：只统计未删除的用户
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

    /**
     * 分页查询未删除的用户列表
     * 🔧 修复：只返回未删除的用户
     */
    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL")
    org.springframework.data.domain.Page<User> findAllNotDeleted(org.springframework.data.domain.Pageable pageable);
}

