package service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 进程管理服务 - 统一管理所有Boss投递进程
 *
 * 核心功能：
 * 1. 防止同一用户启动多个投递进程
 * 2. 跨Controller统一进程状态管理
 * 3. 自动清理已完成的进程
 *
 * ⚠️ 重要：所有启动Boss投递的Controller必须使用此服务
 * DO NOT MODIFY: 进程管理逻辑，修改前请咨询架构师
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-22
 */
@Service
@Slf4j
public class ProcessManagerService {

    /**
     * 用户ID -> Boss进程任务的映射
     * 使用ConcurrentHashMap保证线程安全
     */
    private final ConcurrentHashMap<String, CompletableFuture<Void>> userProcesses = new ConcurrentHashMap<>();

    /**
     * 用户ID -> 进程启动时间的映射
     * 用于监控和统计进程运行时长
     */
    private final ConcurrentHashMap<String, Long> processStartTimes = new ConcurrentHashMap<>();

    /**
     * 检查用户是否已有运行中的进程
     *
     * @param userId 用户ID
     * @return true表示该用户已有进程在运行，false表示没有
     */
    public boolean isUserProcessRunning(String userId) {
        if (userId == null || userId.isEmpty()) {
            log.warn("检查进程时用户ID为空");
            return false;
        }

        CompletableFuture<Void> task = userProcesses.get(userId);
        boolean isRunning = task != null && !task.isDone();

        if (isRunning) {
            log.debug("用户 {} 已有进程在运行", userId);
        }

        return isRunning;
    }

    /**
     * 注册进程
     *
     * @param userId 用户ID
     * @param task Boss投递任务的CompletableFuture
     * @throws IllegalStateException 如果用户已有进程在运行
     */
    public void registerProcess(String userId, CompletableFuture<Void> task) {
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("用户ID不能为空");
        }

        if (task == null) {
            throw new IllegalArgumentException("任务不能为空");
        }

        // 二次检查，防止并发问题
        if (isUserProcessRunning(userId)) {
            Long startTime = processStartTimes.get(userId);
            long runtime = startTime != null ? (System.currentTimeMillis() - startTime) / 1000 : 0;
            throw new IllegalStateException(
                String.format("用户 %s 已有投递进程在运行（已运行%d秒），请等待当前任务完成", userId, runtime)
            );
        }

        // 注册进程
        userProcesses.put(userId, task);
        processStartTimes.put(userId, System.currentTimeMillis());
        log.info("✅ 进程注册成功: userId={}, 启动时间={}", userId, processStartTimes.get(userId));

        // 进程完成后自动清理
        task.whenComplete((result, throwable) -> {
            userProcesses.remove(userId);
            Long startTime = processStartTimes.remove(userId);

            if (startTime != null) {
                long runtime = (System.currentTimeMillis() - startTime) / 1000;
                if (throwable != null) {
                    log.info("❌ 进程异常结束并清理: userId={}, 运行时长={}秒, 异常={}",
                        userId, runtime, throwable.getMessage());
                } else {
                    log.info("✅ 进程正常完成并清理: userId={}, 运行时长={}秒", userId, runtime);
                }
            }
        });
    }

    /**
     * 停止用户进程
     *
     * @param userId 用户ID
     * @return true表示成功停止，false表示没有找到运行中的进程
     */
    public boolean stopUserProcess(String userId) {
        if (userId == null || userId.isEmpty()) {
            log.warn("停止进程时用户ID为空");
            return false;
        }

        CompletableFuture<Void> task = userProcesses.get(userId);
        if (task != null && !task.isDone()) {
            task.cancel(true);
            userProcesses.remove(userId);
            processStartTimes.remove(userId);
            log.info("✅ 进程已停止: userId={}", userId);
            return true;
        }

        log.info("未找到用户 {} 的运行中进程", userId);
        return false;
    }

    /**
     * 获取所有运行中的进程数量
     *
     * @return 运行中的进程总数
     */
    public int getRunningProcessCount() {
        int count = (int) userProcesses.values().stream()
            .filter(task -> !task.isDone())
            .count();
        log.debug("当前运行中的进程数量: {}", count);
        return count;
    }

    /**
     * 获取用户进程运行时长（毫秒）
     *
     * @param userId 用户ID
     * @return 运行时长（毫秒），如果进程不存在则返回null
     */
    public Long getUserProcessRuntime(String userId) {
        if (userId == null || userId.isEmpty()) {
            return null;
        }

        Long startTime = processStartTimes.get(userId);
        if (startTime != null) {
            return System.currentTimeMillis() - startTime;
        }
        return null;
    }

    /**
     * 获取所有运行中的用户ID列表
     * 用于监控和调试
     *
     * @return 运行中进程的用户ID数组
     */
    public String[] getRunningUserIds() {
        return userProcesses.entrySet().stream()
            .filter(entry -> !entry.getValue().isDone())
            .map(entry -> entry.getKey())
            .toArray(String[]::new);
    }
}

