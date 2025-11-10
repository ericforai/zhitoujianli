package config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.servlet.http.HttpServletResponse;
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
            // 🔒 CSRF配置：API使用JWT，Web表单启用CSRF
            .csrf(csrf -> {
                if (securityEnabled) {
                    // 生产环境：对API禁用CSRF（使用JWT），对表单启用CSRF
                    csrf.ignoringRequestMatchers("/api/**", "/auth/**");
                } else {
                    // 开发环境：全部禁用
                    csrf.disable();
                }
            })

            // 🔒 配置CORS，严格限制允许的源
            .cors(cors -> cors.configurationSource(request -> {
                var corsConfig = new org.springframework.web.cors.CorsConfiguration();

                // 根据环境动态配置允许的源
                boolean isProduction = securityEnabled;
                if (isProduction) {
                    // 生产环境：仅允许官方域名
                    corsConfig.setAllowedOriginPatterns(java.util.Arrays.asList(
                        "https://zhitoujianli.com",
                        "https://www.zhitoujianli.com"
                    ));
                } else {
                    // 开发环境：允许本地开发端口
                    corsConfig.setAllowedOriginPatterns(java.util.Arrays.asList(
                        "http://localhost:3000",
                        "http://localhost:3001",
                        "http://localhost:4321",
                        "http://127.0.0.1:3000",
                        "https://zhitoujianli.com",
                        "https://www.zhitoujianli.com"
                    ));
                }

                corsConfig.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                // 🔒 明确指定允许的头部，避免使用 "*"
                corsConfig.setAllowedHeaders(java.util.Arrays.asList(
                    "Authorization",
                    "Content-Type",
                    "X-Requested-With",
                    "Accept",
                    "Origin",
                    "Access-Control-Request-Method",
                    "Access-Control-Request-Headers"
                ));
                corsConfig.setExposedHeaders(java.util.Arrays.asList("Authorization"));
                corsConfig.setAllowCredentials(true);
                corsConfig.setMaxAge(3600L);
                return corsConfig;
            }))

            // 配置会话管理为无状态
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 🔒 添加安全响应头
            .headers(headers -> headers
                .frameOptions(frame -> frame.deny()) // 防止Clickjacking
                .xssProtection(xss -> xss.headerValue("1; mode=block")) // XSS保护
                .contentSecurityPolicy(csp -> csp.policyDirectives(
                    "default-src 'self'; " +
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                    "font-src 'self' https://fonts.gstatic.com; " +
                    "img-src 'self' data: https:; " +
                    "connect-src 'self' https://zhitoujianli.com https://api.deepseek.com"
                ))
                .contentTypeOptions(content -> content.disable()) // 防止MIME类型嗅探
            );

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
                    "/api/delivery/**",  // 投递相关API需要认证
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
