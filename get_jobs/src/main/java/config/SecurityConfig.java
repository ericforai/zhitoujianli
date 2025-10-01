package config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import security.JwtAuthenticationFilter;

/**
 * Spring Security配置类
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Autowired
    private Dotenv dotenv;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // 从.env文件中读取安全开关配置
        boolean securityEnabled = Boolean.parseBoolean(dotenv.get("SECURITY_ENABLED", "true"));
        http
            // 禁用CSRF，因为使用JWT
            .csrf(csrf -> csrf.disable())
            
            // 配置会话管理为无状态
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
            
        if (!securityEnabled) {
            // 如果安全认证被禁用，允许所有请求
            http.authorizeHttpRequests(authz -> authz
                .anyRequest().permitAll()
            );
        } else {
            // 配置授权规则（启用安全认证时）
            http.authorizeHttpRequests(authz -> authz
                // 允许访问的公开端点
                .requestMatchers(
                    "/",              // 首页公开访问
                    "/api/auth/**",
                    "/login",
                    "/register", 
                    "/favicon.ico",
                    "/static/**",
                    "/css/**",
                    "/js/**",
                    "/images/**",
                    "/.well-known/**",
                    "/about",         // 关于页面
                    "/contact",       // 联系页面
                    "/help"           // 帮助页面
                ).permitAll()
                
                // 需要认证的API端点
                .requestMatchers(
                    "/api/jobs/**",
                    "/api/user/**",
                    "/api/resume/**",
                    "/dashboard/**",
                    "/profile/**"
                ).authenticated()
                
                // 其他请求默认允许访问
                .anyRequest().permitAll()
            )
            
            // 添加JWT过滤器
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        }

        return http.build();
    }
}