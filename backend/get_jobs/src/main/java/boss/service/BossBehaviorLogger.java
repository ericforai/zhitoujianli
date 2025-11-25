package boss.service;

import java.io.File;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;

import static utils.Bot.sendMessageByTime;

/**
 * Boss用户行为记录服务
 * 负责记录用户行为日志和发送通知
 *
 * @author ZhiTouJianLi Team
 */
public class BossBehaviorLogger {
    private static final Logger log = LoggerFactory.getLogger(BossBehaviorLogger.class);

    private final String userId;

    public BossBehaviorLogger(String userId) {
        this.userId = userId;
    }

    /**
     * 通过HTTP API记录用户行为（供后台任务调用）
     *
     * @param behaviorType 行为类型
     * @param status 状态
     * @param description 描述
     * @param extraData 额外数据
     */
    public void logBehavior(String behaviorType, String status, String description, Map<String, Object> extraData) {
        try {
            // 获取原始用户ID（可能是email格式，如 luwenrong123@sina.com）
            // 如果this.userId是safeUserId格式，尝试从环境变量或配置文件获取原始ID
            String userId = this.userId;

            // 如果userId是safeUserId格式（包含下划线），尝试从配置文件获取原始email
            if (userId != null && userId.contains("_") && !userId.contains("@")) {
                try {
                    // 尝试从config.json读取原始userId
                    String configPath = "/opt/zhitoujianli/backend/user_data/" + userId + "/config.json";
                    File configFile = new File(configPath);
                    if (configFile.exists()) {
                        ObjectMapper mapper = new ObjectMapper();
                        Map<String, Object> config = mapper.readValue(configFile, Map.class);
                        Object originalUserId = config.get("userId");
                        if (originalUserId != null) {
                            userId = originalUserId.toString();
                            log.debug("从配置文件获取原始用户ID: {}", userId);
                        }
                    }
                } catch (Exception e) {
                    log.debug("无法从配置文件获取原始用户ID，使用safeUserId: {}", e.getMessage());
                }
            }

            if (userId == null || userId.isEmpty()) {
                log.warn("无法记录行为：用户ID为空");
                return;
            }

            // 构建请求JSON
            Map<String, Object> requestData = new HashMap<>();
            requestData.put("userId", userId);
            requestData.put("behaviorType", behaviorType);
            requestData.put("status", status);
            requestData.put("description", description);
            requestData.put("platform", "BOSS直聘");
            if (extraData != null) {
                requestData.put("extraData", extraData);
            }

            // 序列化为JSON
            ObjectMapper mapper = new ObjectMapper();
            String jsonBody = mapper.writeValueAsString(requestData);

            // 发送HTTP请求
            URL url = new URL("http://localhost:8080/api/admin/behavior/log");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(3000);

            // 写入请求体
            try (java.io.OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonBody.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            // 读取响应
            int responseCode = conn.getResponseCode();
            if (responseCode == 200 || responseCode == 201) {
                log.debug("✅ 用户行为已记录: behaviorType={}, status={}", behaviorType, status);
            } else {
                log.warn("⚠️ 记录用户行为失败: responseCode={}, behaviorType={}", responseCode, behaviorType);
            }

            conn.disconnect();

        } catch (Exception e) {
            // 记录行为失败不应该影响主流程，只记录警告
            log.warn("记录用户行为异常: {}", e.getMessage());
        }
    }

    /**
     * 发送验证码通知
     * 当检测到验证码时，通知用户需要手动处理
     *
     * @param jobName 岗位名称
     */
    public void sendVerificationCodeNotification(String jobName) {
        try {
            String message = String.format(
                "⚠️ Boss直聘要求验证码验证，投递已暂停\n" +
                "岗位: %s\n" +
                "💡 请手动登录Boss直聘完成验证后，重新启动投递任务\n" +
                "建议：等待15-30分钟后重试",
                jobName
            );

            // 发送Bot通知
            sendMessageByTime(message);

            // 记录用户行为
            Map<String, Object> extraData = new HashMap<>();
            extraData.put("jobName", jobName);
            extraData.put("reason", "验证码验证");
            logBehavior("VERIFICATION_CODE_REQUIRED", "PAUSED",
                String.format("验证码验证：岗位 %s", jobName),
                extraData);

        } catch (Exception e) {
            log.warn("发送验证码通知失败: {}", e.getMessage());
        }
    }
}

