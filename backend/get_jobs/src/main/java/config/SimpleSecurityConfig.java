package config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import filter.JwtAuthenticationFilter;
import io.github.cdimascio.dotenv.Dotenv;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@Slf4j
public class SimpleSecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private Dotenv dotenv;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // 从.env文件读取安全认证开关（支持多用户模式）
        boolean securityEnabled = Boolean.parseBoolean(dotenv.get("SECURITY_ENABLED", "false"));
        log.info("Spring Security配置: securityEnabled={} (从.env读取)", securityEnabled);

        http
            // 禁用CSRF，因为使用JWT
            .csrf(csrf -> csrf.disable())

            // 配置CORS - 使用注入的CorsConfig Bean
            .cors(cors -> cors.configurationSource(corsConfigurationSource))

            // 配置会话管理为无状态
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        if (!securityEnabled) {
            // 测试模式：允许所有请求（仅用于开发测试）
            http.authorizeHttpRequests(authz -> authz
                .anyRequest().permitAll()
            );
            log.info("🔓 Spring Security已禁用，允许所有请求");
        } else {
            // 生产模式：启用JWT认证
            http.authorizeHttpRequests(authz -> authz
                // 公开访问的端点
                .requestMatchers(
                    "/api/auth/**",          // 认证接口
                    "/api/boss/**",          // Boss投递接口（登录、二维码等）
                    "/api/delivery/**",      // 投递控制接口
                    "/api/config",           // 配置API（暂时公开，待JWT修复后可移除）
                    "/login",                // 登录页面
                    "/register",             // 注册页面
                    "/",                     // 管理后台首页
                    "/favicon.ico",
                    "/static/**",
                    "/css/**",
                    "/js/**",
                    "/images/**"
                ).permitAll()

                // 管理后台状态接口（允许无认证访问，用于监控）
                .requestMatchers(
                    "/status",
                    "/logs"
                ).permitAll()

                // 需要认证的端点
                .requestMatchers(
                    "/api/candidate-resume/**",             // 简历管理API
                    "/api/config",                          // 用户配置
                    "/api/ai-config",                       // AI配置
                    "/api/resume",                          // 简历
                    "/save-config",
                    "/start-program",
                    "/stop-program",
                    "/start-boss-task"
                ).authenticated()

                // 其他请求默认需要认证
                .anyRequest().authenticated()
            )

            // 配置未授权处理
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    String requestedWith = request.getHeader("X-Requested-With");
                    String acceptHeader = request.getHeader("Accept");

                    if ("XMLHttpRequest".equals(requestedWith) ||
                        (acceptHeader != null && acceptHeader.contains("application/json"))) {
                        // AJAX请求返回JSON
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setContentType("application/json;charset=UTF-8");
                        response.getWriter().write(
                            "{\"success\":false,\"message\":\"需要登录认证\",\"redirectTo\":\"/login\"}"
                        );
                    } else {
                        // 浏览器请求重定向到登录页
                        response.sendRedirect("/login");
                    }
                })
            )

            // 添加JWT过滤器
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        }

        return http.build();
    }
}
