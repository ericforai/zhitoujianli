package boss.service;

import static boss.Locators.CHAT_LIST_ITEM;
import static boss.Locators.COMPANY_NAME_IN_CHAT;
import static boss.Locators.FINISHED_TEXT;
import static boss.Locators.LAST_MESSAGE;
import static boss.Locators.SCROLL_LOAD_MORE;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.microsoft.playwright.Locator;

import utils.PlaywrightUtil;

/**
 * Boss黑名单管理服务
 * 负责黑名单的加载、保存、检查和更新
 *
 * @author ZhiTouJianLi Team
 */
public class BossBlacklistService {
    private static final Logger log = LoggerFactory.getLogger(BossBlacklistService.class);

    private Set<String> blackCompanies;
    private Set<String> blackJobs;
    private final String userId;
    private final String dataPath;

    public BossBlacklistService(String userId, String dataPath) {
        this.userId = userId;
        this.dataPath = dataPath;
        this.blackCompanies = new HashSet<>();
        this.blackJobs = new HashSet<>();
    }

    /**
     * 加载黑名单数据
     * ⚠️ 优先从config.json的blacklistConfig读取，向后兼容blacklist.json
     */
    public void loadData() {
        try {
            // ✅ 优先从config.json读取黑名单（与前端统一）
            if (loadBlacklistFromConfig()) {
                log.info("✅ 已从config.json加载黑名单配置");
                return;
            }

            // 备用方案：从旧版blacklist.json读取（向后兼容）
            String json = new String(Files.readAllBytes(Paths.get(dataPath)), StandardCharsets.UTF_8);
            parseJson(json);
            log.info("✅ 已从blacklist.json加载黑名单（向后兼容）");
        } catch (IOException e) {
            log.warn("读取黑名单数据失败：{}，使用空黑名单", e.getMessage());
            // 初始化为空集合
            this.blackCompanies = new HashSet<>();
            this.blackJobs = new HashSet<>();
        }
    }

