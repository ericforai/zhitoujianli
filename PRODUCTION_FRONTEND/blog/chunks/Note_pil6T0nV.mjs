import { c as createComponent, f as createAstro, m as maybeRenderHead, g as renderSlot, a as renderTemplate, r as renderComponent, u as unescapeHTML } from './astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import 'clsx';
import { a as $$Icon } from './Layout_ClwenmRe.mjs';

const $$Astro$1 = createAstro();
const $$SimpleHero = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$SimpleHero;
  const {
    title = await Astro2.slots.render("title"),
    subtitle = await Astro2.slots.render("subtitle"),
    actions = await Astro2.slots.render("actions")
  } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section class="relative not-prose overflow-hidden bg-white"> <!-- 现代化背景装饰 --> <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/30"></div> <div class="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full blur-3xl"></div> <div class="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-tr from-indigo-400/10 to-transparent rounded-full blur-3xl"></div> <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="py-20 lg:py-24"> <div class="text-center pb-8 md:pb-12 max-w-5xl mx-auto"> <h1 class="font-bold font-heading leading-tight tracking-tight mb-6 text-gray-900 text-5xl lg:text-6xl animate-fade"> ${renderSlot($$result, $$slots["title"], renderTemplate`${title}`)} </h1> <div class="max-w-4xl mx-auto"> <p class="text-gray-600 text-xl lg:text-2xl mb-8 leading-relaxed animate-slide"> ${renderSlot($$result, $$slots["subtitle"], renderTemplate`${subtitle}`)} </p> <div class="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale"> ${renderSlot($$result, $$slots["actions"], renderTemplate`${actions}`)} </div> </div> </div> </div> </div> </section>`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/components/widgets/SimpleHero.astro", void 0);

const $$Astro = createAstro();
const $$Note = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Note;
  const {
    icon = "tabler:info-circle",
    title = await Astro2.slots.render("title"),
    description = await Astro2.slots.render("description")
  } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section class="bg-light border border-subtle not-prose"> <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center"> <div class="flex items-center justify-center space-x-3 text-default"> ${renderComponent($$result, "Icon", $$Icon, { "name": icon, "class": "w-5 h-5 text-primary flex-shrink-0" })} <div class="text-base font-medium"> <span class="font-semibold text-primary">${unescapeHTML(title)}</span> <span class="text-muted ml-2">${unescapeHTML(description)}</span> </div> </div> </div> </section>`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/components/widgets/Note.astro", void 0);

export { $$SimpleHero as $, $$Note as a };
