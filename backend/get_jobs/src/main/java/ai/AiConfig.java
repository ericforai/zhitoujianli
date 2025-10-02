package ai;

import lombok.Data;
import utils.JobUtils;

/**
 * @author loks666
 * 项目链接: <a href="https://github.com/loks666/get_jobs">https://github.com/loks666/get_jobs</a>
 */
@Data
public class AiConfig {

    /**
     * 介绍语
     */
    private String introduce;

    /**
     * 提示词
     */
    private String prompt;

    /**
     * 打招呼语风格
     */
    private String greetingStyle;

    public AiConfig() {
    }

    public AiConfig(String introduce, String prompt, String greetingStyle) {
        this.introduce = introduce;
        this.prompt = prompt;
        this.greetingStyle = greetingStyle;
    }

    public static AiConfig init() {
        AiConfig config = JobUtils.getConfig(AiConfig.class);
        return new AiConfig(config.introduce, config.prompt, config.greetingStyle);
    }

}
