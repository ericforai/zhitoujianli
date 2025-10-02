package config;

import cn.authing.sdk.java.client.ManagementClient;
import cn.authing.sdk.java.model.ManagementClientOptions;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Authing管理客户端配置
 * 用于用户验证和用户池管理
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Slf4j
@Configuration
public class AuthingManagementConfig {

    @Autowired
    private Dotenv dotenv;

    /**
     * 创建Authing管理客户端 V3
     * 用于后端验证和用户管理
     */
    @Bean
    public ManagementClient managementClient() {
        try {
            String userPoolId = dotenv.get("AUTHING_USER_POOL_ID", "");
            String appSecret = dotenv.get("AUTHING_APP_SECRET", "");
            
            log.info("初始化Authing ManagementClient V3");
            log.debug("用户池ID: {}", userPoolId);
            log.debug("应用密钥: {}***", appSecret != null ? appSecret.substring(0, 8) : "null");
            
            // 按照V3文档正确的方式创建 ManagementClient
            ManagementClientOptions clientOptions = new ManagementClientOptions();
            clientOptions.setAccessKeyId(userPoolId);  // 用户池ID
            clientOptions.setAccessKeySecret(appSecret);  // 应用密钥
            ManagementClient client = new ManagementClient(clientOptions);
            
            log.info("✅ Authing ManagementClient V3初始化成功");
            return client;
        } catch (Exception e) {
            log.error("❌ Authing ManagementClient V3初始化失败: {}", e.getMessage(), e);
            throw new RuntimeException("无法初始化Authing ManagementClient V3", e);
        }
    }
}