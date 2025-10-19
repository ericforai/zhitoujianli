package util;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import lombok.extern.slf4j.Slf4j;

/**
 * 用户上下文工具类
 * 用于获取当前登录用户的信息
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Slf4j
public class UserContextUtil {

    /**
     * 获取当前登录用户ID
     */
    public static String getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {

                // 1. 优先从Principal中获取Map格式的用户信息
                if (authentication.getPrincipal() instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> userInfo = (Map<String, Object>) authentication.getPrincipal();
                    String userId = (String) userInfo.get("userId");
                    if (userId != null && !userId.isEmpty()) {
                        log.debug("获取当前用户ID: {}", userId);
                        return userId;
                    }
                }

                // 2. 备选：从Principal的字符串形式获取（通常是用户名或邮箱）
                String principal = authentication.getName();
                if (principal != null && !principal.isEmpty() && !"anonymousUser".equals(principal)) {
                    log.debug("从Principal获取用户标识: {}", principal);
                    return principal;
                }
            }
        } catch (Exception e) {
            log.error("获取当前用户ID失败: {}", e.getMessage(), e);
        }

        // 未登录时的处理逻辑
        // 注意：生产环境中，Spring Security会在此之前拦截未登录请求
        // 此处只在SECURITY_ENABLED=false时才会被执行到
        log.info("未检测到登录用户，使用默认用户（仅在SECURITY_ENABLED=false时生效）");
        return "default_user";
    }

    /**
     * 获取当前用户邮箱
     */
    public static String getCurrentUserEmail() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> userInfo = (Map<String, Object>) authentication.getPrincipal();
                String email = (String) userInfo.get("email");
                if (email != null && !email.isEmpty()) {
                    log.debug("获取当前用户邮箱: {}", email);
                    return email;
                }
            }
        } catch (Exception e) {
            log.warn("获取当前用户邮箱失败: {}", e.getMessage());
        }
        // 返回默认邮箱（仅在SECURITY_ENABLED=false时生效）
        log.info("未检测到登录用户邮箱，使用默认邮箱（仅在SECURITY_ENABLED=false时生效）");
        return "demo@example.com";
    }

    /**
     * 获取当前登录用户名
     */
    public static String getCurrentUsername() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> userInfo = (Map<String, Object>) authentication.getPrincipal();
                String username = (String) userInfo.get("username");
                if (username == null) {
                    // 如果没有用户名，使用邮箱作为备选
                    username = (String) userInfo.get("email");
                }
                log.debug("获取当前用户名: {}", username);
                return username;
            }
        } catch (Exception e) {
            log.warn("获取当前用户名失败: {}", e.getMessage());
        }
        // 返回默认用户名（仅在SECURITY_ENABLED=false时生效）
        log.info("未检测到登录用户名，使用默认用户名（仅在SECURITY_ENABLED=false时生效）");
        return "Demo User";
    }

    /**
     * 获取当前登录用户的完整信息
     */
    @SuppressWarnings("unchecked")
    public static Map<String, Object> getCurrentUserInfo() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Map) {
                Map<String, Object> userInfo = (Map<String, Object>) authentication.getPrincipal();
                log.debug("获取当前用户完整信息: {}", userInfo);
                return userInfo;
            }
        } catch (Exception e) {
            log.warn("获取当前用户信息失败: {}", e.getMessage());
        }
        return null;
    }

    /**
     * 检查是否有当前登录用户
     */
    public static boolean hasCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            return authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal());
        } catch (Exception e) {
            log.warn("检查用户登录状态失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 检查当前用户是否已认证
     */
    public static boolean isAuthenticated() {
        return hasCurrentUser();
    }

    /**
     * 获取用户数据存储路径
     * 为每个用户创建独立的数据目录
     */
    public static String getUserDataPath() {
        String userId = getCurrentUserId();
        if (userId != null) {
            // 清理用户ID，确保文件系统安全
            String cleanUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "_");
            String userDataPath = "user_data/" + cleanUserId;
            log.debug("用户数据路径: {}", userDataPath);
            return userDataPath;
        }
        return "user_data/default";
    }

    /**
     * 获取用户配置文件路径
     */
    public static String getUserConfigPath() {
        return getUserDataPath() + "/config.json";
    }

    /**
     * 获取用户AI配置文件路径
     */
    public static String getUserAiConfigPath() {
        return getUserDataPath() + "/ai_config.json";
    }

    /**
     * 获取用户简历文件路径
     */
    public static String getUserResumePath() {
        return getUserDataPath() + "/resume.txt";
    }
}
