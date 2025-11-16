package ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 简历诊断服务（MVP）
 * - 组装提示词（System+User），调用 DeepSeek（复用 AiService）
 * - 解析返回（先 JSON 后 Markdown），容错修复
 * - 失败时提供最小占位 JSON
 */
@Slf4j
public class ResumeDiagnoseService {

    private static final String SYSTEM_PROMPT =
        "你是一名资深 HR 招聘经理 + ATS 优化专家，任务是在【不依赖任何职位JD】的前提下对简历做体检并给出可操作修订。" +
        "强约束：\n" +
        "A) 禁止引用或臆造 JD、岗位、招聘词、JD 关键词等字样；\n" +
        "B) 仅基于用户提供的简历文本做分析；\n" +
        "C) 先输出 JSON（严格遵循 Schema，缺失项用空结构），再输出 Markdown 建议；\n" +
        "D) 所有结论需给出依据（引用原文或指出缺失），不得编造；\n" +
        "E) 语言跟随输入，风格专业、简洁、可执行，每条建议尽量附可落地改写示例。";

    public DiagnoseResult diagnose(String text, String locale, String persona, int maxPages) {
        String userPrompt = buildUserPrompt(text, locale, persona, maxPages);
        String fullPrompt = SYSTEM_PROMPT + "\n\n" + userPrompt;
        String ai = AiService.sendRequest(fullPrompt);
        if (ai == null) ai = "";
        log.info("LLM 原始输出长度: {}", ai.length());
        Parsed parsed = parseJsonAndMarkdown(ai);
        if (parsed == null) {
            // 兜底
            Map<String, Object> json = fallbackMinimal();
            return new DiagnoseResult(json, "诊断失败，已返回占位报告。");
        }
        // schema 补齐，确保字段完整
        Map<String, Object> merged = ensureSchema(parsed.json);
        return new DiagnoseResult(merged, parsed.markdown);
    }

