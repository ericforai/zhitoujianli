import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: '首页',
      href: import.meta.env.SITE_URL || 'http://115.190.182.95',
    },
    {
      text: '博客',
      href: getBlogPermalink(),
    },
    {
      text: '分类',
      links: [
        {
          text: '产品动态',
          href: getPermalink('产品动态', 'category'),
        },
        {
          text: '求职指南',
          href: getPermalink('求职指南', 'category'),
        },
        {
          text: '职场建议',
          href: getPermalink('职场建议', 'category'),
        },
      ],
    },
    {
      text: '关于我们',
      href: (import.meta.env.SITE_URL || 'http://115.190.182.95') + '#contact',
    },
  ],
  actions: [{ text: '立即体验', href: import.meta.env.SITE_URL || 'http://115.190.182.95', target: '_blank' }],
};

export const footerData = {
  links: [
    {
      title: '产品功能',
      links: [
        { text: 'AI智能匹配', href: (import.meta.env.SITE_URL || 'http://115.190.182.95') + '#features' },
        { text: '简历优化', href: (import.meta.env.SITE_URL || 'http://115.190.182.95') + '#features' },
        { text: '精准投递', href: (import.meta.env.SITE_URL || 'http://115.190.182.95') + '#features' },
        { text: '数据分析', href: (import.meta.env.SITE_URL || 'http://115.190.182.95') + '#features' },
        { text: '价格方案', href: (import.meta.env.SITE_URL || 'http://115.190.182.95') + '#pricing' },
      ],
    },
    {
      title: '博客分类',
      links: [
        { text: '产品动态', href: getPermalink('产品动态', 'category') },
        { text: '求职指南', href: getPermalink('求职指南', 'category') },
        { text: '职场建议', href: getPermalink('职场建议', 'category') },
        { text: '最新文章', href: getBlogPermalink() },
      ],
    },
    {
      title: '帮助支持',
      links: [
        { text: '使用指南', href: (import.meta.env.SITE_URL || 'http://115.190.182.95') + '#demo' },
        { text: '常见问题', href: (import.meta.env.SITE_URL || 'http://115.190.182.95') + '#contact' },
        { text: '联系我们', href: (import.meta.env.SITE_URL || 'http://115.190.182.95') + '#contact' },
        { text: '意见反馈', href: (import.meta.env.SITE_URL || 'http://115.190.182.95') + '#contact' },
      ],
    },
    {
      title: '关于我们',
      links: [
        { text: '公司介绍', href: (import.meta.env.SITE_URL || 'http://115.190.182.95') + '#about' },
        { text: '团队介绍', href: (import.meta.env.SITE_URL || 'http://115.190.182.95') + '#about' },
        { text: '加入我们', href: (import.meta.env.SITE_URL || 'http://115.190.182.95') + '#contact' },
        { text: '合作伙伴', href: (import.meta.env.SITE_URL || 'http://115.190.182.95') + '#contact' },
      ],
    },
  ],
  secondaryLinks: [
    { text: '服务条款', href: (import.meta.env.SITE_URL || 'http://115.190.182.95') + '/terms' },
    { text: '隐私政策', href: (import.meta.env.SITE_URL || 'http://115.190.182.95') + '/privacy' },
  ],
  socialLinks: [
    { ariaLabel: '微信', icon: 'tabler:brand-wechat', href: '#' },
    { ariaLabel: '微博', icon: 'tabler:brand-weibo', href: '#' },
    { ariaLabel: 'QQ', icon: 'tabler:brand-qq', href: '#' },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
    { ariaLabel: 'GitHub', icon: 'tabler:brand-github', href: 'https://github.com/zhitoujianli' },
  ],
  footNote: `
    智投简历 © 2024 · 让求职更智能 · <a class="text-blue-600 underline dark:text-muted" href="${import.meta.env.SITE_URL || 'http://115.190.182.95'}"> 返回首页</a>
  `,
};
