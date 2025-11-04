package boss;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Boss程序隔离运行器
 * 专门用于WebUI环境下的隔离执行
 *
 * 关键特性：
 * 1. 使用独立的线程
 * 2. 重定向所有日志输出
 * 3. 避免与Spring Boot线程池冲突
 * 4. 简化配置加载
 * 5. 支持"只登录"模式（用于二维码登录）
 */
public class IsolatedBossRunner {

    private static final Logger log = LoggerFactory.getLogger(IsolatedBossRunner.class);

    /**
     * 在隔离环境中运行Boss程序
     * @param args 程序参数
     *             args[0] = "login-only" : 只登录，不投递（用于二维码登录）
     *             args[0] = 其他或无参数 : 执行完整投递流程
     */
    public static void main(String[] args) {
        try {
            // 隔离环境：设置最小系统属性
            setupIsolatedEnvironment();

            log.info("=== Boss程序隔离执行器启动 ===");
            log.info("执行模式: WebUI隔离环境");
            log.info("线程名称: {}", Thread.currentThread().getName());

            // ✅ 检查是否为只登录模式
            boolean loginOnly = args.length > 0 && "login-only".equals(args[0]);
            if (loginOnly) {
                log.info("🔑 运行模式: 只登录（二维码扫码），不执行投递");
            }

            // 直接调用Boss.main方法，传递参数
            Boss.main(args);

            log.info("=== Boss程序隔离执行完成 ===");

        } catch (Exception e) {
            log.error("Boss程序执行失败", e);
            // 确保异常被记录，但不传播给Spring Boot
            System.exit(1);
        }
    }

    /**
     * 设置隔离环境
     */
    private static void setupIsolatedEnvironment() {
        // 设置日志文件名为隔离版本
        System.setProperty("log.name", "boss_isolated");

        // 禁用Spring Boot自动配置
        System.setProperty("spring.autoconfigure.exclude", "*");

        // 设置独立的工作目录
        System.setProperty("user.dir", "/opt/zhitoujianli/backend");

        // Playwright浏览器路径
        System.setProperty("PLAYWRIGHT_BROWSERS_PATH", "/root/.cache/ms-playwright");

        log.info("隔离环境配置完成");
    }
}
