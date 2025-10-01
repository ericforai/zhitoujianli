package config;

import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

/**
 * Authing身份认证配置类
 * 提供配置信息读取
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 */
@Configuration
@Slf4j
public class AuthingConfig {
    
    @Autowired
    private Dotenv dotenv;
    
    public void logConfig() {
        log.info("✅ Authing配置加载成功");
        log.info("📝 用户池ID: {}", getUserPoolId().isEmpty() ? "未配置" : getUserPoolId());
        log.info("📝 应用ID: {}", getAppId().isEmpty() ? "未配置" : getAppId());
        log.info("📝 应用密钥: {}", getAppSecret().isEmpty() ? "未配置" : "已配置");
        log.info("🌐 域名: {}", getAppHost());
    }
    
    public String getAppId() {
        return dotenv.get("AUTHING_APP_ID", "");
    }
    
    public String getUserPoolId() {
        return dotenv.get("AUTHING_USER_POOL_ID", "");
    }
    
    public String getAppHost() {
        return dotenv.get("AUTHING_APP_HOST", "https://your-domain.authing.cn");
    }
    
    public String getAppSecret() {
        return dotenv.get("AUTHING_APP_SECRET", "");
    }
}