package boss.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import service.QuotaService;
import util.SpringContextUtil;

/**
 * BossQuotaService服务类单元测试
 * 使用Mock来模拟数据库连接和Spring上下文
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BossQuotaService服务测试")
class BossQuotaServiceTest {

    private BossQuotaService quotaService;

    @BeforeEach
    void setUp() {
        quotaService = new BossQuotaService("test_user");
    }

    @Test
    @DisplayName("测试配额检查 - Spring上下文可用")
    void testCheckQuotaBeforeDelivery_SpringContextAvailable() {
        try (MockedStatic<SpringContextUtil> springMock = mockStatic(SpringContextUtil.class);
             MockedStatic<QuotaService> quotaServiceMock = mockStatic(QuotaService.class)) {

            // Mock SpringContextUtil
            springMock.when(SpringContextUtil::isInitialized).thenReturn(true);

            // Mock QuotaService
            QuotaService mockQuotaService = mock(QuotaService.class);
            springMock.when(() -> SpringContextUtil.getBean(QuotaService.class))
                .thenReturn(mockQuotaService);

            // Mock配额检查结果
            when(mockQuotaService.checkQuotaLimit(anyString(), anyString(), anyLong()))
                .thenReturn(true);

            // 执行测试
            boolean result = quotaService.checkQuotaBeforeDelivery();

            // 验证结果
            assertTrue(result);
            verify(mockQuotaService, times(1))
                .checkQuotaLimit("test_user", "daily_job_application", 1L);
        }
    }

    @Test
    @DisplayName("测试配额检查 - Spring上下文不可用，使用JDBC")
    void testCheckQuotaBeforeDelivery_SpringContextUnavailable() {
        try (MockedStatic<SpringContextUtil> springMock = mockStatic(SpringContextUtil.class)) {
            // Mock SpringContextUtil不可用
            springMock.when(SpringContextUtil::isInitialized).thenReturn(false);

            // 由于JDBC需要真实的数据库连接，这里主要测试方法不抛异常
            // 在实际环境中，JDBC会返回false（因为无法连接数据库）
            assertDoesNotThrow(() -> {
                boolean result = quotaService.checkQuotaBeforeDelivery();
                // 在测试环境中，JDBC连接失败会返回false
                assertFalse(result);
            });
        }
    }

    @Test
    @DisplayName("测试配额检查 - 配额不足")
    void testCheckQuotaBeforeDelivery_QuotaExceeded() {
        try (MockedStatic<SpringContextUtil> springMock = mockStatic(SpringContextUtil.class)) {
            springMock.when(SpringContextUtil::isInitialized).thenReturn(true);

            QuotaService mockQuotaService = mock(QuotaService.class);
            springMock.when(() -> SpringContextUtil.getBean(QuotaService.class))
                .thenReturn(mockQuotaService);

            // Mock配额不足
            when(mockQuotaService.checkQuotaLimit(anyString(), anyString(), anyLong()))
                .thenReturn(false);

            boolean result = quotaService.checkQuotaBeforeDelivery();

            assertFalse(result);
        }
    }

    @Test
    @DisplayName("测试配额消费 - Spring上下文可用")
    void testConsumeQuotaAfterDelivery_SpringContextAvailable() {
        try (MockedStatic<SpringContextUtil> springMock = mockStatic(SpringContextUtil.class)) {
            springMock.when(SpringContextUtil::isInitialized).thenReturn(true);

            QuotaService mockQuotaService = mock(QuotaService.class);
            springMock.when(() -> SpringContextUtil.getBean(QuotaService.class))
                .thenReturn(mockQuotaService);

            // Mock配额消费（consumeQuota可能抛出QuotaExceededException，但Mock不会抛出）
            try {
                doAnswer(invocation -> null).when(mockQuotaService).consumeQuota(anyString(), anyString(), anyLong());
            } catch (service.QuotaService.QuotaExceededException e) {
                fail("Mock不应该抛出异常");
            }

            assertDoesNotThrow(() -> {
                quotaService.consumeQuotaAfterDelivery();
            });

            try {
                verify(mockQuotaService, times(1))
                    .consumeQuota("test_user", "daily_job_application", 1L);
            } catch (service.QuotaService.QuotaExceededException e) {
                fail("验证不应该抛出异常");
            }
        }
    }

    @Test
    @DisplayName("测试配额消费 - Spring上下文不可用，使用JDBC")
    void testConsumeQuotaAfterDelivery_SpringContextUnavailable() {
        try (MockedStatic<SpringContextUtil> springMock = mockStatic(SpringContextUtil.class)) {
            springMock.when(SpringContextUtil::isInitialized).thenReturn(false);

            // 由于JDBC需要真实的数据库连接，这里主要测试方法不抛异常
            assertDoesNotThrow(() -> {
                quotaService.consumeQuotaAfterDelivery();
            });
        }
    }

    @Test
    @DisplayName("测试配额检查 - 异常处理")
    void testCheckQuotaBeforeDelivery_ExceptionHandling() {
        try (MockedStatic<SpringContextUtil> springMock = mockStatic(SpringContextUtil.class)) {
            // Mock抛出异常
            springMock.when(SpringContextUtil::isInitialized).thenThrow(new RuntimeException("测试异常"));

            // 异常时应该返回false，阻止投递
            boolean result = quotaService.checkQuotaBeforeDelivery();
            assertFalse(result);
        }
    }
}
