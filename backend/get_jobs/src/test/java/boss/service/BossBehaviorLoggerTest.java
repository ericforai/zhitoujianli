package boss.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import utils.Bot;

/**
 * BossBehaviorLogger服务类单元测试
 * 使用Mock来模拟外部HTTP请求和Bot服务
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BossBehaviorLogger服务测试")
class BossBehaviorLoggerTest {

    private BossBehaviorLogger logger;

    @BeforeEach
    void setUp() {
        logger = new BossBehaviorLogger("test_user");
    }

    @Test
    @DisplayName("测试记录用户行为 - 成功")
    void testLogBehavior_Success() {
        Map<String, Object> extraData = new HashMap<>();
        extraData.put("testKey", "testValue");
        extraData.put("jobName", "测试岗位");

        // 由于logBehavior内部调用HTTP API，这里主要测试方法不抛异常
        assertDoesNotThrow(() -> {
            logger.logBehavior("TEST_BEHAVIOR", "SUCCESS", "测试行为", extraData);
        });
    }

    @Test
    @DisplayName("测试记录用户行为 - 空数据")
    void testLogBehavior_EmptyData() {
        Map<String, Object> extraData = new HashMap<>();

        assertDoesNotThrow(() -> {
            logger.logBehavior("TEST_BEHAVIOR", "SUCCESS", "测试行为", extraData);
        });
    }

    @Test
    @DisplayName("测试记录用户行为 - null数据")
    void testLogBehavior_NullData() {
        assertDoesNotThrow(() -> {
            logger.logBehavior("TEST_BEHAVIOR", "SUCCESS", "测试行为", null);
        });
    }

    @Test
    @DisplayName("测试发送验证码通知")
    void testSendVerificationCodeNotification() {
        try (MockedStatic<Bot> botMock = mockStatic(Bot.class)) {
            // Mock Bot.sendMessageByTime方法
            botMock.when(() -> Bot.sendMessageByTime(anyString())).thenAnswer(invocation -> null);

            assertDoesNotThrow(() -> {
                logger.sendVerificationCodeNotification("测试岗位");
            });

            // 验证方法被调用
            botMock.verify(() -> Bot.sendMessageByTime(contains("验证码")), times(1));
        }
    }

    @Test
    @DisplayName("测试发送验证码通知 - 空岗位名")
    void testSendVerificationCodeNotification_EmptyJobName() {
        try (MockedStatic<Bot> botMock = mockStatic(Bot.class)) {
            botMock.when(() -> Bot.sendMessageByTime(anyString())).thenAnswer(invocation -> null);

            assertDoesNotThrow(() -> {
                logger.sendVerificationCodeNotification("");
            });
        }
    }

    @Test
    @DisplayName("测试发送验证码通知 - null岗位名")
    void testSendVerificationCodeNotification_NullJobName() {
        try (MockedStatic<Bot> botMock = mockStatic(Bot.class)) {
            botMock.when(() -> Bot.sendMessageByTime(anyString())).thenAnswer(invocation -> null);

            assertDoesNotThrow(() -> {
                logger.sendVerificationCodeNotification(null);
            });
        }
    }

    @Test
    @DisplayName("测试不同行为类型")
    void testLogBehavior_DifferentTypes() {
        Map<String, Object> extraData = new HashMap<>();
        String[] behaviorTypes = {
            "JOB_DELIVERY_SUCCESS",
            "JOB_DELIVERY_FAILED",
            "QUOTA_EXCEEDED",
            "BLACKLIST_MATCHED"
        };

        for (String behaviorType : behaviorTypes) {
            assertDoesNotThrow(() -> {
                logger.logBehavior(behaviorType, "SUCCESS", "测试行为", extraData);
            });
        }
    }

    @Test
    @DisplayName("测试不同状态")
    void testLogBehavior_DifferentStatuses() {
        Map<String, Object> extraData = new HashMap<>();
        String[] statuses = {"SUCCESS", "FAILED", "PENDING", "CANCELLED"};

        for (String status : statuses) {
            assertDoesNotThrow(() -> {
                logger.logBehavior("TEST_BEHAVIOR", status, "测试行为", extraData);
            });
        }
    }
}
