package security;

import cn.authing.sdk.java.client.AuthenticationClient;
import cn.authing.sdk.java.dto.GetProfileDto;
import cn.authing.sdk.java.dto.UserSingleRespDto;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * JWT认证过滤器
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${authing.appHost}")
    private String appHost;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) 
            throws ServletException, IOException {
        
        try {
            String token = getJwtFromRequest(request);
            
            if (token != null && !token.isEmpty()) {
                if (validateToken(token)) {
                    setAuthentication(request, token);
                }
            }
        } catch (Exception e) {
            log.error("JWT认证异常", e);
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

    private boolean validateToken(String token) {
        try {
            cn.authing.sdk.java.model.AuthenticationClientOptions options = 
                new cn.authing.sdk.java.model.AuthenticationClientOptions();
            options.setAccessToken(token);
            options.setAppHost(appHost);
            
            AuthenticationClient client = new AuthenticationClient(options);
            GetProfileDto dto = new GetProfileDto();
            UserSingleRespDto user = client.getProfile(dto);
            
            return user != null && user.getData() != null;
        } catch (Exception e) {
            log.debug("Token验证失败: {}", e.getMessage());
            return false;
        }
    }

    private void setAuthentication(HttpServletRequest request, String token) {
        try {
            cn.authing.sdk.java.model.AuthenticationClientOptions options = 
                new cn.authing.sdk.java.model.AuthenticationClientOptions();
            options.setAccessToken(token);
            options.setAppHost(appHost);
            
            AuthenticationClient client = new AuthenticationClient(options);
            GetProfileDto dto = new GetProfileDto();
            UserSingleRespDto userResp = client.getProfile(dto);
            
            if (userResp != null && userResp.getData() != null) {
                var userData = userResp.getData();
                
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        userData,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                    );
                
                authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request));
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("✅ 用户认证成功: userId={}", userData.getUserId());
            }
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