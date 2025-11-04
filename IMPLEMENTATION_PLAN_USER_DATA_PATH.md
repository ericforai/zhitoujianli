# 统一用户数据路径 - 详细实施计划

## 📋 计划概述

**目标**: 统一所有用户数据路径生成逻辑，确保配置、简历、打招呼语等数据保存在同一目录下。

**策略**:
- ✅ 创建统一的 `UserDataPathUtil` 工具类
- ✅ 逐步重构现有代码
- ✅ 保留向后兼容性（优雅降级）
- ✅ 数据迁移脚本自动合并
- ✅ 全面测试验证

**风险控制**:
- 🔒 不删除旧代码，仅添加新逻辑
- 🔒 保留旧数据路径的兼容性
- 🔒 提供完整回滚方案

---

## 🚀 实施步骤

### Phase 1: 创建基础设施（无风险）

#### Step 1.1: 创建 UserDataPathUtil 工具类

**文件**: `backend/get_jobs/src/main/java/util/UserDataPathUtil.java`

```java
package util;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import lombok.extern.slf4j.Slf4j;

/**
 * 用户数据路径统一管理工具类
 *
 * 功能：
 * 1. 统一用户ID清理规则
 * 2. 集中管理所有用户数据文件路径
 * 3. 提供向后兼容的路径查找逻辑
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-04
 */
@Slf4j
public class UserDataPathUtil {

    private static final String USER_DATA_BASE = "user_data";

    /**
     * 获取清理后的用户ID（统一规则）
     *
     * 清理规则：
     * - 将 @ 替换为 _
     * - 将 . 替换为 _
     * - 只保留字母、数字、下划线、连字符
     *
     * 示例：luwenrong123@sina.com -> luwenrong123_sina_com
     */
    public static String getSafeUserId() {
        String userId = UserContextUtil.getCurrentUserId();
        return sanitizeUserId(userId);
    }

    /**
     * 清理用户ID中的特殊字符
     *
     * @param userId 原始用户ID
     * @return 清理后的安全用户ID
     */
    public static String sanitizeUserId(String userId) {
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("用户ID不能为空");
        }

        // 统一清理规则：只保留字母、数字、下划线、连字符
        String cleaned = userId.replaceAll("[^a-zA-Z0-9_-]", "_");

        // 防止路径遍历攻击
        if (cleaned.contains("..") || cleaned.startsWith("/") || cleaned.startsWith("\\")) {
            throw new SecurityException("非法的用户ID格式: " + userId);
        }

        log.debug("用户ID清理: {} -> {}", userId, cleaned);
        return cleaned;
    }

    /**
     * 获取用户数据目录路径（清理后的路径）
     *
     * @return 用户数据目录路径，例如：user_data/luwenrong123_sina_com
     */
    public static String getUserDataDir() {
        return USER_DATA_BASE + File.separator + getSafeUserId();
    }

    /**
     * 获取用户数据目录的 Path 对象
     */
    public static Path getUserDataDirPath() {
        return Paths.get(getUserDataDir());
    }

    /**
     * 获取配置文件路径
     *
     * @return 配置文件路径，例如：user_data/luwenrong123_sina_com/config.json
     */
    public static String getConfigPath() {
        return getUserDataDir() + File.separator + "config.json";
    }

    /**
     * 获取简历文件路径
     *
     * @return 简历文件路径，例如：user_data/luwenrong123_sina_com/candidate_resume.json
     */
    public static String getResumePath() {
        return getUserDataDir() + File.separator + "candidate_resume.json";
    }

    /**
     * 获取默认打招呼语文件路径
     *
     * @return 默认打招呼语文件路径
     */
    public static String getDefaultGreetingPath() {
        return getUserDataDir() + File.separator + "default_greeting.json";
    }

    /**
     * 获取AI配置文件路径
     */
    public static String getAiConfigPath() {
        return getUserDataDir() + File.separator + "ai_config.json";
    }

    /**
     * 获取Boss Cookie文件路径
     */
    public static String getBossCookiePath() {
        return getUserDataDir() + File.separator + "boss_cookie.json";
    }

    /**
     * 确保用户数据目录存在
     *
     * @return 如果目录创建成功或已存在返回 true，否则返回 false
     */
    public static boolean ensureUserDataDirExists() {
        try {
            Path userDataPath = getUserDataDirPath();
            if (!Files.exists(userDataPath)) {
                Files.createDirectories(userDataPath);
                log.info("📁 创建用户数据目录: {}", userDataPath.toAbsolutePath());
                return true;
            }
            return true;
        } catch (Exception e) {
            log.error("❌ 创建用户数据目录失败", e);
            return false;
        }
    }

    // ========== 向后兼容方法 ==========

    /**
     * 尝试查找文件（支持新旧两种路径格式）
     *
     * 查找顺序：
     * 1. 新格式路径（清理后的ID）：user_data/luwenrong123_sina_com/config.json
     * 2. 旧格式路径（原始邮箱）：user_data/luwenrong123@sina.com/config.json
     *
     * @param filename 文件名，例如：config.json, candidate_resume.json
     * @return 找到的文件，如果都不存在返回 null
     */
    public static File findFile(String filename) {
        String userId = UserContextUtil.getCurrentUserId();
        String safeUserId = sanitizeUserId(userId);

        // 优先查找新格式路径
        File newFormatFile = new File(USER_DATA_BASE + File.separator + safeUserId + File.separator + filename);
        if (newFormatFile.exists()) {
            log.debug("✅ 找到文件（新格式）: {}", newFormatFile.getAbsolutePath());
            return newFormatFile;
        }

        // 如果新旧格式不同，尝试查找旧格式路径
        if (!userId.equals(safeUserId)) {
            File oldFormatFile = new File(USER_DATA_BASE + File.separator + userId + File.separator + filename);
            if (oldFormatFile.exists()) {
                log.warn("⚠️ 找到文件（旧格式）: {} - 建议迁移到新格式", oldFormatFile.getAbsolutePath());
                return oldFormatFile;
            }
        }

        log.debug("❌ 文件不存在: {}", filename);
        return null;
    }

    /**
     * 获取配置文件（兼容新旧格式）
     */
    public static File getConfigFile() {
        File file = findFile("config.json");
        if (file == null) {
            // 如果不存在，返回新格式路径的File对象（用于创建）
            return new File(getConfigPath());
        }
        return file;
    }

    /**
     * 获取简历文件（兼容新旧格式）
     */
    public static File getResumeFile() {
        File file = findFile("candidate_resume.json");
        if (file == null) {
            return new File(getResumePath());
        }
        return file;
    }

    /**
     * 获取默认打招呼语文件（兼容新旧格式）
     */
    public static File getDefaultGreetingFile() {
        File file = findFile("default_greeting.json");
        if (file == null) {
            return new File(getDefaultGreetingPath());
        }
        return file;
    }

    /**
     * 检查用户是否有旧格式的数据目录需要迁移
     *
     * @return 如果存在旧格式目录且与新格式不同，返回 true
     */
    public static boolean hasLegacyDataToMigrate() {
        String userId = UserContextUtil.getCurrentUserId();
        String safeUserId = sanitizeUserId(userId);

        // 如果格式相同，无需迁移
        if (userId.equals(safeUserId)) {
            return false;
        }

        // 检查旧格式目录是否存在
        File oldDir = new File(USER_DATA_BASE + File.separator + userId);
        File newDir = new File(USER_DATA_BASE + File.separator + safeUserId);

        return oldDir.exists() && oldDir.isDirectory() && !newDir.exists();
    }
}
```

