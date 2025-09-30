package ai;

import lombok.extern.slf4j.Slf4j;

import java.util.Map;
import java.util.List;
import java.util.concurrent.*;

/**
 * 智能打招呼语生成服务
 * 
 * Stage B: JD匹配与打招呼语生成 - 每次投递时调用
 * 
 * @author AI Assistant
 */
@Slf4j
public class SmartGreetingService {

    /**
     * AI超时时间：5分钟（300秒）
     */
    private static final int AI_TIMEOUT_SECONDS = 300;
    
    /**
     * Stage B - JD匹配与打招呼语生成Prompt（System）
     */
    private static final String GREETING_GENERATION_SYSTEM_PROMPT = """
        你是资深HR顾问，专门为求职者生成个性化打招呼语。
        
        输入包含：
        1. candidate JSON（已结构化的简历）
        2. job_description 文本（岗位要求）
        
        你的任务：
        深度分析候选人与岗位的匹配点，生成一段打招呼语（200字以内），要求：
        - 开头礼貌问候（使用"您好"即可，不要提及候选人姓名）
        - 明确表达对岗位的兴趣
        - 融入2-3个岗位关键词
        - 突出2-3个核心匹配优势
        - 强调能为团队带来的即时贡献
        - 表达进一步沟通的意愿
        - 语气真诚专业，不套路
        - 不得编造没有证据的量化数字；如无量化信息则使用非具体但可信的表述
        - 【重要】全文不得出现候选人的真实姓名，保护隐私
        
        输出格式：
        直接返回打招呼语文本，不要任何解释、分析、JSON格式或其他内容。
        """;

    /**
     * 生成智能打招呼语（带超时控制）
     * 
     * @param candidate 候选人信息JSON
     * @param jobName 岗位名称
     * @param fullJobDescription 完整岗位描述
     * @return 生成的打招呼语，如果超时或失败返回null
     */
    public static String generateSmartGreeting(Map<String, Object> candidate, String jobName, String fullJobDescription) {
        if (candidate == null || fullJobDescription == null || fullJobDescription.trim().isEmpty()) {
            log.warn("【智能打招呼】候选人信息或岗位描述为空，无法生成");
            return null;
        }
        
        // 使用ExecutorService实现超时控制
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<String> future = executor.submit(() -> {
            return generateGreetingInternal(candidate, jobName, fullJobDescription);
        });
        
        try {
            log.info("【智能打招呼】开始生成，岗位: {}，超时设置: {}秒", jobName, AI_TIMEOUT_SECONDS);
            long startTime = System.currentTimeMillis();
            
            // 等待AI响应，最长5分钟
            String greeting = future.get(AI_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            
            long duration = (System.currentTimeMillis() - startTime) / 1000;
            log.info("【智能打招呼】生成成功，耗时: {}秒，长度: {}字", duration, greeting.length());
            
            return greeting;
            
        } catch (TimeoutException e) {
            log.error("【智能打招呼】AI响应超时（超过{}秒），使用默认招呼语", AI_TIMEOUT_SECONDS);
            future.cancel(true);
            return null;
            
        } catch (Exception e) {
            log.error("【智能打招呼】生成失败: {}", e.getMessage(), e);
            return null;
            
        } finally {
            executor.shutdownNow();
        }
    }

    /**
     * 内部实现：生成打招呼语
     */
    private static String generateGreetingInternal(Map<String, Object> candidate, String jobName, String fullJobDescription) {
        try {
            // 构建User Prompt
            String userPrompt = buildUserPrompt(candidate, jobName, fullJobDescription);
            
            log.info("【智能打招呼】调用AI服务，岗位: {}", jobName);
            
            // 调用AI服务
            String fullPrompt = GREETING_GENERATION_SYSTEM_PROMPT + "\n\n" + userPrompt;
            String aiResponse = AiService.sendRequest(fullPrompt);
            
            if (aiResponse == null || aiResponse.trim().isEmpty()) {
                throw new RuntimeException("AI服务返回空响应");
            }
            
            // 清理响应（移除可能的JSON格式、代码块等）
            String greeting = cleanGreetingResponse(aiResponse);
            
            // 验证长度
            if (greeting.length() > 300) {
                log.warn("【智能打招呼】生成的打招呼语过长（{}字），截取前200字", greeting.length());
                greeting = greeting.substring(0, 200) + "...";
            }
            
            return greeting;
            
        } catch (Exception e) {
            log.error("【智能打招呼】内部生成失败", e);
            throw new RuntimeException("生成失败: " + e.getMessage(), e);
        }
    }

    /**
     * 构建User Prompt
     */
    private static String buildUserPrompt(Map<String, Object> candidate, String jobName, String fullJobDescription) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("【候选人简历】\n");
        prompt.append("当前职位：").append(candidate.get("current_title")).append("\n");
        prompt.append("工作年限：").append(candidate.get("years_experience")).append("年\n");
        
        // 核心优势
        @SuppressWarnings("unchecked")
        List<String> coreStrengths = (List<String>) candidate.get("core_strengths");
        if (coreStrengths != null && !coreStrengths.isEmpty()) {
            prompt.append("核心优势：\n");
            for (String strength : coreStrengths) {
                prompt.append("- ").append(strength).append("\n");
            }
        }
        
        // 技能
        @SuppressWarnings("unchecked")
        List<String> skills = (List<String>) candidate.get("skills");
        if (skills != null && !skills.isEmpty()) {
            prompt.append("技能：").append(String.join("、", skills)).append("\n");
        }
        
        prompt.append("\n【目标岗位】\n");
        prompt.append("职位名称：").append(jobName).append("\n");
        prompt.append("岗位要求：\n").append(fullJobDescription).append("\n");
        
        prompt.append("\n【任务要求】\n");
        prompt.append("请生成一段打招呼语（200字内），直接输出文本，不要任何解释。\n");
        
        return prompt.toString();
    }

    /**
     * 清理AI响应，提取纯文本打招呼语
     */
    private static String cleanGreetingResponse(String response) {
        // 移除可能的JSON格式
        if (response.contains("{") && response.contains("}")) {
            try {
                // 尝试解析为JSON
                int start = response.indexOf("{");
                int end = response.lastIndexOf("}") + 1;
                String jsonPart = response.substring(start, end);
                
                // 如果是JSON格式，提取greeting字段
                if (jsonPart.contains("\"greeting\"") || jsonPart.contains("\"content\"")) {
                    return response; // 保持原样，后续手动处理
                }
            } catch (Exception e) {
                // 不是JSON，继续处理
            }
        }
        
        // 移除代码块标记
        response = response.replaceAll("```.*?```", "");
        response = response.replaceAll("```", "");
        
        // 移除可能的前缀说明
        response = response.replaceAll("(?i)^(以下是|打招呼语[：:])\\s*", "");
        
        // 清理多余空格和换行
        response = response.trim();
        
        return response;
    }
}
