package service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.apache.hc.core5.net.URIBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import dto.BaiduSubmitResponse;
import dto.BaiduSubmitResult;
import lombok.extern.slf4j.Slf4j;

/**
 * 百度URL提交服务
 *
 * 功能：
 * 1. 从sitemap.xml读取URL列表
 * 2. 过滤掉需要登录的URL
 * 3. 批量提交到百度收录API
 * 4. 记录提交结果和日志
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-28
 */
@Service
@Slf4j
public class BaiduUrlSubmitService {

    @Value("${baidu.submit.api-url:http://data.zz.baidu.com/urls}")
    private String apiUrl;

    @Value("${baidu.submit.site:https://www.zhitoujianli.com}")
    private String site;

    @Value("${baidu.submit.token:wds5zmJ4sTAPlxuN}")
    private String token;

    @Value("${baidu.submit.sitemap-path:frontend/public/sitemap.xml}")
    private String sitemapPath;

    @Value("${baidu.submit.exclude-paths:/dashboard,/resume-delivery,/auto-delivery,/boss-delivery,/smart-greeting,/jd-matching,/config}")
    private String excludePathsStr;

    // 需要排除的路径（需要登录才能访问）
    private static final Set<String> DEFAULT_EXCLUDE_PATHS = Set.of(
        "/dashboard",
        "/resume-delivery",
        "/auto-delivery",
        "/boss-delivery",
        "/smart-greeting",
        "/jd-matching",
        "/config"
    );

    // 最小优先级阈值（只提交优先级>=0.6的URL）
    private static final double MIN_PRIORITY = 0.6;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 提交URL到百度
     *
     * @return 提交结果
     */
    public BaiduSubmitResult submitUrls() {
        log.info("=== 开始百度URL提交任务 ===");

        try {
            // 1. 读取sitemap文件
            List<String> allUrls = parseSitemap(sitemapPath);
            log.info("从sitemap解析到 {} 个URL", allUrls.size());

            // 2. 过滤公开可访问的URL
            List<String> publicUrls = filterPublicUrls(allUrls);
            log.info("过滤后剩余 {} 个公开URL", publicUrls.size());

            if (publicUrls.isEmpty()) {
                log.warn("没有可提交的URL");
                return BaiduSubmitResult.failure("没有可提交的URL", new ArrayList<>());
            }

            // 3. 调用百度API提交
            BaiduSubmitResponse response = callBaiduApi(publicUrls);

            // 4. 构建结果
            if (response.isSuccessful()) {
                log.info("URL提交成功: {} 个", response.getSuccess());
                log.info("剩余配额: {}", response.getRemain());

                // 合并失败的URL
                List<String> failedUrls = new ArrayList<>();
                if (response.getNotSameSite() != null) {
                    failedUrls.addAll(response.getNotSameSite());
                }
                if (response.getNotValid() != null) {
                    failedUrls.addAll(response.getNotValid());
                }

                if (failedUrls.isEmpty()) {
                    return BaiduSubmitResult.success(
                        publicUrls.size(),
                        response.getSuccess(),
                        response.getRemain(),
                        response
                    );
                } else {
                    return BaiduSubmitResult.partial(
                        publicUrls.size(),
                        response.getSuccess(),
                        failedUrls.size(),
                        failedUrls,
                        response.getRemain(),
                        response
                    );
                }
            } else {
                log.error("URL提交失败: {}", response.getErrorInfo());
                return BaiduSubmitResult.failure(
                    "百度API调用失败: " + response.getErrorInfo(),
                    publicUrls
                );
            }

        } catch (Exception e) {
            log.error("百度URL提交过程中发生错误", e);
            return BaiduSubmitResult.failure("提交失败: " + e.getMessage(), new ArrayList<>());
        } finally {
            log.info("=== 百度URL提交任务结束 ===\n");
        }
    }

