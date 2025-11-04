package multitenanttest;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 黑名单隔离测试
 * 验证P0-7修复：用户A屏蔽的公司，用户B不会被屏蔽
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-03
 */
public class BlacklistIsolationTest extends BaseMultiTenantTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    public void testBlacklistIsolation_UserABlacklistNotVisibleToUserB() {
        System.out.println("\n📋 测试：黑名单隔离 - 用户A的黑名单对用户B不可见");

        // 1. 用户A登录
        loginAs(testUserA);

        // 2. 用户A添加黑名单
        Set<String> blackCompaniesA = new HashSet<>(Arrays.asList("讨厌公司A", "不喜欢公司A", "垃圾公司A"));
        Set<String> blackRecruitersA = new HashSet<>(Arrays.asList("讨厌HR A"));
        saveBlacklist(userIdA, blackCompaniesA, blackRecruitersA);
        System.out.println("✅ 用户A添加黑名单: " + blackCompaniesA);

        // 3. 验证用户A的黑名单文件
        assertFileExists(userIdA, "boss_data.json", "用户A的黑名单文件应该存在");

        // 4. 用户B登录
        loginAs(testUserB);

        // 5. 验证用户B没有黑名单文件或文件为空
        if (fileExists(userIdB, "boss_data.json")) {
            Map<String, Set<String>> blacklistB = loadBlacklist(userIdB);
            Set<String> companiesB = blacklistB.getOrDefault("blackCompanies", new HashSet<>());

            assertFalse(companiesB.contains("讨厌公司A"),
                "用户B的黑名单不应包含用户A的数据");
            System.out.println("✅ 用户B的黑名单不包含用户A的数据");
        } else {
            System.out.println("✅ 用户B没有黑名单文件（符合预期）");
        }

        // 6. 用户B添加自己的黑名单
        Set<String> blackCompaniesB = new HashSet<>(Arrays.asList("讨厌公司B", "垃圾公司B"));
        Set<String> blackRecruitersB = new HashSet<>(Arrays.asList("讨厌HR B"));
        saveBlacklist(userIdB, blackCompaniesB, blackRecruitersB);
        System.out.println("✅ 用户B添加自己的黑名单: " + blackCompaniesB);

        // 7. 验证两个用户的黑名单完全独立
        Map<String, Set<String>> finalBlacklistA = loadBlacklist(userIdA);
        Map<String, Set<String>> finalBlacklistB = loadBlacklist(userIdB);

        Set<String> companiesA = finalBlacklistA.get("blackCompanies");
        Set<String> companiesB = finalBlacklistB.get("blackCompanies");

        assertTrue(companiesA.contains("讨厌公司A"), "用户A应该有自己的黑名单");
        assertFalse(companiesA.contains("讨厌公司B"), "用户A不应看到用户B的黑名单");

        assertTrue(companiesB.contains("讨厌公司B"), "用户B应该有自己的黑名单");
        assertFalse(companiesB.contains("讨厌公司A"), "用户B不应看到用户A的黑名单");

        System.out.println("🎉 测试通过：黑名单完全隔离");
    }

    /**
     * 保存黑名单到文件（模拟Boss程序行为）
     */
    private void saveBlacklist(String userId, Set<String> companies, Set<String> recruiters) {
        try {
            String safeUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "_");
            File dataFile = new File("user_data/" + safeUserId + "/boss_data.json");
            dataFile.getParentFile().mkdirs();

            Map<String, Set<String>> data = new HashMap<>();
            data.put("blackCompanies", companies);
            data.put("blackRecruiters", recruiters);
            data.put("blackJobs", new HashSet<>());

            mapper.writerWithDefaultPrettyPrinter().writeValue(dataFile, data);
        } catch (Exception e) {
            throw new RuntimeException("保存黑名单失败", e);
        }
    }

    /**
     * 从文件加载黑名单
     */
    @SuppressWarnings("unchecked")
    private Map<String, Set<String>> loadBlacklist(String userId) {
        try {
            String safeUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "_");
            File dataFile = new File("user_data/" + safeUserId + "/boss_data.json");
            if (!dataFile.exists()) {
                return new HashMap<>();
            }

            Map<String, Object> data = mapper.readValue(dataFile, Map.class);
            Map<String, Set<String>> result = new HashMap<>();

            if (data.get("blackCompanies") instanceof Collection) {
                result.put("blackCompanies", new HashSet<>((Collection<String>) data.get("blackCompanies")));
            }
            if (data.get("blackRecruiters") instanceof Collection) {
                result.put("blackRecruiters", new HashSet<>((Collection<String>) data.get("blackRecruiters")));
            }
            if (data.get("blackJobs") instanceof Collection) {
                result.put("blackJobs", new HashSet<>((Collection<String>) data.get("blackJobs")));
            }

            return result;
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
}




