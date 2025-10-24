package com.superxiang.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.Map;
import java.util.HashMap;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthSuccessResponse {
    private boolean success;
    private String message;
    private String token;
    private String refreshToken;
    private Long expiresIn;
    private Map<String, Object> user;
    private String userId;

    // 防御性拷贝getter方法以避免内部表示暴露
    public Map<String, Object> getUser() {
        return user != null ? new HashMap<>(user) : null;
    }
}
