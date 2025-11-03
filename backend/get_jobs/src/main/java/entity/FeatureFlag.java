package entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 功能开关实体
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Entity
@Table(name = "feature_flags", indexes = {
    @Index(name = "idx_feature_flags_key", columnList = "feature_key", unique = true),
    @Index(name = "idx_feature_flags_enabled", columnList = "enabled")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeatureFlag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 功能键（唯一标识）
     */
    @Column(name = "feature_key", nullable = false, unique = true, length = 100)
    private String featureKey;

    /**
     * 功能名称
     */
    @Column(name = "feature_name", nullable = false, length = 200)
    private String featureName;

    /**
     * 功能描述
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * 是否启用
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    /**
     * 允许使用的套餐类型列表（JSON数组）
     * 格式: ["FREE", "BASIC", "PROFESSIONAL", "FLAGSHIP"]
     * null或空数组表示所有套餐都可以使用
     */
    @Column(name = "target_plans", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> targetPlans;

    /**
     * 允许使用的用户ID列表（可选，JSON数组）
     * 如果设置了，只有列表中的用户可以访问该功能
     */
    @Column(name = "target_users", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> targetUsers;

    /**
     * 功能配置参数（JSON对象）
     * 用于存储功能的额外配置信息
     */
    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> config;

    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * 检查套餐是否可以使用该功能
     *
     * @param planType 套餐类型
     * @return 是否可以使用
     */
    public boolean isPlanAllowed(String planType) {
        if (!enabled) {
            return false;
        }

        // 如果targetPlans为null或空，表示所有套餐都可以使用
        if (targetPlans == null || targetPlans.isEmpty()) {
            return true;
        }

        return targetPlans.contains(planType);
    }

    /**
     * 检查用户是否可以使用该功能
     *
     * @param userId 用户ID
     * @param planType 用户套餐类型
     * @return 是否可以使用
     */
    public boolean isUserAllowed(String userId, String planType) {
        if (!enabled) {
            return false;
        }

        // 如果设置了targetUsers，检查用户是否在列表中
        if (targetUsers != null && !targetUsers.isEmpty()) {
            if (!targetUsers.contains(userId)) {
                return false;
            }
        }

        // 检查套餐是否允许
        return isPlanAllowed(planType);
    }
}
