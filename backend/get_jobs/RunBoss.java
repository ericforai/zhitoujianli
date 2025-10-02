import boss.Boss;

/**
 * 独立的Boss任务运行器
 * 用于避免Spring Boot主类冲突
 */
public class RunBoss {
    public static void main(String[] args) {
        System.out.println("=== Boss独立任务启动 ===");
        System.out.println("启动时间: " + new java.util.Date());
        
        try {
            // 设置日志文件名
            System.setProperty("log.name", "boss");
            
            // 直接调用Boss.main方法
            Boss.main(args);
            
            System.out.println("=== Boss任务执行完成 ===");
        } catch (Exception e) {
            System.err.println("Boss任务执行失败: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
