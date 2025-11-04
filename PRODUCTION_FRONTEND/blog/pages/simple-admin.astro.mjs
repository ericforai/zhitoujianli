import { c as createComponent, d as renderHead, e as renderScript, a as renderTemplate } from '../chunks/astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                                        */
export { renderers } from '../renderers.mjs';

const $$SimpleAdmin = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="zh-CN" data-astro-cid-u4te725l> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex"><title>智投简历博客 - 简单管理</title>${renderHead()}</head> <body data-astro-cid-u4te725l> <div class="container" data-astro-cid-u4te725l> <h1 data-astro-cid-u4te725l>📝 智投简历博客管理</h1> <div class="new-post" data-astro-cid-u4te725l> <h2 data-astro-cid-u4te725l>创建新文章</h2> <form id="newPostForm" data-astro-cid-u4te725l> <div class="form-group" data-astro-cid-u4te725l> <label for="title" data-astro-cid-u4te725l>标题</label> <input type="text" id="title" name="title" required data-astro-cid-u4te725l> </div> <div class="form-group" data-astro-cid-u4te725l> <label for="excerpt" data-astro-cid-u4te725l>摘要</label> <textarea id="excerpt" name="excerpt" rows="3" data-astro-cid-u4te725l></textarea> </div> <div class="form-group" data-astro-cid-u4te725l> <label for="category" data-astro-cid-u4te725l>分类</label> <input type="text" id="category" name="category" placeholder="例如：技术深度" data-astro-cid-u4te725l> </div> <div class="form-group" data-astro-cid-u4te725l> <label for="tags" data-astro-cid-u4te725l>标签（用逗号分隔）</label> <input type="text" id="tags" name="tags" placeholder="例如：AI,求职,简历" data-astro-cid-u4te725l> </div> <div class="form-group" data-astro-cid-u4te725l> <label for="content" data-astro-cid-u4te725l>内容（Markdown格式）</label> <textarea id="content" name="content" required data-astro-cid-u4te725l></textarea> </div> <button type="submit" class="btn" data-astro-cid-u4te725l>创建文章</button> </form> </div> <div class="post-list" data-astro-cid-u4te725l> <h2 data-astro-cid-u4te725l>现有文章</h2> <div id="postsList" data-astro-cid-u4te725l> <p data-astro-cid-u4te725l>正在加载文章列表...</p> </div> </div> </div> ${renderScript($$result, "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/simple-admin.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/simple-admin.astro", void 0);

const $$file = "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/simple-admin.astro";
const $$url = "/simple-admin/";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$SimpleAdmin,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
