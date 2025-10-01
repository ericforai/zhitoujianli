import ai.SmartGreetingService;
import ai.CandidateResumeService;
import java.util.Map;

public class test_smart_greeting {
    public static void main(String[] args) {
        try {
            System.out.println("开始测试智能打招呼语功能...");
            
            // 1. 检查是否有候选人简历
            if (!CandidateResumeService.hasCandidateResume()) {
                System.out.println("❌ 未找到候选人简历文件");
                return;
            }
            
            System.out.println("✅ 找到候选人简历文件");
            
            // 2. 加载候选人信息
            Map<String, Object> candidate = CandidateResumeService.loadCandidateInfo();
            if (candidate == null) {
                System.out.println("❌ 加载候选人信息失败");
                return;
            }
            
            System.out.println("✅ 成功加载候选人信息: " + candidate.get("name"));
            
            // 3. 测试生成智能打招呼语
            String jobName = "营销总监";
            String jobDescription = """
                岗位职责：
                1. 负责公司整体营销策略制定和执行
                2. 管理营销团队，提升团队业绩
                3. 制定数字化营销方案，提升品牌影响力
                4. 分析市场数据，优化营销效果
                
                任职要求：
                1. 本科及以上学历，市场营销相关专业
                2. 5年以上营销管理经验
                3. 熟悉数字化营销和AIGC应用
                4. 具备优秀的团队管理和沟通能力
                """;
            
            System.out.println("🤖 开始生成智能打招呼语...");
            String greeting = SmartGreetingService.generateSmartGreeting(
                candidate, jobName, jobDescription
            );
            
            if (greeting != null && !greeting.trim().isEmpty()) {
                System.out.println("✅ 智能打招呼语生成成功！");
                System.out.println("📝 打招呼语内容：");
                System.out.println("=" + "=".repeat(50));
                System.out.println(greeting);
                System.out.println("=" + "=".repeat(50));
                System.out.println("📊 长度: " + greeting.length() + " 字符");
            } else {
                System.out.println("❌ 智能打招呼语生成失败");
            }
            
        } catch (Exception e) {
            System.err.println("❌ 测试过程中发生异常: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
