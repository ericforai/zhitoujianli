package controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * Boss投递WebSocket控制器
 * 用于与用户本地浏览器进行实时通信
 */
@Component
@Slf4j
public class BossWebSocketController implements WebSocketHandler {

    // 存储用户会话
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();

    // 等待登录完成的信号量
    private final Map<String, CountDownLatch> loginWaiters = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userId = getUserIdFromSession(session);
        userSessions.put(userId, session);
        log.info("用户连接WebSocket: {}", userId);

        // 发送欢迎消息
        sendMessage(session, createMessage("welcome", "连接成功，等待指令"));
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        String payload = message.getPayload().toString();
        String userId = getUserIdFromSession(session);

        log.info("收到用户消息: {} - {}", userId, payload);

        try {
            // 解析消息
            Map<String, Object> messageData = parseMessage(payload);
            String action = (String) messageData.get("action");

            switch (action) {
                case "login_complete":
                    handleLoginComplete(userId, messageData);
                    break;
                case "login_failed":
                    handleLoginFailed(userId, messageData);
                    break;
                case "delivery_progress":
                    handleDeliveryProgress(userId, messageData);
                    break;
                case "delivery_complete":
                    handleDeliveryComplete(userId, messageData);
                    break;
                default:
                    log.warn("未知消息类型: {}", action);
            }
        } catch (Exception e) {
            log.error("处理消息失败", e);
            sendMessage(session, createMessage("error", "消息处理失败: " + e.getMessage()));
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        String userId = getUserIdFromSession(session);
        log.error("WebSocket传输错误: {}", userId, exception);

        // 清理资源
        userSessions.remove(userId);
        loginWaiters.remove(userId);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        String userId = getUserIdFromSession(session);
        log.info("用户断开WebSocket连接: {} - {}", userId, closeStatus);

        // 清理资源
        userSessions.remove(userId);
        loginWaiters.remove(userId);
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    /**
     * 发送登录指令给用户本地浏览器
     */
    public boolean sendLoginCommand(String userId) {
        WebSocketSession session = userSessions.get(userId);
        if (session == null || !session.isOpen()) {
            log.warn("用户会话不存在或已关闭: {}", userId);
            return false;
        }

        try {
            // 创建登录等待信号量
            CountDownLatch loginLatch = new CountDownLatch(1);
            loginWaiters.put(userId, loginLatch);

            // 发送登录指令
            Map<String, Object> loginCommand = Map.of(
                "action", "login",
                "message", "请扫码登录Boss直聘",
                "timeout", 300 // 5分钟超时
            );

            sendMessage(session, loginCommand);
            log.info("已发送登录指令给用户: {}", userId);

            // 等待登录完成（最多5分钟）
            boolean loginSuccess = loginLatch.await(5, TimeUnit.MINUTES);

            // 清理等待信号量
            loginWaiters.remove(userId);

            return loginSuccess;
        } catch (Exception e) {
            log.error("发送登录指令失败", e);
            loginWaiters.remove(userId);
            return false;
        }
    }

    /**
     * 发送投递指令给用户本地浏览器
     */
    public void sendDeliveryCommand(String userId, Map<String, Object> deliveryConfig) {
        WebSocketSession session = userSessions.get(userId);
        if (session == null || !session.isOpen()) {
            log.warn("用户会话不存在或已关闭: {}", userId);
            return;
        }

        try {
            Map<String, Object> deliveryCommand = Map.of(
                "action", "start_delivery",
                "config", deliveryConfig,
                "message", "开始投递简历"
            );

            sendMessage(session, deliveryCommand);
            log.info("已发送投递指令给用户: {}", userId);
        } catch (Exception e) {
            log.error("发送投递指令失败", e);
        }
    }

    /**
     * 检查用户是否在线
     */
    public boolean isUserOnline(String userId) {
        WebSocketSession session = userSessions.get(userId);
        return session != null && session.isOpen();
    }

    /**
     * 处理登录完成
     */
    private void handleLoginComplete(String userId, Map<String, Object> messageData) {
        log.info("用户登录完成: {}", userId);

        // 通知等待登录的线程
        CountDownLatch loginLatch = loginWaiters.get(userId);
        if (loginLatch != null) {
            loginLatch.countDown();
        }

        // 发送确认消息
        WebSocketSession session = userSessions.get(userId);
        if (session != null) {
            sendMessage(session, createMessage("login_confirmed", "登录成功，开始投递"));
        }
    }

    /**
     * 处理登录失败
     */
    private void handleLoginFailed(String userId, Map<String, Object> messageData) {
        log.error("用户登录失败: {}", userId);

        // 通知等待登录的线程
        CountDownLatch loginLatch = loginWaiters.get(userId);
        if (loginLatch != null) {
            loginLatch.countDown();
        }
    }

    /**
     * 处理投递进度
     */
    private void handleDeliveryProgress(String userId, Map<String, Object> messageData) {
        log.info("用户投递进度: {} - {}", userId, messageData.get("progress"));
        // 可以在这里更新数据库或通知前端
    }

    /**
     * 处理投递完成
     */
    private void handleDeliveryComplete(String userId, Map<String, Object> messageData) {
        log.info("用户投递完成: {} - {}", userId, messageData.get("summary"));

        // 发送完成确认
        WebSocketSession session = userSessions.get(userId);
        if (session != null) {
            sendMessage(session, createMessage("delivery_confirmed", "投递任务完成"));
        }
    }

    /**
     * 发送消息给指定会话
     */
    private void sendMessage(WebSocketSession session, Object message) {
        try {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(message.toString()));
            }
        } catch (IOException e) {
            log.error("发送WebSocket消息失败", e);
        }
    }

    /**
     * 创建标准化消息
     */
    private Map<String, Object> createMessage(String action, String message) {
        return Map.of(
            "action", action,
            "message", message,
            "timestamp", System.currentTimeMillis()
        );
    }

    /**
     * 从会话中获取用户ID
     */
    private String getUserIdFromSession(WebSocketSession session) {
        // 从查询参数或路径中获取用户ID
        String query = session.getUri().getQuery();
        if (query != null && query.contains("userId=")) {
            return query.substring(query.indexOf("userId=") + 7);
        }
        return session.getId(); // 回退到会话ID
    }

    /**
     * 解析消息
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> parseMessage(String payload) {
        // 简单的JSON解析，实际项目中应该使用Jackson
        try {
            // 这里简化处理，实际应该使用JSON库
            return Map.of("action", "unknown", "data", payload);
        } catch (Exception e) {
            throw new RuntimeException("消息解析失败", e);
        }
    }
}


