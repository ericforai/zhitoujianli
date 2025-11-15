package entity;

import enums.PlanType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户套餐实体
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_plans")
public class UserPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户ID（来自Authing）
     */
    private String userId;

    /**
     * 套餐类型
     */
    @Enumerated(EnumType.ORDINAL)
    private PlanType planType;

    /**
     * 套餐开始日期
     */
    private LocalDate startDate;

    /**
     * 套餐结束日期（null表示永不过期）
     */
    private LocalDate endDate;

    /**
     * 套餐状态
     */
    @Enumerated(EnumType.ORDINAL)
    private PlanStatus status;

    /**
     * 自动续费
     */
    private Boolean autoRenewal;

    /**
     * 购买时的价格（分）
     */
    private Integer purchasePrice;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    /**
     * 套餐状态枚举
     */
    public enum PlanStatus {
        ACTIVE("生效中"),
        EXPIRED("已过期"),
        CANCELLED("已取消"),
        PENDING("待激活");

        private final String displayName;

        PlanStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * 检查套餐是否有效
     */
    public boolean isValid() {
        if (status != PlanStatus.ACTIVE) {
            return false;
        }

        if (endDate == null) {
            return true; // 永不过期
        }

        return endDate.isAfter(LocalDate.now());
    }

    /**
     * 检查是否即将过期（7天内）
     */
    public boolean isExpiringSoon() {
        if (endDate == null) {
            return false;
        }

        LocalDate sevenDaysLater = LocalDate.now().plusDays(7);
        return endDate.isBefore(sevenDaysLater) && endDate.isAfter(LocalDate.now());
    }
}
