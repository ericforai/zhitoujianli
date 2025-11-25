package service;

import java.io.File;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import entity.User;
import lombok.extern.slf4j.Slf4j;
import repository.UserRepository;

/**
 * 用户激活邮件服务
 * 用于向已注册但未使用的用户发送激活邮件
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */
@Slf4j
@Service
public class UserActivationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    /**
     * 判断用户是否使用过系统
     * 判断标准：
     * 1. 用户从未登录过（lastLoginAt为null）→ 未使用
     * 2. 用户最近7天内登录过 → 已使用（排除）
     * 3. 用户数据目录存在且有简历文件 → 已使用（排除）
     * 4. 用户注册超过7天但从未登录 → 未使用
     * 5. 用户登录过但超过7天未登录，且没有简历文件 → 未使用
     *
     * @param user 用户对象
     * @return true表示未使用过，false表示已使用过
     */
    public boolean isUserInactive(User user) {
        // 标准1：从未登录过
        if (user.getLastLoginAt() == null) {
            // 检查注册时间，如果注册超过7天且从未登录，认为是未使用
            if (user.getCreatedAt() != null) {
                java.time.LocalDateTime sevenDaysAgo = java.time.LocalDateTime.now().minusDays(7);
                if (user.getCreatedAt().isBefore(sevenDaysAgo)) {
                    log.debug("用户从未登录且注册超过7天: email={}", user.getEmail());
                    return true;
                }
            }
            // 如果刚注册不久，可能是新用户，暂时不发送
            return false;
        }

        // 标准2：如果用户最近7天内登录过，认为是活跃用户，已使用
        java.time.LocalDateTime sevenDaysAgo = java.time.LocalDateTime.now().minusDays(7);
        if (user.getLastLoginAt().isAfter(sevenDaysAgo)) {
            log.debug("用户最近7天内登录过，认为是活跃用户: email={}, lastLogin={}",
                    user.getEmail(), user.getLastLoginAt());
            return false; // 已使用
        }

        // 标准3：检查用户数据目录和简历文件
        String userDataPath = String.format("/data/users/%s", user.getUserId());
        File userDataDir = new File(userDataPath);

        if (userDataDir.exists() && userDataDir.isDirectory()) {
            // 检查是否有简历文件
            File resumeFile = new File(userDataDir, "resume_profile.json");
            if (resumeFile.exists()) {
                log.debug("用户已上传简历: email={}", user.getEmail());
                return false; // 已使用
            }
        }

        // 标准5：用户登录过但超过7天未登录，且没有简历文件 → 未使用
        log.debug("用户超过7天未登录且无简历文件: email={}, lastLogin={}",
                user.getEmail(), user.getLastLoginAt());
        return true;
    }

    /**
     * 获取所有未使用的用户列表
     *
     * @return 未使用的用户列表
     */
    public List<User> getInactiveUsers() {
        List<User> inactiveUsers = new ArrayList<>();

        // 分页查询所有用户，避免一次性加载过多数据
        int pageSize = 100;
        int pageNumber = 0;
        Page<User> userPage;

        do {
            Pageable pageable = PageRequest.of(pageNumber, pageSize);
            userPage = userRepository.findAllNotDeleted(pageable);

            for (User user : userPage.getContent()) {
                if (isUserInactive(user)) {
                    inactiveUsers.add(user);
                }
            }

            pageNumber++;
        } while (userPage.hasNext());

        log.info("找到 {} 个未使用的用户", inactiveUsers.size());
        return inactiveUsers;
    }

    /**
     * 批量发送激活邮件给未使用的用户
     *
     * @param maxEmails 最大发送数量（防止一次性发送过多）
     * @param delaySeconds 每封邮件之间的延迟（秒），防止触发邮件服务限流
     * @return 发送结果统计
     */
    public Map<String, Object> sendActivationEmailsToInactiveUsers(int maxEmails, int delaySeconds) {
        Map<String, Object> result = new HashMap<>();
        List<User> inactiveUsers = getInactiveUsers();

        int totalUsers = inactiveUsers.size();
        int sentCount = 0;
        int failedCount = 0;
        List<String> sentEmails = new ArrayList<>();
        List<String> failedEmails = new ArrayList<>();

        // 限制发送数量
        int actualSendCount = Math.min(totalUsers, maxEmails);
        log.info("准备发送激活邮件: 总未使用用户数={}, 最大发送数={}, 实际发送数={}",
                totalUsers, maxEmails, actualSendCount);

        for (int i = 0; i < actualSendCount; i++) {
            User user = inactiveUsers.get(i);
            String email = user.getEmail();
            String username = user.getUsername() != null ? user.getUsername() : email.split("@")[0];

            try {
                boolean sent = emailService.sendActivationEmail(email, username);

                if (sent) {
                    sentCount++;
                    sentEmails.add(email);
                    log.info("✅ 激活邮件发送成功 ({}/{}): {}", i + 1, actualSendCount, email);
                } else {
                    failedCount++;
                    failedEmails.add(email);
                    log.warn("❌ 激活邮件发送失败 ({}/{}): {}", i + 1, actualSendCount, email);
                }

                // 添加延迟，避免触发邮件服务限流
                if (i < actualSendCount - 1 && delaySeconds > 0) {
                    try {
                        TimeUnit.SECONDS.sleep(delaySeconds);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        log.warn("延迟发送被中断");
                        break;
                    }
                }

            } catch (org.springframework.mail.MailSendException e) {
                failedCount++;
                failedEmails.add(email);
                log.error("❌ 激活邮件发送异常 ({}/{}): {}, 错误: {}",
                        i + 1, actualSendCount, email, e.getMessage());

                // 如果遇到邮件服务异常，停止发送
                log.warn("⚠️ 检测到邮件服务异常，停止批量发送");
                break;
            } catch (Exception e) {
                failedCount++;
                failedEmails.add(email);
                log.error("❌ 激活邮件发送失败 ({}/{}): {}, 错误: {}",
                        i + 1, actualSendCount, email, e.getMessage());
            }
        }

        result.put("totalInactiveUsers", totalUsers);
        result.put("attemptedSend", actualSendCount);
        result.put("sentCount", sentCount);
        result.put("failedCount", failedCount);
        result.put("sentEmails", sentEmails);
        result.put("failedEmails", failedEmails);
        result.put("timestamp", LocalDateTime.now().toString());

        log.info("📧 激活邮件批量发送完成: 总数={}, 成功={}, 失败={}",
                actualSendCount, sentCount, failedCount);

        return result;
    }

    /**
     * 发送激活邮件给单个用户（用于测试或手动触发）
     *
     * @param email 用户邮箱
     * @return 发送结果
     */
    public Map<String, Object> sendActivationEmailToUser(String email) {
        Map<String, Object> result = new HashMap<>();

        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("用户不存在: " + email));

            if (user.isDeleted()) {
                result.put("success", false);
                result.put("message", "用户已被删除");
                return result;
            }

            String username = user.getUsername() != null ? user.getUsername() : email.split("@")[0];
            boolean sent = emailService.sendActivationEmail(email, username);

            result.put("success", sent);
            result.put("message", sent ? "邮件发送成功" : "邮件发送失败");
            result.put("email", email);
            result.put("timestamp", LocalDateTime.now().toString());

            if (sent) {
                log.info("✅ 激活邮件发送成功: {}", email);
            } else {
                log.warn("❌ 激活邮件发送失败: {}", email);
            }

        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "发送失败: " + e.getMessage());
            result.put("email", email);
            log.error("❌ 发送激活邮件异常: {}", email, e);
        }

        return result;
    }
}

