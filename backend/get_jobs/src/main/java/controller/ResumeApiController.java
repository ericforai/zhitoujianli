package controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import ai.CandidateResumeService;
import ai.ResumeParser;
import dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;

/**
 * 简历管理RESTful API控制器（前后端分离版本）
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */
@RestController
@RequestMapping("/api/resume")
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://115.190.182.95:3000", "http://115.190.182.95"})
public class ResumeApiController {

    private final ResumeParser resumeParser = new ResumeParser();

    /**
     * 检查简历是否存在
     */
    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkResume() {
        try {
            boolean hasResume = CandidateResumeService.hasCandidateResume();
            Map<String, Object> data = new HashMap<>();
            data.put("hasResume", hasResume);

            return ResponseEntity.ok(ApiResponse.success(data, "简历检查完成"));
        } catch (Exception e) {
            log.error("检查简历失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("检查简历失败: " + e.getMessage()));
        }
    }

    /**
     * 获取简历信息
     */
    @GetMapping("/info")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getResumeInfo() {
        try {
            Map<String, Object> candidateData = CandidateResumeService.loadCandidateInfo();

            if (candidateData == null) {
                return ResponseEntity.status(404)
                    .body(ApiResponse.notFound("未找到简历信息"));
            }

            return ResponseEntity.ok(ApiResponse.success(candidateData, "简历信息获取成功"));
        } catch (Exception e) {
            log.error("获取简历信息失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("获取简历信息失败: " + e.getMessage()));
        }
    }

    /**
     * 上传简历文件并解析（核心功能）
     *
     * 遵循规则：
     * 1. 一次解析，永久保存
     * 2. 生成ResumeProfile存储到文件系统
     * 3. 生成DefaultGreeting作为通用模板
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadResume(
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest("文件不能为空"));
            }

            String fileName = file.getOriginalFilename();
            log.info("【简历上传】开始处理文件: {}, 大小: {} bytes", fileName, file.getSize());

            // 检查文件类型
            if (!isValidResumeFile(fileName)) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest("不支持的文件类型，请上传txt、doc、docx或pdf文件"));
            }

            // 提取文件文本内容
            String resumeText = extractTextFromFile(file);
            if (resumeText == null || resumeText.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest("无法从文件中提取文本内容"));
            }

            log.info("【简历上传】文本提取成功，长度: {}", resumeText.length());

            // 调用AI解析简历 - 这是核心的ResumeProfile生成
            Map<String, Object> candidateInfo = resumeParser.parseResume(resumeText);

            // 保存ResumeProfile到文件系统（永久保存）
            CandidateResumeService.parseAndSaveResume(resumeText);

            // 生成默认打招呼语（用户可编辑的通用模板）
            String defaultGreeting = generateDefaultGreeting(candidateInfo);
            candidateInfo.put("defaultGreeting", defaultGreeting);

            // 添加文件元信息
            candidateInfo.put("fileName", fileName);
            candidateInfo.put("fileSize", file.getSize());
            candidateInfo.put("uploadTime", System.currentTimeMillis());

            log.info("【简历上传】解析完成，候选人: {}", candidateInfo.get("name"));
            return ResponseEntity.ok(ApiResponse.success(candidateInfo, "简历上传并解析成功"));

        } catch (Exception e) {
            log.error("【简历上传】上传解析失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("简历上传解析失败: " + e.getMessage()));
        }
    }

    /**
     * 解析简历文本
     *
     * 同样遵循核心规则：一次解析，永久保存
     */
    @PostMapping("/parse")
    public ResponseEntity<ApiResponse<Map<String, Object>>> parseResume(
            @RequestBody Map<String, String> request) {
        try {
            String resumeText = request.get("resume_text");
            if (resumeText == null || resumeText.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest("简历文本不能为空"));
            }

            log.info("【简历解析】开始解析文本，长度: {}", resumeText.length());

            // 调用AI解析简历
            Map<String, Object> candidateInfo = resumeParser.parseResume(resumeText);

            // 保存ResumeProfile到文件系统
            CandidateResumeService.parseAndSaveResume(resumeText);

            // 生成默认打招呼语
            String defaultGreeting = generateDefaultGreeting(candidateInfo);
            candidateInfo.put("defaultGreeting", defaultGreeting);

            log.info("【简历解析】解析完成，候选人: {}", candidateInfo.get("name"));
            return ResponseEntity.ok(ApiResponse.success(candidateInfo, "简历解析成功"));

        } catch (Exception e) {
            log.error("解析简历失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("解析简历失败: " + e.getMessage()));
        }
    }

    /**
     * 删除简历
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteResume() {
        try {
            CandidateResumeService.deleteCandidateResume();
            return ResponseEntity.ok(ApiResponse.success("简历已删除"));
        } catch (Exception e) {
            log.error("删除简历失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("删除简历失败: " + e.getMessage()));
        }
    }

    /**
     * 检查文件类型是否合法
     */
    private boolean isValidResumeFile(String fileName) {
        if (fileName == null) {
            return false;
        }
        String lowerFileName = fileName.toLowerCase();
        return lowerFileName.endsWith(".txt") ||
               lowerFileName.endsWith(".doc") ||
               lowerFileName.endsWith(".docx") ||
               lowerFileName.endsWith(".pdf");
    }

    /**
     * 从文件中提取文本内容
     */
    private String extractTextFromFile(MultipartFile file) throws IOException {
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            return "";
        }

        String lowerFileName = fileName.toLowerCase();

        if (lowerFileName.endsWith(".txt")) {
            return new String(file.getBytes(), "UTF-8");
        } else if (lowerFileName.endsWith(".pdf")) {
            try (PDDocument document = PDDocument.load(file.getInputStream())) {
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document);
            }
        } else if (lowerFileName.endsWith(".doc")) {
            try (HWPFDocument document = new HWPFDocument(file.getInputStream())) {
                WordExtractor extractor = new WordExtractor(document);
                return extractor.getText();
            }
        } else if (lowerFileName.endsWith(".docx")) {
            try (XWPFDocument document = new XWPFDocument(file.getInputStream())) {
                XWPFWordExtractor extractor = new XWPFWordExtractor(document);
                return extractor.getText();
            }
        }

        return "";
    }

    /**
     * 生成默认打招呼语（通用模板）
     *
     * 这是用户的fallback模板，在无法生成智能语时使用
     */
    private String generateDefaultGreeting(Map<String, Object> candidateInfo) {
        try {
            log.info("【DefaultGreeting】开始生成默认打招呼语");
            // String greeting = SmartGreetingService.generateDefaultGreeting(candidateInfo);
            String greeting = "您好！我对贵司的职位很感兴趣，希望能有机会进一步交流。";
            log.info("【DefaultGreeting】生成成功，长度: {}", greeting.length());
            return greeting;
        } catch (Exception e) {
            log.error("【DefaultGreeting】生成失败", e);
            // 返回一个基础的模板
            String name = (String) candidateInfo.getOrDefault("name", "候选人");
            String title = (String) candidateInfo.getOrDefault("current_title", "专业人士");
            return String.format("您好！我是%s，一名%s。对贵司的职位很感兴趣，希望能有机会进一步交流。", name, title);
        }
    }
}