    /**
     * 从config.json的blacklistConfig读取黑名单（新方案）
     *
     * @return true=成功加载, false=未找到配置
     */
    private boolean loadBlacklistFromConfig() {
        try {
            String userId = System.getenv("BOSS_USER_ID");
            if (userId == null || userId.isEmpty()) {
                userId = this.userId;
            }
            if (userId == null || userId.isEmpty()) {
                return false;
            }

            // ✅ 使用环境变量USER_DATA_DIR，兼容本地开发和生产环境
            String userDataBaseDir = System.getenv("USER_DATA_DIR");
            if (userDataBaseDir == null || userDataBaseDir.isEmpty()) {
                userDataBaseDir = System.getProperty("user.dir") + "/user_data";
            }
            String configPath = userDataBaseDir + "/" + userId + "/config.json";
            File configFile = new File(configPath);
            log.info("🔍 尝试加载黑名单配置文件: {}", configFile.getAbsolutePath());
            if (!configFile.exists()) {
                log.warn("⚠️ 用户配置文件不存在: {}", configFile.getAbsolutePath());
                return false;
            }
            log.info("✅ 找到配置文件，大小: {} bytes", configFile.length());

            ObjectMapper mapper = new ObjectMapper();
            @SuppressWarnings("unchecked")
            Map<String, Object> userConfig = mapper.readValue(configFile, Map.class);
            log.info("📄 成功解析JSON，顶层字段数: {}", userConfig.keySet().size());

            @SuppressWarnings("unchecked")
            Map<String, Object> blacklistConfig = (Map<String, Object>) userConfig.get("blacklistConfig");
            if (blacklistConfig == null) {
                log.warn("⚠️ 配置中没有blacklistConfig字段，顶层字段：{}", userConfig.keySet());
                return false;
            }
            log.info("📋 blacklistConfig字段数: {}", blacklistConfig.keySet().size());

            // 检查是否启用黑名单过滤
            Boolean enabled = (Boolean) blacklistConfig.get("enableBlacklistFilter");
            log.info("📝 黑名单过滤开关: enableBlacklistFilter={}", enabled);
            if (enabled == null || !enabled) {
                log.info("⚠️ 黑名单过滤已禁用");
                this.blackCompanies = new HashSet<>();
                this.blackJobs = new HashSet<>();
                return true;
            }

            // 读取黑名单（字段名与前端统一）
            log.info("📝 读取公司黑名单: companyBlacklist={}", blacklistConfig.get("companyBlacklist"));
            log.info("📝 读取职位黑名单: positionBlacklist={}", blacklistConfig.get("positionBlacklist"));

            this.blackCompanies = new HashSet<>(getListFromConfig(blacklistConfig, "companyBlacklist"));
            this.blackJobs = new HashSet<>(getListFromConfig(blacklistConfig, "positionBlacklist"));

            log.info("📋 黑名单配置加载成功:");
            log.info("  - 公司黑名单: {} 个", blackCompanies.size());
            log.info("  - 职位黑名单: {} 个", blackJobs.size());

            return true;

        } catch (Exception e) {
            log.error("从config.json加载黑名单失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 从配置Map中安全获取List
     */
    @SuppressWarnings("unchecked")
    private List<String> getListFromConfig(Map<String, Object> config, String key) {
        Object value = config.get(key);
        if (value instanceof List) {
            return (List<String>) value;
        }
        return new ArrayList<>();
    }

    /**
     * 解析JSON黑名单
     *
     * @param json JSON字符串
     */
    private void parseJson(String json) {
        JSONObject jsonObject = new JSONObject(json);
        this.blackCompanies = jsonObject.getJSONArray("blackCompanies").toList().stream().map(Object::toString)
                .collect(Collectors.toSet());
        this.blackJobs = jsonObject.getJSONArray("blackJobs").toList().stream().map(Object::toString)
                .collect(Collectors.toSet());
    }

    /**
     * 检查公司是否在黑名单中（双向匹配优化版）
     * 支持：黑名单项包含公司名 或 公司名包含黑名单项
     *
     * @param companyName 公司名称
     * @return true=在黑名单中，false=不在黑名单中
     */
    public boolean isCompanyBlacklisted(String companyName) {
        if (companyName == null || companyName.trim().isEmpty() || blackCompanies == null || blackCompanies.isEmpty()) {
            return false;
        }

        String normalizedCompanyName = companyName.trim();

        // 双向匹配：检查黑名单项是否包含公司名，或公司名是否包含黑名单项
        for (String blackItem : blackCompanies) {
            if (blackItem == null || blackItem.trim().isEmpty()) {
                continue;
            }

            String normalizedBlackItem = blackItem.trim();

            // 双向包含匹配
            if (normalizedBlackItem.contains(normalizedCompanyName) ||
                normalizedCompanyName.contains(normalizedBlackItem)) {
                log.info("🚫 黑名单匹配：公司【{}】与黑名单项【{}】匹配", normalizedCompanyName, normalizedBlackItem);
                return true;
            }
        }

        return false;
    }

    /**
     * 检查职位是否在黑名单中
     *
     * @param jobName 职位名称
     * @return true=在黑名单中，false=不在黑名单中
     */
    public boolean isJobBlacklisted(String jobName) {
        if (jobName == null || jobName.trim().isEmpty() || blackJobs == null || blackJobs.isEmpty()) {
            return false;
        }

        String normalizedJobName = jobName.trim();
        return blackJobs.stream().anyMatch(normalizedJobName::contains);
    }

    /**
     * 保存黑名单数据
     */
    public void saveData() {
        try {
            updateListData();
            Map<String, Set<String>> data = new HashMap<>();
            data.put("blackCompanies", blackCompanies);
            data.put("blackJobs", blackJobs);
            String json = customJsonFormat(data);
            Files.write(Paths.get(dataPath), json.getBytes(StandardCharsets.UTF_8));
        } catch (IOException e) {
            log.error("保存【{}】数据失败！", dataPath);
        }
    }

    /**
     * 更新黑名单数据（从聊天记录中提取）
     */
    private void updateListData() {
        com.microsoft.playwright.Page page = PlaywrightUtil.getPageObject();
        page.navigate("https://www.zhipin.com/web/geek/chat");
        PlaywrightUtil.sleep(3);

        boolean shouldBreak = false;
        while (!shouldBreak) {
            try {
                Locator bottomLocator = page.locator(FINISHED_TEXT);
                if (bottomLocator.count() > 0 && "没有更多了".equals(bottomLocator.textContent())) {
                    shouldBreak = true;
                }
            } catch (Exception ignore) {
            }

            Locator items = page.locator(CHAT_LIST_ITEM);
            int itemCount = items.count();

            for (int i = 0; i < itemCount; i++) {
                try {
                    Locator companyElements = page.locator(COMPANY_NAME_IN_CHAT);
                    Locator messageElements = page.locator(LAST_MESSAGE);

                    if (i >= companyElements.count() || i >= messageElements.count()) {
                        break;
                    }

                    String companyName = null;
                    String message = null;
                    int retryCount = 0;

                    while (retryCount < 2) {
                        try {
                            companyName = companyElements.nth(i).textContent();
                            message = messageElements.nth(i).textContent();
                            break;
                        } catch (Exception e) {
                            retryCount++;
                            if (retryCount >= 2) {
                                log.info("尝试获取元素文本2次失败，放弃本次获取");
                                break;
                            }
                            log.info("页面元素已变更，正在重试第{}次获取元素文本...", retryCount);
                            PlaywrightUtil.sleep(1);
                        }
                    }

                    if (companyName != null && message != null) {
                        boolean match = message.contains("不") || message.contains("感谢") || message.contains("但")
                                || message.contains("遗憾") || message.contains("需要本") || message.contains("对不");
                        boolean nomatch = message.contains("不是") || message.contains("不生");
                        if (match && !nomatch) {
                            log.info("黑名单公司：【{}】，信息：【{}】", companyName, message);
                            if (blackCompanies.stream().anyMatch(companyName::contains)) {
                                continue;
                            }
                            companyName = companyName.replaceAll("\\.{3}", "");
                            if (companyName.matches(".*(\\p{IsHan}{2,}|[a-zA-Z]{4,}).*")) {
                                this.blackCompanies.add(companyName);
                            }
                        }
                    }
                } catch (Exception e) {
                    log.error("寻找黑名单公司异常...", e);
                }
            }

            try {
                Locator scrollElement = page.locator(SCROLL_LOAD_MORE);
                if (scrollElement.count() > 0) {
                    scrollElement.scrollIntoViewIfNeeded();
                } else {
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight);");
                }
            } catch (Exception e) {
                log.error("滚动元素出错", e);
                break;
            }
        }
        log.info("黑名单公司数量：{}", blackCompanies.size());
    }

    /**
     * 自定义JSON格式
     *
     * @param data 数据Map
     * @return JSON字符串
     */
    private String customJsonFormat(Map<String, Set<String>> data) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\n");
        for (Map.Entry<String, Set<String>> entry : data.entrySet()) {
            sb.append("    \"").append(entry.getKey()).append("\": [\n");
            sb.append(entry.getValue().stream().map(s -> "        \"" + s + "\"").collect(Collectors.joining(",\n")));

            sb.append("\n    ],\n");
        }
        sb.delete(sb.length() - 2, sb.length());
        sb.append("\n}");
        return sb.toString();
    }

    /**
     * 获取公司黑名单
     *
     * @return 公司黑名单集合
     */
    public Set<String> getBlackCompanies() {
        return blackCompanies;
    }

    /**
     * 获取职位黑名单
     *
     * @return 职位黑名单集合
     */
    public Set<String> getBlackJobs() {
        return blackJobs;
    }
}



