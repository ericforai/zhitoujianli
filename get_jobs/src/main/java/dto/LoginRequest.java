package dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;

    @Override
    public String toString() {
        return "LoginRequest{"
                + "email='" + email + "'"
                + ", password='*****'"
                + "}";
    }
}

