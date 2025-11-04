import { c as createComponent, f as createAstro, r as renderComponent, a as renderTemplate, m as maybeRenderHead, u as unescapeHTML } from './astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import { $ as $$Grid } from './Grid_DxHY0OZo.mjs';
import { d as getBlogPermalink } from './consts_DF0DE_Q3.mjs';
import { f as findLatestPosts } from './blog_tXIUU63a.mjs';
import { $ as $$WidgetWrapper } from './WidgetWrapper_u12n9mzQ.mjs';
import { a as $$Button } from './PageLayout_CYieUw40.mjs';

const $$Astro = createAstro();
const $$BlogLatestPosts = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BlogLatestPosts;
  const {
    title = await Astro2.slots.render("title"),
    linkText = "View all posts",
    linkUrl = getBlogPermalink(),
    information = await Astro2.slots.render("information"),
    count = 8,
    id,
    isDark = false,
    classes = {},
    bg = await Astro2.slots.render("bg")
  } = Astro2.props;
  const posts = await findLatestPosts({ count }) ;
  return renderTemplate`${renderTemplate`${renderComponent($$result, "WidgetWrapper", $$WidgetWrapper, { "id": id, "isDark": isDark, "containerClass": `max-w-7xl ${classes?.container}`, "bg": bg }, { "default": async ($$result2) => renderTemplate`${maybeRenderHead()}<div class="text-center mb-12">${title && renderTemplate`<h2 class="text-3xl md:text-4xl font-bold tracking-tight font-heading mb-4 text-default">${title}</h2>`}${information && renderTemplate`<p class="text-muted text-lg max-w-3xl mx-auto leading-relaxed">${unescapeHTML(information)}</p>`}${linkText && linkUrl && renderTemplate`<div class="mt-6">${renderComponent($$result2, "Button", $$Button, { "variant": "secondary", "href": linkUrl, "class": "inline-flex items-center" }, { "default": async ($$result3) => renderTemplate`${linkText}<svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>` })}</div>`}</div>${renderComponent($$result2, "Grid", $$Grid, { "posts": posts })}` })}` }`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/components/widgets/BlogLatestPosts.astro", void 0);

export { $$BlogLatestPosts as $ };
