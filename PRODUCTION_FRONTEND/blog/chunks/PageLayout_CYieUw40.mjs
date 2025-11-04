import { c as createComponent, m as maybeRenderHead, a as renderTemplate, f as createAstro, b as addAttribute, r as renderComponent, g as renderSlot, s as spreadAttributes, F as Fragment, u as unescapeHTML } from './astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import { a as $$Icon, $ as $$Layout } from './Layout_ClwenmRe.mjs';
import 'clsx';
import { U as UI, t as trimSlash, S as SITE, g as getHomePermalink, d as getBlogPermalink, a as getPermalink } from './consts_DF0DE_Q3.mjs';
import { twMerge } from 'tailwind-merge';

const $$Logo = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="flex items-center"> <img src="/images/logo.png" alt="智投简历" class="h-8 w-auto mr-2 transition-transform duration-200 hover:scale-105"> <span class="self-center ml-2 rtl:ml-0 rtl:mr-2 text-2xl md:text-xl font-bold text-gray-900 whitespace-nowrap dark:text-white">
智投简历博客
</span> </div>`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/components/Logo.astro", void 0);

const $$Astro$5 = createAstro();
const $$ToggleTheme = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$ToggleTheme;
  const {
    label = "Toggle between Dark and Light mode",
    class: className = "text-muted dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 inline-flex items-center",
    iconClass = "w-6 h-6",
    iconName = "tabler:sun"
  } = Astro2.props;
  return renderTemplate`${!(UI.theme.endsWith(":only")) && renderTemplate`${maybeRenderHead()}<button type="button"${addAttribute(className, "class")}${addAttribute(label, "aria-label")} data-aw-toggle-color-scheme>${renderComponent($$result, "Icon", $$Icon, { "name": iconName, "class": iconClass })}</button>`}`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/components/common/ToggleTheme.astro", void 0);

const $$Astro$4 = createAstro();
const $$ToggleMenu = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$ToggleMenu;
  const {
    label = "Toggle Menu",
    class: className = "flex flex-col h-12 w-12 rounded justify-center items-center cursor-pointer group"
  } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<button type="button"${addAttribute(className, "class")}${addAttribute(label, "aria-label")} data-aw-toggle-menu> <span class="sr-only">${label}</span> ${renderSlot($$result, $$slots["default"], renderTemplate` <span aria-hidden="true" class="h-0.5 w-6 my-1 rounded-full bg-black dark:bg-white transition ease transform duration-200 opacity-80 group-[.expanded]:rotate-45 group-[.expanded]:translate-y-2.5"></span> <span aria-hidden="true" class="h-0.5 w-6 my-1 rounded-full bg-black dark:bg-white transition ease transform duration-200 opacity-80 group-[.expanded]:opacity-0"></span> <span aria-hidden="true" class="h-0.5 w-6 my-1 rounded-full bg-black dark:bg-white transition ease transform duration-200 opacity-80 group-[.expanded]:-rotate-45 group-[.expanded]:-translate-y-2.5"></span> `)} </button>`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/components/common/ToggleMenu.astro", void 0);

const $$Astro$3 = createAstro();
const $$Button = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Button;
  const {
    variant = "secondary",
    target,
    text = Astro2.slots.render("default"),
    icon = "",
    class: className = "",
    type,
    ...rest
  } = Astro2.props;
  const variants = {
    primary: "inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200",
    secondary: "inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:border-blue-600 hover:text-blue-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200",
    tertiary: "inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200",
    link: "inline-flex items-center text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors duration-200"
  };
  return renderTemplate`${type === "button" || type === "submit" || type === "reset" ? renderTemplate`${maybeRenderHead()}<button${addAttribute(type, "type")}${addAttribute(twMerge(variants[variant] || "", className), "class")}${spreadAttributes(rest)}>${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${unescapeHTML(text)}` })}${icon && renderTemplate`${renderComponent($$result, "Icon", $$Icon, { "name": icon, "class": "w-5 h-5 ml-1 -mr-1.5 rtl:mr-1 rtl:-ml-1.5 inline-block" })}`}</button>` : renderTemplate`<a${addAttribute(twMerge(variants[variant] || "", className), "class")}${spreadAttributes(target ? { target, rel: "noopener noreferrer" } : {})}${spreadAttributes(rest)}>${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${unescapeHTML(text)}` })}${icon && renderTemplate`${renderComponent($$result, "Icon", $$Icon, { "name": icon, "class": "w-5 h-5 ml-1 -mr-1.5 rtl:mr-1 rtl:-ml-1.5 inline-block" })}`}</a>`}`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/components/ui/Button.astro", void 0);

