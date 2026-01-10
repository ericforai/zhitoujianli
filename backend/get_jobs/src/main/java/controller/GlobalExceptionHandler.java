package controller;

import com.superxiang.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * 全局异常处理器
 *
 * 统一处理所有未捕获的异常，返回友好的错误响应
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理参数验证异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        log.warn("参数验证失败: {}", message);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .success(false)
                .message(message)
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * 处理空指针异常
     *
     * ✅ 修复：添加空指针异常处理，避免返回500错误给用户
     */
    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<ErrorResponse> handleNullPointerException(NullPointerException ex) {
        log.error("空指针异常", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse.builder()
                .success(false)
                .message("系统内部错误，请联系管理员")
                .build());
    }

    /**
     * 处理参数异常
     *
     * ✅ 修复：添加参数异常处理，返回400错误
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("参数异常: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse.builder()
                .success(false)
                .message(ex.getMessage())
                .build());
    }

    /**
     * 处理安全异常（未认证用户）
     *
     * ✅ 修复：添加SecurityException处理，返回401错误而不是500
     */
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ErrorResponse> handleSecurityException(SecurityException ex) {
        log.warn("安全异常（未认证用户）: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ErrorResponse.builder()
                .success(false)
                .message("需要登录认证，请先登录")
                .build());
    }

    /**
     * 处理通用异常
     *
     * ✅ 修复：添加通用异常处理，捕获所有未处理的异常
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        // ✅ 修复：输出更详细的错误信息，包括异常类型和消息
        log.error("未处理的异常: {} - {}", ex.getClass().getSimpleName(), ex.getMessage(), ex);
        
        // 如果是SecurityException，应该返回401（虽然已经有专门的处理器，但这里作为兜底）
        if (ex instanceof SecurityException) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.builder()
                    .success(false)
                    .message("需要登录认证，请先登录")
                    .build());
        }
        
        // 其他异常返回500，但提供更详细的错误信息（仅开发环境）
        String message = "系统错误，请稍后重试";
        // 开发环境可以显示详细错误信息
        if (ex.getMessage() != null && !ex.getMessage().isEmpty()) {
            message = "系统错误: " + ex.getMessage();
        }
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse.builder()
                .success(false)
                .message(message)
                .build());
    }
}
