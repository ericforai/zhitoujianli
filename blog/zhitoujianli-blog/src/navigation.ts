export const headerData = {
  links: [
    {
      text: '博客首页',
      href: '/blog/',
    },
    {
      text: '产品动态',
      href: '/blog/category/product-updates/',
    },
    {
      text: '求职指南',
      href: '/blog/category/job-guide/',
    },
    {
      text: '职场建议',
      href: '/blog/category/career-advice/',
    },
    {
      text: '关于我们',
      href: 'https://zhitoujianli.com/blog/about/#company',
    },
  ],
  actions: [{ text: '立即体验', href: import.meta.env.SITE_URL || 'https://zhitoujianli.com/login', target: '_blank' }],
};

export const footerData = {
  links: [
    {
      title: '产品功能',
      links: [
        { text: 'AI智能匹配', href: 'https://zhitoujianli.com/#jd-matching' },
        { text: '自动投递', href: 'https://zhitoujianli.com/#auto-delivery' },
        { text: 'AI打招呼', href: 'https://zhitoujianli.com/#smart-greeting' },
      ],
    },
    {
      title: '博客分类',
      links: [
        { text: '产品动态', href: '/blog/category/product-updates/' },
        { text: '求职指南', href: '/blog/category/job-guide/' },
        { text: '职场建议', href: '/blog/category/career-advice/' },
      ],
    },
    {
      title: '帮助支持',
      links: [
        { text: '使用指南', href: 'https://zhitoujianli.com/guide' },
        { text: '常见问题', href: 'https://zhitoujianli.com/help' },
        { text: '联系我们', href: '/blog/contact/' },
      ],
    },
    {
      title: '关于我们',
      links: [
        { text: '公司介绍', href: '/blog/about/#company' },
        { text: '团队介绍', href: '/blog/about/#team' },
        { text: '合作伙伴', href: '/blog/about/#partners' },
      ],
    },
  ],
  secondaryLinks: [
    { text: '服务条款', href: '/blog/terms/' },
    { text: '隐私政策', href: '/blog/privacy/' },
  ],
  socialLinks: [],
  footNote: `
    智投简历 © 2024 · 让求职更智能 · <a class="text-blue-600 underline dark:text-muted" href="${import.meta.env.SITE_URL || 'https://zhitoujianli.com'}"> 返回首页</a>
  `,
};
