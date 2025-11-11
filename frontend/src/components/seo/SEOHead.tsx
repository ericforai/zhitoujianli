/**
 * SEOHead组件
 * 统一管理页面SEO标签和结构化数据
 *
 * 使用示例：
 * ```tsx
 * <SEOHead
 *   path="/features"
 *   breadcrumbs={[{name: '首页', url: '/'}, {name: '功能', url: '/features'}]}
 * />
 * ```
 */

import React, { useEffect } from 'react';
import { getSEOConfig } from '../../config/seo-config';
import {
  updateAllSEOTags,
  addStructuredData,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateWebPageSchema,
  generateSoftwareApplicationSchema,
} from '../../utils/seo';

interface Breadcrumb {
  name: string;
  url: string;
}

interface SEOHeadProps {
  path: string;
  breadcrumbs?: Breadcrumb[];
  includeOrganizationSchema?: boolean;
  includeSoftwareSchema?: boolean;
}

/**
 * SEOHead组件
 */
const SEOHead: React.FC<SEOHeadProps> = ({
  path,
  breadcrumbs,
  includeOrganizationSchema = false,
  includeSoftwareSchema = false,
}) => {
  useEffect(() => {
    // 获取SEO配置
    const seoConfig = getSEOConfig(path);

    // 更新所有SEO标签
    updateAllSEOTags(seoConfig);

    // 添加结构化数据
    // ✅ 修复：使用Record类型替代any
    const structuredDataArray: Record<string, unknown>[] = [];

    // 1. 网页基础结构化数据（所有页面）
    structuredDataArray.push(generateWebPageSchema(seoConfig));

    // 2. 面包屑导航（如果提供）
    if (breadcrumbs && breadcrumbs.length > 0) {
      structuredDataArray.push(generateBreadcrumbSchema(breadcrumbs));
    }

    // 3. 组织信息（首页和关键页面）
    if (includeOrganizationSchema) {
      structuredDataArray.push(generateOrganizationSchema());
    }

    // 4. 软件应用信息（首页和功能页）
    if (includeSoftwareSchema) {
      structuredDataArray.push(generateSoftwareApplicationSchema());
    }

    // 添加结构化数据到页面
    if (structuredDataArray.length > 0) {
      addStructuredData({
        '@context': 'https://schema.org',
        '@graph': structuredDataArray,
      });
    }
  }, [path, breadcrumbs, includeOrganizationSchema, includeSoftwareSchema]);

  // 该组件不渲染任何可见内容
  return null;
};

export default SEOHead;
