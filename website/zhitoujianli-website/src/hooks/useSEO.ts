/**
 * SEO Hook - 用于动态更新页面标题和Meta标签
 */

import { useEffect } from 'react';
import { SEOConfig } from '../config/seo.config';

/**
 * 更新页面SEO信息的Hook
 * @param config SEO配置对象
 */
export function useSEO(config: SEOConfig): void {
  useEffect(() => {
    // 更新页面标题
    document.title = config.title;

    // 更新描述meta标签
    updateMetaTag('name', 'description', config.description);

    // 更新关键词meta标签
    updateMetaTag('name', 'keywords', config.keywords.join(', '));

    // Open Graph标签（用于社交媒体分享）
    updateMetaTag('property', 'og:title', config.title);
    updateMetaTag('property', 'og:description', config.description);

    // Twitter Card标签
    updateMetaTag('name', 'twitter:title', config.title);
    updateMetaTag('name', 'twitter:description', config.description);
  }, [config]);
}

/**
 * 更新或创建meta标签
 * @param attribute 属性名（'name' 或 'property'）
 * @param key 属性值
 * @param content 内容
 */
function updateMetaTag(
  attribute: 'name' | 'property',
  key: string,
  content: string
): void {
  let element = document.querySelector(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

