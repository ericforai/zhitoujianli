package controller;

import ai.ResumeParser;
import ai.GreetingGenerator;
import annotation.CheckQuota;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * 智能简历解析与岗位打招呼语生成控制器
 * 
 * @author AI Assistant
 */
@RestController
@RequestMapping("/api")
@Slf4j
public class ResumeController {

    private final ResumeParser resumeParser;
    private final GreetingGenerator greetingGenerator;

    public ResumeController() {
        this.resumeParser = new ResumeParser();
        this.greetingGenerator = new GreetingGenerator();
    }

    /**
     * Stage A - 简历解析接口
     * 
     * @param resumeText 简历文本
     * @return 解析后的候选人信息
     */
    @PostMapping("/parse_resume")
    @CheckQuota(quotaKey = "ai_resume_optimize_monthly", amount = 1, 
                message = "AI简历优化配额已用完，请升级套餐或等待下月重置")
    public ResponseEntity<Map<String, Object>> parseResume(@RequestBody Map<String, String> request) {
        try {
            String resumeText = request.get("resume_text");
            if (resumeText == null || resumeText.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "简历文本不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            log.info("开始解析简历，文本长度: {}", resumeText.length());
            
            // 调用AI解析简历
            Map<String, Object> candidateInfo = resumeParser.parseResume(resumeText);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", candidateInfo);
            response.put("message", "简历解析成功");
            
            log.info("简历解析完成: {}", candidateInfo.get("name"));
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("简历解析失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "简历解析失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Stage B - JD匹配与打招呼语生成
     * 
     * @param request 包含候选人信息和岗位JD的请求
     * @return 生成的打招呼语
     */
    @PostMapping("/generate_greetings")
    @CheckQuota(quotaKey = "ai_greeting_generate_monthly", amount = 1,
                message = "AI打招呼生成配额已用完，请升级套餐或等待下月重置")
    public ResponseEntity<Map<String, Object>> generateGreetings(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> candidate = (Map<String, Object>) request.get("candidate");
            String jobDescription = (String) request.get("job_description");
            String mode = (String) request.getOrDefault("mode", "production");

            if (candidate == null || jobDescription == null || jobDescription.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "候选人信息和岗位描述不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            log.info("开始生成打招呼语，候选人: {}, 模式: {}", candidate.get("name"), mode);
            
            // 调用AI生成打招呼语
            Map<String, Object> greetings = greetingGenerator.generateGreetings(candidate, jobDescription, mode);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", greetings);
            response.put("message", "打招呼语生成成功");
            
            log.info("打招呼语生成完成");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("打招呼语生成失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "打招呼语生成失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 文件上传接口（支持txt/doc/pdf）
     * 
     * @param file 上传的简历文件
     * @return 解析后的候选人信息
     */
    @PostMapping("/upload_resume")
    @CheckQuota(quotaKey = "file_upload_size", amount = 1,
                message = "文件上传配额已用完，请升级套餐获得更大上传空间")
    public ResponseEntity<Map<String, Object>> uploadResume(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "文件不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            String fileName = file.getOriginalFilename();
            String contentType = file.getContentType();
            
            log.info("上传简历文件: {}, 类型: {}, 大小: {} bytes", fileName, contentType, file.getSize());

            // 检查文件类型
            if (!isValidResumeFile(fileName, contentType)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "不支持的文件类型，请上传txt、doc或pdf文件");
                return ResponseEntity.badRequest().body(response);
            }

            // 提取文件文本内容
            String resumeText = extractTextFromFile(file);
            if (resumeText == null || resumeText.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "无法从文件中提取文本内容");
                return ResponseEntity.badRequest().body(response);
            }

            // 调用简历解析
            Map<String, Object> candidateInfo = resumeParser.parseResume(resumeText);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", candidateInfo);
            response.put("message", "简历文件解析成功");
            
            log.info("简历文件解析完成: {}", candidateInfo.get("name"));
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("简历文件上传解析失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "简历文件解析失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 检查文件类型是否有效
     */
    private boolean isValidResumeFile(String fileName, String contentType) {
        if (fileName == null) return false;
        
        String lowerFileName = fileName.toLowerCase();
        return lowerFileName.endsWith(".txt") || 
               lowerFileName.endsWith(".doc") || 
               lowerFileName.endsWith(".docx") || 
               lowerFileName.endsWith(".pdf");
    }

    /**
     * 从文件中提取文本内容
     */
    private String extractTextFromFile(MultipartFile file) {
        try {
            String fileName = file.getOriginalFilename();
            if (fileName == null) return null;
            
            String lowerFileName = fileName.toLowerCase();
            
            if (lowerFileName.endsWith(".txt")) {
                return new String(file.getBytes(), "UTF-8");
            } else if (lowerFileName.endsWith(".doc") || lowerFileName.endsWith(".docx")) {
                // TODO: 实现DOC/DOCX文件解析
                // 可以使用Apache POI库
                return "DOC文件解析功能待实现";
            } else if (lowerFileName.endsWith(".pdf")) {
                // TODO: 实现PDF文件解析
                // 可以使用Apache PDFBox库
                return "PDF文件解析功能待实现";
            }
            
            return null;
        } catch (Exception e) {
            log.error("提取文件文本失败", e);
            return null;
        }
    }
}