**测试**: 创建单元测试（后续步骤）

---

### Phase 2: 重构核心服务（渐进式）

#### Step 2.1: 重构 CandidateResumeService

**修改文件**: `backend/get_jobs/src/main/java/ai/CandidateResumeService.java`

**策略**: 使用新工具类，保留向后兼容逻辑

```java
// 原来的方法（第37-39行）
private static String getUserResumePath(String userId) {
    return USER_RESUME_BASE_PATH + "/" + userId + "/candidate_resume.json";
}

// 修改为：
private static String getUserResumePath(String userId) {
    // ✅ 使用新的统一工具类
    return UserDataPathUtil.getResumePath();
}

// 原来的方法（第44-52行）
private static String getCurrentUserResumePath() {
    String userId = UserContextUtil.getCurrentUserId();
    if (userId == null || userId.isEmpty()) {
        throw new RuntimeException("用户未登录，无法访问简历数据。请先登录系统。");
    }
    return getUserResumePath(userId);
}

// 修改为：
private static String getCurrentUserResumePath() {
    String userId = UserContextUtil.getCurrentUserId();
    if (userId == null || userId.isEmpty()) {
        throw new RuntimeException("用户未登录，无法访问简历数据。请先登录系统。");
    }
    // ✅ 使用新的统一工具类
    return UserDataPathUtil.getResumePath();
}

// 修改 saveCandidateInfo 方法（第124-150行）
private static void saveCandidateInfo(Map<String, Object> candidate) {
    try {
        // ✅ 使用新工具类获取路径
        String userResumePath = UserDataPathUtil.getResumePath();
        log.info("【简历解析】保存简历到用户路径: {}", userResumePath);

        // ✅ 确保目录存在（使用工具类方法）
        UserDataPathUtil.ensureUserDataDirExists();

        File file = new File(userResumePath);

        // 转换为格式化的JSON
        ObjectMapper mapper = new ObjectMapper();
        String jsonString = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(candidate);

        // 写入文件
        try (FileWriter writer = new FileWriter(file, StandardCharsets.UTF_8)) {
            writer.write(jsonString);
        }

        log.info("【简历解析】候选人信息已保存到: {}", userResumePath);

    } catch (Exception e) {
        log.error("【简历解析】保存候选人信息失败", e);
        throw new RuntimeException("保存失败: " + e.getMessage(), e);
    }
}

// 修改 loadCandidateInfo 方法（第155-178行）
public static Map<String, Object> loadCandidateInfo() {
    try {
        // ✅ 使用兼容方法查找文件（支持新旧格式）
        File resumeFile = UserDataPathUtil.getResumeFile();

        if (!resumeFile.exists()) {
            log.warn("【简历解析】用户简历文件不存在: {}", resumeFile.getAbsolutePath());
            return null;
        }

        log.info("【简历解析】加载用户简历: {}", resumeFile.getAbsolutePath());

        String jsonString = Files.readString(resumeFile.toPath());
        ObjectMapper mapper = new ObjectMapper();
        @SuppressWarnings("unchecked")
        Map<String, Object> candidate = mapper.readValue(jsonString, Map.class);

        log.info("【简历解析】已加载候选人信息");
        return candidate;

    } catch (Exception e) {
        log.error("【简历解析】加载候选人信息失败", e);
        return null;
    }
}

// 修改 saveDefaultGreeting 方法（第183-203行）
public static void saveDefaultGreeting(String greeting) throws Exception {
    // ✅ 使用新工具类
    UserDataPathUtil.ensureUserDataDirExists();

    File greetingFile = new File(UserDataPathUtil.getDefaultGreetingPath());
    Map<String, Object> greetingData = new HashMap<>();
    greetingData.put("greeting", greeting);
    greetingData.put("updated_at", System.currentTimeMillis());

    ObjectMapper mapper = new ObjectMapper();
    mapper.writerWithDefaultPrettyPrinter().writeValue(greetingFile, greetingData);

    log.info("✅ 默认打招呼语已保存到用户目录: {}", greetingFile.getAbsolutePath());
}

// 修改 loadDefaultGreeting 方法（第208-222行）
public static String loadDefaultGreeting() throws Exception {
    // ✅ 使用兼容方法查找文件
    File greetingFile = UserDataPathUtil.getDefaultGreetingFile();

    if (!greetingFile.exists()) {
        String userId = UserContextUtil.getCurrentUserId();
        log.warn("⚠️ 用户未设置默认打招呼语: {}", userId);
        return null;
    }

    ObjectMapper mapper = new ObjectMapper();
    @SuppressWarnings("unchecked")
    Map<String, Object> greetingData = mapper.readValue(greetingFile, Map.class);

    return (String) greetingData.get("greeting");
}

// 修改 getDefaultGreeting 方法（第227-240行）
public static String getDefaultGreeting(String userId) throws Exception {
    // ✅ 使用兼容方法查找文件
    File greetingFile = UserDataPathUtil.getDefaultGreetingFile();

    if (!greetingFile.exists()) {
        log.warn("⚠️ 用户未设置默认打招呼语: {}", userId);
        return null;
    }

    ObjectMapper mapper = new ObjectMapper();
    @SuppressWarnings("unchecked")
    Map<String, Object> greetingData = mapper.readValue(greetingFile, Map.class);

    return (String) greetingData.get("greeting");
}

// 修改 hasCandidateResume 方法（第245-254行）
public static boolean hasCandidateResume() {
    try {
        // ✅ 使用兼容方法查找文件
        File resumeFile = UserDataPathUtil.getResumeFile();
        return resumeFile.exists() && resumeFile.length() > 0;
    } catch (Exception e) {
        log.warn("【简历解析】检查简历存在性失败: {}", e.getMessage());
        return false;
    }
}

// 修改 deleteCandidateResume 方法（第259-270行）
public static void deleteCandidateResume() {
    try {
        // ✅ 使用兼容方法查找文件（删除时也要兼容旧格式）
        File resumeFile = UserDataPathUtil.getResumeFile();

        if (resumeFile.exists()) {
            if (!resumeFile.delete()) {
                log.warn("删除文件失败: {}", resumeFile.getPath());
            }
            log.info("【简历解析】已删除用户简历: {}", resumeFile.getAbsolutePath());
        }
    } catch (Exception e) {
        log.error("【简历解析】删除用户简历失败: {}", e.getMessage());
    }
}
```

