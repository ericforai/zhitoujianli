package entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户操作审计日志实体
 * 记录所有重要的用户操作，用于安全审计和问题排查
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */
@Entity
@Table(name = "user_audit_logs", indexes = {
    @Index(name = "idx_user_id", columnList = "userId"),
    @Index(name = "idx_action_type", columnList = "actionType"),
    @Index(name = "idx_created_at", columnList = "createdAt"),
    @Index(name = "idx_ip_address", columnList = "ipAddress")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户ID（如果是注册操作，可能为null）
     */
    @Column
    private Long userId;

    /**
     * 用户邮箱
     */
    @Column(length = 100)
    private String userEmail;

    /**
     * 操作类型
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ActionType actionType;

    /**
     * 操作描述
     */
    @Column(length = 500)
    private String description;

    /**
     * 操作结果
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ActionResult result;

    /**
     * IP地址
     */
    @Column(length = 50)
    private String ipAddress;

    /**
     * User-Agent
     */
    @Column(length = 500)
    private String userAgent;

    /**
     * 请求路径
     */
    @Column(length = 200)
    private String requestPath;

    /**
     * 失败原因（如果失败）
     */
    @Column(length = 1000)
    private String failureReason;

    /**
     * 额外数据（JSON格式）
     */
    @Column(columnDefinition = "TEXT")
    private String extraData;

    /**
     * 创建时间
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * 操作类型枚举
     */
    public enum ActionType {
        // 认证操作
        REGISTER("用户注册"),
        LOGIN("用户登录"),
        LOGOUT("用户登出"),
        PASSWORD_RESET("密码重置"),
        PASSWORD_CHANGE("密码修改"),
        EMAIL_VERIFY("邮箱验证"),

        // 账户操作
        ACCOUNT_ACTIVATE("账户激活"),
        ACCOUNT_DEACTIVATE("账户停用"),
        ACCOUNT_DELETE("账户删除"),
        ACCOUNT_RESTORE("账户恢复"),
        PROFILE_UPDATE("资料更新"),

        // 安全操作
        TOKEN_REFRESH("Token刷新"),
        SUSPICIOUS_ACTIVITY("可疑活动"),
        FAILED_LOGIN_ATTEMPT("登录失败尝试"),

        // 数据操作
        DATA_EXPORT("数据导出"),
        DATA_IMPORT("数据导入");

        private final String description;

        ActionType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 操作结果枚举
     */
    public enum ActionResult {
        SUCCESS("成功"),
        FAILURE("失败"),
        PARTIAL("部分成功"),
        ERROR("错误");

        private final String description;

        ActionResult(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}

