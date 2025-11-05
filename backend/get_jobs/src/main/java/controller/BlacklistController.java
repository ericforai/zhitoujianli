package controller;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;

import dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import util.UserContextUtil;

/**
 * 黑名单管理控制器
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-04
 */
@RestController
@RequestMapping("/api/blacklist")
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://115.190.182.95:3000", "http://115.190.182.95",
                        "https://zhitoujianli.com", "https://www.zhitoujianli.com"})
public class BlacklistController {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 获取用户config.json配置路径
     */
    private String getConfigPath() {
        String userId = UserContextUtil.getCurrentUserId();
        if (userId == null || userId.isEmpty()) {
            userId = "default_user";
        }

        // 兼容旧的字段名
        String sanitizedUserId = userId.replace("@", "_").replace(".", "_");
        return "user_data/" + sanitizedUserId + "/config.json";
    }

    /**
     * 加载完整配置
     */
    private Map<String, Object> loadFullConfig() throws Exception {
        String configPath = getConfigPath();
        File configFile = new File(configPath);

        if (!configFile.exists()) {
            // 返回默认配置
            Map<String, Object> defaultConfig = new LinkedHashMap<>();
            defaultConfig.put("blacklistConfig", new LinkedHashMap<>());
            return defaultConfig;
        }

        String content = new String(Files.readAllBytes(Paths.get(configPath)), StandardCharsets.UTF_8);
        return objectMapper.readValue(content, Map.class);
    }