---

#### Step 2.2: 重构 WebController.saveUserConfig

**修改文件**: `backend/get_jobs/src/main/java/controller/WebController.java`

**修改位置**: 第 674-726 行

```java
/**
 * 保存用户配置 - RESTful API
 */
@PostMapping("/api/config")
@ResponseBody
public ResponseEntity<Map<String, Object>> saveUserConfig(@RequestBody Map<String, Object> config) {
    try {
        // ✅ 使用新的统一工具类
        String userId = UserContextUtil.getCurrentUserId();
        String safeUserId = UserDataPathUtil.getSafeUserId();
        String configPath = UserDataPathUtil.getConfigPath();

        // 获取用户信息
        String userEmail = UserContextUtil.getCurrentUserEmail();
        String username = UserContextUtil.getCurrentUsername();

        config.put("userId", safeUserId);  // ✅ 保存清理后的ID
        config.put("userEmail", userEmail);
        config.put("username", username);
        config.put("lastModified", System.currentTimeMillis());

        // ✅ 确保用户目录存在
        UserDataPathUtil.ensureUserDataDirExists();

        // 保存配置
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        mapper.writerWithDefaultPrettyPrinter().writeValue(new java.io.File(configPath), config);

        log.info("✅ 用户配置保存成功: userId={}, email={}, path={}", safeUserId, userEmail, configPath);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "用户配置保存成功");
        response.put("userId", safeUserId);
        return ResponseEntity.ok(response);

    } catch (SecurityException e) {
        log.error("用户ID安全验证失败", e);
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "安全验证失败: " + e.getMessage());
        return ResponseEntity.status(400).body(response);
    } catch (Exception e) {
        log.error("保存用户配置失败", e);
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "保存失败: " + e.getMessage());
        return ResponseEntity.status(500).body(response);
    }
}
```

