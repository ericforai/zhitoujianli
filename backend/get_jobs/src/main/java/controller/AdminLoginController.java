package controller;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import config.JwtConfig;
import entity.AdminUser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import repository.AdminUserRepository;
import service.LoginLogService;
import util.RequestUtil;

/**
 * 管理员登录控制器
 * 独立的管理员认证体系，不依赖普通用户账户
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/auth")
@CrossOrigin(origins = {
    "https://zhitoujianli.com",
    "https://www.zhitoujianli.com",
    "http://localhost:3000",
    "http://localhost:3001"
}, allowCredentials = "true")
public class AdminLoginController {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtConfig jwtConfig;

    @Autowired
    private LoginLogService loginLogService;

    /**
     * 管理员登录
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        // 兼容email字段作为username的别名（用于前端表单）
        String username = request.get("username");
        if (username == null) {
            username = request.get("email"); // 兼容前端使用email字段
        }
        String password = request.get("password");
        String clientIp = RequestUtil.getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        try {
            if (username == null || password == null) {
                log.warn("⚠️ 管理员登录失败: 用户名或密码为空, IP: {}", clientIp);
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "用户名和密码不能为空"));
            }

            // 查找管理员
            AdminUser admin = adminUserRepository.findByUsernameAndIsActive(username, true)
                    .orElse(null);

            if (admin == null) {
                log.warn("⚠️ 管理员登录失败: 管理员不存在, username={}, IP: {}", username, clientIp);
                return ResponseEntity.status(401)
                        .body(Map.of("success", false, "message", "用户名或密码错误"));
            }

            // 验证密码
            if (!passwordEncoder.matches(password, admin.getPassword())) {
                log.warn("⚠️ 管理员登录失败: 密码错误, username={}, IP: {}", username, clientIp);
                // 记录失败登录日志
                loginLogService.recordFailedLogin(username, httpRequest, "管理员密码错误");
                return ResponseEntity.status(401)
                        .body(Map.of("success", false, "message", "用户名或密码错误"));
            }

            // 更新最后登录时间
            admin.setLastLoginAt(java.time.LocalDateTime.now());
            adminUserRepository.save(admin);

            // 生成Token（管理员专用Token，包含admin标识）
            String token = generateAdminToken(admin);

            // 记录成功登录日志
            loginLogService.recordAdminLogin(admin, httpRequest);

            log.info("✅ 管理员登录成功: username={}, IP: {}", username, clientIp);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "登录成功",
                    "token", token,
                    "admin", Map.of(
                            "id", admin.getId(),
                            "username", admin.getUsername(),
                            "adminType", admin.getAdminType(),
                            "adminTypeName", admin.getAdminType().getDisplayName()
                    )
            ));

        } catch (Exception e) {
            log.error("❌ 管理员登录异常: username={}", username, e);
            if (username != null) {
                loginLogService.recordFailedLogin(username, httpRequest, "系统错误: " + e.getMessage());
            }
            return ResponseEntity.status(500)
                    .body(Map.of("success", false, "message", "登录失败，请稍后重试"));
        }
    }

    /**
     * 管理员登出
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // JWT是无状态的，客户端删除Token即可
        // 可以在这里记录登出日志
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "登出成功"
        ));
    }

    /**
     * 检查Token有效性（管理员）
     */
    @GetMapping("/check")
    public ResponseEntity<?> checkToken() {
        // Token验证由JwtAuthenticationFilter处理
        // 这里主要用于前端检查Token是否仍然有效
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Token有效"
        ));
    }

    /**
     * 生成管理员JWT Token
     */
    private String generateAdminToken(AdminUser admin) {
        long expirationTime = jwtConfig.getJwtExpiration(); // 使用配置的过期时间
        String secret = jwtConfig.getJwtSecret();

        // JJWT 0.12.x 新版API：使用 Keys.hmacShaKeyFor 创建密钥
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        javax.crypto.SecretKey key = io.jsonwebtoken.security.Keys.hmacShaKeyFor(keyBytes);

        return Jwts.builder()
                .subject(admin.getUsername())  // 新版API：使用 subject() 而不是 setSubject()
                .claim("adminId", admin.getId())
                .claim("username", admin.getUsername())
                .claim("adminType", admin.getAdminType().name())
                .claim("isAdmin", true)
                .issuedAt(new Date())  // 新版API：使用 issuedAt() 而不是 setIssuedAt()
                .expiration(new Date(System.currentTimeMillis() + expirationTime))  // 新版API：使用 expiration()
                .signWith(key)  // 新版API：直接传入 Key 对象
                .compact();
    }
}

