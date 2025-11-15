package job51;

import lombok.Data;
import lombok.SneakyThrows;
import utils.JobUtils;

import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

/**
 * @author loks666
 * 项目链接: <a href="https://github.com/ericforai/zhitoujianli">https://github.com/ericforai/zhitoujianli</a>
 * 前程无忧自动投递简历
 */
@Data
public class Job51Config {


    /**
     * 搜索关键词列表
     */
    private List<String> keywords;

    /**
     * 城市编码
     */
    private List<String> jobArea;

    /**
     * 薪资范围
     */
    private List<String> salary;


    @SneakyThrows
    public static Job51Config init() {
        Job51Config config = JobUtils.getConfig(Job51Config.class);
        // 转换城市编码
        config.setJobArea(config.getJobArea().stream().map(value -> Job51Enum.JobArea.forValue(value).getCode()).collect(Collectors.toList()));
        // 转换薪资范围
        config.setSalary(config.getSalary().stream().map(value -> Job51Enum.Salary.forValue(value).getCode()).collect(Collectors.toList()));
        return config;
    }

    // 防御性拷贝getter方法以避免内部表示暴露
    public List<String> getKeywords() {
        return keywords != null ? new ArrayList<>(keywords) : null;
    }

    public List<String> getJobArea() {
        return jobArea != null ? new ArrayList<>(jobArea) : null;
    }

    public List<String> getSalary() {
        return salary != null ? new ArrayList<>(salary) : null;
    }

}
