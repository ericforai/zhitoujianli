package entity;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import enums.AdminType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 管理员用户实体
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "admin_users")
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户ID（来自Authing）
     */
    @Column(name = "user_id")
    private String userId;

    /**
     * 用户名（登录用）
     */
    @Column(name = "username", unique = true, nullable = false)
    private String username;

    /**
     * 密码（BCrypt加密）
     */
    @Column(name = "password", nullable = false)
    private String password;

    /**
     * 管理员类型
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "admin_type", nullable = false)
    private AdminType adminType;

    /**
     * 权限配置（JSON格式）
     */
    @Transient
    private Map<String, Object> permissions;

    /**
     * 是否激活
     */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    /**
     * 创建者用户ID
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * 备注信息
     */
    @Column(name = "remarks")
    private String remarks;

    /**
     * 最后登录时间
     */
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

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
     * 检查是否有指定权限
     *
     * @param permission 权限名称
     * @return 是否有权限
     */
    public boolean hasPermission(String permission) {
        if (!isActive || permissions == null) {
            return false;
        }

        // 超级管理员拥有所有权限
        if (adminType == AdminType.SUPER_ADMIN) {
            return true;
        }

        return permissions.containsKey(permission) &&
               Boolean.TRUE.equals(permissions.get(permission));
    }

    /**
     * 检查是否可以管理指定级别的管理员
     *
     * @param targetAdminType 目标管理员类型
     * @return 是否可以管理
     */
    public boolean canManage(AdminType targetAdminType) {
        if (!isActive) {
            return false;
        }

        // 超级管理员可以管理所有类型
        if (adminType == AdminType.SUPER_ADMIN) {
            return true;
        }

        // 平台管理员不能管理超级管理员和其他平台管理员
        return adminType == AdminType.PLATFORM_ADMIN &&
               targetAdminType != AdminType.SUPER_ADMIN &&
               targetAdminType != AdminType.PLATFORM_ADMIN;
    }

    /**
     * 获取权限值
     *
     * @param permission 权限名称
     * @return 权限值
     */
    public Object getPermissionValue(String permission) {
        if (permissions == null) {
            return new String[0];
        }
        return permissions.get(permission);
    }

    // 防御性拷贝getter方法以避免内部表示暴露
    public Map<String, Object> getPermissions() {
        return permissions != null ? new HashMap<>(permissions) : null;
    }

    // 自定义Builder以避免内部表示暴露
    public static class AdminUserBuilder {
        private Map<String, Object> permissions;

        public AdminUserBuilder permissions(Map<String, Object> permissions) {
            this.permissions = permissions != null ? new HashMap<>(permissions) : null;
            return this;
        }
    }
}
