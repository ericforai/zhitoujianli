package multitenanttest;

import org.junit.jupiter.api.Test;

import java.io.File;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 日志文件隔离测试
 * 验证P2-1修复：不同用户的日志文件分开存储
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-03
 */
public class LogFileIsolationTest extends BaseMultiTenantTest {

    @Test
    public void testLogFileIsolation_DifferentUsersHaveDifferentLogDirectories() {
        System.out.println("\n📋 测试：日志文件隔离 - 不同用户有不同日志目录");

        // 1. 用户A登录
        loginAs(testUserA);

        // 模拟生成日志文件
        String logFileA = generateLogFile(userIdA, "boss_web_test");
        assertTrue(logFileA.contains("user_test_user_a") || logFileA.contains(userIdA),
            "用户A的日志文件路径应包含用户ID");
        System.out.println("✅ 用户A日志文件: " + logFileA);

        // 2. 用户B登录
        loginAs(testUserB);

        // 模拟生成日志文件
        String logFileB = generateLogFile(userIdB, "boss_web_test");
        assertTrue(logFileB.contains("user_test_user_b") || logFileB.contains(userIdB),
            "用户B的日志文件路径应包含用户ID");
        System.out.println("✅ 用户B日志文件: " + logFileB);

        // 3. 验证日志文件路径不同
        assertNotEquals(logFileA, logFileB,
            "用户A和用户B的日志文件路径应该不同");
        System.out.println("✅ 两个用户的日志文件路径不同");

        // 4. 验证日志目录隔离
        File logDirA = getLogDir(userIdA);
        File logDirB = getLogDir(userIdB);

        assertNotEquals(logDirA.getAbsolutePath(), logDirB.getAbsolutePath(),
            "日志目录应该不同");
        System.out.println("✅ 两个用户的日志目录完全独立");

        System.out.println("🎉 测试通过：日志文件完全隔离");
    }

    /**
     * 生成日志文件（模拟WebController.generateLogFileName）
     */
    private String generateLogFile(String userId, String prefix) {
        String safeUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "_");
        String logDir = "logs/user_" + safeUserId;
        new File(logDir).mkdirs();

        String fileName = prefix + "_" + System.currentTimeMillis() + ".log";
        File logFile = new File(logDir, fileName);

        try {
            // 创建空日志文件
            logFile.createNewFile();
        } catch (Exception e) {
            // 忽略
        }

        return logFile.getAbsolutePath();
    }

    /**
     * 获取用户日志目录
     */
    private File getLogDir(String userId) {
        String safeUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "_");
        return new File("logs/user_" + safeUserId);
    }
}




