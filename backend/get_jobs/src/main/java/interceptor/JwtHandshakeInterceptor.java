package interceptor;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import config.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

/**
 * WebSocket JWT 握手拦截器
 * 在 WebSocket 连接建立前验证 JWT Token
 *
 * 安全特性：
 * 1. 强制验证 JWT Token，防止未认证连接
 * 2. 从 Token 中提取 userId，防止前端伪造
 * 3. 将验证后的用户信息存入 WebSocketSession attributes
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-07
 */
@Component
@Slf4j
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtConfig jwtConfig;

    public JwtHandshakeInterceptor(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
    }

    @Override
    public boolean beforeHandshake(
            @NonNull ServerHttpRequest request,
            @NonNull ServerHttpResponse response,
            @NonNull WebSocketHandler wsHandler,
            @NonNull Map<String, Object> attributes) throws Exception {

        try {
            log.debug("🔐 WebSocket握手开始，验证JWT Token...");

            // 1. 提取 Token
            String token = extractToken(request);

            if (token == null || token.isEmpty()) {
                log.warn("❌ WebSocket连接被拒绝：缺少JWT Token");
                return false;
            }

            // 2. 验证并解析 Token（使用新的 JWT API）
            SecretKey secretKey = Keys.hmacShaKeyFor(jwtConfig.getJwtSecret().getBytes(StandardCharsets.UTF_8));
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // 3. 提取用户信息
            String userId = claims.getSubject();
            String email = claims.get("email", String.class);
            String username = claims.get("username", String.class);

            if (userId == null || userId.isEmpty()) {
                log.warn("❌ WebSocket连接被拒绝：Token中缺少userId");
                return false;
            }

            // 4. 将验证通过的用户信息存入 attributes（后续使用）
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("userId", userId);
            userInfo.put("email", email);
            userInfo.put("username", username);

            attributes.put("userId", userId);
            attributes.put("userInfo", userInfo);

            log.info("✅ WebSocket握手验证通过：userId={}, email={}", userId, email);

            return true;

        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            log.warn("❌ WebSocket连接被拒绝：Token已过期");
            return false;
        } catch (io.jsonwebtoken.MalformedJwtException e) {
            log.warn("❌ WebSocket连接被拒绝：Token格式错误");
            return false;
        } catch (io.jsonwebtoken.security.SignatureException e) {
            log.warn("❌ WebSocket连接被拒绝：Token签名验证失败");
            return false;
        } catch (Exception e) {
            log.error("❌ WebSocket握手验证异常", e);
            return false;
        }
    }

    @Override
    public void afterHandshake(
            @NonNull ServerHttpRequest request,
            @NonNull ServerHttpResponse response,
            @NonNull WebSocketHandler wsHandler,
            @Nullable Exception exception) {
        if (exception != null) {
            log.error("❌ WebSocket握手后异常", exception);
        } else {
            log.debug("✅ WebSocket握手完成");
        }
    }

    /**
     * 从请求中提取 JWT Token
     * 支持三种方式（优先级从高到低）：
     * 1. HTTP Header: Authorization: Bearer {token}
     * 2. 查询参数: ?token={token}
     * 3. Cookie: auth_token={token}
     */
    private String extractToken(ServerHttpRequest request) {
        // 方式1：从 Authorization Header 中提取
        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            log.debug("✅ 从Authorization Header提取Token");
            return authHeader.substring(7);
        }

        // 方式2：从查询参数中提取（用于浏览器 WebSocket API）
        String query = request.getURI().getQuery();
        if (query != null && query.contains("token=")) {
            int start = query.indexOf("token=") + 6;
            int end = query.indexOf("&", start);
            String token = (end == -1) ? query.substring(start) : query.substring(start, end);
            log.debug("✅ 从查询参数提取Token");
            return token;
        }

        // 方式3：从 Cookie 中提取（如果使用 SockJS）
        if (request instanceof ServletServerHttpRequest) {
            HttpServletRequest servletRequest = ((ServletServerHttpRequest) request).getServletRequest();
            Cookie[] cookies = servletRequest.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("auth_token".equals(cookie.getName()) || "token".equals(cookie.getName())) {
                        log.debug("✅ 从Cookie提取Token");
                        return cookie.getValue();
                    }
                }
            }
        }

        log.warn("⚠️ 未找到JWT Token（Header、查询参数、Cookie均无）");
        return null;
    }
}

