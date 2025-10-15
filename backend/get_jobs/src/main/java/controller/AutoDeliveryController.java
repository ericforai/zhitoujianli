package controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;

/**
 * 自动投递RESTful API控制器
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */
@RestController
@RequestMapping("/api/delivery")
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://115.190.182.95:3000", "http://115.190.182.95"})
public class AutoDeliveryController {

    private static boolean isRunning = false;
    private static int totalDelivered = 0;
    private static int successfulDelivered = 0;
    private static int failedDelivered = 0;

    /**
     * 启动自动投递
     */
    @PostMapping("/start")
    public ResponseEntity<ApiResponse<Map<String, Object>>> startDelivery() {
        try {
            isRunning = true;
            Map<String, Object> data = new HashMap<>();
            data.put("status", "started");
            data.put("message", "自动投递已启动");
            data.put("startTime", System.currentTimeMillis());

            log.info("✅ 自动投递已启动");
            return ResponseEntity.ok(ApiResponse.success(data, "启动成功"));
        } catch (Exception e) {
            log.error("启动自动投递失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("启动失败: " + e.getMessage()));
        }
    }

    /**
     * 停止自动投递
     */
    @PostMapping("/stop")
    public ResponseEntity<ApiResponse<Map<String, Object>>> stopDelivery() {
        try {
            isRunning = false;
            Map<String, Object> data = new HashMap<>();
            data.put("status", "stopped");
            data.put("message", "自动投递已停止");
            data.put("stopTime", System.currentTimeMillis());

            log.info("✅ 自动投递已停止");
            return ResponseEntity.ok(ApiResponse.success(data, "停止成功"));
        } catch (Exception e) {
            log.error("停止自动投递失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("停止失败: " + e.getMessage()));
        }
    }

    /**
     * 获取投递状态
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDeliveryStatus() {
        try {
            Map<String, Object> data = new HashMap<>();
            data.put("isRunning", isRunning);
            data.put("totalDelivered", totalDelivered);
            data.put("successfulDelivered", successfulDelivered);
            data.put("failedDelivered", failedDelivered);

            return ResponseEntity.ok(ApiResponse.success(data, "获取状态成功"));
        } catch (Exception e) {
            log.error("获取投递状态失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("获取状态失败: " + e.getMessage()));
        }
    }

    /**
     * 获取投递记录
     */
    @GetMapping("/records")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDeliveryRecords() {
        try {
            // 返回空列表，后续可以对接真实的数据库
            List<Map<String, Object>> records = new ArrayList<>();
            return ResponseEntity.ok(ApiResponse.success(records, "获取记录成功"));
        } catch (Exception e) {
            log.error("获取投递记录失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("获取记录失败: " + e.getMessage()));
        }
    }

    /**
     * 获取投递统计
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDeliveryStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalDeliveries", totalDelivered);
            stats.put("successfulDeliveries", successfulDelivered);
            stats.put("failedDeliveries", failedDelivered);
            stats.put("hrReplies", 0);
            stats.put("interviewInvitations", 0);
            stats.put("rejections", 0);
            stats.put("deliverySuccessRate", totalDelivered > 0 ? (double) successfulDelivered / totalDelivered : 0);
            stats.put("hrReplyRate", 0.0);
            stats.put("interviewInvitationRate", 0.0);
            stats.put("todayDeliveries", 0);
            stats.put("weeklyDeliveries", 0);
            stats.put("monthlyDeliveries", 0);
            stats.put("averageMatchScore", 0.0);
            stats.put("timeRange", "all");
            stats.put("lastUpdated", System.currentTimeMillis());

            return ResponseEntity.ok(ApiResponse.success(stats, "获取统计成功"));
        } catch (Exception e) {
            log.error("获取投递统计失败", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("获取统计失败: " + e.getMessage()));
        }
    }
}


