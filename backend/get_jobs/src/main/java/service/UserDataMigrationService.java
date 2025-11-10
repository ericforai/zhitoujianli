package service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

/**
 * 用户数据迁移服务
 * 用于将default_user数据迁移到首个注册用户
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-22
 */
@Service
@Slf4j
public class UserDataMigrationService {

    /**
     * 将default_user数据迁移到指定用户
     *
     * @param targetUserId 目标用户ID（例如：user_1）
     * @return 是否迁移成功
     */
    public boolean migrateDefaultUserData(String targetUserId) {
        try {
            log.info("📦 开始数据迁移：default_user -> {}", targetUserId);

            Path defaultUserDir = Paths.get("user_data/default_user");
            Path targetUserDir = Paths.get("user_data/" + targetUserId);

            // 1. 检查default_user目录是否存在
            if (!Files.exists(defaultUserDir)) {
                log.info("default_user目录不存在，无需迁移");
                return true;
            }

            // 2. 备份default_user数据
            Path backupDir = Paths.get("user_data/default_user.backup");
            if (Files.exists(backupDir)) {
                log.warn("备份目录已存在，跳过备份: {}", backupDir);
            } else {
                copyDirectory(defaultUserDir, backupDir);
                log.info("✅ 已备份default_user数据到: {}", backupDir.toAbsolutePath());
            }

            // 3. 如果目标用户目录已存在，跳过迁移（避免覆盖）
            if (Files.exists(targetUserDir)) {
                log.info("目标用户{}目录已存在，跳过迁移", targetUserId);
                return true;
            }

            // 4. 复制数据到目标用户目录
            copyDirectory(defaultUserDir, targetUserDir);
            log.info("✅ 已复制数据到目标用户目录: {}", targetUserDir.toAbsolutePath());

            // 5. 更新配置文件中的用户信息
            boolean updated = updateConfigUserId(targetUserDir, targetUserId);
            if (updated) {
                log.info("✅ 已更新配置文件中的用户ID");
            } else {
                log.warn("⚠️ 配置文件更新失败（可能不存在config.json）");
            }

            // 6. 迁移Cookie文件（如果存在）
            migrateCookieFile(targetUserId);

            log.info("🎉 数据迁移完成：default_user -> {}", targetUserId);
            return true;

        } catch (Exception e) {
            log.error("❌ 数据迁移失败", e);
            return false;
        }
    }

    /**
     * 递归复制目录
     *
     * @param source 源目录
     * @param target 目标目录
     * @throws IOException 复制失败
     */
    private void copyDirectory(Path source, Path target) throws IOException {
        Files.walk(source).forEach(src -> {
            try {
                Path dest = target.resolve(source.relativize(src));
                if (Files.isDirectory(src)) {
                    if (!Files.exists(dest)) {
                        Files.createDirectories(dest);
                    }
                } else {
                    Files.copy(src, dest, StandardCopyOption.REPLACE_EXISTING);
                    log.debug("复制文件: {} -> {}", src.getFileName(), dest);
                }
            } catch (IOException e) {
                log.error("复制文件失败: {}", src, e);
            }
        });
    }

    /**
     * 更新配置文件中的userId字段
     *
     * @param userDir 用户目录
     * @param userId 新的用户ID
     * @return 是否更新成功
     */
    private boolean updateConfigUserId(Path userDir, String userId) {
        try {
            Path configFile = userDir.resolve("config.json");
            if (!Files.exists(configFile)) {
                log.warn("配置文件不存在: {}", configFile);
                return false;
            }

            // 读取配置
            ObjectMapper mapper = new ObjectMapper();
            @SuppressWarnings("unchecked")
            Map<String, Object> config = mapper.readValue(configFile.toFile(), Map.class);

            // 更新用户ID
            config.put("userId", userId);
            config.put("lastModified", System.currentTimeMillis());

            // 写回文件
            mapper.writerWithDefaultPrettyPrinter().writeValue(configFile.toFile(), config);

            log.info("✅ 配置文件已更新userId: {} -> {}", configFile.getFileName(), userId);
            return true;

        } catch (Exception e) {
            log.error("更新配置文件失败", e);
            return false;
        }
    }

    /**
     * ❌ 已禁用：Cookie迁移功能
     *
     * 【重要】每个用户必须使用自己的Boss账号登录！
     * 不能共享Cookie，否则会导致用户A的投递发送到用户B的Boss账号！
     *
     * 修复说明：2025-11-06
     * - 问题：系统会复制default_user的Cookie给新用户
     * - 后果：多个用户共享同一个Boss登录状态，导致投递错乱
     * - 解决：禁用Cookie迁移，要求每个用户独立登录Boss
     *
     * @param targetUserId 目标用户ID
     */
    private void migrateCookieFile(String targetUserId) {
        log.warn("⚠️ Cookie迁移已禁用 - 用户 {} 需要独立登录自己的Boss账号", targetUserId);
        log.warn("⚠️ 多租户隔离要求：每个用户必须使用自己的Boss账号，不能共享Cookie");

        // ❌ 以下代码已禁用（2025-11-06修复多租户隔离BUG）
        // 原代码会导致用户共享Boss登录状态！
        //
        // Path defaultCookie = Paths.get("/tmp/boss_cookies.json");
        // if (Files.exists(defaultCookie)) {
        //     Path targetCookie = Paths.get("/tmp/boss_cookies_" + targetUserId + ".json");
        //     Files.copy(defaultCookie, targetCookie, StandardCopyOption.REPLACE_EXISTING);
        // }
    }

    /**
     * 检查是否需要执行数据迁移
     * 条件：启用安全认证 且 default_user目录存在 且 尚未迁移
     *
     * @return 是否需要迁移
     */
    public boolean shouldMigrate() {
        Path defaultUserDir = Paths.get("user_data/default_user");
        Path backupDir = Paths.get("user_data/default_user.backup");

        // 如果default_user存在，且未备份过，说明需要迁移
        boolean needMigrate = Files.exists(defaultUserDir) && !Files.exists(backupDir);

        if (needMigrate) {
            log.info("🔍 检测到需要执行数据迁移（default_user存在且未备份）");
        }

        return needMigrate;
    }

    /**
     * 回滚数据迁移（从备份恢复）
     *
     * @return 是否回滚成功
     */
    public boolean rollbackMigration() {
        try {
            Path backupDir = Paths.get("user_data/default_user.backup");
            Path defaultUserDir = Paths.get("user_data/default_user");

            if (!Files.exists(backupDir)) {
                log.warn("备份目录不存在，无法回滚");
                return false;
            }

            // 删除当前default_user目录
            if (Files.exists(defaultUserDir)) {
                deleteDirectory(defaultUserDir);
            }

            // 从备份恢复
            copyDirectory(backupDir, defaultUserDir);
            log.info("✅ 已从备份恢复default_user数据");

            return true;

        } catch (Exception e) {
            log.error("❌ 回滚失败", e);
            return false;
        }
    }

    /**
     * 递归删除目录
     *
     * @param directory 要删除的目录
     * @throws IOException 删除失败
     */
    private void deleteDirectory(Path directory) throws IOException {
        if (Files.exists(directory)) {
            Files.walk(directory)
                .sorted((a, b) -> b.compareTo(a)) // 先删除文件，后删除目录
                .forEach(path -> {
                    try {
                        Files.delete(path);
                    } catch (IOException e) {
                        log.error("删除文件失败: {}", path, e);
                    }
                });
        }
    }
}

