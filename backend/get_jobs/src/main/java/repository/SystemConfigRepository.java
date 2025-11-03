package repository;

import entity.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 系统配置数据访问层
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, Long> {

    /**
     * 根据配置键查询
     */
    Optional<SystemConfig> findByConfigKey(String configKey);

    /**
     * 检查配置键是否存在
     */
    boolean existsByConfigKey(String configKey);

    /**
     * 根据配置键删除（如果存在）
     */
    void deleteByConfigKey(String configKey);
}

