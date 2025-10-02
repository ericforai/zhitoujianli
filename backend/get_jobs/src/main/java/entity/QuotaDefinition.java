package entity;

import enums.QuotaCategory;
import enums.ResetPeriod;
import enums.UnitType;
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
public class QuotaDefinition {
    
    private Long id;
    
    /**
     * 配额唯一标识符
     */
    private String quotaKey;
    
    /**
     * 配额名称
     */
    private String quotaName;
    
    /**
     * 配额描述
     */
    private String quotaDescription;
    
    /**
     * 配额类别
     */
    private QuotaCategory quotaCategory;
    
    /**
     * 单位类型
     */
    private UnitType unitType;
    
    /**
     * 重置周期
     */
    private ResetPeriod resetPeriod;
    
    /**
     * 是否启用
     */
    private Boolean isActive;
    
    /**
     * 排序顺序
     */
    private Integer sortOrder;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
    
    /**
     * 获取完整的配额显示名称
     */
    public String getFullDisplayName() {
        return String.format("%s (%s)", quotaName, unitType.getUnit());
    }
}