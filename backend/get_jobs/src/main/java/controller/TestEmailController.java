package controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;
import service.EmailService;
import service.UserActivationService;
import entity.User;

import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 邮件测试控制器
 * 用于测试邮件发送功能
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */
@Slf4j
@RestController
@RequestMapping("/api/test/email")
@CrossOrigin(origins = {
    "https://zhitoujianli.com",
    "https://www.zhitoujianli.com",
    "http://localhost:3000",
    "http://localhost:3001"
}, allowCredentials = "true")
public class TestEmailController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserActivationService userActivationService;

    /**
     * 测试发送激活邮件
     */
    @PostMapping("/send-activation")
    public ResponseEntity<Map<String, Object>> testSendActivationEmail(
            @RequestParam String email,
            @RequestParam(defaultValue = "测试用户") String username) {
        try {
            log.info("📧 测试发送激活邮件: email={}, username={}", email, username);

            boolean sent = emailService.sendActivationEmail(email, username);

            if (sent) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "激活邮件发送成功",
                    "email", email
                ));
            } else {
                return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "激活邮件发送失败",
                    "email", email
                ));
            }
        } catch (org.springframework.mail.MailSendException e) {
            log.error("❌ 邮件服务异常: {}", e.getMessage(), e);
            return ResponseEntity.status(503).body(Map.of(
                "success", false,
                "message", "邮件服务异常: " + e.getMessage(),
                "email", email,
                "error", "MAIL_SERVICE_ERROR"
            ));
        } catch (Exception e) {
            log.error("❌ 发送激活邮件异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "发送失败: " + e.getMessage(),
                "email", email
            ));
        }
    }

    /**
     * 批量发送激活邮件给未使用的用户
     */
    @PostMapping("/send-batch")
    public ResponseEntity<Map<String, Object>> testBatchSendActivationEmails(
            @RequestParam(defaultValue = "50") int maxEmails,
            @RequestParam(defaultValue = "2") int delaySeconds) {
        try {
            log.info("📧 批量发送激活邮件: maxEmails={}, delaySeconds={}", maxEmails, delaySeconds);

            Map<String, Object> result = userActivationService.sendActivationEmailsToInactiveUsers(
                    maxEmails, delaySeconds);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", result,
                "message", String.format("批量发送完成: 总数=%d, 成功=%d, 失败=%d",
                    result.get("attemptedSend"), result.get("sentCount"), result.get("failedCount"))
            ));
        } catch (Exception e) {
            log.error("❌ 批量发送激活邮件异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "批量发送失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 查看未使用的用户列表
     */
    @GetMapping("/inactive-users")
    public ResponseEntity<Map<String, Object>> getInactiveUsers() {
        try {
            log.info("📋 获取未使用用户列表");

            List<User> inactiveUsers = userActivationService.getInactiveUsers();

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> usersList = inactiveUsers.stream()
                .map(user -> {
                    Map<String, Object> userMap = new java.util.HashMap<>();
                    userMap.put("userId", user.getUserId());
                    userMap.put("email", user.getEmail());
                    userMap.put("username", user.getUsername() != null ? user.getUsername() : "");
                    userMap.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
                    userMap.put("lastLoginAt", user.getLastLoginAt() != null ? user.getLastLoginAt().toString() : "从未登录");
                    return userMap;
                })
                .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                    "users", usersList,
                    "total", inactiveUsers.size()
                )
            ));
        } catch (Exception e) {
            log.error("❌ 获取未使用用户列表异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取失败: " + e.getMessage()
            ));
        }
    }
}

