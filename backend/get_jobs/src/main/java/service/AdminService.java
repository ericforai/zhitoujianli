package service;

import entity.AdminUser;
import enums.AdminType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 管理员服务
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Slf4j
@Service
public class AdminService {
    
    // 管理员权限缓存
    private final Map<String, AdminUser> adminCache = new ConcurrentHashMap<>();
    
    /**
     * 检查用户是否是管理员
     * 
     * @param userId 用户ID
     * @return 是否是管理员
     */
    public boolean isAdmin(String userId) {
        try {
            AdminUser admin = getAdminUser(userId);
            return admin != null && admin.getIsActive();
        } catch (Exception e) {
            log.error("❌ 检查管理员身份异常: userId={}", userId, e);
            return false;
        }
    }
    
    /**
     * 检查用户是否有指定权限
     * 
     * @param userId 用户ID
     * @param permission 权限名称
     * @return 是否有权限
     */
    public boolean hasPermission(String userId, String permission) {
        try {
            AdminUser admin = getAdminUser(userId);
            if (admin == null || !admin.getIsActive()) {
                return false;
            }
            
            return admin.hasPermission(permission);
            
        } catch (Exception e) {
            log.error("❌ 检查管理员权限异常: userId={}, permission={}", userId, permission, e);
            return false;
        }
    }
    
    /**
     * 获取管理员用户信息
     * 
     * @param userId 用户ID
     * @return 管理员用户信息
     */
    public AdminUser getAdminUser(String userId) {
        try {
            // 先从缓存获取
            AdminUser cachedAdmin = adminCache.get(userId);
            if (cachedAdmin != null) {
                return cachedAdmin;
            }
            
            // TODO: 从数据库查询
            // AdminUser admin = adminUserRepository.findByUserIdAndIsActive(userId, true);
            
            // 临时：检查是否是预设的超级管理员
            if (isPredefinedSuperAdmin(userId)) {
                AdminUser superAdmin = createSuperAdmin(userId);
                adminCache.put(userId, superAdmin);
                return superAdmin;
            }
            
            return null;
            
        } catch (Exception e) {
            log.error("❌ 获取管理员信息异常: userId={}", userId, e);
            return null;
        }
    }
    
