package aspect;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import util.UserContextUtil;

/**
 * 监控指标切面
 * ✅ 自动收集API性能指标
 * ✅ 监控多租户访问安全
 * ✅ 记录用户活跃度
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-03
 */
@Aspect
@Component
@Slf4j
public class MetricsAspect {

    @Autowired
    private MeterRegistry meterRegistry;

    /**
     * 监控API调用性能
     * 记录响应时间和成功率
     */
    @Around("@annotation(org.springframework.web.bind.annotation.PostMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.GetMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.PutMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.DeleteMapping)")
    public Object monitorApiCall(ProceedingJoinPoint pjp) throws Throwable {
        String methodName = pjp.getSignature().getDeclaringType().getSimpleName() + "." +
                           pjp.getSignature().getName();

        Timer.Sample sample = Timer.start(meterRegistry);

        try {
            Object result = pjp.proceed();

            // 记录成功的API调用
            sample.stop(Timer.builder("api.calls")
                .tag("method", methodName)
                .tag("result", "success")
                .tag("class", pjp.getSignature().getDeclaringType().getSimpleName())
                .description("API调用耗时")
                .register(meterRegistry));

            // 增加成功计数
            Counter.builder("api.requests.total")
                .tag("method", methodName)
                .tag("status", "success")
                .description("API请求总数")
                .register(meterRegistry)
                .increment();

            return result;

        } catch (exception.UnauthorizedException e) {
            // 记录未授权访问
            sample.stop(Timer.builder("api.calls")
                .tag("method", methodName)
                .tag("result", "unauthorized")
                .register(meterRegistry));

            Counter.builder("security.unauthorized.total")
                .tag("method", methodName)
                .description("未授权访问次数")
                .register(meterRegistry)
                .increment();

            log.warn("⚠️  未授权访问: method={}", methodName);
            throw e;

        } catch (Exception e) {
            // 记录错误的API调用
            sample.stop(Timer.builder("api.calls")
                .tag("method", methodName)
                .tag("result", "error")
                .tag("exception", e.getClass().getSimpleName())
                .register(meterRegistry));

            Counter.builder("api.requests.total")
                .tag("method", methodName)
                .tag("status", "error")
                .tag("exception", e.getClass().getSimpleName())
                .register(meterRegistry)
                .increment();

            throw e;
        }
    }

    /**
     * 监控用户活跃度
     * 记录每个用户的操作频率
     */
    @Around("execution(* service..*(..)) && " +
            "!execution(* service.UserRedisService..*(..))")  // 排除Redis服务本身
    public Object monitorUserActivity(ProceedingJoinPoint pjp) throws Throwable {
        try {
            // 尝试获取当前用户
            String userId = UserContextUtil.getCurrentUserId();
            String serviceName = pjp.getTarget().getClass().getSimpleName();

            // 记录用户活跃度
            Counter.builder("user.activity.total")
                .tag("userId", userId)
                .tag("service", serviceName)
                .description("用户活跃度（按服务统计）")
                .register(meterRegistry)
                .increment();

            log.trace("📊 用户活跃度: userId={}, service={}", userId, serviceName);

        } catch (exception.UnauthorizedException e) {
            // 未登录用户，不记录活跃度
        } catch (Exception e) {
            // 忽略监控错误，不影响业务
            log.trace("监控用户活跃度失败: {}", e.getMessage());
        }

        return pjp.proceed();
    }

    /**
     * 监控多租户安全访问
     * 检测跨租户访问尝试
     */
    @Around("@annotation(annotation.CheckQuota) || " +
            "execution(* controller..save*(..)) || " +
            "execution(* controller..get*(..)) || " +
            "execution(* controller..delete*(..))")
    public Object monitorDataAccess(ProceedingJoinPoint pjp) throws Throwable {
        try {
            return pjp.proceed();
        } catch (exception.UnauthorizedException e) {
            // 记录未授权的数据访问
            Counter.builder("security.data_access.denied")
                .tag("method", pjp.getSignature().getName())
                .tag("reason", "unauthorized")
                .description("数据访问被拒绝次数")
                .register(meterRegistry)
                .increment();

            log.warn("🚨 数据访问被拒绝: method={}", pjp.getSignature().getName());
            throw e;
        }
    }
}