    /**
     * 解析sitemap.xml文件，提取所有URL
     *
     * @param sitemapPath sitemap文件路径
     * @return URL列表
     */
    private List<String> parseSitemap(String sitemapPath) throws IOException {
        List<String> urls = new ArrayList<>();

        // 构建完整路径
        Path path = Paths.get(sitemapPath);
        if (!Files.exists(path)) {
            // 尝试从项目根目录的相对路径
            String projectRoot = System.getProperty("user.dir");
            path = Paths.get(projectRoot, sitemapPath);

            if (!Files.exists(path)) {
                // 尝试从绝对路径
                if (!sitemapPath.startsWith("/")) {
                    log.error("无法找到sitemap文件: {}", sitemapPath);
                    throw new IOException("无法找到sitemap文件: " + sitemapPath);
                }
            }
        }

        log.info("读取sitemap文件: {}", path.toAbsolutePath());

        // 读取并解析XML
        try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            String line;
            String currentPriority = "0.5"; // 默认优先级
            StringBuilder urlBuilder = new StringBuilder();
            boolean inUrlTag = false;

            while ((line = reader.readLine()) != null) {
                line = line.trim();

                // 提取优先级
                if (line.contains("<priority>")) {
                    currentPriority = extractTagValue(line, "priority");
                }

                // 提取URL
                if (line.contains("<loc>") && line.contains("</loc>")) {
                    String url = extractTagValue(line, "loc");
                    double priority = Double.parseDouble(currentPriority);

                    // 只添加符合优先级要求的URL
                    if (priority >= MIN_PRIORITY) {
                        urls.add(url);
                        log.debug("添加URL: {} (优先级: {})", url, priority);
                    }
                } else if (line.contains("<loc>")) {
                    // 多行的<loc>标签开始
                    inUrlTag = true;
                    urlBuilder = new StringBuilder();
                    urlBuilder.append(extractTagStart(line, "loc"));
                } else if (line.contains("</loc>")) {
                    // 多行的<loc>标签结束
                    if (inUrlTag) {
                        String url = urlBuilder.append(extractTagEnd(line)).toString().trim();
                        double priority = Double.parseDouble(currentPriority);

                        if (priority >= MIN_PRIORITY) {
                            urls.add(url);
                            log.debug("添加URL: {} (优先级: {})", url, priority);
                        }
                        inUrlTag = false;
                        urlBuilder = new StringBuilder();
                    }
                } else if (inUrlTag) {
                    urlBuilder.append(" ").append(line);
                }
            }
        }

