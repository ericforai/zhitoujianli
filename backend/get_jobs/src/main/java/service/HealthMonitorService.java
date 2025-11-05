package service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.lang.management.ManagementFactory;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.sun.management.OperatingSystemMXBean;

import lombok.extern.slf4j.Slf4j;

/**
 * 健康监控服务
 * 读取健康监控日志和系统状态
 */
@Service
@Slf4j
public class HealthMonitorService {

    private static final String HEALTH_LOG_FILE = "/opt/zhitoujianli/logs/health-monitor.log";
    private static final String ALERT_LOG_FILE = "/opt/zhitoujianli/logs/health-alerts.log";
    private static final String PRE_START_LOG_FILE = "/opt/zhitoujianli/logs/pre-start-cleanup.log";

    private static final DateTimeFormatter LOG_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * 获取实时健康状态
     */
    public Map<String, Object> getHealthStatus() {
        Map<String, Object> status = new HashMap<>();

        try {
            // 1. 检查端口监听
            boolean portListening = checkPortListening(8080);

            // 2. 读取最近的健康检查结果
            String lastCheckResult = getLastHealthCheckResult();

            // 3. 检查是否有最近的告警
            int recentAlerts = getRecentAlertCount(24); // 最近24小时

            // 4. 获取服务运行时长
            long uptime = getServiceUptime();

            // 5. 确定整体状态
            String healthStatus;
            String statusColor;
            if (!portListening) {
                healthStatus = "异常";
                statusColor = "red";
            } else if (recentAlerts > 5) {
                healthStatus = "警告";
                statusColor = "yellow";
            } else if (lastCheckResult != null && lastCheckResult.contains("✅")) {
                healthStatus = "正常";
                statusColor = "green";
            } else {
                healthStatus = "未知";
                statusColor = "gray";
            }

            status.put("status", healthStatus);
            status.put("statusColor", statusColor);
            status.put("portListening", portListening);
            status.put("lastCheckResult", lastCheckResult);
            status.put("recentAlerts", recentAlerts);
            status.put("uptimeSeconds", uptime);
            status.put("uptimeFormatted", formatUptime(uptime));
            status.put("timestamp", LocalDateTime.now().format(LOG_TIME_FORMAT));

        } catch (Exception e) {
            log.error("获取健康状态失败", e);
            status.put("status", "错误");
            status.put("statusColor", "red");
            status.put("error", e.getMessage());
        }

        return status;
    }

    /**
     * 获取健康检查日志
     */
    public List<Map<String, String>> getHealthLogs(int limit) {
        List<Map<String, String>> logs = new ArrayList<>();

        try {
            File logFile = new File(HEALTH_LOG_FILE);
            if (!logFile.exists()) {
                return logs;
            }

            List<String> lines = Files.readAllLines(logFile.toPath());

            // 从后往前读取最近的日志
            int count = 0;
            for (int i = lines.size() - 1; i >= 0 && count < limit; i--) {
                String line = lines.get(i);
                if (line.trim().isEmpty() || line.contains("=========")) {
                    continue;
                }

                Map<String, String> logEntry = parseLogLine(line);
                if (logEntry != null) {
                    logs.add(0, logEntry); // 添加到开头，保持时间顺序
                    count++;
                }
            }

        } catch (Exception e) {
            log.error("读取健康日志失败", e);
        }

        return logs;
    }

    /**
     * 获取告警日志
     */
    public List<Map<String, String>> getAlertLogs(int limit) {
        List<Map<String, String>> alerts = new ArrayList<>();

        try {
            File alertFile = new File(ALERT_LOG_FILE);
            if (!alertFile.exists()) {
                return alerts;
            }

            List<String> lines = Files.readAllLines(alertFile.toPath());

            // 从后往前读取最近的告警
            int count = 0;
            for (int i = lines.size() - 1; i >= 0 && count < limit; i--) {
                String line = lines.get(i);
                if (line.trim().isEmpty()) {
                    continue;
                }

                Map<String, String> alert = parseAlertLine(line);
                if (alert != null) {
                    alerts.add(0, alert);
                    count++;
                }
            }

        } catch (Exception e) {
            log.error("读取告警日志失败", e);
        }

        return alerts;
    }

    /**
     * 获取系统性能指标
     */
    public Map<String, Object> getSystemMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        try {
            // 获取系统MXBean
            OperatingSystemMXBean osBean = (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
            Runtime runtime = Runtime.getRuntime();

            // 内存信息
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            long maxMemory = runtime.maxMemory();

            metrics.put("memoryUsed", usedMemory / (1024 * 1024)); // MB
            metrics.put("memoryTotal", maxMemory / (1024 * 1024)); // MB
            metrics.put("memoryUsagePercent", (double) usedMemory / maxMemory * 100);

            // CPU信息
            double cpuLoad = osBean.getSystemCpuLoad() * 100;
            metrics.put("cpuUsagePercent", cpuLoad > 0 ? cpuLoad : 0);
            metrics.put("availableProcessors", osBean.getAvailableProcessors());

            // JVM信息
            metrics.put("jvmUptime", ManagementFactory.getRuntimeMXBean().getUptime() / 1000); // 秒

            // 端口检查
            metrics.put("port8080Status", checkPortListening(8080) ? "监听中" : "未监听");

            // 获取进程PID
            String pid = getServicePid();
            metrics.put("servicePid", pid);

        } catch (Exception e) {
            log.error("获取系统指标失败", e);
            metrics.put("error", e.getMessage());
        }

        return metrics;
    }