---

#### Step 2.3: 重构 WebController.getUserConfig

**修改位置**: 第 629-668 行

```java
/**
 * 获取用户配置 - RESTful API
 */
@GetMapping("/api/config")
@ResponseBody
public ResponseEntity<Map<String, Object>> getUserConfig() {
    try {
        // ✅ 使用兼容方法查找配置文件（支持新旧格式）
        File configFile = UserDataPathUtil.getConfigFile();

        Map<String, Object> response = new HashMap<>();

        if (!configFile.exists()) {
            log.info("用户配置文件不存在，返回空配置");
            response.put("success", true);
            response.put("data", new HashMap<>());
            response.put("message", "配置文件不存在");
            return ResponseEntity.ok(response);
        }

        // 读取配置
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        @SuppressWarnings("unchecked")
        Map<String, Object> config = mapper.readValue(configFile, Map.class);

        String userId = UserDataPathUtil.getSafeUserId();
        log.info("✅ 加载用户配置成功: userId={}, path={}", userId, configFile.getAbsolutePath());

        response.put("success", true);
        response.put("data", config);
        response.put("message", "获取配置成功");
        return ResponseEntity.ok(response);

    } catch (Exception e) {
        log.error("获取用户配置失败", e);
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "获取配置失败: " + e.getMessage());
        return ResponseEntity.status(500).body(response);
    }
}
```

