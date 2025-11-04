import { c as createComponent, f as createAstro, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import { $ as $$PageLayout } from '../../chunks/PageLayout_CYieUw40.mjs';
import { $ as $$Headline, a as $$List, b as $$Pagination } from '../../chunks/Pagination_C9AtThBH.mjs';
import { e as getStaticPathsBlogList, h as blogListRobots } from '../../chunks/blog_tXIUU63a.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const prerender = true;
const getStaticPaths = (async ({ paginate }) => {
  return await getStaticPathsBlogList({ paginate });
});
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const { page } = Astro2.props;
  const currentPage = page.currentPage ?? 1;
  const metadata = {
    title: `Blog${currentPage > 1 ? ` \u2014 Page ${currentPage}` : ""}`,
    robots: {
      index: currentPage === 1,
      follow: blogListRobots?.follow
    },
    openGraph: {
      type: "blog"
    }
  };
  return renderTemplate`${renderComponent($$result, "Layout", $$PageLayout, { "metadata": metadata }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="px-6 sm:px-6 py-12 sm:py-16 lg:py-20 mx-auto max-w-4xl"> ${renderComponent($$result2, "Headline", $$Headline, { "subtitle": "A statically generated blog example with news, tutorials, resources and other interesting content related to AstroWind" }, { "default": async ($$result3) => renderTemplate`
The Blog
` })} ${renderComponent($$result2, "BlogList", $$List, { "posts": page.data })} ${renderComponent($$result2, "Pagination", $$Pagination, { "prevUrl": page.url.prev, "nextUrl": page.url.next })} <!--
      <PostTags tags={allCategories} class="mb-2" title="Search by Categories:" isCategory />
      <PostTags tags={allTags}  title="Search by Tags:" />
    --> </section> ` })}`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/[...blog]/[...page].astro", void 0);

const $$file = "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/[...blog]/[...page].astro";
const $$url = "/[...blog]/[...page]/";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  getStaticPaths,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
