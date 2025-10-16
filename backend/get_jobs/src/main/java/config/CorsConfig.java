package config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * CORS跨域配置
 *
 * 修复 CORS 报错问题：
 * - 明确允许 www.zhitoujianli.com 和 zhitoujianli.com 域名
 * - 支持 HTTPS 生产环境和 HTTP 开发环境
 * - 修复 allowCredentials + 通配符 的浏览器限制问题
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 * @updated 2025-10-16
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 允许的源（明确列出，修复 allowCredentials + 通配符的浏览器限制）
        configuration.setAllowedOrigins(Arrays.asList(
            // 生产环境 - HTTPS
            "https://www.zhitoujianli.com",
            "https://zhitoujianli.com",
            // 开发环境 - HTTP
            "http://localhost:3000",
            "http://localhost:8080",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8080",
            // IP 访问
            "http://115.190.182.95",
            "http://115.190.182.95:3000",
            "http://115.190.182.95:8080"
        ));

        // 允许的HTTP方法
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
        ));

        // 允许的请求头
        configuration.setAllowedHeaders(Arrays.asList(
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));

        // 暴露的响应头
        configuration.setExposedHeaders(Arrays.asList(
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials",
            "Authorization"
        ));

        // 允许发送认证信息（Cookie、Authorization header）
        configuration.setAllowCredentials(true);

        // 预检请求的缓存时间（1小时）
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
