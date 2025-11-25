package util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

import lombok.extern.slf4j.Slf4j;

/**
 * Boss进程管理工具类
 * 用于检查和管理Boss投递进程
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-25
 */
@Slf4j
public class BossProcessManager {

    /**
     * 检查指定用户的Boss进程是否在运行
     * 通过检查进程命令行参数中的用户ID来判断
     *
     * @param userId 用户ID
     * @return 运行中的进程PID列表，如果没有运行则返回空列表
     */
    public static List<Long> findUserBossProcesses(String userId) {
        List<Long> pids = new ArrayList<>();

        if (userId == null || userId.isEmpty()) {
            log.warn("用户ID为空，无法检查进程");
            return pids;
        }

        try {
            // 使用ps命令查找包含用户ID的Boss进程
            // 查找命令行中包含 "boss.user.id=userId" 或 "BOSS_USER_ID=userId" 的进程
            ProcessBuilder pb = new ProcessBuilder(
                "ps", "aux"
            );

            Process process = pb.start();

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {

                String line;
                String userIdMarker1 = "boss.user.id=" + userId;
                String userIdMarker2 = "BOSS_USER_ID=" + userId;

                while ((line = reader.readLine()) != null) {
                    // 检查是否包含IsolatedBossRunner且包含用户ID
                    if (line.contains("IsolatedBossRunner") &&
                        (line.contains(userIdMarker1) ||
                         line.contains(userIdMarker2))) {

                        // 提取PID（ps aux输出的第二列）
                        String[] parts = line.trim().split("\\s+");
                        if (parts.length > 1) {
                            try {
                                long pid = Long.parseLong(parts[1]);
                                pids.add(pid);
                                log.debug("找到用户{}的Boss进程: PID={}", userId, pid);
                            } catch (NumberFormatException e) {
                                log.warn("无法解析进程PID: {}", parts[1]);
                            }
                        }
                    }
                }
            }

            int exitCode = process.waitFor();
            if (exitCode != 0) {
                log.warn("ps命令执行失败，退出码: {}", exitCode);
            }

        } catch (IOException | InterruptedException e) {
            log.error("检查用户{}的Boss进程失败", userId, e);
        }

        return pids;
    }

    /**
     * 检查指定用户的Boss进程是否在运行
     *
     * @param userId 用户ID
     * @return true如果该用户有Boss进程在运行，false如果没有
     */
    public static boolean isUserBossProcessRunning(String userId) {
        List<Long> pids = findUserBossProcesses(userId);
        boolean isRunning = !pids.isEmpty();

        if (isRunning) {
            log.info("用户{}有{}个Boss进程在运行: {}", userId, pids.size(), pids);
        } else {
            log.debug("用户{}没有Boss进程在运行", userId);
        }

        return isRunning;
    }

    /**
     * 终止指定用户的所有Boss进程
     *
     * @param userId 用户ID
     * @return 成功终止的进程数量
     */
    public static int killUserBossProcesses(String userId) {
        List<Long> pids = findUserBossProcesses(userId);

        if (pids.isEmpty()) {
            log.info("用户{}没有运行中的Boss进程", userId);
            return 0;
        }

        int killedCount = 0;
        for (Long pid : pids) {
            try {
                ProcessBuilder pb = new ProcessBuilder("kill", "-9", String.valueOf(pid));
                Process process = pb.start();
                int exitCode = process.waitFor();

                if (exitCode == 0) {
                    killedCount++;
                    log.info("✅ 已终止用户{}的Boss进程: PID={}", userId, pid);
                } else {
                    log.warn("终止进程失败: PID={}, 退出码={}", pid, exitCode);
                }
            } catch (IOException | InterruptedException e) {
                log.error("终止进程异常: PID={}", pid, e);
            }
        }

        log.info("用户{}的Boss进程清理完成: 找到{}个，成功终止{}个", userId, pids.size(), killedCount);
        return killedCount;
    }

    /**
     * 获取进程信息（用于调试）
     *
     * @param userId 用户ID
     * @return 进程信息列表
     */
    public static List<String> getUserBossProcessInfo(String userId) {
        List<String> info = new ArrayList<>();
        List<Long> pids = findUserBossProcesses(userId);

        for (Long pid : pids) {
            try {
                ProcessBuilder pb = new ProcessBuilder("ps", "-p", String.valueOf(pid), "-o", "pid,etime,cmd");
                Process process = pb.start();

                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(process.getInputStream()))) {
                    String line;
                    boolean firstLine = true;
                    while ((line = reader.readLine()) != null) {
                        if (!firstLine && !line.trim().isEmpty()) {
                            info.add(line.trim());
                        }
                        firstLine = false;
                    }
                }

                process.waitFor();
            } catch (IOException | InterruptedException e) {
                log.error("获取进程信息失败: PID={}", pid, e);
            }
        }

        return info;
    }
}

