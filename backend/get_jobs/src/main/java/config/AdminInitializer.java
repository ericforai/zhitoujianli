package config;

import entity.AdminUser;
import enums.AdminType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import repository.AdminUserRepository;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * 管理员初始化器
 * 系统启动时自动创建预设的管理员账号
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Slf4j
@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 预设的管理员账号配置
     */
    private static final String DEFAULT_ADMIN_USERNAME = "admin@zhitoujianli.com";
    private static final String DEFAULT_ADMIN_PASSWORD = "Zhitou!@#1031";

    @Override
    public void run(String... args) {
        try {
            initializeDefaultAdmin();
        } catch (Exception e) {
            log.error("❌ 管理员初始化失败", e);
        }
    }

    /**
     * 初始化默认管理员账号
     */
    private void initializeDefaultAdmin() {
        try {
            // 检查是否已存在新的管理员账号
            Optional<AdminUser> existingAdmin = adminUserRepository.findByUsername(DEFAULT_ADMIN_USERNAME);

            if (existingAdmin.isPresent()) {
                log.info("✅ 默认管理员账号已存在: {}", DEFAULT_ADMIN_USERNAME);
                return;
            }

            // 如果旧的admin账号存在，更新为新的账号名
            Optional<AdminUser> oldAdmin = adminUserRepository.findByUsername("admin");
            if (oldAdmin.isPresent()) {
                AdminUser admin = oldAdmin.get();
                admin.setUsername(DEFAULT_ADMIN_USERNAME);
                adminUserRepository.save(admin);
                log.info("✅ 已更新旧管理员账号: admin -> {}", DEFAULT_ADMIN_USERNAME);
                return;
            }

            // 创建默认管理员账号
            String encodedPassword = passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD);

            AdminUser admin = AdminUser.builder()
                    .username(DEFAULT_ADMIN_USERNAME)
                    .password(encodedPassword)
                    .adminType(AdminType.SUPER_ADMIN)
                    .permissions(getSuperAdminPermissions())
                    .isActive(true)
                    .createdBy("system")
                    .remarks("系统预设超级管理员")
                    .createdAt(java.time.LocalDateTime.now())
                    .updatedAt(java.time.LocalDateTime.now())
                    .build();

            adminUserRepository.save(admin);

            log.info("✅ 默认管理员账号创建成功: username={}, password={}",
                     DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD);
            log.info("📝 默认管理员登录信息:");
            log.info("   用户名: {}", DEFAULT_ADMIN_USERNAME);
            log.info("   密码: {}", DEFAULT_ADMIN_PASSWORD);
            log.info("   类型: {}", AdminType.SUPER_ADMIN.getDisplayName());

        } catch (Exception e) {
            log.error("❌ 初始化默认管理员失败", e);
        }
    }

    /**
     * 获取超级管理员权限配置
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
}

