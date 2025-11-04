import { c as createComponent, f as createAstro, d as renderHead, a as renderTemplate } from '../chunks/astro/server_BMxpr7GR.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                                        */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$GithubAdmin = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$GithubAdmin;
  return renderTemplate`<html lang="zh-CN" data-astro-cid-m2fjhme2> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex"><title>智投简历博客 - GitHub编辑</title>${renderHead()}</head> <body data-astro-cid-m2fjhme2> <div class="container" data-astro-cid-m2fjhme2> <h1 data-astro-cid-m2fjhme2>🔧 GitHub直接编辑</h1> <div class="instructions" data-astro-cid-m2fjhme2> <h3 data-astro-cid-m2fjhme2>📋 使用说明</h3> <p data-astro-cid-m2fjhme2>由于Decap CMS认证问题，您可以直接通过GitHub Web界面编辑博客内容：</p> <ol data-astro-cid-m2fjhme2> <li data-astro-cid-m2fjhme2>点击下面的链接直接跳转到GitHub仓库</li> <li data-astro-cid-m2fjhme2>在GitHub中编辑Markdown文件</li> <li data-astro-cid-m2fjhme2>提交更改后，博客会自动更新</li> </ol> </div> <div class="section" data-astro-cid-m2fjhme2> <h2 data-astro-cid-m2fjhme2>📁 博客文章管理</h2> <a href="https://github.com/ericforai/zhitoujianli/tree/main/blog/zhitoujianli-blog/src/data/post" class="github-link" target="_blank" data-astro-cid-m2fjhme2>
📝 管理博客文章
</a> <p data-astro-cid-m2fjhme2>点击上方链接可以直接在GitHub中查看、编辑、创建和删除博客文章。</p> </div> <div class="section" data-astro-cid-m2fjhme2> <h2 data-astro-cid-m2fjhme2>⚙️ 配置文件</h2> <ul class="file-list" data-astro-cid-m2fjhme2> <li data-astro-cid-m2fjhme2> <a href="https://github.com/ericforai/zhitoujianli/edit/main/blog/zhitoujianli-blog/src/config.yaml" target="_blank" data-astro-cid-m2fjhme2>📄 博客配置文件 (config.yaml)</a> </li> <li data-astro-cid-m2fjhme2> <a href="https://github.com/ericforai/zhitoujianli/edit/main/blog/zhitoujianli-blog/src/navigation.ts" target="_blank" data-astro-cid-m2fjhme2>🧭 导航配置 (navigation.ts)</a> </li> <li data-astro-cid-m2fjhme2> <a href="https://github.com/ericforai/zhitoujianli/edit/main/blog/zhitoujianli-blog/astro.config.ts" target="_blank" data-astro-cid-m2fjhme2>⚙️ Astro配置 (astro.config.ts)</a> </li> </ul> </div> <div class="section" data-astro-cid-m2fjhme2> <h2 data-astro-cid-m2fjhme2>📊 快速操作</h2> <a href="https://github.com/ericforai/zhitoujianli/new/main/blog/zhitoujianli-blog/src/data/post" class="github-link" target="_blank" data-astro-cid-m2fjhme2>
➕ 创建新文章
</a> <a href="https://github.com/ericforai/zhitoujianli/upload/main/blog/zhitoujianli-blog/src/assets/images" class="github-link" target="_blank" data-astro-cid-m2fjhme2>
🖼️ 上传图片
</a> </div> <div class="section" data-astro-cid-m2fjhme2> <h2 data-astro-cid-m2fjhme2>📚 常用文章模板</h2> <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 14px;" data-astro-cid-m2fjhme2>
--- title: "文章标题" excerpt: "文章摘要" category: "分类名称" tags: ["标签1", "标签2", "标签3"] image:
          "/images/文章图片.jpg" publishDate: "2024-01-01" author: "作者名称" --- # 文章标题 文章内容... ## 二级标题
          更多内容...
</div> </div> <div class="section" data-astro-cid-m2fjhme2> <h2 data-astro-cid-m2fjhme2>🔄 更新博客</h2> <p data-astro-cid-m2fjhme2>在GitHub中完成编辑后，博客会在几分钟内自动更新。如果需要立即更新，可以：</p> <ol data-astro-cid-m2fjhme2> <li data-astro-cid-m2fjhme2>访问 <a href="https://github.com/ericforai/zhitoujianli/actions" target="_blank" data-astro-cid-m2fjhme2>GitHub Actions</a></li> <li data-astro-cid-m2fjhme2>手动触发构建流程</li> <li data-astro-cid-m2fjhme2>等待构建完成</li> </ol> </div> </div> </body></html>`;
}, "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/github-admin.astro", void 0);

const $$file = "/root/zhitoujianli/blog/zhitoujianli-blog/src/pages/github-admin.astro";
const $$url = "/github-admin/";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$GithubAdmin,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
