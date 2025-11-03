package repository;

import entity.FeatureFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 功能开关数据访问层
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Repository
public interface FeatureFlagRepository extends JpaRepository<FeatureFlag, Long> {

    /**
     * 根据功能键查询
     */
    Optional<FeatureFlag> findByFeatureKey(String featureKey);

    /**
     * 查询所有启用的功能开关
     */
    List<FeatureFlag> findByEnabledTrue();

    /**
     * 查询所有禁用的功能开关
     */
    List<FeatureFlag> findByEnabledFalse();

    /**
     * 检查功能键是否存在
     */
    boolean existsByFeatureKey(String featureKey);

    /**
     * 根据功能键删除
     */
    void deleteByFeatureKey(String featureKey);

    /**
     * 根据套餐类型查询可用的功能（启用的且目标套餐包含该套餐或为空）
     * 使用原生SQL查询处理PostgreSQL JSONB数组
     */
    @Query(value = "SELECT * FROM feature_flags WHERE enabled = true " +
           "AND (target_plans IS NULL OR jsonb_array_length(target_plans) = 0 " +
           "OR target_plans @> CAST(:planTypeJson AS jsonb))",
           nativeQuery = true)
    List<FeatureFlag> findEnabledByPlanType(@Param("planTypeJson") String planTypeJson);

    /**
     * 检查用户是否可以使用指定功能
     * 使用原生SQL查询处理PostgreSQL JSONB数组
     */
    @Query(value = "SELECT * FROM feature_flags WHERE feature_key = :featureKey " +
           "AND enabled = true " +
           "AND (target_plans IS NULL OR jsonb_array_length(target_plans) = 0 " +
           "OR target_plans @> CAST(:planTypeJson AS jsonb)) " +
           "AND (target_users IS NULL OR jsonb_array_length(target_users) = 0 " +
           "OR target_users @> CAST(:userIdJson AS jsonb))",
           nativeQuery = true)
    Optional<FeatureFlag> findEnabledAndAllowed(@Param("featureKey") String featureKey,
                                                 @Param("planTypeJson") String planTypeJson,
                                                 @Param("userIdJson") String userIdJson);
}

