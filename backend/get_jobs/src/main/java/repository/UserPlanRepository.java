package repository;

import entity.UserPlan;
import enums.PlanType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 用户套餐数据访问层
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Repository
public interface UserPlanRepository extends JpaRepository<UserPlan, Long> {

    /**
     * 根据用户ID查询套餐
     */
    Optional<UserPlan> findByUserId(String userId);

    /**
     * 根据用户ID和状态查询套餐
     */
    Optional<UserPlan> findByUserIdAndStatus(String userId, UserPlan.PlanStatus status);

    /**
     * 查询用户的所有套餐（按创建时间倒序）
     */
    List<UserPlan> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * 根据套餐类型查询
     */
    List<UserPlan> findByPlanType(PlanType planType);

    /**
     * 根据套餐类型和状态查询
     */
    List<UserPlan> findByPlanTypeAndStatus(PlanType planType, UserPlan.PlanStatus status);

    /**
     * 统计各套餐类型的用户数量
     */
    @Query("SELECT up.planType, COUNT(up) FROM UserPlan up WHERE up.status = :status GROUP BY up.planType")
    List<Object[]> countByPlanTypeAndStatus(@Param("status") UserPlan.PlanStatus status);

    /**
     * 统计所有套餐类型的用户数量
     */
    @Query("SELECT up.planType, COUNT(up) FROM UserPlan up GROUP BY up.planType")
    List<Object[]> countByPlanType();

    /**
     * 查询即将过期的套餐（N天内）
     */
    @Query("SELECT up FROM UserPlan up WHERE up.status = 'ACTIVE' " +
           "AND up.endDate IS NOT NULL AND up.endDate BETWEEN :today AND :expireDate")
    List<UserPlan> findExpiringSoon(@Param("today") LocalDate today, @Param("expireDate") LocalDate expireDate);

    /**
     * 查询已过期的套餐
     */
    @Query("SELECT up FROM UserPlan up WHERE up.status = 'ACTIVE' " +
           "AND up.endDate IS NOT NULL AND up.endDate < :today")
    List<UserPlan> findExpired(@Param("today") LocalDate today);

    /**
     * 统计活跃套餐数量
     */
    @Query("SELECT COUNT(up) FROM UserPlan up WHERE up.status = 'ACTIVE'")
    long countActivePlans();

    /**
     * 统计指定套餐类型的活跃套餐数量
     */
    @Query("SELECT COUNT(up) FROM UserPlan up WHERE up.planType = :planType AND up.status = 'ACTIVE'")
    long countActivePlansByType(@Param("planType") PlanType planType);
}

