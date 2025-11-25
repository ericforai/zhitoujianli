package ai;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.json.JSONObject;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 简历诊断服务（MVP）
 * - 组装提示词（System+User），调用 DeepSeek（复用 AiService）
 * - 解析返回（先 JSON 后 Markdown），容错修复
 * - 失败时提供最小占位 JSON
 */
@Slf4j
public class ResumeDiagnoseService {

    private static final String SYSTEM_PROMPT =
        "你现在是一名具有 10 年+ 招聘经验的 专业 HR / 招聘经理，请只基于我提供的这份简历本身进行诊断，不与任何 JD 匹配，不推断未知信息。\n\n" +
        "请严格按照以下结构输出分析结果（必须输出严格的JSON格式）：\n\n" +
        "1. 总体评价（overview）\n" +
        "   - 简历第一眼的总体印象\n" +
        "   - ATS 友好度\n" +
        "   - HR 阅读体验（清晰度、结构性、专业感）\n\n" +
        "2. 结构分析（structure）\n" +
        "   - 逐项评价并指出问题点：页面结构（布局、层级、一致性）、信息密度是否合适、模块顺序是否逻辑合理、是否存在割裂、堆砌、杂乱\n\n" +
        "3. 内容分析（contentQuality）\n" +
        "   - 从 HR 审阅视角逐项分析：工作经历是否量化、结果导向是否明确、是否符合 STAR 表达方式、项目描述是否体现角色、动作、成果、是否存在空洞表达、流水账、过多形容词、是否缺少关键细节（规模、职责、成果、指标）\n\n" +
        "4. 专业度与可信度（credibility）\n" +
        "   - 描述是否专业、是否存在夸大或逻辑冲突、内容是否前后一致、年限、经历是否可信\n\n" +
        "5. ATS 技术分析（atsCompatibility）\n" +
        "   - 关键词是否足够、是否存在 ATS 无法解析的风险、格式是否标准、图片、特殊符号、复杂排版问题\n\n" +
        "6. 可提升点（improvements）\n" +
        "   - 每条必须为 可执行动作，并解释原因：结构改进、表达增强、量化建议、模块增强、去冗余、建议新增或删除的内容\n\n" +
        "7. 重写关键段落（rewrite）\n" +
        "   - 从 HR 视角，代写：工作经历示例（按 STAR 重写）、项目经历示例、自我介绍示例、核心能力模块示例\n\n" +
        "8. 最终得分（scorecard）\n" +
        "   - 从 0-10 分给出：信息清晰度、专业可信度、HR 友好度、ATS 友好度、面试通过概率（基于简历质量，不含岗位匹配）\n\n" +
        "输出要求：\n" +
        "- 必须输出严格的JSON格式，包含以上8个部分\n" +
        "- 每个部分必须是对象或数组，包含具体的分析内容和建议\n" +
        "- scorecard 部分必须包含所有5个维度的分数（数值类型）\n" +
        "- rewrite 部分必须包含重写后的内容（可以是HTML格式的字符串）\n" +
        "- 所有内容必须基于简历原文，不得编造任何信息";

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
            "请对以下简历文本进行专业诊断，严格按照System Prompt中要求的8个部分输出JSON格式的分析结果：\n\n" +
            "```\n%s\n```\n\n" +
            "运行参数：\n" +
            "- 语言与本地化：%s\n" +
            "- 候选人画像（可选）：%s\n" +
            "- 建议页数上限：%d\n\n" +
            "【重要要求】\n" +
            "1. 所有内容必须基于简历原文，不得编造任何信息。\n" +
            "2. 优先使用量化数据（数字、百分比、规模等），如果简历中有具体数字，必须使用原始数据。\n" +
            "3. 每条分析都要有价值，避免空泛描述。如果简历中缺少信息，相应字段保持为空或空数组。\n" +
            "4. rewrite 部分必须包含重写后的实际内容，格式可以是HTML或纯文本。\n" +
            "5. scorecard 部分必须包含所有5个维度的分数（0-10分）。\n" +
            "6. 每个分析部分都要具体、可执行，避免泛泛而谈。\n\n" +
            "输出格式：\n" +
            "先输出完整的JSON对象（包含overview、structure、contentQuality、credibility、atsCompatibility、improvements、rewrite、scorecard这8个字段），然后可以输出Markdown格式的补充说明（可选）。";
        return String.format(tpl, text, locale, persona == null ? "" : persona, maxPages);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> ensureSchema(Map<String, Object> src) {
        Map<String, Object> m = new HashMap<>(src == null ? new HashMap<>() : src);

        // 新的8个分析部分结构
        m.putIfAbsent("overview", new HashMap<>());
        m.putIfAbsent("structure", new HashMap<>());
        m.putIfAbsent("contentQuality", new HashMap<>());
        m.putIfAbsent("credibility", new HashMap<>());
        m.putIfAbsent("atsCompatibility", new HashMap<>());
        m.putIfAbsent("improvements", new Object[] {});
        m.putIfAbsent("rewrite", "");
        m.putIfAbsent("scorecard", new HashMap<>());

        // scorecard 必须包含5个维度的分数
        Map<String, Object> scorecard = (Map<String, Object>) m.get("scorecard");
        if (scorecard == null) scorecard = new HashMap<>();
        scorecard.putIfAbsent("信息清晰度", 0);
        scorecard.putIfAbsent("专业可信度", 0);
        scorecard.putIfAbsent("HR友好度", 0);
        scorecard.putIfAbsent("ATS友好度", 0);
        scorecard.putIfAbsent("面试通过概率", 0);
        m.put("scorecard", scorecard);

        // 计算综合分数（使用面试通过概率，如果没有则计算平均值）
        double overallScore = 0;
        if (scorecard.containsKey("面试通过概率")) {
            Object prob = scorecard.get("面试通过概率");
            if (prob instanceof Number) {
                overallScore = ((Number) prob).doubleValue();
            }
        } else {
            // 如果没有面试通过概率，计算5个维度的平均值
            double sum = 0;
            int count = 0;
            for (Object value : scorecard.values()) {
                if (value instanceof Number) {
                    sum += ((Number) value).doubleValue();
                    count++;
                }
            }
            if (count > 0) {
                overallScore = sum / count;
            }
        }
        m.put("overallScore", (int) Math.round(overallScore * 10)); // 转换为0-100分制

        // 保持向后兼容：如果存在旧的字段，保留它们
        m.putIfAbsent("scores", new HashMap<>());
        m.putIfAbsent("lengthStats", new HashMap<>());
        m.putIfAbsent("detectedSections", new Object[] {});
        m.putIfAbsent("issues", new Object[] {});
        m.putIfAbsent("detections", new HashMap<>());

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

        // 新的8个分析部分结构
        m.put("overview", new HashMap<>());
        m.put("structure", new HashMap<>());
        m.put("contentQuality", new HashMap<>());
        m.put("credibility", new HashMap<>());
        m.put("atsCompatibility", new HashMap<>());
        m.put("improvements", new Object[] {});
        m.put("rewrite", "");

        // scorecard 默认分数
        Map<String, Object> scorecard = new HashMap<>();
        scorecard.put("信息清晰度", 5);
        scorecard.put("专业可信度", 5);
        scorecard.put("HR友好度", 5);
        scorecard.put("ATS友好度", 5);
        scorecard.put("面试通过概率", 5);
        m.put("scorecard", scorecard);
        m.put("overallScore", 50); // 0-100分制

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


