package dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 百度URL提交结果封装类
 * 包含提交的详细信息
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-28
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BaiduSubmitResult {

    /**
     * 是否成功
     */
    private boolean success;

    /**
     * 消息信息
     */
    private String message;

    /**
     * 提交的URL总数
     */
    private Integer totalUrls;

    /**
     * 成功提交的URL数量
     */
    private Integer successCount;

    /**
     * 失败的URL数量
     */
    private Integer failedCount;

    /**
     * 当天剩余配额
     */
    private Integer remainQuota;

    /**
     * 失败的URL列表
     */
    private List<String> failedUrls;

    /**
     * 提交时间
     */
    private LocalDateTime submitTime;

    /**
     * 响应详情
     */
    private BaiduSubmitResponse response;

    /**
     * 创建成功结果
     */
    public static BaiduSubmitResult success(Integer totalUrls, Integer successCount, Integer remainQuota, BaiduSubmitResponse response) {
        return BaiduSubmitResult.builder()
                .success(true)
                .message("URL提交成功")
                .totalUrls(totalUrls)
                .successCount(successCount)
                .failedCount(0)
                .remainQuota(remainQuota)
                .submitTime(LocalDateTime.now())
                .response(response)
                .build();
    }

    /**
     * 创建失败结果
     */
    public static BaiduSubmitResult failure(String message, List<String> failedUrls) {
        return BaiduSubmitResult.builder()
                .success(false)
                .message(message)
                .failedUrls(failedUrls)
                .submitTime(LocalDateTime.now())
                .build();
    }

    /**
     * 创建部分成功结果
     */
    public static BaiduSubmitResult partial(Integer totalUrls, Integer successCount, Integer failedCount,
                                            List<String> failedUrls, Integer remainQuota, BaiduSubmitResponse response) {
        return BaiduSubmitResult.builder()
                .success(successCount > 0)
                .message(String.format("部分成功: %d/%d", successCount, totalUrls))
                .totalUrls(totalUrls)
                .successCount(successCount)
                .failedCount(failedCount)
                .failedUrls(failedUrls)
                .remainQuota(remainQuota)
                .submitTime(LocalDateTime.now())
                .response(response)
                .build();
    }

}

