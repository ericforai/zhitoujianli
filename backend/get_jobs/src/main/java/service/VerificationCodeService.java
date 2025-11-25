package service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

/**
 * 邮箱验证码服务
 * 用于处理用户注册和登录时的邮箱验证码
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Service
@Slf4j
public class VerificationCodeService {

    // 存储验证码：email -> {code, expiresAt}
    private final Map<String, CodeInfo> codeStorage = new ConcurrentHashMap<>();

    // 验证码有效期（5分钟）
    private static final long CODE_EXPIRY_TIME = 5 * 60 * 1000;

    // 最大尝试次数
    private static final int MAX_ATTEMPTS = 5;

    /**
     * 验证码信息
     */
    private static class CodeInfo {
        String code;
        long expiresAt;
        int attempts;

        CodeInfo(String code, long expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
            this.attempts = 0;
        }
    }

    /**
     * 验证结果枚举
     */
    public enum VerificationResult {
        SUCCESS,      // 验证成功
        EXPIRED,      // 验证码已过期
        INVALID,      // 验证码错误
        MAX_ATTEMPTS  // 超过最大尝试次数
    }

    /**
     * 生成6位数字验证码
     */
    public String generateCode() {
        return String.format("%06d", ThreadLocalRandom.current().nextInt(100000, 999999));
    }

    /**
     * 存储验证码
     */
    public void storeCode(String email, String code) {
        long expiresAt = System.currentTimeMillis() + CODE_EXPIRY_TIME;
        codeStorage.put(email, new CodeInfo(code, expiresAt));
        log.info("验证码已存储: email={}, expiresAt={}", email, new java.util.Date(expiresAt));
    }

    /**
     * 验证验证码
     */
    public VerificationResult verifyCode(String email, String inputCode) {
        CodeInfo codeInfo = codeStorage.get(email);

        if (codeInfo == null) {
            log.warn("验证码不存在: email={}", email);
            return VerificationResult.INVALID;
        }

        // 检查是否过期
        if (System.currentTimeMillis() > codeInfo.expiresAt) {
            codeStorage.remove(email);
            log.warn("验证码已过期: email={}", email);
            return VerificationResult.EXPIRED;
        }

        // 检查尝试次数
        codeInfo.attempts++;
        if (codeInfo.attempts > MAX_ATTEMPTS) {
            codeStorage.remove(email);
            log.warn("验证码尝试次数过多: email={}, attempts={}", email, codeInfo.attempts);
            return VerificationResult.MAX_ATTEMPTS;
        }

        // 验证验证码
        if (codeInfo.code.equals(inputCode)) {
            codeStorage.remove(email);
            log.info("验证码验证成功: email={}", email);
            return VerificationResult.SUCCESS;
        } else {
            log.warn("验证码错误: email={}, attempts={}", email, codeInfo.attempts);
            return VerificationResult.INVALID;
        }
    }

    /**
     * 清理过期的验证码
     */
    public void cleanupExpiredCodes() {
        long now = System.currentTimeMillis();
        codeStorage.entrySet().removeIf(entry -> {
            boolean expired = entry.getValue().expiresAt < now;
            if (expired) {
                log.debug("清理过期验证码: email={}", entry.getKey());
            }
            return expired;
        });
    }
}

