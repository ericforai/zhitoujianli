import { c as createComponent, f as createAstro, m as maybeRenderHead, b as addAttribute, a as renderTemplate, r as renderComponent } from './astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import 'clsx';
import { a as getPermalink } from './consts_DF0DE_Q3.mjs';
/* empty css                         */

const $$Astro$1 = createAstro();
const $$GridItem = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$GridItem;
  const { post } = Astro2.props;
  const link = getPermalink(post.permalink, "post") ;
  function calculateReadingTime(post2) {
    if (post2.readTime && typeof post2.readTime === "number") {
      return post2.readTime;
    }
    let wordCount = 0;
    if (post2.title) {
      wordCount += post2.title.length;
    }
    if (post2.excerpt) {
      wordCount += post2.excerpt.length;
    }
    if (post2.description) {
      wordCount += post2.description.length;
    }
    const readingSpeed = 250;
    const minutes = Math.ceil(wordCount / readingSpeed);
    return Math.max(1, Math.min(minutes, 20));
  }
  return renderTemplate`${link ? renderTemplate`${maybeRenderHead()}<a${addAttribute(link, "href")} class="block h-full" data-astro-cid-naolcreu><article class="blog-card group transition intersect-once intersect-quarter motion-safe:md:opacity-0 motion-safe:md:intersect:animate-fade h-full" data-astro-cid-naolcreu><!-- 文章摘要区域 --><div class="blog-card-image" data-astro-cid-naolcreu><div class="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-6" data-astro-cid-naolcreu><div class="text-center text-white" data-astro-cid-naolcreu><p class="text-sm font-medium leading-relaxed opacity-90 text-left" data-astro-cid-naolcreu>${post.excerpt || post.title}</p></div></div></div><!-- 文章内容区域 --><div class="blog-card-content" data-astro-cid-naolcreu><!-- 文章元信息 --><div class="flex items-center text-sm text-gray-500 space-x-4" data-astro-cid-naolcreu><div class="flex items-center" data-astro-cid-naolcreu><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-naolcreu><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" data-astro-cid-naolcreu></path></svg>${new Date(post.publishDate).toLocaleDateString("zh-CN")}</div><div class="flex items-center" data-astro-cid-naolcreu><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-naolcreu><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" data-astro-cid-naolcreu></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" data-astro-cid-naolcreu></path></svg>${calculateReadingTime(post)}分钟阅读
</div></div><!-- 文章标题 --><h3 class="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2" data-astro-cid-naolcreu>${post.title}</h3><!-- 阅读全文提示 --><div class="pt-2" data-astro-cid-naolcreu><span class="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors duration-200" data-astro-cid-naolcreu>
点击阅读全文
<svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-naolcreu><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-astro-cid-naolcreu></path></svg></span></div></div></article></a>` : renderTemplate`<article class="blog-card group transition intersect-once intersect-quarter motion-safe:md:opacity-0 motion-safe:md:intersect:animate-fade h-full" data-astro-cid-naolcreu><!-- 文章摘要区域 --><div class="blog-card-image" data-astro-cid-naolcreu><div class="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-6" data-astro-cid-naolcreu><div class="text-center text-white" data-astro-cid-naolcreu><p class="text-sm font-medium leading-relaxed opacity-90 text-left" data-astro-cid-naolcreu>${post.excerpt || post.title}</p></div></div></div><!-- 文章内容区域 --><div class="blog-card-content" data-astro-cid-naolcreu><!-- 文章元信息 --><div class="flex items-center text-sm text-gray-500 space-x-4" data-astro-cid-naolcreu><div class="flex items-center" data-astro-cid-naolcreu><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-naolcreu><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" data-astro-cid-naolcreu></path></svg>${new Date(post.publishDate).toLocaleDateString("zh-CN")}</div><div class="flex items-center" data-astro-cid-naolcreu><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-naolcreu><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" data-astro-cid-naolcreu></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" data-astro-cid-naolcreu></path></svg>${calculateReadingTime(post)}分钟阅读
</div></div><!-- 文章标题 --><h3 class="text-lg font-bold text-gray-900 line-clamp-2" data-astro-cid-naolcreu>${post.title}</h3></div></article>`}`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/components/blog/GridItem.astro", void 0);

const $$Astro = createAstro();
const $$Grid = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Grid;
  const { posts } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="grid gap-8 lg:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-4"> ${posts.map((post) => renderTemplate`${renderComponent($$result, "Item", $$GridItem, { "post": post })}`)} </div>`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/components/blog/Grid.astro", void 0);

export { $$Grid as $ };
