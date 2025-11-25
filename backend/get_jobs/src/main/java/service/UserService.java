package service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import entity.User;
import lombok.extern.slf4j.Slf4j;
import repository.UserRepository;

/**
 * 用户管理服务
 *
 * @author ZhiTouJianLi Team
 */
@Slf4j
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 注册新用户
     */
    @Transactional
    public User registerUser(String email, String password, String username) {
        // 检查邮箱是否已存在
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("邮箱已被注册");
        }

        // 创建用户
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password)); // BCrypt加密
        user.setUsername(username != null ? username : email.split("@")[0]);
        user.setEmailVerified(true); // 通过验证码验证后注册，直接设为已验证
        user.setActive(true);

        User savedUser = userRepository.save(user);
        log.info("✅ 用户注册成功: {}, ID: {}", email, savedUser.getUserId());
        return savedUser;
    }

    /**
     * 根据邮箱查找用户
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * 验证用户密码
     */
    public boolean verifyPassword(User user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }

    /**
     * 更新密码
     */
    @Transactional
    public void updatePassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("✅ 密码更新成功: userId={}", userId);
    }

    /**
     * 验证邮箱
     */
    @Transactional
    public void verifyEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

        user.setEmailVerified(true);
        userRepository.save(user);
        log.info("✅ 邮箱验证成功: {}", email);
    }

    /**
     * 获取用户总数（用于数据迁移判断）
     *
     * @return 当前用户总数
     */
    public long getUserCount() {
        long count = userRepository.count();
        log.debug("当前用户总数: {}", count);
        return count;
    }

    /**
     * 软删除用户
     */
    @Transactional
    public void softDeleteUser(Long userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

        if (user.isDeleted()) {
            throw new IllegalArgumentException("用户已被删除");
        }

        user.softDelete(reason);
        userRepository.save(user);
        log.info("✅ 用户软删除成功: userId={}, reason={}", userId, reason);
    }

    /**
     * 恢复已删除的用户
     */
    @Transactional
    public void restoreUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

        if (!user.isDeleted()) {
            throw new IllegalArgumentException("用户未被删除");
        }

        user.restore();
        userRepository.save(user);
        log.info("✅ 用户恢复成功: userId={}", userId);
    }

    /**
     * 更新用户最后登录信息
     */
    @Transactional
    public void updateLastLogin(Long userId, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

        user.updateLastLogin(ipAddress);
        userRepository.save(user);
        log.debug("✅ 更新最后登录信息: userId={}, ip={}", userId, ipAddress);
    }

    /**
     * 根据ID查找用户
     */
    public Optional<User> findById(Long userId) {
        return userRepository.findById(userId);
    }

    /**
     * 检查用户是否被删除
     */
    public boolean isUserDeleted(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(User::isDeleted).orElse(false);
    }

    // ==================== 管理员功能 ====================

    /**
     * 分页获取用户列表
     * 🔧 修复：只返回未删除的用户
     */
    public Page<User> getUsers(Pageable pageable) {
        return userRepository.findAllNotDeleted(pageable);
    }

    /**
     * 根据ID获取用户详情
     */
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在: userId=" + userId));
    }

    /**
     * 更新用户激活状态
     */
    @Transactional
    public void updateUserStatus(Long userId, Boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在: userId=" + userId));

        user.setActive(active);
        userRepository.save(user);
        log.info("✅ 用户状态更新成功: userId={}, active={}", userId, active);
    }
}

