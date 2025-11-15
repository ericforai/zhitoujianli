/**
 * 轻量状态存取（基于 localStorage 的最小实现）
 * 说明：避免侵入现有 Redux 配置，提供 get/set 接口跨页共享
 */
import type { ResumeInput } from '../types/resume';

type Slice = {
  persona?: ResumeInput['persona'];
  formData?: ResumeInput;
  latestHtml?: string;
  latestScore?: number;
  latestKeywords?: string[];
};

const STORAGE_KEY = 'resume_slice_state';

function read(): Slice {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Slice) : {};
  } catch {
    return {};
  }
}
function write(state: Slice) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function setPersona(persona: ResumeInput['persona']) {
  const s = read();
  s.persona = persona;
  write(s);
}
export function getPersona(): ResumeInput['persona'] | undefined {
  return read().persona;
}

export function setFormData(form: ResumeInput) {
  const s = read();
  s.formData = form;
  write(s);
}
export function getFormData(): ResumeInput | undefined {
  return read().formData;
}

export function setLatestResult(params: { html?: string; score?: number; keywords?: string[] }) {
  const s = read();
  s.latestHtml = params.html;
  s.latestScore = params.score;
  s.latestKeywords = params.keywords;
  write(s);
}
export function getLatestResult(): { html?: string; score?: number; keywords?: string[] } {
  const s = read();
  return { html: s.latestHtml, score: s.latestScore, keywords: s.latestKeywords };
}


