import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import { $ as $$PageLayout } from '../chunks/PageLayout_CYieUw40.mjs';
import { a as $$Icon } from '../chunks/Layout_ClwenmRe.mjs';
import { $ as $$Breadcrumb } from '../chunks/Breadcrumb_CtB7Z_gT.mjs';
export { renderers } from '../renderers.mjs';

const $$ContactNew = createComponent(($$result, $$props, $$slots) => {
  const metadata = {
    title: "\u8054\u7CFB\u6211\u4EEC - \u667A\u6295\u7B80\u5386",
    description: "\u667A\u6295\u7B80\u5386\u8054\u7CFB\u65B9\u5F0F\uFF0C\u5305\u62EC\u5BA2\u670D\u70ED\u7EBF\u3001\u90AE\u7BB1\u5730\u5740\u3001\u5FAE\u4FE1\u5BA2\u670D\u7B49\u591A\u79CD\u8054\u7CFB\u65B9\u5F0F\uFF0C\u4E3A\u60A8\u63D0\u4F9B\u4E13\u4E1A\u7684\u6C42\u804C\u670D\u52A1\u652F\u6301\u3002"
  };
  return renderTemplate`${renderComponent($$result, "Layout", $$PageLayout, { "metadata": metadata }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="px-4 py-16 sm:px-6 mx-auto lg:px-8 lg:py-20 max-w-4xl"> <div class="mx-auto max-w-3xl px-4 sm:px-6"> ${renderComponent($$result2, "Breadcrumb", $$Breadcrumb, { "items": [
    { text: "\u8054\u7CFB\u6211\u4EEC", current: true }
  ] })} </div> <div class="text-center mb-16"> <h1 class="font-bold font-heading text-4xl md:text-5xl leading-tighter tracking-tighter mb-6">
联系<span class="text-accent dark:text-white">我们</span> </h1> <p class="text-xl text-muted dark:text-slate-400 max-w-3xl mx-auto">
我们随时为您提供专业的求职服务支持，让您的求职之路更加顺畅
</p> </div> <!-- 联系方式 --> <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"> <div class="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"> <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:mail", "class": "w-8 h-8 text-blue-600 dark:text-blue-400" })} </div> <h3 class="text-lg font-semibold mb-2">邮箱联系</h3> <p class="text-sm text-muted dark:text-slate-400 mb-3">24小时内回复</p> <a href="mailto:zhitoujianli@qq.com" class="text-primary hover:underline">
zhitoujianli@qq.com
</a> </div> <div class="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"> <div class="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:brand-wechat", "class": "w-8 h-8 text-green-600 dark:text-green-400" })} </div> <h3 class="text-lg font-semibold mb-2">微信客服</h3> <p class="text-sm text-muted dark:text-slate-400 mb-3">工作日9:00-18:00</p> <span class="text-primary font-medium">zhitoujianli</span> </div> <div class="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"> <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:phone", "class": "w-8 h-8 text-purple-600 dark:text-purple-400" })} </div> <h3 class="text-lg font-semibold mb-2">客服热线</h3> <p class="text-sm text-muted dark:text-slate-400 mb-3">工作日9:00-18:00</p> <a href="tel:400-123-4567" class="text-primary hover:underline">
400-123-4567
</a> </div> <div class="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"> <div class="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:brand-qq", "class": "w-8 h-8 text-orange-600 dark:text-orange-400" })} </div> <h3 class="text-lg font-semibold mb-2">QQ群</h3> <p class="text-sm text-muted dark:text-slate-400 mb-3">用户交流群</p> <span class="text-primary font-medium">123456789</span> </div> </div> <!-- 服务时间 --> <div class="bg-gray-50 dark:bg-slate-800 rounded-lg p-8 mb-16"> <h2 class="text-2xl font-bold font-heading mb-6 text-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:clock", "class": "w-6 h-6 inline-block mr-2 text-primary" })}
服务时间
</h2> <div class="grid md:grid-cols-2 gap-8"> <div> <h3 class="text-lg font-semibold mb-4 text-green-600 dark:text-green-400"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:check", "class": "w-5 h-5 inline-block mr-2" })}
在线客服
</h3> <ul class="space-y-2 text-muted dark:text-slate-400"> <li>• 工作日：9:00 - 18:00</li> <li>• 周末：10:00 - 17:00</li> <li>• 节假日：10:00 - 16:00</li> <li>• 响应时间：5分钟内</li> </ul> </div> <div> <h3 class="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:mail", "class": "w-5 h-5 inline-block mr-2" })}
邮箱支持
</h3> <ul class="space-y-2 text-muted dark:text-slate-400"> <li>• 24小时内回复</li> <li>• 紧急问题：2小时内回复</li> <li>• 支持附件发送</li> <li>• 支持详细技术咨询</li> </ul> </div> </div> </div> <!-- 常见问题快速链接 --> <div class="text-center"> <h2 class="text-2xl font-bold font-heading mb-6">
常见问题快速解答
</h2> <div class="grid md:grid-cols-3 gap-6"> <a href="/faq#account" class="block p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:user", "class": "w-8 h-8 text-primary mx-auto mb-3" })} <h3 class="font-semibold mb-2">账户问题</h3> <p class="text-sm text-muted dark:text-slate-400">注册、登录、密码重置等</p> </a> <a href="/faq#resume" class="block p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:file-text", "class": "w-8 h-8 text-primary mx-auto mb-3" })} <h3 class="font-semibold mb-2">简历功能</h3> <p class="text-sm text-muted dark:text-slate-400">上传、解析、优化等</p> </a> <a href="/faq#ai" class="block p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:brain", "class": "w-8 h-8 text-primary mx-auto mb-3" })} <h3 class="font-semibold mb-2">AI匹配</h3> <p class="text-sm text-muted dark:text-slate-400">智能匹配、评分等</p> </a> </div> </div> </section> ` })}`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/contact-new.astro", void 0);

const $$file = "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/contact-new.astro";
const $$url = "/contact-new/";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ContactNew,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
