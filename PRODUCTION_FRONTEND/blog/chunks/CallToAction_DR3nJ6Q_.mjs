import { c as createComponent, f as createAstro, r as renderComponent, a as renderTemplate, m as maybeRenderHead, F as Fragment, u as unescapeHTML } from './astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import { $ as $$WidgetWrapper } from './WidgetWrapper_u12n9mzQ.mjs';
import { $ as $$Headline } from './Headline_BLeHX4ag.mjs';
import { a as $$Button } from './PageLayout_CYieUw40.mjs';

const $$Astro = createAstro();
const $$CallToAction = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$CallToAction;
  const {
    title = await Astro2.slots.render("title"),
    subtitle = await Astro2.slots.render("subtitle"),
    tagline = await Astro2.slots.render("tagline"),
    actions = await Astro2.slots.render("actions"),
    id,
    isDark = false,
    classes = {},
    bg = await Astro2.slots.render("bg")
  } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "WidgetWrapper", $$WidgetWrapper, { "id": id, "isDark": isDark, "containerClass": `max-w-7xl mx-auto ${classes?.container ?? ""}`, "bg": bg }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="relative overflow-hidden"> <!-- 背景装饰 --> <div class="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div> <div class="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div> <div class="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-accent/10 to-transparent rounded-full blur-3xl"></div> <div class="relative max-w-4xl mx-auto text-center p-8 md:p-12 card"> ${renderComponent($$result2, "Headline", $$Headline, { "title": title, "subtitle": subtitle, "tagline": tagline, "classes": {
    container: "mb-0 md:mb-0",
    title: "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 font-heading",
    subtitle: "text-lg md:text-xl text-muted leading-relaxed"
  } })} ${actions && renderTemplate`<div class="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8"> ${Array.isArray(actions) ? actions.map((action) => renderTemplate`<div class="flex w-full sm:w-auto"> ${renderComponent($$result2, "Button", $$Button, { ...action || {}, "class": "w-full sm:w-auto px-8 py-3 text-base font-semibold" })} </div>`) : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`${unescapeHTML(actions)}` })}`} </div>`} </div> </div> ` })}`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/components/widgets/CallToAction.astro", void 0);

export { $$CallToAction as $ };
