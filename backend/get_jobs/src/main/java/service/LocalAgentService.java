package service;

import java.time.LocalDateTime;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

/**
 * 本地Agent服务
 * 管理本地Agent连接、任务分发、结果处理
 *
 * @author ZhiTouJianLi Team
 * @since 2025-12
 */
@Service
public class LocalAgentService {

    private static final Logger log = LoggerFactory.getLogger(LocalAgentService.class);

    // Agent Token存储 (token -> userId)
    private final Map<String, String> agentTokens = new ConcurrentHashMap<>();

    // Agent Token过期时间 (token -> expireTime)
    private final Map<String, LocalDateTime> tokenExpireTimes = new ConcurrentHashMap<>();

    // 待处理任务队列 (userId -> tasks)
    private final Map<String, Queue<Map<String, Object>>> pendingTasks = new ConcurrentHashMap<>();

    // 进行中的任务 (taskId -> taskInfo)
    private final Map<String, TaskInfo> activeTasks = new ConcurrentHashMap<>();

    @Autowired
    private QuotaService quotaService;

    // 使用接口避免循环依赖
    private LocalAgentWebSocketHandler webSocketHandler;

    @Autowired
    public void setWebSocketHandler(@Lazy LocalAgentWebSocketHandler handler) {
        this.webSocketHandler = handler;
    }

    /**
     * WebSocket处理器接口（解决循环依赖）
     */
    public interface LocalAgentWebSocketHandler {
        boolean isAgentOnline(String userId);
        AgentStatus getAgentStatus(String userId);
        boolean sendDeliveryTask(String userId, Map<String, Object> task);
        int getOnlineAgentCount();
    }

    /**
     * Agent状态枚举
     */
    public enum AgentStatus {
        CONNECTING,
        ONLINE,
        BUSY,
        OFFLINE
    }

    /**
     * 任务信息
     */
    private static class TaskInfo {
        String taskId;
        String userId;
        Map<String, Object> task;
        LocalDateTime createTime;
        LocalDateTime startTime;

        TaskInfo(String taskId, String userId, Map<String, Object> task) {
            this.taskId = taskId;
            this.userId = userId;
            this.task = task;
            this.createTime = LocalDateTime.now();
        }
    }

    /**
     * 生成Agent认证Token
     *
     * @param userId 用户ID
     * @return Token
     */
    public String generateAgentToken(String userId) {
        // 清除该用户的旧Token
        agentTokens.entrySet().removeIf(e -> e.getValue().equals(userId));

        // 生成新Token
        String token = UUID.randomUUID().toString().replace("-", "");

        // 存储Token (30天有效，减少用户重复操作)
        agentTokens.put(token, userId);
        tokenExpireTimes.put(token, LocalDateTime.now().plusDays(30));

        log.info("✅ 生成Agent Token: userId={}, token={}...", userId, token.substring(0, 8));
        return token;
    }

    /**
     * 验证Agent Token
     *
     * @param token Token
     * @return 用户ID，验证失败返回null
     */
    public String validateAgentToken(String token) {
        if (token == null || token.isEmpty()) {
            return null;
        }

        // 检查Token是否存在
        String userId = agentTokens.get(token);
        if (userId == null) {
            log.warn("❌ Token不存在");
            return null;
        }

        // 检查Token是否过期
        LocalDateTime expireTime = tokenExpireTimes.get(token);
        if (expireTime == null || LocalDateTime.now().isAfter(expireTime)) {
            log.warn("❌ Token已过期: userId={}", userId);
            agentTokens.remove(token);
            tokenExpireTimes.remove(token);
            return null;
        }

        return userId;
    }

    /**
     * 撤销Agent Token
     *
     * @param token Token
     */
    public void revokeAgentToken(String token) {
        String userId = agentTokens.remove(token);
        tokenExpireTimes.remove(token);
        if (userId != null) {
            log.info("✅ 已撤销Token: userId={}", userId);
        }
    }

    /**
     * Agent连接回调
     */
    public void onAgentConnected(String userId, WebSocketSession session) {
        log.info("✅ Agent已连接: userId={}", userId);

        // 初始化任务队列
        pendingTasks.putIfAbsent(userId, new LinkedList<>());
    }

    /**
     * Agent断开连接回调
     */
    public void onAgentDisconnected(String userId) {
        log.info("⚠️ Agent已断开: userId={}", userId);

        // 将进行中的任务标记为失败
        activeTasks.entrySet().stream()
            .filter(e -> e.getValue().userId.equals(userId))
            .forEach(e -> {
                log.warn("任务因Agent断开而失败: taskId={}", e.getKey());
                // 可以在这里记录任务失败或重试
            });
    }

    /**
     * 检查并发送待处理任务
     */
    public void checkPendingTasks(String userId) {
        Queue<Map<String, Object>> queue = pendingTasks.get(userId);
        if (queue == null || queue.isEmpty()) {
            return;
        }

        // 发送第一个待处理任务
        Map<String, Object> task = queue.poll();
        if (task != null) {
            sendTask(userId, task);
        }
    }

