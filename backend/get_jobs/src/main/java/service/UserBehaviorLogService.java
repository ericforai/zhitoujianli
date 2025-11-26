package service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    /**
     * 获取行为趋势分析（按天/周/月）
     *
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param groupBy 分组方式：day/week/month
     * @param behaviorType 行为类型（可选，null表示所有类型）
     * @return 趋势数据
     */
    public Map<String, Object> getBehaviorTrend(LocalDate startDate, LocalDate endDate, String groupBy, UserBehaviorLog.BehaviorType behaviorType) {
        Map<String, Object> result = new HashMap<>();
        LocalDateTime startTime = startDate.atStartOfDay();
        LocalDateTime endTime = endDate.atTime(23, 59, 59);

        List<UserBehaviorLog> logs;
        if (behaviorType != null) {
            logs = behaviorLogRepository.findByBehaviorTypeOrderByCreatedAtDesc(
                    behaviorType, PageRequest.of(0, 10000)).getContent();
            logs = logs.stream()
                    .filter(log -> log.getCreatedAt().isAfter(startTime) && log.getCreatedAt().isBefore(endTime))
                    .collect(Collectors.toList());
        } else {
            logs = behaviorLogRepository.findByTimeRange(startTime, endTime, PageRequest.of(0, 10000)).getContent();
        }

        // 按时间分组统计
        Map<String, Long> trendData = new LinkedHashMap<>();
        DateTimeFormatter formatter;

        switch (groupBy.toLowerCase()) {
            case "week":
                formatter = DateTimeFormatter.ofPattern("yyyy-'W'ww");
                break;
            case "month":
                formatter = DateTimeFormatter.ofPattern("yyyy-MM");
                break;
            default: // day
                formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        }

        for (UserBehaviorLog log : logs) {
            String key = log.getCreatedAt().format(formatter);
            trendData.put(key, trendData.getOrDefault(key, 0L) + 1);
        }

        result.put("trend", trendData);
        result.put("total", logs.size());
        result.put("startDate", startDate.toString());
        result.put("endDate", endDate.toString());
        result.put("groupBy", groupBy);

        return result;
    }

    /**
     * 获取转化漏斗分析
     * 分析用户从注册到投递成功的完整流程
     */
    public Map<String, Object> getConversionFunnel(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> result = new HashMap<>();
        LocalDateTime startTime = startDate.atStartOfDay();
        LocalDateTime endTime = endDate.atTime(23, 59, 59);

        List<UserBehaviorLog> logs = behaviorLogRepository.findByTimeRange(startTime, endTime, PageRequest.of(0, 50000)).getContent();

        // 定义漏斗步骤
        List<Map<String, Object>> funnelSteps = new ArrayList<>();

        // 1. 用户登录（使用二维码扫码成功作为登录指标）
        long loginCount = logs.stream()
                .filter(log -> log.getBehaviorType() == UserBehaviorLog.BehaviorType.QRCODE_SCAN_SUCCESS)
                .map(UserBehaviorLog::getUserId)
                .distinct()
                .count();
        funnelSteps.add(createFunnelStep("用户登录", loginCount, 100.0));

        // 2. 上传简历
        long resumeUploadCount = logs.stream()
                .filter(log -> log.getBehaviorType() == UserBehaviorLog.BehaviorType.RESUME_UPLOAD)
                .map(UserBehaviorLog::getUserId)
                .distinct()
                .count();
        double resumeRate = loginCount > 0 ? (double) resumeUploadCount / loginCount * 100 : 0;
        funnelSteps.add(createFunnelStep("上传简历", resumeUploadCount, resumeRate));

        // 3. 启动投递（使用启动投递作为搜索/投递指标）
        long jobSearchCount = logs.stream()
                .filter(log -> log.getBehaviorType() == UserBehaviorLog.BehaviorType.JOB_DELIVERY_START)
                .map(UserBehaviorLog::getUserId)
                .distinct()
                .count();
        double searchRate = resumeUploadCount > 0 ? (double) jobSearchCount / resumeUploadCount * 100 : 0;
        funnelSteps.add(createFunnelStep("搜索职位", jobSearchCount, searchRate));

        // 4. 启动投递
        long deliveryStartCount = logs.stream()
                .filter(log -> log.getBehaviorType() == UserBehaviorLog.BehaviorType.JOB_DELIVERY_START)
                .map(UserBehaviorLog::getUserId)
                .distinct()
                .count();
        double startRate = jobSearchCount > 0 ? (double) deliveryStartCount / jobSearchCount * 100 : 0;
        funnelSteps.add(createFunnelStep("启动投递", deliveryStartCount, startRate));

        // 5. 投递成功
        long deliverySuccessCount = logs.stream()
                .filter(log -> log.getBehaviorType() == UserBehaviorLog.BehaviorType.JOB_DELIVERY_SUCCESS)
                .count();
        double successRate = deliveryStartCount > 0 ? (double) deliverySuccessCount / deliveryStartCount * 100 : 0;
        funnelSteps.add(createFunnelStep("投递成功", deliverySuccessCount, successRate));

        result.put("funnel", funnelSteps);
        result.put("startDate", startDate.toString());
        result.put("endDate", endDate.toString());
        result.put("overallConversionRate", loginCount > 0 ? (double) deliverySuccessCount / loginCount * 100 : 0);

        return result;
    }

    private Map<String, Object> createFunnelStep(String name, long count, double conversionRate) {
        Map<String, Object> step = new HashMap<>();
        step.put("name", name);
        step.put("count", count);
        step.put("conversionRate", Math.round(conversionRate * 100.0) / 100.0);
        return step;
    }

    /**
     * 获取活跃用户统计
     *
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 活跃用户数据
     */
    public Map<String, Object> getActiveUsersStats(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> result = new HashMap<>();
        LocalDateTime startTime = startDate.atStartOfDay();
        LocalDateTime endTime = endDate.atTime(23, 59, 59);

        List<UserBehaviorLog> logs = behaviorLogRepository.findByTimeRange(startTime, endTime, PageRequest.of(0, 50000)).getContent();

        // 按天统计活跃用户数
        Map<String, Long> dailyActiveUsers = logs.stream()
                .collect(Collectors.groupingBy(
                        log -> log.getCreatedAt().toLocalDate().toString(),
                        Collectors.mapping(UserBehaviorLog::getUserId, Collectors.toSet())
                ))
                .entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> (long) e.getValue().size()
                ));

        // 总活跃用户数
        long totalActiveUsers = logs.stream()
                .map(UserBehaviorLog::getUserId)
                .distinct()
                .count();

        // 平均每日活跃用户数
        double avgDailyActiveUsers = dailyActiveUsers.values().stream()
                .mapToLong(Long::longValue)
                .average()
                .orElse(0.0);

        result.put("dailyActiveUsers", dailyActiveUsers);
        result.put("totalActiveUsers", totalActiveUsers);
        result.put("avgDailyActiveUsers", Math.round(avgDailyActiveUsers * 100.0) / 100.0);
        result.put("startDate", startDate.toString());
        result.put("endDate", endDate.toString());

        return result;
    }

    /**
     * 获取用户留存分析
     *
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 留存数据
     */
    public Map<String, Object> getRetentionStats(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> result = new HashMap<>();
        LocalDateTime startTime = startDate.atStartOfDay();
        LocalDateTime endTime = endDate.atTime(23, 59, 59);

        List<UserBehaviorLog> logs = behaviorLogRepository.findByTimeRange(startTime, endTime, PageRequest.of(0, 50000)).getContent();

        // 按日期分组用户
        Map<LocalDate, List<String>> usersByDate = logs.stream()
                .collect(Collectors.groupingBy(
                        log -> log.getCreatedAt().toLocalDate(),
                        Collectors.mapping(UserBehaviorLog::getUserId, Collectors.toList())
                ));

        // 计算留存率（简化版：次日留存）
        List<Map<String, Object>> retentionData = new ArrayList<>();
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            List<String> todayUsers = usersByDate.getOrDefault(currentDate, new ArrayList<>());
            if (!todayUsers.isEmpty()) {
                LocalDate nextDate = currentDate.plusDays(1);
                List<String> nextDayUsers = usersByDate.getOrDefault(nextDate, new ArrayList<>());

                long retainedUsers = todayUsers.stream()
                        .filter(nextDayUsers::contains)
                        .count();

                double retentionRate = todayUsers.size() > 0
                        ? (double) retainedUsers / todayUsers.size() * 100
                        : 0.0;

                Map<String, Object> dayData = new HashMap<>();
                dayData.put("date", currentDate.toString());
                dayData.put("newUsers", todayUsers.size());
                dayData.put("retainedUsers", retainedUsers);
                dayData.put("retentionRate", Math.round(retentionRate * 100.0) / 100.0);
                retentionData.add(dayData);
            }
            currentDate = currentDate.plusDays(1);
        }

        result.put("retention", retentionData);
        result.put("startDate", startDate.toString());
        result.put("endDate", endDate.toString());

        return result;
    }

    /**
     * 导出行为日志数据（CSV格式）
     *
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param userId 用户ID（可选）
     * @return CSV格式的字符串
     */
    public String exportBehaviorLogs(LocalDate startDate, LocalDate endDate, String userId) {
        LocalDateTime startTime = startDate.atStartOfDay();
        LocalDateTime endTime = endDate.atTime(23, 59, 59);

        List<UserBehaviorLog> logs;
        if (userId != null && !userId.isEmpty()) {
            logs = behaviorLogRepository.findByUserIdAndTimeRange(userId, startTime, endTime);
        } else {
            logs = behaviorLogRepository.findByTimeRange(startTime, endTime, PageRequest.of(0, 100000)).getContent();
        }

        StringBuilder csv = new StringBuilder();
        csv.append("时间,用户ID,行为类型,状态,描述,平台\n");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        for (UserBehaviorLog log : logs) {
            csv.append(String.format("%s,%s,%s,%s,%s,%s\n",
                    log.getCreatedAt().format(formatter),
                    log.getUserId(),
                    log.getBehaviorType().getDescription(),
                    log.getStatus().getDescription(),
                    log.getDescription() != null ? log.getDescription().replace(",", "，") : "",
                    log.getPlatform() != null ? log.getPlatform() : ""));
        }

        return csv.toString();
    }
}

