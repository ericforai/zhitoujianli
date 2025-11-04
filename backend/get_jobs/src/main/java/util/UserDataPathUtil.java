package util;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import lombok.extern.slf4j.Slf4j;

/**
 * 用户数据路径统一管理工具类
 *
 * 功能：
 * 1. 统一用户ID清理规则（@ 和 . 替换为 _）
 * 2. 集中管理所有用户数据文件路径
 * 3. 提供向后兼容的路径查找逻辑
 *
 * 统一格式：luwenrong123@sina.com -> luwenrong123_sina_com
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-04
 */
@Slf4j
public class UserDataPathUtil {

    private static final String USER_DATA_BASE = "user_data";

    /**
     * 获取清理后的用户ID（统一规则）
     *
     * 清理规则：
     * - 将 @ 替换为 _
     * - 将 . 替换为 _
     * - 只保留字母、数字、下划线、连字符
     *
     * 示例：luwenrong123@sina.com -> luwenrong123_sina_com
     *
     * @return 清理后的安全用户ID
     */
    public static String getSafeUserId() {
        String userId = UserContextUtil.getCurrentUserId();
        return sanitizeUserId(userId);
    }

    /**
     * 清理用户ID中的特殊字符
     *
     * @param userId 原始用户ID
     * @return 清理后的安全用户ID
     */
    public static String sanitizeUserId(String userId) {
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("用户ID不能为空");
        }

        // 统一清理规则：只保留字母、数字、下划线、连字符
        // @ 和 . 都会被替换为 _
        String cleaned = userId.replaceAll("[^a-zA-Z0-9_-]", "_");

        // 防止路径遍历攻击
        if (cleaned.contains("..") || cleaned.startsWith("/") || cleaned.startsWith("\\")) {
            throw new SecurityException("非法的用户ID格式: " + userId);
        }

        log.debug("用户ID清理: {} -> {}", userId, cleaned);
        return cleaned;
    }

    /**
     * 获取用户数据目录路径（清理后的路径）
     *
     * @return 用户数据目录路径，例如：user_data/luwenrong123_sina_com
     */
    public static String getUserDataDir() {
        return USER_DATA_BASE + File.separator + getSafeUserId();
    }

    /**
     * 获取用户数据目录的 Path 对象
     */
    public static Path getUserDataDirPath() {
        return Paths.get(getUserDataDir());
    }

    /**
     * 获取配置文件路径
     *
     * @return 配置文件路径，例如：user_data/luwenrong123_sina_com/config.json
     */
    public static String getConfigPath() {
        return getUserDataDir() + File.separator + "config.json";
    }

    /**
     * 获取简历文件路径
     *
     * @return 简历文件路径，例如：user_data/luwenrong123_sina_com/candidate_resume.json
     */
    public static String getResumePath() {
        return getUserDataDir() + File.separator + "candidate_resume.json";
    }

    /**
     * 获取默认打招呼语文件路径
     *
     * @return 默认打招呼语文件路径
     */
    public static String getDefaultGreetingPath() {
        return getUserDataDir() + File.separator + "default_greeting.json";
    }

    /**
     * 获取AI配置文件路径
     */
    public static String getAiConfigPath() {
        return getUserDataDir() + File.separator + "ai_config.json";
    }

    /**
     * 获取Boss Cookie文件路径
     */
    public static String getBossCookiePath() {
        return getUserDataDir() + File.separator + "boss_cookie.json";
    }

    /**
     * 确保用户数据目录存在
     *
     * @return 如果目录创建成功或已存在返回 true，否则返回 false
     */
    public static boolean ensureUserDataDirExists() {
        try {
            Path userDataPath = getUserDataDirPath();
            if (!Files.exists(userDataPath)) {
                Files.createDirectories(userDataPath);
                log.info("📁 创建用户数据目录: {}", userDataPath.toAbsolutePath());
                return true;
            }
            return true;
        } catch (Exception e) {
            log.error("❌ 创建用户数据目录失败", e);
            return false;
        }
    }

    // ========== 向后兼容方法（支持旧格式 @ 和 .）==========

    /**
     * 尝试查找文件（支持新旧两种路径格式）
     *
     * 查找顺序：
     * 1. 新格式路径（清理后的ID）：user_data/luwenrong123_sina_com/config.json ✅ 优先
     * 2. 旧格式路径（原始邮箱）：user_data/luwenrong123@sina.com/config.json
     *
     * @param filename 文件名，例如：config.json, candidate_resume.json
     * @return 找到的文件，如果都不存在返回 null
     */
    public static File findFile(String filename) {
        String userId = UserContextUtil.getCurrentUserId();
        String safeUserId = sanitizeUserId(userId);

        // 优先查找新格式路径（统一格式）
        File newFormatFile = new File(USER_DATA_BASE + File.separator + safeUserId + File.separator + filename);
        if (newFormatFile.exists()) {
            log.debug("✅ 找到文件（新格式）: {}", newFormatFile.getAbsolutePath());
            return newFormatFile;
        }

        // 如果新旧格式不同，尝试查找旧格式路径（向后兼容）
        if (!userId.equals(safeUserId)) {
            File oldFormatFile = new File(USER_DATA_BASE + File.separator + userId + File.separator + filename);
            if (oldFormatFile.exists()) {
                log.warn("⚠️ 找到文件（旧格式）: {} - 建议迁移到新格式", oldFormatFile.getAbsolutePath());
                return oldFormatFile;
            }
        }

        log.debug("❌ 文件不存在: {}", filename);
        return null;
    }

    /**
     * 获取配置文件（兼容新旧格式）
     *
     * @return 配置文件对象（如果不存在，返回新格式路径的File对象用于创建）
     */
    public static File getConfigFile() {
        File file = findFile("config.json");
        if (file == null) {
            // 如果不存在，返回新格式路径的File对象（用于创建）
            return new File(getConfigPath());
        }
        return file;
    }

    /**
     * 获取简历文件（兼容新旧格式）
     */
    public static File getResumeFile() {
        File file = findFile("candidate_resume.json");
        if (file == null) {
            return new File(getResumePath());
        }
        return file;
    }

    /**
     * 获取默认打招呼语文件（兼容新旧格式）
     */
    public static File getDefaultGreetingFile() {
        File file = findFile("default_greeting.json");
        if (file == null) {
            return new File(getDefaultGreetingPath());
        }
        return file;
    }

    /**
     * 检查用户是否有旧格式的数据目录需要迁移
     *
     * @return 如果存在旧格式目录且与新格式不同，返回 true
     */
    public static boolean hasLegacyDataToMigrate() {
        String userId = UserContextUtil.getCurrentUserId();
        String safeUserId = sanitizeUserId(userId);

        // 如果格式相同，无需迁移
        if (userId.equals(safeUserId)) {
            return false;
        }

        // 检查旧格式目录是否存在
        File oldDir = new File(USER_DATA_BASE + File.separator + userId);

        // 只有旧目录存在且不为空时才需要迁移
        if (oldDir.exists() && oldDir.isDirectory()) {
            File[] files = oldDir.listFiles();
            return files != null && files.length > 0;
        }

        return false;
    }

    /**
     * 获取旧格式目录路径（用于迁移）
     */
    public static String getLegacyUserDataDir() {
        String userId = UserContextUtil.getCurrentUserId();
        return USER_DATA_BASE + File.separator + userId;
    }
}


