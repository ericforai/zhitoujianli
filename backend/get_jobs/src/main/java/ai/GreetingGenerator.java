package ai;

import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.json.JSONArray;

import java.util.HashMap;
import java.util.Map;

/**
 * 打招呼语生成器 - 基于候选人信息和岗位JD生成个性化打招呼语
 * 
 * @author AI Assistant
 */
@Slf4j
public class GreetingGenerator {

    private static final String PRODUCTION_SYSTEM_PROMPT = """
        你是资深HR顾问，输入包含 candidate JSON 和 job_description 文本。你必须严格只返回一个 JSON 对象，且仅包括 greetings 字段，不得输出任何额外文本或解释。greetings 必须包含 professional, sincere, concise 三个键，每个值为中文字符串（80字以内），融入岗位 JD 的关键词、突出候选人的关键优势。
        """;

    private static final String DEBUG_SYSTEM_PROMPT = """
        你是资深HR顾问，输入包含 candidate JSON 和 job_description 文本。请返回详细的匹配分析结果，包括：
        1. JD匹配度分析
        2. 候选人优势匹配
        3. 三种风格的打招呼语
        
        请严格按照以下JSON格式输出：
        {
          "match_analysis": {
            "overall_score": 0.85,
            "matched_skills": ["技能1", "技能2"],
            "matched_requirements": ["要求1", "要求2"],
            "gaps": ["差距1", "差距2"]
          },
          "greetings": {
            "professional": "专业风格打招呼语",
            "sincere": "真诚风格打招呼语", 
            "concise": "简洁风格打招呼语"
          }
        }
        """;

    /**
     * 生成打招呼语
     * 
     * @param candidate 候选人信息
     * @param jobDescription 岗位描述
     * @param mode 模式：production 或 debug
     * @return 生成的打招呼语
     */
    public Map<String, Object> generateGreetings(Map<String, Object> candidate, String jobDescription, String mode) {
        try {
            log.info("开始生成打招呼语，候选人: {}, 模式: {}", candidate.get("name"), mode);
            
            // 构建用户提示词
            String userPrompt = buildUserPrompt(candidate, jobDescription, mode);
            
            // 选择系统提示词
            String systemPrompt = "production".equals(mode) ? PRODUCTION_SYSTEM_PROMPT : DEBUG_SYSTEM_PROMPT;
            
            // 调用AI服务
            String aiResponse = AiService.sendRequest(systemPrompt + "\n\n" + userPrompt);
            
            if (aiResponse == null || aiResponse.trim().isEmpty()) {
                throw new RuntimeException("AI服务返回空响应");
            }
            
            log.info("AI响应: {}", aiResponse);
            
            // 解析响应
            Map<String, Object> result = parseResponse(aiResponse, mode);
            
            log.info("打招呼语生成完成");
            return result;
            
        } catch (Exception e) {
            log.error("打招呼语生成失败", e);
            throw new RuntimeException("打招呼语生成失败: " + e.getMessage(), e);
        }
    }

    /**
     * 构建用户提示词
     */
    private String buildUserPrompt(Map<String, Object> candidate, String jobDescription, String mode) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("参数：\n");
        prompt.append("candidate = ").append(new JSONObject(candidate).toString()).append("\n");
        prompt.append("job_description = ").append(jobDescription).append("\n");
        prompt.append("mode = \"").append(mode).append("\"\n\n");
        
        if ("production".equals(mode)) {
            prompt.append("请严格输出 JSON：\n");
            prompt.append("{\n");
            prompt.append("  \"greetings\": {\n");
            prompt.append("    \"professional\": \"...\",\n");
            prompt.append("    \"sincere\": \"...\",\n");
            prompt.append("    \"concise\": \"...\"\n");
            prompt.append("  }\n");
            prompt.append("}\n");
        } else {
            prompt.append("请输出详细的匹配分析结果。\n");
        }
        
        return prompt.toString();
    }

    /**
     * 解析AI响应
     */
    private Map<String, Object> parseResponse(String aiResponse, String mode) {
        try {
            // 清理响应文本，提取JSON部分
            String jsonText = extractJsonFromResponse(aiResponse);
            
            JSONObject jsonObject = new JSONObject(jsonText);
            Map<String, Object> result = new HashMap<>();
            
            if ("production".equals(mode)) {
                // 生产模式：只返回打招呼语
                JSONObject greetingsObject = jsonObject.getJSONObject("greetings");
                Map<String, String> greetings = new HashMap<>();
                greetings.put("professional", greetingsObject.getString("professional"));
                greetings.put("sincere", greetingsObject.getString("sincere"));
                greetings.put("concise", greetingsObject.getString("concise"));
                result.put("greetings", greetings);
            } else {
                // 调试模式：返回详细分析
                if (jsonObject.has("match_analysis")) {
                    JSONObject matchAnalysisObject = jsonObject.getJSONObject("match_analysis");
                    Map<String, Object> matchAnalysis = new HashMap<>();
                    matchAnalysis.put("overall_score", matchAnalysisObject.optDouble("overall_score", 0.0));
                    
                    // 提取匹配技能
                    JSONArray matchedSkillsArray = matchAnalysisObject.optJSONArray("matched_skills");
                    if (matchedSkillsArray != null) {
                        String[] matchedSkills = new String[matchedSkillsArray.length()];
                        for (int i = 0; i < matchedSkillsArray.length(); i++) {
                            matchedSkills[i] = matchedSkillsArray.getString(i);
                        }
                        matchAnalysis.put("matched_skills", matchedSkills);
                    }
                    
                    // 提取匹配要求
                    JSONArray matchedRequirementsArray = matchAnalysisObject.optJSONArray("matched_requirements");
                    if (matchedRequirementsArray != null) {
                        String[] matchedRequirements = new String[matchedRequirementsArray.length()];
                        for (int i = 0; i < matchedRequirementsArray.length(); i++) {
                            matchedRequirements[i] = matchedRequirementsArray.getString(i);
                        }
                        matchAnalysis.put("matched_requirements", matchedRequirements);
                    }
                    
                    // 提取差距
                    JSONArray gapsArray = matchAnalysisObject.optJSONArray("gaps");
                    if (gapsArray != null) {
                        String[] gaps = new String[gapsArray.length()];
                        for (int i = 0; i < gapsArray.length(); i++) {
                            gaps[i] = gapsArray.getString(i);
                        }
                        matchAnalysis.put("gaps", gaps);
                    }
                    
                    result.put("match_analysis", matchAnalysis);
                }
                
                // 提取打招呼语
                if (jsonObject.has("greetings")) {
                    JSONObject greetingsObject = jsonObject.getJSONObject("greetings");
                    Map<String, String> greetings = new HashMap<>();
                    greetings.put("professional", greetingsObject.getString("professional"));
                    greetings.put("sincere", greetingsObject.getString("sincere"));
                    greetings.put("concise", greetingsObject.getString("concise"));
                    result.put("greetings", greetings);
                }
            }
            
            return result;
            
        } catch (Exception e) {
            log.error("解析响应失败: {}", aiResponse, e);
            throw new RuntimeException("解析AI响应失败: " + e.getMessage(), e);
        }
    }

    /**
     * 从AI响应中提取JSON部分
     */
    private String extractJsonFromResponse(String response) {
        // 查找JSON开始和结束位置
        int startIndex = response.indexOf("{");
        int endIndex = response.lastIndexOf("}");
        
        if (startIndex == -1 || endIndex == -1 || startIndex >= endIndex) {
            throw new RuntimeException("无法从响应中提取JSON: " + response);
        }
        
        return response.substring(startIndex, endIndex + 1);
    }
}
