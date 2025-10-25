package com.superxiang.dto;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Data;

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

    // 自定义Builder以避免内部表示暴露
    public static class AuthSuccessResponseBuilder {
        private Map<String, Object> user;

        public AuthSuccessResponseBuilder user(Map<String, Object> user) {
            this.user = user != null ? new HashMap<>(user) : null;
            return this;
        }
    }
}
