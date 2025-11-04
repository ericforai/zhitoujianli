import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../chunks/astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import { $ as $$Layout, a as $$Icon } from '../chunks/Layout_ClwenmRe.mjs';
import { g as getHomePermalink } from '../chunks/consts_DF0DE_Q3.mjs';
import { $ as $$Breadcrumb } from '../chunks/Breadcrumb_CtB7Z_gT.mjs';
export { renderers } from '../renderers.mjs';

const $$404 = createComponent(($$result, $$props, $$slots) => {
  const title = `\u9875\u9762\u672A\u627E\u5230 - 404\u9519\u8BEF`;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "metadata": { title } }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="flex items-center min-h-[60vh] p-16"> <div class="container flex flex-col items-center justify-center px-5 mx-auto my-8"> <div class="max-w-lg text-center"> ${renderComponent($$result2, "Breadcrumb", $$Breadcrumb, { "items": [
    { text: "\u9875\u9762\u672A\u627E\u5230", current: true }
  ] })} <div class="mb-8"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:file-x", "class": "w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" })} <h2 class="mb-4 font-bold text-6xl md:text-7xl"> <span class="sr-only">错误</span> <span class="text-primary">404</span> </h2> </div> <h1 class="text-2xl md:text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
抱歉，页面未找到
</h1> <p class="mt-4 mb-8 text-lg text-muted dark:text-slate-400 leading-relaxed">
您访问的页面可能已被删除、重命名或暂时不可用。<br>
请检查URL是否正确，或者返回首页继续浏览。
</p> <div class="flex flex-col sm:flex-row gap-4 justify-center"> <a rel="noopener noreferrer" href="http://115.190.182.95" class="btn btn-primary inline-flex items-center justify-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:home", "class": "w-4 h-4 mr-2" })}
返回首页
</a> <a rel="noopener noreferrer"${addAttribute(getHomePermalink(), "href")} class="btn btn-secondary inline-flex items-center justify-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:book", "class": "w-4 h-4 mr-2" })}
博客首页
</a> </div> <div class="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"> <p class="text-sm text-muted dark:text-slate-400"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:bulb", "class": "w-4 h-4 inline mr-1" })}
建议：您可以尝试搜索相关内容，或查看我们的最新文章
</p> </div> </div> </div> </section> ` })}`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/404.astro", void 0);

const $$file = "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/404.astro";
const $$url = "/404/";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
