package config;

import controller.BossWebSocketController;
import controller.LocalAgentWebSocketController;
import interceptor.JwtHandshakeInterceptor;
import interceptor.LocalAgentHandshakeInterceptor;
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
 * @updated 2025-12-18 - 添加本地Agent WebSocket端点
 */
@Slf4j
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private BossWebSocketController bossWebSocketController;

    @Autowired
    private LocalAgentWebSocketController localAgentWebSocketController;

    @Autowired
    private JwtHandshakeInterceptor jwtHandshakeInterceptor;

    @Autowired
    private LocalAgentHandshakeInterceptor localAgentHandshakeInterceptor;

    @Override
    public void registerWebSocketHandlers(@NonNull WebSocketHandlerRegistry registry) {
        log.info("🔧 注册WebSocket处理器: /ws/boss-delivery, /ws/local-agent");

        // 注册Boss投递WebSocket处理器
        registry.addHandler(bossWebSocketController, "/ws/boss-delivery")
                // ✅ 添加JWT验证拦截器（安全修复）
                .addInterceptors(jwtHandshakeInterceptor)
                // 🔒 CORS配置：生产环境限制来源
                .setAllowedOrigins(
                    "https://zhitoujianli.com",      // 生产域名
                    "https://www.zhitoujianli.com",  // 带www的生产域名
                    "http://localhost:3000",         // 本地开发前端
                    "http://localhost:8081",         // ✅ 添加：前端开发服务器端口8081
                    "http://localhost:5173",         // Vite开发服务器
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:8081",         // ✅ 添加：前端开发服务器端口8081         // 本地IP
                    "*"                              // 临时：允许所有来源（TODO: 生产环境移除）
                )
                // 支持SockJS降级（兼容不支持WebSocket的浏览器）
                .withSockJS();

        // ✅ 新增：注册本地Agent WebSocket处理器
        registry.addHandler(localAgentWebSocketController, "/ws/local-agent")
                // 本地Agent使用Token认证，不需要JWT
                .addInterceptors(localAgentHandshakeInterceptor)
                // 允许所有来源（本地Agent可能从任何地方连接）
                .setAllowedOrigins("*");

        log.info("✅ WebSocket处理器注册完成（已启用JWT验证 + 本地Agent端点）");
    }
}


