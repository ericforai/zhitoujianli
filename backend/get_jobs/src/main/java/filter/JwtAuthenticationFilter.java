package filter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import config.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

/**
 * JWT认证过滤器
 * 从请求中提取JWT Token，验证并设置用户上下文
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-13
 */
@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtConfig jwtConfig;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            // 1. 从请求中提取Token
            String token = extractToken(request);

            if (token != null) {
                // 2. 验证并解析Token
                Claims claims = Jwts.parser()
                        .setSigningKey(jwtConfig.getJwtSecret().getBytes(StandardCharsets.UTF_8))
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                // 3. 提取用户信息
                String userId = claims.getSubject();
                String email = claims.get("email", String.class);
                String username = claims.get("username", String.class);

                // 4. 构建用户信息Map
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("userId", userId);
                userInfo.put("email", email);
                userInfo.put("username", username);

                // 5. 设置到Spring Security Context
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userInfo, null, null);
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("✅ JWT认证成功: userId={}, email={}", userId, email);

                // 6. ✅ 自动迁移用户数据（如果需要）
                try {
                    if (util.UserDataPathUtil.hasLegacyDataToMigrate()) {
                        log.info("🔄 检测到旧格式用户数据，开始自动迁移: userId={}", userId);
                        util.UserDataMigrationUtil.MigrationResult result = util.UserDataMigrationUtil.migrateCurrentUserData();
                        log.info("✅ 用户数据迁移结果: {}", result);
                    }
                } catch (Exception e) {
                    log.warn("⚠️ 用户数据迁移失败（不影响正常使用）: {}", e.getMessage());
                }
            } else {
                log.debug("⚠️  未找到JWT Token，使用匿名访问");
            }

        } catch (Exception e) {
            log.warn("❌ JWT认证失败: {}", e.getMessage());
            // 认证失败不阻断请求，继续使用匿名访问
        }

        // 继续过滤器链
        filterChain.doFilter(request, response);
    }

    /**
     * 从请求中提取JWT Token
     * 优先级：Header > Cookie
     */
    private String extractToken(HttpServletRequest request) {
        // 1. 从Authorization Header中提取
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // 2. 从Cookie中提取
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("auth_token".equals(cookie.getName()) || "token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        return null;
    }
}

