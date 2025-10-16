package boss;

import java.io.File;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Boss程序独立运行器，用于WebUI调用
 */
public class BossRunner {

    private static final Logger log = LoggerFactory.getLogger(BossRunner.class);

    /**
     * 独立运行Boss程序，输出到指定日志文件
     */
    public static void runBossProgram(String logFilePath) {
        try {
            // 创建日志文件
            File logFile = new File(logFilePath);
            PrintWriter logWriter = new PrintWriter(new FileWriter(logFile, true, StandardCharsets.UTF_8));

            // 自定义日志输出
            logWriter.println("=== Boss任务启动 ===");
            logWriter.println(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()) + " - Boss程序开始执行");
            logWriter.flush();

            try {
                // 直接调用Boss.main方法
                logWriter.println(new SimpleDateFormat("HH:mm:ss").format(new Date()) + " - Boss程序开始执行...");
                logWriter.flush();

                Boss.main(new String[]{});

                logWriter.println(new SimpleDateFormat("HH:mm:ss").format(new Date()) + " - Boss程序执行完成");

            } catch (Exception e) {
                logWriter.println(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()) + " - Boss程序执行异常: " + e.getMessage());
                e.printStackTrace(logWriter);
                log.error("Boss程序执行异常", e);
            } finally {
                logWriter.println(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()) + " - Boss任务结束");
                logWriter.close();
            }

        } catch (Exception e) {
            log.error("BossRunner执行失败", e);
        }
    }

    /**
     * 主方法，供WebUI调用
     */
    public static void main(String[] args) {
        if (args.length > 0) {
            runBossProgram(args[0]);
        } else {
            // 默认运行Boss程序
            Boss.main(args);
        }
    }
}