    /**
     * 将任务加入队列
     */
    public void queueTask(String userId, Map<String, Object> task) {
        pendingTasks.computeIfAbsent(userId, k -> new LinkedList<>()).offer(task);
        log.info("📋 任务已入队: userId={}, queueSize={}", userId, pendingTasks.get(userId).size());
    }

    /**
     * 创建投递任务
     *
     * @param userId        用户ID
     * @param jobUrl        职位URL
     * @param jobName       职位名称
     * @param companyName   公司名称
     * @param greeting      打招呼语
     * @param config        配置
     * @return 任务ID
     */
    public String createDeliveryTask(String userId, String jobUrl, String jobName,
                                     String companyName, String greeting, Map<String, Object> config) {
        String taskId = UUID.randomUUID().toString();

        // 检测任务类型：如果config包含taskType=search，则为搜索任务
        String taskType = "delivery";
        if (config != null && "search".equals(config.get("taskType"))) {
            taskType = "search";
        }

        Map<String, Object> task = new java.util.HashMap<>();
        task.put("task_id", taskId);
        task.put("task_type", taskType);
        task.put("job_url", jobUrl);
        task.put("job_name", jobName);
        task.put("company_name", companyName);
        task.put("greeting_message", greeting != null ? greeting : "");
        task.put("config", config != null ? config : Map.of());

        // 检查Agent是否在线
        if (!webSocketHandler.isAgentOnline(userId)) {
            log.warn("❌ Agent未在线，无法创建任务: userId={}", userId);
            return null;
        }

        // 存储任务信息
        TaskInfo taskInfo = new TaskInfo(taskId, userId, task);
        activeTasks.put(taskId, taskInfo);

        // 发送任务
        if (sendTask(userId, task)) {
            return taskId;
        } else {
            activeTasks.remove(taskId);
            return null;
        }
    }

    /**
     * 发送任务到Agent
     */
    private boolean sendTask(String userId, Map<String, Object> task) {
        String taskId = (String) task.get("task_id");

        // 通过WebSocket发送
        boolean sent = webSocketHandler.sendDeliveryTask(userId, task);

        if (sent) {
            // 更新任务状态
            TaskInfo taskInfo = activeTasks.get(taskId);
            if (taskInfo != null) {
                taskInfo.startTime = LocalDateTime.now();
            }
            log.info("📤 任务已发送: userId={}, taskId={}", userId, taskId);
        }

        return sent;
    }

    /**
     * 处理任务结果
     */
    public void handleTaskResult(String userId, String taskId, Map<String, Object> result) {
        TaskInfo taskInfo = activeTasks.remove(taskId);

        if (taskInfo == null) {
            log.warn("⚠️ 未知任务结果: taskId={}", taskId);
            return;
        }

        boolean success = Boolean.TRUE.equals(result.get("success"));
        String message = (String) result.get("message");

        if (success) {
            log.info("✅ 任务成功: userId={}, taskId={}, message={}", userId, taskId, message);

            // 消费配额
            try {
                quotaService.consumeQuota(userId, "daily_job_application", 1);
                log.info("✅ 已消费配额: userId={}", userId);
            } catch (Exception e) {
                log.error("消费配额失败: {}", e.getMessage());
            }
        } else {
            log.warn("❌ 任务失败: userId={}, taskId={}, message={}", userId, taskId, message);

            // 检查是否需要登录
            if (Boolean.TRUE.equals(result.get("need_login"))) {
                log.info("🔐 Agent需要登录: userId={}", userId);
                // 可以在这里触发登录流程通知
            }
        }

        // 检查是否有更多待处理任务
        checkPendingTasks(userId);
    }

    /**
     * 获取用户Agent状态
     */
    public Map<String, Object> getAgentStatus(String userId) {
        // ✅ 修复：检查webSocketHandler是否已初始化
        boolean online = false;
        AgentStatus status = AgentStatus.OFFLINE;

        if (webSocketHandler != null) {
            try {
                online = webSocketHandler.isAgentOnline(userId);
                status = webSocketHandler.getAgentStatus(userId);
            } catch (Exception e) {
                log.warn("获取WebSocket状态失败: {}", e.getMessage());
                // 使用默认值：offline
            }
        } else {
            log.debug("WebSocketHandler未初始化，返回默认状态");
        }

        Queue<Map<String, Object>> queue = pendingTasks.get(userId);
        int pendingCount = queue != null ? queue.size() : 0;

        long activeCount = activeTasks.values().stream()
            .filter(t -> t.userId.equals(userId))
            .count();

        return Map.of(
            "online", online,
            "status", status.name(),
            "pendingTasks", pendingCount,
            "activeTasks", activeCount
        );
    }

    /**
     * 获取系统统计
     */
    public Map<String, Object> getSystemStats() {
        int onlineAgents = 0;
        if (webSocketHandler != null) {
            try {
                onlineAgents = webSocketHandler.getOnlineAgentCount();
            } catch (Exception e) {
                log.warn("获取在线Agent数量失败: {}", e.getMessage());
            }
        }

        return Map.of(
            "onlineAgents", onlineAgents,
            "totalActiveTasks", activeTasks.size(),
            "totalPendingTasks", pendingTasks.values().stream().mapToInt(Queue::size).sum()
        );
    }
}
