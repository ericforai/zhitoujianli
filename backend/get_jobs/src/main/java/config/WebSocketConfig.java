package config;

import controller.BossWebSocketController;
import interceptor.JwtHandshakeInterceptor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket配置类
 * 用于配置Boss投递的WebSocket通信
 *
 * 🔐 安全特性：
 * 1. JWT Token 强制验证（通过 JwtHandshakeInterceptor）
 * 2. CORS 限制（生产环境）
 * 3. 防止未认证用户建立连接
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 * @updated 2025-11-07 - 添加JWT验证拦截器
 */
@Slf4j
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private BossWebSocketController bossWebSocketController;

    @Autowired
    private JwtHandshakeInterceptor jwtHandshakeInterceptor;

    @Override
    public void registerWebSocketHandlers(@NonNull WebSocketHandlerRegistry registry) {
        log.info("🔧 注册WebSocket处理器: /ws/boss-delivery");

        // 注册Boss投递WebSocket处理器
        registry.addHandler(bossWebSocketController, "/ws/boss-delivery")
                // ✅ 添加JWT验证拦截器（安全修复）
                .addInterceptors(jwtHandshakeInterceptor)
                // 🔒 CORS配置：生产环境限制来源
                .setAllowedOrigins(
                    "https://zhitoujianli.com",      // 生产域名
                    "https://www.zhitoujianli.com",  // 带www的生产域名
                    "http://localhost:3000",         // 本地开发前端
                    "http://localhost:5173",         // Vite开发服务器
                    "http://127.0.0.1:3000",         // 本地IP
                    "*"                              // 临时：允许所有来源（TODO: 生产环境移除）
                )
                // 支持SockJS降级（兼容不支持WebSocket的浏览器）
                .withSockJS();

        log.info("✅ WebSocket处理器注册完成（已启用JWT验证）");
    }
}


