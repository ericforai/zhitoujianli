/**
 * AI 服务代理（带 devMock 开关）
 * - /api/ai/generate
 * - /api/ai/diagnose
 */
import type { DiagnoseResponse, GenerateResponse, ResumeInput } from '../types/resume';

const DEV_MOCK = String(process.env.REACT_APP_RESUME_DEV_MOCK || '').toLowerCase() === 'true';

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...init
  });
  if (!res.ok) {
    throw new Error(`API Error ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function generate(input: ResumeInput): Promise<GenerateResponse> {
  if (DEV_MOCK) {
    const data = await import('../assets/resume/demo-generate.json');
    return data.default as unknown as GenerateResponse;
  }
  try {
    return await fetchJSON<GenerateResponse>('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ input })
    });
  } catch {
    // 后端未就绪时降级到本地mock，避免“暂无预览”
    const data = await import('../assets/resume/demo-generate.json');
    return data.default as unknown as GenerateResponse;
  }
}

export async function diagnose(params: {
  text: string;
  jdText?: string;
  targetRole?: string;
  industry?: string;
}): Promise<DiagnoseResponse> {
  // 优先调用后端新的 /api/ai/diagnose（返回 { json, markdown }）
  try {
    const res = await fetch('/api/ai/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        text: params.text,
        locale: 'zh-CN',
        persona: '',
        maxPages: 1
      })
    });
    if (res.ok) {
      const apiJson: any = await res.json();
      const payload = apiJson?.data || {};
      // 后端返回的 json/markdown 暂不全部渲染到 DiagnoseResponse，先抽取关键字段用于组件
      const j = payload.json || {};
      const tookMs = typeof payload.tookMs === 'number' ? payload.tookMs : undefined;
      const requestId = typeof payload.requestId === 'string' ? payload.requestId : undefined;
      const keywords: string[] = Array.isArray(j?.detections?.missingEvidenceForSkills)
        ? (j.detections.missingEvidenceForSkills as string[]).slice(0, 20)
        : [];
      const score = j.overallScore ?? 0;
      const md = (payload.markdown as string) || '';
      // 优先从 rewritePack 生成结构化修订版HTML；若无则退回渲染 Markdown 为 <pre>
      const rewrite = j.rewritePack || {};
      let html = '';
      if (rewrite && (rewrite.summary || rewrite.experienceBullets || rewrite.projectsBullets)) {
        const safe = (s: any) => String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const exp = Array.isArray(rewrite.experienceBullets) ? rewrite.experienceBullets : [];
        const proj = Array.isArray(rewrite.projectsBullets) ? rewrite.projectsBullets : [];
        html = `
<section class="page">
  <h1 style="font-size:22px;margin:0 0 12px 0;">修订版概要</h1>
  <div style="font-size:16px;line-height:1.6;">${safe(rewrite.summary || '')}</div>
  ${exp.length ? `<h2 style="margin-top:20px;font-size:18px;">经历</h2>
  <ul>${exp.map((b: any) => `<li>${safe((b && b.bullets ? b.bullets.join('；') : b) || '')}</li>`).join('')}</ul>` : ''}
  ${proj.length ? `<h2 style="margin-top:16px;font-size:18px;">项目</h2>
  <ul>${proj.map((b: any) => `<li>${safe((b && b.bullets ? b.bullets.join('；') : b) || '')}</li>`).join('')}</ul>` : ''}
</section>
        `;
      } else {
        html = md ? `<pre>${md.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>` : '';
      }
      // 将 issues 分类映射到五个分区
      const issues: any[] = Array.isArray(j.issues) ? j.issues : [];
      const mapItems = (cat: string) =>
        issues
          .filter(it => String(it?.category || '').includes(cat))
          .map(it => ({
            issue: it?.suggestion || it?.issue || '',
            fix: it?.rewriteExample || it?.evidence || ''
          }));
      return {
        sections: [
          { name: '结构', items: [...mapItems('结构合规'), ...mapItems('一致性与可信度'), ...mapItems('ATS')] },
          { name: '关键词', items: [...mapItems('技能与证据匹配')] },
          { name: '量化', items: [...mapItems('量化与结果')] },
          { name: '措辞', items: [...mapItems('清晰可读')] },
          { name: '风险', items: [...mapItems('风险与合规')] }
        ],
        rewritten: {},
        score,
        keywords,
        html,
        tookMs,
        requestId
      } as DiagnoseResponse;
    }
    // 非200时走本地mock
    const fallback = await import('../assets/resume/demo-diagnose.json');
    return fallback.default as unknown as DiagnoseResponse;
  } catch {
    // 网络/解析异常走mock
    const fallback = await import('../assets/resume/demo-diagnose.json');
    return fallback.default as unknown as DiagnoseResponse;
  }
}


