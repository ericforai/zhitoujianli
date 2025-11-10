# WebSocket 用户隔离安全修复方案

## 问题
当前 WebSocket 连接建立时未验证 JWT Token，前端可以通过伪造 `userId` 参数监听其他用户的消息。

## 风险
- 恶意用户可以通过 `ws://xxx/boss-delivery?userId=other_user` 监听其他用户的投递状态
- 中等安全风险

## 修复方案

### 1. 修改 WebSocketConfig.java

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private BossWebSocketController bossWebSocketController;

    @Autowired
    private JwtService jwtService;  // ← 新增

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(bossWebSocketController, "/ws/boss-delivery")
                .addInterceptors(new JwtHandshakeInterceptor(jwtService))  // ← 新增JWT验证拦截器
                .setAllowedOrigins("https://zhitoujianli.com", "http://localhost:3000")  // ← 限制来源
                .withSockJS();
    }
}
```

### 2. 创建 JwtHandshakeInterceptor.java

```java
package interceptor;

import filter.JwtService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Slf4j
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;

    public JwtHandshakeInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) throws Exception {

        try {
            // 1. 从请求中提取 Token（支持Header或查询参数）
            String token = extractToken(request);

            if (token == null || token.isEmpty()) {
                log.warn("❌ WebSocket连接被拒绝：缺少JWT Token");
                return false;
            }

            // 2. 验证 Token 并提取 userId
            String userId = jwtService.validateTokenAndGetUserId(token);

            if (userId == null) {
                log.warn("❌ WebSocket连接被拒绝：Token无效");
                return false;
            }

            // 3. 将验证通过的 userId 存入 attributes（后续使用）
            attributes.put("userId", userId);
            log.info("✅ WebSocket连接验证通过：userId={}", userId);

            return true;

        } catch (Exception e) {
            log.error("❌ WebSocket连接验证失败", e);
            return false;
        }
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception) {
        // 握手后处理（可选）
    }

    /**
     * 从请求中提取 Token
     * 支持两种方式：
     * 1. HTTP Header: Authorization: Bearer {token}
     * 2. 查询参数: ?token={token}
     */
    private String extractToken(ServerHttpRequest request) {
        // 方式1：从 Header 中提取
        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // 方式2：从查询参数中提取（用于浏览器WebSocket API）
        String query = request.getURI().getQuery();
        if (query != null && query.contains("token=")) {
            int start = query.indexOf("token=") + 6;
            int end = query.indexOf("&", start);
            if (end == -1) {
                return query.substring(start);
            } else {
                return query.substring(start, end);
            }
        }

        return null;
    }
}
```

### 3. 修改 BossWebSocketController.java

```java
@Override
public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    // ✅ 从握手验证的 attributes 中获取 userId（已验证）
    String userId = (String) session.getAttributes().get("userId");

    if (userId == null) {
        log.error("❌ WebSocket会话缺少userId，拒绝连接");
        session.close(CloseStatus.NOT_ACCEPTABLE);
        return;
    }

    userSessions.put(userId, session);
    log.info("✅ 用户连接WebSocket: {}", userId);

    // 发送欢迎消息
    sendMessage(session, createMessage("welcome", "连接成功，等待指令"));
}

// ❌ 删除不安全的 getUserIdFromSession 方法
// private String getUserIdFromSession(WebSocketSession session) { ... }

// ✅ 新增：从验证过的 attributes 获取 userId
private String getUserIdFromSession(WebSocketSession session) {
    return (String) session.getAttributes().get("userId");
}
```

### 4. 前端修改（React）

```typescript
// src/services/websocket.ts
import { getAuthToken } from './auth';

export function connectWebSocket() {
  const token = getAuthToken(); // 从localStorage或Cookie获取

  if (!token) {
    throw new Error('未登录，无法建立WebSocket连接');
  }

  // ✅ 将Token作为查询参数传递（浏览器WebSocket API不支持Header）
  const ws = new WebSocket(`wss://zhitoujianli.com/ws/boss-delivery?token=${token}`);

  ws.onopen = () => {
    console.log('✅ WebSocket连接成功');
  };

  ws.onerror = (error) => {
    console.error('❌ WebSocket连接失败', error);
  };

  return ws;
}
```

## 测试验证

### 1. 正常连接测试
```bash
# 使用有效Token连接（应该成功）
wscat -c "ws://localhost:8080/ws/boss-delivery?token=valid_jwt_token"
```

### 2. 伪造userId测试
```bash
# 尝试伪造userId（应该被拒绝）
wscat -c "ws://localhost:8080/ws/boss-delivery?userId=other_user"
# 预期结果：连接被拒绝，因为缺少有效Token
```

### 3. 无效Token测试
```bash
# 使用无效Token（应该被拒绝）
wscat -c "ws://localhost:8080/ws/boss-delivery?token=invalid_token"
# 预期结果：连接被拒绝，Token验证失败
```

## 修复后效果

✅ **修复前：** 前端可以通过伪造 `userId=other_user` 监听其他用户消息
✅ **修复后：** 必须提供有效的 JWT Token，系统从 Token 中提取真实 userId

## 部署步骤

1. 创建 `JwtHandshakeInterceptor.java`
2. 修改 `WebSocketConfig.java` 添加拦截器
3. 修改 `BossWebSocketController.java` 使用验证后的 userId
4. 修改前端代码传递 Token
5. 重新构建并部署后端
6. 重新构建并部署前端
7. 验证功能正常

## 优先级
**P1（高优先级）** - 建议在下一个版本中修复

