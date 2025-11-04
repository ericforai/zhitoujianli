import { c as createComponent, d as renderHead, e as renderScript, a as renderTemplate } from '../chunks/astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                               */
export { renderers } from '../renderers.mjs';

const $$Cms = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="zh-CN" data-astro-cid-h6qsow3q> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex"><title>智投简历博客 - 内容管理系统</title><link rel="icon" href="/blog/favicon.ico"><!-- Decap CMS 样式 -->${renderHead()}</head> <body data-astro-cid-h6qsow3q> <div class="loading" id="loading" data-astro-cid-h6qsow3q>
正在加载内容管理系统...
</div> <!-- Netlify Identity Widget (可选，用于身份验证) --> ${renderScript($$result, "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/cms.astro?astro&type=script&index=0&lang.ts")} <!-- Decap CMS 核心脚本 --> ${renderScript($$result, "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/cms.astro?astro&type=script&index=1&lang.ts")} ${renderScript($$result, "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/cms.astro?astro&type=script&index=2&lang.ts")} </body> </html>`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/cms.astro", void 0);

const $$file = "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/cms.astro";
const $$url = "/cms/";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Cms,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
