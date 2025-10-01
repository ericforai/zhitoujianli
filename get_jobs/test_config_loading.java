import boss.BossConfig;
import java.io.File;
import java.io.FileWriter;
import java.util.Arrays;

/**
 * BossConfig配置加载测试脚本
 * 验证多用户配置加载的准确性
 */
public class test_config_loading {
    
    private static final String TEST_USER_ID = "test_user_123";
    private static final String TEST_CONFIG_PATH = "user_data/" + TEST_USER_ID + "/config.json";

    public static void main(String[] args) {
        System.out.println("🧪 开始BossConfig配置加载测试");
        System.out.println("=====================================");
        
        try {
            // 测试1: 默认配置加载
            testDefaultConfig();
            
            // 测试2: 用户配置加载
            testUserConfig();
            
            // 测试3: 配置合并
            testConfigMerge();
            
            // 测试4: 无效用户ID
            testInvalidUserId();
            
            // 测试5: null用户ID
            testNullUserId();
            
            System.out.println("=====================================");
            System.out.println("🎉 所有测试通过！");
            
        } catch (Exception e) {
            System.err.println("❌ 测试失败: " + e.getMessage());
            e.printStackTrace();
        } finally {
            // 清理测试文件
            cleanup();
        }
    }

    private static void testDefaultConfig() throws Exception {
        System.out.println("\n📋 测试1: 默认配置加载");
        
        BossConfig config = BossConfig.init();
        
        if (config == null) {
            throw new Exception("默认配置不应该为null");
        }
        if (config.getKeywords() == null) {
            throw new Exception("默认关键词不应该为null");
        }
        if (config.getKeywords().isEmpty()) {
            throw new Exception("默认关键词不应该为空");
        }
        
        System.out.println("✅ 默认配置测试通过");
        System.out.println("   关键词: " + config.getKeywords());
        System.out.println("   城市: " + config.getCityCode());
        System.out.println("   薪资: " + config.getSalary());
    }

    private static void testUserConfig() throws Exception {
        System.out.println("\n📋 测试2: 用户配置加载");
        
        // 创建测试用户配置
        createTestUserConfig();
        
        BossConfig config = BossConfig.init(TEST_USER_ID);
        
        if (config == null) {
            throw new Exception("用户配置不应该为null");
        }
        if (config.getKeywords() == null) {
            throw new Exception("用户关键词不应该为null");
        }
        
        // 验证用户配置是否正确加载
        if (!config.getKeywords().equals(Arrays.asList("市场营销", "品牌营销"))) {
            throw new Exception("用户配置的关键词应该被正确加载");
        }
        if (!"您好！这是测试用户的打招呼语".equals(config.getSayHi())) {
            throw new Exception("用户配置的打招呼语应该被正确加载");
        }
        
        System.out.println("✅ 用户配置测试通过");
        System.out.println("   关键词: " + config.getKeywords());
        System.out.println("   打招呼语: " + config.getSayHi());
    }

    private static void testConfigMerge() throws Exception {
        System.out.println("\n📋 测试3: 配置合并");
        
        // 创建部分字段的测试用户配置
        createPartialTestUserConfig();
        
        BossConfig config = BossConfig.init(TEST_USER_ID);
        
        if (config == null) {
            throw new Exception("合并后的配置不应该为null");
        }
        
        // 用户配置应该覆盖默认配置
        if (!config.getKeywords().equals(Arrays.asList("产品经理"))) {
            throw new Exception("用户关键词应该覆盖默认关键词");
        }
        
        // 默认配置应该保留其他字段
        if (config.getCityCode() == null) {
            throw new Exception("城市配置应该保留默认值");
        }
        if (config.getSalary() == null) {
            throw new Exception("薪资配置应该保留默认值");
        }
        
        System.out.println("✅ 配置合并测试通过");
        System.out.println("   关键词: " + config.getKeywords());
        System.out.println("   城市: " + config.getCityCode());
        System.out.println("   薪资: " + config.getSalary());
    }

    private static void testInvalidUserId() throws Exception {
        System.out.println("\n📋 测试4: 无效用户ID");
        
        BossConfig config = BossConfig.init("invalid_user_id");
        
        if (config == null) {
            throw new Exception("无效用户ID应该返回默认配置");
        }
        if (config.getKeywords() == null) {
            throw new Exception("应该返回默认关键词");
        }
        
        System.out.println("✅ 无效用户ID测试通过");
        System.out.println("   返回默认关键词: " + config.getKeywords());
    }

    private static void testNullUserId() throws Exception {
        System.out.println("\n📋 测试5: null用户ID");
        
        BossConfig config = BossConfig.init(null);
        
        if (config == null) {
            throw new Exception("null用户ID应该返回默认配置");
        }
        if (config.getKeywords() == null) {
            throw new Exception("应该返回默认关键词");
        }
        
        System.out.println("✅ null用户ID测试通过");
        System.out.println("   返回默认关键词: " + config.getKeywords());
    }

    private static void createTestUserConfig() throws Exception {
        // 创建测试用户目录
        File userDir = new File("user_data/" + TEST_USER_ID);
        if (!userDir.exists()) {
            userDir.mkdirs();
        }
        
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

    private static void createPartialTestUserConfig() throws Exception {
        // 创建测试用户目录
        File userDir = new File("user_data/" + TEST_USER_ID);
        if (!userDir.exists()) {
            userDir.mkdirs();
        }
        
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

    private static void cleanup() {
        try {
            File configFile = new File(TEST_CONFIG_PATH);
            if (configFile.exists()) {
                configFile.delete();
            }
            
            File userDir = new File("user_data/" + TEST_USER_ID);
            if (userDir.exists()) {
                userDir.delete();
            }
            
            System.out.println("🧹 测试文件清理完成");
        } catch (Exception e) {
            System.err.println("⚠️ 清理测试文件时出错: " + e.getMessage());
        }
    }
}
