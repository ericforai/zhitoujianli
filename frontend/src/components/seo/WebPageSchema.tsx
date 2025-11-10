/**
 * WebPageSchema组件
 * 添加网页结构化数据
 * 帮助搜索引擎理解页面内容
 */

import React, { useEffect } from 'react';
import { getSEOConfig } from '../../config/seo-config';
import { generateWebPageSchema, addStructuredData } from '../../utils/seo';

interface WebPageSchemaProps {
  path: string;
}

const WebPageSchema: React.FC<WebPageSchemaProps> = ({ path }) => {
  useEffect(() => {
    const seoConfig = getSEOConfig(path);
    const schema = generateWebPageSchema(seoConfig);
    addStructuredData(schema);
  }, [path]);

  return null;
};

export default WebPageSchema;
