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
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private Map<String, Object> validateTokenAndGetUser(String token) {
        try {
            log.debug("使用Authing Java SDK V3 AuthenticationClient验证token");
            
            // 使用V3版本的introspectToken方法进行真实验证
            try {
                Object result = authenticationClient.introspectToken(token);
                
                if (result != null) {
                    log.debug("Token验证成功，返回结果类型: {}", result.getClass().getName());
                    log.debug("Token验证成功，返回结果: {}", result.toString());
                    
                    // 暂时返回基础的用户信息，说明token验证成功
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("userId", "authing_verified_user");
                    userInfo.put("tokenValid", true);
                    userInfo.put("verificationMethod", "Authing V3 SDK");
                    userInfo.put("rawResult", result.toString());
                    
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