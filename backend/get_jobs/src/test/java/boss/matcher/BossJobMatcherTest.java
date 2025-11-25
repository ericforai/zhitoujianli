package boss.matcher;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.junit.jupiter.MockitoExtension;

import boss.BossConfig;

/**
 * BossJobMatcher服务类单元测试
 * 测试岗位匹配逻辑
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BossJobMatcher服务测试")
class BossJobMatcherTest {

    private BossJobMatcher matcher;
    private BossConfig config;

    @BeforeEach
    void setUp() {
        config = mock(BossConfig.class);
        matcher = new BossJobMatcher(config);
    }

    @Test
    @DisplayName("测试关键词匹配 - 完全匹配")
    void testIsKeywordMatchedWithScore_ExactMatch() {
        String jobName = "Java开发工程师";
        String keyword = "Java";

        BossJobMatcher.MatchingResult result = matcher.isKeywordMatchedWithScore(jobName, keyword);

        assertTrue(result.isMatched());
        assertTrue(result.getScore() > 0);
    }

    @Test
    @DisplayName("测试关键词匹配 - 不匹配")
    void testIsKeywordMatchedWithScore_NoMatch() {
        String jobName = "Python开发工程师";
        String keyword = "Java";

        BossJobMatcher.MatchingResult result = matcher.isKeywordMatchedWithScore(jobName, keyword);

        assertFalse(result.isMatched());
        assertEquals(0.0, result.getScore());
    }

    @Test
    @DisplayName("测试关键词匹配 - null值")
    void testIsKeywordMatchedWithScore_NullValues() {
        BossJobMatcher.MatchingResult result1 = matcher.isKeywordMatchedWithScore(null, "Java");
        assertFalse(result1.isMatched());

        BossJobMatcher.MatchingResult result2 = matcher.isKeywordMatchedWithScore("Java开发", null);
        assertFalse(result2.isMatched());

        BossJobMatcher.MatchingResult result3 = matcher.isKeywordMatchedWithScore(null, null);
        assertFalse(result3.isMatched());
    }

    @Test
    @DisplayName("测试关键词匹配 - 空字符串")
    void testIsKeywordMatchedWithScore_EmptyStrings() {
        BossJobMatcher.MatchingResult result1 = matcher.isKeywordMatchedWithScore("", "Java");
        assertFalse(result1.isMatched());

        BossJobMatcher.MatchingResult result2 = matcher.isKeywordMatchedWithScore("Java开发", "");
        assertFalse(result2.isMatched());
    }

    @ParameterizedTest
    @DisplayName("测试关键词匹配 - 各种匹配场景")
    @CsvSource({
        "Java开发工程师, Java, true",
        "Python开发工程师, Java, false",
        "前端开发工程师, 前端, true",
        "后端开发工程师, 后端, true",
        "全栈开发工程师, 全栈, true"
    })
    void testIsKeywordMatchedWithScore_VariousScenarios(String jobName, String keyword, boolean expectedMatch) {
        BossJobMatcher.MatchingResult result = matcher.isKeywordMatchedWithScore(jobName, keyword);
        assertEquals(expectedMatch, result.isMatched());
    }

    @Test
    @DisplayName("测试匹配结果对象")
    void testMatchingResult() {
        BossJobMatcher.MatchingResult result = new BossJobMatcher.MatchingResult(true, 0.85, 1);

        assertTrue(result.isMatched());
        assertEquals(0.85, result.getScore());
        assertEquals(1, result.getMatchedScheme());
    }

    @Test
    @DisplayName("测试匹配结果 - 未匹配")
    void testMatchingResult_NotMatched() {
        BossJobMatcher.MatchingResult result = new BossJobMatcher.MatchingResult(false, 0.0, 0);

        assertFalse(result.isMatched());
        assertEquals(0.0, result.getScore());
        assertEquals(0, result.getMatchedScheme());
    }
}
