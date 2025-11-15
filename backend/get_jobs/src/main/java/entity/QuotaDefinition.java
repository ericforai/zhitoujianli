package entity;

import enums.QuotaCategory;
import enums.ResetPeriod;
import enums.UnitType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 配额定义实体
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "quota_definitions")
public class QuotaDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 配额唯一标识符
     */
    @Column(unique = true, nullable = false)
    private String quotaKey;

    /**
     * 配额名称
     */
    @Column(nullable = false)
    private String quotaName;

    /**
     * 配额描述
     */
    @Column(length = 500)
    private String quotaDescription;

    /**
     * 配额类别
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuotaCategory quotaCategory;

    /**
     * 单位类型
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnitType unitType;

    /**
     * 重置周期
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResetPeriod resetPeriod;

    /**
     * 是否启用
     */
    @Column(nullable = false)
    private Boolean isActive;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

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
     * 获取完整的配额显示名称
     */
    public String getFullDisplayName() {
        return String.format("%s (%s)", quotaName, unitType.getUnit());
    }
}
