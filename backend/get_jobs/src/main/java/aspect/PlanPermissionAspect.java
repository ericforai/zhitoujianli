package aspect;

import java.util.Arrays;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import annotation.CheckPlanPermission;
import enums.PlanType;
import lombok.extern.slf4j.Slf4j;
import service.PlanPermissionService;
import util.UserContextUtil;

/**
 * 套餐权限检查切面
 *
 * 拦截带有@CheckPlanPermission注解的方法，进行权限检查和配额消费
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-13
 */
@Slf4j
@Aspect
@Component
public class PlanPermissionAspect {

    @Autowired
    private PlanPermissionService planPermissionService;

    /**
     * 环绕通知：检查套餐权限和配额
     */
    @Around("@annotation(checkPlanPermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint,
                                  CheckPlanPermission checkPlanPermission) throws Throwable {

        // 1. 获取当前用户ID
        String userId = UserContextUtil.getCurrentUserId();
        if (userId == null || userId.isEmpty()) {
            log.warn("未找到当前用户ID，权限检查失败");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "用户未登录");
        }

        // 2. 获取注解参数
        PlanType[] requiredPlans = checkPlanPermission.requiredPlans();
        String quotaKey = checkPlanPermission.quotaKey();
        long amount = checkPlanPermission.amount();
        boolean checkBefore = checkPlanPermission.checkBefore();
        String message = checkPlanPermission.message();

        log.debug("🔍 权限检查: userId={}, quotaKey={}, amount={}, requiredPlans={}",
                  userId, quotaKey, amount, Arrays.toString(requiredPlans));

        // 3. 检查套餐类型（如果指定了requiredPlans）
        if (requiredPlans.length > 0) {
            PlanType userPlanType = planPermissionService.getUserPlanType(userId);
            boolean hasRequiredPlan = Arrays.asList(requiredPlans).contains(userPlanType);

            if (!hasRequiredPlan) {
                log.warn("⚠️ 用户套餐不满足要求: userId={}, userPlan={}, requiredPlans={}",
                         userId, userPlanType, Arrays.toString(requiredPlans));
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, message);
            }
        }

        // 4. 方法执行前检查配额
        if (checkBefore) {
            boolean hasPermission = planPermissionService.hasPermission(userId, quotaKey, amount);
            if (!hasPermission) {
                log.warn("⚠️ 配额不足: userId={}, quotaKey={}, amount={}", userId, quotaKey, amount);
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, message);
            }
        }

        // 5. 执行目标方法
        Object result = joinPoint.proceed();

        // 6. 方法执行后消费配额
        if (!checkBefore) {
            try {
                planPermissionService.consumeQuota(userId, quotaKey, amount);
                log.debug("✅ 配额消费成功: userId={}, quotaKey={}, amount={}", userId, quotaKey, amount);
            } catch (Exception e) {
                log.error("❌ 配额消费失败: userId={}, quotaKey={}, amount={}", userId, quotaKey, amount, e);
                // 不影响方法执行结果
            }
        }

        return result;
    }
}

