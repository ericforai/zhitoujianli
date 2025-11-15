/**
 * SEO工具函数库
 * 提供SEO相关的通用工具方法
 */

import { SEOConfig } from '../config/seo-config';

/**
 * 更新页面标题
 */
export const updateTitle = (title: string): void => {
  document.title = title;
};

/**
 * 更新或创建Meta标签
 */
export const updateMetaTag = (
  name: string,
  content: string,
  isProperty: boolean = false
): void => {
  const attribute = isProperty ? 'property' : 'name';
  let element = document.querySelector(
    `meta[${attribute}="${name}"]`
  ) as HTMLMetaElement;

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.content = content;
};

/**
 * 更新Canonical链接
 */
export const updateCanonical = (url: string): void => {
  let element = document.querySelector(
    'link[rel="canonical"]'
  ) as HTMLLinkElement;

  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }

  element.href = url;
};

/**
 * 批量更新所有SEO标签
 */
export const updateAllSEOTags = (config: SEOConfig): void => {
  // 更新标题
  updateTitle(config.title);

  // 更新基础Meta标签
  updateMetaTag('description', config.description);
  if (config.keywords && config.keywords.length > 0) {
    updateMetaTag('keywords', config.keywords.join(', '));
  }

  // 更新Open Graph标签
  updateMetaTag('og:title', config.ogTitle || config.title, true);
  updateMetaTag(
    'og:description',
    config.ogDescription || config.description,
    true
  );
  updateMetaTag('og:url', config.canonical || window.location.href, true);
  updateMetaTag('og:type', 'website', true);
  updateMetaTag('og:site_name', '智投简历', true);

  if (config.ogImage) {
    updateMetaTag('og:image', config.ogImage, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
  }

  // 更新Twitter Card标签
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:title', config.ogTitle || config.title);
  updateMetaTag(
    'twitter:description',
    config.ogDescription || config.description
  );
  if (config.ogImage) {
    updateMetaTag('twitter:image', config.ogImage);
  }

  // 更新Canonical URL
  if (config.canonical) {
    updateCanonical(config.canonical);
  }

  // 更新百度相关Meta标签
  updateMetaTag('baidu-site-verification', 'codeva-9GxRj5etUH');
  updateMetaTag('applicable-device', 'pc,mobile'); // 百度移动适配
  updateMetaTag('MobileOptimized', 'width'); // 百度移动优化
  updateMetaTag('HandheldFriendly', 'true'); // 移动友好
};

/**
 * 添加结构化数据（JSON-LD）
 */
export const addStructuredData = (data: object): void => {
  // 移除已存在的同类型script
  const existingScript = document.querySelector(
    'script[type="application/ld+json"]'
  );
  if (existingScript) {
    existingScript.remove();
  }

  // 创建新的script标签
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
};

/**
 * 生成面包屑导航结构化数据
 */
export const generateBreadcrumbSchema = (
  items: Array<{ name: string; url: string }>
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

/**
 * 生成组织结构化数据
 */
export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '智投简历',
    alternateName: 'SmartResume.ai',
    url: 'https://zhitoujianli.com',
    logo: 'https://zhitoujianli.com/logo512.png',
    description: '专业的AI智能求职平台，提供自动简历投递、智能职位匹配服务',
    sameAs: [
      // 社交媒体链接（如果有的话）
      // 'https://www.facebook.com/zhitoujianli',
      // 'https://twitter.com/zhitoujianli'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: '客户服务',
      availableLanguage: ['zh-CN', 'en'],
    },
  };
};

/**
 * 生成软件应用结构化数据
 */
export const generateSoftwareApplicationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '智投简历',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1000',
    },
  };
};

/**
 * 生成网页结构化数据
 */
export const generateWebPageSchema = (config: SEOConfig) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: config.title,
    description: config.description,
    url: config.canonical || window.location.href,
    inLanguage: 'zh-CN',
    isPartOf: {
      '@type': 'WebSite',
      name: '智投简历',
      url: 'https://zhitoujianli.com',
    },
  };
};

/**
 * 预加载关键资源
 */
export const preloadResource = (href: string, as: string): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

/**
 * DNS预解析
 */
export const dnsPrefetch = (domain: string): void => {
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = domain;
  document.head.appendChild(link);
};

/**
 * 预连接
 */
export const preconnect = (domain: string): void => {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = domain;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

/**
 * 初始化性能优化
 */
export const initPerformanceOptimizations = (): void => {
  // DNS预解析重要域名
  dnsPrefetch('https://www.googletagmanager.com');
  dnsPrefetch('https://hm.baidu.com');

  // 预连接到API服务器
  preconnect('https://zhitoujianli.com');
};
