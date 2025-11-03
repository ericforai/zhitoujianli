package entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 系统配置实体
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Entity
@Table(name = "system_configs", indexes = {
    @Index(name = "idx_system_configs_key", columnList = "config_key", unique = true)
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 配置键（唯一标识）
     */
    @Column(name = "config_key", nullable = false, unique = true, length = 100)
    private String configKey;

    /**
     * 配置值
     */
    @Column(name = "config_value", nullable = false, columnDefinition = "TEXT")
    private String configValue;

    /**
     * 配置类型（STRING, NUMBER, BOOLEAN, JSON）
     */
    @Column(name = "config_type", nullable = false, length = 50)
    private String configType;

    /**
     * 配置描述
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * 最后更新者
     */
    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    /**
     * 更新时间
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * 配置类型枚举
     */
    public enum ConfigType {
        STRING("字符串"),
        NUMBER("数字"),
        BOOLEAN("布尔值"),
        JSON("JSON对象");

        private final String displayName;

        ConfigType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * 将配置值转换为指定类型
     */
    public Object getValueAsType() {
        switch (configType.toUpperCase()) {
            case "STRING":
                return configValue;
            case "NUMBER":
                try {
                    if (configValue.contains(".")) {
                        return Double.parseDouble(configValue);
                    } else {
                        return Long.parseLong(configValue);
                    }
                } catch (NumberFormatException e) {
                    return configValue;
                }
            case "BOOLEAN":
                return Boolean.parseBoolean(configValue);
            case "JSON":
                return configValue; // JSON字符串，需要外部解析
            default:
                return configValue;
        }
    }
}
