package config;

import java.util.Properties;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
 * @author ZhiTouJianLi Team
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

    @Autowired
    private Dotenv dotenv;

    @PostConstruct
    public void init() {
        log.info("📧 开始加载邮件配置...");

        host = dotenv.get("MAIL_HOST", "smtp.qq.com");
        port = Integer.parseInt(dotenv.get("MAIL_PORT", "465"));
        username = dotenv.get("MAIL_USERNAME");
        password = dotenv.get("MAIL_PASSWORD");
        from = dotenv.get("MAIL_FROM", username);
        fromName = dotenv.get("MAIL_FROM_NAME", "智投简历");

        if (username == null || password == null) {
            log.warn("⚠️ 邮件服务未配置，某些功能将不可用");
            log.warn("⚠️ 请在.env文件中配置MAIL_USERNAME和MAIL_PASSWORD");
        } else {
            log.info("✅ 邮件配置加载成功");
            log.info("📧 SMTP服务器: {}:{}", host, port);
            log.info("📧 发件人: {}", from);
        }
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
}

