package config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 配置 - 禁用所有安全检查
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()  // 允许所有请求
            )
            .csrf(csrf -> csrf.disable())  // 禁用CSRF
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()));  // 禁用Frame Options
        
        return http.build();
    }
}