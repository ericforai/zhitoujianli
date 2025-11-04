package com.superxiang.utils;

import lombok.extern.slf4j.Slf4j;

import java.io.InputStream;
import java.lang.management.ManagementFactory;
import java.time.Duration;
import java.util.Properties;

/**
 * 版本信息工具类
 * 从git.properties和manifest中读取版本信息
 *
 * @author ZhiTouJianLi Team
 * @since 2.2.0
 */
@Slf4j
public class VersionInfo {

    private static final Properties GIT_PROPERTIES = new Properties();
    private static final long START_TIME = ManagementFactory.getRuntimeMXBean().getStartTime();

    // 静态初始化块，在类加载时读取git.properties
    static {
        try (InputStream is = VersionInfo.class.getClassLoader().getResourceAsStream("git.properties")) {
            if (is != null) {
                GIT_PROPERTIES.load(is);
                log.info("成功加载git.properties，版本信息: {}", getVersion() + "-" + getGitCommitId());
            } else {
                log.warn("未找到git.properties文件，版本信息将显示为unknown");
            }
        } catch (Exception e) {
            log.error("加载git.properties失败", e);
        }
    }

    /**
     * 获取应用版本号（从pom.xml）
     * 格式：2.2.0
     *
     * @return 版本号
     */
    public static String getVersion() {
        String version = VersionInfo.class.getPackage().getImplementationVersion();
        if (version == null || version.isEmpty()) {
            // 从git.properties读取
            version = GIT_PROPERTIES.getProperty("git.build.version", "unknown");
        }
        return version;
    }

    /**
     * 获取Git提交ID（短格式，7位）
     * 格式：a3f5c2d
     *
     * @return Git提交SHA短码
     */
    public static String getGitCommitId() {
        return GIT_PROPERTIES.getProperty("git.commit.id.abbrev", "unknown");
    }

    /**
     * 获取Git提交ID（完整格式）
     *
     * @return Git提交SHA完整码
     */
    public static String getGitCommitIdFull() {
        return GIT_PROPERTIES.getProperty("git.commit.id.full", "unknown");
    }

    /**
     * 获取Git分支名称
     *
     * @return Git分支
     */
    public static String getGitBranch() {
        return GIT_PROPERTIES.getProperty("git.branch", "unknown");
    }

    /**
     * 获取构建时间
     *
     * @return 构建时间戳
     */
    public static String getBuildTime() {
        return GIT_PROPERTIES.getProperty("git.build.time", "unknown");
    }

    /**
     * 获取Git提交时间
     *
     * @return 提交时间戳
     */
    public static String getCommitTime() {
        return GIT_PROPERTIES.getProperty("git.commit.time", "unknown");
    }

    /**
     * 获取Git提交消息（简短）
     *
     * @return 提交消息
     */
    public static String getCommitMessage() {
        return GIT_PROPERTIES.getProperty("git.commit.message.short", "unknown");
    }

    /**
     * 获取应用运行时长（格式化）
     * 格式：2h 15m 30s
     *
     * @return 运行时长字符串
     */
    public static String getUptime() {
        long uptimeMs = System.currentTimeMillis() - START_TIME;
        Duration duration = Duration.ofMillis(uptimeMs);

        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();
        long seconds = duration.toSecondsPart();

        if (hours > 0) {
            return String.format("%dh %dm %ds", hours, minutes, seconds);
        } else if (minutes > 0) {
            return String.format("%dm %ds", minutes, seconds);
        } else {
            return String.format("%ds", seconds);
        }
    }

    /**
     * 获取完整版本标识（版本号+Git SHA）
     * 格式：v2.2.0-a3f5c2d
     *
     * @return 完整版本标识
     */
    public static String getFullVersionString() {
        return "v" + getVersion() + "-" + getGitCommitId();
    }

    /**
     * 打印版本信息到日志（应用启动时调用）
     */
    public static void logVersionInfo() {
        log.info("========================================");
        log.info("应用版本: {}", getVersion());
        log.info("Git提交: {} ({})", getGitCommitId(), getGitBranch());
        log.info("构建时间: {}", getBuildTime());
        log.info("提交消息: {}", getCommitMessage());
        log.info("完整标识: {}", getFullVersionString());
        log.info("========================================");
    }
}





