package controller;

import java.io.File;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;

import ai.AiService;
import ai.CandidateResumeService;
import lombok.extern.slf4j.Slf4j;
import util.UserContextUtil;

/**
 * 候选人简历管理控制器
 *
 * @author AI Assistant
 */
@RestController
@RequestMapping("/api/candidate-resume")
@Slf4j
public class CandidateResumeController {


    /**
     * 检查是否已上传简历
     */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkResume() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("hasResume", CandidateResumeService.hasCandidateResume());
        return ResponseEntity.ok(response);
    }

    /**
     * 加载已有简历
     */
    @GetMapping("/load")
    public ResponseEntity<Map<String, Object>> loadResume() {
        try {
            Map<String, Object> candidate = CandidateResumeService.loadCandidateInfo();

            Map<String, Object> response = new HashMap<>();
            if (candidate != null) {
                response.put("success", true);
                response.put("data", candidate);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "未找到简历文件");
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            log.error("加载简历失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "加载失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 解析简历文本
     */
    @PostMapping("/parse")
    public ResponseEntity<Map<String, Object>> parseResume(@RequestBody Map<String, String> request) {
        try {
            String resumeText = request.get("resume_text");
            if (resumeText == null || resumeText.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "简历文本不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            log.info("【简历管理】开始解析简历，文本长度: {}", resumeText.length());

            // Stage A: 调用AI解析简历
            Map<String, Object> candidateInfo = CandidateResumeService.parseAndSaveResume(resumeText);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", candidateInfo);
            response.put("message", "简历解析成功");

            log.info("【简历管理】简历解析完成: {}", candidateInfo.get("name"));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("【简历管理】简历解析失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "简历解析失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 上传简历文件
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadResume(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "文件不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            String fileName = file.getOriginalFilename();
            log.info("【简历管理】上传简历文件: {}, 大小: {} bytes", fileName, file.getSize());

            // 提取文件文本内容
            String resumeText = extractTextFromFile(file);
            if (resumeText == null || resumeText.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "无法从文件中提取文本内容");
                return ResponseEntity.badRequest().body(response);
            }

            // 调用简历解析
            Map<String, Object> candidateInfo = CandidateResumeService.parseAndSaveResume(resumeText);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", candidateInfo);
            response.put("message", "简历文件解析成功");

            log.info("【简历管理】简历文件解析完成: {}", candidateInfo.get("name"));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("【简历管理】简历文件上传解析失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "简历文件解析失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 删除简历
     */
    @PostMapping("/delete")
    public ResponseEntity<Map<String, Object>> deleteResume() {
        try {
            CandidateResumeService.deleteCandidateResume();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "简历已删除");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("【简历管理】删除简历失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "删除失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 生成默认打招呼语（基于简历）
     */
    @PostMapping("/generate-default-greeting")
    public ResponseEntity<Map<String, Object>> generateDefaultGreeting(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> candidate = (Map<String, Object>) request.get("candidate");

            if (candidate == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "候选人信息不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            log.info("【默认打招呼语】开始生成，候选人: {}", candidate.get("name"));

            // 调用AI生成默认打招呼语
            String greeting = generateDefaultGreetingInternal(candidate);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("greeting", greeting);
            response.put("message", "默认打招呼语生成成功");

            log.info("【默认打招呼语】生成完成，长度: {}字", greeting.length());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("【默认打招呼语】生成失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "生成失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 保存默认打招呼语到配置文件
     */
    @PostMapping("/save-default-greeting")
    public ResponseEntity<Map<String, Object>> saveDefaultGreeting(@RequestBody Map<String, String> request) {
        try {
            String greeting = request.get("greeting");
            if (greeting == null || greeting.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "打招呼语不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            // ✅ 新方案：保存到用户数据目录
            CandidateResumeService.saveDefaultGreeting(greeting);

            // ✅ 同时更新config.json中的boss.sayHi字段
            try {
                String userId = UserContextUtil.getCurrentUserId();
                log.info("【默认打招呼语】当前用户ID: {}", userId);

                // 支持多种用户ID格式的配置文件路径
                String[] possibleUserIds = {
                    userId,  // 原始格式
                    userId.replace("@", "_").replace(".", "_"),  // 安全格式
                    userId.replace("_", "@")  // 邮箱格式
                };

                for (String testUserId : possibleUserIds) {
                    // 更新两个位置的配置文件
                    String[] configPaths = {
                        "user_data/" + testUserId + "/config.json",  // 应用程序工作目录
                        "/root/zhitoujianli/backend/get_jobs/user_data/" + testUserId + "/config.json"  // 开发目录
                    };

                    for (String configPath : configPaths) {
                        File configFile = new File(configPath);

                        if (configFile.exists()) {
                            log.info("【默认打招呼语】找到配置文件: {}", configPath);

                            ObjectMapper mapper = new ObjectMapper();
                            Map<String, Object> config = mapper.readValue(configFile, Map.class);

                            // 🔧 统一字段：使用bossConfig.defaultGreeting
                            @SuppressWarnings("unchecked")
                            Map<String, Object> bossConfig = (Map<String, Object>) config.get("bossConfig");
                            if (bossConfig == null) {
                                bossConfig = new HashMap<>();
                                config.put("bossConfig", bossConfig);
                            }

                            // 更新defaultGreeting字段
                            bossConfig.put("defaultGreeting", greeting);

                            // 保存回文件
                            mapper.writerWithDefaultPrettyPrinter().writeValue(configFile, config);
                            log.info("✅ 【默认打招呼语】已更新到Boss配置: {} -> bossConfig.defaultGreeting", configPath);
                        } else {
                            log.debug("【默认打招呼语】配置文件不存在: {}", configPath);
                        }
                    }
                }
            } catch (Exception configException) {
                log.error("【默认打招呼语】更新Boss配置失败", configException);
                // 不中断主流程，仅记录错误
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "默认打招呼语已保存到Boss配置");

            log.info("【默认打招呼语】已保存到用户数据目录");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("【默认打招呼语】保存失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "保存失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 获取默认打招呼语
     */
    @GetMapping("/get-default-greeting")
    public ResponseEntity<Map<String, Object>> getDefaultGreeting() {
        try {
            String userId = UserContextUtil.getCurrentUserId();
            String greeting = CandidateResumeService.getDefaultGreeting(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("greeting", greeting != null ? greeting : "");

            log.info("【默认打招呼语】获取成功，用户: {}", userId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("【默认打招呼语】获取失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 加载默认打招呼语
     */
    @GetMapping("/load-default-greeting")
    public ResponseEntity<Map<String, Object>> loadDefaultGreeting() {
        try {
            String greeting = CandidateResumeService.loadDefaultGreeting();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("greeting", greeting);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("【默认打招呼语】加载失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "加载失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 内部方法：生成默认打招呼语
     */
    private String generateDefaultGreetingInternal(Map<String, Object> candidate) {
        // 构建AI Prompt
        String systemPrompt = """
            你是资深HR顾问，专门为求职者生成通用的求职打招呼语。

            基于候选人的简历信息，生成一段通用的、适合大多数岗位的打招呼语（200字以内），要求：
            - 开头礼貌问候
            - 简要介绍候选人背景（职位、年限、核心优势）
            - 表达求职意向和贡献价值
            - 表达进一步沟通的意愿
            - 语气真诚专业，不套路
            - 不要提及具体的岗位名称或公司

            输出格式：
            直接返回打招呼语文本，不要任何解释、分析或其他内容。
            """;

        StringBuilder userPrompt = new StringBuilder();
        userPrompt.append("【候选人信息】%n");
        userPrompt.append("姓名：").append(candidate.get("name")).append("%n");
        userPrompt.append("当前职位：").append(candidate.get("current_title")).append("%n");
        userPrompt.append("工作年限：").append(candidate.get("years_experience")).append("年%n");

        @SuppressWarnings("unchecked")
        List<String> coreStrengths = (List<String>) candidate.get("core_strengths");
        if (coreStrengths != null && !coreStrengths.isEmpty()) {
            userPrompt.append("核心优势：%n");
            for (String strength : coreStrengths) {
                userPrompt.append("- ").append(strength).append("%n");
            }
        }

        @SuppressWarnings("unchecked")
        List<String> skills = (List<String>) candidate.get("skills");
        if (skills != null && !skills.isEmpty()) {
            userPrompt.append("技能：").append(String.join("、", skills)).append("%n");
        }

        userPrompt.append("%n请生成通用的打招呼语。%n");

        // 调用AI服务
        String fullPrompt = systemPrompt + "%n%n" + userPrompt.toString();
        String aiResponse = AiService.sendRequest(fullPrompt);

        if (aiResponse == null || aiResponse.trim().isEmpty()) {
            throw new RuntimeException("AI服务返回空响应");
        }

        // 清理响应
        String greeting = aiResponse.trim();
        greeting = greeting.replaceAll("^(以下是|打招呼语[：:])\\s*", "");
        greeting = greeting.replaceAll("```.*?```", "");
        greeting = greeting.replaceAll("```", "");

        return greeting;
    }

    /**
     * 从文件中提取文本内容
     * 支持 TXT、PDF、DOC、DOCX 格式
     */
    private String extractTextFromFile(MultipartFile file) {
        try {
            String fileName = file.getOriginalFilename();
            if (fileName == null) {
                log.error("【文件解析】文件名为空");
                throw new RuntimeException("文件名为空");
            }

            String lowerFileName = fileName.toLowerCase();
            log.info("【文件解析】开始解析文件: {}, 大小: {} bytes, 类型: {}",
                fileName, file.getSize(), file.getContentType());

            String content = null;

            // TXT文件
            if (lowerFileName.endsWith(".txt")) {
                content = new String(file.getBytes(), StandardCharsets.UTF_8);
                log.info("【文件解析】TXT文件解析成功，长度: {} 字符", content.length());

            // PDF文件
            } else if (lowerFileName.endsWith(".pdf")) {
                try (InputStream inputStream = file.getInputStream();
                     PDDocument document = PDDocument.load(inputStream)) {

                    PDFTextStripper stripper = new PDFTextStripper();
                    content = stripper.getText(document);
                    log.info("【文件解析】PDF文件解析成功，页数: {}, 长度: {} 字符",
                        document.getNumberOfPages(), content.length());
                }

            // DOCX文件（Word 2007+）
            } else if (lowerFileName.endsWith(".docx")) {
                try (InputStream inputStream = file.getInputStream();
                     XWPFDocument document = new XWPFDocument(inputStream);
                     XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {

                    content = extractor.getText();
                    log.info("【文件解析】DOCX文件解析成功，长度: {} 字符", content.length());
                }

            // DOC文件（Word 97-2003）
            } else if (lowerFileName.endsWith(".doc")) {
                try (InputStream inputStream = file.getInputStream();
                     HWPFDocument document = new HWPFDocument(inputStream);
                     WordExtractor extractor = new WordExtractor(document)) {

                    content = extractor.getText();
                    log.info("【文件解析】DOC文件解析成功，长度: {} 字符", content.length());
                }

            } else {
                log.error("【文件解析】不支持的文件格式: {}", fileName);
                throw new RuntimeException("不支持的文件格式，请上传 TXT、PDF、DOC 或 DOCX 文件");
            }

            // 验证内容
            if (content == null || content.trim().isEmpty()) {
                throw new RuntimeException("文件内容为空或无法提取文本");
            }

            // 清理内容
            content = content.trim();
            log.info("【文件解析】文件解析完成，最终内容长度: {} 字符", content.length());

            return content;

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("【文件解析】提取文件文本失败", e);
            throw new RuntimeException("文件解析失败: " + e.getMessage() + "。请确保文件格式正确且未损坏。");
        }
    }

}
