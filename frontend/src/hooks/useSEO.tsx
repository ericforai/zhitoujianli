/**
 * useSEO Hook
 * React组件中动态更新SEO标签的Hook
 *
 * 使用示例：
 * ```tsx
 * const MyPage = () => {
 *   useSEO('/features'); // 自动应用/features页面的SEO配置
 *   return <div>...</div>;
 * };
 * ```
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSEOConfig } from '../config/seo-config';
import { updateAllSEOTags, initPerformanceOptimizations } from '../utils/seo';

/**
 * SEO Hook
 * @param customPath 可选的自定义路径，如果不提供则使用当前路由路径
 */
export const useSEO = (customPath?: string): void => {
  const location = useLocation();
  const path = customPath || location.pathname;

  useEffect(() => {
    // 获取当前路径的SEO配置
    const seoConfig = getSEOConfig(path);

    // 更新所有SEO标签
    updateAllSEOTags(seoConfig);

    // 初始化性能优化（仅执行一次）
    if (path === '/') {
      initPerformanceOptimizations();
    }

    // 滚动到页面顶部（路由切换时）
    window.scrollTo(0, 0);
  }, [path]);
};

export default useSEO;
