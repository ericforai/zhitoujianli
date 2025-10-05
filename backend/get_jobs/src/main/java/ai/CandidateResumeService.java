package ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileWriter;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import util.UserContextUtil;

/**
 * 候选人简历解析与管理服务
 *
 * Stage A: 简历解析 - 上传后立即调用，只需要做一次
 *
 * @author AI Assistant
 */
@Slf4j
public class CandidateResumeService {

    // 用户简历文件基础路径
    private static final String USER_RESUME_BASE_PATH = "user_data";

    /**
     * 获取当前用户的简历文件路径
     */
    private static String getUserResumePath(String userId) {
        return USER_RESUME_BASE_PATH + "/" + userId + "/candidate_resume.json";
    }

    /**
     * 获取当前用户的简历文件路径（从UserContext获取用户ID）
     */
    private static String getCurrentUserResumePath() {
        // 从UserContext获取当前用户ID
        String userId = UserContextUtil.getCurrentUserId();
        if (userId == null || userId.isEmpty()) {
            // 商业化项目必须要求用户登录
            throw new RuntimeException("用户未登录，无法访问简历数据。请先登录系统。");
        }
        return getUserResumePath(userId);
    }

    /**
     * Stage A - AI简历解析Prompt（System）
     */
    private static final String RESUME_PARSE_SYSTEM_PROMPT = """
        你是资深的招聘专家与信息抽取模型。收到候选人简历文本后，请只返回严格符合指定 JSON 结构的数据，不要输出任何解释性文本。若某字段无法提取请赋值 null。核心优势（core_strengths）需为 3-5 条中文短句（每条 ≤18 字）。confidence 为 0-1 的浮点数。

        请严格按照以下JSON格式输出：
        {
          "name": "候选人姓名",
          "current_title": "当前职位",
          "years_experience": 工作年限数字,
          "skills": ["技能1", "技能2", "技能3"],
          "core_strengths": ["优势1（≤18字）", "优势2（≤18字）", "优势3（≤18字）"],
          "education": "学历信息",
          "company": "当前公司",
          "confidence": {
            "name": 0.95,
            "skills": 0.90,
            "experience": 0.85
          }
        }

        注意：
        1. 只返回JSON，不要任何解释
        2. 核心优势必须从简历中提取，不得编造
        3. 每条优势不超过18个汉字
        4. confidence表示提取的置信度（0-1）
        """;

    /**
     * 解析简历文本并保存
     *
     * @param resumeText 简历文本
     * @return 解析后的候选人信息
     */
    public static Map<String, Object> parseAndSaveResume(String resumeText) {
        try {
            log.info("【简历解析】开始解析简历，文本长度: {}", resumeText.length());

            // 构建User Prompt
            String userPrompt = String.format("简历文本：\n%s\n\n请输出JSON格式的解析结果。", resumeText);

            // 调用AI服务，temperature=0.3保证稳定性
            String fullPrompt = RESUME_PARSE_SYSTEM_PROMPT + "\n\n" + userPrompt;
            String aiResponse = AiService.sendRequest(fullPrompt);

            if (aiResponse == null || aiResponse.trim().isEmpty()) {
                throw new RuntimeException("AI服务返回空响应");
            }

            log.info("【简历解析】AI响应长度: {}", aiResponse.length());

            // 解析JSON响应
            Map<String, Object> candidate = parseJsonResponse(aiResponse);

            // 保存到文件
            saveCandidateInfo(candidate);

            log.info("【简历解析】解析完成，候选人: {}", candidate.get("name"));
            return candidate;

        } catch (Exception e) {
            log.error("【简历解析】解析失败", e);
            throw new RuntimeException("简历解析失败: " + e.getMessage(), e);
        }
    }

