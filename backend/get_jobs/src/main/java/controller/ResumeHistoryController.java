package controller;

import dto.ApiResponse;
import entity.ResumeHistory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import repository.ResumeHistoryRepository;
import util.UserContextUtil;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 简历优化历史记录控制器
 * ✅ 修复：所有API都按用户ID过滤，确保数据隔离
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-25
 */
@RestController
@RequestMapping("/api/resume/history")
@Slf4j
public class ResumeHistoryController {

    @Autowired
    private ResumeHistoryRepository resumeHistoryRepository;

    /**
     * 获取简历历史记录列表（分页）
     * GET /api/resume/history?page=1&pageSize=20
     * ✅ 修复：只返回当前用户的历史记录
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHistory(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        try {
            // ✅ 关键：获取当前登录用户ID
            if (!UserContextUtil.hasCurrentUser()) {
                log.warn("❌ 用户未登录，无法获取简历历史记录");
                return ResponseEntity.status(401)
                    .body(ApiResponse.error("需要登录认证"));
            }

            String userId = UserContextUtil.getCurrentUserId();
            log.info("📋 获取简历历史记录: userId={}, page={}, pageSize={}", userId, page, pageSize);

            // 创建分页对象（page从1开始，需要减1）
            Pageable pageable = PageRequest.of(page - 1, pageSize);

            // ✅ 关键：只查询当前用户的数据
            Page<ResumeHistory> historyPage = resumeHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

            Map<String, Object> data = new HashMap<>();
            data.put("items", historyPage.getContent());
            data.put("total", historyPage.getTotalElements());
            data.put("page", page);
            data.put("pageSize", pageSize);
            data.put("totalPages", historyPage.getTotalPages());

            log.info("✅ 获取简历历史记录成功: userId={}, total={}", userId, historyPage.getTotalElements());
            return ResponseEntity.ok(ApiResponse.success(data, "获取历史记录成功"));

        } catch (Exception e) {
            log.error("获取简历历史记录失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("获取历史记录失败: " + e.getMessage()));
        }
    }

    /**
     * 创建简历历史记录
     * POST /api/resume/history
     * ✅ 修复：自动关联当前用户ID
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ResumeHistory>> createHistory(
            @RequestBody Map<String, Object> request) {
        try {
            // ✅ 关键：获取当前登录用户ID
            if (!UserContextUtil.hasCurrentUser()) {
                log.warn("❌ 用户未登录，无法创建简历历史记录");
                return ResponseEntity.status(401)
                    .body(ApiResponse.error("需要登录认证"));
            }

            String userId = UserContextUtil.getCurrentUserId();
            log.info("📝 创建简历历史记录: userId={}", userId);

            // 构建历史记录对象
            ResumeHistory history = ResumeHistory.builder()
                .userId(userId) // ✅ 关键：自动设置用户ID
                .type((String) request.getOrDefault("type", "优化"))
                .score(request.containsKey("score") ? (Integer) request.get("score") : null)
                .exportCount(0)
                .downloadUrl((String) request.get("downloadUrl"))
                .meta(request.containsKey("meta") ?
                    new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(request.get("meta")) : null)
                .createdAt(LocalDateTime.now())
                .build();

            ResumeHistory saved = resumeHistoryRepository.save(history);

            log.info("✅ 创建简历历史记录成功: id={}, userId={}", saved.getId(), userId);
            return ResponseEntity.ok(ApiResponse.success(saved, "创建历史记录成功"));

        } catch (Exception e) {
            log.error("创建简历历史记录失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("创建历史记录失败: " + e.getMessage()));
        }
    }

    /**
     * 获取单条历史记录
     * GET /api/resume/history/{id}
     * ✅ 修复：验证记录属于当前用户
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeHistory>> getHistoryById(@PathVariable Long id) {
        try {
            // ✅ 关键：获取当前登录用户ID
            if (!UserContextUtil.hasCurrentUser()) {
                log.warn("❌ 用户未登录，无法获取简历历史记录");
                return ResponseEntity.status(401)
                    .body(ApiResponse.error("需要登录认证"));
            }

            String userId = UserContextUtil.getCurrentUserId();

            // ✅ 关键：只查询属于当前用户的记录
            ResumeHistory history = resumeHistoryRepository.findByUserIdAndId(userId, id);

            if (history == null) {
                log.warn("⚠️ 历史记录不存在或不属于当前用户: id={}, userId={}", id, userId);
                return ResponseEntity.status(404)
                    .body(ApiResponse.notFound("历史记录不存在"));
            }

            log.info("✅ 获取简历历史记录成功: id={}, userId={}", id, userId);
            return ResponseEntity.ok(ApiResponse.success(history, "获取历史记录成功"));

        } catch (Exception e) {
            log.error("获取简历历史记录失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("获取历史记录失败: " + e.getMessage()));
        }
    }

    /**
     * 更新历史记录（增加导出次数）
     * PATCH /api/resume/history/{id}/export
     * ✅ 修复：验证记录属于当前用户
     */
    @PatchMapping("/{id}/export")
    public ResponseEntity<ApiResponse<Void>> incrementExport(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> request) {
        try {
            // ✅ 关键：获取当前登录用户ID
            if (!UserContextUtil.hasCurrentUser()) {
                log.warn("❌ 用户未登录，无法更新简历历史记录");
                return ResponseEntity.status(401)
                    .body(ApiResponse.error("需要登录认证"));
            }

            String userId = UserContextUtil.getCurrentUserId();

            // ✅ 关键：只查询属于当前用户的记录
            ResumeHistory history = resumeHistoryRepository.findByUserIdAndId(userId, id);

            if (history == null) {
                log.warn("⚠️ 历史记录不存在或不属于当前用户: id={}, userId={}", id, userId);
                return ResponseEntity.status(404)
                    .body(ApiResponse.notFound("历史记录不存在"));
            }

            // 增加导出次数
            history.setExportCount((history.getExportCount() == null ? 0 : history.getExportCount()) + 1);

            // 更新下载URL（如果提供）
            if (request != null && request.containsKey("downloadUrl")) {
                history.setDownloadUrl((String) request.get("downloadUrl"));
            }

            resumeHistoryRepository.save(history);

            log.info("✅ 更新简历历史记录导出次数成功: id={}, userId={}, exportCount={}",
                id, userId, history.getExportCount());
            return ResponseEntity.ok(ApiResponse.success("更新成功"));

        } catch (Exception e) {
            log.error("更新简历历史记录失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("更新历史记录失败: " + e.getMessage()));
        }
    }

    /**
     * 更新历史记录的元数据
     * PATCH /api/resume/history/{id}
     * ✅ 修复：验证记录属于当前用户
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeHistory>> updateHistory(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            // ✅ 关键：获取当前登录用户ID
            if (!UserContextUtil.hasCurrentUser()) {
                log.warn("❌ 用户未登录，无法更新简历历史记录");
                return ResponseEntity.status(401)
                    .body(ApiResponse.error("需要登录认证"));
            }

            String userId = UserContextUtil.getCurrentUserId();

            // ✅ 关键：只查询属于当前用户的记录
            ResumeHistory history = resumeHistoryRepository.findByUserIdAndId(userId, id);

            if (history == null) {
                log.warn("⚠️ 历史记录不存在或不属于当前用户: id={}, userId={}", id, userId);
                return ResponseEntity.status(404)
                    .body(ApiResponse.notFound("历史记录不存在"));
            }

            // 更新元数据
            if (request.containsKey("meta")) {
                String metaJson = new com.fasterxml.jackson.databind.ObjectMapper()
                    .writeValueAsString(request.get("meta"));
                history.setMeta(metaJson);
            }

            ResumeHistory updated = resumeHistoryRepository.save(history);

            log.info("✅ 更新简历历史记录成功: id={}, userId={}", id, userId);
            return ResponseEntity.ok(ApiResponse.success(updated, "更新历史记录成功"));

        } catch (Exception e) {
            log.error("更新简历历史记录失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("更新历史记录失败: " + e.getMessage()));
        }
    }
}

