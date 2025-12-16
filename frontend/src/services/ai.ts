/**
 * AI 服务代理（带 devMock 开关）
 * - /api/ai/generate
 * - /api/ai/diagnose
 */
import type { DiagnoseResponse, GenerateResponse, ResumeInput } from '../types/resume';
import config from '../config/environment';

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
    return await fetchJSON<GenerateResponse>(`${config.apiBaseUrl}/ai/generate`, {
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
    // 获取认证Token
    const getAuthToken = (): string | null => {
      try {
        return localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('AUTH_TOKEN');
      } catch {
        return null;
      }
    };

    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };

    // 如果有token，添加到请求头
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${config.apiBaseUrl}/ai/diagnose`, {
      method: 'POST',
      headers,
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
      // 调试：打印后端返回的数据结构
      console.log('后端返回的JSON结构:', Object.keys(j));
      console.log('是否包含新字段:', {
        hasOverview: !!j.overview,
        hasStructure: !!j.structure,
        hasContentQuality: !!j.contentQuality,
        hasCredibility: !!j.credibility,
        hasAtsCompatibility: !!j.atsCompatibility,
        hasImprovements: !!j.improvements,
        hasRewrite: !!j.rewrite,
        hasScorecard: !!j.scorecard
      });
      const tookMs = typeof payload.tookMs === 'number' ? payload.tookMs : undefined;
      const requestId = typeof payload.requestId === 'string' ? payload.requestId : undefined;
      const keywords: string[] = Array.isArray(j?.detections?.missingEvidenceForSkills)
        ? (j.detections.missingEvidenceForSkills as string[]).slice(0, 20)
        : [];
      const score = j.overallScore ?? 0;
      const md = (payload.markdown as string) || '';

      // 优先从新的 rewrite 字段提取重写内容
      let html = '';
      if (j.rewrite) {
        // rewrite 字段可能是字符串（HTML）或对象
        if (typeof j.rewrite === 'string') {
          html = j.rewrite;
        } else if (typeof j.rewrite === 'object') {
          // 如果是对象，尝试转换为HTML
          html = JSON.stringify(j.rewrite);
        }
      }

      // 如果没有新的rewrite字段，尝试从旧的rewritePack生成（向后兼容）
      if (!html) {
        const rewrite = j.rewritePack || {};
        if (rewrite && (rewrite.summary || rewrite.skills || rewrite.experienceBullets || rewrite.projectsBullets || rewrite.educationNote)) {
        const safe = (s: any) => {
          if (!s) return '';
          // 如果是对象，尝试提取文本内容
          if (typeof s === 'object' && s !== null) {
            if (s.text) return String(s.text).replace(/</g, '&lt;').replace(/>/g, '&gt;');
            if (s.description) return String(s.description).replace(/</g, '&lt;').replace(/>/g, '&gt;');
            if (Array.isArray(s.list)) return s.list.join('、').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            // 如果是空对象，返回空字符串
            if (Object.keys(s).length === 0) return '';
            // 尝试序列化对象（调试用）
            return JSON.stringify(s).replace(/</g, '&lt;').replace(/>/g, '&gt;');
          }
          return String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;');
        };
        const formatSkills = (skills: any): string => {
          if (!skills) return '';
          if (typeof skills === 'string') return skills;
          if (typeof skills === 'object') {
            // 如果是对象，尝试提取文本内容
            if (skills.text) return String(skills.text);
            if (skills.description) return String(skills.description);
            if (Array.isArray(skills.list)) return skills.list.join('、');
            // 如果是空对象，返回空字符串
            if (Object.keys(skills).length === 0) return '';
            // 尝试序列化对象
            return JSON.stringify(skills);
          }
          return '';
        };
        // 处理summary：可能是字符串或对象
        const summaryText = safe(rewrite.summary);
        const skillsText = formatSkills(rewrite.skills);
        const exp = Array.isArray(rewrite.experienceBullets) ? rewrite.experienceBullets : [];
        const proj = Array.isArray(rewrite.projectsBullets) ? rewrite.projectsBullets : [];
        const educationNote = String(rewrite.educationNote || '').trim();
        html = `
<section class="page">
  ${summaryText ? `<h1 style="font-size:22px;margin:0 0 12px 0;">修订版概要</h1>
  <div style="font-size:16px;line-height:1.6;margin-bottom:20px;">${summaryText}</div>` : ''}
  ${skillsText ? `<h2 style="margin-top:20px;font-size:18px;margin-bottom:8px;">技能</h2>
  <div style="font-size:15px;line-height:1.6;margin-bottom:20px;">${safe(skillsText)}</div>` : ''}
  ${exp.length ? `<h2 style="margin-top:20px;font-size:18px;margin-bottom:8px;">经历</h2>
  <ul style="margin-bottom:20px;">${exp.map((b: any) => {
    let bulletText = '';
    if (typeof b === 'string') {
      bulletText = b;
    } else if (b && typeof b === 'object') {
      if (Array.isArray(b.bullets)) {
        bulletText = b.bullets.join('；');
      } else if (b.text) {
        bulletText = b.text;
      } else {
        bulletText = JSON.stringify(b);
      }
    }
    return `<li style="margin-bottom:8px;line-height:1.6;">${safe(bulletText)}</li>`;
  }).join('')}</ul>` : ''}
  ${proj.length ? `<h2 style="margin-top:20px;font-size:18px;margin-bottom:8px;">项目</h2>
  <ul style="margin-bottom:20px;">${proj.map((b: any) => {
    let bulletText = '';
    if (typeof b === 'string') {
      bulletText = b;
    } else if (b && typeof b === 'object') {
      if (Array.isArray(b.bullets)) {
        bulletText = b.bullets.join('；');
      } else if (b.text) {
        bulletText = b.text;
      } else {
        bulletText = JSON.stringify(b);
      }
    }
    return `<li style="margin-bottom:8px;line-height:1.6;">${safe(bulletText)}</li>`;
  }).join('')}</ul>` : ''}
  ${educationNote ? `<h2 style="margin-top:20px;font-size:18px;margin-bottom:8px;">教育背景</h2>
  <div style="font-size:15px;line-height:1.6;">${safe(educationNote)}</div>` : ''}
</section>
        `;
        }
      }

      // 如果还是没有内容，使用Markdown作为fallback
      if (!html) {
        html = md ? `<pre>${md.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>` : '';
      }
      // 映射新的8个分析部分
      const sections: DiagnoseResponse['sections'] = [];

      // 1. 总体评价（overview）
      if (j.overview) {
        const overviewContent = typeof j.overview === 'string' ? j.overview : JSON.stringify(j.overview);
        sections.push({
          name: '总体评价',
          items: [],
          content: overviewContent
        });
      } else {
        sections.push({ name: '总体评价', items: [] });
      }

      // 2. 结构分析（structure）
      if (j.structure) {
        const structureContent = typeof j.structure === 'string' ? j.structure : JSON.stringify(j.structure);
        sections.push({
          name: '结构分析',
          items: [],
          content: structureContent
        });
      } else {
        sections.push({ name: '结构分析', items: [] });
      }

      // 3. 内容分析（contentQuality）
      if (j.contentQuality) {
        const contentQualityContent = typeof j.contentQuality === 'string' ? j.contentQuality : JSON.stringify(j.contentQuality);
        sections.push({
          name: '内容分析',
          items: [],
          content: contentQualityContent
        });
      } else {
        sections.push({ name: '内容分析', items: [] });
      }

      // 4. 专业度与可信度（credibility）
      if (j.credibility) {
        const credibilityContent = typeof j.credibility === 'string' ? j.credibility : JSON.stringify(j.credibility);
        sections.push({
          name: '专业度与可信度',
          items: [],
          content: credibilityContent
        });
      } else {
        sections.push({ name: '专业度与可信度', items: [] });
      }

      // 5. ATS技术分析（atsCompatibility）
      if (j.atsCompatibility) {
        const atsContent = typeof j.atsCompatibility === 'string' ? j.atsCompatibility : JSON.stringify(j.atsCompatibility);
        sections.push({
          name: 'ATS技术分析',
          items: [],
          content: atsContent
        });
      } else {
        sections.push({ name: 'ATS技术分析', items: [] });
      }

      // 6. 可提升点（improvements）
      if (Array.isArray(j.improvements) && j.improvements.length > 0) {
        const improvementItems = j.improvements.map((imp: any) => ({
          issue: typeof imp === 'string' ? imp : (imp?.issue || imp?.suggestion || JSON.stringify(imp)),
          fix: typeof imp === 'string' ? '' : (imp?.fix || imp?.rewriteExample || '')
        }));
        sections.push({
          name: '可提升点',
          items: improvementItems
        });
      } else if (j.improvements && typeof j.improvements === 'object') {
        sections.push({
          name: '可提升点',
          items: [],
          content: JSON.stringify(j.improvements)
        });
      } else {
        sections.push({ name: '可提升点', items: [] });
      }

      // 7. 重写关键段落（rewrite）- 这个会显示在修订版预览区域
      // 这里只添加一个占位section，实际内容在html字段中
      if (j.rewrite) {
        const rewriteContent = typeof j.rewrite === 'string' ? j.rewrite : JSON.stringify(j.rewrite);
        sections.push({
          name: '重写关键段落',
          items: [],
          content: rewriteContent
        });
      } else {
        sections.push({ name: '重写关键段落', items: [] });
      }

      // 8. 最终得分（scorecard）
      if (j.scorecard && typeof j.scorecard === 'object') {
        sections.push({
          name: '最终得分',
          items: [],
          content: j.scorecard
        });
      } else {
        sections.push({ name: '最终得分', items: [] });
      }

      // 计算综合分数：优先使用面试通过概率，如果没有则计算平均值
      let finalScore = score;
      if (j.scorecard && typeof j.scorecard === 'object') {
        const scorecard = j.scorecard as any;
        if (typeof scorecard['面试通过概率'] === 'number') {
          finalScore = Math.round(scorecard['面试通过概率'] * 10); // 0-10分转换为0-100分
        } else {
          // 计算5个维度的平均值
          const scores = [
            scorecard['信息清晰度'],
            scorecard['专业可信度'],
            scorecard['HR友好度'],
            scorecard['ATS友好度'],
            scorecard['面试通过概率']
          ].filter((s): s is number => typeof s === 'number');
          if (scores.length > 0) {
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            finalScore = Math.round(avg * 10); // 0-10分转换为0-100分
          }
        }
      }

      return {
        sections,
        rewritten: {},
        score: finalScore,
        keywords,
        html: html || '', // 重写关键段落内容
        tookMs,
        requestId
      } as DiagnoseResponse;
    }
    // 如果是401错误，提示用户登录
    if (res.status === 401) {
      throw new Error('需要登录后才能使用简历诊断功能，请先登录');
    }

    // 如果是504 Gateway Timeout，提示超时
    if (res.status === 504) {
      throw new Error('请求超时，AI诊断可能需要较长时间，请稍后重试或尝试上传较小的文件');
    }

    // 如果是502/503错误，提示服务不可用
    if (res.status === 502 || res.status === 503) {
      throw new Error('后端服务暂时不可用，请稍后重试');
    }

    // 非200时，尝试解析错误信息
    const errorText = await res.text();
    let errorMessage = `API错误 (${res.status})`;
    try {
      // 检查是否是HTML错误页面（如504 Gateway Timeout页面）
      if (errorText.includes('Gateway Time-out') || errorText.includes('504')) {
        throw new Error('请求超时，AI诊断可能需要较长时间，请稍后重试或尝试上传较小的文件');
      }
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch (parseError) {
      // 如果无法解析JSON，检查是否是HTML错误页面
      if (errorText.includes('Gateway Time-out') || errorText.includes('504')) {
        throw new Error('请求超时，AI诊断可能需要较长时间，请稍后重试或尝试上传较小的文件');
      }
      // 使用原始文本或状态码
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  } catch (err: unknown) {
    // 如果是我们主动抛出的错误，直接抛出
    if (err instanceof Error && err.message !== 'Failed to fetch') {
      throw err;
    }
    // 网络错误（Failed to fetch）或其他未预期的错误
    const networkError = err instanceof Error ? err : new Error('网络连接失败');
    if (networkError.message === 'Failed to fetch' || networkError.message.includes('fetch')) {
      throw new Error('无法连接到服务器，请检查网络连接或稍后重试');
    }
    throw networkError;
  }
}


