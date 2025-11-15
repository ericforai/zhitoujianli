package entity;

import enums.PlanType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 套餐配额配置实体
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "plan_quota_configs")
public class PlanQuotaConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 套餐类型
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanType planType;

    /**
     * 配额ID
     */
    @Column(name = "quota_id", nullable = false)
    private Long quotaId;

    /**
     * 配额限制
     */
    @Column(name = "quota_limit")
    private Long quotaLimit;

    /**
     * 是否无限制
     */
    @Column(name = "is_unlimited", nullable = false)
    private Boolean isUnlimited;

    /**
     * 是否启用
     */
    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled;

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
     * 获取有效的配额限制
     */
    public long getEffectiveLimit() {
        if (isUnlimited != null && isUnlimited) {
            return Long.MAX_VALUE;
        }
        return quotaLimit != null ? quotaLimit : 0L;
    }

    /**
     * 检查是否有配额限制
     */
    public boolean hasLimit() {
        return !isUnlimited() && quotaLimit != null && quotaLimit > 0;
    }

    /**
     * 获取是否无限制（安全方法）
     */
    public boolean isUnlimited() {
        return isUnlimited != null && isUnlimited;
    }
}
