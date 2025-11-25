package util;

import java.util.List;

/**
 * BossProcessManager 简单测试
 * 用于验证进程管理功能
 */
public class BossProcessManagerTest {

    public static void main(String[] args) {
        System.out.println("=== BossProcessManager 测试 ===\n");

        // 测试用户ID
        String testUserId = args.length > 0 ? args[0] : "2426752006_qq_com";

        System.out.println("测试用户ID: " + testUserId);
        System.out.println();

        // 1. 测试查找进程
        System.out.println("1. 查找用户进程...");
        List<Long> pids = BossProcessManager.findUserBossProcesses(testUserId);
        System.out.println("   找到进程数量: " + pids.size());
        if (!pids.isEmpty()) {
            System.out.println("   进程PID: " + pids);
        }
        System.out.println();

        // 2. 测试检查进程是否运行
        System.out.println("2. 检查进程是否运行...");
        boolean isRunning = BossProcessManager.isUserBossProcessRunning(testUserId);
        System.out.println("   进程运行状态: " + (isRunning ? "运行中" : "未运行"));
        System.out.println();

        // 3. 测试获取进程信息
        System.out.println("3. 获取进程详细信息...");
        List<String> processInfo = BossProcessManager.getUserBossProcessInfo(testUserId);
        if (processInfo.isEmpty()) {
            System.out.println("   无进程信息");
        } else {
            for (String info : processInfo) {
                System.out.println("   " + info);
            }
        }
        System.out.println();

        // 4. 测试终止进程（仅当有进程时）
        if (isRunning && args.length > 1 && "kill".equals(args[1])) {
            System.out.println("4. 终止进程（测试模式）...");
            System.out.println("   注意：实际终止功能需要管理员权限");
            // int killedCount = BossProcessManager.killUserBossProcesses(testUserId);
            // System.out.println("   终止进程数量: " + killedCount);
        } else {
            System.out.println("4. 终止进程测试（跳过，使用 'kill' 参数启用）");
        }

        System.out.println("\n=== 测试完成 ===");
    }
}


