package service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

/**
 * 验证码管理服务
 *
 * 功能:
 * - 生成验证码
 * - 存储验证码
 * - 验证验证码
 * - 自动清理过期验证码
 *
 * @author ZhiTouJianLi Team
 */
@Slf4j
@Service
public class VerificationCodeService {

    // 存储验证码：email -> {code, expiresAt, attempts, verified}
    private final Map<String, Map<String, Object>> verificationCodes = new ConcurrentHashMap<>();

    // 验证码有效期：5分钟
    private static final long CODE_EXPIRE_TIME = 5 * 60 * 1000;

    // 最大验证尝试次数
    private static final int MAX_ATTEMPTS = 5;

    /**
     * 生成6位数字验证码
     */
    public String generateCode() {
        return String.format("%06d", (int) (Math.random() * 1000000));
    }

    /**
     * 存储验证码
     */
    public void storeCode(String email, String code) {
        Map<String, Object> codeInfo = new HashMap<>();
        codeInfo.put("code", code);
        codeInfo.put("expiresAt", System.currentTimeMillis() + CODE_EXPIRE_TIME);
        codeInfo.put("attempts", 0);
        codeInfo.put("verified", false);

        verificationCodes.put(email, codeInfo);
        log.info("✅ 验证码已存储: Email={}, Code={}, 过期时间: {}秒后", email, code, CODE_EXPIRE_TIME / 1000);
    }

    /**
     * 验证验证码
     *
     * @return 验证结果：success, expired, invalid, max_attempts
     */
    public VerificationResult verifyCode(String email, String code) {
        Map<String, Object> codeInfo = verificationCodes.get(email);

        // 验证码不存在
        if (codeInfo == null) {
            log.warn("❌ 验证码不存在: {}", email);
            return VerificationResult.INVALID;
        }

        // 检查是否已过期
        long expiresAt = (Long) codeInfo.get("expiresAt");
        if (System.currentTimeMillis() > expiresAt) {
            log.warn("❌ 验证码已过期: {}", email);
            verificationCodes.remove(email);
            return VerificationResult.EXPIRED;
        }

        // 检查尝试次数
        int attempts = (Integer) codeInfo.get("attempts");
        if (attempts >= MAX_ATTEMPTS) {
            log.warn("❌ 验证码尝试次数超限: {}", email);
            verificationCodes.remove(email);
            return VerificationResult.MAX_ATTEMPTS;
        }

        // 验证验证码
        String storedCode = (String) codeInfo.get("code");
        if (storedCode.equals(code)) {
            codeInfo.put("verified", true);
            log.info("✅ 验证码验证成功: {}", email);
            return VerificationResult.SUCCESS;
        } else {
            codeInfo.put("attempts", attempts + 1);
            log.warn("❌ 验证码错误: {}, 剩余尝试次数: {}", email, MAX_ATTEMPTS - attempts - 1);
            return VerificationResult.INVALID;
        }
    }

    /**
     * 检查验证码是否已验证
     */
    public boolean isVerified(String email) {
        Map<String, Object> codeInfo = verificationCodes.get(email);
        if (codeInfo == null) {
            return false;
        }
        return Boolean.TRUE.equals(codeInfo.get("verified"));
    }

    /**
     * 移除验证码（注册成功后调用）
     */
    public void removeCode(String email) {
        verificationCodes.remove(email);
        log.debug("✅ 验证码已清理: {}", email);
    }

    /**
     * 定时清理过期验证码（每10分钟执行一次）
     */
    @Scheduled(fixedRate = 10 * 60 * 1000)
    public void cleanExpiredCodes() {
        final long now = System.currentTimeMillis();
        final int[] cleaned = {0};

        verificationCodes.entrySet().removeIf(entry -> {
            long expiresAt = (Long) entry.getValue().get("expiresAt");
            if (now > expiresAt) {
                cleaned[0]++;
                return true;
            }
            return false;
        });

        if (cleaned[0] > 0) {
            log.info("🗑️ 清理了{}个过期验证码", cleaned[0]);
        }
    }

    /**
     * 验证结果枚举
     */
    public enum VerificationResult {
        SUCCESS,        // 验证成功
        INVALID,        // 验证码错误
        EXPIRED,        // 验证码过期
        MAX_ATTEMPTS    // 超过最大尝试次数
    }
}

