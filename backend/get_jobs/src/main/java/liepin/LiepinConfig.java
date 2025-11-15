package liepin;

import lombok.Data;
import lombok.SneakyThrows;
import utils.JobUtils;

import java.util.List;
import java.util.ArrayList;

/**
 * @author loks666
 * 项目链接: <a href="https://github.com/ericforai/zhitoujianli">https://github.com/ericforai/zhitoujianli</a>
 */
@Data
public class LiepinConfig {
    /**
     * 搜索关键词列表
     */
    private List<String> keywords;

    /**
     * 城市编码
     */
    private String cityCode;

    /**
     * 薪资范围
     */
    private String salary;



    /**
     * 发布时间
     */
    private String pubTime;


    @SneakyThrows
    public static LiepinConfig init() {
        LiepinConfig config = JobUtils.getConfig(LiepinConfig.class);
        // 转换城市编码
        config.setCityCode(LiepinEnum.CityCode.forValue(config.getCityCode()).getCode());
        return config;
    }

    // 防御性拷贝getter方法以避免内部表示暴露
    public List<String> getKeywords() {
        return keywords != null ? new ArrayList<>(keywords) : null;
    }

}
