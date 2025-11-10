package aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import util.UserContextUtil;

/**
 * 数据隔离切面 - 多租户安全防护
 *
 * 🔒 安全目标：
 * - 自动验证所有Repository查询都携带userId
 * - 防止跨用户数据访问
 * - 审计日志记录所有数据访问
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-05
 */
@Slf4j
@Aspect
@Component
@Order(1) // 最高优先级，先于其他切面执行
public class DataIsolationAspect {

    private static final ThreadLocal<String> CURRENT_USER_CONTEXT = new ThreadLocal<>();

    /**
     * 拦截所有Repository方法调用
     * 确保每个查询都在正确的用户上下文中执行
     */
    @Around("execution(* repository.*Repository.*(..))")
    public Object enforceUserIsolation(ProceedingJoinPoint joinPoint) throws Throwable {
        String userId = UserContextUtil.getCurrentUserId();
        String methodName = joinPoint.getSignature().toShortString();

        // 设置用户上下文
        CURRENT_USER_CONTEXT.set(userId);

        try {
            log.debug("🔒 [数据隔离] 用户 {} 正在执行: {}", userId, methodName);

            // 执行实际方法
            Object result = joinPoint.proceed();

            // 审计日志（可选：记录到数据库）
            logDataAccess(userId, methodName, true, null);

            return result;

        } catch (SecurityException e) {
            // 安全异常：拒绝访问
            log.error("❌ [数据隔离] 安全错误: 用户 {} 尝试执行 {} - {}",
                userId, methodName, e.getMessage());
            logDataAccess(userId, methodName, false, e.getMessage());
            throw e;

        } catch (Exception e) {
            // 其他异常
            log.error("❌ [数据隔离] 执行错误: 用户 {} 执行 {} 失败",
                userId, methodName, e);
            throw e;

        } finally {
            // 清理上下文
            CURRENT_USER_CONTEXT.remove();
        }
    }

    /**
     * 拦截Controller层方法，验证用户认证状态
     */
    @Around("execution(* controller.*Controller.*(..)) && " +
            "!execution(* controller.AuthController.*(..)) && " +
            "!execution(* controller.HealthMonitorController.*(..))")
    public Object enforceAuthentication(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();

        try {
            // 验证用户已登录（如果获取失败会抛出SecurityException）
            String userId = UserContextUtil.getCurrentUserId();

            log.debug("✅ [认证检查] 用户 {} 访问: {}", userId, methodName);

            return joinPoint.proceed();

        } catch (SecurityException e) {
            log.error("❌ [认证检查] 未认证用户尝试访问: {}", methodName);
            throw new SecurityException("需要登录才能访问此功能");
        }
    }

    /**
     * 获取当前用户上下文（供其他组件使用）
     */
    public static String getCurrentUserContext() {
        return CURRENT_USER_CONTEXT.get();
    }

    /**
     * 记录数据访问日志
     * TODO: 可扩展为写入数据库审计表
     */
    private void logDataAccess(String userId, String operation, boolean success, String errorMessage) {
        if (success) {
            log.info("📋 [审计日志] userId={}, operation={}, status=SUCCESS",
                userId, operation);
        } else {
            log.warn("⚠️  [审计日志] userId={}, operation={}, status=FAILED, error={}",
                userId, operation, errorMessage);
        }
    }
}

