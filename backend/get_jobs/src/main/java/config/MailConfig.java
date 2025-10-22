package config;

import java.util.Properties;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

/**
 * 邮件服务配置
 *
 * 支持的邮件服务商:
 * - QQ邮箱 (smtp.qq.com:465)
 * - 163邮箱 (smtp.163.com:465)
 * - Gmail (smtp.gmail.com:587)
 * - 阿里云企业邮箱 (smtp.qiye.aliyun.com:465)
 *
 * 安全增强：
 * - 生产环境禁用演示模式
 * - 开发/测试环境可启用演示模式（用于测试）
 *
 * @author ZhiTouJianLi Team
 * @updated 2025-10-22 - 添加环境检测和安全控制
 */
@Slf4j
@Configuration
@Getter
public class MailConfig {

    private String host;
    private int port;
    private String username;
    private String password;
    private String from;
    private String fromName;

    /**
     * 是否允许演示模式
     * 演示模式：邮件服务未配置时，直接返回验证码（不发送邮件）
     *
     * 安全策略：
     * - 生产环境（production）：禁用演示模式，必须配置邮件服务
     * - 开发环境（dev）：允许演示模式
     * - 测试环境（test）：允许演示模式
     */
    private boolean allowDemoMode;

    @Autowired
    private Dotenv dotenv;

    @Autowired
    private Environment environment;

    @PostConstruct
    public void init() {
        log.info("📧 开始加载邮件配置...");

        host = dotenv.get("MAIL_HOST", "smtp.qq.com");
        port = Integer.parseInt(dotenv.get("MAIL_PORT", "465"));
        username = dotenv.get("MAIL_USERNAME");
        password = dotenv.get("MAIL_PASSWORD");
        from = dotenv.get("MAIL_FROM", username);
        fromName = dotenv.get("MAIL_FROM_NAME", "智投简历");

        // 检测当前环境
        String activeProfile = getActiveProfile();
        boolean isProduction = "production".equalsIgnoreCase(activeProfile) ||
                              "prod".equalsIgnoreCase(activeProfile);

        // 确定是否允许演示模式
        // 1. 从环境变量读取（显式配置）
        String demoModeConfig = dotenv.get("MAIL_ALLOW_DEMO_MODE");
        if (demoModeConfig != null) {
            allowDemoMode = Boolean.parseBoolean(demoModeConfig);
            log.info("📧 演示模式配置（环境变量）: {}", allowDemoMode ? "启用" : "禁用");
        } else {
            // 2. 根据环境自动决定
            allowDemoMode = !isProduction;
            log.info("📧 演示模式配置（自动）: {} (环境: {})",
                allowDemoMode ? "启用" : "禁用", activeProfile);
        }

        if (username == null || password == null) {
            log.warn("⚠️ 邮件服务未配置");
            log.warn("⚠️ 请在.env文件中配置MAIL_USERNAME和MAIL_PASSWORD");

            if (isProduction) {
                log.error("🚨 生产环境必须配置邮件服务！当前无法发送验证码！");
                if (!allowDemoMode) {
                    log.error("🚨 演示模式已禁用，注册功能将不可用！");
                }
            } else {
                log.info("💡 开发/测试环境：演示模式可用，验证码将直接返回");
            }
        } else {
            log.info("✅ 邮件配置加载成功");
            log.info("📧 SMTP服务器: {}:{}", host, port);
            log.info("📧 发件人: {}", from);
        }

        log.info("📧 当前环境: {}", activeProfile);
        log.info("📧 演示模式: {}", allowDemoMode ? "启用" : "禁用");
    }

    /**
     * 获取当前激活的Spring Profile
     */
    private String getActiveProfile() {
        String[] profiles = environment.getActiveProfiles();
        if (profiles.length > 0) {
            return profiles[0];
        }

        // 从环境变量读取
        String envProfile = dotenv.get("SPRING_PROFILES_ACTIVE");
        if (envProfile != null && !envProfile.isEmpty()) {
            return envProfile;
        }

        String appEnv = dotenv.get("APP_ENV");
        if (appEnv != null && !appEnv.isEmpty()) {
            return appEnv;
        }

        // 默认为开发环境
        return "dev";
    }

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(username);
        mailSender.setPassword(password);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.ssl.enable", "true");
        props.put("mail.smtp.ssl.trust", host);
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");
        props.put("mail.debug", "false");

        log.debug("📧 JavaMailSender Bean已创建");
        return mailSender;
    }

    /**
     * 检查邮件服务是否已配置
     */
    public boolean isConfigured() {
        return username != null && password != null && !username.isEmpty() && !password.isEmpty();
    }

    /**
     * 检查是否允许使用演示模式
     *
     * 演示模式安全策略：
     * - 生产环境默认禁用，除非显式配置允许
     * - 开发/测试环境默认启用
     *
     * @return true表示允许演示模式
     */
    public boolean isDemoModeAllowed() {
        return allowDemoMode;
    }

    /**
     * 检查当前是否为生产环境
     */
    public boolean isProductionEnvironment() {
        String activeProfile = getActiveProfile();
        return "production".equalsIgnoreCase(activeProfile) ||
               "prod".equalsIgnoreCase(activeProfile);
    }
}