    private String buildUserPrompt(String text, String locale, String persona, int maxPages) {
        String tpl =
            "## User（模板，粘贴时替换花括号变量）\n" +
            "请对以下简历文本进行仅基于简历本身的专业体检，不与任何 JD 关联：\n\n" +
            "```\n\n%s\n\n```\n\n" +
            "运行参数：\n" +
            "* 语言与本地化：%s\n" +
            "* 候选人画像（可选）：%s\n" +
            "* 建议页数上限：%d\n\n" +
            "严格输出顺序：先输出 JSON（遵循预定义 Schema），再输出 Markdown 建议。";
        return String.format(tpl, text, locale, persona == null ? "" : persona, maxPages);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> ensureSchema(Map<String, Object> src) {
        Map<String, Object> m = new HashMap<>(src == null ? new HashMap<>() : src);
        m.putIfAbsent("overallScore", 0);
        // scores
        Map<String, Object> scores = (Map<String, Object>) m.get("scores");
        if (scores == null) scores = new HashMap<>();
        String[] scoreKeys = new String[]{"structure","readability","quantification","consistency","skillEvidence","riskCompliance","atsFriendliness"};
        for (String k : scoreKeys) {
            scores.putIfAbsent(k, 0);
        }
        m.put("scores", scores);
        // lengthStats
        Map<String, Object> length = (Map<String, Object>) m.get("lengthStats");
        if (length == null) length = new HashMap<>();
        length.putIfAbsent("chars", 0);
        length.putIfAbsent("words", 0);
        length.putIfAbsent("lines", 0);
        length.putIfAbsent("avgSentenceLength", 0);
        length.putIfAbsent("bulletCount", 0);
        length.putIfAbsent("quantifiedBulletRatio", 0.0);
        m.put("lengthStats", length);
        // arrays
        m.putIfAbsent("detectedSections", new Object[] {});
        m.putIfAbsent("sectionOrderAdvice", new Object[] {"CONTACT","SUMMARY","SKILLS","EXPERIENCE","PROJECTS","EDUCATION","CERTIFICATIONS"});
        m.putIfAbsent("issues", new Object[] {});
        Map<String, Object> detections = (Map<String, Object>) m.get("detections");
        if (detections == null) detections = new HashMap<>();
        detections.putIfAbsent("privacyLeaks", new Object[] {});
        detections.putIfAbsent("formattingRedFlags", new Object[] {});
        detections.putIfAbsent("inconsistencies", new Object[] {});
        detections.putIfAbsent("buzzwordsOveruse", new Object[] {});
        detections.putIfAbsent("passiveVoiceSamples", new Object[] {});
        detections.putIfAbsent("missingEvidenceForSkills", new Object[] {});
        m.put("detections", detections);
        Map<String, Object> rewrite = (Map<String, Object>) m.get("rewritePack");
        if (rewrite == null) rewrite = new HashMap<>();
        rewrite.putIfAbsent("summary", new HashMap<>());
        rewrite.putIfAbsent("skills", new HashMap<>());
        rewrite.putIfAbsent("experienceBullets", new Object[] {});
        rewrite.putIfAbsent("projectsBullets", new Object[] {});
        rewrite.putIfAbsent("educationNote", "");
        m.put("rewritePack", rewrite);
        Map<String, Object> page = (Map<String, Object>) m.get("pageFitAdvice");
        if (page == null) page = new HashMap<>();
        page.putIfAbsent("targetPages", 1);
        page.putIfAbsent("whatToTrim", new Object[] {});
        page.putIfAbsent("whatToPromote", new Object[] {});
        page.putIfAbsent("formattingTips", new Object[] {});
        m.put("pageFitAdvice", page);
        return m;
    }

    private Parsed parseJsonAndMarkdown(String content) {
        // 抓取第一段 JSON：找到首个 '{' 到其匹配的 '}'，容错保守：取最后一个 '}' 之前的子串
        int start = content.indexOf('{');
        int last = content.lastIndexOf('}');
        if (start < 0 || last <= start) {
            return null;
        }
        String jsonStr = content.substring(start, last + 1).trim();
        // 简单修补常见错误
        jsonStr = jsonStr.replaceAll(",\\s*}", "}").replaceAll(",\\s*]", "]");
        Map<String, Object> jsonMap;
        try {
            JSONObject obj = new JSONObject(jsonStr);
            jsonMap = obj.toMap();
        } catch (Exception e) {
            log.warn("JSON 解析失败，尝试正则提取最外层 JSON", e);
            try {
                Pattern p = Pattern.compile("\\{[\\s\\S]*}\\s*");
                Matcher m = p.matcher(content);
                if (m.find()) {
                    JSONObject obj = new JSONObject(m.group());
                    jsonMap = obj.toMap();
                } else {
                    return null;
                }
            } catch (Exception ex) {
                log.error("JSON 解析再次失败", ex);
                return null;
            }
        }
        String markdown = content.substring(last + 1).trim();
        return new Parsed(jsonMap, markdown);
    }

    public Map<String, Object> fallbackMinimal() {
        Map<String, Object> m = new HashMap<>();
        m.put("overallScore", 50);
        Map<String, Object> scores = new HashMap<>();
        scores.put("structure", 8);
        scores.put("readability", 7);
        scores.put("quantification", 7);
        scores.put("consistency", 7);
        scores.put("skillEvidence", 6);
        scores.put("riskCompliance", 7);
        scores.put("atsFriendliness", 8);
        m.put("scores", scores);
        Map<String, Object> length = new HashMap<>();
        length.put("chars", 0);
        length.put("words", 0);
        length.put("lines", 0);
        length.put("avgSentenceLength", 0);
        length.put("bulletCount", 0);
        length.put("quantifiedBulletRatio", 0.0);
        m.put("lengthStats", length);
        m.put("detectedSections", new Object[] {});
        m.put("sectionOrderAdvice", new Object[] {"CONTACT","SUMMARY","SKILLS","EXPERIENCE","PROJECTS","EDUCATION","CERTIFICATIONS"});
        m.put("issues", new Object[] {});
        Map<String, Object> detections = new HashMap<>();
        detections.put("privacyLeaks", new Object[] {});
        detections.put("formattingRedFlags", new Object[] {});
        detections.put("inconsistencies", new Object[] {});
        detections.put("buzzwordsOveruse", new Object[] {});
        detections.put("passiveVoiceSamples", new Object[] {});
        detections.put("missingEvidenceForSkills", new Object[] {});
        m.put("detections", detections);
        Map<String, Object> rewrite = new HashMap<>();
        rewrite.put("summary", new HashMap<>());
        rewrite.put("skills", new HashMap<>());
        rewrite.put("experienceBullets", new Object[] {});
        rewrite.put("projectsBullets", new Object[] {});
        rewrite.put("educationNote", "");
        m.put("rewritePack", rewrite);
        Map<String, Object> page = new HashMap<>();
        page.put("targetPages", 1);
        page.put("whatToTrim", new Object[] {});
        page.put("whatToPromote", new Object[] {});
        page.put("formattingTips", new Object[] {});
        m.put("pageFitAdvice", page);
        return m;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DiagnoseResult {
        public Map<String, Object> json;
        public String markdown;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    private static class Parsed {
        public Map<String, Object> json;
        public String markdown;
    }
}


