/**
 * OrganizationSchema组件
 * 添加组织结构化数据（Schema.org）
 * Google搜索结果中显示公司信息
 */

import React, { useEffect } from 'react';
import { generateOrganizationSchema, addStructuredData } from '../../utils/seo';

const OrganizationSchema: React.FC = () => {
  useEffect(() => {
    const schema = generateOrganizationSchema();
    addStructuredData(schema);
  }, []);

  return null;
};

export default OrganizationSchema;
