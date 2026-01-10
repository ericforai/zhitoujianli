package interceptor;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import config.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import service.LocalAgentService;

/**
 * 本地Agent WebSocket握手拦截器
 * 支持JWT Token认证（用户登录后获取）
 *
 * @author ZhiTouJianLi Team
 * @since 2025-12
 */
@Component
public class LocalAgentHandshakeInterceptor implements HandshakeInterceptor {

    private static final Logger log = LoggerFactory.getLogger(LocalAgentHandshakeInterceptor.class);

    @Autowired
    private LocalAgentService localAgentService;

    @Autowired
    private JwtConfig jwtConfig;

    @Override
    public boolean beforeHandshake(
            @NonNull ServerHttpRequest request,
            @NonNull ServerHttpResponse response,
            @NonNull WebSocketHandler wsHandler,
            @NonNull Map<String, Object> attributes) throws Exception {

        String uri = request.getURI().toString();
        log.info("🔌 本地Agent握手请求: uri={}", uri);

        // 从URL参数获取Token
        String query = request.getURI().getQuery();
        log.debug("查询参数: {}", query);

        String token = extractToken(query);

        if (token == null || token.isEmpty()) {
            // 尝试从Authorization header获取
            token = extractAuthHeader(request);
        }

        if (token == null || token.isEmpty()) {
            log.warn("❌ 本地Agent握手失败: 未提供Token, uri={}", uri);
            response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
            return false;
        }

        log.debug("提取到Token: {}...", token.length() > 8 ? token.substring(0, 8) : "***");

        // 优先使用JWT Token验证
        String userId = validateJwtToken(token);

        // 如果JWT验证失败，尝试旧的Agent Token验证（兼容旧版本）
        if (userId == null) {
            userId = localAgentService.validateAgentToken(token);
        }

        if (userId == null) {
            log.warn("❌ 本地Agent握手失败: Token无效或已过期, token={}...",
                token.length() > 8 ? token.substring(0, 8) : "***");
            response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
            return false;
        }

        // 存储用户ID到attributes，供后续使用
        attributes.put("userId", userId);
        attributes.put("token", token);

        log.info("✅ 本地Agent握手成功: userId={}", userId);
        return true;
    }

    @Override
    public void afterHandshake(
            @NonNull ServerHttpRequest request,
            @NonNull ServerHttpResponse response,
            @NonNull WebSocketHandler wsHandler,
            @Nullable Exception exception) {
        if (exception != null) {
            log.error("本地Agent握手后处理异常: {}", exception.getMessage());
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

            // 从claims中获取userId
            Object userIdObj = claims.get("userId");
            if (userIdObj != null) {
                String userId = String.valueOf(userIdObj);
                log.debug("JWT验证成功: userId={}", userId);
                return userId;
            }

            // 尝试从subject获取
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

    /**
     * 从查询字符串中提取Token
     */
    private String extractToken(String query) {
        if (query == null || query.isEmpty()) {
            return null;
        }

        for (String param : query.split("&")) {
            String[] parts = param.split("=", 2);
            if (parts.length == 2 && "token".equals(parts[0])) {
                return parts[1];
            }
        }
        return null;
    }

    /**
     * 从Authorization header提取Token
     */
    private String extractAuthHeader(ServerHttpRequest request) {
        var authHeaders = request.getHeaders().get("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String authHeader = authHeaders.get(0);
            if (authHeader.startsWith("Bearer ")) {
                return authHeader.substring(7);
            }
        }
        return null;
    }
}
