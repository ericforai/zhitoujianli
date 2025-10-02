import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: '首页',
      href: import.meta.env.SITE_URL || 'https://zhitoujianli.com',
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
      href: (import.meta.env.SITE_URL || 'https://zhitoujianli.com') + '#contact',
    },
  ],
  actions: [{ text: '立即体验', href: import.meta.env.SITE_URL || 'https://zhitoujianli.com', target: '_blank' }],
};

export const footerData = {
  links: [
    {
      title: '产品功能',
      links: [
        { text: 'AI智能匹配', href: (import.meta.env.SITE_URL || 'https://zhitoujianli.com') + '#features' },
        { text: '简历优化', href: (import.meta.env.SITE_URL || 'https://zhitoujianli.com') + '#features' },
        { text: '精准投递', href: (import.meta.env.SITE_URL || 'https://zhitoujianli.com') + '#features' },
        { text: '数据分析', href: (import.meta.env.SITE_URL || 'https://zhitoujianli.com') + '#features' },
        { text: '价格方案', href: (import.meta.env.SITE_URL || 'https://zhitoujianli.com') + '#pricing' },
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
        { text: '使用指南', href: (import.meta.env.SITE_URL || 'https://zhitoujianli.com') + '#demo' },
        { text: '常见问题', href: (import.meta.env.SITE_URL || 'https://zhitoujianli.com') + '#contact' },
        { text: '联系我们', href: (import.meta.env.SITE_URL || 'https://zhitoujianli.com') + '#contact' },
        { text: '意见反馈', href: (import.meta.env.SITE_URL || 'https://zhitoujianli.com') + '#contact' },
      ],
    },
    {
      title: '关于我们',
      links: [
        { text: '公司介绍', href: (import.meta.env.SITE_URL || 'https://zhitoujianli.com') + '#about' },
        { text: '团队介绍', href: (import.meta.env.SITE_URL || 'https://zhitoujianli.com') + '#about' },
        { text: '加入我们', href: (import.meta.env.SITE_URL || 'https://zhitoujianli.com') + '#contact' },
        { text: '合作伙伴', href: (import.meta.env.SITE_URL || 'https://zhitoujianli.com') + '#contact' },
      ],
    },
  ],
  secondaryLinks: [
    { text: '服务条款', href: (import.meta.env.SITE_URL || 'https://zhitoujianli.com') + '/terms' },
    { text: '隐私政策', href: (import.meta.env.SITE_URL || 'https://zhitoujianli.com') + '/privacy' },
  ],
  socialLinks: [
    { ariaLabel: '微信', icon: 'tabler:brand-wechat', href: '#' },
    { ariaLabel: '微博', icon: 'tabler:brand-weibo', href: '#' },
    { ariaLabel: 'QQ', icon: 'tabler:brand-qq', href: '#' },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
    { ariaLabel: 'GitHub', icon: 'tabler:brand-github', href: 'https://github.com/zhitoujianli' },
  ],
  footNote: `
    智投简历 © 2024 · 让求职更智能 · <a class="text-blue-600 underline dark:text-muted" href="${import.meta.env.SITE_URL || 'https://zhitoujianli.com'}"> 返回首页</a>
  `,
};
