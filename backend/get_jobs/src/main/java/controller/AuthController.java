package controller;

import cn.authing.sdk.java.client.ManagementClient;
import cn.authing.sdk.java.client.AuthenticationClient;
import cn.authing.sdk.java.dto.CreateUserReqDto;
import cn.authing.sdk.java.dto.UserSingleRespDto;
import cn.authing.sdk.java.dto.SignInOptionsDto;
import com.superxiang.dto.ErrorResponse;
import config.AuthingConfig;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * 身份认证控制器 - 使用Authing REST API
 *
 * @author ZhiTouJianLi Team
 * @since 2025-09-30
 */
@RestController
@RequestMapping("/api/auth")
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class AuthController {

    @Autowired
    private AuthingConfig authingConfig;

    @Autowired
    private Dotenv dotenv;

    @Autowired
    private ManagementClient managementClient;
    
    @Autowired
    private AuthenticationClient authenticationClient;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 获取安全认证状态
     */
    @GetMapping("/security-status")
    public ResponseEntity<Map<String, Object>> getSecurityStatus() {
        Map<String, Object> response = new HashMap<>();
        boolean securityEnabled = Boolean.parseBoolean(dotenv.get("SECURITY_ENABLED", "true"));

        response.put("enabled", securityEnabled);
        response.put("message", securityEnabled ? "安全认证已启用" : "安全认证已禁用");

        return ResponseEntity.ok(response);
    }

    /**
     * 邮箱密码注册
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            String username = request.get("username");

            if (email == null || password == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "邮箱和密码不能为空"));
            }

            if (password.length() < 6) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "密码长度至少6位"));
            }

            // 检查Authing配置
            String appId = authingConfig.getAppId();
            String appHost = authingConfig.getAppHost();

            if (appId.isEmpty() || appHost.equals("https://your-domain.authing.cn")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Authing配置不完整，请检查.env文件"));
            }

            // 使用Authing ManagementClient创建用户
            CreateUserReqDto createUserReq = new CreateUserReqDto();
            createUserReq.setEmail(email);
            createUserReq.setPassword(password);
            if (username != null && !username.isEmpty()) {
                createUserReq.setNickname(username);
            }

            UserSingleRespDto userResp = managementClient.createUser(createUserReq);

            if (userResp != null && userResp.getData() != null && userResp.getData().getUserId() != null) {
                log.info("✅ 用户注册成功，邮箱: {}, 用户ID: {}", email, userResp.getData().getUserId());

                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "注册成功，请登录",
                    "userId", userResp.getData().getUserId()
                ));
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "注册失败"));
            }
        } catch (Exception e) {
            log.error("❌ 注册失败", e);
            String errorMsg = e.getMessage();
            if (errorMsg != null && errorMsg.contains("409")) {
                errorMsg = "该邮箱已被注册";
            }
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "注册失败: " + errorMsg));
        }
    }

    /**
     * 邮箱密码登录
     */
    @PostMapping("/login/email")
    public ResponseEntity<?> loginByEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");

            if (email == null || password == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "邮箱和密码不能为空"));
            }

            // 检查Authing配置
            String appId = authingConfig.getAppId();
            String appHost = authingConfig.getAppHost();

            if (appId.isEmpty() || appHost.equals("https://your-domain.authing.cn")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Authing配置不完整，请检查.env文件"));
            }

            // 使用Authing AuthenticationClient进行登录
            log.info("🔐 尝试登录，邮箱: {}", email);
            
            // 使用AuthenticationClient进行登录
            SignInOptionsDto options = new SignInOptionsDto();
            Map<String, Object> loginResult = authenticationClient.signInByEmailPassword(email, password, options);
            
            log.info("📥 登录响应: {}", loginResult);

            if (loginResult != null && loginResult.get("access_token") != null) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("token", loginResult.get("access_token"));
                result.put("refreshToken", loginResult.get("refresh_token"));
                result.put("expiresIn", loginResult.get("expires_in"));
                result.put("user", Map.of(
                    "userId", loginResult.get("sub") != null ? loginResult.get("sub") : "unknown",
                    "email", email,
                    "username", loginResult.get("nickname") != null ? loginResult.get("nickname") : email
                ));

                log.info("✅ 用户登录成功，邮箱: {}", email);
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "登录失败，请检查邮箱和密码"));
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("❌ 登录失败: {}", e.getResponseBodyAsString(), e);
            return handleHttpClientError(e, "该邮箱已被注册", "登录失败，请检查邮箱和密码");
        } catch (Exception e) {
            log.error("❌ 登录异常", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "message", "服务器内部错误"));
        }
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/user/info")
    public ResponseEntity<Map<String, Object>> getCurrentUserInfo() {
        try {
            Map<String, Object> userInfo = util.UserContextUtil.getCurrentUserInfo();

            if (userInfo != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("user", userInfo);

                log.info("✅ 获取用户信息成功: userId={}", userInfo.get("userId"));
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "用户未登录"));
            }
        } catch (Exception e) {
            log.error("获取用户信息失败", e);
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "服务器错误"));
        }
    }

    /**
     * 健康检查接口
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, Object> response = new HashMap<>();
        String appId = authingConfig.getAppId();
        String userPoolId = authingConfig.getUserPoolId();
        String appHost = authingConfig.getAppHost();

        boolean isConfigured = !appId.isEmpty() && !userPoolId.isEmpty() &&
                              !appHost.equals("https://your-domain.authing.cn");

        response.put("success", true);
        response.put("authingConfigured", isConfigured);
        response.put("appId", appId);
        response.put("userPoolId", userPoolId);
        response.put("appHost", appHost);
        response.put("message", isConfigured ? "✅ Authing配置正常" : "⚠️ Authing配置不完整");

        return ResponseEntity.ok(response);
    }

    private ResponseEntity<ErrorResponse> buildErrorResponse(HttpStatus status, String message) {
        return ResponseEntity.status(status)
                .body(ErrorResponse.builder().success(false).message(message).build());
    }

    private ResponseEntity<ErrorResponse> buildConfigErrorResponse() {
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "认证服务配置不完整，请联系管理员");
    }

    private ResponseEntity<ErrorResponse> handleHttpClientError(HttpClientErrorException e, String conflictMessage, String defaultMessage) {
        HttpStatusCode statusCode = e.getStatusCode();
        if (statusCode.value() == 409) { // 409
            return buildErrorResponse(HttpStatus.CONFLICT, conflictMessage);
        }
        if (statusCode.value() == 401 || statusCode.value() == 400) { // 401, 400
             return buildErrorResponse(HttpStatus.UNAUTHORIZED, defaultMessage);
        }
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "认证服务通信失败");
    }
}
