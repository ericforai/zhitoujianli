package util;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

/**
 * Spring上下文工具类
 * 用于在非Spring Bean类中获取Spring Bean
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-22
 */
@Slf4j
@Component
public class SpringContextUtil implements ApplicationContextAware {

    private static ApplicationContext applicationContext;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        SpringContextUtil.applicationContext = applicationContext;
        log.debug("Spring ApplicationContext已设置");
    }

    /**
     * 获取Spring Bean
     *
     * @param beanClass Bean类型
     * @return Bean实例，如果ApplicationContext未初始化则返回null
     */
    public static <T> T getBean(Class<T> beanClass) {
        if (applicationContext == null) {
            log.warn("⚠️ ApplicationContext未初始化，无法获取Bean: {}", beanClass.getName());
            return null;
        }
        try {
            return applicationContext.getBean(beanClass);
        } catch (Exception e) {
            log.error("❌ 获取Bean失败: {}", beanClass.getName(), e);
            return null;
        }
    }

    /**
     * 检查ApplicationContext是否已初始化
     */
    public static boolean isInitialized() {
        return applicationContext != null;
    }
}

