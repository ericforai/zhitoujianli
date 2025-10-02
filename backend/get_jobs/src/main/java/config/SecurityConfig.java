package config;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.servlet.http.HttpServletResponse;
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
            
            // 配置CORS，允许前端访问
            .cors(cors -> cors.configurationSource(request -> {
                var corsConfig = new org.springframework.web.cors.CorsConfiguration();
                corsConfig.setAllowedOriginPatterns(java.util.Arrays.asList(
                    "http://localhost:3000", 
                    "http://localhost:3001", 
                    "http://localhost:4321", 
                    "http://127.0.0.1:3000",
                    "https://zhitoujianli.com",
                    "https://www.zhitoujianli.com",
                    "https://*.zhitoujianli.com",
                    "https://*.edgeone.app"
                ));
>>>>>>> e851d76 (🌐 域名部署配置：生产环境完整适配)
                corsConfig.setAllowedOriginPatterns(java.util.Arrays.asList(
                    "http://localhost:3000", 
                    "http://localhost:3001", 
                    "http://localhost:4321", 
                    "http://127.0.0.1:3000",
                    "https://zhitoujianli.com",
                    "https://www.zhitoujianli.com",
                    "https://*.zhitoujianli.com",
                    "https://*.edgeone.app"
                ));
=======
                corsConfig.setAllowedOriginPatterns(java.util.Arrays.asList(
                    "http://localhost:3000", 
                    "http://localhost:3001", 
                    "http://localhost:4321", 
                    "http://127.0.0.1:3000",
                    "https://zhitoujianli.com",
                    "https://www.zhitoujianli.com",
                    "https://*.zhitoujianli.com",
                    "https://*.edgeone.app"
                ));
>>>>>>> e851d76 (🌐 域名部署配置：生产环境完整适配)
                corsConfig.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                corsConfig.setAllowedHeaders(java.util.Arrays.asList("*"));
                corsConfig.setAllowCredentials(true);
                corsConfig.setMaxAge(3600L);
                return corsConfig;
            }))
            
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
                    "/api/auth/**",
                    "/api/status",       // 公开API状态接口
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
                    "/help",          // 帮助页面
                    "/resume-manager", // 简历管理页面
                    "/resume-parser"  // 简历解析页面
                ).permitAll()
                
                // 需要认证的API端点和后台管理页面
                .requestMatchers(
                    "/",              // 后台管理首页需要认证
                    "/api/jobs/**",
                    "/api/user/**",
                    "/api/resume/**",
                    "/api/config",      // 用户配置API
                    "/api/ai-config",   // 用户AI配置API
                    "/api/resume",      // 用户简历API
                    "/dashboard/**",
                    "/profile/**",
                    "/save-config",
                    "/start-program",
                    "/stop-program",
                    "/start-boss-task", // 启动Boss投递任务
                    "/status",
                    "/logs"
                ).authenticated()
                
                // 其他请求默认需要认证
                .anyRequest().authenticated()
            )
            
            // 配置未授权时的处理
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    // 检查请求是否为AJAX请求
                    String requestedWith = request.getHeader("X-Requested-With");
                    String acceptHeader = request.getHeader("Accept");
                    
                    if ("XMLHttpRequest".equals(requestedWith) || 
                        (acceptHeader != null && acceptHeader.contains("application/json"))) {
                        // AJAX请求返回JSON错误
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setContentType("application/json;charset=UTF-8");
                        response.getWriter().write(
                            "{\"success\":false,\"message\":\"需要登录认证\",\"redirectTo\":\"https://zhitoujianli.com/login\"}"
                        );
                    } else {
                        // 浏览器请求重定向到首页登录
                        response.sendRedirect("https://zhitoujianli.com/login");
                    }
                })
            )
            
            // 添加JWT过滤器
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        }

        return http.build();
    }
}