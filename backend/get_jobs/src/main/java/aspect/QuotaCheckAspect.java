package aspect;

import annotation.CheckQuota;
import service.QuotaService;
import util.UserContextUtil;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * 配额检查切面
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Slf4j
@Aspect
@Component
public class QuotaCheckAspect {
    
    @Autowired
    private QuotaService quotaService;
    
    @Around("@annotation(checkQuota)")
    public Object checkQuota(ProceedingJoinPoint joinPoint, CheckQuota checkQuota) throws Throwable {
        String userId = UserContextUtil.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("用户未登录，无法检查配额");
        }
        
        String quotaKey = checkQuota.quotaKey();
        long amount = checkQuota.amount();
        
        log.debug("🔍 配额检查切面: userId={}, quotaKey={}, amount={}", 
            userId, quotaKey, amount);
        
        try {
            if (checkQuota.checkBefore()) {
                // 方法执行前检查并消费配额
                quotaService.consumeQuota(userId, quotaKey, amount);
                log.debug("✅ 配额检查通过，执行业务方法");
                return joinPoint.proceed();
            } else {
                // 方法执行后消费配额
                Object result = joinPoint.proceed();
                quotaService.consumeQuota(userId, quotaKey, amount);
                log.debug("✅ 业务方法执行成功，配额已消费");
                return result;
            }
            
        } catch (QuotaService.QuotaExceededException e) {
            log.warn("⚠️ 配额不足: userId={}, quotaKey={}, message={}", 
                userId, quotaKey, e.getMessage());
            
            String message = checkQuota.message();
            if (message.equals("配额不足，请升级套餐")) {
                message = e.getMessage();
            }
            
            throw new RuntimeException(message);
        } catch (Exception e) {
            log.error("❌ 配额检查异常: userId={}, quotaKey={}", userId, quotaKey, e);
            throw e;
        }
    }
}