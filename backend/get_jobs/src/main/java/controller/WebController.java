package controller;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import service.BossExecutionService;
import service.UserDataService;
import util.UserContextUtil;

@Controller
@Slf4j
public class WebController {

    private static final String CONFIG_PATH = "src/main/resources/config.yaml";
    private final ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());

    @Autowired
    private UserDataService userDataService;

    @Autowired
    private BossExecutionService bossExecutionService;

    // @Autowired
    // private ProcessManagerService processManager; // 暂时注释

    // 存储程序运行状态（仅用于向后兼容，实际进程管理使用ProcessManagerService）
    @Deprecated
    private volatile boolean isRunning = false;
    private Process currentProcess;
    private String currentLogFile;

    @GetMapping("/")
    public String index(Model model, HttpServletRequest request, HttpServletResponse response) {
        try {
            // 移除登录检查 - 无需认证即可访问
            // 已注释掉认证检查，允许匿名访问

            // 尝试获取用户信息（如果已登录）
            String userId = null;
            String userEmail = null;
            try {
                if (UserContextUtil.hasCurrentUser()) {
                    userId = UserContextUtil.getCurrentUserId();
                    userEmail = UserContextUtil.getCurrentUserEmail();
                    log.info("已登录用户访问后台管理: userId={}, email={}", userId, userEmail);
                }
            } catch (Exception e) {
                log.debug("获取用户信息失败（用户未登录）: {}", e.getMessage());
            }

            // 加载当前配置
            Map<String, Object> config = loadConfig();
            model.addAttribute("config", config);
            model.addAttribute("isRunning", isRunning);
            model.addAttribute("currentLogFile", currentLogFile);
            model.addAttribute("userId", userId);
            model.addAttribute("userEmail", userEmail);

            return "index";
        } catch (Exception e) {
            log.error("加载配置失败", e);
            model.addAttribute("error", "加载配置失败: " + e.getMessage());
            model.addAttribute("isRunning", isRunning);
            return "index";
        }
    }

    @GetMapping("/resume-parser")
    public String resumeParser() {
        return "resume_parser";
    }

    @GetMapping("/resume-manager")
    public String resumeManager() {
        return "resume_manager";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    /**
     * 保存用户配置
     *
     * ⚠️ 重要：此方法必须使用UserDataService保存配置，不得硬编码用户路径
     * DO NOT MODIFY: 配置保存逻辑，必须通过UserDataService确保多用户隔离
     */
    @PostMapping("/save-config")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveConfig(@RequestBody Map<String, Object> config) {
        try {
            log.info("开始保存配置，接收到的配置: {}", config);

            // 使用UserDataService保存配置（已包含用户ID获取和路径生成逻辑）
            // ❌ 已删除：UserDataService不再支持default_user（安全认证永远启用）
            boolean success = userDataService.saveUserConfig(config);

            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("success", true);
                response.put("message", "配置保存成功");

                // 获取实际保存的用户信息（用于日志记录）
                String userId = UserContextUtil.getCurrentUserId();
                String userEmail = UserContextUtil.getCurrentUserEmail();
                log.info("✅ 用户配置保存成功: userId={}, email={}", userId, userEmail);

                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "保存配置失败");
                return ResponseEntity.status(500).body(response);
            }
        } catch (Exception e) {
            log.error("保存配置失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "保存配置失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 启动Boss投递任务
     *
     * ⚠️ 重要：必须使用ProcessManagerService管理进程，防止多进程运行
     * DO NOT MODIFY: 进程管理逻辑，必须通过ProcessManagerService确保单用户单进程
     */
    @annotation.CheckPlanPermission(
        quotaKey = "daily_job_application",
        amount = 1,
        checkBefore = true,
        message = "每日投递次数已用完，请明天再试或升级套餐"
    )
    @PostMapping("/start-boss-task")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> startBossTask() {
        try {
            // 获取当前用户ID
            String userId = UserContextUtil.getCurrentUserId();
            log.info("用户 {} 请求启动Boss投递任务", userId);

            // 检查是否已有任务在运行
            if (isRunning) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Boss任务已在运行中");
                log.warn("用户 {} 已有任务在运行，拒绝重复启动", userId);
                return ResponseEntity.badRequest().body(response);
            }

            // 生成日志文件名
            currentLogFile = generateLogFileName("boss_web");
            log.info("生成日志文件: {}", currentLogFile);

            // 确保日志目录存在
            File logsDir = new File("logs");
            if (!logsDir.exists()) {
                if (!logsDir.mkdirs()) {
                    log.warn("创建日志目录失败");
                }
            }

            // 启动Boss执行服务
            CompletableFuture<Void> task = bossExecutionService.executeBossProgram(currentLogFile)
                .whenComplete((result, throwable) -> {
                    // 使用try-with-resources确保FileWriter被正确关闭（修复SpotBugs问题）
                    try (java.io.FileWriter logWriter = new java.io.FileWriter(currentLogFile, StandardCharsets.UTF_8, true)) {
                        if (throwable != null) {
                            logWriter.write(String.format("%s - Boss程序执行异常: %s%n",
                                new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()),
                                throwable.getMessage()));
                            log.error("Boss程序执行异常", throwable);
                        } else {
                            logWriter.write(String.format("%s - Boss程序执行完成%n",
                                new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date())));
                        }
                        logWriter.write(String.format("%s - 投递任务结束%n",
                            new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date())));
                        logWriter.flush();
                    } catch (Exception e) {
                        log.error("写入最终日志失败", e);
                    } finally {
                        // 向后兼容的状态标记
                        isRunning = false;
                    }
                });

            // 注册进程到ProcessManagerService
            // processManager.registerProcess(userId, task);

            // 向后兼容的状态标记
            isRunning = true;

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Boss任务启动成功");
            response.put("logFile", currentLogFile);
            response.put("userId", userId);
            log.info("✅ Boss任务启动成功: userId={}, logFile={}", userId, currentLogFile);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            // ProcessManagerService抛出的进程已存在异常
            log.error("启动Boss任务失败: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("启动Boss任务失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "启动Boss任务失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 启动Boss投递任务（有头模式，用于调试和登录）
     *
     * ⚠️ 重要：必须使用ProcessManagerService管理进程，防止多进程运行
     */
    @PostMapping("/start-boss-task-with-ui")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> startBossTaskWithUI() {
        try {
            // 获取当前用户ID
            String userId = UserContextUtil.getCurrentUserId();
            log.info("用户 {} 请求启动Boss投递任务（有头模式）", userId);

            // 检查是否已有任务在运行
            if (isRunning) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "您已有投递任务正在运行");
                log.warn("用户 {} 已有任务在运行，拒绝重复启动", userId);
                return ResponseEntity.badRequest().body(response);
            }

            currentLogFile = "boss_web_ui_" + System.currentTimeMillis() + ".log";

            // 使用有头模式启动Boss程序（false = 有头模式）
            CompletableFuture<Void> task = bossExecutionService.executeBossProgram(currentLogFile, false);

            // 向后兼容的状态标记
            isRunning = true;

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("logFile", currentLogFile);
            response.put("userId", userId);
            response.put("message", "Boss任务已启动（有头模式），请在弹出的浏览器窗口中完成登录");
            log.info("✅ Boss任务启动成功（有头模式）: userId={}", userId);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            log.error("启动Boss任务失败: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("启动Boss任务失败", e);
            isRunning = false;
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "启动Boss任务失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/start-program")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> startProgram(@RequestParam String platform) {
        if (isRunning) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "程序已在运行中");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // 使用独立的Java进程启动Boss程序，完全避开Spring Boot
            String javaHome = System.getProperty("java.home");
            String javaBin = javaHome + File.separator + "bin" + File.separator + "java";

            // 构建正确的classpath
            String classpathFile = "/root/zhitoujianli/backend/get_jobs/classpath.txt";
            String classpath;
            try {
                classpath = Files.readString(new java.io.File(classpathFile).toPath());
                // 添加target/classes到classpath开头
                classpath = "target/classes:" + classpath;
            } catch (Exception e) {
                log.error("读取classpath文件失败", e);
                // 回退到简单方式
                classpath = "target/classes:" + System.getProperty("java.class.path");
            }

            // 构建启动命令，完整路径
            String command = String.format("\"%s\" -cp \"%s\" %s",
                javaBin, classpath, "boss.Boss");

            ProcessBuilder pb = new ProcessBuilder("bash", "-c", command);
            pb.directory(new File("."));
            pb.redirectErrorStream(true);

            // 继承当前JVM的环境变量，并确保Playwright使用正确路径
            Map<String, String> env = pb.environment();
            env.clear();  // 清空默认环境，避免冲突
            env.putAll(System.getenv());  // 继承当前环境变量
            env.put("PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD", "1");  // 强制跳过下载
            env.put("PLAYWRIGHT_BROWSERS_PATH", "/root/.cache/ms-playwright");
            env.put("PATH", env.get("PATH") + ":/opt/miniconda3/bin");  // 添加conda路径
            // 清理可能干扰的变量
            env.remove("PLAYWRIGHT_DOWNLOAD_TRACE");
            env.remove("PLAYWRIGHT_BROWSERS_PATH_OVERRIDE");
            log.info("环境变量PATH: {}", env.get("PATH"));

            pb.environment().putAll(env);  // 将环境变量应用到ProcessBuilder

            log.info("启动Boss程序命令: {}", command);
            currentProcess = pb.start();
            isRunning = true;

            // 生成日志文件名，确保目录存在
            File logsDir = new File("logs");
            if (!logsDir.exists()) {
                if (!logsDir.mkdirs()) {
                    log.warn("创建目录失败");
                }
            }
            currentLogFile = new File("logs", "boss_" +
                new java.text.SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date()) + ".log").getAbsolutePath();

            // 异步处理输出和写入日志文件
            CompletableFuture.runAsync(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(currentProcess.getInputStream(), StandardCharsets.UTF_8));
                     java.io.FileWriter writer = new java.io.FileWriter(currentLogFile, StandardCharsets.UTF_8)) {
                    String line;
                    while ((line = reader.readLine()) != null && isRunning) {
                        // 写入日志文件
                        writer.write(line + "%n");
                        writer.flush();
                        // 同时输出到控制台日志
                        log.info("程序输出: {}", line);
                    }

                    // 等待进程结束
                    int exitCode = currentProcess.waitFor();
                    log.info("Boss程序结束，退出码: {}", exitCode);

                } catch (IOException | InterruptedException e) {
                    log.error("处理程序输出失败", e);
                } finally {
                    // 程序结束，更新状态
                    isRunning = false;
                    currentProcess = null;
                }
            });

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "程序启动成功");
            response.put("logFile", currentLogFile);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("启动程序失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "启动程序失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/stop-program")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> stopProgram() {
        if (!isRunning) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "程序未在运行");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            if (currentProcess != null) {
                // 强制终止进程
                currentProcess.destroyForcibly();
                currentProcess = null;
            }
            // 确保状态重置
            isRunning = false;
            currentLogFile = null;

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "程序已停止");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("停止程序失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "停止程序失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("isRunning", isRunning);
        status.put("logFile", currentLogFile);

        // 获取投递统计
        if (currentLogFile != null && Files.exists(Paths.get(currentLogFile))) {
            try {
                long deliveryCount = Files.lines(Paths.get(currentLogFile))
                    .filter(line -> line.contains("投递完成"))
                    .count();
                status.put("deliveryCount", deliveryCount);
            } catch (IOException e) {
                log.error("读取日志文件失败", e);
            }
        }

        return ResponseEntity.ok(status);
    }

    @GetMapping("/simple-status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getSimpleStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("isRunning", isRunning);
        status.put("logFile", currentLogFile);

        // 获取投递统计 - 支持多个日志文件
        long deliveryCount = 0;

        // 1. 检查当前日志文件
        if (currentLogFile != null && Files.exists(Paths.get(currentLogFile))) {
            try {
                String content = new String(Files.readAllBytes(Paths.get(currentLogFile)), StandardCharsets.UTF_8);
                deliveryCount += countOccurrences(content, "投递完成");
            } catch (IOException e) {
                log.error("读取当前日志文件失败", e);
            }
        }

        // 2. 检查/tmp目录下所有Boss投递日志文件
        try {
            java.io.File tmpDir = new java.io.File("/tmp");
            java.io.File[] logFiles = tmpDir.listFiles((dir, name) ->
                name.startsWith("boss_delivery_") && name.endsWith(".log"));

            log.info("【投递统计】找到 {} 个日志文件", logFiles == null ? 0 : logFiles.length);

            if (logFiles != null && logFiles.length > 0) {
                for (java.io.File logFile : logFiles) {
                    try {
                        String content = new String(Files.readAllBytes(logFile.toPath()), StandardCharsets.UTF_8);
                        long count = countOccurrences(content, "投递完成");
                        deliveryCount += count;
                        log.info("【投递统计】从日志文件 {} 统计到 {} 次投递（文件大小: {} bytes）", logFile.getName(), count, content.length());
                    } catch (IOException e) {
                        log.error("读取Boss日志文件失败: {}", logFile.getAbsolutePath(), e);
                    }
                }
            }
        } catch (Exception e) {
            log.error("统计投递数量时出错", e);
        }

        status.put("deliveryCount", deliveryCount);
        log.info("【投递统计】当前总投递数量: {}", deliveryCount);

        return ResponseEntity.ok(status);
    }

    /**
     * 统计字符串中某个子字符串出现的次数
     */
    private long countOccurrences(String text, String pattern) {
        if (text == null || pattern == null || text.isEmpty() || pattern.isEmpty()) {
            return 0;
        }
        long count = 0;
        int index = 0;
        while ((index = text.indexOf(pattern, index)) != -1) {
            count++;
            index += pattern.length();
        }
        return count;
    }

    @GetMapping("/logs")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getLogs(@RequestParam(defaultValue = "50") int lines) {
        Map<String, Object> response = new HashMap<>();

        if (currentLogFile == null || !Files.exists(Paths.get(currentLogFile))) {
            response.put("success", false);
            response.put("message", "日志文件不存在");
            return ResponseEntity.ok(response);
        }

        try {
            List<String> logLines = Files.readAllLines(Paths.get(currentLogFile));
            int startIndex = Math.max(0, logLines.size() - lines);
            List<String> recentLogs = logLines.subList(startIndex, logLines.size());

            response.put("success", true);
            response.put("logs", recentLogs);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("读取日志失败", e);
            response.put("success", false);
            response.put("message", "读取日志失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    private Map<String, Object> loadConfig() throws IOException {
        File configFile = new File(CONFIG_PATH);
        if (!configFile.exists()) {
            // 如果配置文件不存在，返回默认配置
            return getDefaultConfig();
        }

        return yamlMapper.readValue(configFile, Map.class);
    }

    private Map<String, Object> getDefaultConfig() {
        Map<String, Object> config = new HashMap<>();

        // 🔧 统一字段：只使用bossConfig（已删除boss字段）
        Map<String, Object> bossConfig = new HashMap<>();
        bossConfig.put("keywords", Arrays.asList("市场总监", "市场营销", "品牌营销"));
        bossConfig.put("cities", Arrays.asList("上海"));
        bossConfig.put("experienceRequirement", "10年以上");
        bossConfig.put("jobType", "不限");
        bossConfig.put("salaryRange", Map.of("minSalary", 30, "maxSalary", 50, "unit", "K"));
        bossConfig.put("educationRequirement", "不限");
        bossConfig.put("companySize", Arrays.asList("不限"));
        bossConfig.put("financingStage", Arrays.asList("不限"));
        bossConfig.put("industry", Arrays.asList("不限"));
        bossConfig.put("filterDeadHR", false);  // 默认不过滤，让用户投递更多岗位
        bossConfig.put("enableSmartGreeting", true);
        bossConfig.put("defaultGreeting", ""); // 空字符串，强制用户生成个性化打招呼语
        config.put("bossConfig", bossConfig);

        // AI配置
        Map<String, Object> ai = new HashMap<>();
        ai.put("introduce", "拥有18年经验的复合型增长负责人...");
        ai.put("prompt", "我目前在找工作,%s,我期望的的岗位方向是【市场营销】...");
        config.put("ai", ai);

        // Bot配置
        Map<String, Object> bot = new HashMap<>();
        bot.put("is_send", false);
        config.put("bot", bot);

        return config;
    }

    /**
     * 获取用户配置 - RESTful API
     */
    @GetMapping("/api/config")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getUserConfig() {
        try {
            // ✅ 使用兼容方法查找配置文件（支持新旧格式）
            java.io.File configFile = util.UserDataPathUtil.getConfigFile();
            String safeUserId = util.UserDataPathUtil.getSafeUserId();
            Map<String, Object> config;

            if (configFile.exists()) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                config = mapper.readValue(configFile, Map.class);
                log.info("✅ 从文件加载用户配置: userId={}, path={}", safeUserId, configFile.getAbsolutePath());
            } else {
                config = getDefaultConfig();
                log.info("📋 使用默认配置: userId={}", safeUserId);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("config", config);
            response.put("userId", safeUserId);

            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            log.error("用户ID安全验证失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "安全验证失败: " + e.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            log.error("加载用户配置失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "加载配置失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 保存用户配置 - RESTful API
     */
    @PostMapping("/api/config")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveUserConfig(@RequestBody Map<String, Object> config) {
        try {
            // ✅ 使用新的统一工具类
            String userId = util.UserContextUtil.getCurrentUserId();
            String safeUserId = util.UserDataPathUtil.getSafeUserId();
            String configPath = util.UserDataPathUtil.getConfigPath();

            // 获取用户信息
            String userEmail = util.UserContextUtil.getCurrentUserEmail();
            String username = util.UserContextUtil.getCurrentUsername();

            config.put("userId", safeUserId);  // ✅ 保存清理后的ID
            config.put("userEmail", userEmail);
            config.put("username", username);
            config.put("lastModified", System.currentTimeMillis());

            // ✅ 确保用户目录存在
            util.UserDataPathUtil.ensureUserDataDirExists();

            // 保存配置
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.writerWithDefaultPrettyPrinter().writeValue(new java.io.File(configPath), config);

            log.info("✅ 用户配置保存成功: userId={}, email={}, path={}", safeUserId, userEmail, configPath);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "用户配置保存成功");
            response.put("userId", safeUserId);
            return ResponseEntity.ok(response);

        } catch (SecurityException e) {
            log.error("用户ID安全验证失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "安全验证失败: " + e.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            log.error("保存用户配置失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "保存失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 获取用户AI配置 - RESTful API
     */
    @GetMapping("/api/ai-config")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getUserAiConfig() {
        try {
            Map<String, Object> aiConfig = userDataService.loadUserAiConfig();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("config", aiConfig);

            String userId = UserContextUtil.getCurrentUserId();
            log.info("✅ 用户AI配置加载成功: userId={}", userId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("加载用户AI配置失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "加载AI配置失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 保存用户AI配置 - RESTful API
     */
    @PostMapping("/api/ai-config")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveUserAiConfig(@RequestBody Map<String, Object> aiConfig) {
        try {
            boolean success = userDataService.saveUserAiConfig(aiConfig);

            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("success", true);
                response.put("message", "用户AI配置保存成功");

                String userId = UserContextUtil.getCurrentUserId();
                log.info("✅ 用户AI配置保存成功: userId={}", userId);

                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "保存失败：用户未登录");
                return ResponseEntity.status(403).body(response);
            }
        } catch (Exception e) {
            log.error("保存用户AI配置失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "保存AI配置失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 获取用户简历
     */
    @GetMapping("/api/resume")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getUserResume() {
        try {
            String resumeContent = userDataService.loadUserResume();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("content", resumeContent);

            String userId = UserContextUtil.getCurrentUserId();
            log.info("✅ 用户简历加载成功: userId={}, length={}", userId, resumeContent.length());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("加载用户简历失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "加载简历失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 保存用户简历
     */
    @PostMapping("/api/resume")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveUserResume(@RequestBody Map<String, String> request) {
        try {
            String resumeContent = request.get("content");
            if (resumeContent == null) {
                resumeContent = "";
            }

            boolean success = userDataService.saveUserResume(resumeContent);

            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("success", true);
                response.put("message", "用户简历保存成功");

                String userId = UserContextUtil.getCurrentUserId();
                log.info("✅ 用户简历保存成功: userId={}, length={}", userId, resumeContent.length());

                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "保存失败：用户未登录");
                return ResponseEntity.status(403).body(response);
            }
        } catch (Exception e) {
            log.error("保存用户简历失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "保存简历失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 生成日志文件名
     * @param prefix 日志文件前缀
     * @return 完整的日志文件路径
     */
    private String generateLogFileName(String prefix) {
        return new java.io.File("logs/" + prefix + "_" +
            new java.text.SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date()) + ".log").getAbsolutePath();
    }
}
