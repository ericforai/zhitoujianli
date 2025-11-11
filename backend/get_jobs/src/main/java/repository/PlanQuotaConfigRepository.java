package repository;

import entity.PlanQuotaConfig;
import enums.PlanType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 套餐配额配置数据访问层
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */
@Repository
public interface PlanQuotaConfigRepository extends JpaRepository<PlanQuotaConfig, Long> {

    /**
     * 根据套餐类型和配额ID查询配置
     */
    Optional<PlanQuotaConfig> findByPlanTypeAndQuotaId(PlanType planType, Long quotaId);

    /**
     * 根据套餐类型、配额ID和是否启用查询配置
     */
    Optional<PlanQuotaConfig> findByPlanTypeAndQuotaIdAndIsEnabled(
            PlanType planType, Long quotaId, Boolean isEnabled);

    /**
     * 查询套餐的所有配额配置
     */
    List<PlanQuotaConfig> findByPlanTypeAndIsEnabledTrue(PlanType planType);

    /**
     * 查询配额的所有套餐配置
     */
    List<PlanQuotaConfig> findByQuotaIdAndIsEnabledTrue(Long quotaId);

    /**
     * 查询所有启用的配置
     */
    @Query("SELECT pqc FROM PlanQuotaConfig pqc WHERE pqc.isEnabled = true ORDER BY pqc.planType, pqc.quotaId")
    List<PlanQuotaConfig> findAllEnabled();
}

