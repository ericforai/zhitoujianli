package controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;
import service.BossVerificationCodeService;
import util.UserContextUtil;

/**
 * 验证码控制器
 * 用于处理Boss直聘验证码的截图显示和用户输入
 */
@RestController
@RequestMapping("/api/verification-code")
@Slf4j
public class VerificationCodeController {

    @Autowired
    private BossVerificationCodeService bossVerificationCodeService;

    /**
     * 获取验证码请求信息（前端轮询使用）
     * GET /api/verification-code/request?requestId=xxx
     */
    @GetMapping("/request")
    public ResponseEntity<?> getVerificationRequest(@RequestParam String requestId) {
        try {
            BossVerificationCodeService.VerificationRequest request =
                bossVerificationCodeService.getVerificationRequest(requestId);

            if (request == null) {
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "验证码请求不存在或已过期"
                ));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("requestId", requestId);
            response.put("userId", request.getUserId());
            response.put("jobName", request.getJobName());
            response.put("screenshotUrl", bossVerificationCodeService.getScreenshotUrl(request.getScreenshotPath()));
            response.put("taskId", request.getTaskId());
            response.put("timestamp", request.getTimestamp());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("获取验证码请求失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "服务器错误"));
        }
    }

    /**
     * 根据userId和taskId获取验证码请求（前端使用）
     * GET /api/verification-code/request-by-task?taskId=xxx
     */
    @GetMapping("/request-by-task")
    public ResponseEntity<?> getVerificationRequestByTask(@RequestParam String taskId) {
        try {
            String userId = UserContextUtil.getCurrentUserId();
            BossVerificationCodeService.VerificationRequest request =
                bossVerificationCodeService.getVerificationRequestByUserAndTask(userId, taskId);

            if (request == null) {
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "验证码请求不存在或已过期"
                ));
            }

            // 找到对应的requestId
            String requestId = null;
            for (Map.Entry<String, BossVerificationCodeService.VerificationRequest> entry :
                 bossVerificationCodeService.getVerificationRequests().entrySet()) {
                if (entry.getValue() == request) {
                    requestId = entry.getKey();
                    break;
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("requestId", requestId);
            response.put("userId", request.getUserId());
            response.put("jobName", request.getJobName());
            response.put("screenshotUrl", bossVerificationCodeService.getScreenshotUrl(request.getScreenshotPath()));
            response.put("taskId", request.getTaskId());
            response.put("timestamp", request.getTimestamp());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("获取验证码请求失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "服务器错误"));
        }
    }

    /**
     * 提交验证码（用户输入）
     * POST /api/verification-code/submit
     * Body: { "requestId": "xxx", "code": "123456" }
     */
    @PostMapping("/submit")
    public ResponseEntity<?> submitVerificationCode(@RequestBody Map<String, String> request) {
        try {
            String requestId = request.get("requestId");
            String code = request.get("code");

            if (requestId == null || code == null || code.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "请求ID和验证码不能为空"));
            }

            // 获取验证码请求信息
            BossVerificationCodeService.VerificationRequest verificationRequest =
                bossVerificationCodeService.getVerificationRequest(requestId);

            if (verificationRequest == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "验证码请求不存在或已过期"));
            }

            // 提交验证码
            boolean success = bossVerificationCodeService.submitVerificationCode(requestId, code);

            if (success) {
                // ✅ 将验证码写入响应文件，供Boss程序读取
                String responseFile = System.getProperty("java.io.tmpdir") +
                    java.io.File.separator +
                    "boss_verification_response_" +
                    verificationRequest.getUserId().replaceAll("[^a-zA-Z0-9]", "_") + "_" +
                    verificationRequest.getTaskId() + ".json";

                JSONObject responseData = new JSONObject();
                responseData.put("code", code);
                responseData.put("timestamp", System.currentTimeMillis());

                java.nio.file.Files.write(
                    java.nio.file.Paths.get(responseFile),
                    responseData.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8)
                );

                log.info("✅ 验证码已写入响应文件: responseFile={}, code={}", responseFile, code);

                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "验证码提交成功"
                ));
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "验证码请求不存在或已过期"));
            }
        } catch (Exception e) {
            log.error("提交验证码失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "服务器错误"));
        }
    }

    /**
     * 获取验证码截图（图片文件）
     * GET /api/verification-code/screenshot?path=/path/to/screenshot.png
     */
    @GetMapping("/screenshot")
    public ResponseEntity<?> getScreenshot(@RequestParam String path) {
        try {
            // 安全检查：确保路径在允许的目录内
            Path screenshotPath = Paths.get(path).normalize();
            String allowedDir = System.getProperty("java.io.tmpdir");
            if (!screenshotPath.startsWith(Paths.get(allowedDir))) {
                log.warn("❌ 非法的截图路径访问: {}", path);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "非法的文件路径"));
            }

            File file = screenshotPath.toFile();
            if (!file.exists() || !file.isFile()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "截图文件不存在"));
            }

            byte[] imageBytes = Files.readAllBytes(screenshotPath);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setContentLength(imageBytes.length);
            headers.setCacheControl("no-cache, no-store, must-revalidate");
            headers.setPragma("no-cache");
            headers.setExpires(0);

            return ResponseEntity.ok()
                .headers(headers)
                .body(imageBytes);
        } catch (IOException e) {
            log.error("读取截图文件失败: {}", path, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "读取截图文件失败"));
        } catch (Exception e) {
            log.error("获取截图失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "服务器错误"));
        }
    }
}

