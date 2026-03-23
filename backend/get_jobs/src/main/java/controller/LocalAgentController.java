package controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import dto.ApiResponse;
import service.LocalAgentService;
import service.LocalAgentJobSearchService;
import util.UserContextUtil;

/**
 * 本地Agent REST API控制器
 * 提供Token生成、状态查询等接口
 *
 * @author ZhiTouJianLi Team
 * @since 2025-12
 */
@RestController
@RequestMapping("/api/local-agent")
public class LocalAgentController {

    private static final Logger log = LoggerFactory.getLogger(LocalAgentController.class);

    @Autowired
    private LocalAgentService localAgentService;

    @Autowired
    private LocalAgentJobSearchService jobSearchService;

    private LocalAgentService.LocalAgentWebSocketHandler webSocketHandler;

    @Autowired
    public void setWebSocketHandler(@Lazy LocalAgentService.LocalAgentWebSocketHandler handler) {
        this.webSocketHandler = handler;
    }

    /**
     * 生成Agent Token
     * 用户在本地Agent启动时使用此Token进行认证
     *
     * @return Token和使用说明
     */
    @PostMapping("/token")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateToken(HttpServletRequest request) {
        try {
            String userId = UserContextUtil.getCurrentUserId();
            log.info("📝 生成Agent Token: userId={}", userId);

            // ✅ 修复：检查服务是否可用
            if (localAgentService == null) {
                log.error("❌ LocalAgentService未初始化");
                return ResponseEntity.status(500)
                    .body(ApiResponse.error("服务未初始化，请稍后重试"));
            }

            String token = localAgentService.generateAgentToken(userId);
            String serverUrl = buildLocalAgentWebSocketUrl(request);

            Map<String, Object> data = new HashMap<>();
            data.put("token", token);
            data.put("expiresIn", 2592000); // 30天
            data.put("serverUrl", serverUrl);
            String safeUrl = serverUrl.replace("\"", "'");
            data.put("usage", String.format(
                    "python3 boss_local_agent.py --token %s --server \"%s\"", token, safeUrl));

            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (SecurityException e) {
            // ✅ 修复：SecurityException应该返回401，由全局异常处理器处理
            // 但为了更好的错误信息，这里也处理一下
            log.warn("生成Token失败：用户未认证: {}", e.getMessage());
            return ResponseEntity.status(401)
                .body(ApiResponse.error("需要登录认证，请先登录"));
        } catch (Exception e) {
            log.error("生成Token失败: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("生成Token失败: " + e.getMessage()));
        }
    }

    /**
     * 撤销Agent Token
     *
     * @param token Token
     */
    @DeleteMapping("/token")
    public ResponseEntity<ApiResponse<Void>> revokeToken(@RequestParam String token) {
        log.info("📝 撤销Agent Token");

        try {
            localAgentService.revokeAgentToken(token);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            log.error("撤销Token失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error("撤销Token失败: " + e.getMessage()));
        }
    }

    /**
     * 获取Agent状态
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAgentStatus() {
        try {
            String userId = UserContextUtil.getCurrentUserId();

            // ✅ 修复：检查服务是否可用
            if (localAgentService == null) {
                log.error("❌ LocalAgentService未初始化");
                return ResponseEntity.status(500)
                    .body(ApiResponse.error("服务未初始化，请稍后重试"));
            }

            Map<String, Object> status = localAgentService.getAgentStatus(userId);
            return ResponseEntity.ok(ApiResponse.success(status));
        } catch (SecurityException e) {
            log.warn("获取Agent状态失败：用户未认证: {}", e.getMessage());
            return ResponseEntity.status(401)
                .body(ApiResponse.error("需要登录认证，请先登录"));
        } catch (NullPointerException e) {
            log.error("获取Agent状态失败：空指针异常", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("服务内部错误，请稍后重试"));
        } catch (Exception e) {
            log.error("获取状态失败: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("获取状态失败: " + e.getMessage()));
        }
    }

    /**
     * 检查Agent是否在线
     */
    @GetMapping("/online")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkOnline() {
        String userId = UserContextUtil.getCurrentUserId();
        boolean online = webSocketHandler.isAgentOnline(userId);

        Map<String, Object> data = Map.of(
            "online", online,
            "userId", userId
        );

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * 创建投递任务
     *
     * @param request 任务请求
     */
    @PostMapping("/task/delivery")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createDeliveryTask(
            @RequestBody Map<String, Object> request) {
        String userId = UserContextUtil.getCurrentUserId();

        try {
            String jobUrl = (String) request.get("jobUrl");
            String jobName = (String) request.get("jobName");
            String companyName = (String) request.get("companyName");
            String greeting = (String) request.get("greeting");
            @SuppressWarnings("unchecked")
            Map<String, Object> config = (Map<String, Object>) request.get("config");

            String taskId = localAgentService.createDeliveryTask(
                userId, jobUrl, jobName, companyName, greeting, config
            );

            if (taskId == null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("创建任务失败，请确保本地Agent已连接"));
            }

            Map<String, Object> data = Map.of(
                "taskId", taskId,
                "status", "sent"
            );

            return ResponseEntity.ok(ApiResponse.success(data));

        } catch (Exception e) {
            log.error("创建任务失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error("创建任务失败: " + e.getMessage()));
        }
    }

    /**
     * 启动本地Agent投递
     * 搜索职位并下发任务给本地Agent
     */
    @PostMapping("/delivery/start")
    public ResponseEntity<ApiResponse<Map<String, Object>>> startLocalDelivery() {
        try {
            String userId = UserContextUtil.getCurrentUserId();
            log.info("📝 启动本地Agent投递: userId={}", userId);

            // 检查Agent是否在线
            if (!webSocketHandler.isAgentOnline(userId)) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("本地Agent未连接，请先启动Agent"));
            }

            // 使用职位搜索服务搜索并下发任务
            int dispatchedCount = jobSearchService.searchAndDispatchJobs(userId);

            if (dispatchedCount == 0) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("未能下发任何任务，请检查配置（关键词、城市等）"));
            }

            Map<String, Object> data = new HashMap<>();
            data.put("taskCount", dispatchedCount);
            data.put("message", String.format("已下发 %d 个投递任务到本地Agent", dispatchedCount));

            log.info("✅ 投递任务已下发: userId={}, count={}", userId, dispatchedCount);
            return ResponseEntity.ok(ApiResponse.success(data));

        } catch (SecurityException e) {
            log.warn("启动投递失败：用户未认证: {}", e.getMessage());
            return ResponseEntity.status(401)
                .body(ApiResponse.error("需要登录认证，请先登录"));
        } catch (Exception e) {
            log.error("启动投递失败: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("启动投递失败: " + e.getMessage()));
        }
    }

    /**
     * 停止本地Agent投递
     */
    @PostMapping("/delivery/stop")
    public ResponseEntity<ApiResponse<Void>> stopLocalDelivery() {
        try {
            String userId = UserContextUtil.getCurrentUserId();
            log.info("📝 停止本地Agent投递: userId={}", userId);

            // TODO: 实现停止逻辑，取消待处理的任务
            // localAgentService.cancelPendingTasks(userId);

            return ResponseEntity.ok(ApiResponse.success(null));

        } catch (Exception e) {
            log.error("停止投递失败: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("停止投递失败: " + e.getMessage()));
        }
    }

    /**
     * 获取系统统计（管理员）
     */
    @GetMapping("/admin/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemStats() {
        try {
            Map<String, Object> stats = localAgentService.getSystemStats();
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            log.error("获取统计失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error("获取统计失败: " + e.getMessage()));
        }
    }

    /**
     * 下载本地Agent程序
     * GET /api/local-agent/download
     */
    @GetMapping("/download")
    public ResponseEntity<?> downloadLocalAgent() {
        try {
            // 查找local-agent.zip文件
            String[] possiblePaths = {
                "src/main/resources/static/downloads/local-agent.zip",
                "target/classes/static/downloads/local-agent.zip",
                "static/downloads/local-agent.zip",
                "downloads/local-agent.zip"
            };

            File zipFile = null;
            for (String path : possiblePaths) {
                File file = new File(path);
                if (file.exists() && file.isFile()) {
                    zipFile = file;
                    log.info("✅ 找到local-agent.zip文件: {}", file.getAbsolutePath());
                    break;
                }
            }

            if (zipFile == null) {
                log.error("❌ 未找到local-agent.zip文件");
                return ResponseEntity.status(404)
                    .body(Map.of(
                        "success", false,
                        "message", "系统错误: No static resource local-agent.zip."
                    ));
            }

            // 读取文件内容
            Path filePath = zipFile.toPath();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                log.error("❌ 文件不可读: {}", zipFile.getAbsolutePath());
                return ResponseEntity.status(404)
                    .body(Map.of(
                        "success", false,
                        "message", "系统错误: No static resource local-agent.zip."
                    ));
            }

            // 设置响应头
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"local-agent.zip\"");
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentLength(zipFile.length());

            log.info("✅ 开始下载local-agent.zip: {} ({} bytes)", zipFile.getAbsolutePath(), zipFile.length());

            return ResponseEntity.ok()
                .headers(headers)
                .body(resource);

        } catch (IOException e) {
            log.error("❌ 下载local-agent.zip失败", e);
            return ResponseEntity.status(500)
                .body(Map.of(
                    "success", false,
                    "message", "系统错误: " + e.getMessage()
                ));
        } catch (Exception e) {
            log.error("❌ 下载local-agent.zip失败", e);
            return ResponseEntity.status(500)
                .body(Map.of(
                    "success", false,
                    "message", "系统错误: " + e.getMessage()
                ));
        }
    }

    /**
     * 根据当前 HTTP 请求构造本地 Agent WebSocket URL，使 Token 与 WS 始终指向同一后端实例。
     */
    private static String buildLocalAgentWebSocketUrl(HttpServletRequest request) {
        String scheme = firstCsvHeaderValue(request.getHeader("X-Forwarded-Proto"));
        if (scheme == null || scheme.isEmpty()) {
            scheme = request.getScheme();
        }
        String host = firstCsvHeaderValue(request.getHeader("X-Forwarded-Host"));
        if (host == null || host.isEmpty()) {
            host = firstCsvHeaderValue(request.getHeader("Host"));
        }
        if (host == null || host.isEmpty()) {
            int port = request.getServerPort();
            String portPart = (port == 80 || port == 443) ? "" : (":" + port);
            host = request.getServerName() + portPart;
        }
        String wsScheme = "https".equalsIgnoreCase(scheme) ? "wss" : "ws";
        return wsScheme + "://" + host + "/ws/local-agent";
    }

    /**
     * 取转发头中的第一个值（部分代理会传 {@code https, http} 等多值串）。
     */
    private static String firstCsvHeaderValue(String raw) {
        if (raw == null || raw.isEmpty()) {
            return null;
        }
        int comma = raw.indexOf(',');
        String first = comma < 0 ? raw : raw.substring(0, comma);
        first = first.trim();
        return first.isEmpty() ? null : first;
    }
}
