package config;

import cn.authing.sdk.java.client.ManagementClient;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Authing身份认证配置类
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 */
@Configuration
@Slf4j
public class AuthingConfig {
    
    private static final Dotenv dotenv = Dotenv.configure()
        .ignoreIfMissing()
        .load();
    
    private final String userPoolId = dotenv.get("AUTHING_USER_POOL_ID", "");
    private final String appSecret = dotenv.get("AUTHING_APP_SECRET", "");
    private final String appId = dotenv.get("AUTHING_APP_ID", "");
    private final String appHost = dotenv.get("AUTHING_APP_HOST", "https://your-domain.authing.cn");
    
    // 添加调试日志
    {
        log.info("🔧 Authing配置加载中...");
        log.info("📝 用户池ID: {}", userPoolId.isEmpty() ? "未配置" : userPoolId);
        log.info("📝 应用ID: {}", appId.isEmpty() ? "未配置" : appId);
        log.info("📝 应用密钥: {}", appSecret.isEmpty() ? "未配置" : "已配置");
        log.info("🌐 域名: {}", appHost);
    }
    
    @Bean
    public ManagementClient managementClient() {
        // ManagementClient需要特定的配置，这里先返回null
        // 我们主要使用AuthenticationClient进行用户认证
        log.info("✅ Authing配置加载成功");
        log.info("📝 用户池ID: {}", userPoolId);
        log.info("📝 应用ID: {}", appId);
        log.info("🌐 域名: {}", appHost);
        return null;
    }
    
    public String getAppId() {
        return appId;
    }
    
    public String getUserPoolId() {
        return userPoolId;
    }
    
    public String getAppHost() {
        return appHost;
    }
}
