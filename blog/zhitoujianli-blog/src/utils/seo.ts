/**
 * SEO工具函数
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  image: string;
  url: string;
  type: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

/**
 * 生成结构化数据
 */
export function generateStructuredData(config: SEOConfig, additionalData?: any) {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': config.type === 'article' ? 'BlogPosting' : 'WebSite',
    headline: config.title,
    description: config.description,
    image: {
      '@type': 'ImageObject',
      url: config.image,
      width: 1200,
      height: 628,
    },
    url: config.url,
    author: {
      '@type': 'Organization',
      name: config.author || '智投简历团队',
      url: 'https://www.zhitoujianli.com',
    },
    publisher: {
      '@type': 'Organization',
      name: '智投简历',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.zhitoujianli.com/blog/_astro/hero-image.DwIC_L_T.png',
      },
    },
    inLanguage: 'zh-CN',
  };

  if (config.type === 'article') {
    Object.assign(baseStructuredData, {
      datePublished: config.publishedTime,
      dateModified: config.modifiedTime || config.publishedTime,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': config.url,
      },
      articleSection: '求职指南',
      keywords: config.keywords,
    });
  }

  return { ...baseStructuredData, ...additionalData };
}

/**
 * 生成面包屑结构化数据
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
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
}

/**
 * 生成FAQ结构化数据
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * 生成文章结构化数据
 */
export function generateArticleStructuredData(post: any) {
  const config: SEOConfig = {
    title: post.title,
    description: post.description,
    keywords: post.keywords || '',
    image: post.heroImage || post.image,
    url: `https://www.zhitoujianli.com/blog/${post.slug}/`,
    type: 'article',
    publishedTime: post.pubDate,
    modifiedTime: post.updatedDate || post.pubDate,
    author: post.author,
  };

  return generateStructuredData(config, {
    wordCount: post.wordCount || 2000,
    timeRequired: `PT${post.readingTime || 10}M`,
    articleSection: post.category,
    keywords: post.keywords,
  });
}

/**
 * 优化图片URL
 */
export function optimizeImageUrl(url: string, width: number = 1200, height: number = 628) {
  if (url.startsWith('http')) {
    return url;
  }

  const baseUrl = 'https://www.zhitoujianli.com/blog';
  return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
}

/**
 * 生成页面标题
 */
export function generatePageTitle(title: string, siteName: string = '智投简历博客') {
  return title ? `${title} — ${siteName}` : siteName;
}

/**
 * 清理和优化描述文本
 */
export function optimizeDescription(description: string, maxLength: number = 160) {
  if (description.length <= maxLength) {
    return description;
  }

  // 在句号、感叹号、问号处截断
  const truncated = description.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('。'),
    truncated.lastIndexOf('！'),
    truncated.lastIndexOf('？')
  );

  if (lastSentenceEnd > maxLength * 0.7) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }

  return truncated + '...';
}

/**
 * 生成关键词数组
 */
export function generateKeywords(tags: string[], category: string, additionalKeywords: string[] = []) {
  const baseKeywords = ['智投简历', '求职技巧', '简历优化', '面试经验', '职场发展', 'AI求职'];

  return [...tags, category, ...additionalKeywords, ...baseKeywords].filter(
    (keyword, index, array) => array.indexOf(keyword) === index
  );
}