---

### Phase 3: 数据迁移（自动化）

#### Step 3.1: 创建数据迁移工具类

**文件**: `backend/get_jobs/src/main/java/util/UserDataMigrationUtil.java`

```java
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
 * 功能：将旧格式的用户数据目录迁移到新格式
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-04
 */
@Slf4j
public class UserDataMigrationUtil {

    private static final String USER_DATA_BASE = "user_data";

    /**
     * 迁移单个用户的数据
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
            if (!oldDir.exists()) {
                return MigrationResult.notNeeded("旧格式目录不存在");
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
                log.info("✅ 用户数据迁移成功（重命名）");
                return MigrationResult.success("数据目录已重命名");
            } else {
                // 重命名失败，尝试复制
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
            newDir.mkdirs();
        }

        // 复制所有文件
        File[] files = oldDir.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isFile()) {
                    Path source = file.toPath();
                    Path target = Paths.get(newDir.getAbsolutePath(), file.getName());
                    Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING);
                    log.info("  ✅ 复制文件: {}", file.getName());
                }
            }
        }

        log.info("✅ 用户数据迁移成功（复制）");
        return MigrationResult.success("数据已复制到新目录");
    }

    /**
     * 合并用户数据（新旧目录都存在时）
     */
    private static MigrationResult mergeUserData(File oldDir, File newDir) throws IOException {
        log.info("🔄 合并用户数据: {} -> {}", oldDir.getName(), newDir.getName());

        List<String> mergedFiles = new ArrayList<>();
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
                        log.info("  ⏭️  跳过已存在的文件: {}", oldFile.getName());
                    }
                }
            }
        }

        String message = String.format("合并完成，复制了 %d 个文件", mergedFiles.size());
        log.info("✅ {}", message);
        return MigrationResult.success(message);
    }

    /**
     * 批量迁移所有用户数据（管理员工具）
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

        for (File userDir : userDirs) {
            String userId = userDir.getName();
            String safeUserId = UserDataPathUtil.sanitizeUserId(userId);

            // 如果格式已是最新，跳过
            if (userId.equals(safeUserId)) {
                continue;
            }

            File newDir = new File(USER_DATA_BASE + File.separator + safeUserId);

            try {
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
            return String.format("[%s] %s: %s", type, userId, message);
        }
    }
}
```

---

#### Step 3.2: 在用户登录时自动触发迁移

**修改文件**: `backend/get_jobs/src/main/java/config/JwtAuthenticationFilter.java`

在用户认证成功后添加迁移逻辑：

```java
// 在认证成功后添加（大约在设置SecurityContext之后）

// ✅ 自动迁移用户数据（如果需要）
try {
    if (UserDataPathUtil.hasLegacyDataToMigrate()) {
        log.info("🔄 检测到旧格式用户数据，开始自动迁移");
        UserDataMigrationUtil.MigrationResult result = UserDataMigrationUtil.migrateCurrentUserData();
        log.info("✅ 用户数据迁移结果: {}", result);
    }
} catch (Exception e) {
    log.warn("⚠️ 用户数据迁移失败（不影响正常使用）: {}", e.getMessage());
}
```

