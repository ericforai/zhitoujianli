package controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dto.ApiResponse;
import dto.BaiduSubmitResult;
import lombok.extern.slf4j.Slf4j;
import service.BaiduUrlSubmitService;

/**
 * 百度URL提交控制器
 *
 * 提供手动触发百度URL提交的REST API接口
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-28
 */
@RestController
@RequestMapping("/api/baidu")
@Slf4j
public class BaiduSubmitController {

    @Autowired
    private BaiduUrlSubmitService baiduUrlSubmitService;

    /**
     * 手动触发百度URL提交
     *
     * @return 提交结果
     */
    @PostMapping("/submit-urls")
    public ResponseEntity<ApiResponse<BaiduSubmitResult>> submitUrls() {
        log.info("收到手动触发百度URL提交请求");

        try {
            BaiduSubmitResult result = baiduUrlSubmitService.submitUrls();

            if (result.isSuccess()) {
                return ResponseEntity.ok(ApiResponse.success(result, "URL提交成功"));
            } else {
                return ResponseEntity.ok(ApiResponse.success(result, "URL提交部分成功或失败，请查看详细信息"));
            }
        } catch (Exception e) {
            log.error("百度URL提交失败", e);
            return ResponseEntity.ok(ApiResponse.error("提交失败: " + e.getMessage()));
        }
    }

    /**
     * 获取提交状态
     *
     * @return 状态信息
     */
    @PostMapping("/status")
    public ResponseEntity<ApiResponse<String>> getStatus() {
        return ResponseEntity.ok(ApiResponse.success("百度URL提交服务运行中"));
    }

}

