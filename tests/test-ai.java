// 测试AI服务的独立文件
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class TestAI {
    private static final String BASE_URL = "http://localhost:11434/v1/chat/completions";
    private static final String MODEL = "qwen2.5:7b";

    public static void main(String[] args) {
        String content = "你好，请帮我生成一个专业的打招呼语";

        String response = sendRequest(content);
        System.out.println("AI回复: " + response);
    }

    public static String sendRequest(String content) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(60))
                    .build();

            String requestBody = """
                {
                    "model": "%s",
                    "temperature": 0.5,
                    "stream": false,
                    "messages": [
                        {
                            "role": "user",
                            "content": "%s"
                        }
                    ]
                }
                """.formatted(MODEL, content.replace("\"", "\\\"").replace("\n", "\\n"));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                System.out.println("AI响应状态: " + response.statusCode());
                return response.body();
            } else {
                System.err.println("AI请求失败！状态码: " + response.statusCode() + ", 响应: " + response.body());
                return "AI请求失败";
            }
        } catch (Exception e) {
            System.err.println("AI请求异常: " + e.getMessage());
            e.printStackTrace();
            return "AI请求异常";
        }
    }
}
