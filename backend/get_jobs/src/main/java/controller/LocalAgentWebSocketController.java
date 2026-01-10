package controller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;

import config.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import service.LocalAgentService;
import service.QuotaService;

/**
 * 本地Agent WebSocket控制器
 * 用于与用户本地运行的Agent进行通信
 *
 * @author ZhiTouJianLi Team
 * @since 2025-12
 */
@Component
public class LocalAgentWebSocketController extends TextWebSocketHandler
        implements LocalAgentService.LocalAgentWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(LocalAgentWebSocketController.class);

    private final ObjectMapper objectMapper = new ObjectMapper();

    // 在线的Agent连接 (userId -> session)
    private final Map<String, WebSocketSession> agentSessions = new ConcurrentHashMap<>();

    // Agent状态 (userId -> status)
    private final Map<String, LocalAgentService.AgentStatus> agentStatuses = new ConcurrentHashMap<>();

    // 统计
    private final AtomicInteger totalConnections = new AtomicInteger(0);

    private LocalAgentService localAgentService;

    @Autowired
    private QuotaService quotaService;

    @Autowired
    private JwtConfig jwtConfig;

    @Autowired
    public void setLocalAgentService(@Lazy LocalAgentService localAgentService) {
        this.localAgentService = localAgentService;
    }

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) throws Exception {
        totalConnections.incrementAndGet();
        log.info("🔌 新的本地Agent连接: sessionId={}", session.getId());

        // 发送欢迎消息，等待认证
        sendMessage(session, Map.of(
            "type", "welcome",
            "payload", Map.of(
                "message", "请发送认证信息",
                "sessionId", session.getId()
            )
        ));
    }

    @Override
    protected void handleTextMessage(@NonNull WebSocketSession session, @NonNull TextMessage message) throws Exception {
        String payload = message.getPayload();
        log.debug("📩 收到Agent消息: {}", payload.length() > 200 ? payload.substring(0, 200) + "..." : payload);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> msg = objectMapper.readValue(payload, Map.class);
            String type = (String) msg.get("type");
            @SuppressWarnings("unchecked")
            Map<String, Object> msgPayload = (Map<String, Object>) msg.get("payload");

            switch (type) {
                case "auth":
                    handleAuth(session, msgPayload);
                    break;
                case "heartbeat":
                    handleHeartbeat(session);
                    break;
                case "status":
                    handleStatusUpdate(session, msgPayload);
                    break;
                case "task_result":
                    handleTaskResult(session, msgPayload);
                    break;
                case "log":
                    handleAgentLog(session, msgPayload);
                    break;
                case "pong":
                    // 心跳响应，忽略
                    break;
                default:
                    log.warn("未知消息类型: {}", type);
            }
        } catch (Exception e) {
            log.error("处理Agent消息失败: {}", e.getMessage());
            sendError(session, "消息处理失败: " + e.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession session, @NonNull CloseStatus status) throws Exception {
        totalConnections.decrementAndGet();
        String userId = getUserIdFromSession(session);

        if (userId != null) {
            agentSessions.remove(userId);
            agentStatuses.put(userId, LocalAgentService.AgentStatus.OFFLINE);
            log.info("🔌 本地Agent断开连接: userId={}, status={}", userId, status);

            // 通知服务层
            localAgentService.onAgentDisconnected(userId);
        } else {
            log.info("🔌 未认证的Agent断开连接: sessionId={}", session.getId());
        }
    }

    @Override
    public void handleTransportError(@NonNull WebSocketSession session, @NonNull Throwable exception) throws Exception {
        log.error("WebSocket传输错误: sessionId={}, error={}", session.getId(), exception.getMessage());
        session.close(CloseStatus.SERVER_ERROR);
    }

    /**
     * 处理Agent认证
     */
    private void handleAuth(WebSocketSession session, Map<String, Object> payload) throws IOException {
        String token = (String) payload.get("token");
        String authType = (String) payload.get("auth_type");  // "jwt" 或 null（旧版兼容）
        String clientType = (String) payload.get("client_type");
        String version = (String) payload.get("version");

        log.info("🔐 Agent认证请求: clientType={}, version={}, authType={}", clientType, version, authType);

        String userId = null;

        // 优先使用JWT认证
        if ("jwt".equals(authType) || (token != null && token.contains("."))) {
            userId = validateJwtToken(token);
            if (userId != null) {
                log.debug("JWT认证成功: userId={}", userId);
            }
        }

        // 如果JWT认证失败，尝试旧的Agent Token验证（兼容旧版本）
        if (userId == null) {
            userId = localAgentService.validateAgentToken(token);
        }

        if (userId == null) {
            log.warn("❌ Agent认证失败: 无效的Token");
            sendMessage(session, Map.of(
                "type", "auth_failed",
                "payload", Map.of("message", "无效的认证Token")
            ));
            session.close(CloseStatus.NOT_ACCEPTABLE);
            return;
        }

        // 检查是否已有连接
        WebSocketSession existingSession = agentSessions.get(userId);
        if (existingSession != null && existingSession.isOpen()) {
            log.warn("⚠️ 用户已有Agent连接，关闭旧连接: userId={}", userId);
            try {
                existingSession.close(CloseStatus.POLICY_VIOLATION);
            } catch (Exception e) {
                log.debug("关闭旧连接时出错: {}", e.getMessage());
            }
        }

        // 保存连接
        session.getAttributes().put("userId", userId);
        agentSessions.put(userId, session);
        agentStatuses.put(userId, LocalAgentService.AgentStatus.ONLINE);

        log.info("✅ Agent认证成功: userId={}", userId);

        // 发送认证成功消息
        sendMessage(session, Map.of(
            "type", "auth_success",
            "payload", Map.of(
                "userId", userId,
                "message", "认证成功"
            )
        ));

        // 通知服务层
        localAgentService.onAgentConnected(userId, session);

        // 检查是否有待处理的任务
        localAgentService.checkPendingTasks(userId);
    }

    /**
     * 处理心跳
     */
    private void handleHeartbeat(WebSocketSession session) throws IOException {
        sendMessage(session, Map.of(
            "type", "ping",
            "payload", Map.of()
        ));
    }

    /**
     * 处理状态更新
     */
    private void handleStatusUpdate(WebSocketSession session, Map<String, Object> payload) {
        String userId = getUserIdFromSession(session);
        if (userId == null) return;

        String statusStr = (String) payload.get("status");
        try {
            LocalAgentService.AgentStatus status = LocalAgentService.AgentStatus.valueOf(statusStr.toUpperCase());
            agentStatuses.put(userId, status);
            log.debug("Agent状态更新: userId={}, status={}", userId, status);
        } catch (Exception e) {
            log.warn("无效的状态值: {}", statusStr);
        }
    }

    /**
     * 处理任务结果
     */
    private void handleTaskResult(WebSocketSession session, Map<String, Object> payload) {
        String userId = getUserIdFromSession(session);
        if (userId == null) return;

        String taskId = (String) payload.get("task_id");
        @SuppressWarnings("unchecked")
        Map<String, Object> result = (Map<String, Object>) payload.get("result");

        log.info("📬 收到任务结果: userId={}, taskId={}, success={}",
            userId, taskId, result.get("success"));

        // 委托给服务层处理
        localAgentService.handleTaskResult(userId, taskId, result);
    }

    /**
     * 处理Agent日志
     */
    private void handleAgentLog(WebSocketSession session, Map<String, Object> payload) {
        String userId = getUserIdFromSession(session);
        String level = (String) payload.get("level");
        String message = (String) payload.get("message");

        // 根据日志级别记录
        switch (level.toLowerCase()) {
            case "error":
                log.error("📝 Agent[{}]: {}", userId, message);
                break;
            case "warn":
            case "warning":
                log.warn("📝 Agent[{}]: {}", userId, message);
                break;
            case "info":
                log.info("📝 Agent[{}]: {}", userId, message);
                break;
            default:
                log.debug("📝 Agent[{}]: {}", userId, message);
        }
    }

    /**
     * 发送投递任务到Agent
     */
    @Override
    public boolean sendDeliveryTask(String userId, Map<String, Object> task) {
        WebSocketSession session = agentSessions.get(userId);
        if (session == null || !session.isOpen()) {
            log.warn("❌ Agent未连接，无法发送任务: userId={}", userId);
            return false;
        }

        LocalAgentService.AgentStatus status = agentStatuses.get(userId);
        if (status == LocalAgentService.AgentStatus.BUSY) {
            log.warn("⚠️ Agent正忙，任务入队等待: userId={}", userId);
            localAgentService.queueTask(userId, task);
            return true;
        }

        try {
            sendMessage(session, Map.of(
                "type", "task",
                "payload", task
            ));
            log.info("📤 已发送投递任务到Agent: userId={}, taskId={}", userId, task.get("task_id"));
            return true;
        } catch (Exception e) {
            log.error("发送任务失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 检查Agent是否在线
     */
    @Override
    public boolean isAgentOnline(String userId) {
        WebSocketSession session = agentSessions.get(userId);
        return session != null && session.isOpen();
    }

    /**
     * 获取Agent状态
     */
    @Override
    public LocalAgentService.AgentStatus getAgentStatus(String userId) {
        return agentStatuses.getOrDefault(userId, LocalAgentService.AgentStatus.OFFLINE);
    }

    /**
     * 获取所有在线Agent数量
     */
    @Override
    public int getOnlineAgentCount() {
        return (int) agentSessions.values().stream()
            .filter(WebSocketSession::isOpen)
            .count();
    }

    /**
     * 从Session获取用户ID
     */
    private String getUserIdFromSession(WebSocketSession session) {
        return (String) session.getAttributes().get("userId");
    }

    /**
     * 发送消息
     */
    private void sendMessage(WebSocketSession session, Map<String, Object> message) throws IOException {
        if (session.isOpen()) {
            String json = objectMapper.writeValueAsString(message);
            session.sendMessage(new TextMessage(json));
        }
    }

    /**
     * 发送错误消息
     */
    private void sendError(WebSocketSession session, String errorMessage) {
        try {
            sendMessage(session, Map.of(
                "type", "error",
                "payload", Map.of("message", errorMessage)
            ));
        } catch (IOException e) {
            log.error("发送错误消息失败: {}", e.getMessage());
        }
    }

    /**
     * 验证JWT Token
     * @return userId 或 null
     */
    private String validateJwtToken(String token) {
        try {
            // 检查是否是JWT格式（包含两个点）
            if (token == null || !token.contains(".") || token.split("\\.").length != 3) {
                return null;
            }

            // 验证并解析JWT
            Claims claims = Jwts.parser()
                    .setSigningKey(jwtConfig.getJwtSecret().getBytes(StandardCharsets.UTF_8))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // 从claims中获取userId，转换为与UserContextUtil一致的格式
            Object userIdObj = claims.get("userId");
            if (userIdObj != null) {
                // 转换为 "user_xxx" 格式，与UserContextUtil.getCurrentUserId()一致
                String userId;
                if (userIdObj instanceof Number) {
                    userId = "user_" + userIdObj;
                } else {
                    String userIdStr = String.valueOf(userIdObj);
                    // 如果已经是user_开头，保持不变
                    userId = userIdStr.startsWith("user_") ? userIdStr : "user_" + userIdStr;
                }
                log.debug("JWT验证成功: userId={}", userId);
                return userId;
            }

            // 尝试从subject获取（通常是email）
            String subject = claims.getSubject();
            if (subject != null) {
                log.debug("JWT验证成功(从subject): userId={}", subject);
                return subject;
            }

        } catch (Exception e) {
            log.debug("JWT验证失败: {}", e.getMessage());
        }
        return null;
    }
}
