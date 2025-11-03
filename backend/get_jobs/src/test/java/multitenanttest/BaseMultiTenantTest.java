package multitenanttest;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

import config.JwtConfig;
import entity.User;
import repository.UserRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * 多租户测试基类
 * 提供所有多租户隔离测试的公共功能
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-03
 */
@SpringBootTest(
    classes = com.superxiang.WebApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@ActiveProfiles("test")
public abstract class BaseMultiTenantTest {

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected JwtConfig jwtConfig;

    protected User testUserA;
    protected User testUserB;
    protected String emailA = "test_user_a@example.com";
    protected String emailB = "test_user_b@example.com";
    protected String userIdA = "test_user_a_example_com"; // 用于文件系统的安全ID
    protected String userIdB = "test_user_b_example_com";

    /**
     * 测试前准备：创建测试用户
     */
    @BeforeEach
    public void setUp() {
        System.out.println("\n🧪 ========== 开始测试 ==========");

        // 清理可能存在的旧数据
        cleanupUserData(userIdA);
        cleanupUserData(userIdB);

        // 创建测试用户A（userId是Long，由数据库自动生成）
        testUserA = new User();
        testUserA.setEmail(emailA);
        testUserA.setUsername("测试用户A");
        testUserA.setPassword("test_password_a");

        try {
            testUserA = userRepository.save(testUserA);
            System.out.println("✅ 创建测试用户A: " + emailA + " (ID: " + testUserA.getUserId() + ")");
        } catch (Exception e) {
            // 用户可能已存在，尝试查找
            testUserA = userRepository.findByEmail(emailA).orElse(testUserA);
        }

        // 创建测试用户B
        testUserB = new User();
        testUserB.setEmail(emailB);
        testUserB.setUsername("测试用户B");
        testUserB.setPassword("test_password_b");

        try {
            testUserB = userRepository.save(testUserB);
            System.out.println("✅ 创建测试用户B: " + emailB + " (ID: " + testUserB.getUserId() + ")");
        } catch (Exception e) {
            // 用户可能已存在，尝试查找
            testUserB = userRepository.findByEmail(emailB).orElse(testUserB);
        }
    }

    /**
     * 测试后清理：删除测试数据
     */
    @AfterEach
    public void tearDown() {
        System.out.println("🧹 清理测试数据...");

        // 清理用户数据目录
        cleanupUserData(userIdA);
        cleanupUserData(userIdB);

        // 删除测试用户
        try {
            if (testUserA != null) {
                userRepository.delete(testUserA);
                System.out.println("✅ 删除测试用户A");
            }
        } catch (Exception e) {
            // 忽略删除失败
        }

        try {
            if (testUserB != null) {
                userRepository.delete(testUserB);
                System.out.println("✅ 删除测试用户B");
            }
        } catch (Exception e) {
            // 忽略删除失败
        }

        // 清理Spring Security Context
        SecurityContextHolder.clearContext();

        System.out.println("🏁 ========== 测试结束 ==========\n");
    }

    /**
     * 模拟用户登录
     * 设置Spring Security Context
     *
     * 注意：UserContextUtil.getCurrentUserId() 返回email（不是Long类型的userId）
     */
    protected void loginAs(User user) {
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("userId", user.getEmail()); // ✅ 使用email作为userId（与实际系统一致）
        userInfo.put("email", user.getEmail());
        userInfo.put("username", user.getUsername());
        userInfo.put("isAdmin", false);

        UsernamePasswordAuthenticationToken auth =
            new UsernamePasswordAuthenticationToken(userInfo, null, null);
        SecurityContextHolder.getContext().setAuthentication(auth);

        System.out.println("🔐 模拟登录: " + user.getEmail());
    }

    /**
     * 清理用户数据目录
     */
    protected void cleanupUserData(String userId) {
        try {
            // 清理user_data目录
            String safeUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "_");
            Path userDataPath = Paths.get("user_data", safeUserId);
            if (Files.exists(userDataPath)) {
                Files.walk(userDataPath)
                    .sorted((a, b) -> -a.compareTo(b)) // 先删除文件，再删除目录
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                        } catch (IOException e) {
                            // 忽略删除失败
                        }
                    });
            }

            // 清理logs目录
            Path logPath = Paths.get("logs", "user_" + safeUserId);
            if (Files.exists(logPath)) {
                Files.walk(logPath)
                    .sorted((a, b) -> -a.compareTo(b))
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                        } catch (IOException e) {
                            // 忽略删除失败
                        }
                    });
            }
        } catch (IOException e) {
            // 忽略清理失败
        }
    }

    /**
     * 检查文件是否存在
     */
    protected boolean fileExists(String userId, String fileName) {
        String safeUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "_");
        return new File("user_data/" + safeUserId + "/" + fileName).exists();
    }

    /**
     * 读取用户文件内容
     */
    protected String readUserFile(String userId, String fileName) throws IOException {
        String safeUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "_");
        Path filePath = Paths.get("user_data", safeUserId, fileName);
        if (!Files.exists(filePath)) {
            return null;
        }
        return Files.readString(filePath);
    }

    /**
     * 断言文件存在
     */
    protected void assertFileExists(String userId, String fileName, String message) {
        if (!fileExists(userId, fileName)) {
            throw new AssertionError(message + " - 文件不存在: user_data/" + userId + "/" + fileName);
        }
    }

    /**
     * 断言文件不存在
     */
    protected void assertFileNotExists(String userId, String fileName, String message) {
        if (fileExists(userId, fileName)) {
            throw new AssertionError(message + " - 文件不应该存在: user_data/" + userId + "/" + fileName);
        }
    }
}

