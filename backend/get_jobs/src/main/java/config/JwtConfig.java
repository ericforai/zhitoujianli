package config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.nio.charset.StandardCharsets;

/**
 * JWT配置类
 * 🔐 安全修复：在应用启动时验证JWT_SECRET配置
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-10
 */
@Slf4j
@Configuration
@Getter
public class JwtConfig {

    @Autowired
    private Dotenv dotenv;

    private String jwtSecret;
    private long jwtExpiration;

    /**
     * 在Spring Bean初始化后立即验证JWT配置
     * 如果配置不正确，应用将无法启动
     */
    @PostConstruct
    public void validateJwtConfig() {
        log.info("🔐 开始验证JWT配置...");

        // 1. 验证JWT_SECRET是否配置
        jwtSecret = dotenv.get("JWT_SECRET");
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            String errorMsg = "❌ 致命错误：JWT_SECRET未配置！应用无法启动。%n" +
                            "请在.env文件中配置JWT_SECRET，例如：%n" +
                            "JWT_SECRET=your-256-bit-secret-key-here";
            log.error(errorMsg);
            throw new IllegalStateException("JWT_SECRET未配置");
        }

        // 2. 验证JWT_SECRET长度（至少32字节，256位）
        if (jwtSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            String errorMsg = String.format(
                "❌ 安全警告：JWT_SECRET长度不足！当前长度：%d字节，建议至少32字节（256位）%n" +
                "建议使用以下命令生成安全的密钥：%n" +
                "openssl rand -base64 32",
                jwtSecret.getBytes(StandardCharsets.UTF_8).length
            );
            log.error(errorMsg);
            throw new IllegalStateException("JWT_SECRET长度不足，安全性低");
        }

        // 3. 验证JWT过期时间配置
        String expirationStr = dotenv.get("JWT_EXPIRATION", "86400000"); // 默认24小时
        try {
            jwtExpiration = Long.parseLong(expirationStr);
            if (jwtExpiration <= 0) {
                throw new IllegalStateException("JWT_EXPIRATION必须大于0");
            }
            if (jwtExpiration < 3600000) { // 小于1小时
                log.warn("⚠️ 警告：JWT过期时间少于1小时，可能影响用户体验");
            }
        } catch (NumberFormatException e) {
            log.error("❌ JWT_EXPIRATION配置格式错误：{}", expirationStr);
            throw new IllegalStateException("JWT_EXPIRATION配置格式错误");
        }

        // 4. 检查环境
        String env = System.getProperty("spring.profiles.active", "development");
        if ("production".equals(env)) {
            // 生产环境额外检查
            validateProductionSecurity();
        }

        log.info("✅ JWT配置验证通过");
        log.info("JWT密钥长度: {}字节", jwtSecret.getBytes(StandardCharsets.UTF_8).length);
        log.info("JWT过期时间: {}毫秒 ({}小时)", jwtExpiration, jwtExpiration / 3600000.0);
    }

    /**
     * 生产环境额外的安全检查
     */
    private void validateProductionSecurity() {
        // 检查密钥是否是默认值或测试值
        String[] unsafeSecrets = {
            "secret",
            "test",
            "demo",
            "12345",
            "password",
            "your-256-bit-secret",
            "your-secret-key"
        };

        for (String unsafeSecret : unsafeSecrets) {
            if (jwtSecret.toLowerCase().contains(unsafeSecret)) {
                String errorMsg = "❌ 生产环境检测到不安全的JWT_SECRET！%n" +
                                "密钥包含常见词汇或测试值，严禁在生产环境使用！%n" +
                                "请立即更换为安全的随机密钥。";
                log.error(errorMsg);
                throw new IllegalStateException("生产环境JWT_SECRET不安全");
            }
        }

        log.info("✅ 生产环境安全检查通过");
    }

    /**
     * 获取JWT密钥
     */
    public String getJwtSecret() {
        return jwtSecret;
    }

    /**
     * 获取JWT过期时间
     */
    public long getJwtExpiration() {
        return jwtExpiration;
    }
}


