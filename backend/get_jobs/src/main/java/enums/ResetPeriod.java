package enums;

/**
 * 配额重置周期枚举
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
public enum ResetPeriod {
    DAILY("每日", 1),
    WEEKLY("每周", 7),
    MONTHLY("每月", 30),
    YEARLY("每年", 365),
    NEVER("永不重置", -1);
    
    private final String displayName;
    private final int days;
    
    ResetPeriod(String displayName, int days) {
        this.displayName = displayName;
        this.days = days;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public int getDays() {
        return days;
    }
    
    /**
     * 是否需要重置
     */
    public boolean needsReset() {
        return days > 0;
    }
}