    /**
     * 检查端口是否监听
     */
    private boolean checkPortListening(int port) {
        try {
            Process process = Runtime.getRuntime().exec("lsof -i:" + port);
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains("LISTEN")) {
                    return true;
                }
            }
        } catch (Exception e) {
            log.warn("检查端口{}失败", port, e);
        }
        return false;
    }

    /**
     * 获取最近的健康检查结果
     */
    private String getLastHealthCheckResult() {
        try {
            File logFile = new File(HEALTH_LOG_FILE);
            if (!logFile.exists()) {
                return null;
            }

            List<String> lines = Files.readAllLines(logFile.toPath());

            // 从后往前找第一个包含检查结果的行
            for (int i = lines.size() - 1; i >= 0; i--) {
                String line = lines.get(i);
                if (line.contains("健康检查通过") || line.contains("健康检查失败") ||
                    line.contains("端口监听正常") || line.contains("服务未运行")) {
                    return extractMessage(line);
                }
            }
        } catch (Exception e) {
            log.warn("获取最近健康检查结果失败", e);
        }
        return null;
    }

    /**
     * 获取最近的告警数量
     */
    private int getRecentAlertCount(int hours) {
        try {
            File alertFile = new File(ALERT_LOG_FILE);
            if (!alertFile.exists()) {
                return 0;
            }

            List<String> lines = Files.readAllLines(alertFile.toPath());
            LocalDateTime cutoffTime = LocalDateTime.now().minusHours(hours);

            int count = 0;
            Pattern timePattern = Pattern.compile("\\[(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})\\]");

            for (String line : lines) {
                Matcher matcher = timePattern.matcher(line);
                if (matcher.find()) {
                    try {
                        LocalDateTime logTime = LocalDateTime.parse(matcher.group(1), LOG_TIME_FORMAT);
                        if (logTime.isAfter(cutoffTime)) {
                            count++;
                        }
                    } catch (Exception ignored) {
                    }
                }
            }

            return count;
        } catch (Exception e) {
            log.warn("获取告警数量失败", e);
        }
        return 0;
    }

    /**
     * 获取服务运行时长
     */
    private long getServiceUptime() {
        try {
            Process process = Runtime.getRuntime().exec("systemctl show -p ActiveEnterTimestamp zhitoujianli-backend.service");
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line = reader.readLine();

            if (line != null && line.contains("ActiveEnterTimestamp=")) {
                // 简化：返回JVM运行时间
                return ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
            }
        } catch (Exception e) {
            log.warn("获取服务运行时长失败", e);
        }

        // Fallback: 返回JVM运行时间
        return ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
    }

    /**
     * 获取服务PID
     */
    private String getServicePid() {
        try {
            Process process = Runtime.getRuntime().exec("systemctl show -p MainPID zhitoujianli-backend.service");
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line = reader.readLine();

            if (line != null && line.contains("MainPID=")) {
                return line.split("=")[1].trim();
            }
        } catch (Exception e) {
            log.warn("获取服务PID失败", e);
        }
        return "unknown";
    }

    /**
     * 格式化运行时长
     */
    private String formatUptime(long seconds) {
        long days = seconds / 86400;
        long hours = (seconds % 86400) / 3600;
        long minutes = (seconds % 3600) / 60;

        if (days > 0) {
            return String.format("%d天 %d小时 %d分钟", days, hours, minutes);
        } else if (hours > 0) {
            return String.format("%d小时 %d分钟", hours, minutes);
        } else {
            return String.format("%d分钟", minutes);
        }
    }

    /**
     * 解析日志行
     */
    private Map<String, String> parseLogLine(String line) {
        // 格式: [2025-11-04 22:09:35] ✅ 健康检查通过 (HTTP 200)
        Pattern pattern = Pattern.compile("\\[(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})\\]\\s+(.+)");
        Matcher matcher = pattern.matcher(line);

        if (matcher.find()) {
            Map<String, String> entry = new HashMap<>();
            entry.put("timestamp", matcher.group(1));
            entry.put("message", matcher.group(2).trim());
            entry.put("level", determineLogLevel(matcher.group(2)));
            return entry;
        }

        return null;
    }

    /**
     * 解析告警行
     */
    private Map<String, String> parseAlertLine(String line) {
        // 格式: [2025-11-04 22:09:35] ⚠️ ALERT: 服务未运行
        Pattern pattern = Pattern.compile("\\[(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})\\]\\s+⚠️\\s+ALERT:\\s+(.+)");
        Matcher matcher = pattern.matcher(line);

        if (matcher.find()) {
            Map<String, String> alert = new HashMap<>();
            alert.put("timestamp", matcher.group(1));
            alert.put("message", matcher.group(2).trim());
            alert.put("severity", determineSeverity(matcher.group(2)));
            return alert;
        }

        return null;
    }

    /**
     * 确定日志级别
     */
    private String determineLogLevel(String message) {
        if (message.contains("✅")) return "success";
        if (message.contains("⚠️") || message.contains("警告")) return "warning";
        if (message.contains("❌") || message.contains("错误") || message.contains("失败")) return "error";
        return "info";
    }

    /**
     * 确定告警严重性
     */
    private String determineSeverity(String message) {
        if (message.contains("崩溃") || message.contains("停止") || message.contains("无法")) {
            return "critical";
        } else if (message.contains("失败") || message.contains("超时")) {
            return "high";
        } else {
            return "medium";
        }
    }

    /**
     * 提取消息内容
     */
    private String extractMessage(String line) {
        Pattern pattern = Pattern.compile("\\]\\s+(.+)");
        Matcher matcher = pattern.matcher(line);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return line;
    }
}

