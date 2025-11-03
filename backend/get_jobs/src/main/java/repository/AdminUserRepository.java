package repository;

import entity.AdminUser;
import enums.AdminType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 管理员用户数据访问层
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-29
 */
@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {

    /**
     * 根据用户名查询管理员
     */
    Optional<AdminUser> findByUsername(String username);

    /**
     * 根据用户名和激活状态查询
     */
    Optional<AdminUser> findByUsernameAndIsActive(String username, Boolean isActive);

    /**
     * 根据用户ID查询管理员
     */
    Optional<AdminUser> findByUserId(String userId);

    /**
     * 根据用户ID和激活状态查询
     */
    Optional<AdminUser> findByUserIdAndIsActive(String userId, Boolean isActive);

    /**
     * 查询所有激活的管理员
     */
    List<AdminUser> findByIsActiveTrue();

    /**
     * 根据管理员类型查询
     */
    List<AdminUser> findByAdminType(AdminType adminType);

    /**
     * 根据管理员类型和激活状态查询
     */
    List<AdminUser> findByAdminTypeAndIsActive(AdminType adminType, Boolean isActive);

    /**
     * 检查用户是否是管理员
     */
    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM AdminUser a WHERE a.userId = :userId AND a.isActive = true")
    boolean existsByUserIdAndActive(@Param("userId") String userId);

    /**
     * 检查用户是否是指定类型的管理员
     */
    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM AdminUser a WHERE a.userId = :userId AND a.adminType = :adminType AND a.isActive = true")
    boolean existsByUserIdAndAdminTypeAndActive(@Param("userId") String userId, @Param("adminType") AdminType adminType);
}

