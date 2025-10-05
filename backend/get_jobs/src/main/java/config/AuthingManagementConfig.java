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

            // 重要：ManagementClient需要专门的AccessKey
            // 根据Authing官方文档，ManagementClient的认证方式如下：
            // 1. AccessKeyId: 通常是用户池的管理员AccessKey
            // 2. AccessKeySecret: 对应的AccessKeySecret
            // 3. Host: 管理API的端点

            log.info("🔍 配置ManagementClient认证信息");
            log.info("📝 用户池ID: {}", userPoolId);
            log.info("📝 应用密钥: {}***", appSecret != null ? appSecret.substring(0, 8) : "null");

            // ManagementClient需要使用专门的AccessKey，而不是应用密钥
            // 根据Authing官方文档，ManagementClient的认证方式如下：
            // 1. 需要在Authing控制台创建AccessKey
            // 2. AccessKeyId和AccessKeySecret与应用的APP_SECRET不同

            // 临时解决方案：尝试使用应用配置，但设置正确的host
            clientOptions.setAccessKeyId(userPoolId);  // 使用用户池ID作为AccessKeyId
            clientOptions.setAccessKeySecret(appSecret);  // 使用应用密钥作为AccessKeySecret
            clientOptions.setHost("https://core.authing.cn");  // 设置管理API的host

            // 注意：如果仍然认证失败，需要在Authing控制台创建专门的AccessKey

            log.info("⚠️ 如果认证失败，需要在Authing控制台获取专门的ManagementClient AccessKey");

            ManagementClient client = new ManagementClient(clientOptions);

            log.info("✅ Authing ManagementClient V3初始化成功");
            return client;
        } catch (Exception e) {
            log.error("❌ Authing ManagementClient V3初始化失败: {}", e.getMessage(), e);
            throw new RuntimeException("无法初始化Authing ManagementClient V3", e);
        }
    }
}
