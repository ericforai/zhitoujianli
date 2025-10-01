package boss;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import static org.junit.jupiter.api.Assertions.*;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * BossConfig配置加载测试
 * 验证多用户配置加载的准确性
 */
public class BossConfigTest {

    private static final String TEST_USER_ID = "test_user_123";
    private static final String TEST_CONFIG_PATH = "user_data/" + TEST_USER_ID + "/config.json";

    @BeforeEach
    void setUp() throws IOException {
        // 创建测试用户目录
        File userDir = new File("user_data/" + TEST_USER_ID);
        if (!userDir.exists()) {
            userDir.mkdirs();
        }
    }

    @AfterEach
    void tearDown() {
        // 清理测试文件
        File configFile = new File(TEST_CONFIG_PATH);
        if (configFile.exists()) {
            configFile.delete();
        }
        
        File userDir = new File("user_data/" + TEST_USER_ID);
        if (userDir.exists()) {
            userDir.delete();
        }
    }

    @Test
    void testLoadDefaultConfig() {
        // 测试加载默认配置
        BossConfig config = BossConfig.init();
        
        assertNotNull(config, "默认配置不应该为null");
        assertNotNull(config.getKeywords(), "默认关键词不应该为null");
        assertFalse(config.getKeywords().isEmpty(), "默认关键词不应该为空");
        
        System.out.println("✅ 默认配置测试通过");
        System.out.println("   关键词: " + config.getKeywords());
        System.out.println("   城市: " + config.getCityCode());
        System.out.println("   薪资: " + config.getSalary());
    }

    @Test
    void testLoadUserConfig() throws IOException {
        // 创建测试用户配置
        createTestUserConfig();
        
        // 测试加载用户配置
        BossConfig config = BossConfig.init(TEST_USER_ID);
        
        assertNotNull(config, "用户配置不应该为null");
        assertNotNull(config.getKeywords(), "用户关键词不应该为null");
        assertEquals(Arrays.asList("市场营销", "品牌营销"), config.getKeywords(), 
                    "用户配置的关键词应该被正确加载");
        assertEquals("您好！这是测试用户的打招呼语", config.getSayHi(), 
                    "用户配置的打招呼语应该被正确加载");
        
        System.out.println("✅ 用户配置测试通过");
        System.out.println("   关键词: " + config.getKeywords());
        System.out.println("   打招呼语: " + config.getSayHi());
    }

    @Test
    void testConfigMerge() throws IOException {
        // 创建测试用户配置（只包含部分字段）
        createPartialTestUserConfig();
        
        // 测试配置合并
        BossConfig config = BossConfig.init(TEST_USER_ID);
        
        assertNotNull(config, "合并后的配置不应该为null");
        
        // 用户配置应该覆盖默认配置
        assertEquals(Arrays.asList("产品经理"), config.getKeywords(), 
                    "用户关键词应该覆盖默认关键词");
        
        // 默认配置应该保留其他字段
        assertNotNull(config.getCityCode(), "城市配置应该保留默认值");
        assertNotNull(config.getSalary(), "薪资配置应该保留默认值");
        assertNotNull(config.getExperience(), "经验配置应该保留默认值");
        
        System.out.println("✅ 配置合并测试通过");
        System.out.println("   关键词: " + config.getKeywords());
        System.out.println("   城市: " + config.getCityCode());
        System.out.println("   薪资: " + config.getSalary());
    }

    @Test
    void testInvalidUserId() {
        // 测试无效用户ID
        BossConfig config = BossConfig.init("invalid_user_id");
        
        assertNotNull(config, "无效用户ID应该返回默认配置");
        assertNotNull(config.getKeywords(), "应该返回默认关键词");
        
        System.out.println("✅ 无效用户ID测试通过");
        System.out.println("   返回默认关键词: " + config.getKeywords());
    }

    @Test
    void testNullUserId() {
        // 测试null用户ID
        BossConfig config = BossConfig.init(null);
        
        assertNotNull(config, "null用户ID应该返回默认配置");
        assertNotNull(config.getKeywords(), "应该返回默认关键词");
        
        System.out.println("✅ null用户ID测试通过");
        System.out.println("   返回默认关键词: " + config.getKeywords());
    }

    /**
     * 创建完整的测试用户配置
     */
    private void createTestUserConfig() throws IOException {
        String configJson = """
            {
              "boss": {
                "debugger": false,
                "sayHi": "您好！这是测试用户的打招呼语",
                "keywords": ["市场营销", "品牌营销"],
                "industry": ["不限"],
                "cityCode": ["北京", "上海"],
                "experience": ["5-10年"],
                "jobType": "不限",
                "salary": "20K以上",
                "degree": ["本科"],
                "scale": ["100-500人"],
                "stage": ["A轮"],
                "expectedSalary": [20, 40],
                "waitTime": 30,
                "filterDeadHR": true,
                "enableAI": true,
                "enableSmartGreeting": true,
                "sendImgResume": false,
                "deadStatus": ["2周内活跃", "本月活跃"]
              }
            }
            """;
        
        try (FileWriter writer = new FileWriter(TEST_CONFIG_PATH)) {
            writer.write(configJson);
        }
    }

    /**
     * 创建部分字段的测试用户配置
     */
    private void createPartialTestUserConfig() throws IOException {
        String configJson = """
            {
              "boss": {
                "keywords": ["产品经理"],
                "sayHi": "您好！我是产品经理"
              }
            }
            """;
        
        try (FileWriter writer = new FileWriter(TEST_CONFIG_PATH)) {
            writer.write(configJson);
        }
    }
}
