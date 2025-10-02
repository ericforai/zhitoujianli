package config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Spring Boot线程池配置
 * 为Boss程序创建专属的执行线程池，避免与Spring默认线程池冲突
 */
@Configuration
public class ThreadPoolConfig {
    
    /**
     * Boss程序专用线程池
     * 使用独立的线程池避免与Spring Boot默认线程池冲突
     */
    @Bean(name = "bossExecutor")
    public Executor bossExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // 核心线程数 - 只处理单个Boss任务
        executor.setCorePoolSize(1);
        // 最大线程数 - 限制并发，避免资源争用
        executor.setMaxPoolSize(1);
        // 队列容量 - 不排队，拒绝多余任务
        executor.setQueueCapacity(1);
        // 线程名称前缀
        executor.setThreadNamePrefix("BossExecutor-%d");
        // 线程空闲超时时间
        executor.setKeepAliveSeconds(60);
        // 等待所有任务完成再关闭线程池
        executor.setWaitForTasksToCompleteOnShutdown(true);
        // 等待时间
        executor.setAwaitTerminationSeconds(30);
        
        // 拒绝策略：由调用线程执行任务
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        
        // 初始化
        executor.initialize();
        
        return executor;
    }
    
    /**
     * WebUI异步执行使用的线程池
     * 与Boss线程池完全隔离
     */
    @Bean(name = "webUIExecutor") 
    public Executor webUIExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("WebUIExecutor-%d");
        executor.setKeepAliveSeconds(120);
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        
        // 拒绝策略：丢弃最老的任务
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.DiscardOldestPolicy());
        
        executor.initialize();
        
        return executor;
    }
}
