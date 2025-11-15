package ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

/**
 * 智能打招呼语健康检查服务
 *
 * 用于诊断智能打招呼功能是否正常工作
 *
 * @author AI Assistant
 */
@Service
@Slf4j
public class GreetingHealthCheck {

    /**
     * 执行健康检查
     *
     * @param userId 用户ID
     * @return 健康检查报告
     */
    public Map<String, Object> checkHealth(String userId) {
        Map<String, Object> report = new HashMap<>();

        try {
            // 1. 检查工作目录
            String workDir = System.getProperty("user.dir");
            boolean workDirCheck = workDir != null && !workDir.isEmpty();
            report.put("workDirectory", workDir);
            report.put("workDirectoryCheck", workDirCheck);

            // 2. 检查环境变量
            String userDataDir = System.getenv("USER_DATA_DIR");
            String bossWorkDir = System.getenv("BOSS_WORK_DIR");
            boolean envVarCheck = userDataDir != null && bossWorkDir != null;
            report.put("userDataDir", userDataDir != null ? userDataDir : "未设置");
            report.put("bossWorkDir", bossWorkDir != null ? bossWorkDir : "未设置");
            report.put("envVarCheck", envVarCheck);

            // 3. 检查用户简历文件
            boolean resumeFileCheck = checkResumeFile(userId, report);
            report.put("resumeFileCheck", resumeFileCheck);

            // 4. 检查AI服务配置
            boolean aiServiceCheck = checkAiService(report);
            report.put("aiServiceCheck", aiServiceCheck);

            // 5. 综合健康状态
            boolean overallHealth = workDirCheck && resumeFileCheck && aiServiceCheck;
            report.put("overallHealth", overallHealth);
            report.put("status", overallHealth ? "healthy" : "unhealthy");

            // 6. 生成诊断建议
            if (!overallHealth) {
                report.put("suggestions", generateSuggestions(workDirCheck, envVarCheck, resumeFileCheck, aiServiceCheck));
            }

            log.info("【健康检查】用户: {}, 状态: {}", userId, overallHealth ? "正常" : "异常");

        } catch (Exception e) {
            log.error("健康检查执行失败", e);
            report.put("status", "error");
            report.put("error", e.getMessage());
        }

        return report;
    }

    /**
     * 检查用户简历文件是否存在
     */
    private boolean checkResumeFile(String userId, Map<String, Object> report) {
        // 获取用户数据目录
        String userDataBaseDir = System.getenv("USER_DATA_DIR");
        if (userDataBaseDir == null || userDataBaseDir.isEmpty()) {
            String workDir = System.getProperty("user.dir");
            if (workDir != null && new File(workDir + "/user_data").exists()) {
                userDataBaseDir = workDir + "/user_data";
            } else {
                userDataBaseDir = "/opt/zhitoujianli/backend/user_data";
            }
        }

        // 转换用户ID格式
        String emailUserId = userId;
        if (userId.contains("_")) {
            emailUserId = userId.replaceAll("_(com|cn|net|org|edu|gov)$", ".$1");
            int lastUnderscoreIndex = emailUserId.lastIndexOf("_");
            if (lastUnderscoreIndex > 0) {
                emailUserId = emailUserId.substring(0, lastUnderscoreIndex) + "@" + emailUserId.substring(lastUnderscoreIndex + 1);
            }
        }

        // 尝试所有可能的路径
        String[] possiblePaths = {
            userDataBaseDir + "/" + userId + "/candidate_resume.json",
            userDataBaseDir + "/" + emailUserId + "/candidate_resume.json",
            userDataBaseDir + "/" + userId + "/resume.json",
            userDataBaseDir + "/" + emailUserId + "/resume.json"
        };

        for (String path : possiblePaths) {
            File file = new File(path);
            if (file.exists()) {
                report.put("resumeFilePath", file.getAbsolutePath());
                report.put("resumeFileSize", file.length() + " bytes");
                return true;
            }
        }

        report.put("resumeFilePath", "未找到");
        report.put("attemptedPaths", String.join(", ", possiblePaths));
        return false;
    }

    /**
     * 检查AI服务配置
     */
    private boolean checkAiService(Map<String, Object> report) {
        String apiKey = System.getenv("API_KEY");
        String deepseekKey = System.getenv("DEEPSEEK_API_KEY");
        String baseUrl = System.getenv("BASE_URL");
        String model = System.getenv("MODEL");

        boolean hasApiKey = (apiKey != null && !apiKey.isEmpty()) ||
                           (deepseekKey != null && !deepseekKey.isEmpty());
        boolean hasBaseUrl = baseUrl != null && !baseUrl.isEmpty();
        boolean hasModel = model != null && !model.isEmpty();

        report.put("aiApiKeyConfigured", hasApiKey);
        report.put("aiBaseUrl", baseUrl != null ? baseUrl : "未设置");
        report.put("aiModel", model != null ? model : "未设置");

        return hasApiKey && hasBaseUrl && hasModel;
    }

    /**
     * 生成诊断建议
     */
    private java.util.List<String> generateSuggestions(boolean workDirCheck, boolean envVarCheck,
                                                        boolean resumeFileCheck, boolean aiServiceCheck) {
        java.util.List<String> suggestions = new java.util.ArrayList<>();

        if (!envVarCheck) {
            suggestions.add("环境变量未配置：请检查 /etc/zhitoujianli/backend.env 是否包含 USER_DATA_DIR 和 BOSS_WORK_DIR");
        }

        if (!resumeFileCheck) {
            suggestions.add("简历文件未找到：请在前端上传简历或检查文件路径是否正确");
        }

        if (!aiServiceCheck) {
            suggestions.add("AI服务配置缺失：请检查环境变量中是否配置了 API_KEY、BASE_URL 和 MODEL");
        }

        if (!workDirCheck) {
            suggestions.add("工作目录异常：请检查系统配置");
        }

        return suggestions;
    }
}


























