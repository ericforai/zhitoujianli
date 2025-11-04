import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import { $ as $$PageLayout } from '../chunks/PageLayout_CYieUw40.mjs';
import { a as $$Icon } from '../chunks/Layout_ClwenmRe.mjs';
import { $ as $$Breadcrumb } from '../chunks/Breadcrumb_CtB7Z_gT.mjs';
/* empty css                                      */
export { renderers } from '../renderers.mjs';

const $$UserGuide = createComponent(($$result, $$props, $$slots) => {
  const metadata = {
    title: "\u667A\u6295\u7B80\u5386\u4F7F\u7528\u6307\u5357 - \u8BA9\u6C42\u804C\u66F4\u667A\u80FD",
    description: "\u8BE6\u7EC6\u7684\u667A\u6295\u7B80\u5386\u4F7F\u7528\u6307\u5357\uFF0C\u5E2E\u52A9\u60A8\u5FEB\u901F\u4E0A\u624BAI\u667A\u80FD\u6C42\u804C\u5E73\u53F0\uFF0C\u638C\u63E1\u7B80\u5386\u4F18\u5316\u3001\u667A\u80FD\u5339\u914D\u3001\u7CBE\u51C6\u6295\u9012\u7B49\u529F\u80FD\u3002"
  };
  return renderTemplate`${renderComponent($$result, "Layout", $$PageLayout, { "metadata": metadata, "data-astro-cid-xjasbecl": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="px-4 py-16 sm:px-6 mx-auto lg:px-8 lg:py-20 max-w-4xl" data-astro-cid-xjasbecl> <div class="mx-auto max-w-3xl px-4 sm:px-6" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Breadcrumb", $$Breadcrumb, { "items": [
    { text: "\u4F7F\u7528\u6307\u5357", current: true }
  ], "data-astro-cid-xjasbecl": true })} </div> <div class="text-center mb-16" data-astro-cid-xjasbecl> <h1 class="font-bold font-heading text-4xl md:text-5xl leading-tighter tracking-tighter mb-6" data-astro-cid-xjasbecl>
智投简历<span class="text-accent dark:text-white" data-astro-cid-xjasbecl>使用指南</span> </h1> <p class="text-xl text-muted dark:text-slate-400 max-w-3xl mx-auto" data-astro-cid-xjasbecl>
快速掌握智投简历的各项功能，让AI助力您的求职之路更加高效精准
</p> </div> <!-- 快速开始 --> <div class="mb-16" data-astro-cid-xjasbecl> <h2 class="text-3xl font-bold font-heading mb-8 text-center" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:rocket", "class": "w-8 h-8 inline-block mr-3 text-primary", "data-astro-cid-xjasbecl": true })}
快速开始
</h2> <div class="grid md:grid-cols-3 gap-8" data-astro-cid-xjasbecl> <div class="text-center p-6 bg-gray-50 dark:bg-slate-800 rounded-lg" data-astro-cid-xjasbecl> <div class="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4" data-astro-cid-xjasbecl> <span class="text-2xl font-bold" data-astro-cid-xjasbecl>1</span> </div> <h3 class="text-xl font-semibold mb-3" data-astro-cid-xjasbecl>注册账户</h3> <p class="text-muted dark:text-slate-400" data-astro-cid-xjasbecl>
使用邮箱或手机号快速注册，验证后即可开始使用
</p> </div> <div class="text-center p-6 bg-gray-50 dark:bg-slate-800 rounded-lg" data-astro-cid-xjasbecl> <div class="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4" data-astro-cid-xjasbecl> <span class="text-2xl font-bold" data-astro-cid-xjasbecl>2</span> </div> <h3 class="text-xl font-semibold mb-3" data-astro-cid-xjasbecl>上传简历</h3> <p class="text-muted dark:text-slate-400" data-astro-cid-xjasbecl>
支持PDF、Word等多种格式，AI自动解析简历内容
</p> </div> <div class="text-center p-6 bg-gray-50 dark:bg-slate-800 rounded-lg" data-astro-cid-xjasbecl> <div class="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4" data-astro-cid-xjasbecl> <span class="text-2xl font-bold" data-astro-cid-xjasbecl>3</span> </div> <h3 class="text-xl font-semibold mb-3" data-astro-cid-xjasbecl>开始投递</h3> <p class="text-muted dark:text-slate-400" data-astro-cid-xjasbecl>
设置求职偏好，AI智能匹配职位并自动投递
</p> </div> </div> </div> <!-- 核心功能详解 --> <div class="mb-16" data-astro-cid-xjasbecl> <h2 class="text-3xl font-bold font-heading mb-8 text-center" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:settings", "class": "w-8 h-8 inline-block mr-3 text-primary", "data-astro-cid-xjasbecl": true })}
核心功能详解
</h2> <div class="space-y-12" data-astro-cid-xjasbecl> <!-- AI智能匹配 --> <div class="flex flex-col md:flex-row items-center gap-8" data-astro-cid-xjasbecl> <div class="md:w-1/2" data-astro-cid-xjasbecl> <h3 class="text-2xl font-semibold mb-4" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:brain", "class": "w-6 h-6 inline-block mr-2 text-primary", "data-astro-cid-xjasbecl": true })}
AI智能匹配
</h3> <ul class="space-y-3 text-muted dark:text-slate-400" data-astro-cid-xjasbecl> <li class="flex items-start" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:check", "class": "w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0", "data-astro-cid-xjasbecl": true })}
深度分析职位描述和简历内容
</li> <li class="flex items-start" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:check", "class": "w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0", "data-astro-cid-xjasbecl": true })}
智能计算匹配度评分
</li> <li class="flex items-start" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:check", "class": "w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0", "data-astro-cid-xjasbecl": true })}
个性化推荐最适合的职位
</li> </ul> </div> <div class="md:w-1/2" data-astro-cid-xjasbecl> <div class="bg-gray-100 dark:bg-slate-700 rounded-lg p-8 text-center" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:target", "class": "w-16 h-16 text-primary mx-auto mb-4", "data-astro-cid-xjasbecl": true })} <p class="text-sm text-muted" data-astro-cid-xjasbecl>匹配度评分示例</p> </div> </div> </div> <!-- 简历优化 --> <div class="flex flex-col md:flex-row-reverse items-center gap-8" data-astro-cid-xjasbecl> <div class="md:w-1/2" data-astro-cid-xjasbecl> <h3 class="text-2xl font-semibold mb-4" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:edit", "class": "w-6 h-6 inline-block mr-2 text-primary", "data-astro-cid-xjasbecl": true })}
简历智能优化
</h3> <ul class="space-y-3 text-muted dark:text-slate-400" data-astro-cid-xjasbecl> <li class="flex items-start" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:check", "class": "w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0", "data-astro-cid-xjasbecl": true })}
根据目标职位自动调整简历内容
</li> <li class="flex items-start" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:check", "class": "w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0", "data-astro-cid-xjasbecl": true })}
关键词优化，提高通过率
</li> <li class="flex items-start" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:check", "class": "w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0", "data-astro-cid-xjasbecl": true })}
格式美化，提升专业度
</li> </ul> </div> <div class="md:w-1/2" data-astro-cid-xjasbecl> <div class="bg-gray-100 dark:bg-slate-700 rounded-lg p-8 text-center" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:file-text", "class": "w-16 h-16 text-primary mx-auto mb-4", "data-astro-cid-xjasbecl": true })} <p class="text-sm text-muted" data-astro-cid-xjasbecl>简历优化效果</p> </div> </div> </div> <!-- 精准投递 --> <div class="flex flex-col md:flex-row items-center gap-8" data-astro-cid-xjasbecl> <div class="md:w-1/2" data-astro-cid-xjasbecl> <h3 class="text-2xl font-semibold mb-4" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:send", "class": "w-6 h-6 inline-block mr-2 text-primary", "data-astro-cid-xjasbecl": true })}
精准投递
</h3> <ul class="space-y-3 text-muted dark:text-slate-400" data-astro-cid-xjasbecl> <li class="flex items-start" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:check", "class": "w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0", "data-astro-cid-xjasbecl": true })}
一键批量投递多个职位
</li> <li class="flex items-start" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:check", "class": "w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0", "data-astro-cid-xjasbecl": true })}
投递状态实时跟踪
</li> <li class="flex items-start" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:check", "class": "w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0", "data-astro-cid-xjasbecl": true })}
面试邀请智能提醒
</li> </ul> </div> <div class="md:w-1/2" data-astro-cid-xjasbecl> <div class="bg-gray-100 dark:bg-slate-700 rounded-lg p-8 text-center" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:chart-line", "class": "w-16 h-16 text-primary mx-auto mb-4", "data-astro-cid-xjasbecl": true })} <p class="text-sm text-muted" data-astro-cid-xjasbecl>投递进度跟踪</p> </div> </div> </div> </div> </div> <!-- 使用技巧 --> <div class="mb-16" data-astro-cid-xjasbecl> <h2 class="text-3xl font-bold font-heading mb-8 text-center" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:bulb", "class": "w-8 h-8 inline-block mr-3 text-primary", "data-astro-cid-xjasbecl": true })}
使用技巧
</h2> <div class="grid md:grid-cols-2 gap-8" data-astro-cid-xjasbecl> <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg" data-astro-cid-xjasbecl> <h4 class="font-semibold text-blue-900 dark:text-blue-100 mb-3" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:star", "class": "w-5 h-5 inline-block mr-2", "data-astro-cid-xjasbecl": true })}
提高匹配度
</h4> <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-2" data-astro-cid-xjasbecl> <li data-astro-cid-xjasbecl>• 详细填写工作经历和技能</li> <li data-astro-cid-xjasbecl>• 定期更新简历内容</li> <li data-astro-cid-xjasbecl>• 设置准确的求职偏好</li> </ul> </div> <div class="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg" data-astro-cid-xjasbecl> <h4 class="font-semibold text-green-900 dark:text-green-100 mb-3" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:target", "class": "w-5 h-5 inline-block mr-2", "data-astro-cid-xjasbecl": true })}
提升投递效率
</h4> <ul class="text-sm text-green-800 dark:text-green-200 space-y-2" data-astro-cid-xjasbecl> <li data-astro-cid-xjasbecl>• 设置合适的投递时间</li> <li data-astro-cid-xjasbecl>• 定期查看投递结果</li> <li data-astro-cid-xjasbecl>• 根据反馈调整策略</li> </ul> </div> <div class="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg" data-astro-cid-xjasbecl> <h4 class="font-semibold text-purple-900 dark:text-purple-100 mb-3" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:chart-bar", "class": "w-5 h-5 inline-block mr-2", "data-astro-cid-xjasbecl": true })}
数据分析
</h4> <ul class="text-sm text-purple-800 dark:text-purple-200 space-y-2" data-astro-cid-xjasbecl> <li data-astro-cid-xjasbecl>• 关注投递成功率趋势</li> <li data-astro-cid-xjasbecl>• 分析热门职位类型</li> <li data-astro-cid-xjasbecl>• 优化简历关键词</li> </ul> </div> <div class="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg" data-astro-cid-xjasbecl> <h4 class="font-semibold text-orange-900 dark:text-orange-100 mb-3" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:shield-check", "class": "w-5 h-5 inline-block mr-2", "data-astro-cid-xjasbecl": true })}
隐私保护
</h4> <ul class="text-sm text-orange-800 dark:text-orange-200 space-y-2" data-astro-cid-xjasbecl> <li data-astro-cid-xjasbecl>• 定期更新账户密码</li> <li data-astro-cid-xjasbecl>• 注意个人信息保护</li> <li data-astro-cid-xjasbecl>• 合理设置隐私权限</li> </ul> </div> </div> </div> <!-- 常见问题 --> <div class="mb-16" data-astro-cid-xjasbecl> <h2 class="text-3xl font-bold font-heading mb-8 text-center" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:help", "class": "w-8 h-8 inline-block mr-3 text-primary", "data-astro-cid-xjasbecl": true })}
常见问题
</h2> <div class="space-y-6" data-astro-cid-xjasbecl> <details class="bg-gray-50 dark:bg-slate-800 rounded-lg p-6" data-astro-cid-xjasbecl> <summary class="font-semibold cursor-pointer flex items-center" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:chevron-right", "class": "w-5 h-5 mr-2 transition-transform duration-200", "data-astro-cid-xjasbecl": true })}
如何提高简历匹配度？
</summary> <div class="mt-4 text-muted dark:text-slate-400" data-astro-cid-xjasbecl> <p data-astro-cid-xjasbecl>确保简历信息完整准确，包括详细的工作经历、教育背景和技能描述。定期更新简历内容，根据目标职位调整关键词。</p> </div> </details> <details class="bg-gray-50 dark:bg-slate-800 rounded-lg p-6" data-astro-cid-xjasbecl> <summary class="font-semibold cursor-pointer flex items-center" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:chevron-right", "class": "w-5 h-5 mr-2 transition-transform duration-200", "data-astro-cid-xjasbecl": true })}
投递后多久能收到回复？
</summary> <div class="mt-4 text-muted dark:text-slate-400" data-astro-cid-xjasbecl> <p data-astro-cid-xjasbecl>一般情况下，企业会在1-2周内给出回复。我们建议您耐心等待，同时可以继续投递其他合适的职位。</p> </div> </details> <details class="bg-gray-50 dark:bg-slate-800 rounded-lg p-6" data-astro-cid-xjasbecl> <summary class="font-semibold cursor-pointer flex items-center" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:chevron-right", "class": "w-5 h-5 mr-2 transition-transform duration-200", "data-astro-cid-xjasbecl": true })}
如何保护个人信息安全？
</summary> <div class="mt-4 text-muted dark:text-slate-400" data-astro-cid-xjasbecl> <p data-astro-cid-xjasbecl>我们采用银行级别的加密技术保护您的数据安全，严格遵循隐私政策，不会向第三方泄露您的个人信息。</p> </div> </details> </div> </div> <!-- 联系支持 --> <div class="text-center bg-gray-50 dark:bg-slate-800 rounded-lg p-8" data-astro-cid-xjasbecl> <h3 class="text-2xl font-semibold mb-4" data-astro-cid-xjasbecl>需要更多帮助？</h3> <p class="text-muted dark:text-slate-400 mb-6" data-astro-cid-xjasbecl>
我们的客服团队随时为您提供专业的技术支持和咨询服务
</p> <div class="flex flex-col sm:flex-row gap-4 justify-center" data-astro-cid-xjasbecl> <a href="http://115.190.182.95#contact" class="btn btn-primary inline-flex items-center" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:headphones", "class": "w-4 h-4 mr-2", "data-astro-cid-xjasbecl": true })}
联系客服
</a> <a href="http://115.190.182.95" class="btn btn-secondary inline-flex items-center" data-astro-cid-xjasbecl> ${renderComponent($$result2, "Icon", $$Icon, { "name": "tabler:rocket", "class": "w-4 h-4 mr-2", "data-astro-cid-xjasbecl": true })}
立即体验
</a> </div> </div> </section> ` })} `;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/user-guide.astro", void 0);

const $$file = "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/user-guide.astro";
const $$url = "/user-guide/";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$UserGuide,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
