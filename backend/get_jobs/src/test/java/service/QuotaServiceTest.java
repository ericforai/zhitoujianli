package service;

import entity.PlanQuotaConfig;
import entity.QuotaDefinition;
import entity.UserPlan;
import entity.UserQuotaUsage;
import enums.PlanType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import repository.PlanQuotaConfigRepository;
import repository.QuotaDefinitionRepository;
import repository.UserPlanRepository;
import repository.UserQuotaUsageRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * QuotaService单元测试
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */
@ExtendWith(MockitoExtension.class)
class QuotaServiceTest {

    @Mock
    private QuotaDefinitionRepository quotaDefinitionRepository;

    @Mock
    private PlanQuotaConfigRepository planQuotaConfigRepository;

    @Mock
    private UserQuotaUsageRepository userQuotaUsageRepository;

    @Mock
    private UserPlanRepository userPlanRepository;

    @InjectMocks
    private QuotaService quotaService;

    private String testUserId;
    private String testQuotaKey;
    private QuotaDefinition testQuotaDefinition;
    private PlanQuotaConfig testPlanConfig;
    private UserPlan testUserPlan;
    private UserQuotaUsage testUsage;

    @BeforeEach
    void setUp() {
        testUserId = "test-user-123";
        testQuotaKey = "resume_parse";

        // 创建测试配额定义
        testQuotaDefinition = QuotaDefinition.builder()
                .id(1L)
                .quotaKey(testQuotaKey)
                .quotaName("简历解析")
                .isActive(true)
                .build();

        // 创建测试套餐配置
        testPlanConfig = PlanQuotaConfig.builder()
                .id(1L)
                .planType(PlanType.FREE)
                .quotaId(1L)
                .quotaLimit(10L)
                .isUnlimited(false)
                .isEnabled(true)
                .build();

        // 创建测试用户套餐
        testUserPlan = UserPlan.builder()
                .userId(testUserId)
                .planType(PlanType.FREE)
                .status(UserPlan.PlanStatus.ACTIVE)
                .startDate(LocalDate.now())
                .build();

        // 创建测试使用记录
        testUsage = UserQuotaUsage.builder()
                .id(1L)
                .userId(testUserId)
                .quotaId(1L)
                .usedAmount(5L)
                .resetDate(LocalDate.now())
                .build();
    }

    @Test
    void testCheckQuotaLimit_WithSufficientQuota_ShouldReturnTrue() {
        // 准备
        when(userPlanRepository.findByUserIdAndStatus(anyString(), any()))
                .thenReturn(Optional.of(testUserPlan));
        when(quotaDefinitionRepository.findByQuotaKeyAndIsActive(anyString(), eq(true)))
                .thenReturn(Optional.of(testQuotaDefinition));
        when(planQuotaConfigRepository.findByPlanTypeAndQuotaIdAndIsEnabled(
                any(PlanType.class), anyLong(), eq(true)))
                .thenReturn(Optional.of(testPlanConfig));
        when(userQuotaUsageRepository.findByUserIdAndQuotaIdAndResetDate(
                anyString(), anyLong(), any(LocalDate.class)))
                .thenReturn(Optional.of(testUsage));

        // 执行
        boolean result = quotaService.checkQuotaLimit(testUserId, testQuotaKey, 3L);

        // 验证
        assertTrue(result);
    }

    @Test
    void testCheckQuotaLimit_WithInsufficientQuota_ShouldReturnFalse() {
        // 准备
        when(userPlanRepository.findByUserIdAndStatus(anyString(), any()))
                .thenReturn(Optional.of(testUserPlan));
        when(quotaDefinitionRepository.findByQuotaKeyAndIsActive(anyString(), eq(true)))
                .thenReturn(Optional.of(testQuotaDefinition));
        when(planQuotaConfigRepository.findByPlanTypeAndQuotaIdAndIsEnabled(
                any(PlanType.class), anyLong(), eq(true)))
                .thenReturn(Optional.of(testPlanConfig));
        when(userQuotaUsageRepository.findByUserIdAndQuotaIdAndResetDate(
                anyString(), anyLong(), any(LocalDate.class)))
                .thenReturn(Optional.of(testUsage));

        // 执行 - 请求数量超过剩余配额
        boolean result = quotaService.checkQuotaLimit(testUserId, testQuotaKey, 10L);

        // 验证
        assertFalse(result);
    }

    @Test
    void testCheckQuotaLimit_WithUnlimitedQuota_ShouldReturnTrue() {
        // 准备 - 无限制配额
        PlanQuotaConfig unlimitedConfig = PlanQuotaConfig.builder()
                .id(1L)
                .planType(PlanType.FREE)
                .quotaId(1L)
                .quotaLimit(10L)
                .isUnlimited(true)
                .isEnabled(true)
                .build();

        when(userPlanRepository.findByUserIdAndStatus(anyString(), any()))
                .thenReturn(Optional.of(testUserPlan));
        when(quotaDefinitionRepository.findByQuotaKeyAndIsActive(anyString(), eq(true)))
                .thenReturn(Optional.of(testQuotaDefinition));
        when(planQuotaConfigRepository.findByPlanTypeAndQuotaIdAndIsEnabled(
                any(PlanType.class), anyLong(), eq(true)))
                .thenReturn(Optional.of(unlimitedConfig));

        // 执行
        boolean result = quotaService.checkQuotaLimit(testUserId, testQuotaKey, 1000L);

        // 验证
        assertTrue(result);
        // 验证没有查询使用量（因为无限制）
        verify(userQuotaUsageRepository, never())
                .findByUserIdAndQuotaIdAndResetDate(anyString(), anyLong(), any(LocalDate.class));
    }

