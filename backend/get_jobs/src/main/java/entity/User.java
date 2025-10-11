package entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户实体类
 *
 * @author ZhiTouJianLi Team
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(length = 50)
    private String username;

    @Column(nullable = false)
    private Boolean emailVerified = false;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 软删除时间戳
     * null表示未删除，非null表示已删除
     */
    @Column
    private LocalDateTime deletedAt;

    /**
     * 删除原因（可选）
     */
    @Column(length = 500)
    private String deleteReason;

    /**
     * 最后登录时间
     */
    @Column
    private LocalDateTime lastLoginAt;

    /**
     * 最后登录IP
     */
    @Column(length = 50)
    private String lastLoginIp;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * 判断用户是否已被软删除
     */
    public boolean isDeleted() {
        return deletedAt != null;
    }

    /**
     * 软删除用户
     */
    public void softDelete(String reason) {
        this.deletedAt = LocalDateTime.now();
        this.deleteReason = reason;
        this.active = false;
    }

    /**
     * 恢复已删除的用户
     */
    public void restore() {
        this.deletedAt = null;
        this.deleteReason = null;
        this.active = true;
    }

    /**
     * 更新最后登录信息
     */
    public void updateLastLogin(String ip) {
        this.lastLoginAt = LocalDateTime.now();
        this.lastLoginIp = ip;
    }
}

