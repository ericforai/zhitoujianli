import { c as createComponent, f as createAstro, m as maybeRenderHead, r as renderComponent, a as renderTemplate, b as addAttribute } from './astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import { a as $$Icon } from './Layout_ClwenmRe.mjs';
import { d as getBlogPermalink } from './consts_DF0DE_Q3.mjs';

const $$Astro = createAstro();
const $$Breadcrumb = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Breadcrumb;
  const { items = [] } = Astro2.props;
  const defaultBreadcrumbs = [
    { text: "\u9996\u9875", href: "http://115.190.182.95" },
    { text: "\u535A\u5BA2", href: getBlogPermalink() }
  ];
  const breadcrumbs = [...defaultBreadcrumbs, ...items];
  return renderTemplate`${maybeRenderHead()}<nav aria-label="面包屑导航" class="mb-6"> <ol class="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-gray-500 dark:text-gray-400 overflow-x-auto pb-2"> ${breadcrumbs.map((item, index) => renderTemplate`<li class="flex items-center whitespace-nowrap"> ${index > 0 && renderTemplate`${renderComponent($$result, "Icon", $$Icon, { "name": "tabler:chevron-right", "class": "w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 text-gray-400 flex-shrink-0", "aria-hidden": "true" })}`} ${item.href && !item.current ? renderTemplate`<a${addAttribute(item.href, "href")} class="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 truncate max-w-[120px] md:max-w-none"${addAttribute(`\u5BFC\u822A\u5230 ${item.text}`, "aria-label")}${addAttribute(item.text, "title")}> ${item.text} </a>` : renderTemplate`<span${addAttribute(`truncate max-w-[120px] md:max-w-none ${item.current ? "text-gray-900 dark:text-white font-medium" : ""}`, "class")}${addAttribute(item.current ? "page" : void 0, "aria-current")}${addAttribute(item.text, "title")}> ${item.text} </span>`} </li>`)} </ol> </nav>`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/components/common/Breadcrumb.astro", void 0);

export { $$Breadcrumb as $ };
