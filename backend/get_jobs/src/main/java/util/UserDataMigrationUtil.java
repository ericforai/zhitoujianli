package util;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;

import lombok.extern.slf4j.Slf4j;

/**
 * 用户数据迁移工具类
 *
 * 功能：将旧格式的用户数据目录（包含@和.）迁移到新格式（只有_和-）
 *
 * 迁移方向：luwenrong123@sina.com -> luwenrong123_sina_com
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-04
 */
@Slf4j
public class UserDataMigrationUtil {

    private static final String USER_DATA_BASE = "user_data";

    /**
     * 迁移当前用户的数据（自动在用户登录时调用）
     *
     * 场景：用户登录时，自动检查并迁移旧数据
     *
     * @return 迁移结果信息
     */
    public static MigrationResult migrateCurrentUserData() {
        try {
            String userId = UserContextUtil.getCurrentUserId();
            String safeUserId = UserDataPathUtil.sanitizeUserId(userId);

            // 如果格式相同，无需迁移
            if (userId.equals(safeUserId)) {
                return MigrationResult.notNeeded("用户ID格式已是最新格式");
            }

            File oldDir = new File(USER_DATA_BASE + File.separator + userId);
            File newDir = new File(USER_DATA_BASE + File.separator + safeUserId);

            // 旧目录不存在，无需迁移
            if (!oldDir.exists() || !oldDir.isDirectory()) {
                return MigrationResult.notNeeded("旧格式目录不存在");
            }

            // 检查旧目录是否为空
            File[] oldFiles = oldDir.listFiles();
            if (oldFiles == null || oldFiles.length == 0) {
                log.info("旧目录为空，删除: {}", oldDir.getName());
                if (oldDir.delete()) {
                    return MigrationResult.notNeeded("旧目录为空已删除");
                }
                return MigrationResult.notNeeded("旧目录为空");
            }

            // 新目录已存在，需要合并
            if (newDir.exists()) {
                return mergeUserData(oldDir, newDir);
            } else {
                return moveUserData(oldDir, newDir);
            }

        } catch (Exception e) {
            log.error("用户数据迁移失败", e);
            return MigrationResult.failed(e.getMessage());
        }
    }

    /**
     * 移动用户数据目录（简单重命名）
     */
    private static MigrationResult moveUserData(File oldDir, File newDir) {
        try {
            log.info("🔄 开始迁移用户数据: {} -> {}", oldDir.getName(), newDir.getName());

            // 直接重命名目录
            if (oldDir.renameTo(newDir)) {
                log.info("✅ 用户数据迁移成功（重命名）: {} -> {}", oldDir.getName(), newDir.getName());
                return MigrationResult.success("数据目录已重命名");
            } else {
                // 重命名失败，尝试复制
                log.warn("重命名失败，尝试复制方式");
                return copyUserData(oldDir, newDir);
            }

        } catch (Exception e) {
            log.error("移动用户数据失败", e);
            return MigrationResult.failed(e.getMessage());
        }
    }

