package service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import entity.UserBehaviorLog;
import lombok.extern.slf4j.Slf4j;
import repository.UserBehaviorLogRepository;

/**
 * 用户行为日志服务
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */
@Slf4j
@Service
public class UserBehaviorLogService {

    @Autowired
    private UserBehaviorLogRepository behaviorLogRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 记录用户行为
     *
     * @param userId 用户ID
     * @param behaviorType 行为类型
     * @param status 行为状态
     * @param description 行为描述
     * @param extraData 额外数据（Map格式，会自动转换为JSON）
     * @param platform 平台类型
     */
    @Transactional
    public void logBehavior(
            String userId,
            UserBehaviorLog.BehaviorType behaviorType,
            UserBehaviorLog.BehaviorStatus status,
            String description,
            Map<String, Object> extraData,
            String platform) {
        try {
            String extraDataJson = null;
            if (extraData != null && !extraData.isEmpty()) {
                extraDataJson = objectMapper.writeValueAsString(extraData);
            }

            UserBehaviorLog behaviorLog = UserBehaviorLog.builder()
                    .userId(userId)
                    .behaviorType(behaviorType)
                    .status(status)
                    .description(description)
                    .extraData(extraDataJson)
                    .platform(platform)
                    .build();

            behaviorLogRepository.save(behaviorLog);
            log.info("✅ 用户行为已记录: userId={}, behaviorType={}, status={}", userId, behaviorType, status);

        } catch (JsonProcessingException e) {
            log.error("❌ 记录用户行为失败: 序列化extraData失败", e);
            // 即使序列化失败，也记录基本行为信息
            UserBehaviorLog behaviorLog = UserBehaviorLog.builder()
                    .userId(userId)
                    .behaviorType(behaviorType)
                    .status(status)
                    .description(description)
                    .platform(platform)
                    .build();
            behaviorLogRepository.save(behaviorLog);
        } catch (Exception e) {
            log.error("❌ 记录用户行为失败", e);
        }
    }

    /**
     * 记录用户行为（简化版本，无额外数据）
     */
    @Transactional
    public void logBehavior(
            String userId,
            UserBehaviorLog.BehaviorType behaviorType,
            UserBehaviorLog.BehaviorStatus status,
            String description) {
        logBehavior(userId, behaviorType, status, description, null, null);
    }

    /**
     * 记录BOSS直聘二维码扫码成功
     */
    @Transactional
    public void logQrcodeScanSuccess(String userId) {
        Map<String, Object> extraData = new HashMap<>();
        extraData.put("platform", "BOSS直聘");
        extraData.put("scanTime", LocalDateTime.now().toString());
        logBehavior(userId, UserBehaviorLog.BehaviorType.QRCODE_SCAN_SUCCESS,
                UserBehaviorLog.BehaviorStatus.SUCCESS, "BOSS直聘二维码扫码成功", extraData, "BOSS直聘");
    }

    /**
     * 记录启动投递
     */
    @Transactional
    public void logJobDeliveryStart(String userId, String platform, Map<String, Object> config) {
        Map<String, Object> extraData = new HashMap<>();
        if (config != null) {
            extraData.putAll(config);
        }
        logBehavior(userId, UserBehaviorLog.BehaviorType.JOB_DELIVERY_START,
                UserBehaviorLog.BehaviorStatus.PENDING, "启动投递任务", extraData, platform);
    }

    /**
     * 记录投递成功
     */
    @Transactional
    public void logJobDeliverySuccess(String userId, String platform, String jobName, String companyName) {
        Map<String, Object> extraData = new HashMap<>();
        extraData.put("jobName", jobName);
        extraData.put("companyName", companyName);
        logBehavior(userId, UserBehaviorLog.BehaviorType.JOB_DELIVERY_SUCCESS,
                UserBehaviorLog.BehaviorStatus.SUCCESS,
                String.format("投递成功: %s - %s", companyName, jobName), extraData, platform);
    }

