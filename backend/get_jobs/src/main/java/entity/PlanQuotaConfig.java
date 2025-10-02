package entity;

import enums.PlanType;
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
public class PlanQuotaConfig {
    
    private Long id;
    
    /**
     * 套餐类型
     */
    private PlanType planType;
    
    /**
     * 配额ID
     */
    private Long quotaId;
    
    /**
     * 配额限制
     */
    private Long quotaLimit;
    
    /**
     * 是否无限制
     */
    private Boolean isUnlimited;
    
    /**
     * 是否启用
     */
    private Boolean isEnabled;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
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