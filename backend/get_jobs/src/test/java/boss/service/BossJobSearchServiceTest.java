package boss.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.junit.jupiter.MockitoExtension;

import boss.BossConfig;

/**
 * BossJobSearchService服务类单元测试
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BossJobSearchService服务测试")
class BossJobSearchServiceTest {

    private BossJobSearchService searchService;
    private BossConfig config;

    @BeforeEach
    void setUp() {
        config = mock(BossConfig.class);
        searchService = new BossJobSearchService(config);
    }

    @Test
    @DisplayName("测试构建搜索URL - 基本参数")
    void testGetSearchUrl_BasicParams() {
        when(config.getJobType()).thenReturn("1");
        when(config.getSalaryRange()).thenReturn(null);
        when(config.getExperienceRequirement()).thenReturn(null);
        when(config.getEducationRequirement()).thenReturn(null);
        when(config.getCompanySize()).thenReturn(null);
        when(config.getIndustry()).thenReturn(null);
        when(config.getFinancingStage()).thenReturn(null);

        String url = searchService.getSearchUrl("101010100");

        assertNotNull(url);
        assertTrue(url.contains("city=101010100"));
        assertTrue(url.contains("jobType=1"));
        assertTrue(url.startsWith("https://www.zhipin.com/web/geek/job?"));
    }

    @ParameterizedTest
    @DisplayName("测试构建搜索URL - 不同城市")
    @CsvSource({
        "101010100, 北京",
        "101020100, 上海",
        "101280100, 深圳",
        "101200100, 杭州"
    })
    void testGetSearchUrl_DifferentCities(String cityCode, String cityName) {
        when(config.getJobType()).thenReturn("1");
        when(config.getSalaryRange()).thenReturn(null);
        when(config.getExperienceRequirement()).thenReturn(null);
        when(config.getEducationRequirement()).thenReturn(null);
        when(config.getCompanySize()).thenReturn(null);
        when(config.getIndustry()).thenReturn(null);
        when(config.getFinancingStage()).thenReturn(null);

        String url = searchService.getSearchUrl(cityCode);

        assertTrue(url.contains("city=" + cityCode));
    }

    @Test
    @DisplayName("测试构建搜索URL - 包含薪资范围")
    void testGetSearchUrl_WithSalaryRange() {
        Map<String, Object> salaryRange = new HashMap<>();
        salaryRange.put("code", "405");

        when(config.getJobType()).thenReturn("1");
        when(config.getSalaryRange()).thenReturn(salaryRange);
        when(config.getExperienceRequirement()).thenReturn(null);
        when(config.getEducationRequirement()).thenReturn(null);
        when(config.getCompanySize()).thenReturn(null);
        when(config.getIndustry()).thenReturn(null);
        when(config.getFinancingStage()).thenReturn(null);

        String url = searchService.getSearchUrl("101010100");

        assertTrue(url.contains("salary=405"));
    }

    @Test
    @DisplayName("测试构建搜索URL - 包含所有参数")
    void testGetSearchUrl_WithAllParams() {
        Map<String, Object> salaryRange = new HashMap<>();
        salaryRange.put("code", "405");

        when(config.getJobType()).thenReturn("1");
        when(config.getSalaryRange()).thenReturn(salaryRange);
        when(config.getExperienceRequirement()).thenReturn("103");
        when(config.getEducationRequirement()).thenReturn("304");
        when(config.getCompanySize()).thenReturn(List.of("301", "302"));
        when(config.getIndustry()).thenReturn(List.of("100001"));
        when(config.getFinancingStage()).thenReturn(List.of("401"));

        String url = searchService.getSearchUrl("101010100");

        assertTrue(url.contains("city=101010100"));
        assertTrue(url.contains("jobType=1"));
        assertTrue(url.contains("salary=405"));
        assertTrue(url.contains("experience=103"));
        assertTrue(url.contains("degree=304"));
        assertTrue(url.contains("scale=301"));
        assertTrue(url.contains("industry=100001"));
        assertTrue(url.contains("stage=401"));
    }
}


