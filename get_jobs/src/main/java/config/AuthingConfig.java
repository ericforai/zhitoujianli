package config;

import cn.authing.sdk.java.client.ManagementClient;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
    
    @Autowired
    private Dotenv dotenv;
    
    private String userPoolId;
    private String appSecret;
    private String appId;
    private String appHost;
    
    @Bean
    public ManagementClient managementClient() {
        // 从.env文件加载配置
        userPoolId = dotenv.get("AUTHING_USER_POOL_ID", "");
        appSecret = dotenv.get("AUTHING_APP_SECRET", "");
        appId = dotenv.get("AUTHING_APP_ID", "");
        appHost = dotenv.get("AUTHING_APP_HOST", "https://your-domain.authing.cn");
        
        // ManagementClient需要特定的配置，这里先返回null
        // 我们主要使用AuthenticationClient进行用户认证
        log.info("✅ Authing配置加载成功");
        log.info("📝 用户池ID: {}", userPoolId.isEmpty() ? "未配置" : userPoolId);
        log.info("📝 应用ID: {}", appId.isEmpty() ? "未配置" : appId);
        log.info("📝 应用密钥: {}", appSecret.isEmpty() ? "未配置" : "已配置");
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
    
    public String getAppSecret() {
        return appSecret;
    }
}