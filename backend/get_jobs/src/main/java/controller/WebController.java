package controller;

import java.io.BufferedReader;
import java.nio.charset.StandardCharsets;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;
import java.nio.charset.StandardCharsets;

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

    private final String CONFIG_PATH = "src/main/resources/config.yaml";
    private final ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());

    @Autowired
    private UserDataService userDataService;

    @Autowired
    private BossExecutionService bossExecutionService;

    // 存储程序运行状态
    private volatile boolean isRunning = false;
    private Process currentProcess;
    private String currentLogFile;

    @GetMapping("/")
    public String index(Model model, HttpServletRequest request, HttpServletResponse response) {
        try {
            // 移除登录检查 - 无需认证即可访问
            /*
            if (!UserContextUtil.isAuthenticated()) {
                log.warn("未登录用户试图访问后台管理页面，重定向到登录页面");

                // 检查是否为AJAX请求
                String requestedWith = request.getHeader("X-Requested-With");
                String acceptHeader = request.getHeader("Accept");

                if ("XMLHttpRequest".equals(requestedWith) ||
                    (acceptHeader != null && acceptHeader.contains("application/json"))) {
                    // AJAX请求返回JSON错误
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    try {
                        response.getWriter().write(
                            "{\"success\":false,\"message\":\"需要登录认证\",\"redirectTo\":\"" + request.getScheme() + "://" + request.getServerName() + (request.getServerPort() != 80 && request.getServerPort() != 443 ? ":" + request.getServerPort() : "") + "/login\"}"
                        );
                        return new String[0];
                    } catch (IOException e) {
                        log.error("返回JSON错误响应失败", e);
                    }
                } else {
                    // 浏览器请求重定向到首页登录
                    return "redirect:" + request.getScheme() + "://" + request.getServerName() + (request.getServerPort() != 80 && request.getServerPort() != 443 ? ":" + request.getServerPort() : "") + "/login";
                }
            }
<<<<<<< HEAD

            // 已登录用户，显示后台管理页面
            String userId = UserContextUtil.getCurrentUserId();
            String userEmail = UserContextUtil.getCurrentUserEmail();
            log.info("已登录用户访问后台管理: userId={}, email={}", userId, userEmail);

=======
            */

            // 无需登录，直接显示后台管理页面
            String userId = "anonymous";
            String userEmail = "anonymous@example.com";
            log.info("访客访问后台管理: userId={}, email={}", userId, userEmail);
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

    @PostMapping("/save-config")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveConfig(@RequestBody Map<String, Object> config) {
        try {
            // 使用用户数据服务保存配置
            boolean success = userDataService.saveUserConfig(config);

            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("success", true);
                response.put("message", "配置保存成功");

                // 记录用户信息（兼容安全认证禁用的情况）
                String userId = UserContextUtil.getCurrentUserId();
                String userEmail = UserContextUtil.getCurrentUserEmail();
                if (userId == null) {
                    userId = "default_user";
                    userEmail = "demo@example.com";
                }
                log.info("✅ 用户配置保存成功: userId={}, email={}", userId, userEmail);

                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "保存配置失败：用户未登录或权限不足");
                return ResponseEntity.status(403).body(response);
            }
        } catch (Exception e) {
            log.error("保存配置失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "保存配置失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/start-boss-task")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> startBossTask() {
        if (isRunning) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Boss任务已在运行中");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            isRunning = true;

            // 生成日志文件名
            currentLogFile = generateLogFileName("boss_web");

            log.info("Web UI启动Boss任务开始");

            // 确保日志目录存在
            File logsDir = new File("logs");
            if (!logsDir.exists()) {
                logsDirif (!.mkdirs()) { log.warn("创建目录失败"); }
            }

            // 创建日志文件
            java.io.FileWriter logWriter = new java.io.FileWriter(currentLogFile, StandardCharsets.UTF_8);

            // Boss执行服务已通过@Autowired注入

            // 使用Boss执行服务
            bossExecutionService.executeBossProgram(currentLogFile)
                .whenComplete((result, throwable) -> {
                    try {
                        if (throwable != null) {
                            logWriter.write(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()) + " - Boss程序执行异常: " + throwable.getMessage() + "%n");
                            log.error("Boss程序执行异常", throwable);
                        } else {
                            logWriter.write(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()) + " - Boss程序执行完成%n");
                        }
                        logWriter.write(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()) + " - 投递任务结束%n");
                        logWriter.flush();
                        logWriter.close();
                    } catch (Exception e) {
                        log.error("写入最终日志失败", e);
                    } finally {
                        isRunning = false;
                    }
                });

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Boss任务启动成功");
            response.put("logFile", currentLogFile);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("启动Boss任务失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "启动Boss任务失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/start-boss-task-with-ui")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> startBossTaskWithUI() {
        if (isRunning) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Boss任务已在运行中");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            isRunning = true;
            currentLogFile = "boss_web_ui_" + System.currentTimeMillis() + ".log";

            // 使用有头模式启动Boss程序
            bossExecutionService.executeBossProgram(currentLogFile, false); // false = 有头模式

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("logFile", currentLogFile);
            response.put("message", "Boss任务已启动（有头模式），请在弹出的浏览器窗口中完成登录");
            return ResponseEntity.ok(response);
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
                logsDirif (!.mkdirs()) { log.warn("创建目录失败"); }
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

        // Boss配置
        Map<String, Object> boss = new HashMap<>();
        boss.put("debugger", false);
        boss.put("sayHi", "您好！我对这个岗位非常感兴趣...");
        boss.put("keywords", Arrays.asList("市场总监", "市场营销", "品牌营销"));
        boss.put("industry", Arrays.asList("不限"));
        boss.put("cityCode", Arrays.asList("上海"));
        boss.put("experience", Arrays.asList("10年以上"));
        boss.put("jobType", "不限");
        boss.put("salary", "30K以上");
        boss.put("degree", Arrays.asList("不限"));
        boss.put("scale", Arrays.asList("不限"));
        boss.put("stage", Arrays.asList("不限"));
        boss.put("expectedSalary", Arrays.asList(30, 50));
        boss.put("waitTime", 10);
        boss.put("filterDeadHR", true);
        boss.put("enableAI", false);
        boss.put("sendImgResume", false);
        boss.put("deadStatus", Arrays.asList("2周内活跃", "本月活跃", "2月内活跃", "半年前活跃"));
        config.put("boss", boss);

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
            Map<String, Object> config = userDataService.loadUserConfig();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("config", config);

            String userId = UserContextUtil.getCurrentUserId();
            log.info("✅ 用户配置加载成功: userId={}", userId);

            return ResponseEntity.ok(response);
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
            boolean success = userDataService.saveUserConfig(config);

            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("success", true);
                response.put("message", "用户配置保存成功");

                String userId = UserContextUtil.getCurrentUserId();
                String userEmail = UserContextUtil.getCurrentUserEmail();
                log.info("✅ 用户配置保存成功: userId={}, email={}", userId, userEmail);

                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "保存失败：用户未登录");
                return ResponseEntity.status(403).body(response);
            }
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
