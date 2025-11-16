package ai;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.json.JSONArray;
import org.json.JSONObject;

import lombok.extern.slf4j.Slf4j;

/**
 * @author loks666
 * 项目链接: <a href="https://github.com/ericforai/zhitoujianli">https://github.com/ericforai/zhitoujianli</a>
 */
@Slf4j
public class AiService {

    // 修复: 使用System.getenv()替代Dotenv,避免运行时依赖缺失
    private static final String BASE_URL = getEnv("BASE_URL", "https://api.deepseek.com");
    private static final String API_KEY = getEnv("API_KEY", getEnv("DEEPSEEK_API_KEY", ""));
    private static final String MODEL = getEnv("MODEL", "deepseek-chat");

    /**
     * 安全获取环境变量,支持默认值
     */
    private static String getEnv(String key, String defaultValue) {
        String value = System.getenv(key);
        return (value != null && !value.isEmpty()) ? value : defaultValue;
    }

    public static String sendRequest(String content) {
        // 统一更严的超时与重试策略
        final int timeoutInSeconds = 25;
        final int maxAttempts = 3;

        // 创建 HttpClient 实例并设置超时
        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(timeoutInSeconds))  // 设置连接超时
                .build();

        // 构建 JSON 请求体 - DeepSeek Chat Completions
        JSONObject requestData = new JSONObject();
        requestData.put("model", MODEL);
        requestData.put("temperature", 0.25); // 降低发散
        requestData.put("stream", false);
        JSONArray messages = new JSONArray();
        // 将 content 拆为 system + user 两段；约定用第一个换行分隔，不则全部作为 user
        String sys = "You are a helpful assistant.";
        String user = content;
        if (content.contains("\n\n")) {
            int idx = content.indexOf("\n\n");
            sys = content.substring(0, idx).trim();
            user = content.substring(idx + 2).trim();
        }
        JSONObject sysMsg = new JSONObject();
        sysMsg.put("role", "system");
        sysMsg.put("content", sys);
        messages.put(sysMsg);
        JSONObject userMsg = new JSONObject();
        userMsg.put("role", "user");
        userMsg.put("content", user);
        messages.put(userMsg);
        requestData.put("messages", messages);

        log.info("使用DeepSeek API，模型: {}", MODEL);

        // 构建API端点
        String apiEndpoint = BASE_URL + "/v1/chat/completions";

        // 构建 HTTP 请求
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(apiEndpoint))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .header("Authorization", "Bearer " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(requestData.toString()));

        HttpRequest request = requestBuilder.build();

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            ExecutorService executor = Executors.newSingleThreadExecutor();
            Callable<HttpResponse<String>> task = () -> client.send(request, HttpResponse.BodyHandlers.ofString());
            Future<HttpResponse<String>> future = executor.submit(task);
            try {
                HttpResponse<String> response = future.get(timeoutInSeconds, TimeUnit.SECONDS);
                int code = response.statusCode();
                if (code == 200) {
                    JSONObject responseObject = new JSONObject(response.body());
                    String responseContent;
                    JSONArray choices = responseObject.optJSONArray("choices");
                    if (choices != null && choices.length() > 0) {
                        JSONObject messageObject = choices.getJSONObject(0).getJSONObject("message");
                        responseContent = messageObject.optString("content", "");
                        return responseContent;
                    }
                    log.error("AI响应中没有有效的choices，完整响应: {}", response.body());
                    return "";
                } else {
                    log.warn("AI请求失败 attempt={} code={} body={}", attempt, code, response.body());
                    if (code == 429 || code >= 500) {
                        Thread.sleep(1000L * (1L << (attempt - 1))); // 1s,2s 退避
                        continue;
                    }
                    return "";
                }
            } catch (TimeoutException te) {
                log.warn("AI请求超时 attempt={} after {}s", attempt, timeoutInSeconds);
            } catch (Exception e) {
                log.warn("AI请求异常 attempt={} err={}", attempt, e.toString());
            } finally {
                executor.shutdownNow();
            }
        }
        return "";
}

public static String cleanBossDesc(String raw) {
    return raw.replaceAll("kanzhun|BOSS直聘|来自BOSS直聘", "")
            .replaceAll("[\\u200b-\\u200d\\uFEFF]", "")
            .replaceAll("<[^>]+>", "") // 如果有HTML标签就用
            .replaceAll("\\s+", " ")
            .trim();
}
}
