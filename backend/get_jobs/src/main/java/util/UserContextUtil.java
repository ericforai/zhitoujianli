package util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

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
     * 获取当前登录用户ID - 已禁用认证，返回默认用户
     */
    public static String getCurrentUserId() {
        return "anonymous";
    }

    /**
     * 获取当前用户邮箱 - 已禁用认证，返回默认邮箱
     */
    public static String getCurrentUserEmail() {
        return "anonymous@example.com";
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
        return new String[0];
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
        return new String[0];
    }

    /**
     * 检查是否有当前登录用户 - 已禁用认证，总是返回true
     */
    public static boolean hasCurrentUser() {
        return true;
    }
    
    /**
     * 检查当前用户是否已认证 - 已禁用认证，总是返回true
     */
    public static boolean isAuthenticated() {
        return true;
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