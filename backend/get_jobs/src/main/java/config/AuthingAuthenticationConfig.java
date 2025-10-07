package config;

import cn.authing.sdk.java.client.AuthenticationClient;
import cn.authing.sdk.java.model.AuthenticationClientOptions;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Authing用户认证客户端配置
 * 用于token验证和用户认证
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Slf4j
// @Configuration  // 禁用认证配置
public class AuthingAuthenticationConfig {

    @Autowired
    private Dotenv dotenv;

    /**
     * 创建Authing用户认证客户端 V3
     * 用于token验证和用户认证
     */
    @Bean
    public AuthenticationClient authenticationClient() {
        try {
            String appId = dotenv.get("AUTHING_APP_ID", "");
            String appHost = dotenv.get("AUTHING_APP_HOST", "");
            String appSecret = dotenv.get("AUTHING_APP_SECRET", "");
            
            log.info("初始化Authing AuthenticationClient V3");
            log.debug("应用ID: {}", appId);
            log.debug("应用域名: {}", appHost);
            log.debug("应用密钥: {}***", appSecret != null ? appSecret.substring(0, 8) : "null");
            
            // 按照V3文档正确的方式创建 AuthenticationClient
            AuthenticationClientOptions clientOptions = new AuthenticationClientOptions();
            clientOptions.setAppId(appId);
            clientOptions.setAppHost(appHost);
            clientOptions.setAppSecret(appSecret);
            
            AuthenticationClient client = new AuthenticationClient(clientOptions);
            
            log.info("✅ Authing AuthenticationClient V3初始化成功");
            return client;
        } catch (Exception e) {
            log.error("❌ Authing AuthenticationClient V3初始化失败: {}", e.getMessage(), e);
            throw new RuntimeException("无法初始化Authing AuthenticationClient V3", e);
        }
    }
}