import ai.AiService;

public class test_ai_service {
    public static void main(String[] args) {
        try {
            System.out.println("开始测试AI服务...");
            
            String prompt = "请生成一段简单的打招呼语，用于求职投递，要求专业礼貌，不超过100字。";
            
            System.out.println("🤖 调用AI服务...");
            String response = AiService.sendRequest(prompt);
            
            if (response != null && !response.trim().isEmpty()) {
                System.out.println("✅ AI服务调用成功！");
                System.out.println("📝 AI响应：");
                System.out.println("=" + "=".repeat(50));
                System.out.println(response);
                System.out.println("=" + "=".repeat(50));
                System.out.println("📊 长度: " + response.length() + " 字符");
            } else {
                System.out.println("❌ AI服务返回空响应");
            }
            
        } catch (Exception e) {
            System.err.println("❌ 测试过程中发生异常: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
