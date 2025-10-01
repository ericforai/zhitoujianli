package enums;

/**
 * 配额单位类型枚举
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
public enum UnitType {
    COUNT("次数", "次"),
    SIZE("大小", "MB"),
    DURATION("时长", "分钟");
    
    private final String displayName;
    private final String unit;
    
    UnitType(String displayName, String unit) {
        this.displayName = displayName;
        this.unit = unit;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getUnit() {
        return unit;
    }
}