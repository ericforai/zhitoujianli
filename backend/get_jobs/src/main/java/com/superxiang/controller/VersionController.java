package com.superxiang.controller;

import com.superxiang.utils.VersionInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 版本信息控制器
 * 提供系统版本追踪和监控功能
 *
 * @author ZhiTouJianLi Team
 * @since 2.2.0
 */
@Slf4j
@RestController
@RequestMapping("/api")
public class VersionController {

    /**
     * 获取当前运行的应用版本信息
     *
     * API端点：GET /api/version
     * 访问权限：公开（无需认证）
     *
     * 返回信息包括：
     * - version: 语义化版本号（如 2.2.0）
     * - gitSha: Git提交SHA短码（7位）
     * - gitBranch: Git分支名称
     * - buildTime: 构建时间戳
     * - commitTime: Git提交时间
     * - commitMessage: Git提交消息
     * - uptime: 应用运行时长
     * - javaVersion: Java运行时版本
     * - springVersion: Spring Boot版本
     *
     * @return 版本信息Map
     */
    @GetMapping("/version")
    public Map<String, Object> getVersion() {
        log.info("版本信息查询请求");

        Map<String, Object> versionInfo = new HashMap<>();

        // 基本版本信息
        versionInfo.put("version", VersionInfo.getVersion());
        versionInfo.put("gitSha", VersionInfo.getGitCommitId());
        versionInfo.put("gitBranch", VersionInfo.getGitBranch());
        versionInfo.put("buildTime", VersionInfo.getBuildTime());
        versionInfo.put("commitTime", VersionInfo.getCommitTime());
        versionInfo.put("commitMessage", VersionInfo.getCommitMessage());

        // 运行时信息
        versionInfo.put("uptime", VersionInfo.getUptime());
        versionInfo.put("javaVersion", System.getProperty("java.version"));
        versionInfo.put("springVersion", org.springframework.boot.SpringBootVersion.getVersion());

        // 系统环境信息
        versionInfo.put("osName", System.getProperty("os.name"));
        versionInfo.put("osVersion", System.getProperty("os.version"));
        versionInfo.put("osArch", System.getProperty("os.arch"));

        return versionInfo;
    }

    /**
     * 获取简化版本信息（仅版本号和Git SHA）
     *
     * API端点：GET /api/version/short
     *
     * @return 简化版本信息
     */
    @GetMapping("/version/short")
    public Map<String, String> getShortVersion() {
        Map<String, String> shortInfo = new HashMap<>();
        shortInfo.put("version", VersionInfo.getVersion());
        shortInfo.put("gitSha", VersionInfo.getGitCommitId());
        shortInfo.put("build", VersionInfo.getVersion() + "-" + VersionInfo.getGitCommitId());
        return shortInfo;
    }

    /**
     * 健康检查端点（包含版本信息）
     *
     * API端点：GET /api/version/health
     *
     * @return 健康状态和版本信息
     */
    @GetMapping("/version/health")
    public Map<String, Object> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("version", VersionInfo.getVersion());
        health.put("gitSha", VersionInfo.getGitCommitId());
        health.put("uptime", VersionInfo.getUptime());
        health.put("timestamp", System.currentTimeMillis());
        return health;
    }
}



