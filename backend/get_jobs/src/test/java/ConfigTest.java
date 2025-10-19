import boss.BossConfig;
import boss.BossEnum;

public class ConfigTest {
    public static void main(String[] args) {
        try {
            System.out.println("开始测试Boss配置解析...");
            BossConfig config = BossConfig.init();
            System.out.println("✅ Boss配置解析成功！");
            System.out.println("薪资范围: " + config.getSalary());
            System.out.println("关键词: " + config.getKeywords());
            System.out.println("城市编码: " + config.getCityCode());

            // 测试薪资枚举
            System.out.println("\n测试薪资枚举:");
            BossEnum.Salary salary = BossEnum.Salary.forValue("50K以上");
            System.out.println("50K以上 -> " + salary.getCode());

        } catch (Exception e) {
            System.err.println("❌ 配置解析失败: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
