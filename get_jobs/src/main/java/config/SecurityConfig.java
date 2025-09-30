package config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import security.JwtAuthenticationFilter;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security安全配置
 * 
 * 配置说明：
 * 1. 禁用CSRF（因为是RESTful API）
 * 2. 启用CORS（允许前端跨域访问）
 * 3. 无状态会话（使用JWT，不使用Session）
 * 4. 配置哪些接口需要认证，哪些可以公开访问
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * 配置安全过滤链
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 禁用CSRF保护（API项目不需要）
            .csrf(csrf -> csrf.disable())
            
            // 配置CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 无状态会话管理（使用JWT，不使用Session）
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 配置URL访问权限
            .authorizeHttpRequests(auth -> auth
                // ========== 公开访问的接口（无需登录） ==========
                .requestMatchers(
                    // 认证相关接口
                    "/api/auth/**",
                    
                    // 静态资源
                    "/",
                    "/login",
                    "/register",
                    "/static/**",
                    "/favicon.ico",
                    "/index.html",
                    
                    // 健康检查
                    "/actuator/health",
                    
                    // 前端页面（暂时开放，后续可根据需要调整）
                    "/resume-parser",
                    "/resume-manager"
                ).permitAll()
                
                // ========== 需要认证的接口 ==========
                // 所有API接口都需要登录
                .requestMatchers("/api/**").authenticated()
                
                // 后台管理接口需要登录
                .requestMatchers(
                    "/save-config",
                    "/start-program",
                    "/stop-program",
                    "/status",
                    "/logs/**"
                ).authenticated()
                
                // 其他所有请求都需要认证
                .anyRequest().authenticated()
            )
            
            // 添加JWT认证过滤器
            .addFilterBefore(jwtAuthenticationFilter(), 
                UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    /**
     * JWT认证过滤器
     */
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    /**
     * CORS配置
     * 允许前端跨域访问后端API
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 允许的源（前端地址）
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",      // React开发服务器
            "http://localhost:8080",      // Web UI
            "http://localhost:4321",      // Astro博客
            "https://yourdomain.com"      // 生产环境域名
        ));
        
        // 允许的HTTP方法
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));
        
        // 允许的请求头
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept"
        ));
        
        // 允许发送Cookie
        configuration.setAllowCredentials(true);
        
        // 预检请求的缓存时间（秒）
        configuration.setMaxAge(3600L);
        
        // 暴露的响应头
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Disposition"
        ));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
