import { c as createComponent, d as renderHead, e as renderScript, a as renderTemplate } from '../chunks/astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Admin = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex"><title>智投简历博客 - 内容管理</title>${renderHead()}</head> <body> <!-- Include the script that builds the page and powers Decap CMS --> ${renderScript($$result, "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/admin.astro?astro&type=script&index=0&lang.ts")} ${renderScript($$result, "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/admin.astro?astro&type=script&index=1&lang.ts")} </body> </html>`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/admin.astro", void 0);

const $$file = "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/admin.astro";
const $$url = "/admin/";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Admin,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
