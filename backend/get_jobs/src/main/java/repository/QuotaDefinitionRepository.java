package repository;

import entity.QuotaDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 配额定义数据访问层
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */
@Repository
public interface QuotaDefinitionRepository extends JpaRepository<QuotaDefinition, Long> {

    /**
     * 根据配额键查询配额定义
     */
    Optional<QuotaDefinition> findByQuotaKey(String quotaKey);

    /**
     * 根据配额键和是否启用查询配额定义
     */
    Optional<QuotaDefinition> findByQuotaKeyAndIsActive(String quotaKey, Boolean isActive);

    /**
     * 查询所有启用的配额定义
     */
    List<QuotaDefinition> findByIsActiveTrueOrderBySortOrderAsc();

    /**
     * 根据配额类别查询启用的配额定义
     */
    @Query("SELECT qd FROM QuotaDefinition qd WHERE qd.quotaCategory = :category AND qd.isActive = true ORDER BY qd.sortOrder ASC")
    List<QuotaDefinition> findByCategoryAndActive(@Param("category") String category);

    /**
     * 检查配额键是否存在
     */
    boolean existsByQuotaKey(String quotaKey);
}

