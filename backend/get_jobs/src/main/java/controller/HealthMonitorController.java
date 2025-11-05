package controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;
import service.HealthMonitorService;

/**
 * 健康监控控制器
 * 提供系统健康状态、日志、告警等API
 */
@RestController
@RequestMapping("/api/admin/health")
@Slf4j
public class HealthMonitorController {

    @Autowired
    private HealthMonitorService healthMonitorService;

    /**
     * 获取实时健康状态
     * GET /api/admin/health/status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getHealthStatus() {
        try {
            log.debug("获取健康状态");

            Map<String, Object> status = healthMonitorService.getHealthStatus();

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", status
            ));

        } catch (Exception e) {
            log.error("获取健康状态失败", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "获取健康状态失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 获取健康检查日志
     * GET /api/admin/health/logs?limit=50
     */
    @GetMapping("/logs")
    public ResponseEntity<Map<String, Object>> getHealthLogs(
            @RequestParam(defaultValue = "50") int limit) {
        try {
            log.debug("获取健康日志，limit={}", limit);

            List<Map<String, String>> logs = healthMonitorService.getHealthLogs(limit);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", logs,
                "total", logs.size()
            ));

        } catch (Exception e) {
            log.error("获取健康日志失败", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "获取健康日志失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 获取告警日志
     * GET /api/admin/health/alerts?limit=20
     */
    @GetMapping("/alerts")
    public ResponseEntity<Map<String, Object>> getAlertLogs(
            @RequestParam(defaultValue = "20") int limit) {
        try {
            log.debug("获取告警日志，limit={}", limit);

            List<Map<String, String>> alerts = healthMonitorService.getAlertLogs(limit);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", alerts,
                "total", alerts.size()
            ));

        } catch (Exception e) {
            log.error("获取告警日志失败", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "获取告警日志失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 获取系统性能指标
     * GET /api/admin/health/metrics
     */
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getSystemMetrics() {
        try {
            log.debug("获取系统指标");

            Map<String, Object> metrics = healthMonitorService.getSystemMetrics();

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", metrics
            ));

        } catch (Exception e) {
            log.error("获取系统指标失败", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "获取系统指标失败: " + e.getMessage()
            ));
        }
    }

    /**
     * 获取完整的健康监控面板数据
     * GET /api/admin/health/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getHealthDashboard() {
        try {
            log.debug("获取健康监控面板数据");

            Map<String, Object> dashboard = new HashMap<>();

            // 获取所有数据
            dashboard.put("status", healthMonitorService.getHealthStatus());
            dashboard.put("logs", healthMonitorService.getHealthLogs(20));
            dashboard.put("alerts", healthMonitorService.getAlertLogs(10));
            dashboard.put("metrics", healthMonitorService.getSystemMetrics());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", dashboard
            ));

        } catch (Exception e) {
            log.error("获取健康监控面板数据失败", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "获取健康监控面板数据失败: " + e.getMessage()
            ));
        }
    }
}