    /**
     * 保存完整配置（合并模式）
     */
    private void saveFullConfig(Map<String, Object> config) throws Exception {
        String configPath = getConfigPath();
        File configFile = new File(configPath);
        configFile.getParentFile().mkdirs();

        // 添加更新时间戳
        config.put("lastModified", System.currentTimeMillis());
        config.put("updatedAt", System.currentTimeMillis());

        String json = objectMapper.writerWithDefaultPrettyPrinter()
            .writeValueAsString(config);
        Files.write(Paths.get(configPath), json.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 获取黑名单配置
     * ✅ 修复：从config.json的blacklistConfig字段读取
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBlacklist() {
        try {
            // 从config.json读取完整配置
            Map<String, Object> fullConfig = loadFullConfig();

            @SuppressWarnings("unchecked")
            Map<String, Object> blacklistConfig = (Map<String, Object>) fullConfig.getOrDefault("blacklistConfig", new LinkedHashMap<>());

            // 读取黑名单数据（使用前端字段名）
            @SuppressWarnings("unchecked")
            List<String> companyBlacklist = (List<String>) blacklistConfig.getOrDefault("companyBlacklist", new ArrayList<>());
            @SuppressWarnings("unchecked")
            List<String> positionBlacklist = (List<String>) blacklistConfig.getOrDefault("positionBlacklist", new ArrayList<>());
            Boolean enableFilter = (Boolean) blacklistConfig.getOrDefault("enableBlacklistFilter", true);

            // 返回前端期望的格式
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("companyBlacklist", companyBlacklist);
            response.put("positionBlacklist", positionBlacklist);
            response.put("enableBlacklistFilter", enableFilter);

            log.info("✅ 从config.json获取黑名单配置: 公司={}, 职位={}",
                companyBlacklist.size(), positionBlacklist.size());
            return ResponseEntity.ok(ApiResponse.success(response, "获取黑名单配置成功"));
        } catch (Exception e) {
            log.error("获取黑名单配置失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("获取黑名单配置失败: " + e.getMessage()));
        }
    }

    /**
     * 更新黑名单配置
     * ✅ 修复：同时保存到config.json和blacklist.json（Boss主数据源）
     */
    @PutMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateBlacklist(
            @RequestBody Map<String, Object> request) {
        try {
            // 1️⃣ 加载完整配置（保留其他字段）
            Map<String, Object> fullConfig = loadFullConfig();

            // 2️⃣ 从前端获取黑名单数据
            @SuppressWarnings("unchecked")
            List<String> companyBlacklist = (List<String>) request.getOrDefault("companyBlacklist", new ArrayList<>());
            @SuppressWarnings("unchecked")
            List<String> positionBlacklist = (List<String>) request.getOrDefault("positionBlacklist", new ArrayList<>());
            Boolean enableFilter = (Boolean) request.getOrDefault("enableBlacklistFilter", true);

            // 3️⃣ 构建新的blacklistConfig（使用前端字段名）
            Map<String, Object> blacklistConfig = new LinkedHashMap<>();
            blacklistConfig.put("companyBlacklist", companyBlacklist);
            blacklistConfig.put("positionBlacklist", positionBlacklist);
            blacklistConfig.put("enableBlacklistFilter", enableFilter);

            // 4️⃣ 更新config.json的blacklistConfig字段（合并模式）
            fullConfig.put("blacklistConfig", blacklistConfig);

            // 5️⃣ 保存完整配置
            saveFullConfig(fullConfig);

            // 6️⃣ ✅ 同步保存到blacklist.json（Boss主数据源）
            saveToBlacklistJson(companyBlacklist, positionBlacklist);

            log.info("✅ 黑名单配置已更新: config.json + blacklist.json");
            log.info("   公司={}, 职位={}",
                companyBlacklist.size(), positionBlacklist.size());

            // 返回前端格式
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("companyBlacklist", companyBlacklist);
            response.put("positionBlacklist", positionBlacklist);
            response.put("enableBlacklistFilter", enableFilter);

            return ResponseEntity.ok(ApiResponse.success(response, "黑名单配置更新成功"));
        } catch (Exception e) {
            log.error("更新黑名单配置失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("更新黑名单配置失败: " + e.getMessage()));
        }
    }

    /**
     * 保存黑名单到blacklist.json（Boss主数据源）
     */
    private void saveToBlacklistJson(List<String> companyBlacklist,
                                      List<String> positionBlacklist) throws Exception {
        String userId = UserContextUtil.getCurrentUserId();
        if (userId == null || userId.isEmpty()) {
            userId = "default_user";
        }
        String sanitizedUserId = userId.replace("@", "_").replace(".", "_");
        String blacklistPath = "user_data/" + sanitizedUserId + "/blacklist.json";

        // 构建blacklist.json格式（Boss程序字段名）
        Map<String, List<String>> blacklistData = new LinkedHashMap<>();
        blacklistData.put("blackCompanies", companyBlacklist);
        blacklistData.put("blackJobs", positionBlacklist);  // 映射到blackJobs

        // 保存文件
        File blacklistFile = new File(blacklistPath);
        blacklistFile.getParentFile().mkdirs();

        String json = objectMapper.writerWithDefaultPrettyPrinter()
            .writeValueAsString(blacklistData);
        Files.write(Paths.get(blacklistPath), json.getBytes(StandardCharsets.UTF_8));

        log.info("✅ 已同步到blacklist.json: {}", blacklistPath);
    }

    /**
     * 添加黑名单项
     * ✅ 修复：更新config.json的blacklistConfig字段
     */
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Void>> addBlacklistItem(
            @RequestBody Map<String, String> request) {
        try {
            String type = request.get("type"); // company, position, recruiter
            String value = request.get("value");

            if (type == null || value == null || value.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("类型和值不能为空"));
            }

            // 加载完整配置
            Map<String, Object> fullConfig = loadFullConfig();

            @SuppressWarnings("unchecked")
            Map<String, Object> blacklistConfig = (Map<String, Object>) fullConfig.getOrDefault("blacklistConfig", new LinkedHashMap<>());

            // 根据类型添加到相应的列表（使用前端字段名）
            String listKey = type.equals("company") ? "companyBlacklist" : "positionBlacklist";

            @SuppressWarnings("unchecked")
            List<String> list = (List<String>) blacklistConfig.getOrDefault(listKey, new ArrayList<>());
            if (!list.contains(value.trim())) {
                list.add(value.trim());
                blacklistConfig.put(listKey, list);
            }

            // 更新完整配置
            fullConfig.put("blacklistConfig", blacklistConfig);
            saveFullConfig(fullConfig);

            log.info("✅ 添加黑名单项到config.json: type={}, value={}", type, value);
            return ResponseEntity.ok(ApiResponse.success("添加成功"));
        } catch (Exception e) {
            log.error("添加黑名单项失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("添加失败: " + e.getMessage()));
        }
    }

    /**
     * 删除黑名单项
     * ✅ 修复：从config.json的blacklistConfig字段删除
     */
    @DeleteMapping("/remove")
    public ResponseEntity<ApiResponse<Void>> removeBlacklistItem(
            @RequestParam String type,
            @RequestParam String value) {
        try {
            // 加载完整配置
            Map<String, Object> fullConfig = loadFullConfig();

            @SuppressWarnings("unchecked")
            Map<String, Object> blacklistConfig = (Map<String, Object>) fullConfig.getOrDefault("blacklistConfig", new LinkedHashMap<>());

            // 根据类型删除（使用前端字段名）
            String listKey = type.equals("company") ? "companyBlacklist" : "positionBlacklist";

            @SuppressWarnings("unchecked")
            List<String> list = (List<String>) blacklistConfig.getOrDefault(listKey, new ArrayList<>());
            list.remove(value);
            blacklistConfig.put(listKey, list);

            // 更新完整配置
            fullConfig.put("blacklistConfig", blacklistConfig);
            saveFullConfig(fullConfig);

            log.info("✅ 从config.json删除黑名单项: type={}, value={}", type, value);
            return ResponseEntity.ok(ApiResponse.success("删除成功"));
        } catch (Exception e) {
            log.error("删除黑名单项失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("删除失败: " + e.getMessage()));
        }
    }
}