        log.info("成功解析 {} 个URL", urls.size());
        return urls;
    }

    /**
     * 从XML标签中提取值
     */
    private String extractTagValue(String line, String tagName) {
        String startTag = "<" + tagName + ">";
        String endTag = "</" + tagName + ">";

        int startIdx = line.indexOf(startTag);
        int endIdx = line.indexOf(endTag);

        if (startIdx != -1 && endIdx != -1) {
            return line.substring(startIdx + startTag.length(), endIdx);
        }

        return "";
    }

    private String extractTagStart(String line, String tagName) {
        int startIdx = line.indexOf("<" + tagName + ">");
        if (startIdx != -1) {
            return line.substring(startIdx + tagName.length() + 2);
        }
        return "";
    }

    private String extractTagEnd(String line) {
        int endIdx = line.indexOf("</loc>");
        if (endIdx != -1) {
            return line.substring(0, endIdx);
        }
        return "";
    }

    /**
     * 过滤掉需要登录的URL
     *
     * @param urls 所有URL列表
     * @return 公开可访问的URL列表
     */
    private List<String> filterPublicUrls(List<String> urls) {
        // 解析排除路径配置
        Set<String> excludePaths = parseExcludePaths(excludePathsStr);

        return urls.stream()
            .filter(url -> {
                try {
                    // 提取URL的路径部分
                    URI uri = new URI(url);
                    String path = uri.getPath();

                    // 检查是否在排除列表中
                    for (String excludePath : excludePaths) {
                        if (path.startsWith(excludePath)) {
                            log.debug("排除URL: {} (需要登录)", url);
                            return false;
                        }
                    }

                    return true;
                } catch (Exception e) {
                    log.warn("无法解析URL: {}", url);
                    return false;
                }
            })
            .collect(Collectors.toList());
    }

    /**
     * 解析排除路径配置字符串
     */
    private Set<String> parseExcludePaths(String pathsStr) {
        Set<String> paths = new HashSet<>(DEFAULT_EXCLUDE_PATHS);

        if (pathsStr != null && !pathsStr.isEmpty()) {
            String[] pathsArray = pathsStr.split(",");
            for (String path : pathsArray) {
                path = path.trim();
                if (!path.isEmpty()) {
                    paths.add(path);
                }
            }
        }

        return paths;
    }

    /**
     * 调用百度API提交URL
     *
     * @param urls 要提交的URL列表
     * @return 百度API响应
     */
    private BaiduSubmitResponse callBaiduApi(List<String> urls) throws IOException {
        log.info("准备调用百度API，提交 {} 个URL", urls.size());

        // 构建请求URL
        URI requestUri;
        try {
            URIBuilder uriBuilder = new URIBuilder(apiUrl);
            uriBuilder.addParameter("site", site);
            uriBuilder.addParameter("token", token);
            requestUri = uriBuilder.build();
        } catch (Exception e) {
            log.error("构建请求URI失败", e);
            throw new IOException("构建请求URI失败: " + e.getMessage());
        }

        log.debug("请求URL: {}", requestUri);

        // 构建请求体（每行一个URL）
        String requestBody = urls.stream()
            .collect(java.util.stream.Collectors.joining("\n"));

        // 创建HTTP客户端
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(requestUri);
            httpPost.setHeader("Content-Type", "text/plain");
            httpPost.setEntity(new StringEntity(requestBody, ContentType.TEXT_PLAIN));

            // 执行请求
            CloseableHttpResponse response = httpClient.execute(httpPost);
            try {
                int statusCode = response.getCode();
                log.info("百度API响应状态码: {}", statusCode);

                if (statusCode == 200) {
                    // 读取响应内容
                    InputStream responseStream = response.getEntity().getContent();
                    String responseBody = readStream(responseStream);
                    log.debug("百度API响应内容: {}", responseBody);

                    // 解析JSON响应
                    BaiduSubmitResponse submitResponse = objectMapper.readValue(
                        responseBody,
                        BaiduSubmitResponse.class
                    );

                    return submitResponse;
                } else {
                    log.error("百度API调用失败，状态码: {}", statusCode);
                    throw new IOException("百度API调用失败，状态码: " + statusCode);
                }
            } finally {
                if (response != null) {
                    response.close();
                }
            }
        }
    }

    /**
     * 读取输入流内容
     */
    private String readStream(InputStream stream) throws IOException {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            StringBuilder content = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line);
            }
            return content.toString();
        }
    }

    /**
     * 主方法 - 用于独立运行
     */
    public static void main(String[] args) {
        org.apache.logging.log4j.LogManager.getLogger().info("=== 百度URL提交服务独立运行 ===");

        try {
            // 手动设置配置
            BaiduUrlSubmitService service = new BaiduUrlSubmitService();
            service.apiUrl = "http://data.zz.baidu.com/urls";
            service.site = "https://www.zhitoujianli.com";
            service.token = "wds5zmJ4sTAPlxuN";
            service.sitemapPath = "/root/zhitoujianli/frontend/public/sitemap.xml";
            service.excludePathsStr = "/dashboard,/resume-delivery,/auto-delivery,/boss-delivery,/smart-greeting,/jd-matching,/config";

            // 执行提交
            BaiduSubmitResult result = service.submitUrls();

            // 输出结果
            System.out.println("\n=== 提交结果 ===");
            System.out.println("成功: " + result.isSuccess());
            System.out.println("消息: " + result.getMessage());
            System.out.println("总数: " + result.getTotalUrls());
            System.out.println("成功数: " + result.getSuccessCount());
            System.out.println("剩余配额: " + result.getRemainQuota());

            if (result.getFailedUrls() != null && !result.getFailedUrls().isEmpty()) {
                System.out.println("失败URL:");
                result.getFailedUrls().forEach(url -> System.out.println("  - " + url));
            }

        } catch (Exception e) {
            System.err.println("执行失败: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}

