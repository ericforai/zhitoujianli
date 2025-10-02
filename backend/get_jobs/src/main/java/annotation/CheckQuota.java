package annotation;

import java.lang.annotation.*;

/**
 * 配额检查注解
 * 
 * 在方法上使用此注解，可以自动检查用户配额是否足够
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CheckQuota {
    
    /**
     * 配额键
     */
    String quotaKey();
    
    /**
     * 消费数量（默认为1）
     */
    long amount() default 1L;
    
    /**
     * 是否在方法执行前检查（默认为true）
     * 如果为false，则在方法执行后消费配额
     */
    boolean checkBefore() default true;
    
    /**
     * 配额不足时的错误消息
     */
    String message() default "配额不足，请升级套餐";
}