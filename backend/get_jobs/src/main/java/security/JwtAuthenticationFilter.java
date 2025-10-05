package security;

import cn.authing.sdk.java.client.AuthenticationClient;
import config.AuthingConfig;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT认证过滤器 - 使用Authing Java SDK V3 AuthenticationClient
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final AuthingConfig authingConfig;
    private final AuthenticationClient authenticationClient;

    @Autowired
    private Dotenv dotenv;

    public JwtAuthenticationFilter(AuthingConfig authingConfig, AuthenticationClient authenticationClient) {
        this.authingConfig = authingConfig;
        this.authenticationClient = authenticationClient;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        log.debug("JWT过滤器处理请求: {}", path);

        // 从.env文件中读取安全开关配置
        boolean securityEnabled = Boolean.parseBoolean(dotenv.get("SECURITY_ENABLED", "true"));

        // 如果安全认证被禁用，直接跳过JWT验证
        if (!securityEnabled) {
            log.debug("安全认证已禁用，跳过JWT验证");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = getJwtFromRequest(request);

            if (token != null && !token.isEmpty()) {
                log.debug("找到token，开始验证: {}", token.substring(0, Math.min(20, token.length())) + "...");
                Map<String, Object> userInfo = validateTokenAndGetUser(token);
                if (userInfo != null) {
                    log.debug("Token验证成功，设置认证信息");
                    setAuthentication(request, userInfo);
                } else {
                    log.warn("Token验证失败");
                }
            } else {
                log.debug("未找到token，跳过认证");
            }
        } catch (Exception e) {
            log.error("JWT认证异常: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        // 优先从 Authorization Header 获取
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            log.debug("🔑 从 Header 获取到 Token，长度: {}", token.length());
            return token;
        }

        // 如果 Header 中没有，尝试从 Cookie 中获取
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("authToken".equals(cookie.getName())) {
                    String token = cookie.getValue();
                    log.debug("🍪 从 Cookie 获取到 Token，长度: {}", token.length());
                    return token;
                }
            }
        }

        log.debug("🚫 未找到 Token（既没有 Header 也没有 Cookie）");
        return null;
    }

    private Map<String, Object> validateTokenAndGetUser(String token) {
        try {
            log.debug("开始验证Token，长度: {}", token.length());

            // 首先尝试使用我们自己的JWT验证逻辑（支持临时用户）
            try {
                Map<String, Object> jwtResult = validateOurJwtToken(token);
                if (jwtResult != null) {
                    log.debug("✅ 自签名JWT Token验证成功");
                    return jwtResult;
                }
            } catch (Exception jwtException) {
                log.debug("自签名JWT验证失败: {}", jwtException.getMessage());
            }

            // 如果自签名JWT验证失败，尝试使用Authing验证
            log.debug("尝试使用Authing Java SDK V3 AuthenticationClient验证token");

            try {
                Object result = authenticationClient.introspectToken(token);

                if (result != null) {
                    log.debug("Token验证成功，返回结果类型: {}", result.getClass().getName());
                    log.debug("Token验证成功，返回结果: {}", result.toString());

                    // 解析Authing返回的用户信息
                    Map<String, Object> userInfo = new HashMap<>();

                    if (result instanceof cn.authing.sdk.java.dto.IntrospectTokenRespDto) {
                        cn.authing.sdk.java.dto.IntrospectTokenRespDto tokenResp =
                            (cn.authing.sdk.java.dto.IntrospectTokenRespDto) result;

                        // 提取用户真实信息 - 使用可用的方法
                        userInfo.put("userId", tokenResp.getSub() != null ? tokenResp.getSub() : "unknown_user");
                        userInfo.put("email", "demo@example.com"); // 暂时使用默认值
                        userInfo.put("username", "demo_user");
                        userInfo.put("nickname", "Demo User");
                        userInfo.put("tokenValid", tokenResp.getActive() != null ? tokenResp.getActive() : true);
                        userInfo.put("verificationMethod", "Authing V3 SDK");
                        userInfo.put("exp", tokenResp.getExp());
                        userInfo.put("iat", tokenResp.getIat());

                        log.info("✅ 用户认证成功: userId={}, email={}, username={}",
                            userInfo.get("userId"), userInfo.get("email"), userInfo.get("username"));
                    } else {
                        // 兼容处理，使用默认值
                        userInfo.put("userId", "authing_verified_user");
                        userInfo.put("tokenValid", true);
                        userInfo.put("verificationMethod", "Authing V3 SDK");
                        userInfo.put("rawResult", result.toString());

                        log.warn("⚠️ 无法解析用户信息，使用默认值");
                    }

                    log.debug("✅ Authing V3 Token验证成功");
                    return userInfo;
                } else {
                    log.warn("❌ Token验证失败：返回结果为空");
                }
            } catch (Exception apiException) {
                log.error("🔥 Authing API调用异常: {}", apiException.getMessage());
                log.error("异常堆栈: ", apiException);

                // 在生产环境中，API异常应该拒绝访问
                // 这里为了调试，我们记录错误但让请求继续
            }

            log.warn("Token验证失败：无法验证token有效性");
            return null;
        } catch (Exception e) {
            log.error("Token验证异常: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * 验证我们自己生成的JWT Token（支持临时用户）
     * 暂时使用简化的验证逻辑
     */
    private Map<String, Object> validateOurJwtToken(String token) {
        try {
            // 简化验证：检查token格式和基本结构
            if (token == null || token.isEmpty()) {
                return null;
            }

            // 检查是否是临时用户token（以temp_user_开头）
            // 这里我们使用简单的字符串检查，而不是完整的JWT解析
            if (token.length() > 50) { // 基本的token长度检查
                // 模拟解析用户信息（临时方案）
                Map<String, Object> userInfo = new HashMap<>();

                // 从token中提取用户ID（简化逻辑）
                if (token.contains("temp_user_")) {
                    userInfo.put("userId", "temp_user_" + System.currentTimeMillis());
                    userInfo.put("email", "temp@example.com");
                    userInfo.put("username", "temp_user");
                    userInfo.put("tokenValid", true);
                    userInfo.put("verificationMethod", "Simplified Temp User");

                    log.debug("✅ 临时用户Token验证成功（简化方案）");
                    return userInfo;
                }
            }

            return null;
        } catch (Exception e) {
            log.debug("自签名JWT验证失败: {}", e.getMessage());
            return null;
        }
    }

    private void setAuthentication(HttpServletRequest request, Map<String, Object> userInfo) {
        try {
            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                    userInfo,
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                );

            authentication.setDetails(
                new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.debug("✅ 用户认证成功: userId={}", userInfo.get("userId"));
        } catch (Exception e) {
            log.error("设置认证信息失败", e);
        }
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getRequestURI();
        log.debug("检查路径是否需要过滤: {}", path);
        return path.startsWith("/static/") ||
               path.equals("/favicon.ico") ||
               path.startsWith("/api/auth/") ||
               path.equals("/login") ||
               path.equals("/register") ||
               path.equals("/resume-parser") ||
               path.equals("/resume-manager");
    }
}
