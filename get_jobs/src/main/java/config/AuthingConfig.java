package config;

import cn.authing.sdk.java.client.ManagementClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
    
    @Value("${authing.userPoolId}")
    private String userPoolId;
    
    @Value("${authing.appSecret}")
    private String appSecret;
    
    @Value("${authing.appId}")
    private String appId;
    
    @Value("${authing.appHost}")
    private String appHost;
    
    @Bean
    public ManagementClient managementClient() {
        try {
            cn.authing.sdk.java.model.ManagementClientOptions options = 
                new cn.authing.sdk.java.model.ManagementClientOptions();
            options.setAccessKeyId(userPoolId);
            options.setAccessKeySecret(appSecret);
            options.setHost(appHost);
            
            ManagementClient client = new ManagementClient(options);
            
            log.info("✅ Authing管理客户端初始化成功");
            log.info("📝 用户池ID: {}", userPoolId);
            log.info("📝 应用ID: {}", appId);
            log.info("🌐 域名: {}", appHost);
            
            return client;
        } catch (Exception e) {
            log.error("❌ Authing管理客户端初始化失败", e);
            return null;
        }
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
