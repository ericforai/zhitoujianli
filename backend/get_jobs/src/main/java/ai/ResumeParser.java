package ai;

import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.json.JSONArray;

import java.util.HashMap;
import java.util.Map;

/**
 * 简历解析器 - 使用AI解析简历并提取结构化信息
 * 
 * @author AI Assistant
 */
@Slf4j
public class ResumeParser {

    private static final String SYSTEM_PROMPT = """
        你是资深的招聘专家与信息抽取模型。收到候选人简历文本后，请只返回严格符合指定 JSON 结构的数据，不要输出任何解释性文本。若某字段无法提取请赋值 null。核心优势（core_strengths）需为 3-5 条中文短句（每条 ≤18 字）。confidence 为 0-1 的浮点数。
        
        请严格按照以下JSON格式输出：
        {
          "name": "候选人姓名",
          "current_title": "当前职位",
          "years_experience": 工作年限数字,
          "skills": ["技能1", "技能2", "技能3"],
          "core_strengths": ["优势1", "优势2", "优势3", "优势4", "优势5"],
          "education": "学历信息",
          "company": "当前公司",
          "confidence": {
            "name": 0.95,
            "skills": 0.90,
            "experience": 0.85
          }
        }
        """;

    /**
     * 解析简历文本，提取结构化信息
     * 
     * @param resumeText 简历文本
     * @return 解析后的候选人信息
     */
    public Map<String, Object> parseResume(String resumeText) {
        try {
            log.info("开始解析简历，文本长度: {}", resumeText.length());
            
            // 构建用户提示词
            String userPrompt = String.format("简历文本：%n%s%n%n请输出JSON格式的解析结果。", resumeText);
            
            // 调用AI服务
            String aiResponse = AiService.sendRequest(SYSTEM_PROMPT + "%n%n" + userPrompt);
            
            if (aiResponse == null || aiResponse.trim().isEmpty()) {
                throw new RuntimeException("AI服务返回空响应");
            }
            
            log.info("AI响应: {}", aiResponse);
            
            // 解析JSON响应
            Map<String, Object> result = parseJsonResponse(aiResponse);
            
            log.info("简历解析完成: {}", result.get("name"));
            return result;
            
        } catch (Exception e) {
            log.error("简历解析失败", e);
            throw new RuntimeException("简历解析失败: " + e.getMessage(), e);
        }
    }

    /**
     * 解析AI返回的JSON响应
     */
    private Map<String, Object> parseJsonResponse(String aiResponse) {
        try {
            // 清理响应文本，提取JSON部分
            String jsonText = extractJsonFromResponse(aiResponse);
            
            JSONObject jsonObject = new JSONObject(jsonText);
            Map<String, Object> result = new HashMap<>();
            
            // 提取基本信息
            result.put("name", jsonObject.optString("name", null));
            result.put("current_title", jsonObject.optString("current_title", null));
            result.put("years_experience", jsonObject.optInt("years_experience", 0));
            result.put("education", jsonObject.optString("education", null));
            result.put("company", jsonObject.optString("company", null));
            
            // 提取技能数组
            JSONArray skillsArray = jsonObject.optJSONArray("skills");
            if (skillsArray != null) {
                String[] skills = new String[skillsArray.length()];
                for (int i = 0; i < skillsArray.length(); i++) {
                    skills[i] = skillsArray.getString(i);
                }
                result.put("skills", skills);
            } else {
                result.put("skills", new String[0]);
            }
            
            // 提取核心优势数组
            JSONArray strengthsArray = jsonObject.optJSONArray("core_strengths");
            if (strengthsArray != null) {
                String[] strengths = new String[strengthsArray.length()];
                for (int i = 0; i < strengthsArray.length(); i++) {
                    strengths[i] = strengthsArray.getString(i);
                }
                result.put("core_strengths", strengths);
            } else {
                result.put("core_strengths", new String[0]);
            }
            
            // 提取置信度信息
            JSONObject confidenceObject = jsonObject.optJSONObject("confidence");
            if (confidenceObject != null) {
                Map<String, Double> confidence = new HashMap<>();
                confidence.put("name", confidenceObject.optDouble("name", 0.0));
                confidence.put("skills", confidenceObject.optDouble("skills", 0.0));
                confidence.put("experience", confidenceObject.optDouble("experience", 0.0));
                result.put("confidence", confidence);
            } else {
                Map<String, Double> confidence = new HashMap<>();
                confidence.put("name", 0.0);
                confidence.put("skills", 0.0);
                confidence.put("experience", 0.0);
                result.put("confidence", confidence);
            }
            
            return result;
            
        } catch (Exception e) {
            log.error("解析JSON响应失败: {}", aiResponse, e);
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
