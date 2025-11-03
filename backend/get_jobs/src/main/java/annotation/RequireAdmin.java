package annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 需要管理员权限的注解
 * 用于标记需要管理员权限才能访问的接口
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireAdmin {
    /**
     * 需要的权限名称（可选）
     * 如果不指定，只需要是管理员即可
     * 如果指定，需要同时拥有该权限
     */
    String permission() default "";

    /**
     * 是否需要超级管理员权限
     */
    boolean requireSuperAdmin() default false;
}

