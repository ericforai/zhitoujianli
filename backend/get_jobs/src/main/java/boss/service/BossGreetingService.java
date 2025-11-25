package boss.service;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

import ai.SmartGreetingService;
import boss.BossConfig;
import utils.Job;
import utils.PlaywrightUtil;

/**
 * Boss打招呼语服务
 * 负责生成打招呼语和提取岗位描述
 *
 * @author ZhiTouJianLi Team
 */
public class BossGreetingService {
    private static final Logger log = LoggerFactory.getLogger(BossGreetingService.class);

    private final BossConfig config;
    private final String userId;

    public BossGreetingService(BossConfig config, String userId) {
        this.config = config;
        this.userId = userId;
    }

    /**
     * 生成打招呼语消息
     * 优先使用智能AI生成，失败时回退到默认招呼语
     *
     * @param keyword 搜索关键词
     * @param job 岗位信息
     * @param fullJobDescription 完整岗位描述
     * @return 打招呼语
     */
    public String generateGreetingMessage(String keyword, Job job, String fullJobDescription) {
        String defaultGreeting = this.config.getDefaultGreeting();
        String sayHi = (defaultGreeting != null ? defaultGreeting : "").replaceAll("[\\r\\n]", "");

        log.info("【打招呼语】开始生成打招呼语，岗位: {}", job.getJobName());

        // 检查是否启用智能打招呼
        if (config.getEnableSmartGreeting() == null || !config.getEnableSmartGreeting()) {
            log.info("【打招呼语】智能打招呼未启用（enableSmartGreeting={}），使用默认招呼语",
                config.getEnableSmartGreeting());
            return sayHi;
        }

        log.info("【打招呼语】✅ 智能打招呼已启用，开始生成个性化打招呼语");

        // 支持多种用户ID格式和文件名（candidate_resume.json优先）
        // 获取用户ID（优先级：系统属性 > 环境变量）
        String userId = System.getProperty("boss.user.id");
        String userIdSource = "系统属性(boss.user.id)";
        if (userId == null || userId.isEmpty()) {
            userId = System.getenv("BOSS_USER_ID");
            userIdSource = "环境变量(BOSS_USER_ID)";
        }
        if (userId == null || userId.isEmpty()) {
            userId = this.userId; // 使用构造函数传入的userId
            userIdSource = "构造函数参数";
        }
        if (userId == null || userId.isEmpty()) {
            // ❌ 不再使用default_user fallback（多租户隔离要求）
            log.error("【打招呼语】❌ 未提供用户ID（boss.user.id或BOSS_USER_ID），无法生成智能打招呼语");
            log.warn("【打招呼语】降级使用默认招呼语");
            return sayHi; // 直接返回默认打招呼语，不尝试读取简历
        }
        log.info("【打招呼语】✅ 获取到用户ID: {} (来源: {})", userId, userIdSource);

        // 修复用户ID转换逻辑：luwenrong123_sina_com -> luwenrong123@sina.com
        // 策略：将最后一个_com替换为.com，将倒数第二个_替换为@
        String emailUserId = userId;
        if (userId.contains("_")) {
            // 先替换域名部分：_com -> .com, _cn -> .cn, _net -> .net等
            emailUserId = userId.replaceAll("_(com|cn|net|org|edu|gov)$", ".$1");
            // 然后替换最后一个_为@（邮箱的@符号）
            int lastUnderscoreIndex = emailUserId.lastIndexOf("_");
            if (lastUnderscoreIndex > 0) {
                emailUserId = emailUserId.substring(0, lastUnderscoreIndex) + "@" + emailUserId.substring(lastUnderscoreIndex + 1);
            }
        }

        // ✅ 使用绝对路径查找简历文件（修复路径查找失败问题）
        // 优先使用环境变量，否则使用默认路径
        String userDataBaseDir = System.getenv("USER_DATA_DIR");
        if (userDataBaseDir == null || userDataBaseDir.isEmpty()) {
            // 备用方案：使用工作目录 + user_data
            String workDir = System.getProperty("user.dir");
            if (workDir != null && new File(workDir + "/user_data").exists()) {
                userDataBaseDir = workDir + "/user_data";
            } else {
                // 最终备用方案：使用生产环境绝对路径
                userDataBaseDir = "/opt/zhitoujianli/backend/user_data";
            }
        }

        log.info("【打招呼语】当前工作目录: {}", System.getProperty("user.dir"));
        log.info("【打招呼语】用户数据目录: {}", userDataBaseDir);

        String[] possiblePaths = {
            userDataBaseDir + "/" + userId + "/candidate_resume.json",  // 原始格式：luwenrong123_sina_com
            userDataBaseDir + "/" + emailUserId + "/candidate_resume.json",  // 邮箱格式：luwenrong123@sina.com
            userDataBaseDir + "/" + userId + "/resume.json",  // 兼容旧格式
            userDataBaseDir + "/" + emailUserId + "/resume.json"  // 邮箱格式旧文件名
        };

        File resumeFile = null;
        String resumePath = null;
        log.info("【打招呼语】开始查找简历文件，用户ID: {}, 邮箱格式: {}", userId, emailUserId);
        for (String path : possiblePaths) {
            File file = new File(path);
            log.info("【打招呼语】尝试路径: {} (绝对路径: {}, 存在: {})",
                path, file.getAbsolutePath(), file.exists());
            if (file.exists()) {
                resumeFile = file;
                resumePath = path;
                log.info("【打招呼语】✅ 找到简历文件: {} (绝对路径: {})", path, file.getAbsolutePath());
                break;
            }
        }

        if (resumeFile == null) {
            log.error("【打招呼语】❌ 未找到简历文件，已尝试的路径: {}", String.join(", ", possiblePaths));
            log.error("【打招呼语】绝对路径列表: {}",
                Arrays.stream(possiblePaths)
                    .map(p -> new File(p).getAbsolutePath())
                    .collect(Collectors.joining(", ")));
            log.warn("【打招呼语】降级使用默认招呼语");
            return sayHi;
        }

        try {
            // 直接从文件加载候选人信息
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> resumeData = mapper.readValue(resumeFile, Map.class);
            if (resumeData == null) {
                log.warn("【打招呼语】简历文件为空，使用默认招呼语");
                return sayHi;
            }

            // 转换简历格式以匹配SmartGreetingService的期望格式
            Map<String, Object> candidate = convertResumeFormat(resumeData);

            log.info("【简历信息】职位: {}, 工作年限: {}, 技能数: {}, 核心优势数: {}",
                candidate.get("current_title"),
                candidate.get("years_experience"),
                candidate.get("skills") != null ? ((List<?>)candidate.get("skills")).size() : 0,
                candidate.get("core_strengths") != null ? ((List<?>)candidate.get("core_strengths")).size() : 0
            );

            // 检查完整JD是否为空
            if (fullJobDescription == null || fullJobDescription.trim().isEmpty()) {
                log.warn("【智能打招呼】⚠️ 完整JD为空，无法生成个性化打招呼语，使用默认招呼语");
                log.warn("【智能打招呼】JD长度: {}, 岗位: {}",
                    fullJobDescription != null ? fullJobDescription.length() : 0, job.getJobName());
                return sayHi;
            }
            log.info("【智能打招呼】完整JD已获取，长度: {}字", fullJobDescription.length());

            // 使用完整JD生成智能打招呼语
            log.info("【智能打招呼】开始调用AI生成，岗位: {}, JD长度: {}字",
                job.getJobName(), fullJobDescription.length());
            String smartGreeting = SmartGreetingService.generateSmartGreeting(
                candidate,
                job.getJobName(),
                fullJobDescription
            );

            if (smartGreeting != null && !smartGreeting.trim().isEmpty()) {
                log.info("【智能打招呼】✅ 成功生成，长度: {}字，内容预览: {}",
                    smartGreeting.length(),
                    smartGreeting.length() > 50 ? smartGreeting.substring(0, 50) + "..." : smartGreeting);
                return smartGreeting;
            } else {
                log.warn("【智能打招呼】❌ 生成失败或超时（返回null或空字符串），使用默认招呼语");
                log.warn("【智能打招呼】可能原因: 1) AI服务超时 2) AI服务返回空响应 3) 网络连接问题");
                return sayHi;
            }

        } catch (Exception e) {
            log.error("【智能打招呼】❌ 生成过程发生异常，使用默认招呼语", e);
            log.error("【智能打招呼】异常类型: {}, 异常消息: {}",
                e.getClass().getSimpleName(), e.getMessage());
            if (e.getCause() != null) {
                log.error("【智能打招呼】根本原因: {}", e.getCause().getMessage());
            }
            return sayHi;
        }
    }

