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
                    Object userIdObj = userInfo.get("userId");

                    // 支持Long或String类型的userId
                    String userId;
                    if (userIdObj instanceof Long) {
                        userId = "user_" + userIdObj;  // 转换为user_12345格式
                        log.debug("获取当前用户ID（Long转String）: {}", userId);
                    } else if (userIdObj instanceof String) {
                        userId = (String) userIdObj;
                        log.debug("获取当前用户ID（String）: {}", userId);
                    } else if (userIdObj instanceof Integer) {
                        userId = "user_" + userIdObj;  // 支持Integer类型
                        log.debug("获取当前用户ID（Integer转String）: {}", userId);
                    } else if (userIdObj != null) {
                        userId = String.valueOf(userIdObj);
                        log.debug("获取当前用户ID（toString）: {}", userId);
                    } else {
                        userId = null;
                    }

                    if (userId != null && !userId.isEmpty()) {
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

        // 🔒 安全策略：未登录用户直接抛出异常，禁止fallback
        log.error("❌ 安全错误：未认证用户尝试访问受保护资源");
        throw new SecurityException("未认证用户，拒绝访问。请先登录。");
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
        // 🔒 安全策略：未登录用户直接抛出异常
        log.error("❌ 安全错误：未认证用户尝试获取邮箱");
        throw new SecurityException("未认证用户，拒绝访问邮箱信息");
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
        // 🔒 安全策略：未登录用户直接抛出异常
        log.error("❌ 安全错误：未认证用户尝试获取用户名");
        throw new SecurityException("未认证用户，拒绝访问用户名信息");
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
     *
     * ⚠️ 多租户模式：必须要求用户已登录，不允许返回默认路径
     */
    public static String getUserDataPath() {
        String userId = getCurrentUserId(); // 如果未登录会抛出SecurityException
        if (userId == null || userId.isEmpty()) {
            // 🔒 安全策略：未登录用户不允许访问数据路径
            log.error("❌ 安全错误：未认证用户尝试获取数据路径");
            throw new SecurityException("未认证用户，拒绝访问数据路径");
        }

        // 清理用户ID，确保文件系统安全
        String cleanUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "_");

        // 防止路径遍历攻击
        if (cleanUserId.contains("..") || cleanUserId.startsWith("/") || cleanUserId.startsWith("\\")) {
            log.error("❌ 非法的用户ID格式: {}", userId);
            throw new SecurityException("非法的用户ID格式");
        }

        String userDataPath = "user_data/" + cleanUserId;
        log.debug("用户数据路径: {}", userDataPath);
        return userDataPath;
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

    /**
     * 验证并清理用户ID，防止路径遍历攻击
     * 允许字符：字母、数字、下划线、连字符
     *
     * @param userId 原始用户ID
     * @return 清理后的安全用户ID
     * @throws IllegalArgumentException 如果用户ID为空
     * @throws SecurityException 如果检测到路径遍历攻击
     */
    public static String sanitizeUserId(String userId) {
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("用户ID不能为空");
        }

        // 清理非法字符，只保留安全字符
        String cleaned = userId.replaceAll("[^a-zA-Z0-9_-]", "_");

        // 防止路径遍历
        if (cleaned.contains("..") || cleaned.startsWith("/") || cleaned.startsWith("\\")) {
            throw new SecurityException("非法的用户ID格式: " + userId);
        }

        log.debug("用户ID安全验证: {} -> {}", userId, cleaned);
        return cleaned;
    }

    /**
     * 获取经过安全验证的用户数据路径
     * 使用sanitizeUserId确保路径安全
     *
     * @return 安全的用户数据路径
     */
    public static String getSafeUserDataPath() {
        String userId = getCurrentUserId();
        String safeUserId = sanitizeUserId(userId);
        String userDataPath = "user_data/" + safeUserId;
        log.debug("安全用户数据路径: {}", userDataPath);
        return userDataPath;
    }

    /**
     * 获取当前管理员用户名
     * 用于管理员操作的审计记录
     *
     * @return 管理员用户名
     */
    public static String getCurrentAdminUsername() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                if (authentication.getPrincipal() instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> userInfo = (Map<String, Object>) authentication.getPrincipal();
                    String username = (String) userInfo.get("username");
                    if (username != null && !username.isEmpty()) {
                        log.debug("获取当前管理员用户名: {}", username);
                        return username;
                    }
                }
                // 备选：使用认证名称
                String name = authentication.getName();
                if (name != null && !"anonymousUser".equals(name)) {
                    log.debug("从Authentication.getName()获取管理员用户名: {}", name);
                    return name;
                }
            }
        } catch (Exception e) {
            log.error("获取当前管理员用户名失败: {}", e.getMessage(), e);
        }
        log.warn("未能获取管理员用户名，返回默认值");
        return "system_admin";
    }
}
