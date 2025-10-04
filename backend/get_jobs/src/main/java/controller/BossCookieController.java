package controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;

/**
 * Boss程序Cookie管理控制器
 * 用于处理Boss直聘登录Cookie的配置和管理
 */
@RestController
@RequestMapping("/api/boss")
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080", "http://115.190.182.95:3000"})
public class BossCookieController {

    private static final String COOKIE_FILE_PATH = "src/main/java/boss/cookie.json";

    /**
     * 保存Boss登录Cookie
     */
    @PostMapping("/cookie")
    public Map<String, Object> saveCookie(@RequestBody Map<String, Object> request) {
        try {
            String zpToken = (String) request.get("zp_token");
            String session = (String) request.get("session");
            
            if (zpToken == null || session == null) {
                return Map.of(
                    "success", false,
                    "message", "zp_token和session不能为空"
                );
            }

            // 构建Cookie JSON
            String cookieJson = String.format(
                "[{\n" +
                "  \"name\": \"zp_token\",\n" +
                "  \"value\": \"%s\",\n" +
                "  \"domain\": \".zhipin.com\",\n" +
                "  \"path\": \"/\",\n" +
                "  \"expires\": -1,\n" +
                "  \"httpOnly\": false,\n" +
                "  \"secure\": false,\n" +
                "  \"sameSite\": \"Lax\"\n" +
                "},\n" +
                "{\n" +
                "  \"name\": \"session\",\n" +
                "  \"value\": \"%s\",\n" +
                "  \"domain\": \".zhipin.com\",\n" +
                "  \"path\": \"/\",\n" +
                "  \"expires\": -1,\n" +
                "  \"httpOnly\": true,\n" +
                "  \"secure\": false,\n" +
                "  \"sameSite\": \"Lax\"\n" +
                "}]",
                zpToken, session
            );

            // 确保目录存在
            File cookieFile = new File(COOKIE_FILE_PATH);
            cookieFile.getParentFile().mkdirs();

            // 写入Cookie文件
            try (FileWriter writer = new FileWriter(cookieFile)) {
                writer.write(cookieJson);
            }

            log.info("Boss Cookie保存成功");
            return Map.of(
                "success", true,
                "message", "Cookie保存成功，可以启动Boss程序",
                "cookie_file", COOKIE_FILE_PATH
            );

        } catch (Exception e) {
            log.error("保存Boss Cookie失败", e);
            return Map.of(
                "success", false,
                "message", "保存Cookie失败: " + e.getMessage()
            );
        }
    }

    /**
     * 获取当前Cookie配置
     */
    @GetMapping("/cookie")
    public Map<String, Object> getCookie() {
        try {
            File cookieFile = new File(COOKIE_FILE_PATH);
            if (!cookieFile.exists()) {
                return Map.of(
                    "success", false,
                    "message", "Cookie文件不存在",
                    "has_cookie", false
                );
            }

            String cookieContent = Files.readString(Paths.get(COOKIE_FILE_PATH));
            return Map.of(
                "success", true,
                "message", "获取Cookie成功",
                "has_cookie", true,
                "cookie_content", cookieContent
            );

        } catch (Exception e) {
            log.error("读取Cookie失败", e);
            return Map.of(
                "success", false,
                "message", "读取Cookie失败: " + e.getMessage(),
                "has_cookie", false
            );
        }
    }

    /**
     * 清除Cookie配置
     */
    @DeleteMapping("/cookie")
    public Map<String, Object> clearCookie() {
        try {
            File cookieFile = new File(COOKIE_FILE_PATH);
            if (cookieFile.exists()) {
                cookieFile.delete();
                log.info("Boss Cookie已清除");
            }

            return Map.of(
                "success", true,
                "message", "Cookie已清除"
            );

        } catch (Exception e) {
            log.error("清除Cookie失败", e);
            return Map.of(
                "success", false,
                "message", "清除Cookie失败: " + e.getMessage()
            );
        }
    }
}
