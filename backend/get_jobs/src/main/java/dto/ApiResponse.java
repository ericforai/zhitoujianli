package dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 统一API响应格式
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private Integer code;
    private Boolean success;
    private String message;
    private T data;
    private Long timestamp;
    private String requestId;

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, true, "操作成功", data, System.currentTimeMillis(), null);
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(200, true, message, data, System.currentTimeMillis(), null);
    }

    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(200, true, message, null, System.currentTimeMillis(), null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(500, false, message, null, System.currentTimeMillis(), null);
    }

    public static <T> ApiResponse<T> error(Integer code, String message) {
        return new ApiResponse<>(code, false, message, null, System.currentTimeMillis(), null);
    }

    public static <T> ApiResponse<T> badRequest(String message) {
        return new ApiResponse<>(400, false, message, null, System.currentTimeMillis(), null);
    }

    public static <T> ApiResponse<T> unauthorized(String message) {
        return new ApiResponse<>(401, false, message, null, System.currentTimeMillis(), null);
    }

    public static <T> ApiResponse<T> notFound(String message) {
        return new ApiResponse<>(404, false, message, null, System.currentTimeMillis(), null);
    }
}