    /**
     * 创建管理员账户
     * 
     * @param userId 用户ID
     * @param adminType 管理员类型
     * @param permissions 权限配置
     * @param createdBy 创建者ID
     * @return 创建的管理员信息
     */
    public AdminUser createAdmin(String userId, AdminType adminType, 
                                Map<String, Object> permissions, String createdBy) {
        try {
            log.info("🎯 创建管理员账户: userId={}, adminType={}, createdBy={}", 
                userId, adminType, createdBy);
            
            // 1. 检查创建者权限
            AdminUser creator = getAdminUser(createdBy);
            if (creator == null || !creator.canManage(adminType)) {
                throw new AdminException("没有权限创建该类型的管理员账户");
            }
            
            // 2. 检查用户是否已经是管理员
            if (getAdminUser(userId) != null) {
                throw new AdminException("用户已经是管理员");
            }
            
            // 3. 创建管理员
            AdminUser newAdmin = AdminUser.builder()
                .userId(userId)
                .adminType(adminType)
                .permissions(permissions != null ? permissions : getDefaultPermissions(adminType))
                .isActive(true)
                .createdBy(createdBy)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
            
            // 4. 保存到数据库
            // TODO: adminUserRepository.save(newAdmin);
            
            // 5. 更新缓存
            adminCache.put(userId, newAdmin);
            
            log.info("✅ 管理员账户创建成功: userId={}, adminType={}", userId, adminType);
            return newAdmin;
            
        } catch (AdminException e) {
            log.warn("⚠️ 创建管理员失败: userId={}, message={}", userId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("❌ 创建管理员异常: userId={}", userId, e);
            throw new AdminException("创建管理员失败");
        }
    }
    
    /**
     * 更新管理员权限
     * 
     * @param userId 用户ID
     * @param permissions 新的权限配置
     * @param updatedBy 更新者ID
     */
    public void updateAdminPermissions(String userId, Map<String, Object> permissions, String updatedBy) {
        try {
            log.info("🔧 更新管理员权限: userId={}, updatedBy={}", userId, updatedBy);
            
            // 1. 检查更新者权限
            AdminUser updater = getAdminUser(updatedBy);
            AdminUser target = getAdminUser(userId);
            
            if (updater == null || target == null || !updater.canManage(target.getAdminType())) {
                throw new AdminException("没有权限更新该管理员的权限");
            }
            
            // 2. 更新权限
            target.setPermissions(permissions);
            target.setUpdatedAt(LocalDateTime.now());
            
            // 3. 保存到数据库
            // TODO: adminUserRepository.save(target);
            
            // 4. 更新缓存
            adminCache.put(userId, target);
            
            log.info("✅ 管理员权限更新成功: userId={}", userId);
            
        } catch (AdminException e) {
            log.warn("⚠️ 更新管理员权限失败: userId={}, message={}", userId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("❌ 更新管理员权限异常: userId={}", userId, e);
            throw new AdminException("更新管理员权限失败");
        }
    }
    
    /**
     * 禁用管理员账户
     * 
     * @param userId 用户ID
     * @param disabledBy 操作者ID
     */
    public void disableAdmin(String userId, String disabledBy) {
        try {
            log.info("🚫 禁用管理员账户: userId={}, disabledBy={}", userId, disabledBy);
            
            AdminUser disabler = getAdminUser(disabledBy);
            AdminUser target = getAdminUser(userId);
            
            if (disabler == null || target == null || !disabler.canManage(target.getAdminType())) {
                throw new AdminException("没有权限禁用该管理员账户");
            }
            
            target.setIsActive(false);
            target.setUpdatedAt(LocalDateTime.now());
            
            // TODO: adminUserRepository.save(target);
            
            // 从缓存中移除
            adminCache.remove(userId);
            
            log.info("✅ 管理员账户禁用成功: userId={}", userId);
            
        } catch (AdminException e) {
            log.warn("⚠️ 禁用管理员账户失败: userId={}, message={}", userId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("❌ 禁用管理员账户异常: userId={}", userId, e);
            throw new AdminException("禁用管理员账户失败");
        }
    }
    
    /**
     * 缓存管理员信息（用于系统初始化）
     */
    public void cacheAdmin(String userId, AdminUser admin) {
        adminCache.put(userId, admin);
        log.info("✅ 管理员信息已缓存: userId={}, adminType={}", userId, admin.getAdminType());
    }
    
    /**
     * 获取所有管理员列表
     * 
     * @param requesterId 请求者ID
     * @return 管理员列表
     */
    public List<AdminUser> getAllAdmins(String requesterId) {
        try {
            AdminUser requester = getAdminUser(requesterId);
            if (requester == null || !requester.hasPermission("admin_management_read")) {
                throw new AdminException("没有权限查看管理员列表");
            }
            
            // TODO: 从数据库查询
            // return adminUserRepository.findAllByIsActive(true);
            
            return List.of(); // 临时返回空列表
            
        } catch (Exception e) {
            log.error("❌ 获取管理员列表异常: requesterId={}", requesterId, e);
            return List.of();
        }
    }
    
    // ==================== 私有方法 ====================
    
    /**
     * 检查是否是预设的超级管理员
     */
    private boolean isPredefinedSuperAdmin(String userId) {
        // 预设的超级管理员用户ID列表
        List<String> superAdminIds = List.of(
            "super_admin_001",  // 默认超级管理员
            "admin@autoresume.com", // 邮箱方式
            "68dba0e3d9c27ebb0d93aa42"  // Authing用户ID
        );
        
        return superAdminIds.contains(userId);
    }
    
    /**
     * 创建超级管理员
     */
    private AdminUser createSuperAdmin(String userId) {
        return AdminUser.builder()
            .userId(userId)
            .adminType(AdminType.SUPER_ADMIN)
            .permissions(getSuperAdminPermissions())
            .isActive(true)
            .createdBy("system")
            .remarks("系统预设超级管理员")
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    }
    
    /**
     * 获取默认权限配置
     */
    private Map<String, Object> getDefaultPermissions(AdminType adminType) {
        Map<String, Object> permissions = new HashMap<>();
        
        switch (adminType) {
            case SUPER_ADMIN:
                return getSuperAdminPermissions();
                
            case PLATFORM_ADMIN:
                // 平台管理员权限
                permissions.put("user_management_read", true);
                permissions.put("user_management_update", true);
                permissions.put("quota_management_create", true);
                permissions.put("quota_management_read", true);
                permissions.put("quota_management_update", true);
                permissions.put("plan_management_create", true);
                permissions.put("plan_management_read", true);
                permissions.put("plan_management_update", true);
                permissions.put("analytics_read", true);
                break;
        }
        
        return permissions;
    }
    
    /**
     * 获取超级管理员权限
     */
    private Map<String, Object> getSuperAdminPermissions() {
        Map<String, Object> permissions = new HashMap<>();
        
        // 用户管理权限
        permissions.put("user_management_create", true);
        permissions.put("user_management_read", true);
        permissions.put("user_management_update", true);
        permissions.put("user_management_delete", true);
        
        // 管理员管理权限
        permissions.put("admin_management_create", true);
        permissions.put("admin_management_read", true);
        permissions.put("admin_management_update", true);
        permissions.put("admin_management_delete", true);
        
        // 系统配置权限
        permissions.put("system_config_read", true);
        permissions.put("system_config_update", true);
        
        // 审计日志权限
        permissions.put("audit_logs_read", true);
        
        // 配额管理权限
        permissions.put("quota_management_create", true);
        permissions.put("quota_management_read", true);
        permissions.put("quota_management_update", true);
        permissions.put("quota_management_delete", true);
        
        // 套餐管理权限
        permissions.put("plan_management_create", true);
        permissions.put("plan_management_read", true);
        permissions.put("plan_management_update", true);
        permissions.put("plan_management_delete", true);
        
        // 分析权限
        permissions.put("analytics_read", true);
        
        return permissions;
    }
    
    /**
     * 管理员异常
     */
    public static class AdminException extends RuntimeException {
        public AdminException(String message) {
            super(message);
        }
    }
}