    /**
     * 保存候选人信息到文件（用户隔离）
     */
    private static void saveCandidateInfo(Map<String, Object> candidate) {
        try {
            String userResumePath = getCurrentUserResumePath();
            log.info("【简历解析】保存简历到用户路径: {}", userResumePath);

            // 确保目录存在
            File file = new File(userResumePath);
            if (!file.getParentFile().exists()) {
                file.getParentFile().mkdirs();
            }

            // 转换为格式化的JSON
            ObjectMapper mapper = new ObjectMapper();
            String jsonString = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(candidate);

            // 写入文件
            try (FileWriter writer = new FileWriter(file)) {
                writer.write(jsonString);
            }

            log.info("【简历解析】候选人信息已保存到: {}", userResumePath);

        } catch (Exception e) {
            log.error("【简历解析】保存候选人信息失败", e);
            throw new RuntimeException("保存失败: " + e.getMessage(), e);
        }
    }

    /**
     * 从文件加载候选人信息（用户隔离）
     */
    public static Map<String, Object> loadCandidateInfo() {
        try {
            String userResumePath = getCurrentUserResumePath();
            log.info("【简历解析】加载用户简历: {}", userResumePath);

            File file = new File(userResumePath);
            if (!file.exists()) {
                log.warn("【简历解析】用户简历文件不存在: {}", userResumePath);
                return null;
            }

            String jsonString = Files.readString(Paths.get(userResumePath));
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

    /**
     * 检查是否已上传简历（用户隔离）
     */
    public static boolean hasCandidateResume() {
        try {
            String userResumePath = getCurrentUserResumePath();
            File file = new File(userResumePath);
            return file.exists() && file.length() > 0;
        } catch (Exception e) {
            log.warn("【简历解析】检查简历存在性失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 删除候选人简历（用户隔离）
     */
    public static void deleteCandidateResume() {
        try {
            String userResumePath = getCurrentUserResumePath();
            File file = new File(userResumePath);
            if (file.exists()) {
                file.delete();
                log.info("【简历解析】已删除用户简历: {}", userResumePath);
            }
        } catch (Exception e) {
            log.error("【简历解析】删除用户简历失败: {}", e.getMessage());
        }
    }

    /**
     * 解析AI返回的JSON响应
     */
    private static Map<String, Object> parseJsonResponse(String aiResponse) {
        try {
            // 提取JSON部分
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
            List<String> skills = new ArrayList<>();
            if (skillsArray != null) {
                for (int i = 0; i < skillsArray.length(); i++) {
                    skills.add(skillsArray.getString(i));
                }
            }
            result.put("skills", skills);

            // 提取核心优势数组
            JSONArray strengthsArray = jsonObject.optJSONArray("core_strengths");
            List<String> strengths = new ArrayList<>();
            if (strengthsArray != null) {
                for (int i = 0; i < strengthsArray.length(); i++) {
                    strengths.add(strengthsArray.getString(i));
                }
            }
            result.put("core_strengths", strengths);

            // 提取置信度信息
            JSONObject confidenceObject = jsonObject.optJSONObject("confidence");
            Map<String, Double> confidence = new HashMap<>();
            if (confidenceObject != null) {
                confidence.put("name", confidenceObject.optDouble("name", 0.0));
                confidence.put("skills", confidenceObject.optDouble("skills", 0.0));
                confidence.put("experience", confidenceObject.optDouble("experience", 0.0));
            }
            result.put("confidence", confidence);

            return result;

        } catch (Exception e) {
            log.error("【简历解析】解析JSON响应失败: {}", aiResponse, e);
            throw new RuntimeException("解析AI响应失败: " + e.getMessage(), e);
        }
    }

    /**
     * 从AI响应中提取JSON部分
     */
    private static String extractJsonFromResponse(String response) {
        // 查找JSON开始和结束位置
        int startIndex = response.indexOf("{");
        int endIndex = response.lastIndexOf("}");

        if (startIndex == -1 || endIndex == -1 || startIndex >= endIndex) {
            // 如果没有找到完整的JSON，尝试查找代码块中的JSON
            if (response.contains("```json")) {
                startIndex = response.indexOf("{", response.indexOf("```json"));
                endIndex = response.lastIndexOf("}", response.indexOf("```", startIndex + 1));
            }

            if (startIndex == -1 || endIndex == -1 || startIndex >= endIndex) {
                throw new RuntimeException("无法从响应中提取JSON: " + response);
            }
        }

        return response.substring(startIndex, endIndex + 1);
    }
}
