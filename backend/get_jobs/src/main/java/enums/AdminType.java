package enums;

/**
 * 管理员类型枚举
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
public enum AdminType {
    SUPER_ADMIN("超级管理员", 100),
    PLATFORM_ADMIN("平台管理员", 50);
    
    private final String displayName;
    private final int level;
    
    AdminType(String displayName, int level) {
        this.displayName = displayName;
        this.level = level;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public int getLevel() {
        return level;
    }
    
    /**
     * 检查是否有足够权限
     */
    public boolean hasPermission(AdminType requiredLevel) {
        return this.level >= requiredLevel.level;
    }
}