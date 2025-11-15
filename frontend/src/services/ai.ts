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
  return fetchJSON<GenerateResponse>('/api/ai/generate', {
    method: 'POST',
    body: JSON.stringify({ input })
  });
}

export async function diagnose(params: {
  text: string;
  jdText?: string;
  targetRole?: string;
  industry?: string;
}): Promise<DiagnoseResponse> {
  if (DEV_MOCK) {
    const data = await import('../assets/resume/demo-diagnose.json');
    return data.default as unknown as DiagnoseResponse;
  }
  return fetchJSON<DiagnoseResponse>('/api/ai/diagnose', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}


