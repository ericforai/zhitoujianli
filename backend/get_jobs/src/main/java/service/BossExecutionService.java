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

                    // ✅ 修复：根据用户投递策略动态计算超时时间
                    long startTime = System.currentTimeMillis();
                    int timeoutMinutes = calculateTimeoutMinutes(userId, loginOnly);

                    // 记录任务开始时间和超时设置（确保写入日志文件）
                    String startTimeStr = formatTimestamp();
                    log.info("⏱️ Boss程序超时设置: {}分钟 (用户: {})", timeoutMinutes, userId);
                    logWriter.write(startTimeStr + " - 任务开始时间: " + startTimeStr + "\n");
                    logWriter.write(startTimeStr + " - 超时设置: " + timeoutMinutes + "分钟\n");
                    logWriter.write(startTimeStr + " - 超时时间计算详情: 已根据用户投递策略动态计算\n");
                    logWriter.flush();

                    // 等待进程完成，使用动态计算的超时时间
                    boolean finished = process.waitFor(timeoutMinutes, TimeUnit.MINUTES);

                    // 计算实际执行时间
                    long endTime = System.currentTimeMillis();
                    long actualDurationMinutes = (endTime - startTime) / 1000 / 60;
                    long actualDurationSeconds = (endTime - startTime) / 1000;

                    // ✅ 修复：增加日志线程等待时间（从5秒改为15秒），减少日志线程超时警告
                    int logThreadWaitSeconds = 15;
                    boolean outputFinished = outputLatch.await(logThreadWaitSeconds, TimeUnit.SECONDS);
                    boolean errorFinished = errorLatch.await(logThreadWaitSeconds, TimeUnit.SECONDS);

                    // ✅ 修复：添加更详细的日志线程超时原因日志
                    String currentTimeStr = formatTimestamp();
                    if (!outputFinished) {
                        String warningMsg = String.format(
                            "WARNING: 输出日志线程未在%d秒内完成（可能原因: 1) 日志缓冲区数据量大 2) 文件I/O阻塞 3) 进程终止后仍有数据待处理）",
                            logThreadWaitSeconds
                        );
                        logWriter.write(currentTimeStr + " - " + warningMsg + "\n");
                        log.warn("输出日志线程超时: 等待{}秒后仍未完成", logThreadWaitSeconds);
                    }
                    if (!errorFinished) {
                        String warningMsg = String.format(
                            "WARNING: 错误日志线程未在%d秒内完成（可能原因: 1) 错误日志缓冲区数据量大 2) 文件I/O阻塞 3) 进程终止后仍有数据待处理）",
                            logThreadWaitSeconds
                        );
                        logWriter.write(currentTimeStr + " - " + warningMsg + "\n");
                        log.warn("错误日志线程超时: 等待{}秒后仍未完成", logThreadWaitSeconds);
                    }

                    // ✅ 修复：添加更详细的超时原因日志，便于后续分析
                    if (!finished) {
                        String timeoutMsg = String.format(
                            "WARNING: Boss程序超时未完成\n" +
                            "  - 任务开始时间: %s\n" +
                            "  - 超时设置: %d分钟\n" +
                            "  - 实际执行时间: %d分钟 %d秒 (%.2f分钟)\n" +
                            "  - 超时原因: 任务执行时间(%.2f分钟)超过了设定的超时时间(%d分钟)\n" +
                            "  - 建议: 1) 检查用户投递策略配置 2) 考虑增加超时时间 3) 优化任务执行效率",
                            startTimeStr, timeoutMinutes, actualDurationMinutes,
                            actualDurationSeconds % 60, (double) actualDurationSeconds / 60,
                            (double) actualDurationSeconds / 60, timeoutMinutes
                        );
                        logWriter.write(currentTimeStr + " - " + timeoutMsg + "\n");
                        logWriter.flush();
                        process.destroyForcibly();
                        log.error("Boss程序超时，强制终止 - 执行时间: {}分钟，超时设置: {}分钟",
                            actualDurationMinutes, timeoutMinutes);
                    } else {
                        int exitCode = process.exitValue();
                        String successMsg = String.format(
                            "Boss程序完成，退出码: %d\n" +
                            "  - 任务开始时间: %s\n" +
                            "  - 任务结束时间: %s\n" +
                            "  - 实际执行时间: %d分钟 %d秒 (%.2f分钟)\n" +
                            "  - 超时设置: %d分钟",
                            exitCode, startTimeStr, currentTimeStr,
                            actualDurationMinutes, actualDurationSeconds % 60,
                            (double) actualDurationSeconds / 60, timeoutMinutes
                        );
                        logWriter.write(currentTimeStr + " - " + successMsg + "\n");
                        log.info("Boss程序执行完成，退出码: {}，执行时间: {}分钟", exitCode, actualDurationMinutes);
                    }
                    logWriter.flush();

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
     * 自动检测项目目录（支持本地开发和生产环境）
     * @return 项目目录路径
     */
    private String detectProjectDir() {
        // 优先检查生产环境路径
        File prodPath = new File("/root/zhitoujianli/backend/get_jobs");
        if (prodPath.exists() && new File(prodPath, "pom.xml").exists()) {
            return prodPath.getAbsolutePath();
        }
        
        // 尝试从当前工作目录检测
        String userDir = System.getProperty("user.dir");
        if (userDir != null) {
            // 如果当前目录就是 get_jobs，直接返回
            if (userDir.endsWith("get_jobs") && new File(userDir, "pom.xml").exists()) {
                return userDir;
            }
            // 如果在项目根目录，尝试找到 backend/get_jobs
            File backendPath = new File(userDir, "backend/get_jobs");
            if (backendPath.exists() && new File(backendPath, "pom.xml").exists()) {
                return backendPath.getAbsolutePath();
            }
            // 如果在 backend 目录，尝试找到 get_jobs
            if (userDir.endsWith("backend")) {
                File getJobsPath = new File(userDir, "get_jobs");
                if (getJobsPath.exists() && new File(getJobsPath, "pom.xml").exists()) {
                    return getJobsPath.getAbsolutePath();
                }
            }
        }
        
        // 尝试从类路径检测（通过类加载器）
        try {
            String classPath = this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
            if (classPath.contains("get_jobs")) {
                // 从类路径中提取项目目录
                int index = classPath.indexOf("get_jobs");
                String projectPath = classPath.substring(0, index + "get_jobs".length());
                File projectDir = new File(projectPath);
                if (projectDir.exists() && new File(projectDir, "pom.xml").exists()) {
                    return projectDir.getAbsolutePath();
                }
            }
        } catch (Exception e) {
            log.debug("无法从类路径检测项目目录: {}", e.getMessage());
        }
        
        // 默认返回生产环境路径（向后兼容）
        log.warn("⚠️ 无法自动检测项目目录，使用默认路径: /root/zhitoujianli/backend/get_jobs");
        return "/root/zhitoujianli/backend/get_jobs";
    }

    /**
     * 创建完全隔离的Boss进程
     * @param userId 用户ID（支持多用户隔离）
     * @param headless 是否使用无头模式
     * @param loginOnly 是否只登录不投递（用于二维码登录）
     */
    private ProcessBuilder createIsolatedBossProcess(String userId, boolean headless, boolean loginOnly) throws IOException {
        // 🔧 修复：自动检测项目目录，支持本地开发和生产环境
        String projectDir = detectProjectDir();
        
        // 🔧 修复：优先使用系统PATH中的java，如果失败再使用java.home
        String javaBin = "java"; // 默认使用PATH中的java
        try {
            // 验证java命令是否可用（使用超时避免阻塞）
            Process testProcess = new ProcessBuilder("java", "-version").redirectErrorStream(true).start();
            boolean finished = testProcess.waitFor(2, java.util.concurrent.TimeUnit.SECONDS);
            if (!finished) {
                testProcess.destroy();
            }
        } catch (Exception e) {
            // 如果PATH中的java不可用，使用java.home
            String javaHome = System.getProperty("java.home");
            javaBin = javaHome + File.separator + "bin" + File.separator + "java";
            log.warn("PATH中的java不可用，使用java.home: {}", javaBin);
        }

        // ✅ 修复：使用classes目录构建classpath（Spring Boot JAR中的类在BOOT-INF/classes下，不能直接用-cp加载）
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
        // 🔧 修复：使用自动检测的项目目录，而不是硬编码路径
        pb.directory(new File(projectDir));

        // 设置环境变量
        pb.environment().putAll(System.getenv());

        // ✅ 修复：根据操作系统自动配置Playwright环境
        String osName = System.getProperty("os.name").toLowerCase();
        boolean isMac = osName.contains("mac");
        boolean isLinux = osName.contains("linux");

        if (isMac) {
            // Mac环境：使用用户目录下的Playwright浏览器缓存
            String userHome = System.getProperty("user.home");
            String macPlaywrightPath = userHome + "/Library/Caches/ms-playwright";
            pb.environment().put("PLAYWRIGHT_BROWSERS_PATH", macPlaywrightPath);
            log.info("🍎 Mac环境检测: 使用Playwright路径 {}", macPlaywrightPath);

            // Mac不需要虚拟显示，浏览器可以直接运行
            // 不设置DISPLAY环境变量，让Playwright自动处理
            pb.environment().remove("DISPLAY");
            log.info("🍎 Mac环境: 不设置DISPLAY，浏览器将直接显示");
        } else if (isLinux) {
            // Linux生产环境
            pb.environment().put("PLAYWRIGHT_BROWSERS_PATH", "/root/.cache/ms-playwright");

            // 【关键】Linux服务器需要虚拟显示
            pb.environment().put("DISPLAY", ":99");
            pb.environment().put("XVFB_DISPLAY", ":99");
            pb.environment().put("SCREEN_RESOLUTION", "1920x1080x24");
            log.info("🐧 Linux环境检测: 使用Xvfb虚拟显示 :99");
        } else {
            // Windows或其他环境
            String userHome = System.getProperty("user.home");
            pb.environment().put("PLAYWRIGHT_BROWSERS_PATH", userHome + "/.cache/ms-playwright");
            log.info("💻 其他环境检测: 使用默认Playwright路径");
        }

        pb.environment().put("PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD", "true");
        pb.environment().put("NODE_OPTIONS", "--max-old-space-size=512");

        // ✅ 修复：防止Playwright临时目录package.json丢失导致崩溃
        // 使用用户目录下的.playwright-cache
        String playwrightWorkDir = System.getProperty("user.home") + "/.playwright-cache";
        new File(playwrightWorkDir).mkdirs();

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
            // 🔧 修复：自动检测项目目录，支持本地开发和生产环境
            String projectDir = detectProjectDir();
            File devEnvFile = new File(projectDir + File.separator + ".env");

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

            // ✅ 如果环境变量未设置，使用当前工作目录下的user_data（兼容本地开发和生产环境）
            if (!pb.environment().containsKey("USER_DATA_DIR")) {
                // 使用工作目录下的user_data，确保与DeliveryConfigController保存路径一致
                String workDir = pb.directory() != null ? pb.directory().getAbsolutePath() : System.getProperty("user.dir");
                String userDataDir = workDir + "/user_data";
                pb.environment().put("USER_DATA_DIR", userDataDir);
                log.info("设置默认USER_DATA_DIR: {}", userDataDir);
            }
            if (!pb.environment().containsKey("BOSS_WORK_DIR")) {
                String workDir = pb.directory() != null ? pb.directory().getAbsolutePath() : System.getProperty("user.dir");
                pb.environment().put("BOSS_WORK_DIR", workDir);
                log.info("设置默认BOSS_WORK_DIR: {}", workDir);
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
                    // ✅ 过滤Playwright Node.js进程的已知错误（package.json缺失、模块加载失败等）
                    // 这些错误来自Playwright的Node.js进程，不影响功能，但会污染日志
                    if ("ERROR".equals(prefix)) {
                        if (line.contains("package.json") ||
                            line.contains("MODULE_NOT_FOUND") ||
                            line.contains("playwright-java") ||
                            line.contains("Cannot find module") ||
                            line.contains("Error: Cannot find module") ||
                            line.contains("const err = new Error") ||
                            line.contains("Require stack:") ||
                            line.contains("node:internal/modules/cjs/loader") ||
                            line.contains("node:diagnostics_channel") ||
                            line.contains("Function._resolveFilename") ||
                            line.contains("Function._load") ||
                            line.contains("TracingChannel.traceSync") ||
                            line.contains("wrapModuleLoad") ||
                            line.contains("Module.require") ||
                            line.contains("require (node:internal/helpers") ||
                            line.contains("Node.js v") ||
                            (line.contains("^") && line.contains("at Function.") && line.contains("node:"))) {
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

    /**
     * 根据用户投递策略计算超时时间（分钟）
     *
     * ✅ 修复：根据用户配置的投递频率、间隔和每日限额动态计算超时时间
     * 避免因投递频率限制导致等待时间累积超过固定超时阈值
     *
     * @param userId 用户ID
     * @param loginOnly 是否只登录不投递
     * @return 超时时间（分钟）
     */
    private int calculateTimeoutMinutes(String userId, boolean loginOnly) {
        // 如果只是登录，不需要长时间等待
        if (loginOnly) {
            return 10; // 登录操作通常很快，10分钟足够
        }

        try {
            // 读取用户配置文件
            // ✅ 修复：使用环境变量USER_DATA_DIR，兼容本地开发和生产环境
            String sanitizedUserId = util.UserContextUtil.sanitizeUserId(userId);
            String userDataBaseDir = System.getenv("USER_DATA_DIR");
            if (userDataBaseDir == null || userDataBaseDir.isEmpty()) {
                userDataBaseDir = System.getProperty("user.dir") + "/user_data";
            }
            String configPath = userDataBaseDir + "/" + sanitizedUserId + "/config.json";
            File configFile = new File(configPath);

            if (!configFile.exists()) {
                log.warn("⚠️ 用户配置文件不存在: {}，使用默认超时时间", configPath);
                return 60; // 默认60分钟
            }

            // 解析JSON配置
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            @SuppressWarnings("unchecked")
            Map<String, Object> config = mapper.readValue(configFile, Map.class);

            // ✅ 修复：支持从bossConfig字段读取投递策略（兼容新旧配置格式）
            @SuppressWarnings("unchecked")
            Map<String, Object> deliveryStrategy = (Map<String, Object>) config.get("deliveryStrategy");

            // 如果deliveryStrategy不存在，尝试从bossConfig字段读取
            if (deliveryStrategy == null) {
                @SuppressWarnings({"unchecked", "rawtypes"})
                Map<String, Object> bossConfig = (Map) config.get("bossConfig");
                if (bossConfig != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> strategy = (Map<String, Object>) bossConfig.get("deliveryStrategy");
                    deliveryStrategy = strategy;
                    log.info("✅ 从bossConfig字段读取投递策略");
                }
            }

            if (deliveryStrategy == null) {
                log.warn("⚠️ 用户配置中未找到投递策略，使用默认超时时间");
                return 60; // 默认60分钟
            }

            // 获取投递策略参数
            Integer deliveryFrequency = getIntegerValue(deliveryStrategy, "deliveryFrequency", 10);
            Integer maxDailyDelivery = getIntegerValue(deliveryStrategy, "maxDailyDelivery", 100);
            Integer deliveryInterval = getIntegerValue(deliveryStrategy, "deliveryInterval", 300);

            log.info("📊 用户投递策略: 频率={}/小时, 每日限额={}, 间隔={}秒",
                deliveryFrequency, maxDailyDelivery, deliveryInterval);

            // ✅ 修复：优化超时时间计算逻辑
            // 1. 计算完成所有投递需要多少小时（向上取整）
            int maxHours = (int) Math.ceil((double) maxDailyDelivery / deliveryFrequency);
            if (maxHours == 0) {
                maxHours = 1; // 至少1小时
            }

            // 2. 计算每小时需要的时间（分钟）
            // 每小时投递次数 × 每次间隔（秒）÷ 60 = 每小时需要时间（分钟）
            int minutesPerHour = (deliveryFrequency * deliveryInterval) / 60;
            if (minutesPerHour == 0) {
                minutesPerHour = 1; // 至少1分钟
            }

            // 3. 计算总耗时（分钟）
            int totalMinutes = maxHours * minutesPerHour;

            // 4. 添加缓冲时间（30分钟，用于处理网络延迟、页面加载等）
            int timeoutMinutes = totalMinutes + 30;

            // 5. 设置最小和最大超时时间限制
            int minTimeout = 60;  // 最小60分钟
            int maxTimeout = 600; // 最大10小时（防止配置错误导致无限等待）

            timeoutMinutes = Math.max(minTimeout, Math.min(timeoutMinutes, maxTimeout));

            // ✅ 修复：添加详细的超时时间计算日志
            log.info("⏱️ 超时时间计算详情:");
            log.info("  - 投递策略: 频率={}/小时, 每日限额={}, 间隔={}秒",
                deliveryFrequency, maxDailyDelivery, deliveryInterval);
            log.info("  - 计算过程: {}小时 × {}分钟/小时 + 30分钟缓冲 = {}分钟",
                maxHours, minutesPerHour, totalMinutes + 30);
            log.info("  - 最终超时时间: {}分钟 (限制范围: {}-{}分钟)",
                timeoutMinutes, minTimeout, maxTimeout);

            return timeoutMinutes;

        } catch (Exception e) {
            log.error("❌ 计算超时时间失败，使用默认值: {}", e.getMessage(), e);
            return 60; // 默认60分钟
        }
    }

    /**
     * 从Map中安全获取Integer值
     */
    private Integer getIntegerValue(Map<String, Object> map, String key, Integer defaultValue) {
        Object value = map.get(key);
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Integer) {
            return (Integer) value;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (Exception e) {
            log.warn("⚠️ 无法解析配置值: {}={}，使用默认值: {}", key, value, defaultValue);
            return defaultValue;
        }
    }
}
