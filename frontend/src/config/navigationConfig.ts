/**
 * 导航和页脚配置
 * 从共享配置文件加载，避免硬编码路径
 */

export interface NavItem {
  label: string;
  path: string;
  children?: NavItem[];
}

export interface FooterLinkGroup {
  title: string;
  items: Array<{ label: string; path: string }>;
}

export interface NavigationConfig {
  site_url: string;
  navigation: {
    main: NavItem[];
  };
  footer: {
    links: FooterLinkGroup[];
    bottom: {
      copyright: string;
      links: Array<{ label: string; path: string }>;
    };
  };
}

// 默认配置（可以通过环境变量或API加载）
const defaultConfig: NavigationConfig = {
  site_url: 'https://zhitoujianli.com',
  navigation: {
    main: [
      { label: '首页', path: '/' },
      { label: '定价', path: '/pricing' },
      { label: '场景', path: '/scenes' },
      { label: '简历', path: '/resume' },
      {
        label: '博客',
        path: '/blog/',
        children: [
          { label: '全部博客', path: '/blog/' },
          { label: '求职指南', path: '/blog/category/job-guide/' },
          { label: '职场建议', path: '/blog/category/career-advice/' },
          { label: '产品动态', path: '/blog/category/product-updates/' },
        ],
      },
      { label: '关于我们', path: '/blog/about/#company' },
    ],
  },
  footer: {
    links: [
      {
        title: '快速链接',
        items: [
          { label: '定价', path: '/pricing' },
          { label: '使用指南', path: '/guide' },
          { label: '常见问题', path: '/help' },
          { label: '联系我们', path: '/contact' },
        ],
      },
      {
        title: '博客分类',
        items: [
          { label: '产品动态', path: '/blog/category/product-updates/' },
          { label: '求职指南', path: '/blog/category/job-guide/' },
          { label: '职场建议', path: '/blog/category/career-advice/' },
        ],
      },
      {
        title: '帮助支持',
        items: [
          { label: '使用指南', path: '/guide' },
          { label: '常见问题', path: '/help' },
          { label: '联系我们', path: '/contact' },
        ],
      },
      {
        title: '关于我们',
        items: [
          { label: '公司介绍', path: '/blog/about/#company' },
          { label: '服务条款', path: '/terms' },
          { label: '隐私政策', path: '/privacy' },
        ],
      },
    ],
    bottom: {
      copyright: '© 2025 智投简历 All Rights Reserved',
      links: [
        { label: '服务条款', path: '/terms' },
        { label: '隐私政策', path: '/privacy' },
      ],
    },
  },
};

// 配置加载器（可以从API或静态文件加载）
export const loadNavigationConfig = async (): Promise<NavigationConfig> => {
  try {
    // 尝试从公共配置文件加载
    const response = await fetch('/config/navigation-config.json');
    if (response.ok) {
      const config = await response.json();
      return config as NavigationConfig;
    }
  } catch (error) {
    console.warn('无法加载导航配置，使用默认配置:', error);
  }

  return defaultConfig;
};

// 同步获取配置（用于SSR或初始渲染）
export const getNavigationConfig = (): NavigationConfig => {
  return defaultConfig;
};



