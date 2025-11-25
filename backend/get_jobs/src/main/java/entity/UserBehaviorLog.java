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
 * 用户行为日志实体
 * 记录用户关键操作行为，用于数据分析和产品优化
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */
@Entity
@Table(name = "user_behavior_logs", indexes = {
    @Index(name = "idx_user_id", columnList = "userId"),
    @Index(name = "idx_behavior_type", columnList = "behaviorType"),
    @Index(name = "idx_created_at", columnList = "createdAt"),
    @Index(name = "idx_user_behavior", columnList = "userId,behaviorType")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBehaviorLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户ID（String格式，兼容Authing用户ID）
     */
    @Column(nullable = false, length = 100)
    private String userId;

    /**
     * 行为类型
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private BehaviorType behaviorType;

    /**
     * 行为状态（成功/失败）
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BehaviorStatus status;

    /**
     * 行为描述
     */
    @Column(length = 500)
    private String description;

    /**
     * 额外数据（JSON格式）
     * 例如：投递的岗位信息、打招呼语内容等
     */
    @Column(columnDefinition = "TEXT")
    private String extraData;

    /**
     * 平台类型（BOSS直聘、智联招聘等）
     */
    @Column(length = 50)
    private String platform;

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
     * 行为类型枚举
     */
    public enum BehaviorType {
        // 登录相关
        QRCODE_SCAN_SUCCESS("BOSS直聘二维码扫码成功"),
        QRCODE_SCAN_FAILED("BOSS直聘二维码扫码失败"),

        // 投递相关
        JOB_DELIVERY_START("启动投递"),
        JOB_DELIVERY_SUCCESS("投递成功"),
        JOB_DELIVERY_FAILED("投递失败"),

        // 简历相关
        RESUME_UPLOAD("上传简历"),
        RESUME_PARSE("解析简历"),

        // 打招呼语相关
        GREETING_GENERATE("生成打招呼语"),
        GREETING_USE("使用打招呼语");

        private final String description;

        BehaviorType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 行为状态枚举
     */
    public enum BehaviorStatus {
        SUCCESS("成功"),
        FAILED("失败"),
        PENDING("进行中");

        private final String description;

        BehaviorStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}

