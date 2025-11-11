/**
 * Category名称到英文slug的映射
 * 用于将中文分类名称转换为SEO友好的英文URL
 */
export const CATEGORY_MAPPING: Record<string, string> = {
  '产品动态': 'product-updates',
  '求职指南': 'job-guide',
  '职场建议': 'career-advice',
  '行业分析': 'industry-analysis',
  '技术深度': 'tech-depth',
};

/**
 * 根据中文category名称获取英文slug
 */
export function getCategorySlug(categoryName: string): string {
  return CATEGORY_MAPPING[categoryName] || categoryName;
}

/**
 * 根据英文slug获取中文category名称
 */
export function getCategoryName(slug: string): string {
  const entry = Object.entries(CATEGORY_MAPPING).find(([_, value]) => value === slug);
  return entry ? entry[0] : slug;
}

