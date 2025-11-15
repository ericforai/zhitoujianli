package annotation;

import java.lang.annotation.*;

import enums.PlanType;

/**
 * 套餐权限检查注解
 *
 * 在方法上使用此注解，可以自动检查用户套餐权限和配额是否足够
 *
 * 使用示例：
 * <pre>
 * @CheckPlanPermission(
 *     requiredPlans = {PlanType.BASIC, PlanType.PROFESSIONAL},
 *     quotaKey = "resume_advanced_optimize",
 *     amount = 1,
 *     message = "高级简历优化功能需要高效版或极速版套餐"
 * )
 * public void advancedOptimize() {
 *     // 方法实现
 * }
 * </pre>
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-13
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CheckPlanPermission {

    /**
     * 需要的套餐类型（用户套餐必须在此列表中）
     * 如果为空，则不检查套餐类型，只检查配额
     */
    PlanType[] requiredPlans() default {};

    /**
     * 配额键（需要检查的配额类型）
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
    String message() default "当前套餐不支持此功能，请升级";
}

