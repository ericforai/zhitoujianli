import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import { $ as $$PageLayout } from '../chunks/PageLayout_CYieUw40.mjs';
import { a as $$Icon } from '../chunks/Layout_ClwenmRe.mjs';
import { $ as $$Breadcrumb } from '../chunks/Breadcrumb_CtB7Z_gT.mjs';
export { renderers } from '../renderers.mjs';

const $$About = createComponent(($$result, $$props, $$slots) => {
  const metadata = {
    title: "\u5173\u4E8E\u6211\u4EEC - \u667A\u6295\u7B80\u5386",
    description: "\u667A\u6295\u7B80\u5386\u516C\u53F8\u4ECB\u7ECD\uFF0C\u4E86\u89E3\u6211\u4EEC\u7684\u4F7F\u547D\u613F\u666F\u3001\u53D1\u5C55\u5386\u7A0B\u3001\u6838\u5FC3\u56E2\u961F\u548C\u6280\u672F\u5B9E\u529B\uFF0C\u81F4\u529B\u4E8E\u7528AI\u6280\u672F\u8BA9\u6C42\u804C\u66F4\u667A\u80FD\u3002"
  };
  return renderTemplate`${renderComponent($$result, "Layout", $$PageLayout, { "metadata": metadata }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="px-4 py-16 sm:px-6 mx-auto lg:px-8 lg:py-20 max-w-4xl"> <div class="mx-auto max-w-3xl px-4 sm:px-6"> ${renderComponent($$result2, "Breadcrumb", $$Breadcrumb, { "items": [{ text: "\u5173\u4E8E\u6211\u4EEC", current: true }] })} </div> <div class="text-center mb-16"> <h1 class="font-bold font-heading text-4xl md:text-5xl leading-tighter tracking-tighter mb-6">
关于<span class="text-accent dark:text-white">智投简历</span> </h1> <p class="text-xl text-muted dark:text-slate-400 max-w-3xl mx-auto">用AI技术让求职更智能，让每一次投递都更精准</p> </div> <!-- 公司简介 --> <div id="company" class="mb-16 scroll-mt-20"> <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8"> <h2 class="text-3xl font-bold font-heading mb-6 text-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:building", "class": "w-8 h-8 inline-block mr-3 text-primary" })}
公司简介
</h2> <div class="prose prose-lg dark:prose-invert max-w-none"> <p class="text-lg leading-relaxed">
与其说是公司简介，不如说是我的个人介绍。2025年十大热点词一定有"一人公司"，于是我也跟风成立了一人公司，
            结果就是你现在看到的这个网站--智投简历。
</p> <p class="text-lg leading-relaxed">
我有近18年的工作经验，其中超过15年都在带团队，招聘是其中最重要的工作。
            我看了无数简历，深知一点：让我发出面试邀请的那个人一定是第一印象给我留下深刻印象的人。
</p> <p class="text-lg leading-relaxed">
那怎么才能留下深刻印象？在我看来，首先要能精准匹配岗位需求，其次要能在简历和打招呼语中突出核心优势。
            这就是我做智投简历的初衷：用AI技术帮助求职者更精准地投递简历，让每一次投递都有最大的成功率。
</p> </div> </div> </div> <!-- 使命愿景 --> <div id="team" class="mb-16 scroll-mt-20"> <h2 class="text-3xl font-bold font-heading mb-8 text-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:target", "class": "w-8 h-8 inline-block mr-3 text-primary" })}
使命愿景
</h2> <div class="grid md:grid-cols-2 gap-8"> <div class="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:rocket", "class": "w-8 h-8 text-blue-600 dark:text-blue-400" })} </div> <h3 class="text-2xl font-semibold text-center mb-4">我们的使命</h3> <p class="text-muted dark:text-slate-400 text-center leading-relaxed">
运用人工智能技术，为求职者提供智能化、个性化的求职服务，
            让每一次简历投递都更加精准有效，帮助更多人实现职业梦想。
</p> </div> <div class="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700"> <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:eye", "class": "w-8 h-8 text-purple-600 dark:text-purple-400" })} </div> <h3 class="text-2xl font-semibold text-center mb-4">我们的愿景</h3> <p class="text-muted dark:text-slate-400 text-center leading-relaxed">
成为全球领先的AI求职服务平台，让AI技术惠及每一位求职者， 构建更加智能、高效的求职生态系统。
</p> </div> </div> </div> <!-- 团队介绍 --> <div class="mb-16"> <h2 class="text-3xl font-bold font-heading mb-8 text-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:users", "class": "w-8 h-8 inline-block mr-3 text-primary" })}
核心团队
</h2> <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8"> <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center"> <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:brain", "class": "w-10 h-10 text-white" })} </div> <h3 class="text-xl font-semibold mb-2">技术团队</h3> <p class="text-muted dark:text-slate-400">由资深AI工程师和算法专家组成，专注于大语言模型和机器学习技术研发</p> </div> <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center"> <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:chart-bar", "class": "w-10 h-10 text-white" })} </div> <h3 class="text-xl font-semibold mb-2">产品团队</h3> <p class="text-muted dark:text-slate-400">拥有丰富用户体验设计经验，致力于打造简洁易用的求职服务平台</p> </div> <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center"> <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:users-group", "class": "w-10 h-10 text-white" })} </div> <h3 class="text-xl font-semibold mb-2">运营团队</h3> <p class="text-muted dark:text-slate-400">专业的市场运营和客户服务团队，为用户提供全方位的求职指导支持</p> </div> </div> </div> <!-- 核心价值 --> <div class="mb-16"> <h2 class="text-3xl font-bold font-heading mb-8 text-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:heart", "class": "w-8 h-8 inline-block mr-3 text-primary" })}
核心价值
</h2> <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6"> <div class="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:brain", "class": "w-12 h-12 text-primary mx-auto mb-4" })} <h3 class="font-semibold mb-2">技术创新</h3> <p class="text-sm text-muted dark:text-slate-400">持续投入AI技术研发，不断提升服务智能化水平</p> </div> <div class="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:users", "class": "w-12 h-12 text-primary mx-auto mb-4" })} <h3 class="font-semibold mb-2">用户至上</h3> <p class="text-sm text-muted dark:text-slate-400">以用户需求为导向，提供优质的服务体验</p> </div> <div class="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:shield-check", "class": "w-12 h-12 text-primary mx-auto mb-4" })} <h3 class="font-semibold mb-2">安全可靠</h3> <p class="text-sm text-muted dark:text-slate-400">严格保护用户隐私，确保数据安全</p> </div> <div class="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:trending-up", "class": "w-12 h-12 text-primary mx-auto mb-4" })} <h3 class="font-semibold mb-2">持续改进</h3> <p class="text-sm text-muted dark:text-slate-400">不断优化产品功能，追求卓越品质</p> </div> </div> </div> <!-- 合作伙伴 --> <div id="partners" class="mb-16 scroll-mt-20"> <h2 class="text-3xl font-bold font-heading mb-8 text-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:users-group", "class": "w-8 h-8 inline-block mr-3 text-primary" })}
合作伙伴
</h2> <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6"> <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:building-skyscraper", "class": "w-12 h-12 text-primary mx-auto mb-4" })} <h3 class="font-semibold mb-2">企业客户</h3> <p class="text-sm text-muted dark:text-slate-400">与知名企业建立长期合作关系</p> </div> <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:school", "class": "w-12 h-12 text-primary mx-auto mb-4" })} <h3 class="font-semibold mb-2">高校合作</h3> <p class="text-sm text-muted dark:text-slate-400">与多所知名高校开展就业指导合作</p> </div> <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:briefcase", "class": "w-12 h-12 text-primary mx-auto mb-4" })} <h3 class="font-semibold mb-2">招聘平台</h3> <p class="text-sm text-muted dark:text-slate-400">与主流招聘平台深度整合</p> </div> <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:cloud", "class": "w-12 h-12 text-primary mx-auto mb-4" })} <h3 class="font-semibold mb-2">技术合作</h3> <p class="text-sm text-muted dark:text-slate-400">与AI技术公司建立战略合作</p> </div> </div> </div> <!-- 联系我们 --> <div class="text-center bg-gray-50 dark:bg-slate-800 rounded-lg p-8"> <h3 class="text-2xl font-semibold mb-4">加入我们的旅程</h3> <p class="text-muted dark:text-slate-400 mb-6 max-w-2xl mx-auto">
我们正在寻找志同道合的伙伴，一起用AI技术改变求职行业。 如果您对我们的理念感兴趣，欢迎联系我们。
</p> <div class="flex flex-col sm:flex-row gap-4 justify-center"> <a href="http://115.190.182.95#contact" class="btn btn-primary inline-flex items-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:mail", "class": "w-4 h-4 mr-2" })}
联系我们
</a> <a href="/careers" class="btn btn-secondary inline-flex items-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:briefcase", "class": "w-4 h-4 mr-2" })}
加入我们
</a> </div> </div> </section> ` })}`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/about.astro", void 0);

const $$file = "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/about.astro";
const $$url = "/about/";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$About,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
