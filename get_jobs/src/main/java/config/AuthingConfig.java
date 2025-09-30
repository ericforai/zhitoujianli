package config;

import cn.authing.sdk.java.client.ManagementClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Authing身份认证配置类
 * 
 * Authing是国内专业的身份认证云服务（类似Auth0）
 * 提供开箱即用的登录注册功能，支持20+种登录方式
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 */
@Configuration
@Slf4j
public class AuthingConfig {
    
    @Value("${authing.userPoolId:}")
    private String userPoolId;
    
    @Value("${authing.appSecret:}")
    private String appSecret;
    
    @Value("${authing.appId:}")
    private String appId;
    
    /**
     * 创建Authing管理客户端
     * 用于后端管理用户、角色、权限等
     */
    @Bean
    public ManagementClient managementClient() {
        if (userPoolId == null || userPoolId.isEmpty() || 
            appSecret == null || appSecret.isEmpty()) {
            log.warn("Authing配置未设置，认证功能将不可用");
            log.warn("请在.env文件中配置 AUTHING_USER_POOL_ID 和 AUTHING_APP_SECRET");
            log.warn("访问 https://authing.cn/ 注册账号并获取配置");
            return null;
        }
        
        try {
            ManagementClient client = new ManagementClient(userPoolId, appSecret);
            log.info("Authing管理客户端初始化成功");
            log.info("用户池ID: {}", userPoolId);
            return client;
        } catch (Exception e) {
            log.error("Authing管理客户端初始化失败", e);
            return null;
        }
    }
    
    public String getAppId() {
        return appId;
    }
    
    public String getUserPoolId() {
        return userPoolId;
    }
}
