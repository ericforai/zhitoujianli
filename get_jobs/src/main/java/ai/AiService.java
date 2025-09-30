package ai;

import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.*;

/**
 * @author loks666
 * 项目链接: <a href="https://github.com/loks666/get_jobs">https://github.com/loks666/get_jobs</a>
 */
@Slf4j
public class AiService {

    private static final Dotenv dotenv = Dotenv.load();
    private static final String BASE_URL = dotenv.get("BASE_URL");
    private static final String API_KEY = dotenv.get("API_KEY");
    private static final String MODEL = dotenv.get("MODEL");
    
    // 检测是否为DeepSeek API
    private static final boolean IS_DEEPSEEK = dotenv.get("BASE_URL", "").contains("deepseek.com");
    
    // 检测是否为Ollama本地API
    private static final boolean IS_OLLAMA = dotenv.get("BASE_URL", "").contains("localhost:11434") || 
                                            dotenv.get("BASE_URL", "").contains("127.0.0.1:11434");

    public static String sendRequest(String content) {
        // 设置超时时间，单位：秒
        // Ollama本地API需要更长的处理时间
        int timeoutInSeconds = IS_OLLAMA ? 120 : 60;  // Ollama设置为120秒，其他API保持60秒

        // 创建 HttpClient 实例并设置超时
        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(timeoutInSeconds))  // 设置连接超时
                .build();

        // 构建 JSON 请求体
        JSONObject requestData = new JSONObject();
        requestData.put("model", MODEL);
        
        // DeepSeek API 特殊配置
        if (IS_DEEPSEEK) {
            requestData.put("temperature", 0.5);
            requestData.put("stream", false);  // DeepSeek 需要明确指定 stream 参数
            log.info("使用DeepSeek API，模型: {}", MODEL);
        }
        
        // Ollama API 特殊配置 - 使用不同的JSON结构
        if (IS_OLLAMA) {
            requestData.put("prompt", content);  // Ollama使用prompt字段而不是messages
            requestData.put("stream", false);
            requestData.put("options", new JSONObject().put("temperature", 0.5));
            log.info("使用Ollama本地API，模型: {}", MODEL);
        }

        // 其他API使用标准格式
        if (!IS_DEEPSEEK && !IS_OLLAMA) {
            requestData.put("temperature", 0.5);
        }

        // 添加消息内容（非Ollama API使用）
        if (!IS_OLLAMA) {
            JSONArray messages = new JSONArray();
            JSONObject message = new JSONObject();
            message.put("role", "user");
            message.put("content", content);
            messages.put(message);
            requestData.put("messages", messages);
        }

        // 构建正确的API端点
        String apiEndpoint;
        if (IS_OLLAMA) {
            apiEndpoint = BASE_URL + "/api/generate";  // Ollama使用/api/generate
        } else {
            apiEndpoint = BASE_URL + "/v1/chat/completions";  // 其他API使用标准端点
        }
        
        // 构建 HTTP 请求
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(apiEndpoint))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestData.toString()));
        
        // DeepSeek API 需要额外的请求头
        if (IS_DEEPSEEK) {
            requestBuilder.header("Accept", "application/json");
        }
        
        // Ollama API 不需要Authorization头，使用默认配置
        if (IS_OLLAMA) {
            requestBuilder.header("Accept", "application/json");
            // Ollama 本地API不需要API_KEY，移除Authorization头
        } else {
            requestBuilder.header("Authorization", "Bearer " + API_KEY);
        }
        
        HttpRequest request = requestBuilder.build();

        // 创建线程池用于执行请求
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Callable<HttpResponse<String>> task = () -> client.send(request, HttpResponse.BodyHandlers.ofString());

        // 提交请求并控制超时
        Future<HttpResponse<String>> future = executor.submit(task);
        try {
            // 使用 future.get 设置超时
            HttpResponse<String> response = future.get(timeoutInSeconds, TimeUnit.SECONDS);

            if (response.statusCode() == 200) {
                // 解析响应体
                log.info("AI响应: {}", response.body());
                JSONObject responseObject = new JSONObject(response.body());
                
                // 安全获取响应字段
                String requestId = responseObject.optString("id", "unknown");
                long created = responseObject.optLong("created", System.currentTimeMillis() / 1000);
                String model = responseObject.optString("model", MODEL);

                // 解析返回的内容 - 支持不同API格式
                String responseContent;
                if (IS_OLLAMA) {
                    // Ollama格式：直接获取response字段
                    responseContent = responseObject.getString("response");
                } else {
                    // 标准格式：从choices中获取
                    JSONArray choices = responseObject.getJSONArray("choices");
                    if (choices.length() > 0) {
                        JSONObject messageObject = choices.getJSONObject(0).getJSONObject("message");
                        responseContent = messageObject.getString("content");
                    } else {
                        log.error("AI响应中没有choices数据");
                        return "";
                    }
                }

                // 解析 usage 部分（如果存在）
                if (responseObject.has("usage")) {
                    JSONObject usageObject = responseObject.getJSONObject("usage");
                    int promptTokens = usageObject.optInt("prompt_tokens", 0);
                    int completionTokens = usageObject.optInt("completion_tokens", 0);
                    int totalTokens = usageObject.optInt("total_tokens", 0);

                    // 格式化时间
                    LocalDateTime createdTime = Instant.ofEpochSecond(created)
                            .atZone(ZoneId.systemDefault())
                            .toLocalDateTime();
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                    String formattedTime = createdTime.format(formatter);

                    log.info("请求ID: {}, 创建时间: {}, 模型名: {}, 提示词: {}, 补全: {}, 总用量: {}", 
                            requestId, formattedTime, model, promptTokens, completionTokens, totalTokens);
        } else if (IS_OLLAMA) {
                    log.info("Ollama本地API响应成功，模型: {}", model);
        } else {
                    log.info("AI API响应成功，模型: {}", model);
                }
                
                return responseContent;
            } else {
                log.error("AI请求失败！状态码: {}, 响应: {}", response.statusCode(), response.body());
        }
    } catch (TimeoutException e) {
        log.error("请求超时！超时设置为 {} 秒", timeoutInSeconds);
    } catch (Exception e) {
        log.error("AI请求异常！", e);
    } finally {
        executor.shutdownNow();  // 关闭线程池
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