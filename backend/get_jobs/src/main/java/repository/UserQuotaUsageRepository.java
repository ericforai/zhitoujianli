package repository;

import entity.UserQuotaUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 用户配额使用记录数据访问层
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */
@Repository
public interface UserQuotaUsageRepository extends JpaRepository<UserQuotaUsage, Long> {

    /**
     * 根据用户ID、配额ID和重置日期查询使用记录
     */
    Optional<UserQuotaUsage> findByUserIdAndQuotaIdAndResetDate(
            String userId, Long quotaId, LocalDate resetDate);

    /**
     * 根据用户ID和配额ID查询最新的使用记录
     */
    @Query("SELECT uqu FROM UserQuotaUsage uqu WHERE uqu.userId = :userId AND uqu.quotaId = :quotaId ORDER BY uqu.resetDate DESC")
    Optional<UserQuotaUsage> findLatestByUserIdAndQuotaId(
            @Param("userId") String userId, @Param("quotaId") Long quotaId);

    /**
     * 查询用户的所有配额使用记录
     */
    List<UserQuotaUsage> findByUserIdOrderByResetDateDesc(String userId);

    /**
     * 查询配额的所有用户使用记录
     */
    List<UserQuotaUsage> findByQuotaIdOrderByUsedAmountDesc(Long quotaId);

    /**
     * 根据重置日期查询需要重置的记录
     */
    @Query("SELECT uqu FROM UserQuotaUsage uqu WHERE uqu.resetDate < :date")
    List<UserQuotaUsage> findRecordsToReset(@Param("date") LocalDate date);

    /**
     * 重置指定日期的使用量
     */
    @Modifying
    @Query("UPDATE UserQuotaUsage uqu SET uqu.usedAmount = 0, uqu.lastResetAt = :resetTime, uqu.updatedAt = :resetTime WHERE uqu.resetDate < :date")
    int resetUsageByDate(@Param("date") LocalDate date, @Param("resetTime") LocalDateTime resetTime);

    /**
     * 增加使用量（原子操作）
     */
    @Modifying
    @Query("UPDATE UserQuotaUsage uqu SET uqu.usedAmount = uqu.usedAmount + :amount, uqu.updatedAt = :updateTime WHERE uqu.id = :id")
    int addUsage(@Param("id") Long id, @Param("amount") Long amount, @Param("updateTime") LocalDateTime updateTime);
}