    @Test
    void testCheckQuotaLimit_WithMissingQuotaDefinition_ShouldReturnTrue() {
        // 准备 - 配额定义不存在
        when(userPlanRepository.findByUserIdAndStatus(anyString(), any()))
                .thenReturn(Optional.of(testUserPlan));
        when(quotaDefinitionRepository.findByQuotaKeyAndIsActive(anyString(), eq(true)))
                .thenReturn(Optional.empty());

        // 执行
        boolean result = quotaService.checkQuotaLimit(testUserId, testQuotaKey, 1L);

        // 验证 - 临时方案：返回true
        assertTrue(result);
    }

    @Test
    void testCheckQuotaLimit_WithMissingPlanConfig_ShouldReturnTrue() {
        // 准备 - 套餐配置不存在
        when(userPlanRepository.findByUserIdAndStatus(anyString(), any()))
                .thenReturn(Optional.of(testUserPlan));
        when(quotaDefinitionRepository.findByQuotaKeyAndIsActive(anyString(), eq(true)))
                .thenReturn(Optional.of(testQuotaDefinition));
        when(planQuotaConfigRepository.findByPlanTypeAndQuotaIdAndIsEnabled(
                any(PlanType.class), anyLong(), eq(true)))
                .thenReturn(Optional.empty());

        // 执行
        boolean result = quotaService.checkQuotaLimit(testUserId, testQuotaKey, 1L);

        // 验证 - 临时方案：返回true
        assertTrue(result);
    }

    @Test
    void testCheckQuotaLimit_WithNoUsageRecord_ShouldCreateNewRecord() {
        // 准备 - 没有使用记录
        when(userPlanRepository.findByUserIdAndStatus(anyString(), any()))
                .thenReturn(Optional.of(testUserPlan));
        when(quotaDefinitionRepository.findByQuotaKeyAndIsActive(anyString(), eq(true)))
                .thenReturn(Optional.of(testQuotaDefinition));
        when(planQuotaConfigRepository.findByPlanTypeAndQuotaIdAndIsEnabled(
                any(PlanType.class), anyLong(), eq(true)))
                .thenReturn(Optional.of(testPlanConfig));
        when(userQuotaUsageRepository.findByUserIdAndQuotaIdAndResetDate(
                anyString(), anyLong(), any(LocalDate.class)))
                .thenReturn(Optional.empty());
        when(userQuotaUsageRepository.save(any(UserQuotaUsage.class)))
                .thenAnswer(invocation -> {
                    UserQuotaUsage usage = invocation.getArgument(0);
                    usage.setId(1L);
                    return usage;
                });

        // 执行
        boolean result = quotaService.checkQuotaLimit(testUserId, testQuotaKey, 1L);

        // 验证
        assertTrue(result);
        verify(userQuotaUsageRepository).save(any(UserQuotaUsage.class));
    }

    @Test
    void testConsumeQuota_WithSufficientQuota_ShouldSucceed() throws Exception {
        // 准备
        when(userPlanRepository.findByUserIdAndStatus(anyString(), any()))
                .thenReturn(Optional.of(testUserPlan));
        when(quotaDefinitionRepository.findByQuotaKeyAndIsActive(anyString(), eq(true)))
                .thenReturn(Optional.of(testQuotaDefinition));
        when(planQuotaConfigRepository.findByPlanTypeAndQuotaIdAndIsEnabled(
                any(PlanType.class), anyLong(), eq(true)))
                .thenReturn(Optional.of(testPlanConfig));
        when(userQuotaUsageRepository.findByUserIdAndQuotaIdAndResetDate(
                anyString(), anyLong(), any(LocalDate.class)))
                .thenReturn(Optional.of(testUsage));
        when(userQuotaUsageRepository.save(any(UserQuotaUsage.class)))
                .thenReturn(testUsage);

        // 执行
        quotaService.consumeQuota(testUserId, testQuotaKey, 3L);

        // 验证
        verify(userQuotaUsageRepository).save(any(UserQuotaUsage.class));
    }

    @Test
    void testConsumeQuota_WithInsufficientQuota_ShouldThrowException() {
        // 准备
        when(userPlanRepository.findByUserIdAndStatus(anyString(), any()))
                .thenReturn(Optional.of(testUserPlan));
        when(quotaDefinitionRepository.findByQuotaKeyAndIsActive(anyString(), eq(true)))
                .thenReturn(Optional.of(testQuotaDefinition));
        when(planQuotaConfigRepository.findByPlanTypeAndQuotaIdAndIsEnabled(
                any(PlanType.class), anyLong(), eq(true)))
                .thenReturn(Optional.of(testPlanConfig));
        when(userQuotaUsageRepository.findByUserIdAndQuotaIdAndResetDate(
                anyString(), anyLong(), any(LocalDate.class)))
                .thenReturn(Optional.of(testUsage));

        // 执行和验证
        assertThrows(QuotaService.QuotaExceededException.class, () -> {
            quotaService.consumeQuota(testUserId, testQuotaKey, 10L);
        });
    }
}

