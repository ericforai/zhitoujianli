import { c as createComponent, f as createAstro, r as renderComponent, a as renderTemplate } from './astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import { $ as $$WidgetWrapper } from './WidgetWrapper_u12n9mzQ.mjs';
import { $ as $$ItemGrid } from './ItemGrid_Be50U7uV.mjs';
import { $ as $$Headline } from './Headline_BLeHX4ag.mjs';

const $$Astro = createAstro();
const $$Features = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Features;
  const {
    title = await Astro2.slots.render("title"),
    subtitle = await Astro2.slots.render("subtitle"),
    tagline = await Astro2.slots.render("tagline"),
    items = [],
    columns = 3,
    defaultIcon,
    id,
    isDark = false,
    classes = {},
    bg = await Astro2.slots.render("bg")
  } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "WidgetWrapper", $$WidgetWrapper, { "id": id, "isDark": isDark, "containerClass": `max-w-7xl ${classes?.container ?? ""}`, "bg": bg }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Headline", $$Headline, { "title": title, "subtitle": subtitle, "tagline": tagline, "classes": classes?.headline })} ${renderComponent($$result2, "ItemGrid", $$ItemGrid, { "items": items, "columns": columns, "defaultIcon": defaultIcon, "classes": {
    container: "grid-3",
    title: "text-xl font-semibold mb-3",
    icon: "text-primary bg-primary/10 rounded-xl w-12 h-12 p-3 mb-4",
    ...classes?.items ?? {}
  } })} ` })}`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/components/widgets/Features.astro", void 0);

export { $$Features as $ };
