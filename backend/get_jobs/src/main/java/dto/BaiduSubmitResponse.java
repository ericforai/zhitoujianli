package dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 百度URL提交API响应实体类
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-28
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class BaiduSubmitResponse {

    /**
     * 成功推送的URL条数
     */
    private Integer success;

    /**
     * 当天剩余的可推送URL条数
     */
    private Integer remain;

    /**
     * 由于不是本站url而未处理的url列表
     */
    @JsonProperty("not_same_site")
    private List<String> notSameSite;

    /**
     * 不合法的url列表
     */
    @JsonProperty("not_valid")
    private List<String> notValid;

    /**
     * 检查是否提交成功
     *
     * @return true如果success大于0
     */
    public boolean isSuccessful() {
        return success != null && success > 0;
    }

    /**
     * 获取错误信息
     *
     * @return 错误信息描述
     */
    public String getErrorInfo() {
        StringBuilder errorInfo = new StringBuilder();
        if (notSameSite != null && !notSameSite.isEmpty()) {
            errorInfo.append("非本站URL: ").append(notSameSite);
        }
        if (notValid != null && !notValid.isEmpty()) {
            if (errorInfo.length() > 0) {
                errorInfo.append("; ");
            }
            errorInfo.append("非法URL: ").append(notValid);
        }
        return errorInfo.toString();
    }

}

