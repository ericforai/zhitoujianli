package config;

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
import org.springframework.web.cors.CorsConfigurationSource;

import filter.JwtAuthenticationFilter;
import io.github.cdimascio.dotenv.Dotenv;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

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
        // 🔒 强制启用安全认证（忽略环境变量，防止误配置）
        // ⚠️ v2.2.0 安全升级：多租户隔离要求 Security 永久启用
        boolean securityEnabledFromEnv = Boolean.parseBoolean(dotenv.get("SECURITY_ENABLED", "true"));

        if (!securityEnabledFromEnv) {
            log.error("❌❌❌ 致命错误：检测到 SECURITY_ENABLED=false");
            log.error("❌ 多租户系统禁止关闭安全认证！");
            log.error("❌ 强制覆盖为 SECURITY_ENABLED=true");
        }

        // 🔒 强制启用（不受环境变量控制）
        final boolean securityEnabled = true;
        log.info("✅ Spring Security 已强制启用 (securityEnabled={}，环境变量值={}, 已忽略)",
                 securityEnabled, securityEnabledFromEnv);

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
                // 🔧 重要：行为记录API必须在/api/admin/**之前配置，否则会被覆盖
                // 这是后台Boss进程调用的接口，需要无认证访问
                .requestMatchers("/api/admin/behavior/log").permitAll()

                // 公开访问的端点（⚠️ 多租户模式 - 最小化公开端点）
                .requestMatchers(
                    "/api/auth/**",          // 认证接口
                    "/api/admin/auth/**",    // 🔧 管理员认证接口（必须公开访问）
                    "/api/boss/**",          // Boss投递接口（登录、二维码等）
                    // ❌ 移除："/api/delivery/**" - 多租户模式必须认证！
                    // ❌ 移除："/api/config" - 多租户模式必须认证！
                    // ❌ 移除："/api/candidate-resume/**" - 多租户模式必须认证！
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
                    "/simple-status",
                    "/logs",
                    "/api/test/email/**"        // 🧪 测试邮件接口（仅用于测试，生产环境应移除）
                ).permitAll()

                // 需要认证的端点（⚠️ 多租户模式 - 所有数据操作需认证）
                .requestMatchers(
                    "/api/delivery/**",                     // 投递配置接口（多租户核心）
                    "/api/candidate-resume/**",             // 简历管理接口（多租户核心）
                    "/api/user/plan/**",                    // 用户套餐和配额接口
                    "/api/config",                          // 用户配置
                    "/api/ai-config",                       // AI配置
                    "/api/resume",                          // 简历
                    "/api/resume/history",                  // ✅ 简历历史记录（需要认证）
                    "/api/resume/history/**",                // ✅ 简历历史记录详情（需要认证）
                    "/api/admin/**",                        // 🔧 管理后台API（需要认证，/api/admin/behavior/log已在上面单独配置）
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
                    String requestPath = request.getRequestURI();

                    // 🔧 修复：API请求（/api/**）统一返回401 JSON，不重定向
                    // 这样可以避免302重定向导致的CORS错误
                    if (requestPath.startsWith("/api/") ||
                        "XMLHttpRequest".equals(requestedWith) ||
                        (acceptHeader != null && acceptHeader.contains("application/json"))) {
                        // API请求或AJAX请求返回JSON
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
