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
            
            cn.authing.sdk.java.model.AuthenticationClientOptions options = 
                new cn.authing.sdk.java.model.AuthenticationClientOptions();
            options.setAppId(authingConfig.getAppId());
            options.setAppHost(authingConfig.getAppHost());
            
            AuthenticationClient client = new AuthenticationClient(options);
            
            SignUpDto dto = new SignUpDto();
            dto.setConnection(SignUpDto.Connection.PASSWORD);
            
            SignUpDto.PasswordSignUpInput payload = new SignUpDto.PasswordSignUpInput();
            payload.setEmail(email);
            payload.setPassword(password);
            if (username != null && !username.isEmpty()) {
                payload.setUsername(username);
            }
            dto.setPasswordPayload(payload);
            
            UserSingleRespDto result = client.signUp(dto);
            
            if (result != null && result.getData() != null) {
                log.info("✅ 用户注册成功，邮箱: {}", email);
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
            log.error("❌ 注册失败", e);
            String errorMsg = e.getMessage();
            if (errorMsg != null && errorMsg.contains("already exists")) {
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
            
            cn.authing.sdk.java.model.AuthenticationClientOptions options = 
                new cn.authing.sdk.java.model.AuthenticationClientOptions();
            options.setAppId(authingConfig.getAppId());
            options.setAppHost(authingConfig.getAppHost());
            
            AuthenticationClient client = new AuthenticationClient(options);
            
            SignInByEmailPasswordDto dto = new SignInByEmailPasswordDto();
            dto.setConnection(SignInByEmailPasswordDto.Connection.PASSWORD);
            
            SignInByEmailPasswordDto.PasswordSignInInput payload = 
                new SignInByEmailPasswordDto.PasswordSignInInput();
            payload.setEmail(email);
            payload.setPassword(password);
            dto.setPasswordPayload(payload);
            
            LoginTokenRespDto result = client.signInByEmailPassword(dto);
            
            if (result != null && result.getData() != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("token", result.getAccessToken());
                response.put("refreshToken", result.getRefreshToken());
                response.put("expiresIn", result.getExpiresIn());
                
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("userId", result.getData().getUserId());
                if (result.getData().getEmail() != null) {
                    userInfo.put("email", result.getData().getEmail());
                }
                if (result.getData().getUsername() != null) {
                    userInfo.put("username", result.getData().getUsername());
                }
                response.put("user", userInfo);
                
                log.info("✅ 用户登录成功，邮箱: {}", email);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "登录失败，请检查邮箱和密码"));
            }
        } catch (Exception e) {
            log.error("❌ 邮箱登录失败", e);
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "登录失败: " + e.getMessage()));
        }
    }

    /**
     * 发送手机验证码
     */
    @PostMapping("/send-code")
    public ResponseEntity<?> sendPhoneCode(@RequestBody Map<String, String> request) {
        try {
            String phone = request.get("phone");
            
            if (phone == null || phone.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "手机号不能为空"));
            }
            
            if (!phone.matches("^1[3-9]\\d{9}$")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "手机号格式不正确"));
            }
            
            cn.authing.sdk.java.model.AuthenticationClientOptions options = 
                new cn.authing.sdk.java.model.AuthenticationClientOptions();
            options.setAppId(authingConfig.getAppId());
            options.setAppHost(authingConfig.getAppHost());
            
            AuthenticationClient client = new AuthenticationClient(options);
            
            SendSMSDto dto = new SendSMSDto();
            dto.setPhoneNumber(phone);
            dto.setChannel(SendSMSDto.Channel.CHANNEL_LOGIN);
            
            SendSMSRespDto result = client.sendSms(dto);
            
            log.info("✅ 验证码发送成功，手机号: {}", phone);
            return ResponseEntity.ok(Map.of("success", true, "message", "验证码已发送"));
        } catch (Exception e) {
            log.error("❌ 发送验证码失败", e);
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "发送失败: " + e.getMessage()));
        }
    }

    /**
     * 手机号验证码登录
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
            
            cn.authing.sdk.java.model.AuthenticationClientOptions options = 
                new cn.authing.sdk.java.model.AuthenticationClientOptions();
            options.setAppId(authingConfig.getAppId());
            options.setAppHost(authingConfig.getAppHost());
            
            AuthenticationClient client = new AuthenticationClient(options);
            
            SignInByPhonePassCodeDto dto = new SignInByPhonePassCodeDto();
            dto.setConnection(SignInByPhonePassCodeDto.Connection.PASSCODE);
            
            SignInByPhonePassCodeDto.PassCodeSignInInput payload = 
                new SignInByPhonePassCodeDto.PassCodeSignInInput();
            payload.setPhone(phone);
            payload.setPassCode(code);
            dto.setPassCodePayload(payload);
            
            LoginTokenRespDto result = client.signInByPhonePassCode(dto);
            
            if (result != null && result.getData() != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("token", result.getAccessToken());
                response.put("refreshToken", result.getRefreshToken());
                response.put("expiresIn", result.getExpiresIn());
                
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("userId", result.getData().getUserId());
                if (result.getData().getPhone() != null) {
                    userInfo.put("phone", result.getData().getPhone());
                }
                if (result.getData().getUsername() != null) {
                    userInfo.put("username", result.getData().getUsername());
                }
                response.put("user", userInfo);
                
                log.info("✅ 用户登录成功，手机号: {}", phone);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "登录失败，请检查验证码"));
            }
        } catch (Exception e) {
            log.error("❌ 手机号登录失败", e);
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "登录失败: " + e.getMessage()));
        }
    }

    /**
     * 获取当前登录用户信息
     */
    @GetMapping("/user/info")
    public ResponseEntity<?> getUserInfo(@RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            cn.authing.sdk.java.model.AuthenticationClientOptions options = 
                new cn.authing.sdk.java.model.AuthenticationClientOptions();
            options.setAccessToken(token);
            options.setAppHost(authingConfig.getAppHost());
            
            AuthenticationClient client = new AuthenticationClient(options);
            
            GetProfileDto dto = new GetProfileDto();
            UserSingleRespDto user = client.getProfile(dto);
            
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
            log.error("❌ 获取用户信息失败", e);
            return ResponseEntity.status(401)
                .body(Map.of("success", false, "message", "Token无效或已过期"));
        }
    }

    /**
     * 登出
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                log.info("✅ 用户登出成功");
            }
            return ResponseEntity.ok(Map.of("success", true, "message", "登出成功"));
        } catch (Exception e) {
            log.error("❌ 登出失败", e);
            return ResponseEntity.ok(Map.of("success", true, "message", "登出成功"));
        }
    }

    /**
     * 健康检查接口
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("authingConfigured", true);
        response.put("appId", authingConfig.getAppId());
        response.put("userPoolId", authingConfig.getUserPoolId());
        response.put("appHost", authingConfig.getAppHost());
        response.put("message", "Authing配置正常");
        
        return ResponseEntity.ok(response);
    }
}
