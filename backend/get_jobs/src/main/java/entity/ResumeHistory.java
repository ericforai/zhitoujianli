package entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 简历优化历史记录实体
 * ✅ 修复：实现用户数据隔离，每个用户只能看到自己的历史记录
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-25
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "resume_history", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_created_at", columnList = "created_at"),
    @Index(name = "idx_user_created", columnList = "user_id,created_at")
})
public class ResumeHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户ID（来自Authing）
     * ✅ 关键字段：用于数据隔离
     */
    @Column(name = "user_id", nullable = false)
    private String userId;

    /**
     * 历史记录类型：模板 或 优化
     */
    @Column(name = "type", nullable = false, length = 20)
    private String type;

    /**
     * 优化分数（0-100）
     */
    @Column(name = "score")
    private Integer score;

    /**
     * 导出次数
     */
    @Column(name = "export_count")
    private Integer exportCount;

    /**
     * 下载URL
     */
    @Column(name = "download_url", length = 500)
    private String downloadUrl;

    /**
     * 元数据（JSON格式，存储额外的信息）
     */
    @Column(name = "meta", columnDefinition = "TEXT")
    private String meta;

    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * 创建前自动设置时间戳
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (exportCount == null) {
            exportCount = 0;
        }
    }

    /**
     * 更新前自动更新时间戳
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}



