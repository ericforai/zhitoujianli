package controller;

import cn.authing.sdk.java.client.AuthenticationClient;
import cn.authing.sdk.java.dto.*;
import config.AuthingConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 身份认证控制器
 * 
 * 提供多种登录方式：
 * 1. 手机号验证码登录
 * 2. 邮箱密码登录
 * 3. 微信扫码登录
 * 4. 支付宝登录
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

    /**
     * 发送手机验证码
     * 
     * POST /api/auth/send-code
     * Body: { "phone": "13800138000" }
     */
    @PostMapping("/send-code")
    public ResponseEntity<?> sendPhoneCode(@RequestBody Map<String, String> request) {
        try {
            String phone = request.get("phone");
            
            if (phone == null || phone.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "手机号不能为空"));
            }
            
            // 简单的手机号格式验证
            if (!phone.matches("^1[3-9]\\d{9}$")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "手机号格式不正确"));
            }
            
            AuthenticationClient client = new AuthenticationClient();
            client.setAppId(authingConfig.getAppId());
            
            SendSMSDto dto = new SendSMSDto();
            dto.setPhoneNumber(phone);
            
            SendSMSRespDto result = client.sendSms(dto);
            
            log.info("验证码发送成功，手机号: {}", phone);
            
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "验证码已发送，请注意查收"
            ));
        } catch (Exception e) {
            log.error("发送验证码失败", e);
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "发送失败: " + e.getMessage()));
        }
    }

    /**
     * 手机号验证码登录
     * 
     * POST /api/auth/login/phone
     * Body: { "phone": "13800138000", "code": "1234" }
     */
    @PostMapping("/login/phone")
    public ResponseEntity<?> loginByPhone(@RequestBody Map<String, String> request) {
        try {
            String phone = request.get("phone");
            String code = request.get("code");
            
            if (phone == null || code == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "手机号和验证码不能为空"));
            }
            
            AuthenticationClient client = new AuthenticationClient();
            client.setAppId(authingConfig.getAppId());
            
            SignInByPhonePassCodeDto dto = new SignInByPhonePassCodeDto();
            dto.setPhoneNumber(phone);
            dto.setPassCode(code);
            
            LoginTokenRespDto result = client.signInByPhonePassCode(dto);
            
            if (result != null && result.getData() != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("token", result.getAccessToken());
                response.put("refreshToken", result.getRefreshToken());
                response.put("expiresIn", result.getExpiresIn());
                response.put("user", Map.of(
                    "userId", result.getData().getUserId(),
                    "phone", result.getData().getPhone(),
                    "email", result.getData().getEmail(),
                    "username", result.getData().getUsername()
                ));
                
                log.info("用户登录成功，手机号: {}", phone);
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "登录失败，请检查验证码"));
            }
        } catch (Exception e) {
            log.error("手机号登录失败", e);
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "登录失败: " + e.getMessage()));
        }
    }

    /**
     * 邮箱密码登录
     * 
     * POST /api/auth/login/email
     * Body: { "email": "user@example.com", "password": "password123" }
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
            
            AuthenticationClient client = new AuthenticationClient();
            client.setAppId(authingConfig.getAppId());
            
            SignInByEmailPasswordDto dto = new SignInByEmailPasswordDto();
            dto.setEmail(email);
            dto.setPassword(password);
            
            LoginTokenRespDto result = client.signInByEmailPassword(dto);
            
            if (result != null && result.getData() != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("token", result.getAccessToken());
                response.put("refreshToken", result.getRefreshToken());
                response.put("expiresIn", result.getExpiresIn());
                response.put("user", Map.of(
                    "userId", result.getData().getUserId(),
                    "email", result.getData().getEmail(),
                    "username", result.getData().getUsername()
                ));
                
                log.info("用户登录成功，邮箱: {}", email);
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "登录失败，请检查邮箱和密码"));
            }
        } catch (Exception e) {
            log.error("邮箱登录失败", e);
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "登录失败: " + e.getMessage()));
        }
    }

    /**
     * 邮箱密码注册
     * 
     * POST /api/auth/register
     * Body: { "email": "user@example.com", "password": "password123", "username": "张三" }
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
            
            // 密码强度检查
            if (password.length() < 6) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "密码长度至少6位"));
            }
            
            AuthenticationClient client = new AuthenticationClient();
            client.setAppId(authingConfig.getAppId());
            
            SignUpDto dto = new SignUpDto();
            dto.setEmail(email);
            dto.setPassword(password);
            if (username != null && !username.isEmpty()) {
                dto.setUsername(username);
            }
            
            UserSingleRespDto result = client.signUp(dto);
            
            if (result != null && result.getData() != null) {
                log.info("用户注册成功，邮箱: {}", email);
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "注册成功，请登录",
                    "userId", result.getData().getUserId()
                ));
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "注册失败"));
            }
        } catch (Exception e) {
            log.error("注册失败", e);
            String errorMsg = e.getMessage();
            if (errorMsg.contains("already exists")) {
                errorMsg = "该邮箱已被注册";
            }
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", errorMsg));
        }
    }

    /**
     * 获取当前登录用户信息
     * 
     * GET /api/auth/user/info
     * Header: Authorization: Bearer <token>
     */
    @GetMapping("/user/info")
    public ResponseEntity<?> getUserInfo(@RequestHeader("Authorization") String token) {
        try {
            // 移除 "Bearer " 前缀
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            AuthenticationClient client = new AuthenticationClient();
            client.setAccessToken(token);
            
            UserSingleRespDto user = client.getProfile();
            
            if (user != null && user.getData() != null) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "user", user.getData()
                ));
            } else {
                return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "未授权"));
            }
        } catch (Exception e) {
            log.error("获取用户信息失败", e);
            return ResponseEntity.status(401)
                .body(Map.of("success", false, "message", "Token无效或已过期"));
        }
    }

    /**
     * 登出
     * 
     * POST /api/auth/logout
     * Header: Authorization: Bearer <token>
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                
                AuthenticationClient client = new AuthenticationClient();
                client.setAccessToken(token);
                
                RevokeTokenDto dto = new RevokeTokenDto();
                dto.setToken(token);
                client.revokeToken(dto);
                
                log.info("用户登出成功");
            }
            
            return ResponseEntity.ok(Map.of("success", true, "message", "登出成功"));
        } catch (Exception e) {
            log.error("登出失败", e);
            // 即使失败也返回成功，前端清除本地Token即可
            return ResponseEntity.ok(Map.of("success", true, "message", "登出成功"));
        }
    }

    /**
     * 刷新Token
     * 
     * POST /api/auth/refresh
     * Body: { "refreshToken": "xxx" }
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        try {
            String refreshToken = request.get("refreshToken");
            
            if (refreshToken == null || refreshToken.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "refreshToken不能为空"));
            }
            
            AuthenticationClient client = new AuthenticationClient();
            client.setAppId(authingConfig.getAppId());
            
            RefreshAccessTokenDto dto = new RefreshAccessTokenDto();
            dto.setRefreshToken(refreshToken);
            
            RefreshAccessTokenRespDto result = client.refreshAccessToken(dto);
            
            if (result != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("token", result.getAccessToken());
                response.put("refreshToken", result.getRefreshToken());
                response.put("expiresIn", result.getExpiresIn());
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "刷新失败"));
            }
        } catch (Exception e) {
            log.error("刷新Token失败", e);
            return ResponseEntity.status(401)
                .body(Map.of("success", false, "message", "刷新失败: " + e.getMessage()));
        }
    }

    /**
     * 健康检查接口
     * 用于测试Authing配置是否正确
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        boolean isConfigured = authingConfig.getAppId() != null && 
                               !authingConfig.getAppId().isEmpty();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("authingConfigured", isConfigured);
        response.put("appId", authingConfig.getAppId());
        
        if (!isConfigured) {
            response.put("message", "Authing未配置，请在.env文件中设置相关参数");
            response.put("docs", "https://docs.authing.cn/");
        }
        
        return ResponseEntity.ok(response);
    }
}