---

### Phase 4: 测试与验证

#### Step 4.1: 创建测试脚本

**文件**: `backend/get_jobs/src/test/java/util/UserDataPathUtilTest.java`

```java
package util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UserDataPathUtilTest {

    @Test
    void testSanitizeUserId() {
        // 测试邮箱格式
        assertEquals("luwenrong123_sina_com",
            UserDataPathUtil.sanitizeUserId("luwenrong123@sina.com"));

        // 测试已清理的格式
        assertEquals("luwenrong123_sina_com",
            UserDataPathUtil.sanitizeUserId("luwenrong123_sina_com"));

        // 测试特殊字符
        assertEquals("test_user_123",
            UserDataPathUtil.sanitizeUserId("test@user.123"));
    }

    @Test
    void testGetUserDataDir() {
        // Mock UserContextUtil.getCurrentUserId()
        // 需要配置测试环境
    }

    @Test
    void testPathGeneration() {
        // 测试路径生成
        String configPath = UserDataPathUtil.getConfigPath();
        assertTrue(configPath.contains("user_data"));
        assertTrue(configPath.endsWith("config.json"));
    }
}
```

---

#### Step 4.2: 手动测试清单

**测试清单** (`TESTING_CHECKLIST.md`):

```markdown
# 用户数据路径统一 - 测试清单

## 前置条件
- [ ] 代码已部署到测试环境
- [ ] 备份已完成

## 测试场景

### 场景1: 新用户注册
- [ ] 新用户注册成功
- [ ] 上传简历
- [ ] 检查简历保存在新格式路径: `user_data/用户名_清理后/candidate_resume.json`
- [ ] 设置配置
- [ ] 检查配置保存在新格式路径: `user_data/用户名_清理后/config.json`
- [ ] 保存默认打招呼语
- [ ] 检查打招呼语保存在同一目录
- [ ] 验证：所有文件都在同一目录下 ✅

### 场景2: 老用户登录（有旧数据）
- [ ] 老用户登录
- [ ] 检查日志，确认自动迁移触发
- [ ] 验证旧目录 `user_data/old@format.com/` 的数据已迁移
- [ ] 验证新目录 `user_data/old_format_com/` 包含所有文件
- [ ] 上传新简历，验证保存到新目录
- [ ] 更新配置，验证保存到新目录
- [ ] 启动Boss任务，验证能正常运行

### 场景3: 数据合并（新旧目录都存在）
- [ ] 创建测试场景（手动创建新旧两个目录）
- [ ] 用户登录
- [ ] 验证数据合并逻辑正确执行
- [ ] 验证不覆盖新目录中已有的文件
- [ ] 验证旧目录中的新文件被复制

### 场景4: Boss程序兼容性
- [ ] 启动Boss任务
- [ ] 验证能正确读取配置
- [ ] 验证能正确读取简历
- [ ] 验证能正确生成打招呼语
- [ ] 验证投递任务正常执行

## 性能测试
- [ ] 登录性能（迁移逻辑不影响登录速度）
- [ ] 文件读取性能（兼容逻辑不影响读取速度）

## 回滚测试
- [ ] 准备回滚脚本
- [ ] 测试回滚流程
- [ ] 验证回滚后系统正常工作
```

---

### Phase 5: 部署与监控

#### Step 5.1: 分阶段部署计划

```markdown
# 部署计划

## 阶段1: 代码部署（只读，不迁移）
1. 部署新代码（包含兼容逻辑）
2. 观察日志，确认兼容逻辑正常工作
3. 验证新老用户都能正常使用
4. **不触发自动迁移**

## 阶段2: 灰度迁移（部分用户）
1. 选择1-2个测试用户
2. 手动触发迁移
3. 观察迁移结果
4. 验证迁移后功能正常

## 阶段3: 全量部署（自动迁移）
1. 启用自动迁移逻辑
2. 监控所有用户登录
3. 收集迁移日志
4. 处理失败case

## 阶段4: 清理旧数据（可选）
1. 验证所有用户数据已迁移
2. 备份旧目录
3. 删除旧目录
```

