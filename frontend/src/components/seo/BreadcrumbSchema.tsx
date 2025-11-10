/**
 * BreadcrumbSchema组件
 * 添加面包屑导航结构化数据
 * Google搜索结果中显示面包屑导航
 */

import React, { useEffect } from 'react';
import { generateBreadcrumbSchema, addStructuredData } from '../../utils/seo';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

const BreadcrumbSchema: React.FC<BreadcrumbSchemaProps> = ({ items }) => {
  useEffect(() => {
    if (items && items.length > 0) {
      const schema = generateBreadcrumbSchema(items);
      addStructuredData(schema);
    }
  }, [items]);

  return null;
};

export default BreadcrumbSchema;
