import { c as createComponent, r as renderComponent, a as renderTemplate, F as Fragment, m as maybeRenderHead } from '../chunks/astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import { $ as $$PageLayout, a as $$Button } from '../chunks/PageLayout_CYieUw40.mjs';
import { $ as $$SimpleHero, a as $$Note } from '../chunks/Note_pil6T0nV.mjs';
import { $ as $$Features } from '../chunks/Features_C2h73s6r.mjs';
import { $ as $$BlogLatestPosts } from '../chunks/BlogLatestPosts_zYDqQzy9.mjs';
import { $ as $$CallToAction } from '../chunks/CallToAction_DR3nJ6Q_.mjs';
export { renderers } from '../renderers.mjs';

const $$Home = createComponent(($$result, $$props, $$slots) => {
  const metadata = {
    title: "\u667A\u6295\u7B80\u5386\u535A\u5BA2 \u2014 \u8BA9\u6C42\u804C\u66F4\u667A\u80FD",
    ignoreTitleTemplate: true
  };
  return renderTemplate`${renderComponent($$result, "Layout", $$PageLayout, { "metadata": metadata }, { "default": ($$result2) => renderTemplate`  ${renderComponent($$result2, "SimpleHero", $$SimpleHero, {}, { "actions": ($$result3) => renderTemplate`${renderComponent($$result3, "Fragment", Fragment, { "slot": "actions" }, { "default": ($$result4) => renderTemplate` ${renderComponent($$result4, "Button", $$Button, { "variant": "primary", "href": "http://115.190.182.95/login", "target": "_blank" }, { "default": ($$result5) => renderTemplate` 立即体验 ` })} ${renderComponent($$result4, "Button", $$Button, { "variant": "secondary", "href": "#features" }, { "default": ($$result5) => renderTemplate` 了解更多 ` })} ` })}`, "subtitle": ($$result3) => renderTemplate`${renderComponent($$result3, "Fragment", Fragment, { "slot": "subtitle" }, { "default": ($$result4) => renderTemplate`
分享求职技巧、简历优化、面试经验、职场发展等实用内容，助你更快拿到心仪Offer。
      基于AI技术的智能求职平台，为求职者提供全方位的职业发展支持。
` })}`, "title": ($$result3) => renderTemplate`${renderComponent($$result3, "Fragment", Fragment, { "slot": "title" }, { "default": ($$result4) => renderTemplate`
智投简历${maybeRenderHead()}<span class="hidden xl:inline">官方博客</span> <span class="text-accent dark:text-white"> 让求职更智能</span> ` })}` })}  ${renderComponent($$result2, "Note", $$Note, { "title": "\u6838\u5FC3\u7406\u5FF5:", "description": "\u4E13\u4E1A\u3001\u5B9E\u7528\u3001\u9AD8\u6548 - \u8BA9\u6BCF\u4E00\u6B21\u6C42\u804C\u90FD\u66F4\u7CBE\u51C6" })}  ${renderComponent($$result2, "Features", $$Features, { "id": "features", "tagline": "\u535A\u5BA2\u7279\u8272", "title": "\u667A\u6295\u7B80\u5386\u535A\u5BA2\u4E3A\u60A8\u63D0\u4F9B", "subtitle": "\u4E13\u4E1A\u7684\u6C42\u804C\u6307\u5BFC\u5185\u5BB9\uFF0C\u6DB5\u76D6\u7B80\u5386\u4F18\u5316\u3001\u9762\u8BD5\u6280\u5DE7\u3001\u804C\u573A\u53D1\u5C55\u7B49\u5404\u4E2A\u65B9\u9762\uFF0C\u52A9\u60A8\u5728\u6C42\u804C\u8DEF\u4E0A\u66F4\u52A0\u987A\u5229\u3002", "items": [
    {
      title: "\u4E13\u4E1A\u6C42\u804C\u6307\u5BFC",
      description: "\u7531\u8D44\u6DF1HR\u548C\u804C\u4E1A\u89C4\u5212\u5E08\u64B0\u5199\uFF0C\u63D0\u4F9B\u6700\u5B9E\u7528\u7684\u6C42\u804C\u6280\u5DE7\u548C\u804C\u573A\u5EFA\u8BAE\uFF0C\u5E2E\u52A9\u60A8\u63D0\u5347\u6C42\u804C\u6210\u529F\u7387\u3002",
      icon: "tabler:user-check"
    },
    {
      title: "\u7B80\u5386\u4F18\u5316\u6280\u5DE7",
      description: "\u8BE6\u7EC6\u7684\u7B80\u5386\u4F18\u5316\u6307\u5357\uFF0C\u4ECE\u683C\u5F0F\u5230\u5185\u5BB9\uFF0C\u4ECE\u5173\u952E\u8BCD\u5230\u6392\u7248\uFF0C\u5168\u65B9\u4F4D\u63D0\u5347\u7B80\u5386\u8D28\u91CF\u3002",
      icon: "tabler:file-text"
    },
    {
      title: "\u9762\u8BD5\u51C6\u5907\u6307\u5357",
      description: "\u5168\u9762\u7684\u9762\u8BD5\u51C6\u5907\u653B\u7565\uFF0C\u5305\u62EC\u5E38\u89C1\u95EE\u9898\u56DE\u7B54\u3001\u9762\u8BD5\u6280\u5DE7\u3001\u5FC3\u7406\u51C6\u5907\u7B49\uFF0C\u8BA9\u60A8\u9762\u8BD5\u66F4\u81EA\u4FE1\u3002",
      icon: "tabler:message-circle"
    },
    {
      title: "\u804C\u573A\u53D1\u5C55\u5EFA\u8BAE",
      description: "\u804C\u4E1A\u89C4\u5212\u548C\u53D1\u5C55\u5EFA\u8BAE\uFF0C\u5E2E\u52A9\u60A8\u660E\u786E\u804C\u4E1A\u65B9\u5411\uFF0C\u5236\u5B9A\u53D1\u5C55\u8BA1\u5212\uFF0C\u5B9E\u73B0\u804C\u4E1A\u76EE\u6807\u3002",
      icon: "tabler:trending-up"
    },
    {
      title: "\u884C\u4E1A\u8D8B\u52BF\u5206\u6790",
      description: "\u6700\u65B0\u7684\u884C\u4E1A\u52A8\u6001\u548C\u5C31\u4E1A\u8D8B\u52BF\u5206\u6790\uFF0C\u5E2E\u52A9\u60A8\u4E86\u89E3\u5E02\u573A\u53D8\u5316\uFF0C\u628A\u63E1\u6C42\u804C\u673A\u4F1A\u3002",
      icon: "tabler:chart-line"
    },
    {
      title: "\u6210\u529F\u6848\u4F8B\u5206\u4EAB",
      description: "\u771F\u5B9E\u7684\u6C42\u804C\u6210\u529F\u6848\u4F8B\u5206\u4EAB\uFF0C\u5B66\u4E60\u4ED6\u4EBA\u7684\u7ECF\u9A8C\uFF0C\u4E3A\u81EA\u5DF1\u7684\u6C42\u804C\u4E4B\u8DEF\u63D0\u4F9B\u53C2\u8003\u3002",
      icon: "tabler:trophy"
    }
  ] })}  ${renderComponent($$result2, "BlogLatestPosts", $$BlogLatestPosts, { "title": "\u6700\u65B0\u535A\u5BA2\u6587\u7AE0", "count": 8, "information": `\u667A\u6295\u7B80\u5386\u535A\u5BA2\u6301\u7EED\u66F4\u65B0\uFF0C\u4E3A\u60A8\u63D0\u4F9B\u6700\u65B0\u7684\u6C42\u804C\u6307\u5BFC\u5185\u5BB9\u3002
                        \u6BCF\u7BC7\u6587\u7AE0\u90FD\u7ECF\u8FC7\u7CBE\u5FC3\u7F16\u5199\uFF0C\u65E8\u5728\u5E2E\u52A9\u60A8\u5728\u6C42\u804C\u8DEF\u4E0A\u66F4\u52A0\u987A\u5229\u3002
                        \u4ECE\u7B80\u5386\u4F18\u5316\u5230\u9762\u8BD5\u6280\u5DE7\uFF0C\u4ECE\u804C\u573A\u53D1\u5C55\u5230\u884C\u4E1A\u8D8B\u52BF\uFF0C\u6211\u4EEC\u4E3A\u60A8\u63D0\u4F9B\u5168\u65B9\u4F4D\u7684\u4E13\u4E1A\u6307\u5BFC\u3002
                ` })}  ${renderComponent($$result2, "CallToAction", $$CallToAction, {}, { "actions": ($$result3) => renderTemplate`${renderComponent($$result3, "Fragment", Fragment, { "slot": "actions" }, { "default": ($$result4) => renderTemplate` ${renderComponent($$result4, "Button", $$Button, { "variant": "primary", "href": "http://115.190.182.95/login", "target": "_blank" }, { "default": ($$result5) => renderTemplate` 立即体验智投简历 ` })} ` })}`, "subtitle": ($$result3) => renderTemplate`${renderComponent($$result3, "Fragment", Fragment, { "slot": "subtitle" }, { "default": ($$result4) => renderTemplate`
让AI为您的求职之路助力，提升投递成功率，更快拿到心仪Offer。 <br class="hidden md:inline">
立即开始您的智能求职之旅！
` })}`, "title": ($$result3) => renderTemplate`${renderComponent($$result3, "Fragment", Fragment, { "slot": "title" }, { "default": ($$result4) => renderTemplate`
智投简历&nbsp;+&nbsp;<br class="block sm:hidden"><span class="sm:whitespace-nowrap">AI智能匹配</span> ` })}` })} ` })}`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/home.astro", void 0);

const $$file = "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/home.astro";
const $$url = "/home/";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Home,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