    /**
     * 抓取完整岗位描述（详情页）
     * 包括：职位详情、岗位职责、任职要求等所有文本
     *
     * @param detailPage 详情页对象
     * @return 完整岗位描述
     */
    public String extractFullJobDescription(Page detailPage) {
        try {
            StringBuilder fullJD = new StringBuilder();

            // 等待岗位详情区域加载 - 增加超时时间到15秒，提高成功率
            try {
                detailPage.waitForSelector("div.job-detail-section", new Page.WaitForSelectorOptions().setTimeout(15000));
            } catch (Exception e) {
                log.warn("【完整JD】等待job-detail-section超时，尝试继续抓取: {}", e.getMessage());
                // 即使超时也继续尝试抓取，可能页面结构不同
            }

            // 🔧 关键修复：等待内容真正加载完成（不只是一个空元素）
            // 使用循环检测确保内容已加载，避免反复失败
            log.info("【完整JD】等待内容加载完成...");

            // 首先等待页面加载状态完成
            try {
                detailPage.waitForLoadState(com.microsoft.playwright.options.LoadState.NETWORKIDLE, new Page.WaitForLoadStateOptions().setTimeout(10000));
                log.debug("【完整JD】页面网络空闲状态已达成");
            } catch (Exception e) {
                log.debug("【完整JD】等待网络空闲超时，继续尝试: {}", e.getMessage());
            }

            // ✅ 修复：使用Playwright原生API替代JavaScript字符串执行，避免语法错误
            boolean contentLoaded = false;
            // 定义选择器列表（按优先级排序）
            String[] selectors = {
                "div.job-sec-text",
                "div.job-detail-content",
                "div.job-detail-section",
                "div[class*='job-detail']",
                "div[class*='job-sec']",
                ".job-sec",
                "[class*='job-detail']",
                "[class*='job-sec']",
                "div[class*='detail']",
                "div[class*='description']",
                "div[class*='content']",
                ".job-detail",
                ".job-description"
            };

            // 使用Playwright原生API检测内容是否加载完成
            // 重试次数：10次，每次等待2秒，总共最多等待20秒
            for (int retry = 0; retry < 10; retry++) {
                try {
                    // 遍历所有选择器，检查是否有内容加载
                    for (String selector : selectors) {
                        try {
                            Locator locator = detailPage.locator(selector);
                            int count = locator.count();

                            if (count > 0) {
                                // 检查第一个元素是否有有效文本内容（至少30字符）
                                String text = locator.first().textContent();
                                if (text != null && text.trim().length() > 30) {
                                    contentLoaded = true;
                                    log.info("【完整JD】✅ 内容加载完成（选择器: {}, 重试{}次）", selector, retry + 1);
                                    break;
                                }
                            }
                        } catch (Exception e) {
                            // 忽略单个选择器的错误，继续尝试下一个
                            log.debug("【完整JD】选择器 {} 检测失败: {}", selector, e.getMessage());
                            continue;
                        }
                    }

                    if (contentLoaded) {
                        break;
                    }
                } catch (Exception e) {
                    // 记录检测错误，继续重试
                    log.debug("【完整JD】检测异常（重试{}）: {}", retry + 1, e.getMessage());
                }

                if (retry < 9 && !contentLoaded) {
                    PlaywrightUtil.sleep(2); // 等待2秒后重试
                }
            }

            // ✅ 修复：改进错误处理和降级方案
            if (!contentLoaded) {
                log.warn("【完整JD】等待内容加载超时（10次重试，共20秒），继续尝试抓取（降级方案）");
            }

            // 抓取所有岗位详情文本块
            Locator jobDetailSections = detailPage.locator("div.job-sec-text");
            int sectionCount = jobDetailSections.count();

            log.info("【完整JD】找到{}个详情文本块", sectionCount);

            for (int i = 0; i < sectionCount; i++) {
                String sectionText = jobDetailSections.nth(i).textContent();
                if (sectionText != null && !sectionText.trim().isEmpty()) {
                    fullJD.append(sectionText.trim()).append("%n%n");
                }
            }

            // 如果没有抓到内容，尝试其他选择器
            if (fullJD.length() == 0) {
                log.warn("【完整JD】未找到job-sec-text，尝试备用选择器");

                // 备用选择器列表（按优先级排序）
                String[] fallbackSelectors = {
                    "div.job-detail-content",      // 备用选择器1: 职位描述区域
                    "div.job-detail-section",      // 备用选择器2: 整个详情区域
                    ".job-sec",                    // 备用选择器3: 简化选择器
                    "[class*='job-detail']",       // 备用选择器4: 包含job-detail的class
                    "[class*='job-sec']"           // 备用选择器5: 包含job-sec的class
                };

                for (String selector : fallbackSelectors) {
                    try {
                        Locator locator = detailPage.locator(selector);
                        int count = locator.count();
                        if (count > 0) {
                            log.info("【完整JD】备用选择器找到内容: {} ({}个元素)", selector, count);
                            // 🔧 关键修复：增加等待时间，确保内容完全加载
                            PlaywrightUtil.sleep(3); // 等待3秒确保内容加载
                            // 额外等待，确保动态内容已渲染
                            PlaywrightUtil.sleep(2); // 额外等待2秒确保内容加载

                            for (int i = 0; i < count; i++) {
                                try {
                                    // 优先使用innerText（获取所有可见文本，包括子元素）
                                    String text = (String) locator.nth(i).evaluate("el => el.innerText || el.textContent || ''");
                                    if (text == null || text.trim().isEmpty()) {
                                        // 如果innerText为空，尝试textContent
                                        text = locator.nth(i).textContent();
                                    }

                                    // 🔧 关键修复：验证内容长度（至少50字符才认为是有效内容）
                                    if (text != null && text.trim().length() >= 50) {
                                        log.debug("【完整JD】备用选择器 {} 第{}个元素，文本长度: {}", selector, i, text.length());
                                        fullJD.append(text.trim()).append("%n%n");
                                    } else if (text != null && !text.trim().isEmpty()) {
                                        log.warn("【完整JD】备用选择器 {} 第{}个元素，文本过短（{}字），可能未完全加载，等待后重试", selector, i, text.trim().length());
                                        // 文本太短，可能还在加载中，增加等待时间并重试多次
                                        for (int retry = 0; retry < 5; retry++) {
                                            PlaywrightUtil.sleep(2); // 每次等待2秒
                                            text = (String) locator.nth(i).evaluate("el => el.innerText || el.textContent || ''");
                                            if (text != null && text.trim().length() >= 50) {
                                                log.info("【完整JD】重试{}次后获取到有效内容，长度: {}", retry + 1, text.trim().length());
                                                fullJD.append(text.trim()).append("%n%n");
                                                break;
                                            }
                                        }
                                        if (text == null || text.trim().length() < 50) {
                                            log.warn("【完整JD】备用选择器 {} 第{}个元素，重试5次后仍无效", selector, i);
                                        }
                                    } else {
                                        log.warn("【完整JD】备用选择器 {} 第{}个元素，文本为空，尝试等待后重试", selector, i);
                                        // 文本为空，尝试等待后重试
                                        PlaywrightUtil.sleep(3);
                                        text = (String) locator.nth(i).evaluate("el => el.innerText || el.textContent || ''");
                                        if (text != null && text.trim().length() >= 50) {
                                            log.info("【完整JD】等待后获取到有效内容，长度: {}", text.trim().length());
                                            fullJD.append(text.trim()).append("%n%n");
                                        }
                                    }
                                } catch (Exception e) {
                                    log.debug("【完整JD】备用选择器 {} 第{}个元素获取文本失败: {}", selector, i, e.getMessage());
                                    // 尝试使用textContent作为fallback
                                    try {
                                        String text = locator.nth(i).textContent();
                                        if (text != null && !text.trim().isEmpty()) {
                                            fullJD.append(text.trim()).append("%n%n");
                                        }
                                    } catch (Exception e2) {
                                        log.debug("【完整JD】textContent也失败: {}", e2.getMessage());
                                    }
                                }
                            }
                            if (fullJD.length() > 0) {
                                log.info("【完整JD】✅ 使用备用选择器 {} 成功抓取", selector);
                                break;
                            } else {
                                log.warn("【完整JD】备用选择器 {} 找到元素但内容为空，继续尝试其他选择器", selector);
                            }
                        }
                    } catch (Exception e) {
                        log.debug("【完整JD】备用选择器 {} 失败: {}", selector, e.getMessage());
                    }
                }
            }

            String result = fullJD.toString().trim();

            if (result.isEmpty()) {
                log.warn("【完整JD】⚠️ 未能抓取到任何岗位描述内容");
                log.warn("【完整JD】已尝试的选择器: div.job-sec-text, div.job-detail-content, div.job-detail-section");
                log.warn("【完整JD】这可能导致智能打招呼语无法生成，将使用默认打招呼语");
                return "";
            }

            log.info("【完整JD】✅ 抓取成功，总长度: {}字", result.length());
            if (result.length() < 50) {
                log.warn("【完整JD】⚠️ JD内容较短（{}字），可能不完整", result.length());
            }
            return result;

        } catch (Exception e) {
            log.error("【完整JD】❌ 抓取失败: {}", e.getMessage(), e);
            log.error("【完整JD】异常类型: {}, 这可能导致智能打招呼语无法生成", e.getClass().getSimpleName());
            return "";
        }
    }

