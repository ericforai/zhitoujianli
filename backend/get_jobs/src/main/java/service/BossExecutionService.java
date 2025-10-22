package service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Boss程序执行服务 - 完全隔离的执行环境
 * 解决Spring Boot环境下的资源冲突问题
 */
@Service
public class BossExecutionService {

    private static final Logger log = LoggerFactory.getLogger(BossExecutionService.class);

    /**
     * 异步执行Boss程序 - 完全隔离模式
     * 使用独立的JVM进程避免线程和资源冲突
     */
    public CompletableFuture<Void> executeBossProgram(String logFilePath) {
        return executeBossProgram(logFilePath, false); // false=有头模式（用于调试投递问题）
    }

    /**
     * 异步执行Boss程序 - 完全隔离模式
     * @param logFilePath 日志文件路径
     * @param headless 是否使用无头模式
     */
    public CompletableFuture<Void> executeBossProgram(String logFilePath, boolean headless) {
        return CompletableFuture.runAsync(() -> {
            Process process = null;
            try {
                // 获取当前用户ID（支持多用户隔离）
                String userId = util.UserContextUtil.getCurrentUserId();
                userId = util.UserContextUtil.sanitizeUserId(userId);

                log.info("开始执行Boss程序，用户: {}, 隔离执行环境，头模式: {}", userId, headless ? "无头" : "有头");

                // 确保日志文件存在
                File logFile = new File(logFilePath);
                ensureLogFileExists(logFile);

                try (FileWriter logWriter = new FileWriter(logFile, StandardCharsets.UTF_8, true)) {

                    writeLogHeader(logWriter);

                    // 创建独立的Boss进程
                    ProcessBuilder pb = createIsolatedBossProcess(headless);

                    // 为Boss程序设置用户ID环境变量（多用户支持）
                    pb.environment().put("BOSS_USER_ID", userId);
                    log.info("📋 已设置Boss程序环境变量: BOSS_USER_ID={}", userId);

                    logWriter.write(formatTimestamp() + " - 启动独立Boss进程（用户: " + userId + "）...%n");
                    logWriter.flush();

                    // 启动进程
                    process = pb.start();
                    log.info("Boss进程已启动，PID: {}", process.pid());

                    // 使用CountDownLatch确保日志线程安全
                    CountDownLatch outputLatch = new CountDownLatch(1);
                    CountDownLatch errorLatch = new CountDownLatch(1);

                    // 启动日志捕获线程
                    final FileWriter finalLogWriter = logWriter;
                    Thread outputThread = createLogCaptureThread(
                        new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8)),
                        finalLogWriter, "OUT", outputLatch
                    );

                    Thread errorThread = createLogCaptureThread(
                        new BufferedReader(new InputStreamReader(process.getErrorStream(), StandardCharsets.UTF_8)),
                        finalLogWriter, "ERROR", errorLatch
                    );

                    outputThread.start();
                    errorThread.start();

                    // 等待进程完成，最长30分钟
                    boolean finished = process.waitFor(30, TimeUnit.MINUTES);

                    // 等待日志线程完成
                    outputLatch.await(5, TimeUnit.SECONDS);
                    errorLatch.await(5, TimeUnit.SECONDS);

                    if (!finished) {
                        logWriter.write(formatTimestamp() + " - WARNING: Boss程序超时未完成%n");
                        process.destroyForcibly();
                        log.error("Boss程序超时，强制终止");
                    } else {
                        int exitCode = process.exitValue();
                        logWriter.write(formatTimestamp() + " - Boss程序完成，退出码: " + exitCode + "%n");
                        log.info("Boss程序执行完成，退出码: {}", exitCode);
                    }

                } catch (Exception e) {
                    log.error("Boss程序执行异常", e);
                    writeErrorLog(logFilePath, e);
                } finally {
                    if (process != null) {
                        process.destroyForcibly();
                    }
                }

            } catch (Exception e) {
                log.error("Boss执行服务异常", e);
            }
        });
    }

    /**
     * 创建完全隔离的Boss进程
     * @param headless 是否使用无头模式
     */
    private ProcessBuilder createIsolatedBossProcess(boolean headless) throws IOException {
        String javaHome = System.getProperty("java.home");
        String javaBin = javaHome + File.separator + "bin" + File.separator + "java";

        // 构建完整的classpath
        String mavenClasspath = buildMavenClasspath();
        String fullClasspath = "target/classes:" + mavenClasspath;

        // Boss程序的完全隔离JVM参数
        String[] command = {
            javaBin,
            "-Xms256m", "-Xmx1024m",  // 限制内存使用
            "-XX:+UseG1GC",           // 使用G1垃圾收集器
            "-XX:+DisableExplicitGC", // 禁用显式GC
            "-Djava.awt.headless=" + headless, // 动态头模式
            "-Dfile.encoding=UTF-8",   // 设置文件编码
            "-Dsun.java.command=boss.IsolatedBossRunner", // 设置主类
            "-Dboss.user.id=default_user", // 传递用户ID给Boss程序
            "-cp", fullClasspath,      // 设置classpath
            "boss.IsolatedBossRunner"               // Boss隔离运行器
        };

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.directory(new File("/root/zhitoujianli/backend/get_jobs"));

        // 设置环境变量
        pb.environment().putAll(System.getenv());
        pb.environment().put("PLAYWRIGHT_BROWSERS_PATH", "/root/.cache/ms-playwright");
        pb.environment().put("PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD", "true");
        pb.environment().put("NODE_OPTIONS", "--max-old-space-size=512");

        // 【关键修复】设置虚拟显示，让浏览器在Xvfb上运行
        pb.environment().put("DISPLAY", ":99");

        // 确保Xvfb环境变量正确传递
        pb.environment().put("XVFB_DISPLAY", ":99");
        pb.environment().put("SCREEN_RESOLUTION", "1920x1080x24");

        return pb;
    }

    /**
     * 构建Maven classpath
     */
    private String buildMavenClasspath() throws IOException {
        // 生成临时的classpath文件
        File classpathFile = new File("classpath.txt");
        if (!classpathFile.exists()) {
            // 如果classpath文件不存在，生成一个最小版本
            return generateMinimalClasspath();
        }

        try {
            return new String(java.nio.file.Files.readAllBytes(classpathFile.toPath()), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.warn("读取classpath.txt失败，使用最小classpath");
            return generateMinimalClasspath();
        }
    }

    /**
     * 生成最小classpath
     */
    private String generateMinimalClasspath() {
        String mavenHome = System.getProperty("user.home") + "/.m2";
        StringBuilder sb = new StringBuilder();
        sb.append(mavenHome).append("/repository/com/microsoft/playwright/playwright/1.51.0/playwright-1.51.0.jar:");
        sb.append(mavenHome).append("/repository/com/microsoft/playwright/driver/1.51.0/driver-1.51.0.jar:");
        sb.append(mavenHome).append("/repository/com/microsoft/playwright/driver-bundle/1.51.0/driver-bundle-1.51.0.jar:");
        sb.append(mavenHome).append("/repository/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar:");
        sb.append(mavenHome).append("/repository/org/json/json/20231013/json-20231013.jar:");
        sb.append(mavenHome).append("/repository/org/slf4j/slf4j-api/2.0.9/slf4j-api-2.0.9.jar:");
        sb.append(mavenHome).append("/repository/ch/qos/logback/logback-classic/1.4.11/logback-classic-1.4.11.jar:");
        sb.append(mavenHome).append("/repository/ch/qos/logback/logback-core/1.4.11/logback-core-1.4.11.jar:");
        sb.append(mavenHome).append("/repository/com/fasterxml/jackson/dataformat/jackson-dataformat-yaml/2.15.2/jackson-dataformat-yaml-2.15.2.jar:");
        sb.append(mavenHome).append("/repository/com/fasterxml/jackson/core/jackson-databind/2.15.3/jackson-databind-2.15.3.jar:");
        sb.append(mavenHome).append("/repository/com/fasterxml/jackson/core/jackson-annotations/2.15.3/jackson-annotations-2.15.3.jar:");
        sb.append(mavenHome).append("/repository/com/fasterxml/jackson/core/jackson-core/2.15.3/jackson-core-2.15.3.jar:");
        sb.append(mavenHome).append("/repository/org/yaml/snakeyaml/2.2/snakeyaml-2.2.jar");
        return sb.toString();
    }

    /**
     * 创建日志捕获线程
     */
    private Thread createLogCaptureThread(BufferedReader reader, FileWriter logWriter, String prefix, CountDownLatch latch) {
        return new Thread(() -> {
            try {
                String line;
                while ((line = reader.readLine()) != null) {
                    synchronized (logWriter) {
                        logWriter.write(line + "%n");
                        logWriter.flush();
                    }
                }
            } catch (Exception e) {
                log.error("日志捕获异常", e);
            } finally {
                latch.countDown();
            }
        });
    }

    /**
     * 确保日志文件存在
     */
    private void ensureLogFileExists(File logFile) throws IOException {
        File parentDir = logFile.getParentFile();
        if (parentDir != null && !parentDir.exists()) {
            if (!parentDir.mkdirs()) {
                log.warn("创建目录失败");
            }
        }
        if (!logFile.exists()) {
            logFile.createNewFile();
        }
    }

    /**
     * 写入日志头部信息
     */
    private void writeLogHeader(FileWriter logWriter) throws IOException {
        logWriter.write("=== Boss程序隔离执行环境 ===%n");
        logWriter.write(formatTimestamp() + " - 隔离执行服务启动%n");
        logWriter.write(formatTimestamp() + " - JVM版本: " + System.getProperty("java.version") + "%n");
        logWriter.write(formatTimestamp() + " - 工作目录: " + System.getProperty("user.dir") + "%n");
        logWriter.write(formatTimestamp() + " - 内存限制: 1GB%n");
        logWriter.flush();
    }

    /**
     * 写入错误日志
     */
    private void writeErrorLog(String logFilePath, Exception e) {
        try (FileWriter writer = new FileWriter(logFilePath, StandardCharsets.UTF_8, true)) {
            writer.write(formatTimestamp() + " - EXCEPTION: " + e.getMessage() + "%n");
            writer.write(formatTimestamp() + " - EXCEPTION_TYPE: " + e.getClass().getSimpleName() + "%n");

            if (e.getMessage().contains("Playwright")) {
                writer.write(formatTimestamp() + " - TROUBLESHOOTING: Playwright浏览器初始化失败%n");
            } else if (e.getMessage().contains("port")) {
                writer.write(formatTimestamp() + " - TROUBLESHOOTING: 端口冲突检测%n");
            } else if (e.getMessage().contains("memory")) {
                writer.write(formatTimestamp() + " - TROUBLESHOOTING: 内存不足检测%n");
            }

            writer.flush();
        } catch (IOException ex) {
            log.error("写入错误日志失败", ex);
        }
    }

    /**
     * 格式化时间戳
     */
    private String formatTimestamp() {
        return new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date());
    }
}