---

#### Step 5.2: 监控脚本

**文件**: `scripts/monitor_migration.sh`

```bash
#!/bin/bash
# 监控用户数据迁移状态

echo "=== 用户数据迁移监控 ==="
echo ""

cd /root/zhitoujianli/backend/get_jobs/user_data

# 统计旧格式目录（包含@或.的目录）
echo "📊 旧格式目录统计："
find . -maxdepth 1 -type d -name "*@*" -o -name "*.*" | wc -l

echo ""
echo "📊 旧格式目录列表："
find . -maxdepth 1 -type d \( -name "*@*" -o -name "*.*" \) | head -10

echo ""
echo "📊 新格式目录统计："
find . -maxdepth 1 -type d ! -name "*@*" ! -name "*.*" | wc -l

echo ""
echo "=== 检查后端日志（迁移记录） ==="
journalctl -u zhitoujianli-backend.service --since "1 hour ago" | grep "迁移\|migration" | tail -20
```

---

#### Step 5.3: 回滚方案

**文件**: `scripts/rollback_migration.sh`

```bash
#!/bin/bash
# 回滚数据迁移（紧急情况使用）

echo "⚠️  警告：即将回滚用户数据迁移"
echo "此操作将恢复旧格式的用户目录"
read -p "确认继续？(yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "已取消"
    exit 0
fi

cd /root/zhitoujianli/backend/get_jobs/user_data

# 从备份恢复
if [ -d "../user_data_backup_before_migration" ]; then
    echo "🔄 从备份恢复..."
    cp -r ../user_data_backup_before_migration/* .
    echo "✅ 恢复完成"
else
    echo "❌ 备份不存在，无法回滚"
    exit 1
fi

# 重启后端服务
echo "🔄 重启后端服务..."
systemctl restart zhitoujianli-backend.service
echo "✅ 回滚完成"
```

---

## 📝 实施时间表

| 阶段 | 任务 | 预计时间 | 风险等级 |
|------|------|----------|----------|
| Phase 1 | 创建 UserDataPathUtil | 30分钟 | 低 |
| Phase 2 | 重构核心服务 | 1小时 | 中 |
| Phase 3 | 数据迁移工具 | 45分钟 | 中 |
| Phase 4 | 测试验证 | 1小时 | 低 |
| Phase 5 | 部署监控 | 30分钟 | 中 |
| **总计** | | **约4小时** | |

---

## 🔒 安全保障措施

1. **备份策略**
   - 部署前完整备份 `user_data` 目录
   - 迁移前为每个用户创建备份

2. **向后兼容**
   - 保留旧格式路径的读取逻辑
   - 新文件统一保存到新格式路径
   - 渐进式迁移，不影响现有功能

3. **失败处理**
   - 迁移失败不影响用户正常使用
   - 记录详细日志便于排查
   - 提供手动迁移工具

4. **回滚方案**
   - 准备完整回滚脚本
   - 保留旧数据不删除
   - 可快速恢复到迁移前状态

---

## ✅ 成功标准

- [ ] 所有新用户数据保存在统一格式路径
- [ ] 老用户数据成功迁移到新格式
- [ ] Boss程序正常运行，无兼容问题
- [ ] 无数据丢失
- [ ] 性能无明显下降
- [ ] 日志清晰可追踪

---

## 📞 应急联系

如果遇到问题：
1. 立即停止迁移
2. 检查日志：`journalctl -u zhitoujianli-backend.service -f`
3. 执行回滚：`./scripts/rollback_migration.sh`
4. 联系开发团队

---

**文档版本**: v1.0
**创建日期**: 2025-11-04
**负责人**: ZhiTouJianLi Team


