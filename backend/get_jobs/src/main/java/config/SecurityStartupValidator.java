package config;

import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * 安全配置启动验证器
 * 在应用启动时验证关键安全配置
 *
 * 🔒 验证项目：
 * 1. SECURITY_ENABLED 配置（必须为 true）
 * 2. JWT_SECRET 配置（必须存在且≥32字符）
 * 3. Authing 认证配置（必须存在）
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-10
 * @version 2.2.0
 */
@Slf4j
@Component
@Order(1) // 最高优先级，在所有其他组件之前执行
public class SecurityStartupValidator implements CommandLineRunner {

    @Autowired
    private Dotenv dotenv;

    @Override
    public void run(String... args) throws Exception {
        log.info("=".repeat(60));
        log.info("🔒 安全配置启动验证 (v2.2.0)");
        log.info("=".repeat(60));

        boolean allChecksPass = true;

        // 检查 1: SECURITY_ENABLED 配置
        String securityEnabledValue = dotenv.get("SECURITY_ENABLED", "true");
        boolean securityEnabled = Boolean.parseBoolean(securityEnabledValue);

        if (!securityEnabled) {
            log.error("❌ [CRITICAL] SECURITY_ENABLED=false 检测到！");
            log.error("❌ 多租户系统要求 SECURITY_ENABLED 必须为 true");
            log.error("❌ 系统已自动覆盖为 true（见 SimpleSecurityConfig）");
            allChecksPass = false;
        } else {
            log.info("✅ SECURITY_ENABLED=true (正确配置)");
        }

        // 检查 2: JWT Secret 配置
        String jwtSecret = dotenv.get("JWT_SECRET");
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            log.error("❌ [CRITICAL] JWT_SECRET 未配置");
            allChecksPass = false;
        } else if (jwtSecret.length() < 32) {
            log.error("❌ [CRITICAL] JWT_SECRET 过短（当前: {} 字符，要求: ≥32 字符）", jwtSecret.length());
            allChecksPass = false;
        } else {
            log.info("✅ JWT_SECRET 已配置 (长度: {} 字符)", jwtSecret.length());
        }

        // 检查 3: Authing 配置
        String authingAppId = dotenv.get("AUTHING_APP_ID");
        String authingAppSecret = dotenv.get("AUTHING_APP_SECRET");
        String authingDomain = dotenv.get("AUTHING_DOMAIN");

        if (authingAppId == null || authingAppId.isEmpty()) {
            log.warn("⚠️  AUTHING_APP_ID 未配置，认证功能可能受影响");
        } else if (authingAppSecret == null || authingAppSecret.isEmpty()) {
            log.warn("⚠️  AUTHING_APP_SECRET 未配置，认证功能可能受影响");
        } else if (authingDomain == null || authingDomain.isEmpty()) {
            log.warn("⚠️  AUTHING_DOMAIN 未配置，认证功能可能受影响");
        } else {
            log.info("✅ AUTHING 配置已就绪 (AppId: {}..., Domain: {})",
                     authingAppId.substring(0, Math.min(8, authingAppId.length())),
                     authingDomain);
        }

        // 检查 4: 数据库配置
        String databaseUrl = dotenv.get("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isEmpty()) {
            log.warn("⚠️  DATABASE_URL 未配置，将使用默认配置");
        } else {
            // 脱敏显示（隐藏密码）
            String sanitizedUrl = databaseUrl.replaceAll("password=[^&;]*", "password=***");
            log.info("✅ DATABASE_URL 已配置: {}", sanitizedUrl);
        }

        // 检查 5: AI 服务配置
        String deepseekApiKey = dotenv.get("DEEPSEEK_API_KEY");
        if (deepseekApiKey == null || deepseekApiKey.isEmpty()) {
            log.warn("⚠️  DEEPSEEK_API_KEY 未配置，AI 功能将不可用");
        } else {
            log.info("✅ DEEPSEEK_API_KEY 已配置 (长度: {} 字符)", deepseekApiKey.length());
        }

        log.info("=".repeat(60));
        if (allChecksPass) {
            log.info("✅✅✅ 所有关键安全配置检查通过");
            log.info("✅ 多租户隔离机制已启用");
            log.info("✅ Spring Security 强制启用（不受环境变量控制）");
        } else {
            log.warn("⚠️⚠️⚠️  部分安全配置存在问题");
            log.warn("⚠️  系统已自动修复关键问题，但建议检查配置文件");
        }
        log.info("=".repeat(60));
    }
}

