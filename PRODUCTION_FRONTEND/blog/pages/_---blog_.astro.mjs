import { c as createComponent, f as createAstro, m as maybeRenderHead, r as renderComponent, b as addAttribute, g as renderSlot, a as renderTemplate, u as unescapeHTML, F as Fragment } from '../chunks/astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import merge from 'lodash.merge';
import { a as $$Button, $ as $$PageLayout } from '../chunks/PageLayout_CYieUw40.mjs';
import { $ as $$Tags } from '../chunks/Tags_8b7ld7UL.mjs';
import { $ as $$Breadcrumb } from '../chunks/Breadcrumb_CtB7Z_gT.mjs';
import { a as getPermalink, d as getBlogPermalink, c as getCanonical } from '../chunks/consts_DF0DE_Q3.mjs';
import { a as $$Icon, f as findImage } from '../chunks/Layout_ClwenmRe.mjs';
import { i as findPostsByIds, j as getRelatedPosts, k as blogPostRobots, l as getStaticPathsBlogPost } from '../chunks/blog_tXIUU63a.mjs';
import { $ as $$Grid } from '../chunks/Grid_DxHY0OZo.mjs';
import { $ as $$WidgetWrapper } from '../chunks/WidgetWrapper_u12n9mzQ.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro$3 = createAstro();
const $$SinglePost = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$SinglePost;
  const { post, url } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section class="py-8 sm:py-16 lg:py-20 mx-auto"> <div class="max-w-3xl mx-auto px-4 sm:px-6"> ${renderComponent($$result, "Breadcrumb", $$Breadcrumb, { "items": [
    ...post.category ? [{ text: post.category.title, href: getPermalink(post.category.slug, "category") }] : [],
    { text: post.title, current: true }
  ] })} </div> <article> <header${addAttribute(post.image ? "intersect-once intersect-quarter motion-safe:md:opacity-0 motion-safe:md:intersect:animate-fade" : "intersect-once intersect-quarter motion-safe:md:opacity-0 motion-safe:md:intersect:animate-fade", "class")}> <h1 class="px-4 sm:px-6 max-w-3xl mx-auto text-4xl md:text-5xl font-bold leading-tighter tracking-tighter font-heading"> ${post.title} </h1> <p class="max-w-3xl mx-auto mt-4 mb-8 px-4 sm:px-6 text-xl md:text-2xl text-muted dark:text-slate-400 text-justify"> ${post.excerpt} </p> <div class="max-w-3xl mx-auto px-4 sm:px-6"> <div class="border-t-2 border-blue-500 dark:border-blue-400"></div> </div> </header> <div class="mx-auto px-6 sm:px-6 max-w-3xl prose prose-md lg:prose-xl dark:prose-invert dark:prose-headings:text-slate-300 prose-headings:font-heading prose-headings:leading-tighter prose-headings:tracking-tighter prose-headings:font-bold prose-a:text-primary dark:prose-a:text-blue-400 prose-img:rounded-md prose-img:shadow-lg mt-8 prose-headings:scroll-mt-[80px] prose-li:my-0"> ${renderSlot($$result, $$slots["default"])} </div> <div class="mx-auto px-6 sm:px-6 max-w-3xl mt-8"> ${renderComponent($$result, "PostTags", $$Tags, { "tags": post.tags })} </div> </article> </section>`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/components/blog/SinglePost.astro", void 0);

const $$ToBlogLink = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="mx-auto px-6 sm:px-6 max-w-3xl pt-8 md:pt-4 pb-12 md:pb-20"> <div class="flex flex-col sm:flex-row items-center gap-3 sm:gap-4"> ${renderComponent($$result, "Button", $$Button, { "variant": "tertiary", "class": "px-3 md:px-3 w-full sm:w-auto", "href": getBlogPermalink(), "aria-label": "\u8FD4\u56DE\u535A\u5BA2\u9996\u9875" }, { "default": ($$result2) => renderTemplate`${renderTemplate`${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:chevron-left", "class": "w-5 h-5 mr-1 -ml-1.5 rtl:-mr-1.5 rtl:ml-1" })}`} 返回博客
` })} ${renderComponent($$result, "Button", $$Button, { "variant": "primary", "class": "px-3 md:px-3 w-full sm:w-auto", "href": "http://115.190.182.95", "target": "_blank", "aria-label": "\u8BBF\u95EE\u667A\u6295\u7B80\u5386\u4E3B\u7AD9" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:external-link", "class": "w-4 h-4 mr-1" })}
智投简历主站
` })} </div> </div>`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/components/blog/ToBlogLink.astro", void 0);

const $$Astro$2 = createAstro();
const $$BlogHighlightedPosts = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$BlogHighlightedPosts;
  const {
    title = await Astro2.slots.render("title"),
    linkText = "View all posts",
    linkUrl = getBlogPermalink(),
    information = await Astro2.slots.render("information"),
    postIds = [],
    id,
    isDark = false,
    classes = {},
    bg = await Astro2.slots.render("bg")
  } = Astro2.props;
  const posts = await findPostsByIds(postIds) ;
  return renderTemplate`${renderTemplate`${renderComponent($$result, "WidgetWrapper", $$WidgetWrapper, { "id": id, "isDark": isDark, "containerClass": classes?.container, "bg": bg }, { "default": async ($$result2) => renderTemplate`${maybeRenderHead()}<div class="flex flex-col lg:justify-between lg:flex-row mb-8">${title && renderTemplate`<div class="md:max-w-sm"><h2 class="text-3xl font-bold tracking-tight sm:text-4xl sm:leading-none group font-heading mb-2">${unescapeHTML(title)}</h2>${linkText && linkUrl && renderTemplate`<a class="text-muted dark:text-slate-400 hover:text-primary transition ease-in duration-200 block mb-6 lg:mb-0"${addAttribute(linkUrl, "href")}>${linkText} »
</a>`}</div>`}${information && renderTemplate`<p class="text-muted dark:text-slate-400 lg:text-sm lg:max-w-md">${unescapeHTML(information)}</p>`}</div>${renderComponent($$result2, "Grid", $$Grid, { "posts": posts })}` })}` }`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/components/widgets/BlogHighlightedPosts.astro", void 0);

const $$Astro$1 = createAstro();
const $$RelatedPosts = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$RelatedPosts;
  const { post } = Astro2.props;
  const relatedPosts = post.tags ? await getRelatedPosts(post, 4) : [];
  return renderTemplate`${renderTemplate`${renderComponent($$result, "BlogHighlightedPosts", $$BlogHighlightedPosts, { "classes": {
    container: "pt-0 lg:pt-0 md:pt-0 intersect-once intersect-quarter motion-safe:md:opacity-0 motion-safe:md:intersect:animate-fade"
  }, "title": "Related Posts", "linkText": "View All Posts", "linkUrl": getBlogPermalink(), "postIds": relatedPosts.map((post2) => post2.id) })}` }`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/components/blog/RelatedPosts.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const prerender = true;
const getStaticPaths = (async () => {
  return await getStaticPathsBlogPost();
});
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const { post } = Astro2.props;
  const url = getCanonical(getPermalink(post.permalink, "post"));
  const image = await findImage(post.image);
  const metadata = merge(
    {
      title: post.title,
      description: post.excerpt,
      keywords: post.keywords || "",
      robots: {
        index: blogPostRobots?.index,
        follow: blogPostRobots?.follow
      },
      openGraph: {
        type: "article",
        ...image ? { images: [{ url: image, width: image?.width, height: image?.height }] } : {}
      }
    },
    { ...post?.metadata ? { ...post.metadata, canonical: post.metadata?.canonical || url } : {} }
  );
  return renderTemplate`${renderComponent($$result, "Layout", $$PageLayout, { "metadata": metadata }, { "default": async ($$result2) => renderTemplate`${post.structuredData && renderTemplate(_a || (_a = __template(['<script type="application/ld+json">', "<\/script>"])), unescapeHTML(post.structuredData))}${renderComponent($$result2, "SinglePost", $$SinglePost, { "post": { ...post, image }, "url": url }, { "default": async ($$result3) => renderTemplate`${post.Content ? renderTemplate`${renderComponent($$result3, "post.Content", post.Content, {})}` : renderTemplate`${renderComponent($$result3, "Fragment", Fragment, {}, { "default": async ($$result4) => renderTemplate`${unescapeHTML(post.content || "")}` })}`}` })} ${renderComponent($$result2, "ToBlogLink", $$ToBlogLink, {})} ${renderComponent($$result2, "RelatedPosts", $$RelatedPosts, { "post": post })} ` })}`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/[...blog]/index.astro", void 0);

const $$file = "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/[...blog]/index.astro";
const $$url = "/[...blog]/";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  getStaticPaths,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
