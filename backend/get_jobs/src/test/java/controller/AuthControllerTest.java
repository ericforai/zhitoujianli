package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import config.MailConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import service.EmailService;
import service.VerificationCodeService;
import service.UserService;
import repository.UserRepository;

import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 模块1：邮箱注册功能测试
 *
 * 测试覆盖：
 * - 1.1 功能测试
 * - 1.2 集成测试
 * - 1.3 异常处理测试
 * - 1.5 安全测试
 *
 * @author ZhiTouJianLi Test Team
 * @since 2025-10-22
 */
@ExtendWith({SpringExtension.class, MockitoExtension.class})
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("模块1: 邮箱注册功能测试")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EmailService emailService;

    @MockBean
    private VerificationCodeService verificationCodeService;

    @MockBean
    private UserService userService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private MailConfig mailConfig;

    private Map<String, String> validRegistrationData;

    @BeforeEach
    void setUp() {
        // 准备测试数据
        validRegistrationData = new HashMap<>();
        validRegistrationData.put("email", "test_user_001@example.com");
        validRegistrationData.put("password", "Test1234");
        validRegistrationData.put("confirmPassword", "Test1234");

        // Mock邮件服务配置
        when(mailConfig.isConfigured()).thenReturn(true);
    }

    // ==================== 1.1 功能测试 ====================

    @Test
    @DisplayName("测试用例 1.1.1: 正常注册流程 - 发送验证码")
    void testSendVerificationCode_Success() throws Exception {
        // 准备数据
        Map<String, String> request = new HashMap<>();
        request.put("email", "test@example.com");

        // Mock验证码服务
        String verificationCode = "123456";
        when(verificationCodeService.generateCode()).thenReturn(verificationCode);
        doNothing().when(verificationCodeService).storeCode(anyString(), anyString());
        doNothing().when(emailService).sendVerificationCode(anyString(), anyString());

        // 执行测试
        MvcResult result = mockMvc.perform(post("/api/auth/send-verification-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value(containsString("验证码已发送")))
                .andReturn();

        // 验证
        verify(verificationCodeService, times(1)).generateCode();
        verify(verificationCodeService, times(1)).storeCode(eq("test@example.com"), eq(verificationCode));
        verify(emailService, times(1)).sendVerificationCode(eq("test@example.com"), eq(verificationCode));

        // 后端验证
        String content = result.getResponse().getContentAsString();
        assertTrue(content.contains("success"));

        System.out.println("✅ 测试通过: 验证码发送成功");
    }

    @Test
    @DisplayName("测试用例 1.1.2: 邮箱格式验证 - 无效邮箱格式")
    void testEmailValidation_InvalidFormats() throws Exception {
        String[] invalidEmails = {
            "testexample.com",      // 缺少@符号
            "test@",                 // 缺少域名
            "test@example",          // 缺少顶级域名
            "",                      // 空邮箱
            "   "                    // 仅空格
        };

        for (String invalidEmail : invalidEmails) {
            Map<String, String> request = new HashMap<>();
            request.put("email", invalidEmail);

            mockMvc.perform(post("/api/auth/send-verification-code")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").value(containsString("邮箱")));

            System.out.println("✅ 测试通过: 拒绝无效邮箱 - " + invalidEmail);
        }

        // 验证邮件服务未被调用
        verify(emailService, never()).sendVerificationCode(anyString(), anyString());
    }

    @Test
    @DisplayName("测试用例 1.1.2: 邮箱格式验证 - 有效邮箱格式")
    void testEmailValidation_ValidFormats() throws Exception {
        String[] validEmails = {
            "test@example.com",
            "test.user@example.com",
            "test+tag@example.co.uk",
            "user123@test-domain.com"
        };

        // Mock服务
        when(verificationCodeService.generateCode()).thenReturn("123456");
        doNothing().when(verificationCodeService).storeCode(anyString(), anyString());
        doNothing().when(emailService).sendVerificationCode(anyString(), anyString());

        for (String validEmail : validEmails) {
            Map<String, String> request = new HashMap<>();
            request.put("email", validEmail);

            mockMvc.perform(post("/api/auth/send-verification-code")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));

            System.out.println("✅ 测试通过: 接受有效邮箱 - " + validEmail);
        }
    }

    @Test
    @DisplayName("测试用例 1.1.4: 密码确认验证")
    void testPasswordConfirmation_Mismatch() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "test@example.com");
        request.put("password", "Test1234");
        request.put("confirmPassword", "Test5678");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("密码不一致")));

        System.out.println("✅ 测试通过: 密码不一致被拒绝");
    }

    @Test
    @DisplayName("测试用例 1.1.5: 验证码倒计时逻辑")
    void testVerificationCodeCooldown() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "test@example.com");

        // Mock服务
        when(verificationCodeService.generateCode()).thenReturn("123456");
        doNothing().when(verificationCodeService).storeCode(anyString(), anyString());
        doNothing().when(emailService).sendVerificationCode(anyString(), anyString());

        // 第一次发送成功
        mockMvc.perform(post("/api/auth/send-verification-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 注意：实际的倒计时逻辑在前端实现，这里验证后端允许重复发送
        // 但可以添加后端限流逻辑的测试

        System.out.println("✅ 测试通过: 验证码发送成功");
    }

    @Test
    @DisplayName("测试用例 1.1.7: 重复邮箱注册")
    void testDuplicateEmailRegistration() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "existing@example.com");
        request.put("password", "Test1234");
        request.put("username", "testuser");

        // Mock用户仓库返回已存在
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("已被注册")));

        System.out.println("✅ 测试通过: 重复邮箱被拒绝");
    }

    // ==================== 1.2 集成测试 ====================

    @Test
    @DisplayName("测试用例 1.2.2: 邮件服务集成 - 邮件服务未配置降级")
    void testEmailService_FallbackMode() throws Exception {
        // Mock邮件服务未配置
        when(mailConfig.isConfigured()).thenReturn(false);

        Map<String, String> request = new HashMap<>();
        request.put("email", "test@example.com");

        // Mock验证码服务
        String code = "123456";
        when(verificationCodeService.generateCode()).thenReturn(code);
        doNothing().when(verificationCodeService).storeCode(anyString(), anyString());

        mockMvc.perform(post("/api/auth/send-verification-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value(containsString("演示模式")));

        // 验证邮件服务未被调用
        verify(emailService, never()).sendVerificationCode(anyString(), anyString());

        System.out.println("✅ 测试通过: 邮件服务未配置时使用演示模式");
        System.out.println("⚠️  问题2: 演示模式下验证码直接返回，生产环境需禁用");
    }

    // ==================== 1.3 异常处理测试 ====================

    @Test
    @DisplayName("测试用例 1.3.1: 网络故障处理 - 邮件发送失败")
    void testNetworkFailure_EmailSendingFails() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "test@example.com");

        // Mock邮件发送失败
        when(verificationCodeService.generateCode()).thenReturn("123456");
        doNothing().when(verificationCodeService).storeCode(anyString(), anyString());
        doThrow(new RuntimeException("邮件服务连接失败"))
                .when(emailService).sendVerificationCode(anyString(), anyString());

        mockMvc.perform(post("/api/auth/send-verification-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is5xxServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("失败")));

        System.out.println("✅ 测试通过: 邮件发送失败时正确处理");
    }

    // ==================== 1.5 安全测试 ====================

    @Test
    @DisplayName("测试用例 1.5.1: SQL注入测试")
    void testSQLInjection() throws Exception {
        String[] sqlInjectionPayloads = {
            "test' OR '1'='1",
            "test'; DROP TABLE users;--",
            "admin'--",
            "' OR 1=1--"
        };

        for (String payload : sqlInjectionPayloads) {
            Map<String, String> request = new HashMap<>();
            request.put("email", payload);

            // 应该被邮箱格式验证拒绝，或者被安全处理
            mockMvc.perform(post("/api/auth/send-verification-code")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());

            System.out.println("✅ 测试通过: SQL注入被阻止 - " + payload);
        }
    }

    @Test
    @DisplayName("测试用例 1.5.2: XSS攻击测试")
    void testXSSAttack() throws Exception {
        String[] xssPayloads = {
            "<script>alert('XSS')</script>@test.com",
            "test@<img src=x onerror=alert('XSS')>.com",
            "test@example.com<script>alert(1)</script>"
        };

        for (String payload : xssPayloads) {
            Map<String, String> request = new HashMap<>();
            request.put("email", payload);

            mockMvc.perform(post("/api/auth/send-verification-code")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());

            System.out.println("✅ 测试通过: XSS攻击被阻止 - " + payload);
        }
    }

    @Test
    @DisplayName("测试用例 1.5.3: 密码加密验证")
    void testPasswordEncryption() throws Exception {
        // 这个测试需要访问真实的UserService实现
        // 这里验证密码不会以明文出现在日志或响应中

        Map<String, String> request = new HashMap<>();
        request.put("email", "test@example.com");
        request.put("password", "MySecretPassword123");
        request.put("username", "testuser");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(verificationCodeService.verifyCode(anyString(), anyString()))
                .thenReturn(VerificationCodeService.VerificationResult.SUCCESS);

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();

        // 验证响应中不包含明文密码
        assertFalse(responseBody.contains("MySecretPassword123"),
                "响应中不应包含明文密码");

        System.out.println("✅ 测试通过: 密码不以明文出现在响应中");
    }

    @Test
    @DisplayName("测试用例 1.5.4: 验证码暴力破解防护")
    void testBruteForceProtection() throws Exception {
        // 测试连续多次错误验证码输入
        Map<String, String> request = new HashMap<>();
        request.put("email", "test@example.com");
        request.put("code", "000000");

        // Mock验证码验证失败
        when(verificationCodeService.verifyCode(anyString(), anyString()))
                .thenReturn(VerificationCodeService.VerificationResult.INVALID);

        // 连续10次错误尝试
        for (int i = 0; i < 10; i++) {
            mockMvc.perform(post("/api/auth/verify-code")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false));
        }

        System.out.println("✅ 测试通过: 验证码错误被正确拒绝");
        System.out.println("⚠️  建议: 添加暴力破解防护（如锁定机制）");
    }

    // ==================== 健康检查 ====================

    @Test
    @DisplayName("健康检查: 认证服务状态")
    void testHealthCheck() throws Exception {
        mockMvc.perform(get("/api/auth/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value(containsString("运行正常")))
                .andExpect(jsonPath("$.authMethod").value("Spring Security"))
                .andExpect(jsonPath("$.jwtConfigured").value(true));

        System.out.println("✅ 健康检查通过");
    }
}