    /**
     * 记录投递失败
     */
    @Transactional
    public void logJobDeliveryFailed(String userId, String platform, String jobName, String reason) {
        Map<String, Object> extraData = new HashMap<>();
        extraData.put("jobName", jobName);
        extraData.put("reason", reason);
        logBehavior(userId, UserBehaviorLog.BehaviorType.JOB_DELIVERY_FAILED,
                UserBehaviorLog.BehaviorStatus.FAILED,
                String.format("投递失败: %s - %s", jobName, reason), extraData, platform);
    }

    /**
     * 记录上传简历
     */
    @Transactional
    public void logResumeUpload(String userId, String fileName, long fileSize) {
        Map<String, Object> extraData = new HashMap<>();
        extraData.put("fileName", fileName);
        extraData.put("fileSize", fileSize);
        logBehavior(userId, UserBehaviorLog.BehaviorType.RESUME_UPLOAD,
                UserBehaviorLog.BehaviorStatus.SUCCESS,
                String.format("上传简历: %s", fileName), extraData, null);
    }

    /**
     * 记录生成打招呼语
     */
    @Transactional
    public void logGreetingGenerate(String userId, String jobName, int greetingLength) {
        Map<String, Object> extraData = new HashMap<>();
        extraData.put("jobName", jobName);
        extraData.put("greetingLength", greetingLength);
        logBehavior(userId, UserBehaviorLog.BehaviorType.GREETING_GENERATE,
                UserBehaviorLog.BehaviorStatus.SUCCESS,
                String.format("生成打招呼语: %s", jobName), extraData, null);
    }

    /**
     * 获取用户行为日志（分页）
     */
    public Page<UserBehaviorLog> getUserBehaviorLogs(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return behaviorLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    /**
     * 获取所有行为日志（分页，管理员用）
     */
    public Page<UserBehaviorLog> getAllBehaviorLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return behaviorLogRepository.findRecentLogs(pageable);
    }

    /**
     * 统计用户行为数据
     */
    public Map<String, Object> getUserBehaviorStats(String userId) {
        Map<String, Object> stats = new HashMap<>();

        // 统计各种行为的次数
        for (UserBehaviorLog.BehaviorType type : UserBehaviorLog.BehaviorType.values()) {
            long totalCount = behaviorLogRepository.countByUserIdAndBehaviorType(userId, type);
            long successCount = behaviorLogRepository.countByUserIdAndBehaviorTypeAndStatus(
                    userId, type, UserBehaviorLog.BehaviorStatus.SUCCESS);
            long failedCount = behaviorLogRepository.countByUserIdAndBehaviorTypeAndStatus(
                    userId, type, UserBehaviorLog.BehaviorStatus.FAILED);

            Map<String, Object> typeStats = new HashMap<>();
            typeStats.put("total", totalCount);
            typeStats.put("success", successCount);
            typeStats.put("failed", failedCount);
            stats.put(type.name(), typeStats);
        }

        return stats;
    }

    /**
     * 获取全局行为统计（管理员用）
     */
    public Map<String, Object> getGlobalBehaviorStats() {
        Map<String, Object> stats = new HashMap<>();

        // 统计最近30天的行为数据
        LocalDateTime endTime = LocalDateTime.now();
        LocalDateTime startTime = endTime.minusDays(30);

        for (UserBehaviorLog.BehaviorType type : UserBehaviorLog.BehaviorType.values()) {
            List<UserBehaviorLog> logs = behaviorLogRepository.findByBehaviorTypeOrderByCreatedAtDesc(
                    type, PageRequest.of(0, 1000)).getContent();

            long totalCount = logs.stream()
                    .filter(log -> log.getCreatedAt().isAfter(startTime))
                    .count();
            long successCount = logs.stream()
                    .filter(log -> log.getCreatedAt().isAfter(startTime)
                            && log.getStatus() == UserBehaviorLog.BehaviorStatus.SUCCESS)
                    .count();

            Map<String, Object> typeStats = new HashMap<>();
            typeStats.put("total", totalCount);
            typeStats.put("success", successCount);
            typeStats.put("successRate", totalCount > 0 ? (double) successCount / totalCount * 100 : 0);
            stats.put(type.name(), typeStats);
        }

        return stats;
    }
}

