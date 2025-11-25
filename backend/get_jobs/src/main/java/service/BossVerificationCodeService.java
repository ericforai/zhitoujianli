package service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

/**
 * Boss验证码管理服务
 * 用于处理Boss直聘验证码的截图、存储和用户输入
 */
@Service
@Slf4j
public class BossVerificationCodeService {

    // 存储验证码请求信息：userId -> VerificationRequest
    private final Map<String, VerificationRequest> verificationRequests = new ConcurrentHashMap<>();

    /**
     * 获取所有验证码请求（用于查找）
     */
    public Map<String, VerificationRequest> getVerificationRequests() {
        return verificationRequests;
    }

    /**
     * 验证码请求信息
     */
    public static class VerificationRequest {
        private final String userId;
        private final String jobName;
        private final String screenshotPath;
        private final String taskId;
        private final CountDownLatch codeLatch;
        private String verificationCode;
        private boolean codeReceived = false;
        private long timestamp;

        public VerificationRequest(String userId, String jobName, String screenshotPath, String taskId) {
            this.userId = userId;
            this.jobName = jobName;
            this.screenshotPath = screenshotPath;
            this.taskId = taskId;
            this.codeLatch = new CountDownLatch(1);
            this.timestamp = System.currentTimeMillis();
        }

        public String getUserId() {
            return userId;
        }

        public String getJobName() {
            return jobName;
        }

        public String getScreenshotPath() {
            return screenshotPath;
        }

        public String getTaskId() {
            return taskId;
        }

        public String getVerificationCode() {
            return verificationCode;
        }

        public void setVerificationCode(String verificationCode) {
            this.verificationCode = verificationCode;
            this.codeReceived = true;
            this.codeLatch.countDown();
        }

        public boolean waitForCode(long timeout, TimeUnit unit) throws InterruptedException {
            return codeLatch.await(timeout, unit);
        }

        public boolean isCodeReceived() {
            return codeReceived;
        }

        public long getTimestamp() {
            return timestamp;
        }

        /**
         * 检查是否过期（5分钟）
         */
        public boolean isExpired() {
            return System.currentTimeMillis() - timestamp > 5 * 60 * 1000;
        }
    }

    /**
     * 创建验证码请求
     * @param userId 用户ID
     * @param jobName 岗位名称
     * @param screenshotPath 截图路径
     * @param taskId 任务ID
     * @return 验证码请求ID（用于前端查询）
     */
    public String createVerificationRequest(String userId, String jobName, String screenshotPath, String taskId) {
        String requestId = userId + "_" + taskId + "_" + System.currentTimeMillis();
        VerificationRequest request = new VerificationRequest(userId, jobName, screenshotPath, taskId);
        verificationRequests.put(requestId, request);
        log.info("✅ 创建验证码请求: requestId={}, userId={}, jobName={}, screenshotPath={}",
            requestId, userId, jobName, screenshotPath);
        return requestId;
    }

    /**
     * 获取验证码请求信息（前端查询）
     * @param requestId 请求ID
     * @return 验证码请求信息，如果不存在或已过期返回null
     */
    public VerificationRequest getVerificationRequest(String requestId) {
        VerificationRequest request = verificationRequests.get(requestId);
        if (request == null) {
            return null;
        }
        if (request.isExpired()) {
            verificationRequests.remove(requestId);
            log.warn("验证码请求已过期: requestId={}", requestId);
            return null;
        }
        return request;
    }

    /**
     * 根据userId和taskId获取验证码请求（Boss程序使用）
     * @param userId 用户ID
     * @param taskId 任务ID
     * @return 验证码请求信息
     */
    public VerificationRequest getVerificationRequestByUserAndTask(String userId, String taskId) {
        for (VerificationRequest request : verificationRequests.values()) {
            if (request.getUserId().equals(userId) && request.getTaskId().equals(taskId)) {
                if (request.isExpired()) {
                    verificationRequests.values().removeIf(r -> r == request);
                    return null;
                }
                return request;
            }
        }
        return null;
    }

    /**
     * 提交验证码（用户输入）
     * @param requestId 请求ID
     * @param code 验证码
     * @return 是否成功
     */
    public boolean submitVerificationCode(String requestId, String code) {
        VerificationRequest request = verificationRequests.get(requestId);
        if (request == null) {
            log.warn("验证码请求不存在: requestId={}", requestId);
            return false;
        }
        if (request.isExpired()) {
            verificationRequests.remove(requestId);
            log.warn("验证码请求已过期: requestId={}", requestId);
            return false;
        }
        request.setVerificationCode(code);
        log.info("✅ 用户提交验证码: requestId={}, code={}", requestId, code);
        return true;
    }

    /**
     * 等待验证码（Boss程序使用）
     * @param userId 用户ID
     * @param taskId 任务ID
     * @param timeoutSeconds 超时时间（秒）
     * @return 验证码，如果超时返回null
     */
    public String waitForVerificationCode(String userId, String taskId, int timeoutSeconds) {
        VerificationRequest request = getVerificationRequestByUserAndTask(userId, taskId);
        if (request == null) {
            log.warn("验证码请求不存在: userId={}, taskId={}", userId, taskId);
            return null;
        }

        try {
            boolean received = request.waitForCode(timeoutSeconds, TimeUnit.SECONDS);
            if (received && request.isCodeReceived()) {
                String code = request.getVerificationCode();
                // 清理请求
                verificationRequests.values().removeIf(r -> r == request);
                log.info("✅ 获取到验证码: userId={}, taskId={}, code={}", userId, taskId, code);
                return code;
            } else {
                log.warn("等待验证码超时: userId={}, taskId={}", userId, taskId);
                return null;
            }
        } catch (InterruptedException e) {
            log.error("等待验证码被中断: userId={}, taskId={}", userId, taskId, e);
            Thread.currentThread().interrupt();
            return null;
        }
    }

    /**
     * 获取验证码截图文件（转换为可访问的URL路径）
     * @param screenshotPath 截图文件路径
     * @return 可访问的URL路径
     */
    public String getScreenshotUrl(String screenshotPath) {
        // 如果截图文件存在，返回相对路径（前端可以通过API访问）
        File file = new File(screenshotPath);
        if (file.exists()) {
            // 返回相对于项目根目录的路径，用于API访问
            return "/api/verification-code/screenshot?path=" + screenshotPath;
        }
        return null;
    }

    /**
     * 清理过期的验证码请求
     */
    public void cleanupExpiredRequests() {
        verificationRequests.entrySet().removeIf(entry -> {
            VerificationRequest request = entry.getValue();
            if (request.isExpired()) {
                log.info("清理过期验证码请求: requestId={}", entry.getKey());
                // 删除截图文件
                try {
                    Files.deleteIfExists(Paths.get(request.getScreenshotPath()));
                } catch (Exception e) {
                    log.warn("删除截图文件失败: {}", request.getScreenshotPath(), e);
                }
                return true;
            }
            return false;
        });
    }
}
