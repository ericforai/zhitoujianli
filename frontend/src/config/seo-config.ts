/**
 * SEO配置文件 - 智投简历
 * 为每个页面定义独特的SEO元数据
 *
 * 优化目标：
 * 1. 每个页面有独特的标题和描述
 * 2. 针对Google和百度优化关键词
 * 3. 提升搜索引擎收录和排名
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}

// 基础配置
// 使用www作为规范域名（与Nginx配置一致，所有不带www的请求会301重定向到www）
const BASE_URL = 'https://www.zhitoujianli.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;
export const SITE_NAME = '智投简历';

// 通用关键词（所有页面共用）
const COMMON_KEYWORDS = [
  '智投简历',
  '智能求职',
  'AI简历投递',
  '自动投递简历',
  '求职助手',
  '简历优化',
  '职位匹配',
];

/**
 * 页面SEO配置映射表
 */
export const SEO_CONFIGS: Record<string, SEOConfig> = {
  // 首页
  '/': {
    title: '智投简历 - AI智能求职助手 | 自动投递简历，精准匹配岗位',
    description:
      '智投简历是专业的AI智能求职平台，提供自动简历投递、智能职位匹配、个性化打招呼语生成服务。支持Boss直聘等主流招聘平台，让求职更高效，快速拿到心仪Offer。',
    keywords: [
      ...COMMON_KEYWORDS,
      'Boss直聘自动投递',
      '智能打招呼语',
      '简历解析',
      'JD匹配',
      '求职效率提升',
      '自动化求职',
      'AI求职工具',
    ],
    ogTitle: '智投简历 - 用AI让求职更智能',
    ogDescription:
      '自动投递简历，智能匹配岗位，AI生成打招呼语。让求职效率提升10倍！',
    ogImage: DEFAULT_OG_IMAGE,
    canonical: BASE_URL,
  },

  // 功能介绍页
  '/features': {
    title: '产品功能 - 智投简历的核心优势 | AI简历投递、智能匹配、打招呼语生成',
    description:
      '了解智投简历的强大功能：AI简历解析、智能职位匹配、自动打招呼语生成、批量投递管理、实时状态追踪。帮助求职者提升10倍求职效率，快速获得面试机会。',
    keywords: [
      ...COMMON_KEYWORDS,
      '简历解析功能',
      '职位智能匹配',
      '打招呼语AI生成',
      '批量投递简历',
      '投递记录管理',
      '求职状态追踪',
      'AI简历优化',
    ],
    ogTitle: '智投简历核心功能 - 让求职更智能高效',
    ogDescription: 'AI简历解析、智能匹配、自动投递，一站式求职解决方案',
    canonical: `${BASE_URL}/features`,
  },

  // 价格方案页
  '/pricing': {
    title: '价格方案 - 智投简历套餐选择 | 免费试用、按需付费、企业定制',
    description:
      '智投简历提供灵活的价格方案：免费体验版、标准版、专业版、企业定制版。按投递次数付费，无隐藏费用。立即注册享受30次免费投递额度！',
    keywords: [
      ...COMMON_KEYWORDS,
      '智投简历价格',
      '求职工具收费',
      '简历投递费用',
      '免费试用',
      '按需付费',
      '企业求职方案',
      'SaaS求职平台',
    ],
    ogTitle: '智投简历价格方案 - 灵活选择，按需付费',
    ogDescription: '免费试用30次，标准版低至0.5元/次，让求职投资更划算',
    canonical: `${BASE_URL}/pricing`,
  },

  // 博客页面
  '/blog': {
    title: '求职干货博客 - 智投简历 | 简历技巧、面试经验、职场攻略',
    description:
      '智投简历博客提供最新的求职技巧、简历优化方法、面试经验分享、职场发展攻略。帮助求职者提升职业竞争力，获得更多优质工作机会。',
    keywords: [
      ...COMMON_KEYWORDS,
      '求职技巧',
      '简历写作技巧',
      '面试经验分享',
      '职场攻略',
      '求职干货',
      '简历优化建议',
      '职业发展规划',
    ],
    ogTitle: '智投简历博客 - 求职干货与职场攻略',
    ogDescription: '最新求职技巧、简历优化方法、面试经验，助你快速拿Offer',
    canonical: `${BASE_URL}/blog`,
  },

  // 联系我们页
  '/contact': {
    title: '联系我们 - 智投简历客服支持 | 售前咨询、技术支持、商务合作',
    description:
      '智投简历客服团队为您提供专业支持。无论是产品咨询、技术问题还是商务合作，欢迎随时联系我们。工作时间：周一至周五 9:00-18:00。',
    keywords: [
      ...COMMON_KEYWORDS,
      '智投简历客服',
      '联系方式',
      '技术支持',
      '商务合作',
      '售前咨询',
      '用户反馈',
    ],
    ogTitle: '联系智投简历 - 我们随时为您服务',
    ogDescription: '专业客服团队，快速响应您的需求',
    canonical: `${BASE_URL}/contact`,
  },

  // 用户注册页
  '/register': {
    title: '用户注册 - 智投简历 | 立即注册享30次免费投递',
    description:
      '注册智投简历账号，立即获得30次免费简历投递额度。快速完成注册，开启智能求职之旅，让AI帮你找到理想工作！',
    keywords: [
      ...COMMON_KEYWORDS,
      '注册账号',
      '免费试用',
      '新用户注册',
      '求职工具注册',
      '免费投递额度',
    ],
    ogTitle: '注册智投简历 - 开启智能求职之旅',
    ogDescription: '注册即送30次免费投递，快速体验AI求职助手',
    canonical: `${BASE_URL}/register`,
  },

  // 用户登录页
  '/login': {
    title: '用户登录 - 智投简历 | 登录您的求职助手账号',
    description:
      '登录智投简历账号，继续您的智能求职之旅。查看投递记录、管理简历、追踪求职进度，让求职管理更轻松。',
    keywords: [...COMMON_KEYWORDS, '用户登录', '账号登录', '求职平台登录'],
    canonical: `${BASE_URL}/login`,
  },

  // 用户控制台
  '/dashboard': {
    title: '用户控制台 - 智投简历 | 投递记录、简历管理、数据统计',
    description:
      '智投简历用户控制台，全面管理您的求职数据。查看投递记录、简历状态、面试邀请、数据统计，让求职进度一目了然。',
    keywords: [
      ...COMMON_KEYWORDS,
      '用户控制台',
      '投递记录',
      '简历管理',
      '求职数据统计',
      '面试管理',
    ],
    canonical: `${BASE_URL}/dashboard`,
  },

  // 简历投递页
  '/resume-delivery': {
    title: '简历投递 - 智投简历 | 上传简历，一键智能投递',
    description:
      '上传您的简历，智投简历AI自动解析并匹配合适职位。支持PDF、Word格式，智能生成个性化打招呼语，批量投递到Boss直聘等平台。',
    keywords: [
      ...COMMON_KEYWORDS,
      '上传简历',
      '简历投递',
      'PDF简历解析',
      'Word简历解析',
      '批量投递',
      '一键投递',
    ],
    canonical: `${BASE_URL}/resume-delivery`,
  },

  // 配置页面
  '/config': {
    title: '投递配置 - 智投简历 | 设置搜索条件、投递偏好',
    description:
      '配置智投简历的投递参数：目标城市、薪资范围、工作经验、学历要求、职位关键词。精准设置，让AI为您匹配最合适的职位。',
    keywords: [
      ...COMMON_KEYWORDS,
      '投递配置',
      '搜索条件设置',
      '职位筛选',
      '求职偏好设置',
    ],
    canonical: `${BASE_URL}/config`,
  },

  // 帮助中心
  '/help': {
    title: '帮助中心 - 智投简历 | 常见问题、使用教程、故障排查',
    description:
      '智投简历帮助中心，提供详细的使用教程、常见问题解答、故障排查指南。帮助您快速上手，解决使用过程中遇到的问题。',
    keywords: [
      ...COMMON_KEYWORDS,
      '帮助文档',
      '使用教程',
      '常见问题',
      '故障排查',
      '操作指南',
    ],
    canonical: `${BASE_URL}/help`,
  },

  // 使用指南
  '/guide': {
    title: '快速入门指南 - 智投简历 | 5分钟学会智能求职',
    description:
      '智投简历快速入门指南，5分钟教您如何使用AI求职工具。从注册到投递，从简历优化到面试邀请，全流程图文教程。',
    keywords: [
      ...COMMON_KEYWORDS,
      '使用指南',
      '快速入门',
      '新手教程',
      '操作步骤',
      '求职教程',
    ],
    canonical: `${BASE_URL}/guide`,
  },

  // 服务条款
  '/terms': {
    title: '服务条款 - 智投简历 | 用户协议与使用规范',
    description:
      '智投简历用户服务条款，明确用户权利与义务、平台使用规范、隐私保护政策。请仔细阅读并同意后使用本平台服务。',
    keywords: [
      ...COMMON_KEYWORDS,
      '服务条款',
      '用户协议',
      '使用规范',
      '法律声明',
    ],
    canonical: `${BASE_URL}/terms`,
  },

  // 隐私政策
  '/privacy': {
    title: '隐私政策 - 智投简历 | 个人信息保护与数据安全',
    description:
      '智投简历隐私政策，详细说明个人信息收集、使用、存储和保护措施。我们严格遵守数据保护法规，保障用户隐私安全。',
    keywords: [
      ...COMMON_KEYWORDS,
      '隐私政策',
      '个人信息保护',
      '数据安全',
      '隐私保护',
      'GDPR合规',
    ],
    canonical: `${BASE_URL}/privacy`,
  },

  // 管理员控制台（不需要SEO优化，但提供基础配置）
  '/admin/dashboard': {
    title: '管理员控制台 - 智投简历',
    description: '智投简历管理员后台，系统管理与数据监控',
    keywords: [...COMMON_KEYWORDS],
    canonical: `${BASE_URL}/admin/dashboard`,
  },
};

