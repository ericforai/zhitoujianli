package security;

import org.springframework.beans.factory.annotation.Value;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

/**
 * JWT认证过滤器 - 使用Authing REST API
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${AUTHING_APP_HOST:https://your-domain.authing.cn}")
    private String appHost;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, 
                                    @NonNull HttpServletResponse response, 
                                    @NonNull FilterChain filterChain) 
            throws ServletException, IOException {
        
        String path = request.getRequestURI();
        log.debug("JWT过滤器处理请求: {}", path);
        
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
            String url = appHost + "/api/v3/get-profile";
            log.debug("验证token，请求URL: {}", url);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<String> entity = new HttpEntity<>("{}", headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, Map.class);
            
            log.debug("Token验证响应状态: {}", response.getStatusCode());
            Map<String, Object> responseBody = response.getBody();
            log.debug("Token验证响应内容: {}", responseBody);
            
            if (responseBody != null && responseBody.get("data") != null) {
                log.debug("Token验证成功，返回用户信息");
                @SuppressWarnings("unchecked")
                Map<String, Object> userData = (Map<String, Object>) responseBody.get("data");
                return userData;
            }
            
            log.warn("Token验证失败：响应数据为空或无效");
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