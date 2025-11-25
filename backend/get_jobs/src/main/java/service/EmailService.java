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
     * 发送用户激活邮件（推荐产品）
     * 用于向已注册但未使用的用户发送激活邮件
     */
    public boolean sendActivationEmail(String toEmail, String username) {
        try {
            String subject = "【智投简历】您的智能求职助手已就绪";
            String loginUrl = "https://zhitoujianli.com/login";
            String content = buildActivationEmailContent(username, loginUrl);

            sendHtmlEmail(toEmail, subject, content);
            log.info("激活邮件发送成功: {}", toEmail);
            return true;
        } catch (org.springframework.mail.MailSendException e) {
            log.error("激活邮件发送失败（邮件服务异常）: {}", toEmail, e);
            throw e;
        } catch (Exception e) {
            log.error("激活邮件发送失败: {}", toEmail, e);
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
                            <p>如果这不是您本人的操作，请忽略此邮件。祝您早日找到理想工作！</p>
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
                                <li>🤖 智能职位匹配｜每次投递都更精准</li>
                                <li>💬 个性化打招呼｜一句话拉近HR距离</li>
                                <li>🚀 批量自动投递｜AI替你昼夜不停歇</li>
                                <li>📊 实时进度追踪｜谁看简历一目了然</li>
                                <li>🧭 智能岗位过滤｜避开无效与黑名单</li>
                            </ul>
                            <p>祝您早日找到理想工作！</p>
                        </div>
                        <div class="footer">
                            <p>© 2025 智投简历 - 智能简历投递SaaS平台</p>
                        </div>
                    </div>
                </body>
                </html>
                """, username);
    }

    /**
     * 构建用户激活邮件内容
     * 简洁、友好、有强烈行动号召的邮件模板
     */
    private String buildActivationEmailContent(String username, String loginUrl) {
        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 40px 30px; text-align: center; }
                        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.95; }
                        .content { padding: 40px 30px; }
                        .greeting { font-size: 18px; color: #333; margin-bottom: 20px; font-weight: 500; }
                        .intro { font-size: 16px; color: #555; margin-bottom: 30px; line-height: 1.8; }
                        .features { background: #f8f9fa; border-radius: 8px; padding: 25px; margin: 30px 0; }
                        .features h3 { margin: 0 0 15px 0; font-size: 18px; color: #333; }
                        .feature-item { margin: 12px 0; font-size: 15px; color: #555; }
                        .feature-item strong { color: #667eea; }
                        .cta-section { text-align: center; margin: 40px 0 30px 0; }
                        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: transform 0.2s; }
                        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5); }
                        .cta-text { margin-top: 15px; font-size: 14px; color: #666; }
                        .footer { background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef; }
                        .footer p { margin: 5px 0; font-size: 13px; color: #666; }
                        .footer-link { color: #667eea; text-decoration: none; }
                        .footer-link:hover { text-decoration: underline; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🚀 您的智能求职助手已就绪</h1>
                            <p>让AI帮您找到理想工作</p>
                        </div>
                        <div class="content">
                            <div class="greeting">您好，%s</div>
                            <div class="intro">
                                感谢您注册智投简历！我们注意到您还没有开始使用我们的服务。<br><br>
                                <strong>智投简历</strong>是一款AI驱动的智能求职平台，能帮您：
                            </div>
                            <div class="features">
                                <h3>✨ 核心功能</h3>
                                <div class="feature-item"><strong>🤖 智能职位匹配</strong> - AI自动分析JD，精准匹配您的简历</div>
                                <div class="feature-item"><strong>💬 个性化打招呼</strong> - 一键生成专业且真诚的求职信</div>
                                <div class="feature-item"><strong>🚀 批量自动投递</strong> - 设置一次，AI帮您24小时不间断投递</div>
                            </div>
                            <div class="cta-section">
                                <a href="%s" class="cta-button">立即开始使用 →</a>
                                <div class="cta-text">只需3分钟，上传简历即可开始</div>
                            </div>
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 14px; color: #666; line-height: 1.8;">
                                <p style="margin: 0 0 10px 0;"><strong>为什么选择智投简历？</strong></p>
                                <p style="margin: 0;">✅ AI驱动的智能匹配，提升投递效率<br>
                                ✅ 个性化求职信生成，让HR眼前一亮<br>
                                ✅ 完全免费开始，无隐藏费用</p>
                            </div>
                        </div>
                        <div class="footer">
                            <p>© 2025 智投简历 - 智能简历投递SaaS平台</p>
                            <p><a href="https://zhitoujianli.com" class="footer-link">访问官网</a> | <a href="https://zhitoujianli.com/blog" class="footer-link">查看博客</a></p>
                            <p style="margin-top: 15px; font-size: 12px; color: #999;">如果您不想收到此类邮件，可以<a href="#" class="footer-link">取消订阅</a></p>
                        </div>
                    </div>
                </body>
                </html>
                """, username, loginUrl);
    }
}

