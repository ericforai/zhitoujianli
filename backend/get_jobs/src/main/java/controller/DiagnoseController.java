package controller;

import ai.ResumeDiagnoseService;
import dto.ApiResponse;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 简历体检与诊断接口（MVP）
 *
 * 功能：
 * - 接收纯文本简历，调用 AI 服务按规范生成：先 JSON（机器可读），后 Markdown（人类可读）
 * - 解析与容错：若模型未按要求输出，尝试从返回中抽取 JSON 片段；失败则回退到启发式最小报告
 * - 返回统一 ApiResponse，data = { json, markdown, tookMs }
 */
@RestController
@RequestMapping("/api/ai")
@Slf4j
public class DiagnoseController {

    private final ResumeDiagnoseService diagnoseService = new ResumeDiagnoseService();

    @PostMapping("/diagnose")
    public ResponseEntity<ApiResponse<Map<String, Object>>> diagnose(@RequestBody DiagnoseRequest req) {
        long start = System.currentTimeMillis();
        try {
            String requestId = java.util.UUID.randomUUID().toString();
            String text = req.getText() == null ? "" : req.getText().trim();
            if (text.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("简历文本不能为空"));
            }

            ResumeDiagnoseService.DiagnoseResult result =
                    diagnoseService.diagnose(text,
                            emptyTo(req.getLocale(), "zh-CN"),
                            emptyTo(req.getPersona(), ""),
                            req.getMaxPages() == null ? 1 : Math.max(1, Math.min(2, req.getMaxPages()))
                    );

            Map<String, Object> data = new HashMap<>();
            data.put("json", result.json);
            data.put("markdown", result.markdown);
            data.put("tookMs", System.currentTimeMillis() - start);
            data.put("requestId", requestId);
            return ResponseEntity.ok(ApiResponse.success(data, "诊断完成"));
        } catch (Exception e) {
            log.error("诊断失败", e);
            Map<String, Object> data = new HashMap<>();
            data.put("json", diagnoseService.fallbackMinimal());
            data.put("markdown", "诊断服务暂时不可用，已返回基础占位报告。");
            data.put("tookMs", System.currentTimeMillis() - start);
            data.put("requestId", "fallback-" + Long.toHexString(start));
            return ResponseEntity.status(500).body(ApiResponse.success(data, "诊断失败，返回占位报告"));
        }
    }

    private static String emptyTo(String v, String def) {
        return (v == null || v.isBlank()) ? def : v;
    }

    @Data
    public static class DiagnoseRequest {
        private String text;
        private String locale;
        private String persona;
        private Integer maxPages;
    }
}


