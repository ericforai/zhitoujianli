package enums;

/**
 * 配额类别枚举
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
public enum QuotaCategory {
    RESUME("简历相关", "resume"),
    AI("AI服务", "ai"),
    DELIVERY("投递功能", "delivery"),
    STORAGE("存储数据", "storage"),
    ADVANCED("高级功能", "advanced");
    
    private final String displayName;
    private final String code;
    
    QuotaCategory(String displayName, String code) {
        this.displayName = displayName;
        this.code = code;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getCode() {
        return code;
    }
}