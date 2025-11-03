package multitenanttest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import controller.BossCookieController;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Boss Cookie隔离测试
 * 验证P0-1修复：用户A的Cookie不会被用户B看到
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-03
 */
public class BossCookieIsolationTest extends BaseMultiTenantTest {

    @Autowired
    private BossCookieController bossCookieController;

    @Test
    public void testCookieIsolation_UserACannotSeeUserBCookie() {
        System.out.println("\n📋 测试：Cookie隔离 - 用户A无法看到用户B的Cookie");

        // 1. 用户A登录
        loginAs(testUserA);

        // 2. 用户A保存Cookie
        Map<String, Object> cookieRequestA = new HashMap<>();
        cookieRequestA.put("cookie", "user_a_boss_cookie_data_12345");
        Map<String, Object> resultA = bossCookieController.saveCookie(cookieRequestA);

        assertTrue((Boolean) resultA.get("success"), "用户A保存Cookie应该成功");
        System.out.println("✅ 用户A保存Cookie成功");

        // 3. 验证文件系统：用户A的Cookie文件存在
        assertFileExists(userIdA, "boss_cookie.json", "用户A的Cookie文件应该存在");
        System.out.println("✅ 用户A的Cookie文件已创建");

        // 4. 用户B登录
        loginAs(testUserB);

        // 5. 用户B读取Cookie（应该为空或失败）
        Map<String, Object> cookieB = bossCookieController.getCookie();

        // 断言：用户B应该读不到用户A的Cookie
        if (cookieB.containsKey("cookie")) {
            assertNotEquals("user_a_boss_cookie_data_12345", cookieB.get("cookie"),
                "用户B不应该看到用户A的Cookie数据");
        }
        System.out.println("✅ 用户B无法看到用户A的Cookie");

        // 6. 验证文件系统：用户B的Cookie文件不存在
        assertFileNotExists(userIdB, "boss_cookie.json", "用户B的Cookie文件不应该存在（未保存过）");
        System.out.println("✅ 用户B的Cookie文件未创建（符合预期）");

        System.out.println("🎉 测试通过：Cookie完全隔离");
    }

    @Test
    public void testCookieIsolation_BothUsersCanSaveIndependently() {
        System.out.println("\n📋 测试：Cookie隔离 - 两个用户可以独立保存");

        // 1. 用户A保存Cookie
        loginAs(testUserA);
        Map<String, Object> cookieA = new HashMap<>();
        cookieA.put("cookie", "cookie_data_for_user_a");
        bossCookieController.saveCookie(cookieA);
        System.out.println("✅ 用户A保存Cookie");

        // 2. 用户B保存不同的Cookie
        loginAs(testUserB);
        Map<String, Object> cookieB = new HashMap<>();
        cookieB.put("cookie", "cookie_data_for_user_b");
        bossCookieController.saveCookie(cookieB);
        System.out.println("✅ 用户B保存Cookie");

        // 3. 验证两个文件都存在
        assertFileExists(userIdA, "boss_cookie.json", "用户A的Cookie文件");
        assertFileExists(userIdB, "boss_cookie.json", "用户B的Cookie文件");
        System.out.println("✅ 两个用户的Cookie文件都存在");

        // 4. 验证用户A读取的是自己的Cookie
        loginAs(testUserA);
        Map<String, Object> loadedA = bossCookieController.getCookie();
        assertEquals("cookie_data_for_user_a", loadedA.get("cookie"),
            "用户A应该读取到自己的Cookie");
        System.out.println("✅ 用户A读取到正确的Cookie");

        // 5. 验证用户B读取的是自己的Cookie
        loginAs(testUserB);
        Map<String, Object> loadedB = bossCookieController.getCookie();
        assertEquals("cookie_data_for_user_b", loadedB.get("cookie"),
            "用户B应该读取到自己的Cookie");
        System.out.println("✅ 用户B读取到正确的Cookie");

        System.out.println("🎉 测试通过：两个用户的Cookie完全独立");
    }
}




