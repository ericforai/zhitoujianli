package enums;

/**
 * 用户套餐类型枚举
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
public enum PlanType {
    FREE("免费版", 0),
    BASIC("基础版", 29),
    PROFESSIONAL("专业版", 99),
    ENTERPRISE("旗舰版", 299);
    
    private final String displayName;
    private final int monthlyPrice;
    
    PlanType(String displayName, int monthlyPrice) {
        this.displayName = displayName;
        this.monthlyPrice = monthlyPrice;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public int getMonthlyPrice() {
        return monthlyPrice;
    }
    
    /**
     * 获取套餐等级（数字越大等级越高）
     */
    public int getLevel() {
        return ordinal();
    }
    
    /**
     * 检查是否可以升级到目标套餐
     */
    public boolean canUpgradeTo(PlanType targetPlan) {
        return this.getLevel() < targetPlan.getLevel();
    }
}