    /**
     * 转换简历格式，将resume.json的格式转换为SmartGreetingService期望的格式
     *
     * @param resumeData 从resume.json文件读取的原始数据
     * @return 转换后的候选人信息Map
     */
    @SuppressWarnings("unchecked")
    private static Map<String, Object> convertResumeFormat(Map<String, Object> resumeData) {
        Map<String, Object> candidate = new HashMap<>();

        // 提取resume子对象
        Map<String, Object> resume = (Map<String, Object>) resumeData.get("resume");

        // 【新增】如果没有resume子对象，说明是candidate_resume.json格式（扁平化结构）
        if (resume == null) {
            log.debug("【简历转换】检测到扁平化简历格式（candidate_resume.json），直接使用");
            // candidate_resume.json已经是正确的格式，直接返回
            return resumeData;
        }

        // 映射字段：position -> current_title
        String position = (String) resume.get("position");
        candidate.put("current_title", position != null ? position : "未知职位");

        // 映射字段：experience -> years_experience (提取数字)
        String experience = (String) resume.get("experience");
        if (experience != null) {
            // 从"10年以上"中提取数字
            String yearsStr = experience.replaceAll("[^0-9]", "");
            candidate.put("years_experience", yearsStr.isEmpty() ? "10" : yearsStr);
        } else {
            candidate.put("years_experience", "10");
        }

        // 映射字段：skills -> skills (直接复制)
        List<String> skills = (List<String>) resume.get("skills");
        candidate.put("skills", skills != null ? skills : new ArrayList<String>());

        // 映射字段：achievements -> core_strengths (成就作为核心优势)
        List<String> achievements = (List<String>) resume.get("achievements");
        candidate.put("core_strengths", achievements != null ? achievements : new ArrayList<String>());

        // 添加其他可用字段
        String name = (String) resume.get("name");
        if (name != null) {
            candidate.put("name", name);
        }

        String education = (String) resume.get("education");
        if (education != null) {
            candidate.put("education", education);
        }

        String location = (String) resume.get("location");
        if (location != null) {
            candidate.put("location", location);
        }

        log.debug("【简历转换】成功转换简历格式: position={}, experience={}, skills={}, achievements={}",
            position, experience,
            skills != null ? skills.size() : 0,
            achievements != null ? achievements.size() : 0
        );

        return candidate;
    }
}



