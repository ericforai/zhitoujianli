package entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 登录日志实体
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Entity
@Table(name = "login_logs", indexes = {
    @Index(name = "idx_login_logs_user_id", columnList = "user_id"),
    @Index(name = "idx_login_logs_email", columnList = "email"),
    @Index(name = "idx_login_logs_created_at", columnList = "created_at"),
    @Index(name = "idx_login_logs_login_status", columnList = "login_status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户ID（外键关联users表）
     */
    @Column(name = "user_id")
    private Long userId;

    /**
     * 邮箱地址（冗余字段，用于快速查询）
     * 支持管理员邮箱格式，增加长度限制
     */
    @Column(nullable = false, length = 255)
    private String email;

    /**
     * 登录类型（EMAIL, OAUTH等）
     */
    @Column(name = "login_type", nullable = false, length = 20)
    private String loginType;

    /**
     * 登录状态（SUCCESS, FAILED）
     */
    @Column(name = "login_status", nullable = false, length = 20)
    private String loginStatus;

    /**
     * IP地址
     */
    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    /**
     * User Agent
     */
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    /**
     * 设备信息
     */
    @Column(name = "device_info", length = 100)
    private String deviceInfo;

    /**
     * 地理位置
     */
    @Column(length = 100)
    private String location;

    /**
     * 失败原因（仅登录失败时记录）
     */
    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    /**
     * 创建时间（登录时间）
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    /**
     * 登录状态枚举
     */
    public enum LoginStatus {
        SUCCESS("成功"),
        FAILED("失败");

        private final String displayName;

        LoginStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * 登录类型枚举
     */
    public enum LoginType {
        EMAIL("邮箱登录"),
        OAUTH("第三方登录");

        private final String displayName;

        LoginType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