/**
 * 获取指定路径的SEO配置
 * @param path 页面路径
 * @returns SEO配置对象
 */
export const getSEOConfig = (path: string): SEOConfig => {
  // 处理博客分类页面
  if (path.startsWith('/blog/')) {
    const category = path.replace('/blog/', '');
    return {
      title: `${category} - 求职干货博客 | 智投简历`,
      description: `智投简历博客${category}分类，提供${category}相关的求职技巧、职场经验分享。`,
      keywords: [...COMMON_KEYWORDS, category, '求职技巧', '职场攻略'],
      canonical: `${BASE_URL}${path}`,
    };
  }

  // 处理管理员页面
  if (path.startsWith('/admin/')) {
    return {
      title: '管理后台 - 智投简历',
      description: '智投简历管理员后台',
      keywords: [...COMMON_KEYWORDS],
      canonical: `${BASE_URL}${path}`,
    };
  }

  // 返回配置或默认首页配置
  return SEO_CONFIGS[path] || SEO_CONFIGS['/'];
};

/**
 * 获取Open Graph完整URL
 */
export const getOGImageURL = (imagePath?: string): string => {
  if (!imagePath) return DEFAULT_OG_IMAGE;
  if (imagePath.startsWith('http')) return imagePath;
  return `${BASE_URL}${imagePath}`;
};

/**
 * 生成Canonical URL
 */
export const getCanonicalURL = (path: string): string => {
  // 移除尾部斜杠（除了根路径）
  const cleanPath = path === '/' ? '' : path.replace(/\/$/, '');
  return `${BASE_URL}${cleanPath}`;
};
