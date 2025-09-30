package dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

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
}
