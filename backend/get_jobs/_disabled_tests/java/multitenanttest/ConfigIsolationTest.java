package multitenanttest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import service.UserDataService;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 配置隔离测试
 * 验证P0-3/4/5/6修复：用户A的配置不会影响用户B
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-03
 */
public class ConfigIsolationTest extends BaseMultiTenantTest {

    @Autowired
    private UserDataService userDataService;

    @Test
    public void testConfigIsolation_DifferentUsersHaveDifferentConfigs() {
        System.out.println("\n📋 测试：配置隔离 - 不同用户有不同配置");

        // 1. 用户A登录并保存配置
        loginAs(testUserA);

        Map<String, Object> configA = new HashMap<>();
        configA.put("keywords", Arrays.asList("Java开发", "Python开发", "后端工程师"));
        configA.put("salary", "20-30K");
        configA.put("cityCode", "101010100"); // 北京
        configA.put("experience", "3-5年");

        boolean savedA = userDataService.saveUserConfig(configA);
        assertTrue(savedA, "用户A保存配置应该成功");
        System.out.println("✅ 用户A保存配置成功: " + configA.get("keywords"));

        // 2. 用户B登录并保存完全不同的配置
        loginAs(testUserB);

        Map<String, Object> configB = new HashMap<>();
        configB.put("keywords", Arrays.asList("前端开发", "React开发", "Vue开发"));
        configB.put("salary", "15-25K");
        configB.put("cityCode", "101020100"); // 上海
        configB.put("experience", "1-3年");

        boolean savedB = userDataService.saveUserConfig(configB);
        assertTrue(savedB, "用户B保存配置应该成功");
        System.out.println("✅ 用户B保存配置成功: " + configB.get("keywords"));

        // 3. 用户A读取配置（应该是自己的）
        loginAs(testUserA);
        Map<String, Object> loadedConfigA = userDataService.loadUserConfig();

        assertNotNull(loadedConfigA, "用户A应该能读取配置");
        assertEquals(Arrays.asList("Java开发", "Python开发", "后端工程师"),
            loadedConfigA.get("keywords"), "用户A的keywords应该正确");
        assertEquals("20-30K", loadedConfigA.get("salary"), "用户A的salary应该正确");
        assertEquals("101010100", loadedConfigA.get("cityCode"), "用户A的城市应该是北京");
        System.out.println("✅ 用户A读取到正确的配置");

        // 4. 用户B读取配置（应该是自己的，不是用户A的）
        loginAs(testUserB);
        Map<String, Object> loadedConfigB = userDataService.loadUserConfig();

        assertNotNull(loadedConfigB, "用户B应该能读取配置");
        assertEquals(Arrays.asList("前端开发", "React开发", "Vue开发"),
            loadedConfigB.get("keywords"), "用户B的keywords应该正确");
        assertEquals("15-25K", loadedConfigB.get("salary"), "用户B的salary应该正确");
        assertEquals("101020100", loadedConfigB.get("cityCode"), "用户B的城市应该是上海");
        System.out.println("✅ 用户B读取到正确的配置");

        // 5. 验证配置确实不同
        assertNotEquals(loadedConfigA.get("keywords"), loadedConfigB.get("keywords"),
            "用户A和用户B的配置应该不同");
        assertNotEquals(loadedConfigA.get("salary"), loadedConfigB.get("salary"),
            "用户A和用户B的薪资配置应该不同");

        System.out.println("🎉 测试通过：配置完全隔离");
    }

    @Test
    public void testConfigIsolation_UserBCannotReadUserAConfig() {
        System.out.println("\n📋 测试：配置隔离 - 用户B无法读取用户A的配置文件");

        // 1. 用户A保存配置
        loginAs(testUserA);
        Map<String, Object> configA = new HashMap<>();
        configA.put("keywords", Arrays.asList("敏感关键词A"));
        configA.put("secretSetting", "user_a_secret");
        userDataService.saveUserConfig(configA);

        // 2. 验证用户A的配置文件存在
        assertFileExists(userIdA, "config.json", "用户A的配置文件");

        // 3. 用户B登录
        loginAs(testUserB);

        // 4. 用户B尝试读取配置（应该读不到用户A的）
        Map<String, Object> configB = userDataService.loadUserConfig();

        // 如果用户B有配置，不应包含用户A的数据
        if (configB != null && configB.containsKey("keywords")) {
            assertFalse(configB.get("keywords").toString().contains("敏感关键词A"),
                "用户B不应该看到用户A的关键词");
        }

        if (configB != null) {
            assertNull(configB.get("secretSetting"),
                "用户B不应该看到用户A的secret设置");
        }

        System.out.println("🎉 测试通过：用户B无法访问用户A的配置");
    }
}