const $$Astro$2 = createAstro();
const $$Header = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Header;
  const {
    id = "header",
    links = [],
    actions = [],
    isSticky = false,
    isDark = false,
    isFullWidth = false,
    showToggleTheme = false,
    position = "center"
  } = Astro2.props;
  const currentPath = `/${trimSlash(new URL(Astro2.url).pathname)}`;
  return renderTemplate`${maybeRenderHead()}<header${addAttribute([
    { sticky: isSticky, relative: !isSticky, dark: isDark },
    "top-0 z-50 flex-none mx-auto w-full bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all duration-300 ease-in-out"
  ], "class:list")}${spreadAttributes(isSticky ? { "data-aw-sticky-header": true } : {})}${spreadAttributes(id ? { id } : {})}> <div${addAttribute([
    "relative text-default py-4 px-4 md:px-6 mx-auto w-full",
    {
      "md:flex md:justify-between": position !== "center"
    },
    {
      "md:grid md:grid-cols-3 md:items-center": position === "center"
    },
    {
      "max-w-7xl": !isFullWidth
    }
  ], "class:list")}> <!-- Logo 区域 --> <div${addAttribute([{ "mr-auto rtl:mr-0 rtl:ml-auto": position === "right" }, "flex justify-between items-center"], "class:list")}> <a class="flex items-center hover:opacity-80 transition-all duration-200 group" href="/" aria-label="返回智投简历首页" title="点击返回智投简历首页"> ${renderComponent($$result, "Logo", $$Logo, {})} </a> <div class="flex items-center md:hidden"> ${renderComponent($$result, "ToggleMenu", $$ToggleMenu, { "label": "\u5207\u6362\u83DC\u5355" })} </div> </div> <!-- 导航菜单 --> <nav class="items-center w-full md:w-auto hidden md:flex md:mx-8 text-default overflow-y-auto overflow-x-hidden md:overflow-y-visible md:overflow-x-auto md:justify-self-center" aria-label="Main navigation"> <ul class="flex flex-col md:flex-row md:self-center w-full md:w-auto text-base md:text-sm tracking-wide font-medium md:justify-center space-y-2 md:space-y-0 md:space-x-1"> ${links.map(({ text, href, links: links2 }) => renderTemplate`<li${addAttribute(links2?.length ? "dropdown" : "", "class")}> ${links2?.length ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate` <button type="button" class="hover:text-blue-600 dark:hover:text-white px-4 py-2 flex items-center whitespace-nowrap rounded-lg transition-all duration-200 hover:bg-blue-50 hover:shadow-sm"> ${text}${" "} ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:chevron-down", "class": "w-4 h-4 ml-1 rtl:ml-0 rtl:mr-1 hidden md:inline transition-transform duration-200" })} </button> <ul class="dropdown-menu md:backdrop-blur-md dark:md:bg-dark rounded-lg md:absolute pl-4 md:pl-0 md:hidden font-medium md:bg-page md:min-w-[200px] shadow-xl border border-subtle"> ${links2.map(({ text: text2, href: href2 }) => renderTemplate`<li> <a${addAttribute([
    "first:rounded-t-lg last:rounded-b-lg md:hover:bg-light hover:text-primary dark:hover:text-white dark:hover:bg-gray-700 py-3 px-5 block whitespace-no-wrap transition-all duration-200",
    { "aw-link-active": href2 === currentPath }
  ], "class:list")}${addAttribute(href2, "href")}> ${text2} </a> </li>`)} </ul> ` })}` : renderTemplate`<a${addAttribute([
    "hover:text-blue-600 dark:hover:text-white px-4 py-2 flex items-center whitespace-nowrap rounded-lg transition-all duration-200 hover:bg-blue-50 hover:shadow-sm",
    { "text-blue-600 bg-blue-50 shadow-sm": href === currentPath }
  ], "class:list")}${addAttribute(href, "href")}> ${text} </a>`} </li>`)} </ul> </nav> <!-- 右侧操作区域 --> <div${addAttribute([
    { "ml-auto rtl:ml-0 rtl:mr-auto": position === "left" },
    "hidden md:self-center md:flex items-center md:mb-0 fixed w-full md:w-auto md:static justify-end left-0 rtl:left-auto rtl:right-0 bottom-0 p-4 md:p-0 md:justify-self-end"
  ], "class:list")}> <div class="items-center flex justify-between w-full md:w-auto space-x-4"> <div class="flex items-center space-x-2"> ${showToggleTheme && renderTemplate`${renderComponent($$result, "ToggleTheme", $$ToggleTheme, { "iconClass": "w-5 h-5 md:w-4 md:h-4 md:inline-block" })}`} </div> ${actions?.length ? renderTemplate`<div class="flex items-center space-x-3"> ${actions.map((btnProps) => renderTemplate`${renderComponent($$result, "Button", $$Button, { ...btnProps, "class": "py-2 px-4 font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200" })}`)} </div>` : ""} </div> </div> </div> </header>`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/components/widgets/Header.astro", void 0);

const $$Astro$1 = createAstro();
const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Footer;
  const { socialLinks = [], secondaryLinks = [], links = [], footNote = "", theme = "light" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<footer${addAttribute([{ dark: theme === "dark" }, "relative border-t border-subtle not-prose bg-light"], "class:list")}> <div class="relative max-w-7xl mx-auto px-4 sm:px-6 text-default"> <div class="py-12"> <!-- 主要内容区域 --> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8"> <!-- 品牌区域 --> <div class="lg:col-span-1"> <div class="mb-4"> <a class="inline-block font-bold text-xl text-primary hover:text-accent transition-colors duration-200"${addAttribute(getHomePermalink(), "href")}> ${SITE?.name} </a> </div> <p class="text-muted text-sm leading-relaxed mb-4">
基于AI技术的智能求职平台，为求职者提供全方位的职业发展支持。
</p> <!-- 社交媒体链接 --> ${socialLinks?.length ? renderTemplate`<div class="flex space-x-4"> ${socialLinks.map(({ text, href, icon }) => renderTemplate`<a class="text-muted hover:text-primary transition-colors duration-200 p-2 rounded-lg hover:bg-page"${addAttribute(href, "href")}${addAttribute(text, "aria-label")}> ${renderComponent($$result, "Icon", $$Icon, { "name": icon, "class": "w-5 h-5" })} </a>`)} </div>` : ""} </div> <!-- 链接区域 --> ${links.map(({ title, links: links2 }) => renderTemplate`<div> <h3 class="font-semibold text-default mb-4">${title}</h3> <ul class="space-y-3"> ${links2.map(({ text, href }) => renderTemplate`<li> <a class="text-muted hover:text-primary transition-colors duration-200 text-sm"${addAttribute(href, "href")}>${unescapeHTML(text)}</a> </li>`)} </ul> </div>`)} </div> <!-- 底部区域 --> <div class="pt-8 border-t border-subtle"> <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"> <div class="text-sm text-muted"> ${footNote ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${unescapeHTML(footNote)}` })}` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`© 2024 ${SITE?.name} · 让求职更智能` })}`} </div> ${secondaryLinks?.length ? renderTemplate`<div class="flex flex-wrap gap-4 text-sm"> ${secondaryLinks.map(({ text, href }, index) => renderTemplate`<a class="text-muted hover:text-primary transition-colors duration-200"${addAttribute(href, "href")}>${unescapeHTML(text)}</a>`)} </div>` : ""} </div> </div> </div> </div> </footer>`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/components/widgets/Footer.astro", void 0);

const headerData = {
  links: [
    {
      text: "首页",
      href: "http://115.190.182.95"
    },
    {
      text: "博客",
      href: getBlogPermalink()
    },
    {
      text: "分类",
      links: [
        {
          text: "产品动态",
          href: getPermalink("chan3-pin3-dong4-tai4", "category")
        },
        {
          text: "求职指南",
          href: getPermalink("qiu2-zhi2-zhi3-nan2", "category")
        },
        {
          text: "职场建议",
          href: getPermalink("zhi2-chang3-jian4-yi4", "category")
        }
      ]
    },
    {
      text: "关于我们",
      href: "https://zhitoujianli.com/#about"
    }
  ],
  actions: [{ text: "立即体验", href: "http://115.190.182.95/login", target: "_blank" }]
};
const footerData = {
  links: [
    {
      title: "产品功能",
      links: [
        { text: "AI智能匹配", href: "http://115.190.182.95" },
        { text: "简历优化", href: "http://115.190.182.95" },
        { text: "精准投递", href: "http://115.190.182.95" },
        { text: "数据分析", href: "http://115.190.182.95" },
        { text: "价格方案", href: "http://115.190.182.95" }
      ]
    },
    {
      title: "博客分类",
      links: [
        { text: "产品动态", href: getPermalink("chan3-pin3-dong4-tai4", "category") },
        { text: "求职指南", href: getPermalink("qiu2-zhi2-zhi3-nan2", "category") },
        { text: "职场建议", href: getPermalink("zhi2-chang3-jian4-yi4", "category") },
        { text: "最新文章", href: getBlogPermalink() }
      ]
    },
    {
      title: "帮助支持",
      links: [
        { text: "使用指南", href: "/user-guide/" },
        { text: "常见问题", href: "/faq/" },
        { text: "联系我们", href: "/contact/" },
        { text: "意见反馈", href: "/feedback/" }
      ]
    },
    {
      title: "关于我们",
      links: [
        { text: "公司介绍", href: "/about/#company" },
        { text: "团队介绍", href: "/about/#team" },
        { text: "加入我们", href: "/careers/" },
        { text: "合作伙伴", href: "/about/#partners" }
      ]
    }
  ],
  secondaryLinks: [
    { text: "服务条款", href: "/terms/" },
    { text: "隐私政策", href: "/privacy/" }
  ],
  socialLinks: [
    { ariaLabel: "微信", icon: "tabler:brand-wechat", href: "#" },
    { ariaLabel: "微博", icon: "tabler:brand-weibo", href: "#" },
    { ariaLabel: "QQ", icon: "tabler:brand-qq", href: "#" },
    { ariaLabel: "GitHub", icon: "tabler:brand-github", href: "https://github.com/zhitoujianli" }
  ],
  footNote: `
    智投简历 © 2024 · 让求职更智能 · <a class="text-blue-600 underline dark:text-muted" href="${"http://115.190.182.95"}"> 返回首页</a>
  `
};

const $$Astro = createAstro();
const $$PageLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$PageLayout;
  const { metadata } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "metadata": metadata }, { "default": ($$result2) => renderTemplate` ${renderSlot($$result2, $$slots["header"], renderTemplate` ${renderComponent($$result2, "Header", $$Header, { ...headerData, "isSticky": true, "showToggleTheme": true })} `)} ${maybeRenderHead()}<main> ${renderSlot($$result2, $$slots["default"])} </main> ${renderSlot($$result2, $$slots["footer"], renderTemplate` ${renderComponent($$result2, "Footer", $$Footer, { ...footerData })} `)} ` })}`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/layouts/PageLayout.astro", void 0);

export { $$PageLayout as $, $$Button as a, $$Header as b, headerData as h };
