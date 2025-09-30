package security;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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

    private static final Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
    private final String appHost = dotenv.get("AUTHING_APP_HOST", "https://your-domain.authing.cn");
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) 
            throws ServletException, IOException {
        
        try {
            String token = getJwtFromRequest(request);
            
            if (token != null && !token.isEmpty()) {
                Map<String, Object> userInfo = validateTokenAndGetUser(token);
                if (userInfo != null) {
                    setAuthentication(request, userInfo);
                }
            }
        } catch (Exception e) {
            log.debug("JWT认证失败", e);
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
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<String> entity = new HttpEntity<>("{}", headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, Map.class);
            
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.get("data") != null) {
                return (Map<String, Object>) responseBody.get("data");
            }
            
            return null;
        } catch (Exception e) {
            log.debug("Token验证失败: {}", e.getMessage());
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
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/static/") || 
               path.equals("/favicon.ico") ||
               path.startsWith("/api/auth/");
    }
}