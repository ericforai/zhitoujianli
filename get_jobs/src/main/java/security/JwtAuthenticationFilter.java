package security;

import cn.authing.sdk.java.client.AuthenticationClient;
import cn.authing.sdk.java.dto.UserSingleRespDto;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
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
 * 工作流程：
 * 1. 从请求头中提取JWT Token
 * 2. 验证Token的有效性
 * 3. 如果有效，设置Spring Security上下文
 * 4. 放行请求
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) 
            throws ServletException, IOException {
        
        try {
            // 从请求头获取Token
            String token = getJwtFromRequest(request);
            
            if (token != null && !token.isEmpty()) {
                // 使用Authing验证Token
                if (validateToken(token)) {
                    // Token有效，设置认证信息到Spring Security上下文
                    setAuthentication(request, token);
                } else {
                    log.debug("Token验证失败，请求路径: {}", request.getRequestURI());
                }
            } else {
                log.debug("未找到Token，请求路径: {}", request.getRequestURI());
            }
        } catch (Exception e) {
            log.error("JWT认证过程中发生异常", e);
            // 不要阻止请求，让Spring Security处理未认证的情况
        }
        
        // 继续过滤链
        filterChain.doFilter(request, response);
    }

    /**
     * 从请求头中提取JWT Token
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        return null;
    }

    /**
     * 验证Token是否有效
     */
    private boolean validateToken(String token) {
        try {
            AuthenticationClient client = new AuthenticationClient();
            client.setAccessToken(token);
            
            // 尝试获取用户信息来验证Token
            UserSingleRespDto user = client.getProfile();
            
            return user != null && user.getData() != null;
        } catch (Exception e) {
            log.debug("Token验证失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 设置认证信息到Spring Security上下文
     */
    private void setAuthentication(HttpServletRequest request, String token) {
        try {
            AuthenticationClient client = new AuthenticationClient();
            client.setAccessToken(token);
            
            // 获取用户信息
            UserSingleRespDto userResp = client.getProfile();
            
            if (userResp != null && userResp.getData() != null) {
                var userData = userResp.getData();
                
                // 创建认证对象
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        userData,                                           // principal（用户主体）
                        null,                                               // credentials（凭证）
                        Collections.singletonList(                          // authorities（权限）
                            new SimpleGrantedAuthority("ROLE_USER")
                        )
                    );
                
                // 设置请求详情
                authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request));
                
                // 将认证信息设置到安全上下文
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                log.debug("用户认证成功: userId={}, email={}", 
                    userData.getUserId(), 
                    userData.getEmail());
            }
        } catch (Exception e) {
            log.error("设置认证信息失败", e);
        }
    }

    /**
     * 对于某些不需要认证的路径，可以跳过此过滤器
     * 提升性能
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        
        // 静态资源不需要过滤
        return path.startsWith("/static/") || 
               path.equals("/favicon.ico") ||
               path.equals("/index.html") ||
               path.startsWith("/api/auth/"); // 认证接口本身不需要验证Token
    }
}
