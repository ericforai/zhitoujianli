package repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import entity.User;

/**
 * 用户数据访问层
 *
 * @author ZhiTouJianLi Team
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 根据邮箱查找用户（排除已删除）
     */
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.deletedAt IS NULL")
    Optional<User> findByEmail(String email);

    /**
     * 根据邮箱查找用户（包括已删除）
     */
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmailIncludingDeleted(String email);

    /**
     * 检查邮箱是否存在（排除已删除）
     */
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.email = :email AND u.deletedAt IS NULL")
    boolean existsByEmail(String email);

    /**
     * 根据邮箱查找未删除的激活用户
     */
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.deletedAt IS NULL AND u.active = true")
    Optional<User> findActiveByEmail(String email);

    /**
     * 根据邮箱删除用户（物理删除，慎用）
     */
    void deleteByEmail(String email);
}

