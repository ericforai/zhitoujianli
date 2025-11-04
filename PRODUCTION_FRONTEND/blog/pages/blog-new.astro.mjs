import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../chunks/astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import { $ as $$PageLayout } from '../chunks/PageLayout_CYieUw40.mjs';
import { f as findLatestPosts } from '../chunks/blog_tXIUU63a.mjs';
/* empty css                                    */
export { renderers } from '../renderers.mjs';

const $$BlogNew = createComponent(async ($$result, $$props, $$slots) => {
  const metadata = {
    title: "\u6C42\u804C\u6307\u5357 - \u667A\u6295\u7B80\u5386\u535A\u5BA2",
    description: "\u4E13\u4E1A\u7684\u6C42\u804C\u6307\u5BFC\u5185\u5BB9\uFF0C\u6DB5\u76D6\u7B80\u5386\u4F18\u5316\u3001\u9762\u8BD5\u6280\u5DE7\u3001\u804C\u573A\u53D1\u5C55\u7B49\u5404\u4E2A\u65B9\u9762\uFF0C\u52A9\u60A8\u5728\u6C42\u804C\u8DEF\u4E0A\u66F4\u52A0\u987A\u5229\u3002"
  };
  const posts = await findLatestPosts({ count: 12 });
  return renderTemplate`${renderComponent($$result, "Layout", $$PageLayout, { "metadata": metadata, "data-astro-cid-nvfuvid2": true }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="relative py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50" data-astro-cid-nvfuvid2> <div class="absolute inset-0" data-astro-cid-nvfuvid2> <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" data-astro-cid-nvfuvid2></div> <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" data-astro-cid-nvfuvid2></div> </div> <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-astro-cid-nvfuvid2> <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6" data-astro-cid-nvfuvid2>
求职指南
</h1> <p class="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed" data-astro-cid-nvfuvid2>
专业的求职指导内容，助您在求职路上更加顺利
</p> </div> </section>  <section class="py-16 bg-white" data-astro-cid-nvfuvid2> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-astro-cid-nvfuvid2> <!-- 分类筛选 --> <div class="flex flex-wrap justify-center gap-4 mb-12" data-astro-cid-nvfuvid2> <button class="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors duration-300" data-astro-cid-nvfuvid2>
全部文章
</button> <button class="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors duration-300" data-astro-cid-nvfuvid2>
求职指南
</button> <button class="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors duration-300" data-astro-cid-nvfuvid2>
简历优化
</button> <button class="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors duration-300" data-astro-cid-nvfuvid2>
面试技巧
</button> <button class="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors duration-300" data-astro-cid-nvfuvid2>
职场发展
</button> </div> <!-- 文章网格 --> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-astro-cid-nvfuvid2> ${posts.map((post) => renderTemplate`<article class="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2" data-astro-cid-nvfuvid2> <!-- 文章封面 --> <div class="aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden" data-astro-cid-nvfuvid2> ${post.image && renderTemplate`<img${addAttribute(post.image, "src")}${addAttribute(post.title, "alt")} class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-astro-cid-nvfuvid2>`} <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" data-astro-cid-nvfuvid2></div> <div class="absolute top-4 left-4" data-astro-cid-nvfuvid2> <span class="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium" data-astro-cid-nvfuvid2> ${post.category || "\u6C42\u804C\u6307\u5357"} </span> </div> </div> <!-- 文章内容 --> <div class="p-6" data-astro-cid-nvfuvid2> <div class="flex items-center text-sm text-gray-500 mb-3" data-astro-cid-nvfuvid2> <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-nvfuvid2> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" data-astro-cid-nvfuvid2></path> </svg> ${new Date(post.publishDate).toLocaleDateString("zh-CN")} </div> <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2" data-astro-cid-nvfuvid2> ${post.title} </h3> <p class="text-gray-600 mb-4 line-clamp-3 leading-relaxed" data-astro-cid-nvfuvid2> ${post.excerpt} </p> <div class="flex items-center justify-between" data-astro-cid-nvfuvid2> <a${addAttribute(post.permalink, "href")} class="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors duration-300" data-astro-cid-nvfuvid2>
阅读全文
<svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-nvfuvid2> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-astro-cid-nvfuvid2></path> </svg> </a> <div class="flex items-center text-sm text-gray-500" data-astro-cid-nvfuvid2> <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-nvfuvid2> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" data-astro-cid-nvfuvid2></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" data-astro-cid-nvfuvid2></path> </svg> ${post.readTime || "5"}分钟阅读
</div> </div> </div> </article>`)} </div> <!-- 分页 --> <div class="mt-16" data-astro-cid-nvfuvid2> <div class="flex justify-center" data-astro-cid-nvfuvid2> <a href="/blog/page/2" class="inline-flex items-center justify-center px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-xl" data-astro-cid-nvfuvid2>
查看更多文章
<svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-nvfuvid2> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" data-astro-cid-nvfuvid2></path> </svg> </a> </div> </div> </div> </section>  <section class="py-16 bg-gray-50" data-astro-cid-nvfuvid2> <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-astro-cid-nvfuvid2> <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6" data-astro-cid-nvfuvid2>
想要更多求职指导？
</h2> <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto" data-astro-cid-nvfuvid2>
订阅我们的博客，获取最新的求职技巧和职场建议
</p> <div class="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto" data-astro-cid-nvfuvid2> <input type="email" placeholder="输入您的邮箱地址" class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" data-astro-cid-nvfuvid2> <button class="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-300" data-astro-cid-nvfuvid2>
订阅
</button> </div> </div> </section> ` })} `;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/blog-new.astro", void 0);

const $$file = "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/blog-new.astro";
const $$url = "/blog-new/";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$BlogNew,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
