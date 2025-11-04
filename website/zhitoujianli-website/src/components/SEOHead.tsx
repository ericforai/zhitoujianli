/**
 * SEO Head组件
 * 根据当前页面/区块动态更新页面标题和Meta标签
 */

import { useEffect, useState } from 'react';
import { useSEO } from '../hooks/useSEO';
import { PAGE_SEO_CONFIG } from '../config/seo.config';

interface SEOHeadProps {
  // 默认页面key
  defaultPage?: string;
  // 是否启用滚动监听（单页应用场景）
  enableScrollTracking?: boolean;
}

/**
 * SEO Head组件
 * 支持两种模式：
 * 1. 静态模式：固定使用某个页面的SEO配置
 * 2. 动态模式：根据滚动位置自动切换SEO配置
 */
const SEOHead: React.FC<SEOHeadProps> = ({
  defaultPage = 'home',
  enableScrollTracking = false,
}) => {
  const [currentSection, setCurrentSection] = useState(defaultPage);

  useEffect(() => {
    if (!enableScrollTracking) return;

    // 滚动监听：根据当前可见区块更新SEO
    const handleScroll = () => {
      const sections = [
        { id: 'features', key: 'features' },
        { id: 'demo', key: 'demo' },
        { id: 'pricing', key: 'pricing' },
        { id: 'blog', key: 'blog' },
        { id: 'contact', key: 'contact' },
      ];

      // 找到当前最靠近视口顶部的section
      let currentSectionKey = 'home';
      const scrollPosition = window.scrollY + 100; // 100px偏移量

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = window.scrollY + rect.top;

          if (scrollPosition >= elementTop) {
            currentSectionKey = section.key;
          }
        }
      }

      if (currentSectionKey !== currentSection) {
        setCurrentSection(currentSectionKey);
      }
    };

    // 防抖处理
    let timeoutId: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', debouncedHandleScroll);
    handleScroll(); // 初始执行一次

    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [currentSection, enableScrollTracking]);

  // 获取当前section的SEO配置
  const seoConfig =
    PAGE_SEO_CONFIG[currentSection as keyof typeof PAGE_SEO_CONFIG] ||
    PAGE_SEO_CONFIG.home;

  // 使用useSEO Hook更新页面SEO
  useSEO(seoConfig);

  return null; // 这是一个纯逻辑组件，不渲染任何UI
};

export default SEOHead;

