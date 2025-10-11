package controller;

import java.util.Date;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import config.JwtConfig;
import config.MailConfig;
import entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import service.EmailService;
import service.UserAuditService;
import service.UserService;
import service.VerificationCodeService;
import util.RequestUtil;

/**
 * 用户认证控制器 - Spring Security + JavaMail方案
 *
 * MVP核心功能:
 * - 用户注册（邮箱验证）
 * - 用户登录
 * - JWT Token管理
 *
 * @author ZhiTouJianLi Team
 * @version 2.0 - Spring Security MVP
 */
@RestController
@RequestMapping("/api/auth")
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://115.190.182.95:3000", "http://115.190.182.95"})
public class AuthController {

    @Autowired
    private JwtConfig jwtConfig;

    @Autowired
    private MailConfig mailConfig;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private VerificationCodeService verificationCodeService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserAuditService auditService;

    /**
     * 健康检查接口
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "✅ 认证服务运行正常",
            "authMethod", "Spring Security",
            "jwtConfigured", true,
            "mailConfigured", mailConfig.isConfigured(),
            "timestamp", System.currentTimeMillis()
        ));
    }

    /**
     * 发送邮箱验证码
     */
    @PostMapping("/send-verification-code")
    public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");

            // 验证邮箱格式
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "邮箱不能为空"));
            }

            if (!email.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "邮箱格式不正确"));
            }

            // 检查邮件服务是否配置
            if (!mailConfig.isConfigured()) {
                log.warn("⚠️ 邮件服务未配置，使用演示模式");
                String code = verificationCodeService.generateCode();
                verificationCodeService.storeCode(email, code);

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "验证码已生成（演示模式）",
                        "code", code, // 演示模式直接返回验证码
                        "expiresIn", 300,
                        "demoMode", true
                ));
            }

            // 生成并存储验证码
            String code = verificationCodeService.generateCode();
            verificationCodeService.storeCode(email, code);

            // 发送邮件
            boolean sent = emailService.sendVerificationCode(email, code);

            if (sent) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "验证码已发送到邮箱，请查看邮件",
                        "expiresIn", 300
                ));
            } else {
                return ResponseEntity.internalServerError()
                        .body(Map.of("success", false, "message", "邮件发送失败，请稍后重试"));
            }

        } catch (Exception e) {
            log.error("❌ 发送验证码失败", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "服务器错误"));
        }
    }

    /**
     * 验证邮箱验证码
     */
    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");

            if (email == null || code == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "邮箱和验证码不能为空"));
            }

            VerificationCodeService.VerificationResult result =
                    verificationCodeService.verifyCode(email, code);

            switch (result) {
                case SUCCESS:
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "验证码验证成功"
                    ));
                case EXPIRED:
                    return ResponseEntity.badRequest()
                            .body(Map.of("success", false, "message", "验证码已过期，请重新获取"));
                case MAX_ATTEMPTS:
                    return ResponseEntity.badRequest()
                            .body(Map.of("success", false, "message", "验证码尝试次数过多，请重新获取"));
                case INVALID:
                default:
                    return ResponseEntity.badRequest()
                            .body(Map.of("success", false, "message", "验证码错误"));
            }

        } catch (Exception e) {
            log.error("❌ 验证验证码失败", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "服务器错误"));
        }
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        String email = request.get("email");
        String clientIp = RequestUtil.getClientIp(httpRequest);
        String userAgent = RequestUtil.getUserAgent(httpRequest);

        try {
            String password = request.get("password");
            String username = request.get("username");
            String verificationCode = request.get("verificationCode");

            // 参数验证
            if (email == null || password == null) {
                auditService.logFailure(null, email, entity.UserAuditLog.ActionType.REGISTER,
                    "邮箱和密码不能为空", clientIp, userAgent, "/api/auth/register");
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "邮箱和密码不能为空"));
            }

            if (password.length() < 6) {
                auditService.logFailure(null, email, entity.UserAuditLog.ActionType.REGISTER,
                    "密码长度至少6位", clientIp, userAgent, "/api/auth/register");
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "密码长度至少6位"));
            }

            // 检查验证码是否已验证
            if (!verificationCodeService.isVerified(email)) {
                auditService.logFailure(null, email, entity.UserAuditLog.ActionType.REGISTER,
                    "邮箱未验证", clientIp, userAgent, "/api/auth/register");
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "请先验证邮箱"));
            }

            // 注册用户
            User user = userService.registerUser(email, password, username);

            // 清理验证码
            verificationCodeService.removeCode(email);

            // 生成JWT Token
            String token = generateJwtToken(user);

            // 记录审计日志
            auditService.logRegister(user, clientIp, userAgent);

            // 发送欢迎邮件（异步，不影响响应）
            if (mailConfig.isConfigured()) {
                try {
                    emailService.sendWelcomeEmail(email, user.getUsername());
                } catch (Exception e) {
                    log.warn("⚠️ 欢迎邮件发送失败，但注册成功", e);
                }
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "注册成功",
                    "token", token,
                    "user", Map.of(
                            "userId", user.getUserId(),
                            "email", user.getEmail(),
                            "username", user.getUsername()
                    )
            ));

        } catch (IllegalArgumentException e) {
            log.warn("❌ 注册失败: {}", e.getMessage());
            auditService.logFailure(null, email, entity.UserAuditLog.ActionType.REGISTER,
                e.getMessage(), clientIp, userAgent, "/api/auth/register");
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ 注册失败", e);
            auditService.logFailure(null, email, entity.UserAuditLog.ActionType.REGISTER,
                "系统错误: " + e.getMessage(), clientIp, userAgent, "/api/auth/register");
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "注册失败，请稍后重试"));
        }
    }

    /**
     * 测试注册接口（跳过邮箱验证）
     */
    @PostMapping("/register-test")
    public ResponseEntity<?> registerTest(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String username = request.get("username");

        if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "邮箱和密码不能为空"));
        }

        try {
            // 直接注册用户，跳过邮箱验证
            User user = userService.registerUser(email, password, username);

            // 生成JWT Token
            String token = generateJwtToken(user);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "测试注册成功",
                    "token", token,
                    "user", Map.of(
                            "userId", user.getUserId(),
                            "email", user.getEmail(),
                            "username", user.getUsername()
                    )
            ));

        } catch (IllegalArgumentException e) {
            log.warn("❌ 测试注册失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ 测试注册失败", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "测试注册失败，请稍后重试"));
        }
    }

    /**
     * 用户登录（邮箱 + 密码）
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        String email = request.get("email");
        String clientIp = RequestUtil.getClientIp(httpRequest);
        String userAgent = RequestUtil.getUserAgent(httpRequest);

        try {
            String password = request.get("password");

            if (email == null || password == null) {
                auditService.logLoginFailure(email, "邮箱和密码不能为空", clientIp, userAgent);
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "邮箱和密码不能为空"));
            }

            // 检查可疑活动（防暴力破解）
            if (auditService.checkSuspiciousActivity(email, clientIp)) {
                auditService.logFailure(null, email, entity.UserAuditLog.ActionType.SUSPICIOUS_ACTIVITY,
                    "检测到频繁登录失败，暂时锁定", clientIp, userAgent, "/api/auth/login");
                return ResponseEntity.status(429)
                        .body(Map.of("success", false, "message", "登录尝试过于频繁，请15分钟后再试"));
            }

            // 查找用户
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("用户不存在或密码错误"));

            // 验证密码
            if (!userService.verifyPassword(user, password)) {
                auditService.logLoginFailure(email, "密码错误", clientIp, userAgent);
                throw new IllegalArgumentException("用户不存在或密码错误");
            }

            // 检查用户是否被删除
            if (user.isDeleted()) {
                auditService.logLoginFailure(email, "账号已被删除", clientIp, userAgent);
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "账号已被删除"));
            }

            // 检查用户是否激活
            if (!user.getActive()) {
                auditService.logLoginFailure(email, "账号已被禁用", clientIp, userAgent);
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "账号已被禁用"));
            }

            // 更新最后登录信息
            userService.updateLastLogin(user.getUserId(), clientIp);

            // 生成Token
            String token = generateJwtToken(user);

            // 记录审计日志
            auditService.logLogin(user, clientIp, userAgent);

            log.info("✅ 用户登录成功: {}, IP: {}", email, clientIp);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "登录成功",
                    "token", token,
                    "user", Map.of(
                            "userId", user.getUserId(),
                            "email", user.getEmail(),
                            "username", user.getUsername(),
                            "emailVerified", user.getEmailVerified()
                    )
            ));

        } catch (IllegalArgumentException e) {
            log.warn("❌ 登录失败: {}, IP: {}", e.getMessage(), clientIp);
            if (email != null && !e.getMessage().contains("暂时锁定")) {
                auditService.logLoginFailure(email, e.getMessage(), clientIp, userAgent);
            }
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ 登录失败", e);
            auditService.logFailure(null, email, entity.UserAuditLog.ActionType.LOGIN,
                "系统错误: " + e.getMessage(), clientIp, userAgent, "/api/auth/login");
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "登录失败，请稍后重试"));
        }
    }

    /**
     * 用户登录（邮箱 + 密码）- 兼容前端调用
     */
    @PostMapping("/login/email")
    public ResponseEntity<?> loginByEmail(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        // 直接调用现有的login方法
        return login(request, httpRequest);
    }

    /**
     * 用户注销
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // MVP版本：客户端删除Token即可
        // 生产版本：可以实现Token黑名单
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "注销成功"
        ));
    }

    /**
     * 获取用户信息
     */
    @GetMapping("/user/info")
    public ResponseEntity<?> getUserInfo(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "未提供Token"));
            }

            String token = authHeader.substring(7);
            Long userId = getUserIdFromToken(token);

            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Token无效"));
            }

            // 从数据库获取用户信息
            User user = userService.findByEmail(String.valueOf(userId))
                    .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "user", Map.of(
                            "userId", user.getUserId(),
                            "email", user.getEmail(),
                            "username", user.getUsername(),
                            "emailVerified", user.getEmailVerified()
                    )
            ));

        } catch (Exception e) {
            log.error("❌ 获取用户信息失败", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "获取用户信息失败"));
        }
    }

    // ========== 工具方法 ==========

    /**
     * 生成JWT Token
     */
    private String generateJwtToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtConfig.getJwtExpiration());

        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("userId", user.getUserId())
                .claim("email", user.getEmail())
                .claim("username", user.getUsername())
                .claim("type", "access_token")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS256, jwtConfig.getJwtSecret().getBytes())
                .compact();
    }

    /**
     * 从Token中提取用户ID
     */
    private Long getUserIdFromToken(String token) {
        try {
            var claims = Jwts.parser()
                    .setSigningKey(jwtConfig.getJwtSecret().getBytes())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return claims.get("userId", Long.class);
        } catch (Exception e) {
            log.warn("❌ Token解析失败: {}", e.getMessage());
            return null;
        }
    }
}
