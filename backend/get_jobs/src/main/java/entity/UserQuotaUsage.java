package entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户配额使用记录实体
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_quota_usage")
public class UserQuotaUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户ID（来自Authing）
     */
    @Column(name = "user_id", nullable = false)
    private String userId;

    /**
     * 配额ID
     */
    @Column(name = "quota_id", nullable = false)
    private Long quotaId;

    /**
     * 已使用数量
     */
    @Column(name = "used_amount", nullable = false)
    private Long usedAmount;

    /**
     * 重置日期
     */
    @Column(name = "reset_date")
    private LocalDate resetDate;

    /**
     * 上次重置时间
     */
    @Column(name = "last_reset_at")
    private LocalDateTime lastResetAt;

    /**
     * 创建时间
     */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * 增加使用量
     */
    public void addUsage(long amount) {
        if (usedAmount == null) {
            usedAmount = 0L;
        }
        usedAmount += amount;
        updatedAt = LocalDateTime.now();
    }

    /**
     * 重置使用量
     */
    public void resetUsage() {
        usedAmount = 0L;
        lastResetAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * 检查是否可以使用指定数量
     */
    public boolean canUse(long amount, long limit) {
        if (usedAmount == null) {
            usedAmount = 0L;
        }
        return (usedAmount + amount) <= limit;
    }

    /**
     * 获取剩余配额
     */
    public long getRemainingQuota(long limit) {
        if (usedAmount == null) {
            usedAmount = 0L;
        }
        return Math.max(0, limit - usedAmount);
    }

    /**
     * 获取使用率（百分比）
     */
    public double getUsageRate(long limit) {
        if (limit <= 0) {
            return 0.0;
        }
        if (usedAmount == null) {
            usedAmount = 0L;
        }
        return Math.min(100.0, (double) usedAmount / limit * 100);
    }
}
