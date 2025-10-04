package controller;

import ai.SmartGreetingService;
import ai.CandidateResumeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 智能打招呼语控制器
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-10-04
 */
@RestController
@RequestMapping("/api/smart-greeting")
@Slf4j
public class SmartGreetingController {

    /**
     * 生成智能打招呼语
     * 
     * @param request 请求参数，包含jobDescription
     * @return 生成的打招呼语
     */
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateGreeting(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String jobDescription = request.get("jobDescription");
            if (jobDescription == null || jobDescription.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "岗位描述不能为空");
                return ResponseEntity.badRequest().body(response);
            }
            
            log.info("【智能打招呼】开始生成打招呼语，岗位描述长度: {}", jobDescription.length());
            
            // 检查是否有候选人简历
            if (!CandidateResumeService.hasCandidateResume()) {
                response.put("success", false);
                response.put("message", "请先上传简历，才能生成智能打招呼语");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 加载候选人信息
            Map<String, Object> candidate = CandidateResumeService.loadCandidateInfo();
            if (candidate == null) {
                response.put("success", false);
                response.put("message", "加载简历信息失败，请重新上传简历");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 生成智能打招呼语
            String greeting = SmartGreetingService.generateSmartGreeting(
                candidate, 
                "目标岗位", // 岗位名称
                jobDescription
            );
            
            if (greeting != null && !greeting.trim().isEmpty()) {
                response.put("success", true);
                response.put("data", greeting);
                response.put("message", "智能打招呼语生成成功");
                log.info("【智能打招呼】生成成功，长度: {}字", greeting.length());
            } else {
                response.put("success", false);
                response.put("message", "智能打招呼语生成失败，请稍后重试");
                log.warn("【智能打招呼】生成失败，返回空结果");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("【智能打招呼】生成异常", e);
            response.put("success", false);
            response.put("message", "生成打招呼语时发生错误: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * 测试AI连接
     * 
     * @return 连接状态
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testConnection() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 简单的测试请求
            String testPrompt = "请回复'测试成功'";
            String result = ai.AiService.sendRequest(testPrompt);
            
            if (result != null && !result.trim().isEmpty()) {
                response.put("success", true);
                response.put("message", "AI服务连接正常");
                response.put("data", result);
            } else {
                response.put("success", false);
                response.put("message", "AI服务无响应");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("【AI测试】连接测试失败", e);
            response.put("success", false);
            response.put("message", "AI服务连接失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
