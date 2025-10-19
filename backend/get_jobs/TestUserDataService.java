import io.github.cdimascio.dotenv.Dotenv;
import java.util.HashMap;
import java.util.Map;

public class TestUserDataService {
    public static void main(String[] args) {
        try {
            // 创建dotenv实例
            Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .ignoreIfMissing()
                .load();

            System.out.println("SECURITY_ENABLED = " + dotenv.get("SECURITY_ENABLED", "true"));

            // 模拟UserDataService的逻辑
            boolean securityEnabled = Boolean.parseBoolean(dotenv.get("SECURITY_ENABLED", "true"));
            System.out.println("安全认证状态: " + securityEnabled);

            // 模拟hasCurrentUser()返回false的情况
            boolean hasCurrentUser = false;
            System.out.println("hasCurrentUser: " + hasCurrentUser);

            // 检查逻辑
            if (securityEnabled && !hasCurrentUser) {
                System.out.println("❌ 安全认证已启用但没有当前用户，无法保存配置");
            } else if (!securityEnabled) {
                System.out.println("✅ 安全认证已禁用，使用默认用户保存配置");
                System.out.println("用户ID: default_user");
                System.out.println("配置文件路径: user_data/default_user/config.json");
            } else {
                System.out.println("✅ 安全认证已启用，使用当前用户保存配置");
            }

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
