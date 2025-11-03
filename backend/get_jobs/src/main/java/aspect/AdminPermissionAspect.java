package aspect;

import java.util.HashMap;
import java.util.Map;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import annotation.RequireAdmin;
import enums.AdminType;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import service.AdminService;
import util.UserContextUtil;

/**
 * 管理员权限切面
 * 用于拦截带有 @RequireAdmin 注解的方法，进行权限验证
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Slf4j
@Aspect
@Component
public class AdminPermissionAspect {

    @Autowired
    private AdminService adminService;

    /**
     * 拦截带有 @RequireAdmin 注解的方法
     */
    @Around("@annotation(requireAdmin)")
    public Object checkAdminPermission(ProceedingJoinPoint joinPoint, RequireAdmin requireAdmin) throws Throwable {
        try {
            String userId = UserContextUtil.getCurrentUserId();

            if (userId == null || userId.isEmpty()) {
                log.warn("⚠️ 未登录用户尝试访问管理员接口");
                return createUnauthorizedResponse("需要登录");
            }

            // 检查是否是管理员
            if (!adminService.isAdmin(userId)) {
                log.warn("⚠️ 非管理员用户尝试访问管理员接口: userId={}", userId);
                return createForbiddenResponse("需要管理员权限");
            }

            // 如果需要超级管理员权限
            if (requireAdmin.requireSuperAdmin()) {
                entity.AdminUser adminUser = adminService.getAdminUser(userId);
                if (adminUser == null || adminUser.getAdminType() != AdminType.SUPER_ADMIN) {
                    log.warn("⚠️ 非超级管理员尝试访问超级管理员接口: userId={}", userId);
                    return createForbiddenResponse("需要超级管理员权限");
                }
            }

            // 如果需要特定权限
            if (requireAdmin.permission() != null && !requireAdmin.permission().isEmpty()) {
                if (!adminService.hasPermission(userId, requireAdmin.permission())) {
                    log.warn("⚠️ 用户缺少所需权限: userId={}, permission={}", userId, requireAdmin.permission());
                    return createForbiddenResponse("缺少权限: " + requireAdmin.permission());
                }
            }

            // 权限验证通过，继续执行
            return joinPoint.proceed();

        } catch (Exception e) {
            log.error("❌ 权限检查异常", e);
            return createErrorResponse("权限检查失败: " + e.getMessage());
        }
    }

    /**
     * 创建未授权响应
     */
    private Object createUnauthorizedResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("code", HttpStatus.UNAUTHORIZED.value());

        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletResponse httpResponse = attributes.getResponse();
                if (httpResponse != null) {
                    httpResponse.setStatus(HttpStatus.UNAUTHORIZED.value());
                    httpResponse.setContentType("application/json;charset=UTF-8");
                }
            }
        } catch (Exception e) {
            log.error("❌ 设置响应状态失败", e);
        }

        return response;
    }

    /**
     * 创建禁止访问响应
     */
    private Object createForbiddenResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("code", HttpStatus.FORBIDDEN.value());

        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletResponse httpResponse = attributes.getResponse();
                if (httpResponse != null) {
                    httpResponse.setStatus(HttpStatus.FORBIDDEN.value());
                    httpResponse.setContentType("application/json;charset=UTF-8");
                }
            }
        } catch (Exception e) {
            log.error("❌ 设置响应状态失败", e);
        }

        return response;
    }

    /**
     * 创建错误响应
     */
    private Object createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("code", HttpStatus.INTERNAL_SERVER_ERROR.value());

        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletResponse httpResponse = attributes.getResponse();
                if (httpResponse != null) {
                    httpResponse.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
                    httpResponse.setContentType("application/json;charset=UTF-8");
                }
            }
        } catch (Exception e) {
            log.error("❌ 设置响应状态失败", e);
        }

        return response;
    }
}

