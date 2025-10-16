package controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;

/**
 * 状态控制器 - 简化版本
 *
 * 提供基本的API状态检查功能
 * 避免复杂的依赖导致500错误
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-10
 */
@RestController
@RequestMapping("/api")
@Slf4j
public class StatusController {

    /**
     * 获取API状态
     * 简化版本，避免复杂的文件操作
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        try {
            Map<String, Object> status = new HashMap<>();
            status.put("success", true);
            status.put("message", "智投简历后台服务运行中");
            status.put("timestamp", System.currentTimeMillis());
            status.put("version", "1.0.0");
            status.put("isRunning", true);

            log.info("API状态检查成功");
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("获取状态失败", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "获取状态失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 健康检查接口
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(health);
    }
}













