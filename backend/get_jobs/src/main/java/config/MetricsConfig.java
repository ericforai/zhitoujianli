package config;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.binder.MeterBinder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 监控指标配置
 * 配置Micrometer和Prometheus
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-03
 */
@Slf4j
@Configuration
public class MetricsConfig {

    /**
     * 添加全局标签
     * 所有指标都会包含这些标签
     */
    @Bean
    public MeterRegistryCustomizer<MeterRegistry> metricsCommonTags() {
        log.info("📊 配置Micrometer全局标签");

        return registry -> registry.config()
            .commonTags(
                "application", "zhitoujianli",
                "service", "backend",
                "environment", System.getProperty("spring.profiles.active", "production")
            );
    }

    /**
     * 自定义业务指标
     */
    @Bean
    public MeterBinder customBusinessMetrics() {
        return registry -> {
            log.info("📊 注册自定义业务指标");

            // 这些指标会在应用启动时注册
            // 实际数值由各个服务和切面更新
        };
    }
}






