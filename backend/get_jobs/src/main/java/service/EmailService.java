package service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import config.MailConfig;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;

/**
 * 邮件发送服务
 *
 * 功能:
 * - 发送验证码邮件
 * - 发送密码重置邮件
 * - 发送欢迎邮件
 *
 * @author ZhiTouJianLi Team
 */
@Slf4j
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private MailConfig mailConfig;

    /**
     * 发送验证码邮件
     */
    public boolean sendVerificationCode(String toEmail, String code) {
        try {
            String subject = "【智投简历】邮箱验证码";
            String content = buildVerificationEmailContent(code);

            sendHtmlEmail(toEmail, subject, content);
            log.info("验证码邮件发送成功: {}", toEmail);
            return true;
        } catch (org.springframework.mail.MailSendException e) {
            // 重新抛出MailSendException，让Controller层处理
            log.error("验证码邮件发送失败: {}", toEmail, e);
            throw e;
        } catch (Exception e) {
            log.error("验证码邮件发送失败: {}", toEmail, e);
            return false;
        }
    }

    /**
     * 发送密码重置邮件
     */
    public boolean sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            String subject = "【智投简历】重置密码";
            String resetLink = "http://115.190.182.95:3000/reset-password?token=" + resetToken;
            String content = buildPasswordResetEmailContent(resetLink);

            sendHtmlEmail(toEmail, subject, content);
            log.info("重置密码邮件发送成功: {}", toEmail);
            return true;
        } catch (Exception e) {
            log.error("重置密码邮件发送失败: {}", toEmail, e);
            return false;
        }
    }

    /**
     * 发送欢迎邮件
     */
    public boolean sendWelcomeEmail(String toEmail, String username) {
        try {
            String subject = "【智投简历】欢迎注册";
            String content = buildWelcomeEmailContent(username);

            sendHtmlEmail(toEmail, subject, content);
            log.info("欢迎邮件发送成功: {}", toEmail);
            return true;
        } catch (Exception e) {
            log.error("欢迎邮件发送失败: {}", toEmail, e);
            return false;
        }
    }

    /**
     * 发送HTML邮件
     */
    private void sendHtmlEmail(String to, String subject, String content) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

        helper.setFrom(mailConfig.getFrom(), mailConfig.getFromName());
        helper.setTo(to);
        helper.setSubject(subject);

        // 设置HTML内容
        helper.setText(content, true);

        mailSender.send(message);
        log.debug("HTML邮件已发送: To={}, Subject={}", to, subject);
    }

    /**
     * 构建验证码邮件内容
     */
    private String buildVerificationEmailContent(String code) {
        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .code-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                        .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>智投简历</h1>
                            <p>邮箱验证码</p>
                        </div>
                        <div class="content">
                            <p>您好，</p>
                            <p>您正在注册智投简历账号，验证码是：</p>
                            <div class="code-box">
                                <div class="code">%s</div>
                            </div>
                            <p><strong>验证码有效期为5分钟</strong>，请尽快完成验证。</p>
                            <p>如果这不是您本人的操作，请忽略此邮件。</p>
                        </div>
                        <div class="footer">
                            <p>© 2025 智投简历 - 智能简历投递SaaS平台</p>
                        </div>
                    </div>
                </body>
                </html>
                """, code);
    }

    /**
     * 构建密码重置邮件内容
     */
    private String buildPasswordResetEmailContent(String resetLink) {
        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>智投简历</h1>
                            <p>重置密码</p>
                        </div>
                        <div class="content">
                            <p>您好，</p>
                            <p>您请求重置智投简历账号的密码。请点击下方按钮重置密码：</p>
                            <p style="text-align: center;">
                                <a href="%s" class="button">重置密码</a>
                            </p>
                            <p><strong>此链接有效期为30分钟</strong>，过期后需要重新申请。</p>
                            <p>如果这不是您本人的操作，请忽略此邮件并确保账号安全。</p>
                            <p style="color: #666; font-size: 12px;">如果按钮无法点击，请复制以下链接到浏览器：<br>%s</p>
                        </div>
                        <div class="footer">
                            <p>© 2025 智投简历 - 智能简历投递SaaS平台</p>
                        </div>
                    </div>
                </body>
                </html>
                """, resetLink, resetLink);
    }

    /**
     * 构建欢迎邮件内容
     */
    private String buildWelcomeEmailContent(String username) {
        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>欢迎加入智投简历！</h1>
                        </div>
                        <div class="content">
                            <p>亲爱的 %s，</p>
                            <p>欢迎您注册智投简历！您的账号已创建成功。</p>
                            <p>智投简历是一个智能简历投递SaaS平台，我们将帮助您：</p>
                            <ul>
                                <li>智能匹配合适的岗位</li>
                                <li>自动生成个性化简历</li>
                                <li>一键投递简历</li>
                                <li>实时跟踪投递状态</li>
                            </ul>
                            <p>祝您求职顺利！</p>
                        </div>
                        <div class="footer">
                            <p>© 2025 智投简历 - 智能简历投递SaaS平台</p>
                        </div>
                    </div>
                </body>
                </html>
                """, username);
    }
}

