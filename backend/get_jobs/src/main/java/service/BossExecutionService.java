package service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import controller.BossWebSocketController;

/**
 * Boss程序执行服务 - 完全隔离的执行环境
 * 解决Spring Boot环境下的资源冲突问题
 */
@Service
public class BossExecutionService {

    private static final Logger log = LoggerFactory.getLogger(BossExecutionService.class);

    @Autowired
    private BossVerificationCodeService bossVerificationCodeService;

    @Autowired
    private BossWebSocketController bossWebSocketController;

    /**
     * 异步执行Boss程序 - 完全隔离模式
     * 使用独立的JVM进程避免线程和资源冲突
     */
    public CompletableFuture<Void> executeBossProgram(String logFilePath) {
        return executeBossProgram(logFilePath, false, false); // false=有头模式，false=执行完整投递
    }

    /**
     * 异步执行Boss程序 - 完全隔离模式
     * @param logFilePath 日志文件路径
     * @param headless 是否使用无头模式
     */
    public CompletableFuture<Void> executeBossProgram(String logFilePath, boolean headless) {
        return executeBossProgram(logFilePath, headless, false); // false=执行完整投递
    }

    /**
     * 异步执行Boss程序 - 完全隔离模式
     * @param logFilePath 日志文件路径
     * @param headless 是否使用无头模式
     * @param loginOnly 是否只登录不投递（用于二维码登录）
     */
    public CompletableFuture<Void> executeBossProgram(String logFilePath, boolean headless, boolean loginOnly) {
        // 在异步执行前获取用户ID和SecurityContext，避免在异步线程中SecurityContext丢失
        final String userId = util.UserContextUtil.sanitizeUserId(util.UserContextUtil.getCurrentUserId());
        final org.springframework.security.core.context.SecurityContext securityContext =
            org.springframework.security.core.context.SecurityContextHolder.getContext();

        // ✅ 进程检查：在启动前检查是否有该用户的进程在运行
        if (util.BossProcessManager.isUserBossProcessRunning(userId)) {
            List<Long> existingPids = util.BossProcessManager.findUserBossProcesses(userId);
            String errorMsg = String.format(
                "用户 %s 已有Boss进程在运行（PID: %s），请等待当前任务完成或先终止现有进程",
                userId, existingPids
            );
            log.warn("❌ {}", errorMsg);
            CompletableFuture<Void> failedFuture = new CompletableFuture<>();
            failedFuture.completeExceptionally(new IllegalStateException(errorMsg));
            return failedFuture;
        }

        return CompletableFuture.runAsync(() -> {
            // 在异步线程中恢复SecurityContext
            org.springframework.security.core.context.SecurityContextHolder.setContext(securityContext);

            Process process = null;
            try {
                // 使用预先获取的用户ID（支持多用户隔离）

                log.info("开始执行Boss程序，用户: {}, 隔离执行环境，头模式: {}, 只登录: {}",
                        userId, headless ? "无头" : "有头", loginOnly ? "是" : "否");

                // 确保日志文件存在
                File logFile = new File(logFilePath);
                ensureLogFileExists(logFile);

                try (FileWriter logWriter = new FileWriter(logFile, StandardCharsets.UTF_8, true)) {

                    writeLogHeader(logWriter);

                // 创建独立的Boss进程（传递用户ID以支持多用户隔离）
                ProcessBuilder pb = createIsolatedBossProcess(userId, headless, loginOnly);

                // 为Boss程序设置用户ID环境变量（多用户支持）
                pb.environment().put("BOSS_USER_ID", userId);
                log.info("📋 已设置Boss程序环境变量: BOSS_USER_ID={}, loginOnly={}", userId, loginOnly);

                    logWriter.write(formatTimestamp() + " - 启动独立Boss进程（用户: " + userId + "）...\n");
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

                    // 等待进程完成，最长60分钟（支持更多岗位投递）
                    boolean finished = process.waitFor(60, TimeUnit.MINUTES);

                    // 等待日志线程完成，检查返回值
                    boolean outputFinished = outputLatch.await(5, TimeUnit.SECONDS);
                    boolean errorFinished = errorLatch.await(5, TimeUnit.SECONDS);

                    if (!outputFinished) {
                        logWriter.write(formatTimestamp() + " - WARNING: 输出日志线程未在5秒内完成\n");
                    }
                    if (!errorFinished) {
                        logWriter.write(formatTimestamp() + " - WARNING: 错误日志线程未在5秒内完成\n");
                    }

                    if (!finished) {
                        logWriter.write(formatTimestamp() + " - WARNING: Boss程序超时未完成\n");
                        process.destroyForcibly();
                        log.error("Boss程序超时，强制终止");
                    } else {
                        int exitCode = process.exitValue();
                        logWriter.write(formatTimestamp() + " - Boss程序完成，退出码: " + exitCode + "\n");
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
     * @param userId 用户ID（支持多用户隔离）
     * @param headless 是否使用无头模式
     * @param loginOnly 是否只登录不投递（用于二维码登录）
     */
    private ProcessBuilder createIsolatedBossProcess(String userId, boolean headless, boolean loginOnly) throws IOException {
        String javaHome = System.getProperty("java.home");
        String javaBin = javaHome + File.separator + "bin" + File.separator + "java";

        // ✅ 修复：使用classes目录构建classpath（Spring Boot JAR中的类在BOOT-INF/classes下，不能直接用-cp加载）
        String projectDir = "/root/zhitoujianli/backend/get_jobs";
        String mavenClasspath = buildMavenClasspath();
        String classesPath = projectDir + File.separator + "target" + File.separator + "classes";

        // 验证classes目录和关键类是否存在
        File classesDir = new File(classesPath);
        File isolatedBossRunner = new File(classesPath, "boss/IsolatedBossRunner.class");
        File jobUtils = new File(classesPath, "utils/JobUtils.class");

        if (!classesDir.exists() || !isolatedBossRunner.exists() || !jobUtils.exists()) {
            log.error("❌ classes目录不存在或不完整，无法启动Boss程序");
            log.error("    classes目录: {}", classesPath);
            log.error("    IsolatedBossRunner存在: {}", isolatedBossRunner.exists());
            log.error("    JobUtils存在: {}", jobUtils.exists());
            throw new IOException("classes目录不存在或不完整，请先编译项目");
        }

        String fullClasspath = classesPath + ":" + mavenClasspath;
        log.info("✅ 使用classes目录作为classpath: {}", classesPath);

        // Boss程序的完全隔离JVM参数
        // ✅ 如果是只登录模式，添加 "login-only" 参数
        String[] command = loginOnly ? new String[] {
            javaBin,
            "-Xms256m", "-Xmx1024m",  // 限制内存使用
            "-XX:+UseG1GC",           // 使用G1垃圾收集器
            "-XX:+DisableExplicitGC", // 禁用显式GC
            "-Djava.awt.headless=" + headless, // 动态头模式
            "-Dfile.encoding=UTF-8",   // 设置文件编码
            "-Dsun.java.command=boss.IsolatedBossRunner", // 设置主类
            "-Dboss.user.id=" + userId, // 🔧 修复：使用动态用户ID支持多用户隔离
            "-cp", fullClasspath,      // 设置classpath
            "boss.IsolatedBossRunner", // Boss隔离运行器
            "login-only"               // ✅ 只登录参数
        } : new String[] {
            javaBin,
            "-Xms256m", "-Xmx1024m",  // 限制内存使用
            "-XX:+UseG1GC",           // 使用G1垃圾收集器
            "-XX:+DisableExplicitGC", // 禁用显式GC
            "-Djava.awt.headless=" + headless, // 动态头模式
            "-Dfile.encoding=UTF-8",   // 设置文件编码
            "-Dsun.java.command=boss.IsolatedBossRunner", // 设置主类
            "-Dboss.user.id=" + userId, // 🔧 修复：使用动态用户ID支持多用户隔离
            "-cp", fullClasspath,      // 设置classpath
            "boss.IsolatedBossRunner"               // Boss隔离运行器
        };

        ProcessBuilder pb = new ProcessBuilder(command);
        // 工作目录保持在项目目录（需要classpath.txt等文件）
        pb.directory(new File("/root/zhitoujianli/backend/get_jobs"));

        // 设置环境变量
        pb.environment().putAll(System.getenv());
        pb.environment().put("PLAYWRIGHT_BROWSERS_PATH", "/root/.cache/ms-playwright");
        pb.environment().put("PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD", "true");
        pb.environment().put("NODE_OPTIONS", "--max-old-space-size=512");

        // ✅ 修复：防止Playwright临时目录package.json丢失导致崩溃
        // 设置固定的工作目录，避免/tmp目录被清理
        String playwrightWorkDir = "/opt/zhitoujianli/backend/.playwright-cache";
        new File(playwrightWorkDir).mkdirs();
        // ❌ 修复：PLAYWRIGHT_NODEJS_PATH 必须是 Node.js 可执行文件路径，不是目录
        // 删除错误的配置，让 Playwright 使用系统默认的 Node.js
        // pb.environment().put("PLAYWRIGHT_NODEJS_PATH", playwrightWorkDir); // 已删除错误配置

        // 【关键修复】设置虚拟显示，让浏览器在Xvfb上运行
        pb.environment().put("DISPLAY", ":99");

        // 确保Xvfb环境变量正确传递
        pb.environment().put("XVFB_DISPLAY", ":99");
        pb.environment().put("SCREEN_RESOLUTION", "1920x1080x24");

        // 【重要】显式传递AI服务的环境变量（.env文件中的变量不会自动传递）
        loadAndSetEnvVariables(pb);
        log.info("✅ 已加载并传递AI服务环境变量到Boss进程");

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
     * 从.env文件加载并设置环境变量到ProcessBuilder
     * 修复: .env文件的变量不会自动传递给子进程
     */
    private void loadAndSetEnvVariables(ProcessBuilder pb) {
        try {
            // ✅ 优先读取生产环境配置文件
            File prodEnvFile = new File("/etc/zhitoujianli/backend.env");
            File devEnvFile = new File("/root/zhitoujianli/backend/get_jobs/.env");

            File envFile = prodEnvFile.exists() ? prodEnvFile : devEnvFile;

            if (envFile.exists()) {
                log.info("📂 从环境变量文件加载配置: {}", envFile.getAbsolutePath());
                java.nio.file.Files.lines(envFile.toPath())
                    .filter(line -> !line.trim().isEmpty() && !line.trim().startsWith("#"))
                    .forEach(line -> {
                        String[] parts = line.split("=", 2);
                        if (parts.length == 2) {
                            String key = parts[0].trim();
                            String value = parts[1].trim();
                            // ✅ 传递AI相关和Boss路径相关的环境变量
                            if (key.contains("API") ||
                                key.contains("DEEPSEEK") ||
                                key.contains("MODEL") ||
                                key.equals("BASE_URL") ||
                                key.equals("USER_DATA_DIR") ||
                                key.equals("BOSS_WORK_DIR")) {
                                pb.environment().put(key, value);
                                if (key.contains("KEY") || key.contains("SECRET")) {
                                    log.debug("传递环境变量到Boss进程: {}=***", key);
                                } else {
                                    log.debug("传递环境变量到Boss进程: {}={}", key, value);
                                }
                            }
                        }
                    });
            } else {
                log.warn(".env文件不存在: {}", envFile.getAbsolutePath());
            }

            // ✅ 如果环境变量未设置，使用默认值
            if (!pb.environment().containsKey("USER_DATA_DIR")) {
                pb.environment().put("USER_DATA_DIR", "/opt/zhitoujianli/backend/user_data");
                log.info("设置默认USER_DATA_DIR: /opt/zhitoujianli/backend/user_data");
            }
            if (!pb.environment().containsKey("BOSS_WORK_DIR")) {
                pb.environment().put("BOSS_WORK_DIR", "/opt/zhitoujianli/backend");
                log.info("设置默认BOSS_WORK_DIR: /opt/zhitoujianli/backend");
            }

        } catch (Exception e) {
            log.error("加载.env文件失败，AI服务可能无法使用", e);
        }
    }

    /**
     * 生成最小classpath
     * 包含Boss程序运行所需的最小依赖，包括PostgreSQL驱动（用于配额检查）
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
        sb.append(mavenHome).append("/repository/org/yaml/snakeyaml/2.2/snakeyaml-2.2.jar:");
        // ✅ 添加PostgreSQL驱动，用于配额检查的JDBC连接
        sb.append(mavenHome).append("/repository/org/postgresql/postgresql/42.6.0/postgresql-42.6.0.jar:");
        sb.append(mavenHome).append("/repository/org/checkerframework/checker-qual/3.31.0/checker-qual-3.31.0.jar:");
        // ✅ 添加dotenv-java依赖，用于Bot工具类加载环境变量
        sb.append(mavenHome).append("/repository/io/github/cdimascio/dotenv-java/2.2.0/dotenv-java-2.2.0.jar");
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
                    // ✅ 过滤Playwright Node.js进程的已知错误（package.json缺失）
                    // 这些错误来自Playwright的Node.js进程，不影响功能，但会污染日志
                    if ("ERROR".equals(prefix)) {
                        if (line.contains("package.json") ||
                            line.contains("MODULE_NOT_FOUND") ||
                            line.contains("playwright-java") ||
                            line.contains("Cannot find module") ||
                            line.contains("Error: Cannot find module")) {
                            // 跳过已知错误，不写入日志（这些是Playwright清理时的已知问题）
                            continue;
                        }
                    }

                    synchronized (logWriter) {
                        logWriter.write(line + "\n");
                        logWriter.flush();
                    }

                    // ✅ 检测验证码请求标记
                    if (line.contains("🔐 VERIFICATION_CODE_REQUIRED:")) {
                        String requestFile = line.substring(line.indexOf(":") + 1).trim();
                        log.info("🔐 检测到验证码请求: {}", requestFile);
                        handleVerificationCodeRequest(requestFile);
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
     * 处理验证码请求
     * 读取请求文件，创建验证码请求，并通过WebSocket通知前端
     */
    private void handleVerificationCodeRequest(String requestFile) {
        try {
            // 读取请求文件
            String content = new String(
                Files.readAllBytes(Paths.get(requestFile)),
                StandardCharsets.UTF_8
            );
            JSONObject requestData = new JSONObject(content);

            String userId = requestData.getString("userId");
            String jobName = requestData.getString("jobName");
            String screenshotPath = requestData.getString("screenshotPath");
            String taskId = requestData.getString("taskId");

            log.info("✅ 读取验证码请求: userId={}, jobName={}, screenshotPath={}, taskId={}",
                userId, jobName, screenshotPath, taskId);

            // 创建验证码请求
            String requestId = bossVerificationCodeService.createVerificationRequest(
                userId, jobName, screenshotPath, taskId);

            if (requestId != null) {
                log.info("✅ 验证码请求已创建: requestId={}", requestId);

                // 通过WebSocket通知前端
                Map<String, Object> message = new HashMap<>();
                message.put("action", "verification_code_required");
                message.put("requestId", requestId);
                message.put("jobName", jobName);
                message.put("screenshotUrl", bossVerificationCodeService.getScreenshotUrl(screenshotPath));
                message.put("taskId", taskId);
                message.put("timestamp", System.currentTimeMillis());

                bossWebSocketController.sendVerificationCodeNotification(userId, message);
                log.info("✅ 已通过WebSocket通知前端: userId={}", userId);
            } else {
                log.error("❌ 创建验证码请求失败");
            }

            // 删除请求文件（已处理）
            Files.deleteIfExists(Paths.get(requestFile));

        } catch (Exception e) {
            log.error("处理验证码请求失败", e);
        }
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
        logWriter.write("=== Boss程序隔离执行环境 ===\n");
        logWriter.write(formatTimestamp() + " - 隔离执行服务启动\n");
        logWriter.write(formatTimestamp() + " - JVM版本: " + System.getProperty("java.version") + "\n");
        logWriter.write(formatTimestamp() + " - 工作目录: " + System.getProperty("user.dir") + "\n");
        logWriter.write(formatTimestamp() + " - 内存限制: 1GB\n");
        logWriter.flush();
    }

    /**
     * 写入错误日志
     */
    private void writeErrorLog(String logFilePath, Exception e) {
        try (FileWriter writer = new FileWriter(logFilePath, StandardCharsets.UTF_8, true)) {
            writer.write(formatTimestamp() + " - EXCEPTION: " + e.getMessage() + "\n");
            writer.write(formatTimestamp() + " - EXCEPTION_TYPE: " + e.getClass().getSimpleName() + "\n");

            if (e.getMessage().contains("Playwright")) {
                writer.write(formatTimestamp() + " - TROUBLESHOOTING: Playwright浏览器初始化失败\n");
            } else if (e.getMessage().contains("port")) {
                writer.write(formatTimestamp() + " - TROUBLESHOOTING: 端口冲突检测\n");
            } else if (e.getMessage().contains("memory")) {
                writer.write(formatTimestamp() + " - TROUBLESHOOTING: 内存不足检测\n");
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
