package config;

import controller.BossWebSocketController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket配置类
 * 用于配置Boss投递的WebSocket通信
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private BossWebSocketController bossWebSocketController;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // 注册Boss投递WebSocket处理器
        registry.addHandler(bossWebSocketController, "/ws/boss-delivery")
                .setAllowedOrigins("*") // 生产环境应该限制具体域名
                .withSockJS(); // 支持SockJS降级
    }
}