    /**
     * 复制用户数据目录
     */
    private static MigrationResult copyUserData(File oldDir, File newDir) throws IOException {
        log.info("🔄 使用复制方式迁移用户数据");

        // 创建新目录
        if (!newDir.exists()) {
            if (!newDir.mkdirs()) {
                throw new IOException("无法创建新目录: " + newDir.getAbsolutePath());
            }
        }

        // 复制所有文件
        int copiedCount = 0;
        File[] files = oldDir.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isFile()) {
                    Path source = file.toPath();
                    Path target = Paths.get(newDir.getAbsolutePath(), file.getName());
                    Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING);
                    copiedCount++;
                    log.info("  ✅ 复制文件: {}", file.getName());
                }
            }
        }

        log.info("✅ 用户数据迁移成功（复制）: 共复制 {} 个文件", copiedCount);

        // 复制成功后，删除旧目录
        try {
            deleteDirectory(oldDir);
            log.info("✅ 已删除旧目录: {}", oldDir.getName());
        } catch (Exception e) {
            log.warn("⚠️ 删除旧目录失败（不影响使用）: {}", e.getMessage());
        }

        return MigrationResult.success(String.format("数据已复制，共 %d 个文件", copiedCount));
    }

    /**
     * 合并用户数据（新旧目录都存在时）
     */
    private static MigrationResult mergeUserData(File oldDir, File newDir) throws IOException {
        log.info("🔄 合并用户数据: {} -> {}", oldDir.getName(), newDir.getName());

        List<String> mergedFiles = new ArrayList<>();
        List<String> skippedFiles = new ArrayList<>();
        File[] files = oldDir.listFiles();

        if (files != null) {
            for (File oldFile : files) {
                if (oldFile.isFile()) {
                    File newFile = new File(newDir, oldFile.getName());

                    // 如果新目录中不存在该文件，则复制
                    if (!newFile.exists()) {
                        Files.copy(oldFile.toPath(), newFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                        mergedFiles.add(oldFile.getName());
                        log.info("  ✅ 复制文件: {}", oldFile.getName());
                    } else {
                        // 文件已存在，比较时间戳，保留最新的
                        if (oldFile.lastModified() > newFile.lastModified()) {
                            // 旧文件更新，创建备份并覆盖
                            File backup = new File(newDir, oldFile.getName() + ".old");
                            Files.copy(newFile.toPath(), backup.toPath(), StandardCopyOption.REPLACE_EXISTING);
                            Files.copy(oldFile.toPath(), newFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                            log.info("  ⚠️ 覆盖文件（旧文件更新）: {}，备份为: {}", oldFile.getName(), backup.getName());
                            mergedFiles.add(oldFile.getName());
                        } else {
                            skippedFiles.add(oldFile.getName());
                            log.info("  ⏭️  跳过已存在的文件: {}", oldFile.getName());
                        }
                    }
                }
            }
        }

        // 合并完成后，删除旧目录
        try {
            deleteDirectory(oldDir);
            log.info("✅ 已删除旧目录: {}", oldDir.getName());
        } catch (Exception e) {
            log.warn("⚠️ 删除旧目录失败（不影响使用）: {}", e.getMessage());
        }

        String message = String.format("合并完成，复制了 %d 个文件，跳过了 %d 个文件",
                                      mergedFiles.size(), skippedFiles.size());
        log.info("✅ {}", message);
        return MigrationResult.success(message);
    }

    /**
     * 递归删除目录
     */
    private static void deleteDirectory(File directory) throws IOException {
        if (directory.exists()) {
            File[] files = directory.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isDirectory()) {
                        deleteDirectory(file);
                    } else {
                        if (!file.delete()) {
                            log.warn("无法删除文件: {}", file.getAbsolutePath());
                        }
                    }
                }
            }
            if (!directory.delete()) {
                throw new IOException("无法删除目录: " + directory.getAbsolutePath());
            }
        }
    }

    /**
     * 批量迁移所有用户数据（管理员工具）
     *
     * 注意：此方法仅供管理员手动调用，不会自动执行
     */
    public static List<MigrationResult> migrateAllUserData() {
        List<MigrationResult> results = new ArrayList<>();

        File userDataDir = new File(USER_DATA_BASE);
        if (!userDataDir.exists() || !userDataDir.isDirectory()) {
            results.add(MigrationResult.failed("用户数据目录不存在"));
            return results;
        }

        File[] userDirs = userDataDir.listFiles(File::isDirectory);
        if (userDirs == null) {
            return results;
        }

        log.info("🔄 开始批量迁移用户数据，共 {} 个目录", userDirs.length);

        for (File userDir : userDirs) {
            String userId = userDir.getName();
            String safeUserId = UserDataPathUtil.sanitizeUserId(userId);

            // 如果格式已是最新，跳过
            if (userId.equals(safeUserId)) {
                log.debug("跳过已是新格式的目录: {}", userId);
                continue;
            }

            File newDir = new File(USER_DATA_BASE + File.separator + safeUserId);

            try {
                log.info("处理用户目录: {} -> {}", userId, safeUserId);

                MigrationResult result;
                if (newDir.exists()) {
                    result = mergeUserData(userDir, newDir);
                } else {
                    result = moveUserData(userDir, newDir);
                }
                result.setUserId(userId);
                results.add(result);
            } catch (Exception e) {
                log.error("迁移用户数据失败: {}", userId, e);
                MigrationResult result = MigrationResult.failed(e.getMessage());
                result.setUserId(userId);
                results.add(result);
            }
        }

        log.info("✅ 批量迁移完成，成功: {}, 失败: {}",
                results.stream().filter(MigrationResult::isSuccess).count(),
                results.stream().filter(r -> !r.isSuccess()).count());

        return results;
    }

    /**
     * 迁移结果数据类
     */
    public static class MigrationResult {
        private String userId;
        private boolean success;
        private String message;
        private MigrationType type;

        public enum MigrationType {
            NOT_NEEDED,  // 不需要迁移
            SUCCESS,     // 迁移成功
            FAILED       // 迁移失败
        }

        public static MigrationResult notNeeded(String message) {
            MigrationResult result = new MigrationResult();
            result.success = true;
            result.message = message;
            result.type = MigrationType.NOT_NEEDED;
            return result;
        }

        public static MigrationResult success(String message) {
            MigrationResult result = new MigrationResult();
            result.success = true;
            result.message = message;
            result.type = MigrationType.SUCCESS;
            return result;
        }

        public static MigrationResult failed(String message) {
            MigrationResult result = new MigrationResult();
            result.success = false;
            result.message = message;
            result.type = MigrationType.FAILED;
            return result;
        }

        // Getters and Setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public MigrationType getType() { return type; }

        @Override
        public String toString() {
            return String.format("[%s] %s: %s", type, userId != null ? userId : "N/A", message);
        }
    }
}


