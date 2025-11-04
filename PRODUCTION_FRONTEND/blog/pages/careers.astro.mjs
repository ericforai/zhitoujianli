import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import { $ as $$PageLayout } from '../chunks/PageLayout_CYieUw40.mjs';
import { a as $$Icon } from '../chunks/Layout_ClwenmRe.mjs';
import { $ as $$Breadcrumb } from '../chunks/Breadcrumb_CtB7Z_gT.mjs';
export { renderers } from '../renderers.mjs';

const $$Careers = createComponent(($$result, $$props, $$slots) => {
  const metadata = {
    title: "\u52A0\u5165\u6211\u4EEC - \u667A\u6295\u7B80\u5386\u62DB\u8058",
    description: "\u667A\u6295\u7B80\u5386\u62DB\u8058\u4FE1\u606F\uFF0C\u6211\u4EEC\u6B63\u5728\u5BFB\u627E\u4F18\u79C0\u7684\u6280\u672F\u4EBA\u624D\u52A0\u5165\u6211\u4EEC\u7684\u56E2\u961F\uFF0C\u4E00\u8D77\u7528AI\u6280\u672F\u6539\u53D8\u6C42\u804C\u884C\u4E1A\u3002"
  };
  return renderTemplate`${renderComponent($$result, "Layout", $$PageLayout, { "metadata": metadata }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="px-4 py-16 sm:px-6 mx-auto lg:px-8 lg:py-20 max-w-4xl"> <div class="mx-auto max-w-3xl px-4 sm:px-6"> ${renderComponent($$result2, "Breadcrumb", $$Breadcrumb, { "items": [
    { text: "\u52A0\u5165\u6211\u4EEC", current: true }
  ] })} </div> <div class="text-center mb-16"> <h1 class="font-bold font-heading text-4xl md:text-5xl leading-tighter tracking-tighter mb-6">
加入<span class="text-accent dark:text-white">我们</span> </h1> <p class="text-xl text-muted dark:text-slate-400 max-w-3xl mx-auto">
与我们一起用AI技术改变求职行业，创造更美好的未来
</p> </div> <!-- 公司文化 --> <div class="mb-16"> <div class="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-8"> <h2 class="text-3xl font-bold font-heading mb-6 text-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:users", "class": "w-8 h-8 inline-block mr-3 text-primary" })}
我们的团队文化
</h2> <div class="grid md:grid-cols-3 gap-6"> <div class="text-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:bulb", "class": "w-12 h-12 text-yellow-500 mx-auto mb-4" })} <h3 class="font-semibold mb-2">创新驱动</h3> <p class="text-sm text-muted dark:text-slate-400">鼓励创新思维，持续探索新技术</p> </div> <div class="text-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:users", "class": "w-12 h-12 text-green-500 mx-auto mb-4" })} <h3 class="font-semibold mb-2">团队协作</h3> <p class="text-sm text-muted dark:text-slate-400">注重团队合作，共同成长</p> </div> <div class="text-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:trophy", "class": "w-12 h-12 text-blue-500 mx-auto mb-4" })} <h3 class="font-semibold mb-2">追求卓越</h3> <p class="text-sm text-muted dark:text-slate-400">追求卓越品质，不断超越自我</p> </div> </div> </div> </div> <!-- 职位列表 --> <div class="mb-16"> <h2 class="text-3xl font-bold font-heading mb-8 text-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:briefcase", "class": "w-8 h-8 inline-block mr-3 text-primary" })}
开放职位
</h2> <div class="space-y-6"> <!-- 前端开发工程师 --> <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"> <div class="flex justify-between items-start mb-4"> <div> <h3 class="text-xl font-semibold mb-2">前端开发工程师</h3> <div class="flex items-center space-x-4 text-sm text-muted dark:text-slate-400"> <span class="flex items-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:map-pin", "class": "w-4 h-4 mr-1" })}
北京/上海/远程
</span> <span class="flex items-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:clock", "class": "w-4 h-4 mr-1" })}
全职
</span> <span class="flex items-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:currency-yuan", "class": "w-4 h-4 mr-1" })}
15-30K
</span> </div> </div> <span class="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
急招
</span> </div> <p class="text-muted dark:text-slate-400 mb-4">
负责智投简历前端产品的开发和维护，参与用户体验优化和性能提升。
</p> <div class="mb-4"> <h4 class="font-medium mb-2">岗位要求：</h4> <ul class="text-sm text-muted dark:text-slate-400 space-y-1"> <li>• 熟练掌握React、Vue等前端框架</li> <li>• 熟悉TypeScript、ES6+语法</li> <li>• 有移动端开发经验优先</li> <li>• 本科及以上学历，3年以上工作经验</li> </ul> </div> <button class="btn btn-primary btn-sm">
立即申请
</button> </div> <!-- AI算法工程师 --> <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"> <div class="flex justify-between items-start mb-4"> <div> <h3 class="text-xl font-semibold mb-2">AI算法工程师</h3> <div class="flex items-center space-x-4 text-sm text-muted dark:text-slate-400"> <span class="flex items-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:map-pin", "class": "w-4 h-4 mr-1" })}
北京/上海
</span> <span class="flex items-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:clock", "class": "w-4 h-4 mr-1" })}
全职
</span> <span class="flex items-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:currency-yuan", "class": "w-4 h-4 mr-1" })}
25-50K
</span> </div> </div> <span class="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
热招
</span> </div> <p class="text-muted dark:text-slate-400 mb-4">
负责AI匹配算法的研发和优化，提升简历与职位的匹配精度。
</p> <div class="mb-4"> <h4 class="font-medium mb-2">岗位要求：</h4> <ul class="text-sm text-muted dark:text-slate-400 space-y-1"> <li>• 熟练掌握Python、机器学习框架</li> <li>• 有大语言模型应用经验</li> <li>• 熟悉NLP相关技术</li> <li>• 硕士及以上学历，2年以上AI经验</li> </ul> </div> <button class="btn btn-primary btn-sm">
立即申请
</button> </div> <!-- 产品经理 --> <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"> <div class="flex justify-between items-start mb-4"> <div> <h3 class="text-xl font-semibold mb-2">产品经理</h3> <div class="flex items-center space-x-4 text-sm text-muted dark:text-slate-400"> <span class="flex items-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:map-pin", "class": "w-4 h-4 mr-1" })}
北京
</span> <span class="flex items-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:clock", "class": "w-4 h-4 mr-1" })}
全职
</span> <span class="flex items-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:currency-yuan", "class": "w-4 h-4 mr-1" })}
20-35K
</span> </div> </div> <span class="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
招聘中
</span> </div> <p class="text-muted dark:text-slate-400 mb-4">
负责产品规划和功能设计，协调开发团队实现产品目标。
</p> <div class="mb-4"> <h4 class="font-medium mb-2">岗位要求：</h4> <ul class="text-sm text-muted dark:text-slate-400 space-y-1"> <li>• 有B端或C端产品经验</li> <li>• 熟悉产品设计流程</li> <li>• 有AI产品经验优先</li> <li>• 本科及以上学历，3年以上经验</li> </ul> </div> <button class="btn btn-primary btn-sm">
立即申请
</button> </div> </div> </div> <!-- 福利待遇 --> <div class="mb-16"> <h2 class="text-3xl font-bold font-heading mb-8 text-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:gift", "class": "w-8 h-8 inline-block mr-3 text-primary" })}
福利待遇
</h2> <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6"> <div class="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:currency-yuan", "class": "w-12 h-12 text-green-500 mx-auto mb-4" })} <h3 class="font-semibold mb-2">有竞争力的薪酬</h3> <p class="text-sm text-muted dark:text-slate-400">基本工资 + 绩效奖金 + 股权激励</p> </div> <div class="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:calendar", "class": "w-12 h-12 text-blue-500 mx-auto mb-4" })} <h3 class="font-semibold mb-2">弹性工作时间</h3> <p class="text-sm text-muted dark:text-slate-400">弹性上下班，支持远程办公</p> </div> <div class="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:school", "class": "w-12 h-12 text-purple-500 mx-auto mb-4" })} <h3 class="font-semibold mb-2">学习成长</h3> <p class="text-sm text-muted dark:text-slate-400">培训基金，技术分享，成长路径</p> </div> <div class="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:heart", "class": "w-12 h-12 text-red-500 mx-auto mb-4" })} <h3 class="font-semibold mb-2">健康保障</h3> <p class="text-sm text-muted dark:text-slate-400">五险一金，补充医疗，年度体检</p> </div> <div class="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:coffee", "class": "w-12 h-12 text-orange-500 mx-auto mb-4" })} <h3 class="font-semibold mb-2">办公环境</h3> <p class="text-sm text-muted dark:text-slate-400">舒适办公环境，免费咖啡零食</p> </div> <div class="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:plane", "class": "w-12 h-12 text-teal-500 mx-auto mb-4" })} <h3 class="font-semibold mb-2">团建活动</h3> <p class="text-sm text-muted dark:text-slate-400">定期团建，年会旅游，团队聚餐</p> </div> </div> </div> <!-- 申请方式 --> <div class="text-center bg-gray-50 dark:bg-slate-800 rounded-lg p-8"> <h3 class="text-2xl font-semibold mb-4">如何申请</h3> <p class="text-muted dark:text-slate-400 mb-6 max-w-2xl mx-auto">
发送简历到我们的邮箱，我们会尽快与您联系。也欢迎您通过其他方式与我们沟通。
</p> <div class="flex flex-col sm:flex-row gap-4 justify-center"> <a href="mailto:hr@zhitoujianli.com" class="btn btn-primary inline-flex items-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:mail", "class": "w-4 h-4 mr-2" })}
投递简历
</a> <a href="/contact" class="btn btn-secondary inline-flex items-center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:message-circle", "class": "w-4 h-4 mr-2" })}
联系我们
</a> </div> </div> </section> ` })}`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/careers.astro", void 0);

const $$file = "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/careers.astro";
const $$url = "/careers/";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Careers,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
