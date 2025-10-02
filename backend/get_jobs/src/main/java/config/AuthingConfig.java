package config;

import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import jakarta.annotation.PostConstruct;

/**
 * Authing身份认证配置类
 * 提供配置信息读取和启动时验证
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 */
@Configuration
@Slf4j
public class AuthingConfig {
    
    @Autowired
    private Dotenv dotenv;

    @PostConstruct
    public void validateConfig() {
        log.info("开始验证关键环境变量...");
        
        String appId = getAppId();
        String jwtSecret = dotenv.get("JWT_SECRET");

        if (!StringUtils.hasText(appId)) {
            log.error("❌ 关键配置缺失：AUTHING_APP_ID 未在环境变量中设置。");
            throw new IllegalStateException("AUTHING_APP_ID is not configured. Halting application startup.");
        }

        if (!StringUtils.hasText(jwtSecret)) {
            log.error("❌ 关键配置缺失：JWT_SECRET 未在环境变量中设置。");
            throw new IllegalStateException("JWT_SECRET is not configured. Halting application startup for security reasons.");
        }

        if (jwtSecret.length() < 32) {
            log.warn("⚠️ 安全警告：JWT_SECRET 的长度小于32个字符，这对于生产环境是不安全的。");
        }

        log.info("✅ 关键环境变量验证通过。");
    }
    
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